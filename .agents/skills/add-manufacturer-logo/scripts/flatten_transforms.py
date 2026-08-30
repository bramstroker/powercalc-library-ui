"""
Bake a group `transform` chain into the path data underneath it.

    python3 .claude/skills/add-manufacturer-logo/scripts/flatten_transforms.py in.svg out.svg

Inkscape leaves artwork parked under nested translate/matrix groups, which the build's coordinate
rounding then damages: `matrix(0.78527577,...)` rounds to `matrix(.79,...)`, a 0.6% scale error
that the artwork's own 2300-unit offsets amplify. Rounding a coordinate is safe, rounding a scale
factor is not, so the transforms are resolved here and the paths ship in plain user units.

Handles M/L/H/V/C/S/Q/T/Z only — enough for these logos, and it asserts rather than guesses if it
meets an arc.
"""
import re
import sys

TOKEN = re.compile(r'[MmZzLlHhVvCcSsQqTtAa]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?')

# Argument count per command, and which of those args are (x, y) pairs.
ARITY = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6, 'S': 4, 'Q': 4, 'T': 2, 'Z': 0}

# Geometry that carries its coordinates in attributes rather than in `d`.
SHAPES = {'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'use', 'image', 'text'}


def parse_transform(text):
    """Compose an SVG transform list into a single (a, b, c, d, e, f) matrix."""
    matrix = (1, 0, 0, 1, 0, 0)
    for name, args in re.findall(r'(\w+)\s*\(([^)]*)\)', text or ''):
        v = [float(x) for x in re.findall(r'[-+]?[\d.]+(?:[eE][-+]?\d+)?', args)]
        if name == 'translate':
            m = (1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0)
        elif name == 'scale':
            m = (v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0)
        elif name == 'matrix':
            m = tuple(v)
        else:
            raise SystemExit(f'unsupported transform: {name}')
        matrix = multiply(matrix, m)
    return matrix


def multiply(m, n):
    a1, b1, c1, d1, e1, f1 = m
    a2, b2, c2, d2, e2, f2 = n
    return (a1 * a2 + c1 * b2, b1 * a2 + d1 * b2,
            a1 * c2 + c1 * d2, b1 * c2 + d1 * d2,
            a1 * e2 + c1 * f2 + e1, b1 * e2 + d1 * f2 + f1)


def apply(matrix, x, y):
    a, b, c, d, e, f = matrix
    return a * x + c * y + e, b * x + d * y + f


def transform_path(d, matrix):
    tokens = [t for t in TOKEN.findall(d) if t.strip()]
    out, i = [], 0
    cmd = None
    # Current point in the *source* coordinate system, needed to resolve relative commands and to
    # turn H/V into L — a matrix with any rotation would otherwise break them.
    cx = cy = 0.0
    start_x = start_y = 0.0
    while i < len(tokens):
        if tokens[i].isalpha():
            cmd = tokens[i]
            i += 1
        elif cmd in ('M', 'm'):
            cmd = 'L' if cmd == 'M' else 'l'  # repeated M coordinates are implicit lineto
        upper = cmd.upper()
        relative = cmd.islower()
        if upper == 'Z':
            out.append('Z')
            cx, cy = start_x, start_y
            continue
        if upper == 'A':
            raise SystemExit('arcs are not supported')
        n = ARITY[upper]
        args = [float(t) for t in tokens[i:i + n]]
        i += n

        # Normalise to absolute coordinate pairs in the source system.
        if upper == 'H':
            points = [(args[0] + (cx if relative else 0), cy)]
            upper = 'L'
        elif upper == 'V':
            points = [(cx, args[0] + (cy if relative else 0))]
            upper = 'L'
        else:
            points = [(args[k] + (cx if relative else 0), args[k + 1] + (cy if relative else 0))
                      for k in range(0, n, 2)]
        if upper == 'M':
            start_x, start_y = points[-1]
        cx, cy = points[-1]

        mapped = [apply(matrix, x, y) for x, y in points]
        numbers = ' '.join(f'{v:.6f}'.rstrip('0').rstrip('.') for point in mapped for v in point)
        out.append(f'{upper} {numbers}')
    return ' '.join(out)


def flatten(svg):
    """Walk the element tree, accumulating transforms, and rewrite every `d` in place."""
    stack = [(1, 0, 0, 1, 0, 0)]
    pieces, pos = [], 0
    for m in re.finditer(r'<(/?)([\w:.-]+)((?:"[^"]*"|[^>"])*?)(/?)>', svg):
        closing, tag, attrs, self_closing = m.groups()
        pieces.append(svg[pos:m.start()])
        pos = m.end()
        chunk = m.group(0)
        if closing:
            if tag != 'svg':
                stack.pop()
            pieces.append(chunk)
            continue

        transform = re.search(r'\stransform="([^"]*)"', attrs)
        matrix = stack[-1]
        if tag != 'svg' and transform:
            matrix = multiply(matrix, parse_transform(transform.group(1)))

        if tag == 'path':
            d = re.search(r'\sd="([^"]*)"', attrs)
            if d:
                chunk = chunk.replace(d.group(0), f' d="{transform_path(d.group(1), matrix)}"')
            chunk = re.sub(r'\stransform="[^"]*"', '', chunk)
        elif tag == 'g':
            chunk = re.sub(r'\stransform="[^"]*"', '', chunk)
        elif matrix != (1, 0, 0, 1, 0, 0) and tag in SHAPES:
            # Only `d` is rewritten, so a rect/polygon/circle under a transform would keep its
            # untransformed geometry and jump. Convert it to a path first, or bail out loudly
            # rather than silently shipping a broken logo.
            raise SystemExit(f'<{tag}> sits under a transform; convert it to a <path> first')

        if tag != 'svg' and not self_closing:
            stack.append(matrix)
        pieces.append(chunk)
    pieces.append(svg[pos:])
    return ''.join(pieces)


if __name__ == '__main__':
    source = open(sys.argv[1], encoding='utf-8').read()
    open(sys.argv[2], 'w', encoding='utf-8').write(flatten(source))

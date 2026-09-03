import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LibrarySearchField } from "./LibrarySearchField";

/**
 * Stands in for the URL round-trip. Writing search params is asynchronous, so the pushed value is
 * held until the test delivers it — the lag between push and echo is exactly what made keystrokes
 * disappear, so the test needs to control it rather than guess at timer ordering.
 */
const Harness = ({ onPush }: { onPush: (value: string) => void }) => {
  const [value, setValue] = useState("");
  const pending = useRef<string | null>(null);

  return (
    <>
      <LibrarySearchField
        value={value}
        onChange={(next) => {
          onPush(next);
          pending.current = next;
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (pending.current !== null) {
            setValue(pending.current);
            pending.current = null;
          }
        }}
      >
        deliver echo
      </button>
      {/* Stands in for "Clear all" or the back button changing the search from outside. */}
      <button
        type="button"
        onClick={() => {
          setValue("");
        }}
      >
        external reset
      </button>
    </>
  );
};

const input = () => screen.getByPlaceholderText("Search all profiles") as HTMLInputElement;

const type = (text: string) => {
  fireEvent.change(input(), { target: { value: text } });
};

const click = (name: string) => {
  act(() => {
    fireEvent.click(screen.getByText(name));
  });
};

const settle = (ms = 200) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};

describe("LibrarySearchField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("keeps characters typed while the previous value is still round-tripping", () => {
    const pushed: string[] = [];
    render(<Harness onPush={(value) => pushed.push(value)} />);

    type("hue");
    settle();
    expect(pushed).toEqual(["hue"]);

    // Typed before the "hue" echo lands.
    type("huex");
    click("deliver echo");

    expect(input().value).toBe("huex");

    settle();
    expect(pushed).toEqual(["hue", "huex"]);
    expect(input().value).toBe("huex");
  });

  it("debounces to a single push per burst of typing", () => {
    const pushed: string[] = [];
    render(<Harness onPush={(value) => pushed.push(value)} />);

    type("h");
    settle(100);
    type("hu");
    settle(100);
    type("hue");
    settle();

    expect(pushed).toEqual(["hue"]);
  });

  it("adopts a value changed from outside the field without pushing it back", () => {
    const pushed: string[] = [];
    render(<Harness onPush={(value) => pushed.push(value)} />);

    type("hue");
    settle();
    click("deliver echo");
    expect(input().value).toBe("hue");

    click("external reset");
    settle();

    expect(input().value).toBe("");
    expect(pushed).toEqual(["hue"]);
  });

  it("focuses the field when / is pressed", () => {
    render(<Harness onPush={() => undefined} />);

    expect(input()).not.toHaveFocus();

    act(() => {
      fireEvent.keyDown(document.body, { key: "/" });
    });

    expect(input()).toHaveFocus();
  });

  it("ignores / while another field has focus", () => {
    render(
      <>
        <Harness onPush={() => undefined} />
        <input aria-label="other field" />
      </>,
    );

    const other = screen.getByLabelText("other field");
    other.focus();

    act(() => {
      fireEvent.keyDown(other, { key: "/" });
    });

    expect(other).toHaveFocus();
    expect(input()).not.toHaveFocus();
  });

  it("ignores / when it is part of a browser shortcut", () => {
    render(<Harness onPush={() => undefined} />);

    act(() => {
      fireEvent.keyDown(document.body, { key: "/", metaKey: true });
    });

    expect(input()).not.toHaveFocus();
  });

  it("clears the draft and pushes the empty value from the clear button", () => {
    const pushed: string[] = [];
    render(<Harness onPush={(value) => pushed.push(value)} />);

    type("hue");
    settle();
    click("deliver echo");

    act(() => {
      fireEvent.click(screen.getByLabelText("Clear search"));
    });
    settle();

    expect(input().value).toBe("");
    expect(pushed).toEqual(["hue", ""]);
  });
});

import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputAdornment, TextField, alpha } from "@mui/material";
import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 200;

const FOCUS_SHORTCUT = "/";

/** True when the key would land in a field the user is already typing into. */
const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
};

export type LibrarySearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Keeps typing snappy by holding a local draft and pushing to the URL on a short debounce. */
export const LibrarySearchField = ({ value, onChange }: LibrarySearchFieldProps) => {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // "/" jumps to the search box from anywhere on the page, unless the key is already going into
  // another field — the facet search boxes, say — or is part of a browser shortcut.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== FOCUS_SHORTCUT || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // The last value this field and the URL agreed on. Writing to the URL is asynchronous, so its
  // echo can arrive after further keystrokes; without this the echo would overwrite the draft and
  // swallow whatever was typed in between.
  const syncedRef = useRef(value);

  useEffect(() => {
    if (value === syncedRef.current) {
      return;
    }
    // Changed elsewhere — a filter chip, "Clear all", the back button — so adopt it.
    syncedRef.current = value;
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === syncedRef.current) {
      return;
    }
    const timeout = setTimeout(() => {
      syncedRef.current = draft;
      onChangeRef.current(draft);
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [draft]);

  return (
    <TextField
      size="small"
      fullWidth
      placeholder="Search all profiles"
      value={draft}
      inputRef={inputRef}
      onChange={(event) => {
        setDraft(event.target.value);
      }}
      onFocus={() => {
        setFocused(true);
      }}
      onBlur={() => {
        setFocused(false);
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "inherit" }} />
            </InputAdornment>
          ),
          endAdornment: draft ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Clear search"
                color="inherit"
                onClick={() => {
                  setDraft("");
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : (
            // Advertises the shortcut while the field is idle. Hidden once it is in use, so it
            // never sits next to what is being typed.
            !focused && (
              <InputAdornment position="end">
                <Box
                  component="kbd"
                  aria-hidden
                  sx={{
                    px: 0.75,
                    borderRadius: 0.75,
                    border: 1,
                    borderColor: "currentColor",
                    opacity: 0.6,
                    fontSize: "0.75rem",
                    lineHeight: 1.6,
                    fontFamily: "monospace",
                  }}
                >
                  {FOCUS_SHORTCUT}
                </Box>
              </InputAdornment>
            )
          ),
        },
      }}
      sx={{
        // InputAdornment forces `action.active` on its children, so the icons need this to pick up
        // the AppBar's text colour rather than staying near-black.
        "& .MuiInputAdornment-root": { color: "inherit" },
        "& .MuiOutlinedInput-root": {
          color: "inherit",
          backgroundColor: (theme) => alpha(theme.palette.common.white, 0.15),
          "&:hover": {
            backgroundColor: (theme) => alpha(theme.palette.common.white, 0.25),
          },
          "& fieldset": { borderColor: "transparent" },
          "&:hover fieldset": { borderColor: "transparent" },
          "&.Mui-focused fieldset": { borderColor: "currentColor" },
        },
        "& .MuiInputBase-input::placeholder": { opacity: 0.8 },
      }}
    />
  );
};

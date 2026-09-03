import { GridPreferencePanelsValue, useGridApiRef } from "@mui/x-data-grid";
import { useEffect, type RefObject } from "react";

import type { PowerProfile } from "../../../types/PowerProfile";

import { LibraryDataGrid } from "./LibraryDataGrid";

type Props = {
  rows: PowerProfile[];
  /**
   * Filled in with the grid's column-panel opener. The button lives in the shared toolbar above,
   * which must not import `@mui/x-data-grid` itself — that would put the grid back into the phone
   * bundle this component exists to keep it out of.
   */
  showColumnsRef: RefObject<(() => void) | null>;
};

/** Keeps every DataGrid import out of the prerendered document and the phone bundle. */
export const DesktopLibraryDataGrid = ({ rows, showColumnsRef }: Props) => {
  const apiRef = useGridApiRef();

  useEffect(() => {
    showColumnsRef.current = () => {
      apiRef.current?.showPreferences(GridPreferencePanelsValue.columns);
    };
    return () => {
      showColumnsRef.current = null;
    };
  }, [apiRef, showColumnsRef]);

  return <LibraryDataGrid rows={rows} apiRef={apiRef} />;
};

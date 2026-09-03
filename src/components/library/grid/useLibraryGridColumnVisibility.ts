import type { GridColumnVisibilityModel } from "@mui/x-data-grid";
import { useCallback, useState } from "react";

import { LIBRARY_DATA_GRID_COLUMNS } from "./libraryDataGridColumns";

const COLUMN_VISIBILITY_STORAGE_KEY = "libraryGridColumnVisibility";

export const DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY: GridColumnVisibilityModel = {
  authors: false,
  colorModes: false,
  measureDevice: false,
  measureMethod: false,
  maxPower: false,
  standbyPower: false,
  standbyPowerOn: false,
  calculationStrategy: false,
  subProfileCount: false,
  updatedAt: false,
  createdAt: false,
  installationCount: false,
  lutQualityScore: false,
};

const knownFields = new Set(LIBRARY_DATA_GRID_COLUMNS.map((column) => column.field));

export const parseStoredColumnVisibility = (stored: string | null): GridColumnVisibilityModel => {
  if (!stored) {
    return DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY;
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY;
    }

    const knownBooleanEntries = Object.entries(parsed).filter(
      ([field, visible]) => knownFields.has(field) && typeof visible === "boolean",
    );
    return {
      ...DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY,
      ...Object.fromEntries(knownBooleanEntries),
    };
  } catch {
    return DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY;
  }
};

const readStoredColumnVisibility = (): GridColumnVisibilityModel => {
  try {
    return parseStoredColumnVisibility(sessionStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY));
  } catch {
    return DEFAULT_LIBRARY_GRID_COLUMN_VISIBILITY;
  }
};

export const useLibraryGridColumnVisibility = () => {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    readStoredColumnVisibility,
  );

  const handleColumnVisibilityChange = useCallback((model: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(model);
    try {
      sessionStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(model));
    } catch {
      // A blocked or full storage area should not make the column picker unusable.
    }
  }, []);

  return { columnVisibilityModel, handleColumnVisibilityChange };
};

import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { LibraryJson } from "../api/library.api";
import { fetchLibrary } from "../api/library.api";
import type { Author, Manufacturer, PowerProfile } from "../types/PowerProfile";
import { mapToBasePowerProfile } from "../utils/profileMappers";

interface LibraryContextType {
  powerProfiles: PowerProfile[];
  total: number;
  authors: Record<string, Author>;
  manufacturers: Record<string, Manufacturer>;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useSuspenseQuery<LibraryJson>({
    queryKey: ["library"],
    queryFn: fetchLibrary,
  });

  const value = useMemo<LibraryContextType>(() => {
    const powerProfiles: PowerProfile[] = [];
    const authors: Record<string, Author> = {};
    const manufacturers: Record<string, Manufacturer> = {};

    for (const manufacturerData of data.manufacturers ?? []) {
      const manufacturer = {
        fullName: manufacturerData.full_name,
        dirName: manufacturerData.dir_name
      };
      manufacturers[manufacturerData.dir_name] = manufacturer;

      for (const modelData of manufacturerData.models ?? []) {
        const profile = mapToBasePowerProfile(modelData, manufacturer);
        powerProfiles.push(profile);

        const { author } = profile;
        const key = author.githubUsername;
        if (key && !authors[key]) authors[key] = author;
      }
    }

    return {
      powerProfiles,
      total: powerProfiles.length,
      authors,
      manufacturers,
    };
  }, [data]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = (): LibraryContextType => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within a LibraryProvider");
  return ctx;
}

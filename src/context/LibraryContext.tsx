import { useSuspenseQuery} from "@tanstack/react-query";
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import type { LibraryJson, LibraryModel} from "../api/library.api";
import {fetchLibrary} from "../api/library.api";
import type { PowerProfile } from '../types/PowerProfile';
import { mapToBasePowerProfile } from '../utils/profileMappers';

interface LibraryContextType {
  powerProfiles: PowerProfile[];
  total: number;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

interface LibraryProviderProps {
  children: ReactNode;
}

export const LibraryProvider = ({ children }: LibraryProviderProps) => {
  const { data } = useSuspenseQuery<LibraryJson>({
    queryKey: ["library"],
    queryFn: fetchLibrary,
  });

  const profiles: PowerProfile[] =
      (data?.manufacturers ?? []).flatMap(
          (manufacturer: { models: LibraryModel[]; full_name: string; dir_name: string }) =>
              manufacturer.models.map((model) => 
                mapToBasePowerProfile(
                  model, 
                  { fullName: manufacturer.full_name, dirName: manufacturer.dir_name }
                )
              )
      );

  return (
      <LibraryContext.Provider
          value={{
            powerProfiles: profiles,
            total: profiles.length,
          }}
      >
        {children}
      </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from "@tanstack/react-query";

import { PowerProfile } from '../types/PowerProfile';
import { fetchLibrary } from "../api/library.api";

interface LibraryContextType {
  powerProfiles: PowerProfile[];
  loading: boolean;
  error: string | null;
  total: number;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

interface LibraryProviderProps {
  children: ReactNode;
}

export const LibraryProvider: React.FC<LibraryProviderProps> = ({ children }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["library"],
    queryFn: fetchLibrary,
  });

  const profiles: PowerProfile[] =
      (data?.manufacturers ?? []).flatMap(
          (manufacturer: { models: any[]; full_name: string; dir_name: string }) =>
              manufacturer.models.map((model) => ({
                manufacturer: { fullName: manufacturer.full_name, dirName: manufacturer.dir_name },
                modelId: model.id,
                name: model.name,
                aliases: model.aliases?.join("|"),
                author: model.author,
                deviceType: model.device_type,
                colorModes: model.color_modes || [],
                updatedAt: model.updated_at,
                createdAt: model.created_at,
                description: model.description,
                measureDevice: model.measure_device,
                measureMethod: model.measure_method,
                measureDescription: model.measure_description,
                calculationStrategy: model.calculation_strategy,
                maxPower: model.max_power,
                standbyPower: model.standby_power,
                standbyPowerOn: model.standby_power_on,
              }))
      );

  return (
      <LibraryContext.Provider
          value={{
            powerProfiles: profiles,
            loading: isLoading,
            error: error ? "Failed to fetch library data" : null,
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

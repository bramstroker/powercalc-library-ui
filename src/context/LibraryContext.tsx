import { useSuspenseQuery} from "@tanstack/react-query";
import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

import type { LibraryJson, LibraryModel} from "../api/library.api";
import {fetchLibrary} from "../api/library.api";
import type { ColorMode } from '../types/ColorMode';
import type { DeviceType } from '../types/DeviceType';
import type { PowerProfile } from '../types/PowerProfile';

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
              manufacturer.models.map((model) => ({
                manufacturer: { fullName: manufacturer.full_name, dirName: manufacturer.dir_name },
                modelId: model.id,
                name: model.name,
                aliases: model.aliases?.join("|") || "",
                author: model.author,
                deviceType: model.device_type as DeviceType,
                colorModes: (model.color_modes || []) as ColorMode[],
                updatedAt: new Date(model.updated_at),
                createdAt: new Date(model.created_at),
                description: model.description,
                measureDevice: model.measure_device,
                measureMethod: model.measure_method,
                measureDescription: model.measure_description,
                calculationStrategy: model.calculation_strategy,
                maxPower: model.max_power,
                standbyPower: model.standby_power,
                standbyPowerOn: model.standby_power_on,
                subProfileCount: model.sub_profile_count,
              }))
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

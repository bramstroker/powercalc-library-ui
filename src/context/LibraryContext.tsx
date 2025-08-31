import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PowerProfile } from '../types/PowerProfile';
import { API_ENDPOINTS } from '../config/api';

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
  const [powerProfiles, setPowerProfiles] = useState<PowerProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching library data - this should only happen once');
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.LIBRARY);
        if (response.status !== 200) {
          throw new Error("Unexpected status code from library API");
        }
        const json = await response.json();

        const profiles: PowerProfile[] = [];

        json.manufacturers.forEach(
          (manufacturer: { models: any[]; full_name: string, dir_name: string }) => {
            manufacturer.models.forEach((model) => {
              profiles.push({
                manufacturer: {
                  fullName: manufacturer.full_name,
                  dirName: manufacturer.dir_name
                },
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
                standbyPower: model.standby_power,
                standbyPowerOn: model.standby_power_on,
              });
            });
          },
        );

        setPowerProfiles(profiles);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch library data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <LibraryContext.Provider value={{ 
      powerProfiles, 
      loading, 
      error, 
      total: powerProfiles.length 
    }}>
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

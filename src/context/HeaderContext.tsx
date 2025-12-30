import { createContext, useContext, useState } from "react";
import {MRT_TableInstance} from "material-react-table";
import {PowerProfile} from "../types/PowerProfile";

type HeaderConfig = {
  variant?: "default" | "library";
  libraryGrid?: MRT_TableInstance<PowerProfile>;
};

const HeaderContext = createContext<{
  config: HeaderConfig;
  setConfig: (c: HeaderConfig) => void;
} | null>(null);

export const useHeader = () => {
  const ctx = useContext(HeaderContext);
  if (!ctx) throw new Error("useHeader must be used inside HeaderProvider");
  return ctx;
};

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<HeaderConfig>({});
  return (
      <HeaderContext.Provider value={{ config, setConfig }}>
        {children}
      </HeaderContext.Provider>
  );
}
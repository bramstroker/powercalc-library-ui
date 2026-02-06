import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type {LibraryData} from "../queries/library.query";
import { libraryQuery} from "../queries/library.query";

const LibraryContext = createContext<LibraryData | null>(null);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useSuspenseQuery(libraryQuery());
  return <LibraryContext.Provider value={data}>{children}</LibraryContext.Provider>;
};

export const useLibrary = (): LibraryData => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within a LibraryProvider");
  return ctx;
};
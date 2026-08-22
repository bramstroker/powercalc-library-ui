import { useSuspenseQuery } from "@tanstack/react-query";

import { libraryQuery } from "../queries/library.query";

// Keep this expensive query local to the routes that actually consume the library. A provider at
// the application root made every profile detail request download the complete library first.
export const useLibrary = () => useSuspenseQuery(libraryQuery()).data;

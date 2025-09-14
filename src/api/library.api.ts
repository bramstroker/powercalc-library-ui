import { API_ENDPOINTS } from "../config/api";

export type LibraryJson = {
  manufacturers: Array<{
    full_name: string;
    dir_name: string;
    models: Array<any>;
  }>;
};

export const fetchLibrary = async (): Promise<LibraryJson> => {
  const res = await fetch(API_ENDPOINTS.LIBRARY);
  if (!res.ok) throw new Error("Failed to fetch library");
  return res.json();
};
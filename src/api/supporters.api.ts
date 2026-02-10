import { API_ENDPOINTS } from "../config/api";

export interface Supporter {
  name: string;
  tier: string;
  since: string; // ISO date string
}

// Mock data for supporters
const MOCK_SUPPORTERS: Supporter[] = [
  { name: "John Doe", tier: "Gold", since: "2023-01-15" },
  { name: "Jane Smith", tier: "Silver", since: "2023-03-22" },
  { name: "Robert Johnson", tier: "Gold", since: "2022-11-05" },
  { name: "Emily Davis", tier: "Platinum", since: "2023-05-10" },
  { name: "Michael Brown", tier: "Silver", since: "2023-02-18" },
  { name: "Sarah Wilson", tier: "Gold", since: "2023-04-30" },
  { name: "David Miller", tier: "Platinum", since: "2022-12-12" },
  { name: "Jennifer Taylor", tier: "Silver", since: "2023-06-08" },
];

/**
 * Fetch all supporters
 * Note: This is currently using mock data, but could be updated to use a real API endpoint
 */
export const fetchSupporters = async (): Promise<Supporter[]> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data
  return MOCK_SUPPORTERS;
};
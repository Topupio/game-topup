export interface Region {
  key: string;
  label: string;
  currency: string;
  symbol: string;
}

export const REGIONS: Region[] = [
  { key: "global", label: "Global", currency: "USD", symbol: "$" },
  { key: "india", label: "India", currency: "INR", symbol: "₹" },
  { key: "usa", label: "USA", currency: "USD", symbol: "$" },
  { key: "philippines", label: "Philippines", currency: "PHP", symbol: "₱" },
  { key: "brazil", label: "Brazil", currency: "BRL", symbol: "R$" },
  { key: "indonesia", label: "Indonesia", currency: "IDR", symbol: "Rp" },
];

export const REGION_KEYS = REGIONS.map((r) => r.key);

export const getRegionByKey = (key: string): Region | undefined =>
  REGIONS.find((r) => r.key === key);

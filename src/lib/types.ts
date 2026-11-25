export type Item = {
  id: string;
  title: string;
  category: string;
  description: string;
  report_type: "lost" | "found";
  location: string;
  item_date: string;
  image_url: string | null;
  status: string;
};

export const CATEGORIES = ["Electronics", "Wallets & IDs", "Keys", "Bags & Books", "Accessories"];
export const ICONS: Record<string, string> = {
  "Electronics": "🎧", "Wallets & IDs": "👛", "Keys": "🔑", "Bags & Books": "🎒", "Accessories": "⌚",
};

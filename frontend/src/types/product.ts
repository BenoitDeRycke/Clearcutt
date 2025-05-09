export type Product = {
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_title: string;
  cost_price: number;
  status: string;
  units_sold?: number;
  revenue?: number;
  product_cost?: number;
  shipping?: number;
  ad?: number;
  other?: number;
  };
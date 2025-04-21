//orders.tsx
export const numFormatter = (value: number): string => {
  return parseFloat(value.toString()).toFixed(2);
};

export const currencyFormatter = ( currency: string, value: number): string => {
  const result = currency + numFormatter(value)
  return result;
};

export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

import { Order } from "@/types/order";
export function calculateTotals(orders: Order[]) {
  const totalRevenue = orders.reduce((sum, o) => sum + o.revenue, 0);
  const product_cost = orders.reduce((sum, o) => sum + o.product_cost, 0);
  const shipping = orders.reduce((sum, o) => sum + o.shipping, 0);
  const vat = orders.reduce((sum, o) => sum + o.vat, 0);
  const other = orders.reduce((sum, o) => sum + o.other, 0);
  const payment = orders.reduce((sum, o) => sum + o.payment, 0);
  const total_cost = orders.reduce((sum, o) => sum + o.total_cost, 0);
  const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);

  const averageMargin =
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    revenue: totalRevenue,
    product_cost,
    shipping,
    vat,
    other,
    payment,
    total_cost,
    profit: totalProfit,
    margin: averageMargin,
  };
}
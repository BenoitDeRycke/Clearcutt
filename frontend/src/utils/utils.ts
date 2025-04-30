//orders.tsx
export const numFormatter = (value: number): string => {
  const rounded = Number(Math.round(Number(value + 'e2')) + 'e-2');
  return rounded.toFixed(2);
};

export const currencyFormatter = (currency: string, value: number): string => {
  if (Math.abs(value) < 0.005) {
    return '-';
  }
  const rounded = Number(Math.round(Number(value + 'e2')) + 'e-2');
  return currency + rounded.toFixed(2);
};

export const isZero = (value: number, tolerance = 0.005): boolean => {
  return Math.abs(value) < tolerance;
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

export function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}
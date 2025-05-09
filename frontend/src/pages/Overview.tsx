import MetricCard from '@/components/MetricCard';
import LineChart from '@/components/Charts/LineChart';
import SyncButton from '@/components/SyncButton';
import { useSync } from '@/hooks/useSync';
import { useEffect, useState } from 'react';
import { Order } from '@/types/order';

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

type LineChartEntry = {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
};

const topCustomers = [
  { name: 'Robert Lewis', orders: 21, revenue: 4100 },
  { name: 'Tom Barnes', orders: 19, revenue: 3550 },
  { name: 'Jenson Doyle', orders: 17, revenue: 3120 },
  { name: 'Donald Cortez', orders: 15, revenue: 2840 },
  { name: 'Emily Rhodes', orders: 13, revenue: 2500 },
];

const productRevenueMap: Record<string, number> = {};
const countryRevenueMap: Record<string, number> = {};

const topProducts = Object.entries(productRevenueMap)
  .map(([name, revenue]) => ({ name, revenue }))
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);

const topCountries = Object.entries(countryRevenueMap)
  .map(([name, revenue]) => ({ name, revenue }))
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);

const lineConfigs = [
  { dataKey: 'revenue', name: 'Revenue', color: '#008000' },
  { dataKey: 'cost', name: 'Cost', color: '#FF0000' },
  { dataKey: 'profit', name: 'Profit', color: '#6A6EFE' },
];

function Overview() {
  //const { start, end } = getCurrentMonthRange();
  const start = new Date('2025-04-01').toISOString();
  const end = new Date('2025-04-30T23:59:59').toISOString();
  const {
    lastSynced,
    handleSync,
    loading: syncing,
  } = useSync(async () => {
    return;
  }, 'overview');

  const [lineChartData, setLineChartData] = useState<LineChartEntry[]>([]);
  const [topOrders, setTopOrders] = useState<Order[]>([]);
  const [topCountries, setTopCountries] = useState<{ name: string; revenue: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; revenue: number }[]>([]);

  const fetchLineChartData = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const res = await fetch(
      `http://localhost:3001/api/supabase/getallorders?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`
    );

    const { orders } = await res.json();
    console.log('Fetched orders:', orders);

    if (orders) {
      const dailyData = new Map<string, { revenue: number; cost: number; profit: number }>();

      // Aggregate orders by day
      orders.forEach((order: any) => {
        const orderDate = new Date(order.date);
        const dateStr = orderDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        if (!dailyData.has(dateStr)) {
          dailyData.set(dateStr, { revenue: 0, cost: 0, profit: 0 });
        }

        const existing = dailyData.get(dateStr)!;
        existing.revenue += order.revenue;
        existing.cost += order.total_cost;
        existing.profit += order.profit;
      });

      // Now build the full month
      const fullMonthData: { date: string; revenue: number; cost: number; profit: number }[] = [];
      const today = new Date();
      const realEnd = today < endOfMonth ? today : endOfMonth;

      const current = new Date(startOfMonth);

      while (current <= realEnd) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');

        const dateStr = `${year}-${month}-${day}`;

        fullMonthData.push({
          date: dateStr,
          revenue: dailyData.get(dateStr)?.revenue || 0,
          cost: dailyData.get(dateStr)?.cost || 0,
          profit: dailyData.get(dateStr)?.profit || 0,
        });

        current.setDate(current.getDate() + 1);
      }
      setLineChartData(fullMonthData);
    }
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState({
    revenue: 0,
    cost: 0,
    profit: 0,
  });
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(
          `http://localhost:3001/api/supabase/getallorders?start=${start}&end=${end}`
        );
        const data = await res.json();
        const realOrders = data.orders || [];

        setOrders(realOrders);

        const { revenue, cost, profit } = calculateMetrics(realOrders);
        setMetrics({ revenue, cost, profit });

        const sortedTopOrders = [...realOrders].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        setTopOrders(sortedTopOrders);

        const countryMap: Record<string, number> = {};

        realOrders.forEach((order: Order) => {
          const country = order.country_code;
          countryMap[country] = (countryMap[country] || 0) + order.revenue;
        });

        const sortedTopCountries = Object.entries(countryMap)
          .map(([code, revenue]) => ({ name: code, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopCountries(sortedTopCountries);

        const productMap: Record<string, number> = {};

        //realOrders.forEach((order: Order) => {
        //const product = order.product_name || 'Unknown';
        //productMap[product] = (productMap[product] || 0) + order.revenue;
        //});

        const sortedTopProducts = Object.entries(productMap)
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopProducts(sortedTopProducts);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    }

    fetchOrders();
  }, []);

  useEffect(() => {
    fetchLineChartData();
  }, []);
  return (
    <div>
      <SyncButton title="Overview" onClick={handleSync} lastSynced={lastSynced} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pr-0 lg:pr-2">
            <MetricCard title="Total Revenue" value={`€${metrics.revenue.toFixed(2)}`} change="1" />
            <MetricCard title="Total Cost" value={`€${metrics.cost.toFixed(2)}`} change="2" />
            <MetricCard title="Total Profit" value={`€${metrics.profit.toFixed(2)}`} change="3" />
          </div>
          <LineChart title="Revenue Overview" data={lineChartData} lines={lineConfigs} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-3.5">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="space-y-3">
                <h2 className="text-[20px] font-semibold border-b border-gray-200 leading-none pb-2">
                  Orders
                </h2>
                <ul className="space-y-3">
                  {topOrders.map((order, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm">
                      <span>{order.id}</span>
                      <span>€{order.revenue.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="space-y-3">
                <h2 className="text-[20px] font-semibold border-b border-gray-200 leading-none pb-2">
                  Transactions
                </h2>
                <ul className="space-y-3"></ul>
              </div>
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4"></div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[300px] space-y-8">
          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-8">
            <div className="space-y-3">
              <h2 className="text-[20px] font-semibold border-b border-gray-200 leading-none pb-2">
                Countries
              </h2>
              <ul className="space-y-3">
                {topCountries.map((country, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span>{country.name}</span>
                    <span>€{country.revenue.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-[20px] font-semibold border-b border-gray-200 leading-none pb-2">
                Top Products
              </h2>
              <ul className="space-y-3">
                {topProducts.map((product, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span>{product.name}</span>
                    <span className="font-medium">€{product.revenue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-[20px] font-semibold border-b border-gray-200 leading-none pb-2">
                Top Customers
              </h2>
              <ul className="space-y-3">
                {topCustomers.map((customer, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      <span className="text-gray-400 text-xs">{customer.orders} orders</span>
                    </div>
                    <span className="font-medium">€{customer.revenue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateMetrics(orders: Order[]) {
  const revenue = orders.reduce((sum, order) => sum + order.revenue, 0);
  const cost = orders.reduce((sum, order) => sum + order.total_cost, 0);
  const profit = revenue - cost;

  return { revenue, cost, profit };
}

export default Overview;

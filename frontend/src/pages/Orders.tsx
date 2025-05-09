import { useState, useEffect } from 'react';
import TableCell from '@/components/TableCell';
import TableHeading from '@/components/TableHeading';
import SyncButton from '@/components/SyncButton';
import { formatDate, isZero, numFormatter } from '../utils/utils';
import { getMarginColor } from '../utils/style.utils';
import type { Order } from '@/types/order';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { useSync } from '@/hooks/useSync';

const disputeOrders = new Set([
  '#2092',
  '#2033',
  '#2016',
  '#2014',
  '#2005',
  '#1999',
  '#1969',
  '#1967',
  '#1915',
  '#1911',
  '#1882',
  '#1881',
  '#1868',
  '#1863',
  '#1834',
  '#1806',
  '#1756',
  '#1696',
  '#1636',
]);

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 1000; // pull all so we can filter in memory
  const totalPages = 1;

  const {
    lastSynced,
    handleSync,
    loading: syncing,
  } = useSync(async () => {
    const toastId = toast.loading('Syncing orders...');
    const res = await fetch('https://clearcutt.onrender.com/api/sync/sync-orders');
    if (!res.ok) throw new Error('Sync failed');
    const data = await res.json();
    toast.success(`Sync complete! ${data.count} orders updated.`, { id: toastId });
    await fetchOrders();
  }, 'orders');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://clearcutt.onrender.com/api/supabase/getorders?page=1&limit=${limit}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.orders)) throw new Error('Invalid data received');
      setOrders(data.orders.filter((o: Order) => disputeOrders.has(o.id)));
      setTotalOrders(data.orders.length);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      toast.error('❌ Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <SyncButton title="Orders" onClick={handleSync} lastSynced={lastSynced} />

      <table className="bg-white w-full border text-sm text-center relative rounded-xl">
        {(loading || syncing) && (
          <tbody>
            <tr>
              <td colSpan={12}>
                <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              </td>
            </tr>
          </tbody>
        )}
        <thead className="font-bold text-black bg-clearcut-light">
          <tr>
            <TableHeading>Id</TableHeading>
            <TableHeading>Date</TableHeading>
            <TableHeading>Country</TableHeading>
            <TableHeading>Revenue</TableHeading>
            <TableHeading>Product</TableHeading>
            <TableHeading>Shipping</TableHeading>
            <TableHeading>Ad</TableHeading>
            <TableHeading>VAT</TableHeading>
            <TableHeading>Other</TableHeading>
            <TableHeading>Payment</TableHeading>
            <TableHeading>Total Cost</TableHeading>
            <TableHeading>Profit</TableHeading>
            <TableHeading>
              <div className="flex justify-end items-center gap-1">
                <span className="text-right">Margin</span>
                <div className="relative group">
                  <Info className="w-4 h-4 text-gray-500 hover:text-clearcut-dark cursor-pointer" />
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs rounded-md bg-white border px-3 py-2 text-xs text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 pointer-events-none">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-600 rounded-sm" />
                      <span>&lt; 30%</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-sm" />
                      <span>&lt; 50%</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-emerald-600 rounded-sm" />
                      <span>&lt; 70%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-clearcut rounded-sm" />
                      <span>&gt; 70%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TableHeading>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <tr
              key={i}
              className={`border-t ${order.profit === 0 ? 'bg-gray-100 text-gray-400 opacity-60' : ''}`}
            >
              <TableCell>{order.id}</TableCell>
              <TableCell>{formatDate(order.date)}</TableCell>
              <TableCell>{order.country_code}</TableCell>
              <TableCell>{order.revenue}</TableCell>
              <TableCell>{order.product_cost}</TableCell>
              <TableCell>{order.shipping}</TableCell>
              <TableCell>{0}</TableCell>
              <TableCell>{order.vat}</TableCell>
              <TableCell>{order.other}</TableCell>
              <TableCell>{order.payment}</TableCell>
              <TableCell>{order.total_cost}</TableCell>
              <TableCell>{order.profit}</TableCell>
              <TableCell>
                {isNaN(order.margin) || isZero(order.margin) ? (
                  <span className="text-gray-400">-</span>
                ) : (
                  <span className={getMarginColor(order.margin)}>
                    {numFormatter(order.margin) + '%'}
                  </span>
                )}
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Orders;

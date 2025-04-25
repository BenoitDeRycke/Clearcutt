import { useState, useEffect } from 'react';
import TableCell from '@/components/Orders/TableCell';
import TableHeading from '@/components/Orders/TableHeading';
import SyncButton from '@/components/Orders/SyncButton';
import { currencyFormatter, formatDate, numFormatter } from '../../utils/utils';
import { getMarginColor } from '../../utils/style.utils';
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

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;
  const totalPages = Math.ceil(totalOrders / limit);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/supabase/getorders?page=${page}&limit=${limit}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.orders)) throw new Error('Invalid data received');
      setOrders(data.orders);
      setTotalOrders(data.total);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      toast.error('❌ Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      const data = await toast.promise(
        fetch('http://localhost:3001/api/sync/sync-orders').then((res) => {
          if (!res.ok) throw new Error('Sync failed');
          return res.json();
        }),
        {
          loading: '🔄 Syncing orders...',
          success: (data) => `Sync complete! ${data.count} orders updated.`,
          error: 'Sync failed. Please try again.',
        }
      );

      setLastSynced(new Date());
      await fetchOrders();
    } catch (err) {
      console.error('Sync error:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center mb-2.5">
          <h1 className="text-xl font-bold mr-2.5">Orders</h1>
          <SyncButton onClick={handleSync} />
        </div>
        <span className="text-gray-500">
          Last synced: {lastSynced ? lastSynced.toLocaleTimeString() : 'Not yet'}
        </span>
      </div>

      <table className="w-full border text-sm text-center relative">
        {loading && (
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
        <thead className="font-bold bg-blue-950 text-white">
          <tr>
            <TableHeading>Id</TableHeading>
            <TableHeading>Date</TableHeading>
            <TableHeading>Country</TableHeading>
            <TableHeading>Revenue</TableHeading>
            <TableHeading>Product</TableHeading>
            <TableHeading>Shipping</TableHeading>
            <TableHeading>VAT</TableHeading>
            <TableHeading>Other</TableHeading>
            <TableHeading>Payment</TableHeading>
            <TableHeading>Total Cost</TableHeading>
            <TableHeading>Profit</TableHeading>
            <TableHeading>
              <div className="flex items-center gap-1">
                Margin
                <div className="relative">
                  <div className="group w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-blue-950 text-xs font-bold cursor-default">
                    i
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max max-w-xs text-xs bg-gray-100 text-black px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition z-10 whitespace-nowrap pointer-events-none">
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-3 h-3 bg-red-600 rounded-sm" /> <span>&lt; 30%</span>
                      </div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-3 h-3 bg-orange-500 rounded-sm" /> <span>&lt; 50%</span>
                      </div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-3 h-3 bg-emerald-600 rounded-sm" /> <span>&lt; 70%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-purple-600 rounded-sm" /> <span>&gt;70%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TableHeading>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(orders) &&
            orders.map((order, i) => (
              <tr key={i} className="border-t">
                <TableCell>{order.id}</TableCell>
                <TableCell>{formatDate(order.date)}</TableCell>
                <TableCell>{order.country_code}</TableCell>
                <TableCell>{currencyFormatter('€', order.revenue)}</TableCell>
                <TableCell>{currencyFormatter('€', order.product_cost)}</TableCell>
                <TableCell>{currencyFormatter('€', order.shipping)}</TableCell>
                <TableCell>{currencyFormatter('€', order.vat)}</TableCell>
                <TableCell>{currencyFormatter('€', order.other)}</TableCell>
                <TableCell>{currencyFormatter('€', order.payment)}</TableCell>
                <TableCell>{currencyFormatter('€', order.total_cost)}</TableCell>
                <TableCell>{currencyFormatter('€', order.profit)}</TableCell>
                <TableCell>
                  <span className={getMarginColor(order.margin)}>
                    {numFormatter(order.margin) + '%'}
                  </span>
                </TableCell>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                isActive={page === 1}
                onClick={() => setPage(1)}
                className="cursor-pointer"
              >
                1
              </PaginationLink>
            </PaginationItem>

            {page === 1 && totalPages > 2 && (
              <PaginationItem>
                <span className="px-2 text-gray-400">...</span>
              </PaginationItem>
            )}

            {page !== 1 && page !== totalPages && (
              <PaginationItem>
                <PaginationLink isActive className="cursor-pointer">
                  {page}
                </PaginationLink>
              </PaginationItem>
            )}

            {page === totalPages && totalPages > 2 && (
              <PaginationItem>
                <span className="px-2 text-gray-400">...</span>
              </PaginationItem>
            )}

            {totalPages !== 1 && (
              <PaginationItem>
                <PaginationLink
                  isActive={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

export default Orders;

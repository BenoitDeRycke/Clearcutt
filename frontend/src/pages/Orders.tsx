import { useState, useEffect } from 'react';
import TableCell from '@/components/Orders/TableCell';
import TableHeading from '@/components/Orders/TableHeading';
import SyncButton from '@/components/Orders/SyncButton';
import { currencyFormatter, formatDate, numFormatter } from '../../utils/utils';
import { getMarginColor } from '../../utils/style.utils';
import type { Order } from '@/types/order';

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/supabase/getorders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/sync/sync-orders');
      const data = await res.json();

      if (data.success) {
        setMessage({ text: `✅ Sync complete! ${data.count} orders updated.`, type: 'success' });
        setLastSynced(new Date());
      } else {
        setMessage({ text: '⚠️ Sync failed, try again.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: '❌ Sync error occurred.', type: 'error' });
    } finally {
      await fetchOrders();
      setTimeout(() => setMessage(null), 4000);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading orders...</div>;
  }

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
      <div className="animate-fade-in-down">
        {message && (
          <div
            className={`transition-all duration-300 ease-in-out mb-3 text-sm text-center font-medium p-2 rounded border
      ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-red-100 text-red-700 border-red-400'}
    `}
          >
            {message.text}
          </div>
        )}
      </div>
      <table className="w-full border text-sm text-center">
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
              <div className="flex items-center gap-1 relative">
                Margin
                <div className="relative group">
                  <div className="text-blue-950 w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold cursor-default">
                    i
                  </div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-max max-w-xs text-xs bg-gray-100 text-black px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition z-10 whitespace-nowrap">
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
                      <div className="w-3 h-3 bg-purple-600 rounded-sm" /> <span>70%+</span>
                    </div>
                  </div>
                </div>
              </div>
            </TableHeading>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
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
    </div>
  );
}

export default Orders;

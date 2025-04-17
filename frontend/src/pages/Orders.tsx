import { useState, useEffect } from 'react';
import TableCell from '@/components/Orders/TableCell';
import TableHeading from '@/components/Orders/TableHeading';
import { numFormatter, currencyFormatter } from '../../utils';

type Order = {
  id: string;
  date: string;
  country: string;
  revenue: number;
  vat: number;
  productCost: number;
  shipping: number;
  other: number;
  payment: number;
  totalCost: number;
  profit: number;
  margin: string;
};
function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/sync-orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching orders:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Loading orders...</div>;
  }
  return (
    <div className="p-4">
      <h1 className="mb-2.5">Orders</h1>
      <div>
        <table className="w-full border text-sm text-center">
          <thead className="font-bold bg-gray-100">
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
              <TableHeading>Margin</TableHeading>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr key={i} className="border-t">
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.country}</TableCell>
                <TableCell>{currencyFormatter('€', order.revenue)}</TableCell>
                <TableCell>{currencyFormatter('€', order.productCost)}</TableCell>
                <TableCell>{currencyFormatter('€', order.shipping)}</TableCell>
                <TableCell>{currencyFormatter('€', order.vat)}</TableCell>
                <TableCell>{currencyFormatter('€', order.other)}</TableCell>
                <TableCell>{currencyFormatter('€', order.payment)}</TableCell>
                <TableCell>{currencyFormatter('€', order.totalCost)}</TableCell>
                <TableCell>{currencyFormatter('€', order.profit)}</TableCell>
                <TableCell>{order.margin}</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;

import { useState, useEffect } from 'react';
import TableCell from '@/components/Orders/TableCell';
import TableHeading from '@/components/Orders/TableHeading';

type Order = {
  id: string;
  date: string;
  country: string;
  revenue: number;
  vat: number;
  productCost: number;
  shipping: number;
  fees: number;
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
              <TableHeading>Fees</TableHeading>
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
                <TableCell>{order.revenue}</TableCell>
                <TableCell>{order.productCost}</TableCell>
                <TableCell>{order.shipping}</TableCell>
                <TableCell>{order.vat}</TableCell>
                <TableCell>{order.fees}</TableCell>
                <TableCell>{order.totalCost}</TableCell>
                <TableCell>{order.profit}</TableCell>
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

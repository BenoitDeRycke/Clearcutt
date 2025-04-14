import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <Link to="/orders" className="text-blue-600 underline">Go to Orders</Link>
    </div>
  );
}
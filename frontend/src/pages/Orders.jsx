import { Link } from 'react-router-dom';

export default function Orders() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold mb-4">Orders Page</h1>
      <Link to="/" className="text-blue-600 underline">Back to Dashboard</Link>
    </div>
  );
}
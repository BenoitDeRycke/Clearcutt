import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Overview from './pages/Overview';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Profit_Loss from './pages/Profit_Loss';
import Expenses from './pages/Expenses';
import Taxes from './pages/Taxes';
import Integration from './pages/Integrations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />

          <Route path="expenses" element={<Expenses />} />
          <Route path="profit-loss" element={<Profit_Loss />} />
          <Route path="taxes" element={<Taxes />} />

          <Route path="integrations" element={<Integration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

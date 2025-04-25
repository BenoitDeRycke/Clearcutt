import { NavLink } from 'react-router-dom';
import SidebarSection from './SidebarSection';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block w-full px-6 py-2 text-sm ${
    isActive
      ? 'bg-clearcut-light text-clearcut font-medium border-r-4 border-clearcut-dark'
      : 'hover:bg-clearcut-light hover:text-clearcut'
  }`;

function SideBar() {
  return (
    <aside className="h-screen w-56 border-r border-gray-200 bg-white text-sm">
      <div className="h-14 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-lg font-semibold">Clearcut</h1>
      </div>

      <nav className="space-y-6 pt-6 text-gray-500">
        <SidebarSection title="Insights" matchPaths={['/', '/dashboard']}>
          <li>
            <NavLink to="/" className={navLinkClass}>
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </li>
        </SidebarSection>

        <SidebarSection title="Operations" matchPaths={['/orders', '/products', '/customers']}>
          <li>
            <NavLink to="/orders" className={navLinkClass}>
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers" className={navLinkClass}>
              Customers
            </NavLink>
          </li>
        </SidebarSection>

        <SidebarSection title="Reports" matchPaths={['/expenses', '/profit-loss', '/taxes']}>
          <li>
            <NavLink to="/expenses" className={navLinkClass}>
              Expenses
            </NavLink>
          </li>
          <li>
            <NavLink to="/profit-loss" className={navLinkClass}>
              Profit & Loss
            </NavLink>
          </li>
          <li>
            <NavLink to="/taxes" className={navLinkClass}>
              Taxes / VAT
            </NavLink>
          </li>
        </SidebarSection>

        <SidebarSection title="Settings" matchPaths={['/integrations']}>
          <li>
            <NavLink to="/integrations" className={navLinkClass}>
              Integrations
            </NavLink>
          </li>
        </SidebarSection>
      </nav>
    </aside>
  );
}

export default SideBar;

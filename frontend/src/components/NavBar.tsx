import { NavLink } from 'react-router-dom';

const isActive = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-white font-semibold' : 'text-gray-400';

function NavBar() {
  return (
    <nav className="sticky top-0 h-screen w-64 bg-gray-900 text-white p-6 ">
      <h1 className="text-2xl font-bold mb-6">Profit Tracker</h1>
      <ul className="space-y-4">
        <li>
          <NavLink to="/" className={isActive}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders" className={isActive}>
            Orders
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;

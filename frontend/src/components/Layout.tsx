import NavBar from './NavBar';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="flex">
      <NavBar />
      <main className="p-6 w-full">
        <Outlet />
      </main>
    </div>
  );
}
export default Layout;

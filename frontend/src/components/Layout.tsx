import NavBar from './SideBar';
import TopBar from './TopBar';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="flex min-h-screen">
      <NavBar />
      <div className="flex flex-col flex-1">
        <TopBar />
        <main className="flex-1 px-12 py-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export default Layout;

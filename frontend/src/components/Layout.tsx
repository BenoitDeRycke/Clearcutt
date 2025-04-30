import SideBar from './SideBar';
import TopBar from './TopBar';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 px-12 py-6 overflow-auto">
          <Outlet />
        </main>
        <Toaster position="bottom-right" richColors expand duration={3000} />
      </div>
    </div>
  );
}
export default Layout;

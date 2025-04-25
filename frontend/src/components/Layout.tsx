import SideBar from './SideBar';
import TopBar from './TopBar';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

function Layout() {
  return (
    <div className="flex min-h-screen">
      <SideBar />
      <div className="flex flex-col flex-1">
        <TopBar />
        <main className="flex-1 px-12 py-6 overflow-auto">
          <Outlet />
        </main>
        <Toaster position="bottom-right" richColors expand />
      </div>
    </div>
  );
}
export default Layout;

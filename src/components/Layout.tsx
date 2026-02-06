import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex h-full bg-slate-50 dark:bg-mansion-900">
      <Sidebar />
      {/* Main area offset by sidebar. The sidebar uses peer to communicate collapsed state;
          but for simplicity we use a fixed margin that covers the expanded case.
          The sidebar transition handles the visual, and we leave a comfortable margin. */}
      <div className="ml-64 flex min-h-screen flex-1 flex-col transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AppLayout(){
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  return (
    <div className="d-flex" style={{minHeight:'100vh', position:'relative'}}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="container py-3" onClick={closeSidebar}>
          <Outlet />
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background:'rgba(0,0,0,.2)', zIndex:1030 }}
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}

import React from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import { LogOut, IceCream, LayoutDashboard, Store, Box, BarChart3, ShoppingBag, Layers, ArrowRightLeft } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-xl leading-none">H</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-blue-500">HIMCREAM</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem to="/admin" icon={<LayoutDashboard />} label="Dashboard" navigate={navigate} currentPath={location.pathname} />
          <NavItem to="/admin/branches" icon={<Store />} label="Branches" navigate={navigate} currentPath={location.pathname} />
          <NavItem to="/admin/products" icon={<Box />} label="Global Products" navigate={navigate} currentPath={location.pathname} />
          <NavItem to="/admin/transfers" icon={<ArrowRightLeft />} label="Stock Transfers" navigate={navigate} currentPath={location.pathname} />
          <NavItem to="/admin/reports" icon={<BarChart3 />} label="Reports" navigate={navigate} currentPath={location.pathname} />
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center w-full px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-xl leading-none">H</span>
            </div>
            <span className="font-bold text-xl text-blue-500 tracking-tight">HIMCREAM</span>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-slate-600">
            <LogOut className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 pb-safe z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <BottomNavItem to="/admin" icon={<LayoutDashboard />} label="Dashboard" navigate={navigate} currentPath={location.pathname} />
          <BottomNavItem to="/admin/branches" icon={<Store />} label="Branches" navigate={navigate} currentPath={location.pathname} />
          <BottomNavItem to="/admin/products" icon={<Box />} label="Products" navigate={navigate} currentPath={location.pathname} />
          <BottomNavItem to="/admin/reports" icon={<BarChart3 />} label="Reports" navigate={navigate} currentPath={location.pathname} />
        </nav>
      </div>
    </div>
  );
};

export const BranchLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.role !== 'branch') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 h-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-white font-black text-xl leading-none">H</span>
            </div>
            <span className="font-bold text-2xl text-blue-500 tracking-tight hidden sm:block">HIMCREAM</span>
            <span className="hidden sm:inline-block ml-3 px-2 py-1 bg-blue-50 text-blue-500 text-[10px] font-bold uppercase tracking-widest rounded-lg">Branch Portal</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Branch Nav */}
            <nav className="hidden lg:flex gap-1 bg-slate-100/50 p-1 rounded-xl mr-4">
               <NavItemDesktop to="/branch" icon={<ShoppingBag className="w-4 h-4 mr-2"/>} label="Sell" currentPath={location.pathname} navigate={navigate} />
               <NavItemDesktop to="/branch/stock" icon={<Layers className="w-4 h-4 mr-2"/>} label="Stock" currentPath={location.pathname} navigate={navigate} />
               <NavItemDesktop to="/branch/reports" icon={<BarChart3 className="w-4 h-4 mr-2"/>} label="Reports" currentPath={location.pathname} navigate={navigate} />
            </nav>

            <div className="hidden sm:flex flex-col items-end mr-2 sm:mr-4">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Logged In</span>
              <span className="text-sm font-bold text-slate-800">{user?.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="w-10 h-10 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto w-full mx-auto p-4 min-h-0 lg:max-w-6xl pb-24 lg:pb-8">
        <Outlet />
      </main>

      {/* Bottom Nav (Mobile/Tablet) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 pb-safe z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <BottomNavItem to="/branch" icon={<ShoppingBag />} label="Sell" navigate={navigate} currentPath={location.pathname} />
        <BottomNavItem to="/branch/stock" icon={<Layers />} label="Stock" navigate={navigate} currentPath={location.pathname} />
        <BottomNavItem to="/branch/reports" icon={<BarChart3 />} label="Reports" navigate={navigate} currentPath={location.pathname} />
      </nav>
    </div>
  );
};

const NavItemDesktop = ({ to, icon, label, navigate, currentPath }: { to: string, icon: React.ReactNode, label: string, navigate: any, currentPath: string }) => {
  const isActive = currentPath === to || (to !== '/branch' && currentPath.startsWith(to));
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
        isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

const NavItem = ({ to, icon, label, navigate, currentPath }: { to: string, icon: React.ReactNode, label: string, navigate: any, currentPath: string }) => {
  const isActive = currentPath === to || (to !== '/admin' && currentPath.startsWith(to));
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center w-full px-4 py-3 rounded-xl transition-colors font-medium ${
        isActive ? 'bg-red-50 text-red-500' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <span className={`w-5 h-5 mr-3 ${isActive ? 'text-red-500' : 'text-slate-500'}`}>
        {icon}
      </span>
      {label}
    </button>
  );
};

const BottomNavItem = ({ to, icon, label, navigate, currentPath }: { to: string, icon: React.ReactNode, label: string, navigate: any, currentPath: string }) => {
  const isActive = currentPath === to || (to !== '/branch' && to !== '/admin' && currentPath.startsWith(to));
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex flex-col items-center justify-center w-20 transition-colors ${
        isActive ? 'text-red-500' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      <span className="mb-1">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};

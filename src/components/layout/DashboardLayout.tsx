import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Clock, 
  Users, 
  Wallet, 
  Settings,
  LogOut,
  Bell
} from "lucide-react";

export function DashboardLayout() {
  const { currentUser, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = currentUser?.role === 'admin' ? [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Directory', path: '/admin/directory', icon: Users },
    { name: 'Approvals', path: '/admin/approvals', icon: Clock },
    { name: 'Payroll', path: '/admin/payroll', icon: Wallet },
  ] : [
    { name: 'Today', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', path: '/attendance', icon: CalendarDays },
    { name: 'Time Off', path: '/leave', icon: Clock },
    { name: 'Profile', path: '/profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      {/* Sidebar - Timeline Style */}
      <aside className="w-full md:w-24 lg:w-64 bg-surface border-r border-border flex flex-col pt-6 pb-6 relative shrink-0">
        <div className="px-6 mb-12 flex items-center gap-3">
          <div className="w-8 h-8 bg-steel rounded-lg flex items-center justify-center text-white shrink-0">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold text-lg hidden lg:block text-ink">Dayflow</span>
        </div>

        <nav className="flex-1 relative px-4 lg:px-6">
          {/* Vertical Time Rail */}
          <div className="absolute left-[39px] lg:left-[47px] top-4 bottom-4 w-px bg-border hidden md:block" />

          <ul className="space-y-8 relative z-10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/dashboard' && item.path !== '/admin');
              return (
                <li key={item.path} className="relative">
                  <Link 
                    to={item.path}
                    className={cn(
                      "flex items-center gap-4 group transition-colors",
                      isActive ? "text-steel" : "text-text-muted hover:text-ink"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center bg-surface transition-all border-2",
                      isActive ? "border-steel text-steel" : "border-transparent group-hover:border-border"
                    )}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "font-medium hidden lg:block",
                      isActive ? "text-ink" : ""
                    )}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 lg:px-6 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 text-text-muted hover:text-ink transition-colors w-full group"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface border-2 border-transparent group-hover:border-border transition-all">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium hidden lg:block">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-display font-semibold text-ink capitalize">
              {location.pathname.split('/').pop() || 'Overview'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-text-muted hover:text-ink transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute 0 right-0 w-2 h-2 bg-amber rounded-full border border-surface" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-ink">{currentUser?.name}</p>
                <p className="text-xs text-text-muted capitalize">{currentUser?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-steel text-white flex items-center justify-center font-medium">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

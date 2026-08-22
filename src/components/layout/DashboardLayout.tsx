import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Clock, 
  Users, 
  Wallet, 
  Settings,
  LogOut,
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Check,
  X,
  Trash2
} from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
}

export function DashboardLayout() {
  const { currentUser, logout, attendance, leaveRequests, toastMessage, setToastMessage } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate notifications dynamically from current store state
  const todayStr = new Date().toISOString().split('T')[0];
  const userRecord = attendance.find(a => a.userId === currentUser?.id && a.date === todayStr);
  const userLeaves = leaveRequests.filter(r => r.userId === currentUser?.id);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: userRecord?.checkIn ? 'Check-In Active' : 'Attendance Reminder',
      message: userRecord?.checkIn 
        ? `You checked in for your shift at ${new Date(userRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
        : 'Don\'t forget to record your check-in for today\'s shift!',
      time: 'Just now',
      type: userRecord?.checkIn ? 'success' : 'info',
      read: false
    },
    {
      id: 'n2',
      title: 'Weekly Schedule Published',
      message: 'Your shift schedule for the upcoming week has been updated by HR.',
      time: '2 hours ago',
      type: 'info',
      read: false
    },
    ...(userLeaves.length > 0 ? [{
      id: 'n3',
      title: `Leave Request ${userLeaves[0].status.toUpperCase()}`,
      message: `Your ${userLeaves[0].type} leave request for ${userLeaves[0].startDate} is currently ${userLeaves[0].status}.`,
      time: 'Yesterday',
      type: userLeaves[0].status === 'approved' ? 'success' as const : 'warning' as const,
      read: true
    }] : []),
    {
      id: 'n4',
      title: 'Profile & Security',
      message: 'SSO credentials and email profile verified.',
      time: '1 day ago',
      type: 'info',
      read: true
    }
  ]);

  // Close notification popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Auto-dismiss toastMessage after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  const handleLogout = () => {
    logout();
    setToastMessage('Successfully logged out.');
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
            className="flex items-center gap-4 text-text-muted hover:text-ink transition-colors w-full group cursor-pointer"
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
            
            {/* Notification Menu Container */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotificationOpen(prev => !prev)}
                className="relative p-2 rounded-full text-text-muted hover:text-ink hover:bg-surface-hover transition-all cursor-pointer focus:outline-none"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brick rounded-full ring-2 ring-surface animate-pulse" />
                )}
              </button>

              {/* Notification Popover Drawer */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-canvas/40">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-sm text-ink">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-steel text-white rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-steel hover:underline font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button 
                          onClick={clearAllNotifications}
                          className="text-xs text-text-muted hover:text-brick transition-colors cursor-pointer p-1"
                          title="Clear all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "p-4 flex items-start gap-3 transition-colors cursor-pointer group hover:bg-surface-hover relative",
                          !n.read ? "bg-sky/5" : ""
                        )}
                      >
                        <div className="shrink-0 mt-0.5">
                          {n.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald" />
                          ) : n.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4 text-amber" />
                          ) : (
                            <Info className="w-4 h-4 text-steel" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className={cn("text-xs font-semibold text-ink truncate", !n.read ? "font-bold" : "")}>
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-text-muted shrink-0 ml-2">{n.time}</span>
                          </div>
                          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(n.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-muted hover:text-brick cursor-pointer absolute top-3 right-3"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <div className="p-8 text-center text-text-muted">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-steel" />
                        <p className="text-sm font-medium">No notifications</p>
                        <p className="text-xs text-text-muted mt-0.5">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-ink">{currentUser?.name}</p>
                <p className="text-xs text-text-muted capitalize">{currentUser?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-steel text-white flex items-center justify-center font-medium overflow-hidden shrink-0 border border-border">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser?.name?.charAt(0) || 'U'
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {toastMessage && (
            <div className="mb-6 bg-emerald-bg border border-emerald/30 text-emerald px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" />
                {toastMessage}
              </div>
              <button onClick={() => setToastMessage(null)} className="text-xs hover:underline ml-4 cursor-pointer font-medium">
                Dismiss
              </button>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

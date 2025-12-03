import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  MessageCircle, 
  User, 
  Menu, 
  Bell, 
  X, 
  Activity,
  CreditCard,
  FileText,
  LogOut,
  Megaphone,
  HeartHandshake,
  GraduationCap,
  Camera,
  Car,
  ClipboardCheck,
  ShoppingBag,
  MessageSquareWarning,
  BookOpen,
  School,
  Users
} from 'lucide-react';
import { User as UserType, UserRole, Notification } from '../types';
import NotificationsPanel from './NotificationsPanel';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: UserType;
  currentView: string;
  notifications: Notification[];
  onChangeView: (view: string) => void;
  onLogout: () => void;
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  currentView, 
  notifications,
  onChangeView,
  onLogout,
  onMarkNotificationRead,
  onClearNotifications
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, roles: ['all'] },
    // Admin & Super Admin Specific
    { id: 'classes', label: 'Classes', icon: School, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    
    // Student Directory for Staff
    { id: 'students', label: 'Students', icon: Users, roles: [UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPER_ADMIN] },

    { id: 'attendance', label: 'Attendance Reports', icon: ClipboardCheck, roles: ['all'] },
    // Homework hidden for Admins to reduce clutter
    { id: 'homework', label: 'Homework', icon: BookOpen, roles: [UserRole.TEACHER, UserRole.PARENT] },
    { id: 'pickup', label: 'Pickup', icon: Car, roles: ['all'] },
    { id: 'shop', label: 'Sales & Shop', icon: ShoppingBag, roles: ['all'] },
    // Moments hidden for Admins
    { id: 'moments', label: 'Moments', icon: Camera, roles: [UserRole.TEACHER, UserRole.PARENT] },
    { id: 'teachers', label: 'Staff', icon: GraduationCap, roles: ['all'] },
    { id: 'announcements', label: 'Notices', icon: Megaphone, roles: ['all'] },
    { id: 'calendar', label: 'Calendar', icon: Calendar, roles: ['all'] },
    { id: 'messages', label: 'Chat', icon: MessageCircle, roles: ['all'] },
    { id: 'feedback', label: 'Feedback', icon: MessageSquareWarning, roles: ['all'] },
    { id: 'billing', label: 'Billing & Fees', icon: CreditCard, roles: ['all'] },
    // Health hidden for Admins (unless specifically Nurse role, but simplifying for request)
    { id: 'health', label: 'Health', icon: Activity, roles: [UserRole.TEACHER, UserRole.PARENT] },
    { id: 'docs', label: 'Docs', icon: FileText, roles: ['all'] },
    { id: 'profile', label: 'Profile', icon: User, roles: ['all'] },
  ];

  // Filter items based on role
  const visibleNavItems = navItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(currentUser.role)
  );

  // Mobile Bottom Nav Items (Top 5 fit nice)
  const mobileNavItems = visibleNavItems.slice(0, 5);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 shadow-sm z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-primaryLight rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
            <HeartHandshake size={24} />
          </div>
          <span className="text-2xl font-bold text-gray-800 tracking-tight">SchoolFam</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-200 font-medium ${
                currentView === item.id 
                  ? 'bg-cutePink text-primary shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <item.icon size={22} strokeWidth={currentView === item.id ? 2.5 : 2} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 m-4 mt-auto bg-cuteBlue/50 rounded-3xl">
          <div className="flex items-center gap-3 mb-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-rose-500 bg-white py-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
              <HeartHandshake size={18} />
           </div>
           <h1 className="font-bold text-lg text-gray-800">SchoolFam</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-gray-500 bg-gray-100 p-2 rounded-xl active:scale-95 transition-transform"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            )}
          </button>
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 bg-gray-100 p-2 rounded-xl">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar (Overlay) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 flex flex-col animate-in slide-in-from-right shadow-2xl rounded-l-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-bold text-xl text-gray-800">Menu</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-2 overflow-y-auto">
              {visibleNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-colors ${
                    currentView === item.id ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 font-medium'
                  }`}
                >
                  <item.icon size={22} />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-100">
               <div className="flex items-center gap-3 mb-4">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{currentUser.role.toLowerCase().replace('_', ' ')}</p>
                </div>
               </div>
               <button 
                onClick={() => {
                  onLogout();
                  setSidebarOpen(false);
                }}
                className="w-full py-3 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8 relative">
        {/* Header with Bell for Desktop */}
        <div className="hidden md:flex justify-end px-8 py-4 absolute top-0 right-0 z-40 w-full pointer-events-none">
           <div className="pointer-events-auto relative">
             <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-gray-500 hover:text-primary hover:shadow-md transition-all"
             >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
             </button>
             <NotificationsPanel 
               notifications={notifications}
               isOpen={isNotificationsOpen}
               onClose={() => setIsNotificationsOpen(false)}
               onMarkAsRead={onMarkNotificationRead}
               onClearAll={onClearNotifications}
             />
           </div>
        </div>

        {/* Notifications Panel (Mobile) */}
        <div className="md:hidden">
          <NotificationsPanel 
              notifications={notifications}
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              onMarkAsRead={onMarkNotificationRead}
              onClearAll={onClearNotifications}
            />
        </div>

        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-20 safe-area-bottom shadow-lg rounded-t-3xl">
        {mobileNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`flex flex-col items-center gap-1 p-1 transition-all ${
              currentView === item.id ? 'text-primary -translate-y-1' : 'text-gray-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${currentView === item.id ? 'bg-cutePink' : ''}`}>
               <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} />
            </div>
            {currentView === item.id && <span className="text-[10px] font-bold">{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Layout;
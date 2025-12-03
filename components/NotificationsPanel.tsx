
import React from 'react';
import { X, Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  isOpen, 
  onClose, 
  onMarkAsRead,
  onClearAll 
}) => {
  if (!isOpen) return null;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'urgent': return <AlertTriangle size={18} className="text-white" />;
      case 'success': return <CheckCircle size={18} className="text-white" />;
      case 'reminder': return <Clock size={18} className="text-white" />;
      default: return <Info size={18} className="text-white" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'urgent': return 'bg-rose-500 shadow-rose-200';
      case 'success': return 'bg-green-500 shadow-green-200';
      case 'reminder': return 'bg-orange-400 shadow-orange-200';
      default: return 'bg-blue-400 shadow-blue-200';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute right-4 md:right-12 top-16 z-50 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <h3 className="font-bold text-gray-800">Notifications</h3>
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.isRead).length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClearAll} className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
              Clear All
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
              <Bell size={32} className="mb-2 opacity-20" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onMarkAsRead(item.id)}
                className={`p-4 border-b border-gray-50 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${!item.isRead ? 'bg-blue-50/50' : ''}`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${getBgColor(item.type)}`}>
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm ${!item.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{item.timestamp}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${!item.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                    {item.message}
                  </p>
                  {!item.isRead && (
                    <span className="inline-block mt-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                      New
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
          <button className="text-xs font-bold text-primary hover:underline">View Notification Settings</button>
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;

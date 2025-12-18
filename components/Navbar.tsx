import React, { useState } from 'react';
import { useStore } from '../storeContext';
import { TestStatus } from '../types';
import { ShoppingBag, Activity, Bell, Mail, MessageSquare, Menu, X, Youtube } from 'lucide-react';

interface NavbarProps {
  currentView: 'store' | 'emr';
  setView: (view: 'store' | 'emr') => void;
}

// Custom GMTCC Logomark SVG
const GmtccLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 24L20 8L28 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8" cy="22" r="4" fill="currentColor"/>
    <path d="M14 20C14 16.6863 16.6863 14 20 14" stroke="currentColor" strokeWidth="3"/>
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const { user, markNotificationRead } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEmrDisabled = user.testStatus === TestStatus.NONE;
  const unreadCount = user.notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-brand-blue text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-8">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => setView('store')}>
              <div className="text-brand-luminous group-hover:text-white transition-colors">
                <GmtccLogo />
              </div>
              <div className="flex flex-col">
                 <span className="font-bold text-lg tracking-wide leading-none">GMTCC</span>
                 <span className="text-[10px] tracking-[0.2em] text-brand-luminous uppercase">Insight</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => setView('store')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentView === 'store' 
                    ? 'text-brand-luminous' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Start Journey
              </button>

              <a 
                 href="#" 
                 className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white flex items-center gap-2"
                 onClick={(e) => e.preventDefault()}
              >
                 Science & Research
              </a>
              
              <button
                onClick={() => !isEmrDisabled && setView('emr')}
                disabled={isEmrDisabled}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentView === 'emr' 
                    ? 'bg-white/10 text-brand-luminous' 
                    : isEmrDisabled 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-300 hover:text-white'
                }`}
              >
                <Activity size={16} />
                My Portal
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-300 hover:text-brand-luminous transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-brand-blue">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-20 max-h-96 overflow-y-auto text-gray-900">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="py-2">
                      {user.notifications.length === 0 ? (
                        <p className="px-4 py-2 text-sm text-gray-500">No notifications yet.</p>
                      ) : (
                        user.notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}
                            onClick={() => markNotificationRead(n.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 ${n.type === 'EMAIL' ? 'text-blue-500' : 'text-green-500'}`}>
                                {n.type === 'EMAIL' ? <Mail size={16} /> : <MessageSquare size={16} />}
                              </div>
                              <div>
                                <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="text-sm text-right hidden md:block border-l pl-4 border-white/20">
              <div className="font-medium text-white">{user.name}</div>
              <div className="text-xs text-gray-400">
                {user.testStatus === TestStatus.NONE ? 'Guest' : 'Member'}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                 {mobileMenuOpen ? <X /> : <Menu />}
               </button>
            </div>
          </div>
        </div>
      </div>

       {/* Mobile Menu */}
       {mobileMenuOpen && (
        <div className="md:hidden bg-brand-blue border-t border-white/10 px-4 pt-2 pb-4 space-y-1">
           <button onClick={() => { setView('store'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-brand-luminous font-bold">Start Journey</button>
           <button onClick={() => setMobileMenuOpen(false)} className="block w-full text-left py-2 text-white">Science & Research</button>
           <button 
              onClick={() => { !isEmrDisabled && setView('emr'); setMobileMenuOpen(false); }} 
              disabled={isEmrDisabled}
              className={`block w-full text-left py-2 ${isEmrDisabled ? 'text-gray-500' : 'text-white'}`}
           >
             My Portal
           </button>
        </div>
       )}
    </nav>
  );
};

export default Navbar;
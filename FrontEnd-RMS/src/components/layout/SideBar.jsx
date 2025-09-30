import React from 'react';
import { assets } from '../../assets/assets.js';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Activity, 
  Calendar, 
  MessageSquare, 
  Settings 
} from 'lucide-react';

const Sidebar = ({ activeRoute, onRouteChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'research-stats', label: 'Research Stats', icon: BarChart3 },
    { id: 'activity-log', label: 'Activity Log', icon: Activity },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-blue-950 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-b-gray-400">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <img  className=' t-0' src={assets.HiLCoE_Logo} alt="" />
          </div>
          <div>
            <h2 className="text-white font-semibold font-caprasimo">HiLCoE</h2>
            <p className="text-blue-300 text-md">Research Management</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onRouteChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
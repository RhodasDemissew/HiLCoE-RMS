import React from 'react'
import { useState } from 'react';
import Users from './Users';
import Dashboard from './Dasboard';
import ResearchStats from './ResearchStat';
import ActivityLog from './ActivityLog';
import Messages from './Message';
import Settings from './Settings';
import NavHeader from './NavHearder';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/SideBar';


const S_Dashboard = () => {
    
  const [activeRoute, setActiveRoute] = useState('dashboard');

  const renderContent = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <Link to='/dashboard'><Dashboard /></Link>;
      case 'users':
        return <Link to='/users'><Users /></Link> ;
      case 'research-stats':
        return <Link to='/research-stats'><ResearchStats /></Link> ;
      case 'activity-log':
        return <Link to='activity-log'><ActivityLog /></Link> ;
      case 'messages':
        return <Link to='messages'><Messages /></Link>;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard/>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeRoute={activeRoute} onRouteChange={setActiveRoute} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <NavHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
          
        </main>
      </div>
    </div>
  )
}

export default S_Dashboard
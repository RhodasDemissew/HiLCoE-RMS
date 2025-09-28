import React from 'react';
import { TrendingUp, Users, FileText, Clock } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Students', value: '56', icon: Users, color: 'bg-blue-500' },
    { label: 'Supervisors', value: '20', icon: Users, color: 'bg-green-500' },
    { label: 'Active Research', value: '43', icon: FileText, color: 'bg-purple-500' },
  ];

  const activityData = [
    { date: '17/6/2025', author: 'Supervisor', action: 'Approved', description: 'Approved Proposal for Group 11' },
    { date: '17/6/2025', author: 'Group 15', action: 'Submitted', description: 'Proposal for Group 11' },
    { date: '17/6/2025', author: 'Group 12', action: 'Submitted', description: 'Approved Proposal for Group 11' },
  ];

  const events = [
    { title: 'Supervisor Meeting', date: '20 Jan 2025', type: 'meeting', icon: Clock },
    { title: 'Proposal Deadline', date: '25 Jan 2025', type: 'deadline', icon: FileText },
    { title: 'Upcoming Progress Report', date: '30 Jan 2025', type: 'report', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Dr Mesfin</h1>
        <p className="text-gray-600">Today is a good day to make progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Log */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Author</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Action</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody>
                {activityData.map((activity, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">{activity.date}</td>
                    <td className="py-3 text-sm text-gray-900">{activity.author}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.action === 'Approved' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.action}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{activity.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Events and Deadlines */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Events and Deadlines</h3>
          <div className="space-y-4">
            {events.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    event.type === 'meeting' ? 'bg-blue-100' :
                    event.type === 'deadline' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <Icon size={16} className={
                      event.type === 'meeting' ? 'text-blue-600' :
                      event.type === 'deadline' ? 'text-red-600' : 'text-green-600'
                    } />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-4 text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
            View Full Calendar
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server/AI Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Server/AI Performance</h3>
          <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-lg">518.31</span>
              </div>
              <p className="text-sm text-gray-600">Performance Score</p>
            </div>
          </div>
        </div>

        {/* Research Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Stats</h3>
          <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp size={48} className="text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Research Progress Trends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
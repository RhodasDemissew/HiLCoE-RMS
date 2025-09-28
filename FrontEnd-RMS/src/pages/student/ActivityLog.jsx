import React, { useState } from 'react';
import { Filter, Download, Search } from 'lucide-react';

const ActivityLog = () => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const activities = [
    {
      id: 1,
      date: '17/6/2025',
      time: '10:30 AM',
      author: 'Dr. Smith',
      action: 'Approved',
      description: 'Approved research proposal for Group 11',
      type: 'approval',
      target: 'Proposal'
    },
    {
      id: 2,
      date: '17/6/2025',
      time: '09:45 AM',
      author: 'John Doe (Group 15)',
      action: 'Submitted',
      description: 'Submitted final research proposal',
      type: 'submission',
      target: 'Proposal'
    },
    {
      id: 3,
      date: '17/6/2025',
      time: '08:20 AM',
      author: 'Sarah Wilson (Group 12)',
      action: 'Updated',
      description: 'Updated research methodology section',
      type: 'update',
      target: 'Document'
    },
    {
      id: 4,
      date: '16/6/2025',
      time: '4:15 PM',
      author: 'Dr. Johnson',
      action: 'Commented',
      description: 'Added feedback on literature review',
      type: 'comment',
      target: 'Review'
    },
    {
      id: 5,
      date: '16/6/2025',
      time: '2:30 PM',
      author: 'Mike Brown (Group 8)',
      action: 'Submitted',
      description: 'Submitted progress report for week 3',
      type: 'submission',
      target: 'Report'
    }
  ];

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'commented':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
            <p className="text-gray-600 mt-1">Track all system activities and user actions</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download size={20} />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Activities</option>
                <option value="approval">Approvals</option>
                <option value="submission">Submissions</option>
                <option value="update">Updates</option>
                <option value="comment">Comments</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Date & Time</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Author</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Action</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{activity.date}</div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {activity.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{activity.author}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getActionColor(activity.action)}`}>
                      {activity.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 max-w-md">
                    {activity.description}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                      {activity.target}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredActivities.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">No activities found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
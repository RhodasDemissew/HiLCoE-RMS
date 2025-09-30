import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

const ResearchStats = () => {
  const stats = [
    { label: 'Total Projects', value: '43', change: '+12%', trend: 'up' },
    { label: 'Completed', value: '18', change: '+8%', trend: 'up' },
    { label: 'In Progress', value: '25', change: '+15%', trend: 'up' },
    { label: 'Pending Review', value: '7', change: '-3%', trend: 'down' },
  ];

  const researchAreas = [
    { area: 'Computer Science', projects: 15, color: 'bg-blue-500' },
    { area: 'Engineering', projects: 12, color: 'bg-green-500' },
    { area: 'Mathematics', projects: 8, color: 'bg-purple-500' },
    { area: 'Physics', projects: 5, color: 'bg-orange-500' },
    { area: 'Biology', projects: 3, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Research Statistics</h1>
        <p className="text-gray-600">Overview of research projects and performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="text-green-500 mr-1" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500 mr-1" size={16} />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Research Areas */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Areas</h3>
          <div className="space-y-4">
            {researchAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${area.color}`}></div>
                  <span className="font-medium text-gray-700">{area.area}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{area.projects}</span>
                  <span className="text-sm text-gray-500 ml-1">projects</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              <PieChart size={64} className="text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Interactive Timeline Chart</p>
              <p className="text-sm text-gray-500 mt-1">Visual representation of project progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Project Title</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Student</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Supervisor</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="py-4 px-6 font-medium text-gray-900">AI-Based Image Recognition</td>
                <td className="py-4 px-6 text-gray-600">John Smith</td>
                <td className="py-4 px-6 text-gray-600">Dr. Johnson</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">75%</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-4 px-6 font-medium text-gray-900">Machine Learning Algorithms</td>
                <td className="py-4 px-6 text-gray-600">Sarah Wilson</td>
                <td className="py-4 px-6 text-gray-600">Dr. Smith</td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Review
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">90%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResearchStats;
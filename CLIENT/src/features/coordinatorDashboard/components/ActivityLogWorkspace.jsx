import { useEffect, useState } from 'react';
import { api } from '../../../api/client.js';

function ActivityLogTable({ activities, loading }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="rounded-xl sm:rounded-2xl border border-[color:var(--neutral-200)] bg-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-[color:var(--neutral-200)] rounded w-1/4 mb-3 sm:mb-4"></div>
          <div className="space-y-2 sm:space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-2 sm:space-x-4">
                <div className="h-4 bg-[color:var(--neutral-200)] rounded w-1/6"></div>
                <div className="h-4 bg-[color:var(--neutral-200)] rounded w-1/6"></div>
                <div className="h-4 bg-[color:var(--neutral-200)] rounded w-1/6"></div>
                <div className="h-4 bg-[color:var(--neutral-200)] rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl sm:rounded-2xl border border-[color:var(--neutral-200)] bg-white px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 shadow-sm">
      <header className="mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-[color:var(--neutral-900)]">Activity Log</h2>
        <p className="text-[10px] sm:text-xs text-[color:var(--neutral-500)]">Research system activity history</p>
      </header>
      <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-[color:var(--neutral-200)]">
        <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left text-xs sm:text-sm">
          <thead className="bg-[color:var(--neutral-50)]">
            <tr className="text-[color:var(--neutral-600)]">
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">Date</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-medium whitespace-nowrap hidden sm:table-cell">Author</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">Action</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-medium whitespace-nowrap hidden lg:table-cell">Description</th>
              <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-medium whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--neutral-200)]">
            {activities && activities.length > 0 ? activities.map((row, idx) => (
              <tr key={`${row.id || row.date}-${idx}`} className="text-[color:var(--neutral-700)]">
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap">
                  <div>{formatDate(row.date)}</div>
                  <div className="text-[10px] sm:text-xs text-[color:var(--neutral-400)]">{formatTimeAgo(row.date)}</div>
                </td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell whitespace-nowrap">{row.author}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">{row.action}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm text-[color:var(--neutral-500)] hidden lg:table-cell">{row.description}</td>
                <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium ${
                    row.status === 'approved' ? 'bg-green-100 text-green-800' :
                    row.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    row.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                    row.status === 'needs_changes' ? 'bg-orange-100 text-orange-800' :
                    row.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    row.status === 'graded' ? 'bg-purple-100 text-purple-800' :
                    row.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {row.status || 'N/A'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-3 sm:px-4 py-6 sm:py-8 text-center text-xs sm:text-sm text-[color:var(--neutral-500)]">
                  No activity found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'all', label: 'All Activity' },
    { id: 'researcher', label: 'Researcher Activity' },
    { id: 'supervisor', label: 'Supervisor Activity' }
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-[color:var(--neutral-200)]">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-[color:var(--brand-600)] text-[color:var(--brand-600)]'
                  : 'border-transparent text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-700)] hover:border-[color:var(--neutral-300)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function ActivityLogWorkspace() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0
  });

  const fetchActivities = async (page = 1, type = 'all') => {
    try {
      setLoading(true);
      const res = await api(`/activity-log?page=${page}&limit=25&type=${type}`);
      const data = await res.json().catch(() => ({ activities: [], pagination: {} }));
      
      if (res.ok && data) {
        setActivities(data.activities || []);
        // Ensure pagination data is valid
        const paginationData = data.pagination || {};
        setPagination({
          page: Math.max(1, paginationData.page || page),
          limit: paginationData.limit || 25,
          total: paginationData.total || 0,
          totalPages: Math.max(1, paginationData.totalPages || Math.ceil((paginationData.total || 0) / (paginationData.limit || 25)))
        });
      } else {
        // Reset to page 1 if request fails
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      // Reset to page 1 on error
      setPagination(prev => ({ ...prev, page: 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1, activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPagination({ page: 1, limit: 25, total: 0, totalPages: 0 });
  };

  const handlePageChange = (newPage) => {
    // Ensure newPage is valid
    if (newPage < 1) return;
    if (pagination.totalPages > 0 && newPage > pagination.totalPages) return;
    
    // Update page immediately for better UX
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchActivities(newPage, activeTab);
  };

  return (
    <section className="rounded-3xl bg-white px-8 py-8 shadow-sm">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-[color:var(--neutral-900)]">Activity Log</h1>
        <p className="mt-1 text-sm text-[color:var(--neutral-500)]">Track all research system activities and events</p>
      </header>

      <FilterTabs activeTab={activeTab} onTabChange={handleTabChange} />
      
      <ActivityLogTable activities={activities} loading={loading} />

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-[color:var(--neutral-500)]">
            Showing {pagination.total > 0 ? ((pagination.page - 1) * pagination.limit) + 1 : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-[color:var(--neutral-700)] bg-white border border-[color:var(--neutral-300)] rounded-md hover:bg-[color:var(--neutral-50)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-xs sm:text-sm text-[color:var(--neutral-700)]">
              Page {Math.min(pagination.page, pagination.totalPages)} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-[color:var(--neutral-700)] bg-white border border-[color:var(--neutral-300)] rounded-md hover:bg-[color:var(--neutral-50)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

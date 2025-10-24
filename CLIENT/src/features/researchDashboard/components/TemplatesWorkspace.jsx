import { useState, useEffect } from 'react';
import { api } from '../../../api/client.js';

export default function TemplatesWorkspace() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api('/templates');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load templates');
      }
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (template) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/templates/${template.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = template.filename || `${template.type}_template.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Download failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Document Templates</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading templates...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Document Templates</h1>
        </div>
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Document Templates</h1>
          <p className="text-sm text-gray-600">Browse and download document templates for your research</p>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No templates available</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {template.type?.replace(/_/g, ' ') || 'Template'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Version {template.version || '1.0'}
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {template.type || 'Document'}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Download this template to use as a starting point for your {template.type?.toLowerCase() || 'document'}.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {template.created_at ? new Date(template.created_at).toLocaleDateString() : 'Unknown date'}
                </div>
                <button
                  onClick={() => handleDownload(template)}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

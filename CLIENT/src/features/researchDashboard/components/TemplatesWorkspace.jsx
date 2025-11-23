import { useState, useEffect, useMemo } from 'react';
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

  // Remove duplicate Thesis templates, keeping only the first one
  const uniqueTemplates = useMemo(() => {
    const seenThesis = new Set();
    return templates.filter((template) => {
      const type = (template.type || '').toLowerCase().trim();
      if (type === 'thesis') {
        if (seenThesis.has('thesis')) {
          return false; // Skip duplicate thesis
        }
        seenThesis.add('thesis');
      }
      return true;
    });
  }, [templates]);


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
          <p className="text-sm text-gray-600">Browse and open document templates for your research</p>
        </div>
      </div>

      {uniqueTemplates.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No templates available</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {uniqueTemplates.map((template) => (
            <div key={template._id || template.id || `${template.type}-${template.version}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                  {template.url ? (
                    <>Open this template to use as a starting point for your {template.type?.toLowerCase() || 'document'}.</>
                  ) : (
                    <>Template link not available.</>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {template.created_at ? new Date(template.created_at).toLocaleDateString() : 'Unknown date'}
                </div>
                {template.url ? (
                  <a
                    href={template.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium text-[color:var(--brand-600)] hover:text-[color:var(--brand-700)] hover:underline transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Template
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">No link available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

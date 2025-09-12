import React, { useEffect, useState } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { api, getToken } from './api/client.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      setLoading(true);
      try {
        if (!getToken()) return;
        const res = await api('/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  if (loading && !user) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!user) return <Login onLogin={setUser} />;
  return <Dashboard user={user} />;
}


import React from 'react';

export default function Dashboard({ user }) {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Dashboard</h2>
      <p>Welcome {user?.email || 'user'}!</p>
      <p>Use Swagger at <a href="http://localhost:4000/docs" target="_blank">API Docs</a>.</p>
    </div>
  );
}


import React, { useState } from 'react';
import { api, setToken } from '../api/client.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@hilcoe.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setToken(data.token);
      onLogin?.(data.user);
    } catch (err) {
      setError(err.message || 'Login error');
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '64px auto', fontFamily: 'sans-serif' }}>
      <h2>HiLCoE-RMS Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%' }} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}


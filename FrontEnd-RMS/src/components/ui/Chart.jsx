import React from 'react'
import {
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ProgressChart = ({labels, series}) => {
   const chartData = labels.map((label, index) => {
    const entry = { name: label };
    series.forEach((s) => {
      entry[s.name] = s.data[index];
    });
    return entry;
  });
  
  return (
    <article className="card rounded-card  bg-white shadow-soft px-3 py-2 w-200 h-47">
      <h2 className="h3 text-[color:var(--neutral-900)]">Research Progress Overview</h2>
      <p className="body mt-1 text-[color:var(--neutral-600)]">Track your submission and approval rates over time.</p>
      <div className="mt-3 h-[290px]">
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-600)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--brand-600)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-500)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--accent-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
            <XAxis dataKey="name" stroke="rgba(15,23,42,0.5)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(15,23,42,0.5)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Area type="monotone" dataKey="Submissions" stroke="var(--brand-600)" fill="url(#colorA)" />
            <Area type="monotone" dataKey="Approvals" stroke="var(--accent-500)" fill="url(#colorB)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default ProgressChart
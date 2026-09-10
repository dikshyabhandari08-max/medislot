import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';

const COLORS = ['#facc15', '#22c55e', '#ef4444']; // pending, completed, cancelled

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Reports = () => {
  const [statusData, setStatusData] = useState([]);
  const [doctorData, setDoctorData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [statusRes, doctorRes, monthlyRes] = await Promise.all([
          axios.get('http://localhost:4000/api/reports/status-summary'),
          axios.get('http://localhost:4000/api/reports/doctor-summary'),
          axios.get('http://localhost:4000/api/reports/monthly')
        ]);
        setStatusData(statusRes.data);
        setDoctorData(doctorRes.data);
        setYearlyData(reshapeByYear(monthlyRes.data));
      } catch (err) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Turns [{month:'2025-01', count:9}, {month:'2026-09', count:3}, ...]
  // into [{ monthLabel:'Jan', '2025':9, '2026':null }, ...]
  const reshapeByYear = (rawData) => {
    const table = {};

    MONTH_LABELS.forEach((label, index) => {
      table[label] = { monthLabel: label, monthIndex: index };
    });

    rawData.forEach((row) => {
      const [year, month] = row.month.split('-');
      const monthLabel = MONTH_LABELS[parseInt(month, 10) - 1];
      if (table[monthLabel]) {
        table[monthLabel][year] = row.count;
      }
    });

    return Object.values(table).sort((a, b) => a.monthIndex - b.monthIndex);
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading reports...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-10">Reports & Analytics</h1>

      {/* Pie Chart: Appointment Status */}
      <div className="bg-white border rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Status Breakdown</h2>
        {statusData.length === 0 ? (
          <p className="text-gray-500">No appointment data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.status}: ${entry.count}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar Chart: Appointments per Doctor */}
      <div className="bg-white border rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointments per Doctor</h2>
        {doctorData.length === 0 ? (
          <p className="text-gray-500">No doctor data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={doctorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="doctor_name" angle={-15} textAnchor="end" height={60} interval={0} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Line Chart: Year-over-Year Comparison */}
      <div className="bg-white border rounded-xl p-6 mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointments: 2025 vs 2026</h2>
        {yearlyData.length === 0 ? (
          <p className="text-gray-500">No appointment trend data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="2025" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} connectNulls />
              <Line type="monotone" dataKey="2026" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Reports;
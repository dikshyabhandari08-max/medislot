import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const doctor = JSON.parse(localStorage.getItem('doctor') || '{}');

  useEffect(() => {
    if (!token || localStorage.getItem('role') !== 'doctor') {
      navigate('/login');
      return;
    }
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/appointments/doctor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:4000/api/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments(); // refresh list
    } catch (err) {
      alert('Failed to update appointment');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading appointments...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {doctor.name}</h1>
          <p className="text-gray-500 text-sm">{doctor.speciality}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-gray-800">{appt.patient_name}</p>
                <p className="text-sm text-gray-500">{appt.patient_email}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(appt.appointment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at {appt.appointment_time}
                </p>
                <span
                  className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${
                    appt.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : appt.status === 'cancelled'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  {appt.status}
                </span>
              </div>

              {appt.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(appt.id, 'completed')}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateStatus(appt.id, 'cancelled')}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
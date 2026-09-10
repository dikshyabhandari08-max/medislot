import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/appointments/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      setError('Failed to load your appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Please log in to view your appointments.');
      setLoading(false);
      return;
    }
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    } catch (err) {
      alert('Could not cancel appointment. Please try again.');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">You have no upcoming appointments.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={appt.image || 'https://via.placeholder.com/60x60.png?text=Dr'}
                  alt={appt.doctor_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                />
                <div>
                  <h2 className="font-semibold text-gray-800">{appt.doctor_name}</h2>
                  <p className="text-sm text-blue-500">{appt.speciality}</p>
                  <p className="text-sm text-gray-500">
                    {appt.appointment_date} at {appt.appointment_time}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCancel(appt.id)}
                className="text-red-500 border border-red-300 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;


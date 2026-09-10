import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Appointment = () => {
  const { docId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/doctors/${docId}`
        );
        setDoctor(res.data);
      } catch (err) {
        setError('Could not load doctor details.');
      }
    };

    fetchDoctor();
  }, [docId]);

  const handleBooking = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!date || !time) {
      setError('Please select both date and time.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must be logged in to book an appointment.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post(
        'http://localhost:4000/api/appointments',
        {
          doctor_id: docId,
          appointment_date: date,
          appointment_time: time
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Appointment booked! Please complete payment below.');
      setAppointmentId(res.data.id);

    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Booking failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:4000/api/appointments/${appointmentId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaid(true);
      setTimeout(() => navigate('/my-appointments'), 1000);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (error && !doctor) {
    return (
      <div className="text-center py-20 text-red-500">
        {error}
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Doctor Information */}
      <div className="bg-white rounded-xl shadow-md p-6 flex gap-6 items-center mb-8">

        <img
          src={
            doctor.image ||
            'https://via.placeholder.com/100x100.png?text=Dr'
          }
          alt={doctor.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
        />

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {doctor.name}
          </h1>

          <p className="text-blue-500">
            {doctor.speciality || 'General Physician'}
          </p>

          <p className="text-gray-600 text-sm mt-1">
            Consultation Fee: <span className="font-semibold">Rs. {doctor.fees}</span>
          </p>
        </div>

      </div>

      {/* Appointment Form */}
      <form
        onSubmit={handleBooking}
        className="bg-white rounded-xl shadow-md p-6 space-y-4"
      >

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Book an Appointment
        </h2>

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-600 text-sm">
            {success}
          </p>
        )}

        {/* Date */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Date
          </label>

          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Time
          </label>

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Confirm Booking Button */}
        <button
          type="submit"
          disabled={submitting || appointmentId}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-2 rounded-lg font-medium transition"
        >
          {submitting ? 'Booking...' : appointmentId ? 'Booked' : 'Confirm Booking'}
        </button>

        {/* Pay Now Button */}
        {appointmentId && !paid && (
          <button
            type="button"
            disabled={paying}
            onClick={handlePayment}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white py-2 rounded-lg font-medium transition"
          >
            {paying ? 'Processing payment...' : `Pay Rs. ${doctor.fees} Now`}
          </button>
        )}

        {paid && (
          <p className="text-green-600 text-sm text-center">
            Payment successful! Redirecting...
          </p>
        )}

      </form>

    </div>
  );
};

export default Appointment;
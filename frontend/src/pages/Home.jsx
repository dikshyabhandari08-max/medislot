import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const specialities = [
  'General Physician',
  'Dermatologist',
  'Gynecologist',
  'Pediatrician',
  'Neurologist',
  'Gastroenterologist',
];

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/doctors');
        setDoctors(res.data.slice(0, 4)); // just show a few on the homepage
      } catch (err) {
        console.error('Failed to load doctors for homepage');
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary/10 rounded-2xl px-6 py-16 md:py-24 flex flex-col items-center text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 max-w-2xl">
          Book Appointments With Trusted Doctors, Instantly
        </h1>
        <p className="text-gray-600 max-w-xl mb-8">
          Browse our network of specialists, pick a time that works for you, and manage all your appointments in one place.
        </p>
        <button
          onClick={() => navigate('/doctors')}
          className="bg-primary hover:opacity-90 text-white px-8 py-3 rounded-full font-medium transition"
        >
          Book Appointment
        </button>
      </div>

      {/* Browse by Speciality */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          Browse by Speciality
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Find the right specialist for your needs
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {specialities.map((spec) => (
            <button
              key={spec}
              onClick={() => navigate(`/doctors/${spec}`)}
              className="border border-primary text-primary hover:bg-primary hover:text-white px-5 py-2 rounded-full text-sm font-medium transition"
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Top Doctors Preview */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          Top Doctors to Book
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Simply browse through our extensive list of trusted doctors
        </p>

        {doctors.length === 0 ? (
          <p className="text-center text-gray-400">Loading doctors...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 flex flex-col items-center text-center cursor-pointer"
                onClick={() => navigate(`/appointment/${doc.id}`)}
              >
                {doc.image ? (
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mb-4 border-4 border-primary/20 bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold">
                    {doc.name?.charAt(0) || 'D'}
                  </div>
                )}
                <h3 className="text-md font-semibold text-gray-800">{doc.name}</h3>
                <p className="text-primary text-sm">{doc.speciality || 'General Physician'}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/doctors')}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-full text-sm font-medium transition"
          >
            View All Doctors
          </button>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-primary rounded-2xl px-6 py-12 flex flex-col items-center text-center text-white mb-10">
        <h2 className="text-2xl font-semibold mb-3">Don't have an account yet?</h2>
        <p className="mb-6 opacity-90">Create your MediSlot account to start booking appointments</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-white text-primary px-6 py-2 rounded-full font-medium hover:opacity-90 transition"
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { speciality } = useParams();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/doctors');
        setDoctors(res.data);
      } catch (err) {
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = speciality
    ? doctors.filter((doc) => doc.speciality === speciality)
    : doctors;

  if (loading) return <div className="text-center py-20 text-gray-500">Loading doctors...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        {speciality ? speciality : 'All Doctors'}
      </h1>

      {filteredDoctors.length === 0 ? (
        <p className="text-gray-500">No doctors available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 flex flex-col items-center text-center"
            >
              <img
                src={doc.image || 'https://via.placeholder.com/120x120.png?text=Dr'}
                alt={doc.name}
                className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-blue-100"
              />
              <h2 className="text-lg font-semibold text-gray-800">{doc.name}</h2>
              <p className="text-blue-500 text-sm mb-4">{doc.speciality || 'General Physician'}</p>
              <button
                onClick={() => navigate(`/appointment/${doc.id}`)}
                className="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
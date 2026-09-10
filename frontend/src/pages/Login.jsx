import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (role === 'doctor') {
        const res = await axios.post('http://localhost:4000/api/auth/doctor-login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('doctor', JSON.stringify(res.data.doctor));
        localStorage.setItem('role', 'doctor');
        navigate('/doctor-dashboard');
        return;
      }

      if (isLogin) {
        const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('role', 'patient');
        navigate('/');
      } else {
        const res = await axios.post('http://localhost:4000/api/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', 'patient');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className='min-h-[80vh] flex items-center justify-center'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 p-8 border rounded-xl w-96 shadow-lg'>

        {/* Role toggle */}
        <div className='flex border rounded-full overflow-hidden mb-2'>
          <button
            type='button'
            onClick={() => { setRole('patient'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium transition ${role === 'patient' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
          >
            Patient
          </button>
          <button
            type='button'
            onClick={() => { setRole('doctor'); setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium transition ${role === 'doctor' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}
          >
            Doctor
          </button>
        </div>

        <h2 className='text-2xl font-semibold'>
          {role === 'doctor' ? 'Doctor Login' : isLogin ? 'Login' : 'Create Account'}
        </h2>

        {error && <p className='text-red-500 text-sm'>{error}</p>}

        {role === 'patient' && !isLogin && (
          <input
            type='text'
            placeholder='Full Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border rounded px-3 py-2'
            required
          />
        )}

        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='border rounded px-3 py-2'
          required
        />

        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='border rounded px-3 py-2'
          required
        />

        <button type='submit' className='bg-primary text-white py-2 rounded'>
          {role === 'doctor' ? 'Login' : isLogin ? 'Login' : 'Create Account'}
        </button>

        {role === 'patient' && (
          <p className='text-sm text-center'>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className='text-primary cursor-pointer underline'
            >
              {isLogin ? 'Sign up' : 'Login'}
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
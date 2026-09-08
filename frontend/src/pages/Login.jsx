
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      } else {
        const res = await axios.post('http://localhost:4000/api/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className='min-h-[80vh] flex items-center justify-center'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 p-8 border rounded-xl w-96 shadow-lg'>
        <h2 className='text-2xl font-semibold'>{isLogin ? 'Login' : 'Create Account'}</h2>

        {error && <p className='text-red-500 text-sm'>{error}</p>}

        {!isLogin && (
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
          {isLogin ? 'Login' : 'Create Account'}
        </button>

        <p className='text-sm text-center'>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className='text-primary cursor-pointer underline'
          >
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
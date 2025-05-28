import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../services/helper';

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${config.BASE_URL}/login`, formData);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <form
        onSubmit={onSubmit}
        className="relative z-10 bg-white/10 backdrop-blur-md shadow-xl rounded-2xl p-8 md:p-10 w-full max-w-md transition-all duration-300 animate-fadeIn"
      >
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h1>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm text-white mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white/80"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm text-white mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white/80"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Login
        </button>

        <p className="text-sm text-center text-white mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-300 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

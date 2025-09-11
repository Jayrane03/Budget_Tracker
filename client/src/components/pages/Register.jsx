import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../services/helper';
import '../../Styles/pages.css';
import { AuthContext } from '../AuthContext';
import { Alert } from '@mui/material';

const Register = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const [alert, setAlert] = useState({ message: '', severity: '' });

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { name, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setAlert({ message: 'Passwords do not match', severity: 'error' });
      return;
    }

    try {
      const newUser = { name, email, password };
      const res = await axios.post(`${config.BASE_URL}/api/auth/register`, newUser);

      login(res.data.token, res.data.user);
      setAlert({ message: 'Registration successful!', severity: 'success' });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setTimeout(() => {
        setAlert({ message: err.response?.data?.message || 'Registration failed', severity: 'error' });
      }, 1000);
    }
  };

  return (
  <div className="neon-register">
  <form className="neon-register-form" onSubmit={onSubmit}>
    <h2 className="neon-title">Create Account</h2>

    {alert.message && (
      <Alert severity={alert.severity} style={{ marginBottom: '1rem' }}>
        {alert.message}
      </Alert>
    )}

    <div className="neon-field">
      <label>Name</label>
      <input type="text" name="name" value={name} onChange={onChange} placeholder="Your Name" required />
    </div>

    <div className="neon-field">
      <label>Email</label>
      <input type="email" name="email" value={email} onChange={onChange} placeholder="you@example.com" required />
    </div>

    <div className="neon-field">
      <label>Password</label>
      <input type="password" name="password" value={password} onChange={onChange} placeholder="••••••••" required />
    </div>

    <div className="neon-field">
      <label>Confirm Password</label>
      <input type="password" name="password2" value={password2} onChange={onChange} placeholder="••••••••" required />
    </div>

    <button type="submit" className="neon-btn">Register</button>

    <p className="neon-redirect">
      Already have an account? <Link to="/login">Login</Link>
    </p>
  </form>
</div>


  );
};

export default Register;

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
    <div className="register-container">
      <div className="register-image">
        <img src="/Illustration/rev.png" alt="AI Registration Illustration" />
      </div>

      <form className="register-form" onSubmit={onSubmit}>
        <h2>Create Your Account</h2>

        {/* Alert Section */}
        {alert.message && (
          <Alert severity={alert.severity} style={{ marginBottom: '1rem' }}>
            {alert.message}
          </Alert>
        )}

        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={name} onChange={onChange} placeholder="Name" required autoComplete="name" />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={email} onChange={onChange} placeholder="you@example.com" required autoComplete="email" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={password} onChange={onChange} placeholder="••••••••" required minLength="6" autoComplete="new-password" />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" name="password2" value={password2} onChange={onChange} placeholder="••••••••" required minLength="6" autoComplete="new-password" />
        </div>

        <button type="submit" className="btn">Register</button>

        <p className="redirect">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

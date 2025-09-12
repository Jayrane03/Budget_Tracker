import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../services/helper';
import { AuthContext } from '../AuthContext';
import '../../Styles/pages.css';
import { Alert, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${config.BASE_URL}/api/auth/login`, formData);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="coinbg"></div>
      <div className="login-overlay"></div>
      <div className="gold_Coin"></div>

      {/* MUI Alert */}
      <Collapse in={!!error} sx={{ width: '100%', mb: 2 }}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError('')}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Collapse>

      <form onSubmit={onSubmit} className="login-form">
        <h1 className="login-title" id="login">Welcome Back</h1>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            value={email}
            onChange={onChange}
            required
            className="form-input"
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={onChange}
            required
            className="form-input"
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="login-button">Login</button>
        <p className="login-register-text">
          Don't have an account?{' '}
          <Link to="/register" className="register-link">Register</Link>
        </p>
      </form>

      <div className="bg-shapes">
        <span className="shape"></span>
        <span className="shape"></span>
        <span className="shape"></span>
        <span className="shape"></span>
        <span className="shape"></span>
        <span className="shape"></span>
        <span className="shape"></span>
      </div>
    </div>
  );
};

export default Login;

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../services/helper';
import { AuthContext } from '../AuthContext'; // Import AuthContext
import '../../Styles/pages.css'; // Ensure you have the animations CSS file
import BudgetScene from '../../threejs/BudgetScene'; // Import the 3D scene component
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login } = useContext(AuthContext); // Get login function from context
  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${config.BASE_URL}/api/auth/login`, formData);
      // Call the login function from AuthContext
      login(res.data.token, res.data.user); // Pass both token and user data
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="coinbg">
        
      </div>
      <div className="login-overlay"></div>
     
      <div className="gold_Coin">

      </div>
      
      <form onSubmit={onSubmit} className="login-form">
        <h1 className="login-title" id='login'>Welcome Back</h1>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" name="email" placeholder="you@email.com"value={email} onChange={onChange} required className="form-input" autoComplete="email" />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" name="password" placeholder='••••••••' value={password} onChange={onChange} required className="form-input" autoComplete="current-password" />
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
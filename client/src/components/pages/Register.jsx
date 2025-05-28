import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../services/helper';
import '../../Styles/pages.css'; // Ensure you have the animations CSS file
import aiImage from '/login.jpg'; // Add your image to this path

const Register = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const navigate = useNavigate();
  const { name, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      alert('Passwords do not match');
      return;
    }

    try {
      const newUser = { name, email, password };
      const res = await axios.post(`${BASE_URL}/register`, newUser);
      localStorage.setItem('token', res.data.token);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      alert('Registration failed');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-image">
        <img src={aiImage} alt="AI Registration Illustration" />
      </div>

      <form className="register-form" onSubmit={onSubmit}>
        <h2>Create Your Account</h2>

        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={name} onChange={onChange} placeholder="John Doe" required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={email} onChange={onChange} placeholder="you@example.com" required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={password} onChange={onChange} placeholder="••••••••" required minLength="6" />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" name="password2" value={password2} onChange={onChange} placeholder="••••••••" required minLength="6" />
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

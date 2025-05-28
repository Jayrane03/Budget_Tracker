import { useState, useContext } from 'react'; // Add useContext here
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../services/helper';
import '../../Styles/pages.css'; // Ensure you have the animations CSS file
import aiImage from '/login.jpg'; // Add your image to this path
import { AuthContext } from '../AuthContext'; // Correct path to AuthContext

const Register = () => { // Removed setIsAuthenticated prop
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });

  const { login } = useContext(AuthContext); // Get the login function from AuthContext
  const navigate = useNavigate();
  const { name, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      alert('Passwords do not match'); // Consider using a custom modal instead of alert
      return;
    }

    try {
      const newUser = { name, email, password };
      const res = await axios.post(`${config.BASE_URL}/api/auth/register`, newUser);

      // Use the login function from AuthContext to handle token storage and state update
      login(res.data.token, res.data.user); 
      
      navigate('/dashboard');
    } catch (err) {
      alert('Registration failed'); // Consider using a custom modal instead of alert
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
          <input type="text" name="name" value={name} onChange={onChange} placeholder="John Doe" required autoComplete="name" />
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
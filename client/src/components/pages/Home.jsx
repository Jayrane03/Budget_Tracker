import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="landing">
      <div className="landing-inner">
        <h1>BudgetAI</h1>
        <p>Track your expenses and get AI-powered insights</p>
        <div className="buttons">
          <Link to="/register" className="btn btn-primary">Register</Link>
          <Link to="/login" className="btn">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

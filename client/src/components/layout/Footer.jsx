import React from 'react';
import '../../Styles/footer.css'; // Ensure path is correct

const Footer = () => {
  return (
    <div className="foot">
      <footer className="footer">
        {/* Budget Boost Banner */}
        <div className="start-learning">
          <div className="footer-start">
            <div className="texts">
              <h2 className="section-title">Boost your budgeting today</h2>
              <h3 className="section-sub-heading">
                <span>Just</span> <strong>less</strong>
                <span> your  </span> <strong>expenses</strong>
                <span> for better financial planning.</span>
              </h3>
            </div>
            <a href="/dashboard" className="button">
              <span className="label">Try the BudgetAI</span>
            </a>
            {/* <img
              className="illustration"
              src="/Illustration/illustration-student.png"
              alt="illustration"
              width="120"
              height="94"
            /> */}
          </div>
        </div>

        {/* Footer Links Section */}
        <div className="inner">
          <div className="column is-logo">
            <a href="#" className="main-logo">
              <div className="logo">
                <img src="/freepik__budget.png" alt="BudgetAI Logo" />
              </div>
              <div className="logo-info">
                <div className="text">BudgetAI</div>
                <span className="copyright">© 2025. All rights reserved.</span>
              </div>
            </a>
          </div>

          <div className="column is-nav">
            <div className="column-title">Navigation</div>
            <ul>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Sign Up</a></li>
            </ul>
          </div>

          <div className="column is-nav">
            <div className="column-title">Contact</div>
            <ul>
              <li><a href="#"><i className="fa fa-envelope-open"></i> info@budgetai.com</a></li>
              <li><a href="#"><i className="fa fa-twitter"></i> @budgetai</a></li>
            </ul>
            <div className="column-title">Tools</div>
            <ul>
              <li><a href="#">Budget Quiz</a></li>
            </ul>
          </div>

          <div className="column is-nav">
            <div className="column-title">Resources</div>
            <ul>
              <li><a href="#">Why budgeting matters</a></li>
              <li><a href="#">Smart saving tips</a></li>
              <li><a href="#">Track expenses efficiently</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
    
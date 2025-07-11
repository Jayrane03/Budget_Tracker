// import React from 'react'
import Spline from "@splinetool/react-spline";
import { Typography } from "@mui/material";
import "../../Styles/about.css"
const About = () => {
  return (
    <>  
       <div className="about">
        <Typography variant="h3" className="abt-head" sx={{ fontWeight: 'bold', mb: 6 }}>
            BUdgetAI Your Smart Budget Companion
          </Typography>

          <div className="about-cn">
            <div className="abt-text">
               <Typography className="glow-text" variant="h6" sx={{ lineHeight: 1.8, mb: 2 }}>
                  At <strong>Budget AI Tracker</strong>, we believe managing your finances should be intuitive,
                  insightful, and stress-free.
                </Typography>
                <Typography className="glow-text" variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                  Our AI provides <strong>personalized insights</strong> and <strong>smart recommendations</strong> to guide your budgeting journey.
                </Typography>
                <Typography className="glow-text" variant="body2" sx={{ lineHeight: 1.8 }}>
                  Achieve financial clarity and take control — with Budget AI by your side.
                </Typography>
            </div>
            <div className="abt-img">
              <img src="/Illustration/ab_bud.jpg" alt="" />
            </div>
          </div>
       </div>
  

    
    </>
  )
}

export default About
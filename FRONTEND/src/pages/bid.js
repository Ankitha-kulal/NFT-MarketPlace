import React, { useState, useEffect } from 'react';

const Bid = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        let { days, hours, minutes, seconds } = prevTime;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else {
              hours = 23;
              if (days > 0) days--;
              else clearInterval(timer);
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container">
      <div className="card z-depth-5 card-hover" style={{ padding: '20px', borderRadius: '15px', boxShadow: '10px 10px 30px rgba(0,0,0,0.3)' }}>
        <div className="row valign-wrapper">
          {/* Left Side - Image */}
          <div className="col s5">
            <div className="card-image">
              <img src="/images/nft-banner.jpg" alt="NFT Art" className="responsive-img" style={{ borderRadius: '10px', transition: '0.3s', transform: 'scale(1)' }} />
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="col s7">
            <div className="row valign-wrapper">
              {/* Profile Picture */}
              <div className="col s2">
                <img src="/images/logo.png" alt="Creator" className="circle responsive-img" style={{ border: '2px solid #fff' }} />
              </div>
              {/* Name & Creator */}
              <div className="col s10">
                <h5 className="black-text">NFT Name</h5>
                <p className="grey-text">Creator: <span className="black-text">John Doe</span></p>
              </div>
            </div>



            {/* 3D Card Effect for Bid Info and Countdown Timer */}
            <div className="row" style={{ marginTop: '20px' }}>
              <div className="col s6 center-align">
                <div className="card-panel pink darken-2 white-text card-3d" style={{ borderRadius: '8px', padding: '10px' }}>
                  <p>Current Bid: <span style={{ color: '#ff9800' }}>9.09 ETH</span></p>
                </div>
              </div>
              <div className="col s6 center-align">
                <div className="card-panel purple darken-2 white-text card-3d" style={{ borderRadius: '8px', padding: '10px' }}>
                  <p>Ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="row" style={{ marginTop: '20px' }}>
              <div className="col s4">
                <a href="#" className="btn waves-effect waves-light blue darken-2" style={{ width: '100%', borderRadius: '20px' }}>
                  <i className="fas fa-gavel left"></i> Bid
                </a>
              </div>
              <div className="col s4">
                <a href="#" className="btn waves-effect waves-light green darken-2" style={{ width: '100%', borderRadius: '20px' }}>
                  <i className="fas fa-shopping-cart left"></i> Buy
                </a>
              </div>
              <div className="col s4">
                <a href="#" className="btn waves-effect waves-light red darken-2" style={{ width: '100%', borderRadius: '20px' }}>
                  <i className="fas fa-heart left"></i> Cart
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bid;

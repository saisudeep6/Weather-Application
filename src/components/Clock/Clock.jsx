import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hourDeg = time.getHours() * 30 + time.getMinutes() / 2;
  const minDeg = time.getMinutes() * 6 + time.getSeconds() / 10;
  const secDeg = time.getSeconds() * 6;

  return (
    <div className="clock w-[10vw]">
      <div className="hour" style={{ transform: `rotateZ(${hourDeg}deg)` }}></div>
      <div className="min" style={{ transform: `rotateZ(${minDeg}deg)` }}></div>
      <div className="sec" style={{ transform: `rotateZ(${secDeg}deg)` }}></div>
    </div>
  );
};

const ClockApp = () => {
  return (
    <div className="clock-container flex justify-center">
      <Clock />
    </div>
  );
};

export default ClockApp;

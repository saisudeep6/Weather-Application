import React, { useState, useEffect } from 'react';

const LocationInfo = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch current location using Geolocation API
    const fetchLocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Using OpenStreetMap Nominatim API for reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            if (!response.ok) {
              throw new Error('Failed to fetch location');
            }
            const data = await response.json();
            // Extracting only the locality name
            let locality = data.address?.county || data.address?.city || data.address?.state || data.address?.neighbourhood || 'Unknown';
            
            // Remove the word "mandal" if it exists
            locality = locality.replace(/\bmandal\b/gi, '').trim();
            
            setLocation(locality);
          } catch (error) {
            setError('Failed to fetch location');
          }
        },
        (error) => {
          setError(error.message);
        }
      );
    };

    fetchLocation();
  }, []);

  return (
    <div className='text-white'>
      {error && <p>{error}</p>}
      {location && <p>Your current location: {location}</p>}
    </div>
  );
};

export default LocationInfo;

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2 from './marker-icon-2x.png';
import markerShadow from './marker-shadow.png';
import markerIcon from './marker-icon.png';
// Fixing the default icon issue by pointing to local images
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const WeatherMap = ({ lat, lon }) => {
    return (
        <MapContainer
          center={[lat, lon]}
          zoom={13}
          style={{ height: '300px', width: '100%', borderRadius: '0.75rem' }} // Adding rounded corners
          className="shadow-lg rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[lat, lon]}>
            <Popup className="bg-gray-800 text-white rounded-lg p-2">
              Weather Location: {lat}, {lon}
            </Popup>
          </Marker>
        </MapContainer>
      );
    };

export default WeatherMap;

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2 from '../../assets/imgs/marker-icon-2x.png';
import markerShadow from '../../assets/imgs/marker-shadow.png';
import markerIcon from '../../assets/imgs/marker-icon.png';

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
      className="map-container shadow-lg rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lon]}>
        <Popup className="popup">
          Weather Location: {lat}, {lon}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default WeatherMap;

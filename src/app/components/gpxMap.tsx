import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import { LatLngTuple, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GPXMapProps {
  gpxUrl: string;
}

const parseGPX = (gpxData: string): [number, number][] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxData, 'application/xml');

  const trackPoints: [number, number][] = [];
  const trkpts = xmlDoc.getElementsByTagName('trkpt');
  
  for (let i = 0; i < trkpts.length; i++) {
    const lat = parseFloat(trkpts[i].getAttribute('lat') || '0');
    const lon = parseFloat(trkpts[i].getAttribute('lon') || '0');
    trackPoints.push([lat, lon]);
  }

  return trackPoints;
};

const calculateBounds = (points: LatLngTuple[]): LatLngBounds => {
  const latitudes = points.map(point => point[0]);
  const longitudes = points.map(point => point[1]);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  return new LatLngBounds([minLat, minLon], [maxLat, maxLon]);
};

const getZoom = (bounds: LatLngBounds) => {
  const distance = bounds.getNorthEast().distanceTo(bounds.getSouthWest());

  if (distance < 200) {
    return 18;
  } else if (distance < 1000) {
    return 17;
  } else if (distance < 5000) {
    return 15;
  } else if (distance < 7500) {
    return 14;
  } else if (distance < 15000) {
    return 13;
  } else {
    return 12;
  }
}

const GPXMap: React.FC<GPXMapProps> = ({ gpxUrl }) => {
  const [gpxData, setGpxData] = useState<[number, number][] | null>(null);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);

  useEffect(() => {
    const fetchGPX = async () => {
      try {
        const response = await fetch(gpxUrl);
        if (!response.ok) {
          throw new Error('Failed to load GPX file');
        }
        const data = await response.text();
        const trackPoints = parseGPX(data);
        setGpxData(trackPoints);

        const trackBounds = calculateBounds(trackPoints);
        setBounds(trackBounds);
      } catch (error) {
        console.error(error);
      }
    };

    fetchGPX();
  }, [gpxUrl]);

  if (!gpxData || !bounds) {
    return <div>Loading GPX data...</div>;
  }

  const center = bounds.getCenter();
  const zoom = getZoom(bounds);

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', margin: '0 auto' }}>
      <TileLayer url={`https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=keauScA4B5LMSBSWdUf_og2zqpGJRPmh5JTmobrqxh8`} />
      <Polyline positions={gpxData} />
    </MapContainer>
  );
};

export default GPXMap;
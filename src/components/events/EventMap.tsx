'use client';

import { useEffect, useRef } from 'react';
import styles from './EventMap.module.css';

interface EventMapProps {
  latitude: number;
  longitude: number;
  venueName?: string;
  zoom?: number;
}

/**
 * Event Map Component
 * Displays venue location on OpenStreetMap using Leaflet
 * Client-side only component (Leaflet requires browser environment)
 */
export function EventMap({ latitude, longitude, venueName, zoom = 15 }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Ensure mapRef.current still exists
      if (!mapRef.current) return;

      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Create map instance
      const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add marker for venue
      const marker = L.marker([latitude, longitude]).addTo(map);

      // Add popup with venue name (using textContent to prevent XSS)
      if (venueName) {
        const popup = L.popup();
        const div = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = venueName; // Safe: uses textContent instead of innerHTML
        div.appendChild(strong);
        popup.setContent(div);
        marker.bindPopup(popup).openPopup();
      }

      mapInstanceRef.current = map;
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [latitude, longitude, venueName, zoom]);

  return (
    <>
      {/* Leaflet CSS - needs to be loaded for proper marker display */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div ref={mapRef} className={styles.mapContainer}></div>
    </>
  );
}

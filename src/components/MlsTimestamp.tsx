'use client';

import { useState, useEffect } from 'react';

/**
 * Client component that fetches and displays the latest MLS API update timestamp.
 * This ensures the timestamp is real-time even on statically cached pages.
 */
export default function MlsTimestamp() {
  const [displayDate, setDisplayDate] = useState<string>("January 19, 2026 2:47 PM UTC");

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch('/api/mls-metadata');
        const data = await response.json();

        if (data.success && data.lastUpdated) {
          const date = new Date(data.lastUpdated);
          const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const month = months[date.getUTCMonth()];
          const day = date.getUTCDate();
          const year = date.getUTCFullYear();

          let hours = date.getUTCHours();
          const minutes = date.getUTCMinutes().toString().padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;

          setDisplayDate(`${month} ${day}, ${year} ${hours}:${minutes} ${ampm} UTC`);
        }
      } catch (error) {
        console.error('Failed to fetch MLS timestamp on client:', error);
      }
    }

    fetchMetadata();
  }, []);

  return <span>{displayDate}</span>;
}

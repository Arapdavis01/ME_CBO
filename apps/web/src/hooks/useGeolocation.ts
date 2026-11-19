"use client";

import { useCallback, useState } from "react";
import type { GeoPoint } from "@/types/events";

export function useGeolocation() {
  const [coords, setCoords] = useState<GeoPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const locate = useCallback(async (): Promise<GeoPoint | null> => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported on this device.");
      return null;
    }
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(point);
          setLoading(false);
          resolve(point);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
      );
    });
  }, []);

  return { coords, error, loading, locate };
}

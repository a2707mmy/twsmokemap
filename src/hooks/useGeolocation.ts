import { useCallback, useState } from 'react';
import { TAIPEI_CENTER } from '../lib/config';
import type { LatLng } from '../lib/types';

type GeoStatus = 'idle' | 'locating' | 'granted' | 'denied' | 'unavailable';

/**
 * 取得使用者定位。拒絕或失敗時 fallback 到台北市中心。
 */
export function useGeolocation() {
  const [center, setCenter] = useState<LatLng>(TAIPEI_CENTER);
  const [status, setStatus] = useState<GeoStatus>('idle');

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      setCenter(TAIPEI_CENTER);
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      () => {
        setStatus('denied');
        setCenter(TAIPEI_CENTER); // fallback
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  return { center, status, locate, setCenter };
}

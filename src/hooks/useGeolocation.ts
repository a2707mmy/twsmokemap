import { useCallback, useState } from 'react';
import { TAIPEI_CENTER } from '../lib/config';
import type { LatLng } from '../lib/types';

type GeoStatus = 'idle' | 'locating' | 'granted' | 'denied' | 'unavailable';

/**
 * 取得使用者定位。拒絕或失敗時 fallback 到台北市中心，並提供清楚的錯誤訊息。
 */
export function useGeolocation() {
  const [center, setCenter] = useState<LatLng>(TAIPEI_CENTER);
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  // 每次成功定位都遞增；地圖以此為訊號「強制平移到使用者位置」，
  // 即使座標與上次相同（例如使用者手動拖開地圖後再按定位）也會回到所在位置。
  const [locateTick, setLocateTick] = useState(0);

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      setMessage('此裝置或瀏覽器不支援定位功能。');
      setCenter(TAIPEI_CENTER);
      return;
    }
    setStatus('locating');
    setMessage(null);

    const onSuccess = (pos: GeolocationPosition) => {
      setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setStatus('granted');
      setMessage(null);
      setLocateTick((t) => t + 1);
    };

    const onError = (err: GeolocationPositionError) => {
      // 高精度失敗時，再用低精度試一次（室內 / 無 GPS 時較容易成功）
      if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
        navigator.geolocation.getCurrentPosition(onSuccess, onFinalError, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 120000,
        });
        return;
      }
      onFinalError(err);
    };

    const onFinalError = (err: GeolocationPositionError) => {
      setCenter(TAIPEI_CENTER);
      if (err.code === err.PERMISSION_DENIED) {
        setStatus('denied');
        setMessage('位置權限被拒。請點網址列旁的鎖頭圖示，允許「位置」存取後再試一次。');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setStatus('unavailable');
        setMessage('暫時無法取得位置（裝置定位服務可能未開啟）。已改以台北市中心顯示。');
      } else {
        setStatus('unavailable');
        setMessage('定位逾時，請再試一次。已改以台北市中心顯示。');
      }
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  }, []);

  return { center, status, message, locateTick, locate, setCenter };
}

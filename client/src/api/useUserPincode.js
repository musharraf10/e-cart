import { useEffect, useState } from "react";

const PIN_REGEX = /^[1-9][0-9]{5}$/;

export default function useUserPincode() {
  const [pincode, setPincode] = useState(null);
  const [source, setSource] = useState(null); // gps | google | ip | cache

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savePin = (code, src) => {
      if (!PIN_REGEX.test(code)) return;
      setPincode(code);
      setSource(src);
      localStorage.setItem(
        "noorfit_pincode",
        JSON.stringify({ code, src, ts: Date.now() }),
      );
    };

    // 🔥 CACHE with expiry (7 days)
    const cached = localStorage.getItem("noorfit_pincode");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const isFresh = Date.now() - parsed.ts < 7 * 24 * 60 * 60 * 1000;

        if (parsed.code && isFresh) {
          setPincode(parsed.code);
          setSource("cache");
        }
      } catch {}
    }

    // 🌍 GOOGLE GEOCODING (MAIN ACCURACY LAYER)
    const getFromGoogle = async (lat, lng) => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
        );
        const data = await res.json();

        const result = data.results?.[0];
        const comp = result?.address_components || [];

        const postal = comp.find((c) =>
          c.types.includes("postal_code"),
        )?.long_name;

        const country = comp.find((c) =>
          c.types.includes("country"),
        )?.short_name;

        if (country === "IN" && PIN_REGEX.test(postal)) {
          savePin(postal, "google");
        }
      } catch (e) {
        console.log("Google geocode failed", e);
      }
    };

    // 📡 IP fallback
    const getFromIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        if (data?.country_code === "IN" && PIN_REGEX.test(data?.postal)) {
          savePin(data.postal, "ip");
        }
      } catch (e) {
        console.log("IP failed", e);
      }
    };

    // 📍 GPS detection
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;

          // 🔥 Only trust high accuracy GPS
          if (accuracy && accuracy < 1500) {
            await getFromGoogle(latitude, longitude);
          } else {
            console.log("Low accuracy GPS → fallback");
            getFromIP();
          }
        },
        () => getFromIP(),
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        },
      );
    } else {
      getFromIP();
    }
  }, []);

  return { pincode, source };
}

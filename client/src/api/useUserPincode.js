import { useEffect, useState } from "react";

export default function useUserPincode() {
  const [pincode, setPincode] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("noorfit_pincode");
    if (saved) {
      setPincode(saved);
      return;
    }

    const savePin = (code) => {
      if (!code) return;
      setPincode(code);
      localStorage.setItem("noorfit_pincode", code);
    };

    const getPincodeFromCoords = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        );

        const data = await res.json();

        const code = data?.address?.postcode;
        const country = data?.address?.country_code;

        // accept only India
        if (country === "in" && code) {
          savePin(code);
        } else {
          console.log("Invalid country result:", country);
        }
      } catch (err) {
        console.log("Reverse geocode error:", err);
      }
    };

    const getIPLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        if (data?.country_code === "IN" && data?.postal) {
          savePin(data.postal);
        }
      } catch (err) {
        console.log("IP location error:", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;

          // ignore very rough locations (often wrong IP locations)
          if (accuracy && accuracy > 5000) {
            console.log("Low accuracy location ignored");
            getIPLocation();
            return;
          }

          getPincodeFromCoords(latitude, longitude);
        },
        () => {
          getIPLocation();
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      getIPLocation();
    }
  }, []);

  return pincode;
}

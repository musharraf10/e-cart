import { useEffect } from "react";

export function useShopScrollRestoration(storageKey = "shopScroll") {
  useEffect(() => {
    const savedScroll = Number(sessionStorage.getItem(storageKey) || 0);
    if (savedScroll > 0) {
      window.scrollTo(0, savedScroll);
    }

    const saveScroll = () => {
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };

    window.addEventListener("scroll", saveScroll, { passive: true });

    return () => {
      sessionStorage.setItem(storageKey, String(window.scrollY));
      window.removeEventListener("scroll", saveScroll);
    };
  }, [storageKey]);
}

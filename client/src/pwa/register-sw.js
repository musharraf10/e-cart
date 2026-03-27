function dispatchWindowEvent(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function requestServiceWorkerVersion(worker) {
  if (!worker) return;
  worker.postMessage({ type: "GET_SW_VERSION" });
}

function notifyUpdateAvailable(registration) {
  dispatchWindowEvent("sw:update-available", {
    registration,
  });
}

export function activateWaitingServiceWorker(registration) {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");

      if (registration.waiting) {
        notifyUpdateAvailable(registration);
      }

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;

        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            notifyUpdateAvailable(registration);
          }
        });
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        const { type, version } = event.data || {};

        if (type === "SW_ACTIVATED") {
          dispatchWindowEvent("sw:activated", { version });
        }

        if (type === "SW_VERSION") {
          dispatchWindowEvent("sw:version", { version });
        }
      });

      requestServiceWorkerVersion(registration.active || navigator.serviceWorker.controller);
    } catch (error) {
      console.error("SW registration failed", error);
    }
  });

  let hasRefreshed = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hasRefreshed) return;
    hasRefreshed = true;
    window.location.reload();
  });
}

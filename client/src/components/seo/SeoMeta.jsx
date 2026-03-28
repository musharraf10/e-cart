import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_IMAGE_PATH = "/favicon.ico";

const upsertMetaTag = ({ attr, key, content }) => {
  if (!key) return;

  const safeKey = key.replace(/"/g, "\\\"");
  const selector = `meta[${attr}="${safeKey}"]`;
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content || "");
};

const upsertCanonicalLink = (href) => {
  let canonical = document.head.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", href);
};

const toAbsoluteUrl = (urlLike) => {
  const origin = window.location.origin;
  if (!urlLike) return `${origin}${window.location.pathname}`;

  try {
    return new URL(urlLike, origin).toString();
  } catch {
    return `${origin}${window.location.pathname}`;
  }
};

const clampText = (value, maxLength = 160) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
};

export function SeoMeta({ title, description, canonicalUrl, type = "website", image, twitterCard = "summary_large_image" }) {
  const location = useLocation();

  const resolvedTitle = useMemo(() => clampText(title, 70), [title]);
  const resolvedDescription = useMemo(() => clampText(description, 160), [description]);
  const canonical = useMemo(() => toAbsoluteUrl(canonicalUrl || `${location.pathname}${location.search}`), [canonicalUrl, location.pathname, location.search]);
  const ogImage = useMemo(() => toAbsoluteUrl(image || DEFAULT_IMAGE_PATH), [image]);

  useEffect(() => {
    if (resolvedTitle) document.title = resolvedTitle;

    upsertMetaTag({ attr: "name", key: "description", content: resolvedDescription });

    upsertMetaTag({ attr: "property", key: "og:title", content: resolvedTitle });
    upsertMetaTag({ attr: "property", key: "og:description", content: resolvedDescription });
    upsertMetaTag({ attr: "property", key: "og:url", content: canonical });
    upsertMetaTag({ attr: "property", key: "og:type", content: type });
    upsertMetaTag({ attr: "property", key: "og:image", content: ogImage });

    upsertMetaTag({ attr: "name", key: "twitter:card", content: twitterCard });
    upsertMetaTag({ attr: "name", key: "twitter:title", content: resolvedTitle });
    upsertMetaTag({ attr: "name", key: "twitter:description", content: resolvedDescription });
    upsertMetaTag({ attr: "name", key: "twitter:image", content: ogImage });
    upsertMetaTag({ attr: "name", key: "twitter:url", content: canonical });

    upsertCanonicalLink(canonical);
  }, [canonical, location.key, ogImage, resolvedDescription, resolvedTitle, twitterCard, type]);

  return null;
}

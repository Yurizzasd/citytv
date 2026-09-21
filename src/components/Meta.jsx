import { useEffect } from 'react';

export default function Meta({ title, description, image, path = '/', type = 'website' }) {
  const site = 'CityTV';
  const fullTitle = title ? `${title} — ${site}` : 'CityTV — Assistir Animes Online';
  useEffect(() => {
    document.title = fullTitle;
    const set = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        if (sel.startsWith('meta[property')) el.setAttribute('property', sel.match(/"([^"]+)"/)[1]);
        else el.setAttribute('name', sel.match(/"([^"]+)"/)[1]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', 'content', description || 'Descubra e assista animes no CityTV.');
    set('meta[property="og:title"]', 'content', fullTitle);
    set('meta[property="og:description"]', 'content', description || '');
    set('meta[property="og:type"]', 'content', type);
    if (image) set('meta[property="og:image"]', 'content', image);
  }, [fullTitle, description, image, type, path]);
  return null;
}

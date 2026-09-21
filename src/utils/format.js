export function slugify(text) {
  return String(text || 'anime')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'anime';
}

export function animeSlug(title, anilistId) {
  return `${slugify(title)}-${anilistId}`;
}

// Extrai o AniList ID do final do slug: /anime/naruto-20 -> 20
export function parseAnimeSlug(slug) {
  const m = String(slug || '').match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}

export function stripHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(text, max = 180) {
  const t = String(text || '');
  return t.length > max ? `${t.slice(0, max - 1).trim()}…` : t;
}

export function formatScore(score) {
  if (score == null) return '—';
  return `${(Number(score) / 10).toFixed(1)}`;
}

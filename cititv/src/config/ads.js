// Slots de anúncio (AdCash). DESLIGADOS por padrão.
// Regras: no máximo 1 slot por página, nunca sobre o player, nunca entre episódios,
// nunca pop-up. Ative via VITE_ADCASH_ENABLED=true e preencha o script oficial.
export const adsConfig = {
  enabled: import.meta.env.VITE_ADCASH_ENABLED === 'true',
  scriptUrl: import.meta.env.VITE_ADCASH_SCRIPT_URL || '',
  slots: {
    homeBelowHero: 'ad-home-below-hero',
    browseMid: 'ad-browse-mid',
    animeBelowInfo: 'ad-anime-below-info',
    watchBelowPlayer: 'ad-watch-below-player',
  },
};

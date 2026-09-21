import { useEffect } from 'react';
import { adsConfig } from '../config/ads.js';

// Slot de anúncio AdCash — placeholder discreto.
// COM ADS DESLIGADOS: renderiza apenas um contêiner vazio (sem rede, sem layout shift grande).
// PARA ATIVAR: VITE_ADCASH_ENABLED=true + VITE_ADCASH_SCRIPT_URL + cole o código oficial
// do painel AdCash dentro de loadAd() (comentário abaixo).
export default function AdSlot({ id, label = 'Espaço publicitário' }) {
  useEffect(() => {
    if (!adsConfig.enabled || !adsConfig.scriptUrl) return;
    // TODO(ads): inserir aqui o snippet oficial do AdCash para este slot.
    // Exemplo:
    // const s = document.createElement('script');
    // s.src = adsConfig.scriptUrl; s.async = true;
    // document.getElementById(id)?.appendChild(s);
  }, [id]);

  if (!adsConfig.enabled) return null;
  return (
    <div className="ad-slot" id={id} role="complementary" aria-label={label}>
      {label} — AdCash ({id})
    </div>
  );
}

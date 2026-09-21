import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

// Player com HLS (hls.js) + MP4 nativo. Interface limpa e responsiva.
// Props: src {url,type,subtitles}, autoPlay, onEnded, title
export default function VideoPlayer({ src, autoPlay = true, onEnded, title }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const wrapRef = useRef(null);
  const progressRef = useRef(null);

  // Troca de fonte com limpeza correta do HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src?.url) return;
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const url = src.url;
    const type = (src.type || '').toLowerCase();
    const isHls = type === 'hls' || url.includes('.m3u8');

    // Legendas
    while (video.querySelector('track')) video.querySelector('track').remove();
    (src.subtitles || []).slice(0, 6).forEach((t, i) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = t.label || `Legenda ${i + 1}`;
      track.srclang = t.srclang || 'pt';
      track.src = t.url;
      if (t.default || i === 0) track.default = true;
      video.appendChild(track);
    });

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, backBufferLength: 60 });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        }
      });
    } else {
      video.src = url;
      if (autoPlay) video.play().catch(() => {});
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => hlsRef.current?.destroy(), []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  const seek = (e) => {
    const v = videoRef.current;
    const val = Number(e.target.value);
    if (v?.duration) v.currentTime = (val / 100) * v.duration;
  };
  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };
  const setVolume = (e) => {
    const v = videoRef.current;
    if (v) v.volume = Number(e.target.value);
  };
  const setQuality = (idx) => {
    const hls = hlsRef.current;
    if (hls) hls.currentLevel = Number(idx); // -1 = auto
  };
  const levels = hlsRef.current?.levels || [];

  return (
    <div>
      <div ref={wrapRef} style={{ background: '#000' }}>
        <video
          ref={videoRef}
          controls={false}
          playsInline
          preload="metadata"
          aria-label={title || 'Player'}
          onClick={toggle}
          onEnded={onEnded}
          crossOrigin="anonymous"
        />
      </div>
      <div className="player-bar" role="toolbar" aria-label="Controles do player">
        <button className="primary" onClick={toggle}>⏯ Play/Pause</button>
        <input className="progress" ref={progressRef} type="range" min="0" max="100" defaultValue="0"
          onChange={seek}
          onInput={(e) => {
            const v = videoRef.current;
            if (v?.duration) {
              const p = (v.currentTime / v.duration) * 100;
              e.target.value = p;
            }
          }}
          aria-label="Progresso" />
        <input type="range" min="0" max="1" step="0.05" defaultValue="1" onChange={setVolume} aria-label="Volume" style={{ maxWidth: 110 }} />
        <button onClick={fullscreen}>⛶ Fullscreen</button>
        {levels.length > 1 && (
          <select onChange={(e) => setQuality(e.target.value)} aria-label="Qualidade" defaultValue="-1">
            <option value="-1">Auto</option>
            {levels.map((l, i) => (
              <option key={i} value={i}>{l.height ? `${l.height}p` : `Nível ${i + 1}`}</option>
            ))}
          </select>
        )}
      </div>
      <PlayerTicker videoRef={videoRef} progressRef={progressRef} />
    </div>
  );
}

import { useEffect as useEff } from 'react';
function PlayerTicker({ videoRef, progressRef }) {
  useEff(() => {
    const id = setInterval(() => {
      const v = videoRef.current;
      const bar = progressRef.current;
      if (v?.duration && bar && document.activeElement !== bar) {
        bar.value = String((v.currentTime / v.duration) * 100);
      }
    }, 500);
    return () => clearInterval(id);
  }, [videoRef, progressRef]);
  return null;
}

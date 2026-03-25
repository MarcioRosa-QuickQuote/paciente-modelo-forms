'use client';

import { useEffect, useMemo, useState } from 'react';
import { getDirectGoogleMapEmbedUrl, needsGoogleMapsResolution } from '@/lib/google-maps';

interface Props {
  address?: string;
  mapsUrl?: string;
  title?: string;
  iframeClassName: string;
  fallbackClassName: string;
}

export default function GoogleMapEmbed({
  address,
  mapsUrl,
  title = 'Mapa',
  iframeClassName,
  fallbackClassName,
}: Props) {
  const candidate = useMemo(() => mapsUrl?.trim() || address?.trim() || '', [address, mapsUrl]);
  const directSrc = useMemo(() => getDirectGoogleMapEmbedUrl(address, mapsUrl), [address, mapsUrl]);
  const [resolvedSrc, setResolvedSrc] = useState(directSrc);
  const [status, setStatus] = useState<'idle' | 'resolving' | 'error'>(directSrc ? 'idle' : 'error');

  useEffect(() => {
    let cancelled = false;

    if (!candidate) {
      setResolvedSrc('');
      setStatus('idle');
      return () => { cancelled = true; };
    }

    if (directSrc) {
      setResolvedSrc(directSrc);
      setStatus('idle');
      return () => { cancelled = true; };
    }

    if (!needsGoogleMapsResolution(address, mapsUrl)) {
      setResolvedSrc('');
      setStatus('error');
      return () => { cancelled = true; };
    }

    setResolvedSrc('');
    setStatus('resolving');

    fetch(`/api/maps-resolve?url=${encodeURIComponent(candidate)}`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.embedUrl) {
          throw new Error(data.error || 'Nao foi possivel carregar o mapa');
        }
        if (!cancelled) {
          setResolvedSrc(data.embedUrl);
          setStatus('idle');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedSrc('');
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [address, candidate, directSrc, mapsUrl]);

  if (!candidate) {
    return <div className={fallbackClassName}>Informe o endereco para exibir o mapa.</div>;
  }

  if (resolvedSrc) {
    return (
      <iframe
        title={title}
        src={resolvedSrc}
        className={iframeClassName}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className={fallbackClassName}>
      {status === 'resolving'
        ? 'Carregando mapa...'
        : 'Nao foi possivel carregar este link do mapa. Use o endereco completo ou o link de compartilhamento do Google Maps.'}
    </div>
  );
}

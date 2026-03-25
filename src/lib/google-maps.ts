function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractGoogleMapsQueryFromUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const queryParam = url.searchParams.get('q') || url.searchParams.get('query');
    if (queryParam?.trim()) return queryParam.trim();

    const decodedPath = safeDecode(`${url.pathname}${url.search}`);
    const atMatch = decodedPath.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (atMatch) return `${atMatch[1]},${atMatch[2]}`;

    const dataCoordsMatch = decodedPath.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (dataCoordsMatch) return `${dataCoordsMatch[1]},${dataCoordsMatch[2]}`;

    const placeMatch = url.pathname.match(/\/(?:maps\/)?place\/([^/]+)/i);
    if (placeMatch?.[1]) {
      return safeDecode(placeMatch[1]).replace(/\+/g, ' ');
    }
  } catch {
    return rawUrl;
  }

  return rawUrl;
}

function getMapCandidate(address?: string, mapsUrl?: string): string {
  const explicitUrl = mapsUrl?.trim();
  if (explicitUrl) return explicitUrl;
  return address?.trim() || '';
}

export function needsGoogleMapsResolution(address?: string, mapsUrl?: string): boolean {
  const candidate = getMapCandidate(address, mapsUrl);
  if (!candidate || !isHttpUrl(candidate)) return false;

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    return host.includes('maps.app.goo.gl') || host === 'goo.gl' || host === 'goo.gl.com';
  } catch {
    return false;
  }
}

export function getDirectGoogleMapEmbedUrl(address?: string, mapsUrl?: string): string {
  const candidate = getMapCandidate(address, mapsUrl);
  if (!candidate) return '';

  if (/output=embed/i.test(candidate) || /\/maps\/embed/i.test(candidate)) {
    return candidate;
  }

  if (needsGoogleMapsResolution(address, mapsUrl)) {
    return '';
  }

  const query = isHttpUrl(candidate)
    ? extractGoogleMapsQueryFromUrl(candidate)
    : candidate;

  if (!query.trim()) return '';

  return `https://maps.google.com/maps?q=${encodeURIComponent(query.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

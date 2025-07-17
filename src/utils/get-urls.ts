const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:51733';

export function getAssetUrl(assetUrl: string): string {
  const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(assetUrl);
  return isAbsolute ? assetUrl : `${APP_URL}${assetUrl}`;
}

export function getApiUrl(apiUrl: string): string {
  const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(apiUrl);
  return isAbsolute ? apiUrl : `${APP_URL}${apiUrl}`;
}

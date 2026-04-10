const SITE_ORIGIN = 'https://lightchain.ai';

export function resolveTarget(href: string, jsonTarget?: '_blank'): '_blank' | undefined {
  if (jsonTarget === '_blank') return '_blank';
  if (!href || href.startsWith('#') || href.startsWith('/')) return undefined;
  try {
    const linkHost = new URL(href).hostname;
    const siteHost = new URL(SITE_ORIGIN).hostname;
    return linkHost === siteHost ? undefined : '_blank';
  } catch {
    return undefined;
  }
}

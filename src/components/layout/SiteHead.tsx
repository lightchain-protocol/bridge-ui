import Head from 'next/head';
import {
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_NAME,
  APP_OG_IMAGE,
  APP_ORIGIN,
  APP_TITLE,
  APP_TWITTER,
} from '../../consts/app';

/**
 * Page metadata. Rendered from _app *outside* the client-only gate, so it is in the server HTML
 * that search engines and link previews (X, Discord, Telegram) read; they don't run the app.
 */
export function SiteHead() {
  return (
    <Head>
      {/* https://nextjs.org/docs/messages/no-document-viewport-meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{APP_TITLE}</title>
      <meta name="description" content={APP_DESCRIPTION} />
      <meta name="keywords" content={APP_KEYWORDS} />
      <link rel="canonical" href={`${APP_ORIGIN}/`} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:url" content={`${APP_ORIGIN}/`} />
      <meta property="og:title" content={APP_TITLE} />
      <meta property="og:description" content={APP_DESCRIPTION} />
      <meta property="og:image" content={APP_OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="LCAI Bridge: buy and bridge ETH to Lightchain AI" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={APP_TWITTER} />
      <meta name="twitter:title" content={APP_TITLE} />
      <meta name="twitter:description" content={APP_DESCRIPTION} />
      <meta name="twitter:image" content={APP_OG_IMAGE} />
    </Head>
  );
}

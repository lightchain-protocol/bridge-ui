import { Head, Html, Main, NextScript } from 'next/document';
import { APP_NAME, BRAND_COLOR, MAIN_FONT } from '../consts/app';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color={BRAND_COLOR} />
        <link rel="shortcut icon" href="/favicon.png" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />

        <meta name="application-name" content={APP_NAME} />
        <meta name="HandheldFriendly" content="true" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Title, description, keywords, Open Graph and Twitter tags: src/components/layout/SiteHead.tsx */}
      </Head>
      <body className={`${MAIN_FONT.variable} font-sans text-black`}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

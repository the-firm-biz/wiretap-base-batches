import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
/**
 * Declare all
 * @todo Bigeon - add real font families. This is an example implementation.
 */
export const arialNarrow = localFont({
  variable: '--font-sans-narrow',
  src: [
    {
      path: '../../../public/fonts/ArialNarrow.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/ArialNarrowBold.woff2',
      weight: '700',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/ArialNarrowItalic.woff2',
      weight: '400',
      style: 'italic'
    },
    {
      path: '../../../public/fonts/ArialNarrowBoldItalic.woff2',
      weight: '700',
      style: 'italic'
    }
  ]
});

// Shadcn defaults
export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});
// End shadcn defaults

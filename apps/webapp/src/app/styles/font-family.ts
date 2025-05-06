import localFont from 'next/font/local';
/**
 * Declare all
 */
export const departureMono = localFont({
  variable: '--font-mono',
  src: [
    {
      path: '../../../public/fonts/DepartureMono-Regular.woff2',
      weight: '400',
      style: 'normal'
    }
  ]
});

export const loRes12 = localFont({
  variable: '--font-sans',
  src: [
    {
      path: '../../../public/fonts/LoRes12OT-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/LoRes12OT-Bold.woff2',
      weight: '700',
      style: 'bold'
    }
  ]
});

export const ppMondwest = localFont({
  variable: '--font-serif',
  src: [
    {
      path: '../../../public/fonts/PPMondwest-Bold.woff2',
      weight: '700',
      style: 'bold'
    }
  ]
});

/**
 * These correspond to semantic typography styles in Figma
 * They should be used in the className prop of a text component to apply the correct styles
 * @todo Bigeon - add real text styles. This is an example implementation.
 */
export const textStyles = {
  button: 'font-mono text-sm',

  label: 'font-sans text-xs',
  'label-emphasis': 'font-sans text-xs font-bold',
  'code-01': 'font-mono text-xs font-normal',

  compact: 'font-sans text-sm',
  'compact-mid': 'font-sans text-sm font-medium',
  'compact-emphasis': 'font-sans text-sm font-bold',
  'code-02': 'font-mono text-sm font-normal',

  body: 'font-sans text-md',
  'body-mid': 'font-sans text-md font-medium',
  'body-emphasis': 'font-sans text-md font-bold',

  lead: 'font-sans text-lg',
  'lead-mid': 'font-sans text-lg font-medium',
  'lead-emphasis': 'font-sans text-lg font-bold',

  title4: 'font-serif text-xl font-bold tracking-tight',
  title3: 'font-serif text-2xl font-bold tracking-tight',
  title2: 'font-serif text-3xl font-bold tracking-tight',
  title1: 'font-serif text-4xl font-bold tracking-tight',
  titleGiant: 'font-serif text-5xl font-bold tracking-tight'
};

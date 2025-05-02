import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { textStyles } from '@/app/styles/template-strings/text-styles';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withTextStyle(
  style: keyof typeof textStyles,
  ...inputs: ClassValue[]
) {
  return cn(textStyles[style], ...inputs);
}

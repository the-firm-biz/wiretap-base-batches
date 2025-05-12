import { Icon, type IconProps } from './Icon';

export const CloseIcon = (props: IconProps) => (
  <Icon {...props} viewBox="0 0 24 24" fill="none">
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="var(--foreground)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

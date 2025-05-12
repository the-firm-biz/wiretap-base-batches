import { Icon, type IconProps } from './Icon';

export const DiscoverIcon = (props: IconProps) => (
  <Icon
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m21 21-4.34-4.34" />
    <circle cx="11" cy="11" r="8" />
  </Icon>
);

import { Icon, type IconProps } from './Icon';

export const MenuIcon = (props: IconProps) => (
  <Icon {...props} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 12H20M4 6H20M4 18H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

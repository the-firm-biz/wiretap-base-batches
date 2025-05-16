import { Icon, type IconProps } from './Icon';

export const TrashIcon = (props: IconProps) => (
  <Icon {...props} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6M10 11V17M14 11V17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

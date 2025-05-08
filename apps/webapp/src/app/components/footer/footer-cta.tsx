import { useIsMounted } from '@/app/hooks/use-is-mounted';
import { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

export const FooterCta: React.FC<PropsWithChildren> = ({ children }) => {
  const isMounted = useIsMounted();

  return isMounted
    ? createPortal(children, document.getElementById('footer-cta')!)
    : null;
};

import { WalletIcon } from '../icons/WalletIcon';
import { TargetsIcon } from '../icons/TargetsIcon';
import { DiscoverIcon } from '../icons/DiscoverIcon';
import { FooterNavButton } from './footer-nav-button';

export type PagePath = 'wallet' | 'targets' | '/';

interface FooterNavProps {
  currentPagePath: PagePath;
}

export function FooterNav({ currentPagePath }: FooterNavProps) {
  return (
    <div className="flex gap-2 items-center justify-center w-full">
      <FooterNavButton
        label="Targets"
        pagePath="targets"
        icon={<TargetsIcon className="size-4" />}
        isActive={currentPagePath === 'targets'}
      />
      <FooterNavButton
        label="Discover"
        pagePath="/"
        icon={<DiscoverIcon className="size-4" />}
        isActive={currentPagePath === '/'}
      />
      <FooterNavButton
        label="Wallet"
        pagePath="wallet"
        icon={<WalletIcon className="size-4" />}
        isActive={currentPagePath === 'wallet'}
      />
    </div>
  );
}

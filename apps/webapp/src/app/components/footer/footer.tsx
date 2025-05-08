import { FooterNav, PagePath } from './footer-nav';

interface FooterProps {
  currentPagePath: PagePath;
}

export function Footer({ currentPagePath }: FooterProps) {
  return (
    <>
      <div id="footer-cta"></div>
      <footer className="px-4 py-2 border-t border-border">
        <div className="max-w-screen-md mx-auto">
          <FooterNav currentPagePath={currentPagePath} />
        </div>
      </footer>
    </>
  );
}

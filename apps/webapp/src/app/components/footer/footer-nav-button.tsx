import { Button } from '@/app/components/ui/button';
import { textStyles } from '@/app/styles/template-strings/text-styles';
import { PagePath } from './footer-nav';
import Link from 'next/link';
import { cn } from '@/app/utils/cn';

interface FooterNavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  pagePath: PagePath;
}

export function FooterNavButton({
  isActive,
  label,
  icon,
  pagePath
}: FooterNavButtonProps) {
  return (
    <>
      <Link href={`/${pagePath}`} className="flex-1">
        <Button
          variant="ghost"
          className={cn(
            'w-full h-[52px]',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          <div className="flex flex-col items-center justify-center gap-1">
            {icon}
            <span className={textStyles.label}>{label}</span>
          </div>
        </Button>
      </Link>
    </>
  );
}

import Image from 'next/image';
import { textStyles } from '../styles/template-strings';
import { Button } from '@/app/components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { cn } from '@/app/utils/cn';

export default function Home() {
  return (
    <div
      className={cn(
        'grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20',
        textStyles.body
      )}
    >
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className={textStyles['title1']}>WireTap</h1>
        <p className={textStyles['compact']}>
          Compact Compact Compact Compact Compact{' '}
        </p>
        <p className={textStyles['label']}>
          Label Label Label Label Label Label Label Label Label Label Label
        </p>
        <h3 className={textStyles['title3']}>Title3</h3>
        <ol className={cn(textStyles['body'], 'list-inside list-decimal')}>
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{' '}
            <code
              className={cn(
                textStyles['code-02'],
                'bg-[url(/patterns/selection-pattern-light.png)] dark:bg-[url(/patterns/selection-pattern-dark.png)] bg-repeat px-1 py-0.5 [image-rendering:pixelated]'
              )}
            >
              src/app/(home)/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive" size="sm">
            Destructive (sm)
          </Button>
          <Button variant="outline" size="lg">
            Outline (lg)
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row flex-wrap">
          <Badge>Default Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="destructive">Destructive Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
        </div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Input placeholder="Placeholder"></Input>
          <Input placeholder="disabled" disabled></Input>
          <Input placeholder="readOnly" readOnly></Input>
          <Input placeholder="required" required></Input>
          <Input placeholder="email" type="email"></Input>
          <Input placeholder="password" type="password"></Input>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://thefirm.biz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to thefirm.biz →
        </a>
      </footer>
    </div>
  );
}

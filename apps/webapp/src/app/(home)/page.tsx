import Image from 'next/image';
import { textStyles } from '../styles/template-strings';
import { Button } from '@/app/components/ui/button';

export default function Home() {
  return (
    //  @Bigeon - font-[family-name:var(--font-geist-sans)] is how we'd set fonts without our semantic `textStyles.ts` declarations
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* @Bigeon - here's an example of how our semantic `textStyles.ts` are used code */}
        <p className={textStyles['lead-sans-emphasis']}>WireTap</p>
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{' '}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/(home)/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {/* @Bigeon - 'Button' is a component installed from shadcn/ui, once installed all shadcn components are available in the components/ui folder */}
          <Button>Does nothing</Button>
          <Button variant="secondary" size="sm">
            Also Does nothing
          </Button>
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

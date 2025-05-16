import { SearchIcon } from '@/app/components/icons/SearchIcon';
import TargetSearchDrawer from '@/app/components/target-search/target-search-drawer';
import { Button } from '@/app/components/ui/button';
import { textStyles } from '@/app/styles/template-strings';
import { DiscoverFeed } from './discover-feed/discover-feed';

export default function DiscoverPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full">
        <TargetSearchDrawer
          trigger={
            /** Custom button is made to look like an input box */
            <Button
              className="w-full relative justify-start border-b-1 font-sans"
              variant="outline"
            >
              {/** TODO: import buttonwithicon from shadcn and apply it here */}
              <div className="flex items-center min-w-0 gap-2">
                <SearchIcon className="h-4 w-4" />
                <span className="truncate">
                  Farcaster username, wallet address...
                </span>
              </div>
            </Button>
          }
        />
        <div className="flex flex-col pt-4">
          <p className={`pt-4 ${textStyles['compact-emphasis']}`}>
            Recently Active
          </p>
          <DiscoverFeed />
        </div>
      </div>
    </div>
  );
}

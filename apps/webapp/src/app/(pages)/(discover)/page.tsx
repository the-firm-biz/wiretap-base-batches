import { SearchIcon } from '@/app/components/icons/SearchIcon';
import TargetSearchDrawer from '@/app/components/target-search/target-search-drawer';
import { Button } from '@/app/components/ui/button';

export default function DiscoverPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <TargetSearchDrawer
        trigger={
          <Button className="w-full relative" variant="outline">
            <div className="flex items-center min-w-0 gap-2">
              <SearchIcon className="h-4 w-4" />
              <span className="truncate">
                Farcaster username, wallet address...
              </span>
            </div>
          </Button>
        }
      />
    </div>
  );
}

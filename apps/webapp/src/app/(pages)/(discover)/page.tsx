import { SearchIcon } from '@/app/components/icons/SearchIcon';
import TargetSearchDrawer from '@/app/components/target-search/target-search-drawer';
import { Button } from '@/app/components/ui/button';

export default function DiscoverPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <TargetSearchDrawer
        trigger={
          <Button className="w-full" variant="outline">
            <SearchIcon className="h-4 w-4" />
            Farcaster username, wallet address...
          </Button>
        }
      />
    </div>
  );
}

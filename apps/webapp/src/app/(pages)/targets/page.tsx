// @todo bennet - remove once not debug UI
'use client';

import TargetSearchDrawer from '@/app/components/target-search/target-search-drawer';
import { Button } from '@/app/components/ui/button';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { authedAccountTargetToUiTarget } from '@/app/utils/target/format-target';
import { useQuery } from '@tanstack/react-query';
import { TrackedTargetsList } from './components/tracked-targets-list';
import { FooterCta } from '@/app/components/footer/footer-cta';

export default function TargetsPage() {
  const trpc = useTRPC();

  const {
    data: authedAccountTargets,
    isPending: isPendingAuthedAccountTargets
  } = useQuery(trpc.wireTapAccount.getAuthedAccountTargets.queryOptions());

  const trackedTargets =
    authedAccountTargets?.map((target) =>
      authedAccountTargetToUiTarget(target)
    ) ?? [];

  return (
    <div className="h-full">
      <TrackedTargetsList
        isPendingAuthedAccountTargets={isPendingAuthedAccountTargets}
        trackedTargets={trackedTargets}
      />
      <FooterCta>
        <div className="flex animate-in fade-in justify-center py-2 border-t-1 border-border">
          <TargetSearchDrawer
            trigger={<Button>+ Add Targets</Button>}
            authedAccountTargets={authedAccountTargets}
            isLoadingAccountTargets={isPendingAuthedAccountTargets}
          />
        </div>
      </FooterCta>
    </div>
  );
}

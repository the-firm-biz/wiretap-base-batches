// @todo bennet - remove once not debug UI
'use client';

import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { authedAccountTargetToUiTarget } from '@/app/utils/target/format-target';
import { useQuery } from '@tanstack/react-query';
import { TrackedTargetsList } from './components/tracked-targets-list';

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
    <TrackedTargetsList
      isPendingAuthedAccountTargets={isPendingAuthedAccountTargets}
      trackedTargets={trackedTargets}
    />
  );
}

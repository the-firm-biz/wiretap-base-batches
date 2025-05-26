import Image from 'next/image';
import { formatDistanceToNowStrict } from 'date-fns';
import { isAddressEqual } from '@wiretap/utils/shared';
import { ETH_ADDRESS } from '@wiretap/config';
import { Badge } from '@/app/components/ui/badge';
import { GliderPortfolioActivity } from '@/server/api/trpc-routers/glider-router/routes/get-glider-portfolio-analysis-data';
import { textStyles } from '@/app/styles/template-strings';
import { formatAddress } from '@/app/utils/format/format-address';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/utils/cn';
import { formatUsd } from '@/app/utils/format/format-usd';

interface RecentActivityActivityItemProps {
  activityItem: GliderPortfolioActivity;
}

export function RecentActivityActivityItem({
  activityItem
}: RecentActivityActivityItemProps) {
  const tokenAddress = activityItem.assetId.split(':')[0];
  const isTokenEth = isAddressEqual(tokenAddress, ETH_ADDRESS);
  const amountAsNumber = Number(activityItem.amount);
  const sanitisedAmount =
    activityItem.type === 'withdraw'
      ? amountAsNumber.toFixed(5).slice(1)
      : amountAsNumber.toFixed(5);
  const valueUsed = Math.abs(amountAsNumber * Number(activityItem.priceUsd));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 pt-2">
        {activityItem.type === 'deposit' ? (
          <Badge color="blue">Deposit</Badge>
        ) : (
          <Badge color="red">Withdraw</Badge>
        )}
        <p className={`${textStyles['label']}`}>
          {formatDistanceToNowStrict(activityItem.timestamp, {
            addSuffix: true
          })}
        </p>
        {activityItem.type === 'withdraw' && (
          <p className={`${textStyles['label']}`}>
            to {formatAddress(activityItem.walletAddress)}
          </p>
        )}
      </div>
      <div className="flex flex-row items-center justify-between gap-2 border-border border rounded-md ml-6 p-3">
        <div className="flex flex-row items-center gap-2">
          <div className="w-[32px] h-[32px] rounded-full overflow-hidden">
            {isTokenEth ? (
              <Image
                src={`/tokens/eth.png`}
                alt={activityItem.symbol}
                width={32}
                height={32}
              />
            ) : (
              <Image
                src={`/token-image-missing.svg`}
                alt={activityItem.symbol}
                width={32}
                height={32}
              />
            )}
          </div>
          <div className="flex flex-col">
            <p className={`${textStyles['compact-emphasis']}`}>
              {activityItem.symbol}
            </p>
            {isTokenEth ? (
              <p className={`${textStyles['label']}`}>Ether</p>
            ) : (
              <p className={`${textStyles['label']}`}>
                {formatAddress(tokenAddress)}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col text-right">
          <span>
            {activityItem.type === 'deposit' && (
              <span className={cn(`${textStyles['code-02']} text-positive`)}>
                +{' '}
              </span>
            )}
            {activityItem.type === 'withdraw' && (
              <span className={cn(`${textStyles['code-02']} text-negative`)}>
                -{' '}
              </span>
            )}
            <span className={cn(`${textStyles['code-02']}`)}>
              {sanitisedAmount} {activityItem.symbol}
            </span>
          </span>
          <span>${formatUsd(valueUsed)}</span>
        </div>
      </div>
      <div className="flex justify-end">
        <a
          href={`https://basescan.org/tx/${activityItem.txHash}`}
          target="_blank"
        >
          <Button variant="ghost" size="link">
            View Tx →
          </Button>
        </a>
      </div>
    </div>
  );
}

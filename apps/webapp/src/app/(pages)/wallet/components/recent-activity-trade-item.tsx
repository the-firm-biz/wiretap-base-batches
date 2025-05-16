import Image from 'next/image';
import { formatDistanceToNowStrict } from 'date-fns';
import { isAddressEqual } from '@wiretap/utils/shared';
import { ETH_ADDRESS } from '@wiretap/config';
import { Badge } from '@/app/components/ui/badge';
import { GliderPortfolioTrade } from '@/server/api/trpc-routers/glider-router/routes/get-glider-portfolio-analysis-data';
import { textStyles } from '@/app/styles/template-strings';
import { formatAddress } from '@/app/utils/format/format-address';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/utils/cn';
import { formatUsd } from '@/app/utils/format/format-usd';

interface RecentActivityTradeItemProps {
  tradeItem: GliderPortfolioTrade;
}

export function RecentActivityTradeItem({
  tradeItem
}: RecentActivityTradeItemProps) {
  const { timestamp, swaps } = tradeItem;
  console.log('tradeItem', tradeItem);
  const fromToken = swaps.find((swap) => swap.type === 'fromToken');
  const toToken = swaps.find((swap) => swap.type === 'toToken');

  if (!fromToken || !toToken) {
    console.error(
      `RecentActivityTradeItem:: fromToken: ${fromToken} or toToken: ${toToken} not found`
    );
    return null;
  }

  const fromTokenAddress = fromToken.assetId.split(':')[0];
  const isFromTokenEth = isAddressEqual(fromTokenAddress, ETH_ADDRESS);
  const sanitisedFromAmount = fromToken.amount.toFixed(5).slice(1);

  const toTokenAddress = toToken.assetId.split(':')[0];
  const isToTokenEth = isAddressEqual(toTokenAddress, ETH_ADDRESS);
  const sanitisedToAmount = toToken.amount.toFixed(0);
  const toTokenAmountAsNumber = Number(toToken.amount);
  const valueUsed = Math.abs(toTokenAmountAsNumber * Number(toToken.valueUsd));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 pt-2">
        <Badge className="bg-green-200 text-green-500">Buy</Badge>
        <p className={`${textStyles['label']}`}>
          {formatDistanceToNowStrict(timestamp, {
            addSuffix: true
          })}
        </p>
      </div>

      {/* From Token */}

      <div className="flex flex-row items-center gap-2 py-2 px-3 border-dotted border ml-6">
        {isFromTokenEth ? (
          <Image
            src={`/tokens/eth.png`}
            alt={fromToken.symbol}
            width={16}
            height={16}
          />
        ) : (
          <Image
            // @todo activity feed - replace with token placeholder image
            src={`/user-dithered.png`}
            alt={fromToken.symbol}
            width={16}
            height={16}
          />
        )}
        <p className={`${textStyles['compact-emphasis']}`}>
          {fromToken.symbol}
        </p>
        <div>
          <span className={cn(`${textStyles['code-02']} text-negative`)}>
            -{' '}
          </span>
          <span className={cn(`${textStyles['code-02']}`)}>
            {sanitisedFromAmount} {fromToken.symbol}
          </span>
        </div>
      </div>

      {/* To Token */}
      <div className="border-border border rounded-md ml-6 p-3 flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-2 ">
          <div className="flex flex-row items-center gap-2">
            {isToTokenEth ? (
              <Image
                src={`/tokens/eth.png`}
                alt={toToken.symbol}
                width={32}
                height={32}
              />
            ) : (
              <Image
                // @todo activity feed - replace with token placeholder image
                src={`/user-dithered.png`}
                alt={fromToken.symbol}
                width={32}
                height={32}
              />
            )}
            <div className="flex flex-col">
              <p className={`${textStyles['compact-emphasis']}`}>
                {toToken.symbol}
              </p>
              {isToTokenEth ? (
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
              <span className={cn(`${textStyles['code-02']} text-positive`)}>
                +{' '}
              </span>
              <span className={cn(`${textStyles['code-02']}`)}>
                {sanitisedToAmount}
              </span>
            </span>
            <span>${formatUsd(valueUsed)}</span>
          </div>
        </div>
        <div className="flex justify-end">
          <a
            href={`https://basescan.io/tx/${toToken.transactionHash}`}
            target="_blank"
          >
            <Button variant="ghost" size="link">
              View Tx →
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

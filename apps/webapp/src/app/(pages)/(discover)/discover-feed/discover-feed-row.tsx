import { ExternalImage } from '@/app/components/external-image';
import { Badge } from '@/app/components/ui/badge';
import { textStyles } from '@/app/styles/template-strings';
import { formatAddress } from '@/app/utils/format/format-address';
import { TokenWithCreatorMetadata } from '@wiretap/db';

export function DiscoverFeedRow({
  token
}: {
  key: number;
  token: TokenWithCreatorMetadata;
}) {
  const {
    farcasterUsername,
    farcasterDisplayName,
    farcasterFollowerCount,
    farcasterPfpUrl,
    creatorAddress,
    tokenCreatedAt,
    tokenName,
    tokenSymbol,
    tokenImageUrl,
    poolAthMcapUsd,
    // poolStartingMcapUsd,
    creatorTokenIndex
    // deploymentContractAddress,
  } = token;

  const getDisplayName = () => {
    if (farcasterDisplayName) {
      return farcasterDisplayName;
    }

    // @todo Discover - resolve BaseName
    if (creatorAddress) {
      return formatAddress(creatorAddress);
    }

    // Realistically should never happen
    return 'Unknown';
  };

  return (
    <div className="flex gap-3 p-2 w-full">
      <ExternalImage
        src={farcasterPfpUrl ?? undefined}
        fallbackSrc="/user-dithered.png"
        alt={farcasterUsername ?? 'farcaster user profile picture'}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full border-1 border-border select-none object-cover"
      />
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex space-between">
          <div className="flex gap-1 flex-col">
            <div className={`${textStyles['compact-emphasis']}`}>
              {getDisplayName()}
            </div>
            {farcasterUsername && farcasterFollowerCount && (
              <div className="flex gap-1">
                <div className={textStyles['label']}>
                  {/* @todo Discover - format follower count */}
                  {farcasterFollowerCount} •
                </div>
                <div className={textStyles['label']}>@{farcasterUsername}</div>
              </div>
            )}
          </div>
          {/* @todo Discover - track button */}
        </div>
        <div className="flex items-center gap-1">
          {/* @todo Discover - style badge */}
          <Badge>Launch #{creatorTokenIndex}</Badge>
          <span className={textStyles['label']}>on </span>
          {/* @todo Discover - Clanker logo */}
          <span className={textStyles['label-mid']}>Clanker</span>
          {/* @todo Discover - Date/time since formatting */}
          <span className={textStyles['label']}>
            {tokenCreatedAt.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col rounded-md border border-border gap-4 p-[12px]">
          <div className="grid grid-cols-[32px_1fr_88px] gap-2 w-full">
            <ExternalImage
              src={tokenImageUrl ?? undefined}
              fallbackSrc="/token-image-missing.svg"
              alt={tokenSymbol}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full select-none object-cover"
            />
            <div className="flex flex-col flex-1">
              <p className={textStyles['compact-emphasis']}>{tokenSymbol}</p>
              <p className={textStyles['label']}>{tokenName}</p>
            </div>
            <div className="flex gap-1">
              {/* @todo Discover - Base scan & dexscreener links */}
              <div className="flex gap-1"></div>
            </div>
          </div>
          {/* @todo Discover - WireTap Edge */}
          {/* Calculate the gap between poolStartingMcapUsd and poolAthMcapUsd */}
          <div className="flex border border-border w-fit px-8">
            WireTap Edge
          </div>

          <div className="flex flex-col">
            <p className={textStyles['label']}>Mcap</p>
            <p className={textStyles['label']}>
              $
              {poolAthMcapUsd?.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </p>
            {/* @todo Discover - MCap change percentage - we don't have data for prev 24hrs mcap so leave this */}
          </div>
        </div>
      </div>
    </div>
  );
}

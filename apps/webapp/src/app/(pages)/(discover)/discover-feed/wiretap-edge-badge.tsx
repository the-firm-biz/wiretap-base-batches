import { TokenWithCreatorMetadata } from '@wiretap/db';
import { textStyles } from '@/app/styles/template-strings';
import Image from 'next/image';
import { cn } from '@/app/utils/cn';
import { useTheme } from 'next-themes';

type WireTapEdgeBadgeProps = {
  poolStartingMcapUsd: TokenWithCreatorMetadata['poolStartingMcapUsd'];
  poolAthMcapUsd: TokenWithCreatorMetadata['poolAthMcapUsd'];
};

export const WireTapEdgeBadge: React.FC<WireTapEdgeBadgeProps> = ({
  poolStartingMcapUsd,
  poolAthMcapUsd
}) => {
  const { theme } = useTheme();
  const { bg, text, textColor } = (() => {
    if (!poolStartingMcapUsd || !poolAthMcapUsd) {
      return {
        bg: 'bg-foreground/20',
        text: '-',
        textColor: 'text-foreground'
      };
    }
    const percentageChange =
      ((poolAthMcapUsd - poolStartingMcapUsd) / poolStartingMcapUsd) * 100;
    if (percentageChange === 0) {
      return {
        bg: 'bg-foreground/20',
        text: '0.00%',
        textColor: 'text-foreground'
      };
    }
    if (percentageChange > 0) {
      return {
        bg: 'bg-positive/20',
        text: `▲ ${percentageChange.toFixed(2)}%`,
        textColor: 'text-positive'
      };
    }
    return {
      bg: 'bg-negative/20',
      text: `▼ ${Math.abs(percentageChange).toFixed(2)}%`,
      textColor: 'text-negative'
    };
  })();

  return (
    <div className="flex border border-border w-fit">
      <div className="px-2">
        {theme === 'light' ? (
          <Image
            src="/logo-wiretap-edge-onlight.svg"
            width={96}
            height={24}
            alt="WireTap Edge logo"
          />
        ) : (
          <Image
            src="/logo-wiretap-edge-ondark.svg"
            width={96}
            height={24}
            alt="WireTap Edge logo"
          />
        )}
      </div>
      <div className={cn(bg)}>
        <div
          className={cn(
            `${textStyles['code-01']} w-full h-full flex items-center justify-center px-2`,
            textColor
          )}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

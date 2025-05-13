import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from '@/app/components/ui/carousel';
import DitheredImage from '../dithered-image';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/utils/cn';

interface BannerProps {
  src: string;
  alt: string;
  variant?: 'default' | 'blurred';
  badgeText?: string;
}

const Banner = ({ src, alt, variant = 'default', badgeText }: BannerProps) => {
  return (
    <div className="w-[240px] h-[72px] bg-muted border border-border flex items-center justify-center text-muted-foreground overflow-hidden rounded-md relative group">
      <DitheredImage src={src} alt={alt} />
      {variant === 'blurred' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[url('/patterns/translucent-grill-pattern.png')] bg-repeat bg-auto [image-rendering:pixelated]">
          <Badge variant="secondary">{badgeText}</Badge>
        </div>
      )}
    </div>
  );
};

export function SupportedProtocolsCarousel() {
  return (
    <Carousel
      className="mb-8"
      plugins={[
        Autoplay({
          delay: 3000
        })
      ]}
      opts={{
        align: 'start',
        loop: true
      }}
    >
      <CarouselContent className="-ml-2">
        <CarouselItem className="flex items-center justify-center basis-[248px] pl-2">
          <Banner src="/banner-clanker.png" alt="Clanker" />
        </CarouselItem>
        <CarouselItem className="flex items-center justify-center basis-[248px] pl-2">
          <Banner
            src="/banner-bankr.png"
            alt="Bankr"
            variant="blurred"
            badgeText="COMING SOON"
          />
        </CarouselItem>
        <CarouselItem className="flex items-center justify-center basis-[248px] pl-2">
          <Banner
            src="/banner-tba.png"
            alt="tba"
            variant="blurred"
            badgeText="TO BE ANNOUNCED"
          />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  );
}

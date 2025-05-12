import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from '@/app/components/ui/carousel';

const SupportedProtocolCarouselItem = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <CarouselItem className="flex items-center justify-center basis-[248px] pl-2">
      <div className="w-[240px] h-[72px] bg-muted border border-border flex items-center justify-center text-muted-foreground">
        {children}
      </div>
    </CarouselItem>
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
        <SupportedProtocolCarouselItem>
          Placeholder 1
        </SupportedProtocolCarouselItem>
        <SupportedProtocolCarouselItem>
          Placeholder 2
        </SupportedProtocolCarouselItem>
        <SupportedProtocolCarouselItem>
          Placeholder 3
        </SupportedProtocolCarouselItem>
        <SupportedProtocolCarouselItem>
          Placeholder 4
        </SupportedProtocolCarouselItem>
      </CarouselContent>
    </Carousel>
  );
}

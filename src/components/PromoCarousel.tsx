"use client";

import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import type { PromoBanner } from "@/lib/banners";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function PromoCarousel({ banners }: { banners: PromoBanner[] }) {
  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  if (banners.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Carousel
          opts={{ loop: true, align: "start" }}
          plugins={banners.length > 1 ? [autoplay.current] : undefined}
          className="w-full"
        >
          <CarouselContent className="-ml-0">
            {banners.map((banner) => {
              const image = (
                <img
                  src={banner.imageUrl}
                  alt={banner.alt || "Publicidad"}
                  className="h-full w-full object-cover"
                />
              );
              return (
                <CarouselItem key={banner.id} className="pl-0">
                  <div className="overflow-hidden rounded-2xl bg-gray-100 aspect-[2/1] sm:aspect-[21/8]">
                    {banner.href ? (
                      <a href={banner.href} className="block h-full w-full">
                        {image}
                      </a>
                    ) : (
                      image
                    )}
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          {banners.length > 1 && (
            <>
              <CarouselPrevious className="left-3 border-0 bg-white/90 hover:bg-white" />
              <CarouselNext className="right-3 border-0 bg-white/90 hover:bg-white" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
}

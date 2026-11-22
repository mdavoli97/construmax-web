import Link from "next/link";
import { productService } from "@/lib/services";
import FeaturedProducts from "@/components/FeaturedProducts";
import StructuredData from "@/components/StructuredData";
import TypingText from "@/components/ui/shadcn-io/typing-text";
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  siteNavigationSchema,
} from "@/lib/schemas";
import { whyChooseUs, withShippingBenefit } from "@/lib/benefits";
import { getSiteSettings } from "@/lib/site-settings";
import { getBanners } from "@/lib/banners";
import { getFeaturedProductIds } from "@/lib/featured-products";
import PromoCarousel from "@/components/PromoCarousel";

// Forzar revalidación en cada request para productos destacados
export const revalidate = 0;

export default async function HomePage() {
  const [settings, banners, featuredIds] = await Promise.all([
    getSiteSettings(),
    getBanners(),
    getFeaturedProductIds(),
  ]);
  const featuredProducts = await productService.getByIds(featuredIds);

  return (
    <div className="min-h-screen">
      {/* Structured Data */}
      <StructuredData
        data={[
          organizationSchema,
          localBusinessSchema,
          websiteSchema,
          siteNavigationSchema,
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/80 via-white to-white text-gray-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(252,94,20,0.12),_transparent_55%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-4 sm:mb-5 flex h-[5.5rem] sm:h-[6.5rem] md:h-[7.5rem] lg:h-[9rem] items-center justify-center overflow-hidden">
              <TypingText
                text={[
                  "ConstruMax",
                  "Materiales de Construcción",
                  "Barraca de Hierros",
                ]}
                as="h1"
                className="!block w-full text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-orange-600"
                typingSpeed={100}
                pauseDuration={2000}
                deletingSpeed={50}
                loop={true}
                showCursor={true}
                cursorCharacter="|"
                cursorClassName="text-orange-600"
              />
            </div>
            <p className="text-lg sm:text-xl text-gray-600">
              Encontrá los mejores precios del mercado.
            </p>
          </div>

          {/* Por qué elegirnos — al ocultarse, aparece la barra sticky del header */}
          <div
            id="why-choose-us"
            className="mt-8 pt-6 border-t border-orange-100/80"
          >
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-orange-600 mb-6">
              ¿Por qué elegirnos?
            </p>
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {withShippingBenefit(whyChooseUs, settings.freeShippingFromUyu).map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="text-center sm:text-left sm:flex sm:gap-3 sm:items-start"
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white mb-3 sm:mb-0 mx-auto sm:mx-0">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-0.5">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PromoCarousel banners={banners} />

      {/* Featured Subcategories Section */}
      <section className="py-10 sm:py-14 px-2 sm:px-0 bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedProducts products={featuredProducts} />
          <div className="text-center mt-10 sm:mt-12">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-orange-600 bg-white border border-orange-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Ver Todos los Productos
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900">
                Sobre ConstruMax
              </h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Somos tu aliado de confianza en materiales de construcción,
                barraca de hierros y portland.
              </p>
              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                Desde herramientas especializadas hasta materiales a granel,
                tenemos todo lo que necesitas para hacer realidad tu proyecto.
              </p>
              <Link
                href="/productos"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-orange-600 bg-white border border-orange-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Conoce Nuestros Productos
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-gradient-to-br from-orange-500/10 via-white to-orange-600/10 rounded-xl h-48 sm:h-56 flex items-center justify-center border-2 border-orange-200/50 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-xl transform rotate-6"></div>
                <span className="text-4xl sm:text-6xl relative z-10 transform hover:scale-110 transition-transform duration-300">
                  🏗️
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

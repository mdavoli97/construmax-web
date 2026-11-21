import type { ComponentType, SVGProps } from "react";
import {
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type Benefit = {
  icon: HeroIcon;
  title: string;
  description: string;
};

export function withShippingBenefit(benefits: Benefit[], freeFrom: number) {
  const formatted = freeFrom.toLocaleString("es-UY");
  return benefits.map((benefit) =>
    benefit.title === "Envío Gratis"
      ? {
          ...benefit,
          description: `En compras superiores a $${formatted}`,
        }
      : benefit
  );
}

export const whyChooseUs: Benefit[] = [
  {
    icon: TruckIcon,
    title: "Envío Gratis",
    description: "En compras superiores a $50.000",
  },
  {
    icon: ShieldCheckIcon,
    title: "Garantía",
    description: "Todos nuestros productos con garantía",
  },
  {
    icon: CurrencyDollarIcon,
    title: "Mejor Precio",
    description: "Precios competitivos en el mercado",
  },
  {
    icon: ClockIcon,
    title: "Entrega Rápida",
    description: "En 24-48 horas en Montevideo",
  },
];

"use client";

import Link from "next/link";
import {
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { whatsappService } from "@/lib/whatsapp";

export default function ContactanosMenu() {
  const whatsappUrl = whatsappService.generateWhatsAppURL(
    whatsappService.businessNumber,
    encodeURIComponent("Hola ConstruMax, quisiera más información.")
  );

  return (
    <div className="relative group/contact">
      <Link
        href="/contacto"
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-800",
          "hover:text-orange-600 transition-colors rounded-md"
        )}
      >
        Contáctanos
        <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover/contact:text-orange-600 transition-colors" />
      </Link>

      <div
        className={cn(
          "absolute left-0 top-full z-50 pt-2",
          "opacity-0 invisible translate-y-1 pointer-events-none",
          "group-hover/contact:opacity-100 group-hover/contact:visible group-hover/contact:translate-y-0 group-hover/contact:pointer-events-auto",
          "transition-all duration-200 ease-out"
        )}
      >
        <div className="w-[340px] bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-2">
                Sucursal
              </p>
              <div className="flex gap-3 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">ConstruMax</p>
                  <p>José Mármol 615</p>
                  <p>Montevideo, Uruguay</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 text-sm text-gray-700">
              <Phone className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <a
                  href="tel:+59897971111"
                  className="block font-medium hover:text-orange-600"
                >
                  +598 97 971 111
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-green-600 hover:text-green-700"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="flex gap-3 text-sm text-gray-700">
              <Mail className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <a
                href="mailto:curlamsas@gmail.com.uy"
                className="hover:text-orange-600 break-all"
              >
                curlamsas@gmail.com.uy
              </a>
            </div>

            <div className="flex gap-3 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p>Lun–Vie: 8:00–12:00 / 13:30–18:30</p>
                <p>Sábados: 8:00–13:00</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
            <Link
              href="/contacto"
              className="block text-center text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              Más información
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

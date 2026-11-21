"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { whatsappService } from "@/lib/whatsapp";

export default function ContactoPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const whatsappMessage = encodeURIComponent(
    `Hola ConstruMax, soy ${name || "un cliente"}. ${message || "Quisiera más información."}`
  );
  const whatsappUrl = whatsappService.generateWhatsAppURL(
    whatsappService.businessNumber,
    whatsappMessage
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        return;
      }

      if (data.fallback === "whatsapp") {
        window.open(whatsappUrl, "_blank");
        setStatus("success");
        return;
      }

      setStatus("error");
      setErrorMsg(data.error || "No se pudo enviar el mensaje");
    } catch {
      setStatus("error");
      setErrorMsg("Error de conexión. Intentá de nuevo o escribinos por WhatsApp.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Contáctanos
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Estamos para ayudarte con presupuestos, stock y consultas sobre
            materiales de construcción.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Datos de contacto
              </h2>

              <a
                href="tel:+59897971111"
                className="flex items-start gap-3 text-gray-700 hover:text-orange-600 transition-colors"
              >
                <PhoneIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Teléfono</p>
                  <p className="text-sm">+598 97 971 111</p>
                </div>
              </a>

              <a
                href="mailto:curlamsas@gmail.com.uy"
                className="flex items-start gap-3 text-gray-700 hover:text-orange-600 transition-colors"
              >
                <EnvelopeIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm">curlamsas@gmail.com.uy</p>
                </div>
              </a>

              <div className="flex items-start gap-3 text-gray-700">
                <MapPinIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Dirección</p>
                  <p className="text-sm">
                    José Mármol 615, Montevideo, Uruguay
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-700">
                <ClockIcon className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Horarios</p>
                  <p className="text-sm">Lunes a viernes: 8:00 a 12:00 / 13:30 a 18:30</p>
                  <p className="text-sm">Sábados: 8:00 a 13:00</p>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Escribinos por WhatsApp
            </a>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Enviá tu consulta
            </h2>

            {status === "success" ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
                <p className="font-medium">¡Mensaje enviado!</p>
                <p className="text-sm mt-1">
                  Te responderemos a la brevedad. También podés{" "}
                  <Link href="/productos" className="underline">
                    seguir viendo productos
                  </Link>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-3 text-sm font-medium text-green-700 underline"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre *
                  </label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Teléfono
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09x xxx xxx"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mensaje *
                  </label>
                  <Textarea
                    id="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Contanos en qué podemos ayudarte…"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-600">{errorMsg}</p>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {status === "loading" ? "Enviando…" : "Enviar mensaje"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

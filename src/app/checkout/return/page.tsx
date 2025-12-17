"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    "loading" | "approved" | "rejected" | "pending"
  >("loading");
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    // PlaceToPay puede enviar el requestId de diferentes formas
    let requestId = searchParams.get("requestId");

    // Si no viene como requestId, buscar otras variantes
    if (!requestId) {
      requestId = searchParams.get("reference");
    }

    // También puede venir en el path como /checkout/return/{requestId}
    if (!requestId) {
      const pathParts = window.location.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== "return" && !isNaN(Number(lastPart))) {
        requestId = lastPart;
      }
    }

    // Si no viene en la URL, buscar en sessionStorage
    if (!requestId) {
      const storedRequestId = sessionStorage.getItem("placetopay_request_id");
      if (storedRequestId) {
        requestId = storedRequestId;
        console.log("RequestId recuperado de sessionStorage:", requestId);
      }
    }

    console.log("Search params:", Object.fromEntries(searchParams.entries()));
    console.log("RequestId encontrado:", requestId);

    if (!requestId) {
      console.error("No requestId found");
      console.error("URL completa:", window.location.href);
      console.error(
        "Params disponibles:",
        Object.fromEntries(searchParams.entries())
      );
      router.push("/failure");
      return;
    }

    // Limpiar el sessionStorage después de recuperar el requestId
    sessionStorage.removeItem("placetopay_request_id");

    // Consultar el estado del pago
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/placetopay/session/${requestId}`);

        if (!response.ok) {
          throw new Error("Error al consultar el pago");
        }

        const data = await response.json();
        setPaymentInfo(data);

        if (data.status.status === "APPROVED" && data.approved) {
          setStatus("approved");
          // Esperar 2 segundos y redirigir a success
          setTimeout(() => {
            router.push(
              `/success?payment=${data.paymentReference || requestId}`
            );
          }, 2000);
        } else if (data.status.status === "REJECTED") {
          setStatus("rejected");
          setTimeout(() => {
            router.push("/failure");
          }, 2000);
        } else if (data.status.status === "PENDING") {
          setStatus("pending");
          setTimeout(() => {
            router.push("/pending");
          }, 2000);
        } else {
          setStatus("rejected");
          setTimeout(() => {
            router.push("/failure");
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking payment:", error);
        setStatus("rejected");
        setTimeout(() => {
          router.push("/failure");
        }, 2000);
      }
    };

    checkPaymentStatus();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        {status === "loading" && (
          <>
            <Spinner className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verificando tu pago...
            </h1>
            <p className="text-gray-600">
              Por favor espera mientras confirmamos tu transacción
            </p>
          </>
        )}

        {status === "approved" && (
          <>
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              ¡Pago aprobado!
            </h1>
            <p className="text-gray-600">Redirigiendo a la confirmación...</p>
          </>
        )}

        {status === "rejected" && (
          <>
            <div className="text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Pago rechazado
            </h1>
            <p className="text-gray-600">Redirigiendo...</p>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-yellow-600 mb-4">
              Pago pendiente
            </h1>
            <p className="text-gray-600">Tu pago está siendo procesado...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <Spinner className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Cargando...
            </h1>
          </div>
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoaderFive } from "@/components/ui/loader";
import { Spinner } from "@/components/ui/spinner";
import { useCartStore } from "@/store/cartStore";

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [status, setStatus] = useState<
    "loading" | "approved" | "rejected" | "pending"
  >("loading");

  useEffect(() => {
    const collectionStatus = searchParams.get("collection_status");
    const paymentStatus = searchParams.get("status");
    const paymentId =
      searchParams.get("payment_id") || searchParams.get("collection_id");
    const externalReference = searchParams.get("external_reference");

    const checkPlaceToPayStatus = async (requestId: string) => {
      try {
        sessionStorage.removeItem("placetopay_request_id");

        const response = await fetch(`/api/placetopay/session/${requestId}`);

        if (!response.ok) {
          throw new Error("Error al consultar el pago");
        }

        const data = await response.json();

        if (data.status.status === "APPROVED" && data.approved) {
          setStatus("approved");
          clearCart();
          setTimeout(() => {
            router.push(
              `/success?payment=${data.paymentReference || requestId}`
            );
          }, 2000);
        } else if (data.status.status === "REJECTED") {
          setStatus("rejected");
          setTimeout(() => router.push("/failure"), 2000);
        } else if (data.status.status === "PENDING") {
          setStatus("pending");
          setTimeout(() => router.push("/pending"), 2000);
        } else {
          setStatus("rejected");
          setTimeout(() => router.push("/failure"), 2000);
        }
      } catch (error) {
        console.error("Error checking PlaceToPay payment:", error);
        setStatus("rejected");
        setTimeout(() => router.push("/failure"), 2000);
      }
    };

    const resolveAndRedirect = (
      mapped: "approved" | "pending" | "rejected",
      redirectPaymentId?: string | null
    ) => {
      sessionStorage.removeItem("mercadopago_preference_id");
      sessionStorage.removeItem("mercadopago_external_reference");

      if (mapped === "approved") {
        setStatus("approved");
        clearCart();
        setTimeout(() => {
          router.push(
            `/success?payment=${redirectPaymentId || externalReference || ""}`
          );
        }, 2000);
        return;
      }

      if (mapped === "pending") {
        setStatus("pending");
        setTimeout(() => router.push("/pending"), 2000);
        return;
      }

      setStatus("rejected");
      setTimeout(() => router.push("/failure"), 2000);
    };

    const processMercadoPago = async () => {
      // Preferir estado real desde la API de MP
      if (paymentId && paymentId !== "null") {
        try {
          const response = await fetch(
            `/api/mercadopago/payment/${paymentId}?confirm=1`
          );
          if (response.ok) {
            const data = await response.json();
            const mapped =
              (data.payment?.mapped_status as
                | "approved"
                | "pending"
                | "rejected") || "rejected";
            resolveAndRedirect(mapped, String(data.payment?.id || paymentId));
            return;
          }
        } catch (error) {
          console.error("Error confirming MercadoPago payment:", error);
        }
      }

      // Fallback a query params si no hay payment_id o falló la API
      const mpStatus = collectionStatus || paymentStatus;
      if (!mpStatus) {
        let requestId =
          searchParams.get("requestId") || searchParams.get("reference");

        if (!requestId) {
          const storedRequestId = sessionStorage.getItem(
            "placetopay_request_id"
          );
          if (storedRequestId) {
            requestId = storedRequestId;
          }
        }

        if (requestId) {
          await checkPlaceToPayStatus(requestId);
          return;
        }

        console.error("No payment information found");
        router.push("/failure");
        return;
      }

      if (mpStatus === "approved") {
        resolveAndRedirect("approved", paymentId);
      } else if (mpStatus === "pending" || mpStatus === "in_process") {
        resolveAndRedirect("pending", paymentId);
      } else {
        resolveAndRedirect("rejected", paymentId);
      }
    };

    processMercadoPago();
  }, [searchParams, router, clearCart]);

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
            <LoaderFive text="Procesando pago..." />
          </div>
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}

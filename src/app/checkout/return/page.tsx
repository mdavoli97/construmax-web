"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoaderFive } from "@/components/ui/loader";
import { Spinner } from "@/components/ui/spinner";

function CheckoutReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    "loading" | "approved" | "rejected" | "pending"
  >("loading");
  const [, setPaymentInfo] = useState<unknown>(null);

  useEffect(() => {
    // MercadoPago envía estos parámetros en la URL de retorno:
    // - collection_id: ID del pago
    // - collection_status: Estado del pago (approved, rejected, pending)
    // - payment_id: ID del pago (alternativo)
    // - status: Estado del pago (alternativo)
    // - external_reference: Referencia externa (ORDER_xxx)
    // - preference_id: ID de la preferencia

    const collectionStatus = searchParams.get("collection_status");
    const paymentStatus = searchParams.get("status");
    const paymentId =
      searchParams.get("payment_id") || searchParams.get("collection_id");
    const externalReference = searchParams.get("external_reference");
    const preferenceId = searchParams.get("preference_id");

    // También verificar el parámetro status que enviamos nosotros en back_urls
    const ourStatus = searchParams.get("status");

    console.log("MercadoPago params:", {
      collectionStatus,
      paymentStatus,
      paymentId,
      externalReference,
      preferenceId,
      ourStatus,
    });

    // Determinar el estado del pago
    const determineStatus = () => {
      // Si viene collection_status de MercadoPago, usarlo
      if (collectionStatus) {
        return collectionStatus;
      }
      // Si viene status de MercadoPago
      if (paymentStatus) {
        return paymentStatus;
      }
      // Si viene nuestro parámetro status
      if (ourStatus) {
        return ourStatus;
      }
      return null;
    };

    const mpStatus = determineStatus();

    // Función para manejar PlaceToPay (legado)
    const checkPlaceToPayStatus = async (requestId: string) => {
      try {
        sessionStorage.removeItem("placetopay_request_id");

        const response = await fetch(`/api/placetopay/session/${requestId}`);

        if (!response.ok) {
          throw new Error("Error al consultar el pago");
        }

        const data = await response.json();
        setPaymentInfo(data);

        if (data.status.status === "APPROVED" && data.approved) {
          setStatus("approved");
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
        console.error("Error checking PlaceToPay payment:", error);
        setStatus("rejected");
        setTimeout(() => {
          router.push("/failure");
        }, 2000);
      }
    };

    // Función para obtener detalles del pago de MercadoPago
    const fetchPaymentDetails = async (paymentId: string) => {
      try {
        const response = await fetch(`/api/mercadopago/payment/${paymentId}`);
        if (response.ok) {
          const data = await response.json();
          setPaymentInfo(data.payment);
          console.log("Payment details:", data.payment);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      }
    };

    if (!mpStatus && !paymentId) {
      // Si no hay información de MercadoPago, verificar PlaceToPay (legado)
      let requestId =
        searchParams.get("requestId") || searchParams.get("reference");

      if (!requestId) {
        const storedRequestId = sessionStorage.getItem("placetopay_request_id");
        if (storedRequestId) {
          requestId = storedRequestId;
        }
      }

      if (requestId) {
        // Procesar con PlaceToPay (legado)
        checkPlaceToPayStatus(requestId);
        return;
      }

      // No hay información de pago
      console.error("No payment information found");
      router.push("/failure");
      return;
    }

    // Procesar estado de MercadoPago
    if (mpStatus === "approved") {
      setStatus("approved");

      // Limpiar sessionStorage
      sessionStorage.removeItem("mercadopago_preference_id");
      sessionStorage.removeItem("mercadopago_external_reference");

      // Redirigir a success
      setTimeout(() => {
        router.push(`/success?payment=${paymentId || externalReference || ""}`);
      }, 2000);
    } else if (mpStatus === "pending" || mpStatus === "in_process") {
      setStatus("pending");
      setTimeout(() => {
        router.push("/pending");
      }, 2000);
    } else {
      // rejected, cancelled, etc.
      setStatus("rejected");
      setTimeout(() => {
        router.push("/failure");
      }, 2000);
    }

    // Si tenemos un payment_id, podemos obtener más detalles (opcional)
    if (paymentId) {
      fetchPaymentDetails(paymentId);
    }
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
            <LoaderFive text="Procesando pago..." />
          </div>
        </div>
      }
    >
      <CheckoutReturnContent />
    </Suspense>
  );
}

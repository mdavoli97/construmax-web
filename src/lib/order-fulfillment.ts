export type DeliveryMethod = "pickup" | "delivery" | string;

export type OrderStatus =
  | "pending"
  | "pending_payment"
  | "payment_failed"
  | "paid"
  | "confirmed"
  | "preparing"
  | "in_transit"
  | "ready_for_pickup"
  | "ready"
  | "delivered"
  | "cancelled"
  | "canceled";

export type FulfillmentStepId =
  | "confirmed"
  | "preparing"
  | "in_transit"
  | "ready_for_pickup"
  | "delivered";

export type FulfillmentStep = {
  id: FulfillmentStepId;
  label: string;
};

/** Normaliza estados legados al modelo actual. */
export function normalizeStatus(status: string | null | undefined): string {
  if (!status) return "pending";
  if (status === "paid") return "confirmed";
  if (status === "ready") return "ready_for_pickup";
  if (status === "canceled") return "cancelled";
  return status;
}

export function isFulfillmentStatus(status: string): boolean {
  const s = normalizeStatus(status);
  return (
    s === "confirmed" ||
    s === "preparing" ||
    s === "in_transit" ||
    s === "ready_for_pickup" ||
    s === "delivered"
  );
}

export function getFulfillmentSteps(
  deliveryMethod: DeliveryMethod
): FulfillmentStep[] {
  const isPickup = deliveryMethod === "pickup";
  return [
    { id: "confirmed", label: "Pedido confirmado" },
    { id: "preparing", label: "Preparando pedido" },
    isPickup
      ? { id: "ready_for_pickup", label: "Listo para retirar" }
      : { id: "in_transit", label: "Transportista en camino" },
    {
      id: "delivered",
      label: isPickup ? "Retirado / entregado" : "Pedido entregado",
    },
  ];
}

export function getStatusLabel(
  status: string,
  deliveryMethod: DeliveryMethod = "delivery"
): string {
  const s = normalizeStatus(status);
  const isPickup = deliveryMethod === "pickup";

  switch (s) {
    case "pending":
      return "Pendiente";
    case "pending_payment":
      return "Pago pendiente";
    case "payment_failed":
      return "Pago fallido";
    case "confirmed":
      return "Pedido confirmado";
    case "preparing":
      return "Preparando pedido";
    case "in_transit":
      return "Transportista en camino";
    case "ready_for_pickup":
      return "Listo para retirar";
    case "delivered":
      return isPickup ? "Retirado / entregado" : "Pedido entregado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

export function getStatusColorClass(status: string): string {
  const s = normalizeStatus(status);
  switch (s) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "pending_payment":
      return "bg-amber-100 text-amber-800";
    case "payment_failed":
      return "bg-red-100 text-red-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "preparing":
      return "bg-orange-100 text-orange-800";
    case "in_transit":
      return "bg-indigo-100 text-indigo-800";
    case "ready_for_pickup":
      return "bg-green-100 text-green-800";
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/** Opciones del select admin según método de entrega. */
export function getAdminStatusOptions(
  deliveryMethod: DeliveryMethod
): { value: string; label: string }[] {
  const isPickup = deliveryMethod === "pickup";
  const options: { value: string; label: string }[] = [
    { value: "pending", label: "Pendiente" },
    { value: "pending_payment", label: "Pago pendiente" },
    { value: "payment_failed", label: "Pago fallido" },
    { value: "confirmed", label: "Confirmar pago / Pedido confirmado" },
    { value: "preparing", label: "Preparando pedido" },
  ];

  if (isPickup) {
    options.push({
      value: "ready_for_pickup",
      label: "Listo para retirar",
    });
  } else {
    options.push({
      value: "in_transit",
      label: "Transportista en camino",
    });
  }

  options.push(
    {
      value: "delivered",
      label: isPickup ? "Retirado / entregado" : "Pedido entregado",
    },
    { value: "cancelled", label: "Cancelado" }
  );

  return options;
}

const FULFILLMENT_ORDER_DELIVERY: FulfillmentStepId[] = [
  "confirmed",
  "preparing",
  "in_transit",
  "delivered",
];

const FULFILLMENT_ORDER_PICKUP: FulfillmentStepId[] = [
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "delivered",
];

function fulfillmentIndex(
  status: string,
  deliveryMethod: DeliveryMethod
): number {
  const s = normalizeStatus(status) as FulfillmentStepId;
  const order =
    deliveryMethod === "pickup"
      ? FULFILLMENT_ORDER_PICKUP
      : FULFILLMENT_ORDER_DELIVERY;
  return order.indexOf(s);
}

export type StepperStepState = "complete" | "current" | "upcoming";

export function getStepperSteps(
  status: string,
  deliveryMethod: DeliveryMethod
): Array<FulfillmentStep & { state: StepperStepState }> {
  const steps = getFulfillmentSteps(deliveryMethod);
  const current = fulfillmentIndex(status, deliveryMethod);

  return steps.map((step, index) => {
    if (!isFulfillmentStatus(status)) {
      return { ...step, state: "upcoming" as const };
    }
    if (current < 0) {
      return { ...step, state: "upcoming" as const };
    }
    if (index < current) return { ...step, state: "complete" as const };
    if (index === current) return { ...step, state: "current" as const };
    return { ...step, state: "upcoming" as const };
  });
}

/**
 * Transiciones permitidas:
 * - avanzar un paso (o al siguiente fulfillment válido)
 * - cancelar desde casi cualquier estado no entregado
 * - confirmar pago desde pending / pending_payment / payment_failed / pending
 * - no retroceder (salvo cancelled no se “des-cancela” aquí)
 */
export function canTransitionStatus(
  from: string,
  to: string,
  deliveryMethod: DeliveryMethod
): boolean {
  const current = normalizeStatus(from);
  const next = normalizeStatus(to);

  if (current === next) return true;

  if (next === "cancelled") {
    return current !== "delivered" && current !== "cancelled";
  }

  if (next === "confirmed") {
    return (
      current === "pending" ||
      current === "pending_payment" ||
      current === "payment_failed" ||
      current === "confirmed"
    );
  }

  const order =
    deliveryMethod === "pickup"
      ? FULFILLMENT_ORDER_PICKUP
      : FULFILLMENT_ORDER_DELIVERY;

  const fromIdx = order.indexOf(current as FulfillmentStepId);
  const toIdx = order.indexOf(next as FulfillmentStepId);

  if (fromIdx === -1 || toIdx === -1) return false;
  // Solo avanzar (mismo o siguiente; permitir saltar un paso como máximo no —
  // plan dice solo avanzar; permitimos cualquier avance hacia adelante)
  return toIdx > fromIdx;
}

export const ALLOWED_ORDER_STATUSES = [
  "pending",
  "pending_payment",
  "payment_failed",
  "confirmed",
  "preparing",
  "in_transit",
  "ready_for_pickup",
  "delivered",
  "cancelled",
] as const;

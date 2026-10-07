"use client";

import { CheckIcon } from "lucide-react";
import {
  getStepperSteps,
  isFulfillmentStatus,
  normalizeStatus,
} from "@/lib/order-fulfillment";
import { cn } from "@/lib/utils";

type OrderTrackingStepperProps = {
  status: string;
  deliveryMethod: string;
};

export default function OrderTrackingStepper({
  status,
  deliveryMethod,
}: OrderTrackingStepperProps) {
  const normalized = normalizeStatus(status);

  if (
    normalized === "pending_payment" ||
    normalized === "pending" ||
    normalized === "payment_failed"
  ) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        {normalized === "payment_failed"
          ? "El pago no se completó. Si ya transferiste o pagaste, contactanos."
          : "Esperando confirmación de pago."}
      </div>
    );
  }

  if (normalized === "cancelled") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Pedido cancelado.
      </div>
    );
  }

  if (!isFulfillmentStatus(status)) {
    return null;
  }

  const steps = getStepperSteps(status, deliveryMethod);

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  step.state === "complete" &&
                    "border-emerald-500 bg-emerald-500 text-white",
                  step.state === "current" &&
                    "border-orange-500 bg-orange-50 text-orange-700",
                  step.state === "upcoming" &&
                    "border-gray-200 bg-white text-gray-400"
                )}
              >
                {step.state === "complete" ? (
                  <CheckIcon className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    "w-0.5 flex-1 min-h-[20px]",
                    step.state === "complete" ? "bg-emerald-400" : "bg-gray-200"
                  )}
                />
              )}
            </div>
            <div className={cn("pb-4", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium leading-7",
                  step.state === "complete" && "text-emerald-700",
                  step.state === "current" && "text-orange-700",
                  step.state === "upcoming" && "text-gray-400"
                )}
              >
                {step.label}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

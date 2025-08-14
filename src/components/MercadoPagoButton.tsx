'use client';

import { useEffect, useState } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useCartStore } from '@/store/cartStore';

interface MercadoPagoButtonProps {
  customerData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function MercadoPagoButton({ customerData, onSuccess, onError }: MercadoPagoButtonProps) {
  const { cart } = useCartStore();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar MercadoPago con la clave pública de las variables de entorno
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-12345678-1234-1234-1234-123456789012';
    initMercadoPago(publicKey);
  }, []);

  const createPreference = async () => {
    setIsLoading(true);
    try {
      // Aquí deberías hacer una llamada a tu backend para crear la preferencia
      // Por ahora simulamos la creación
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            title: item.product.name,
            unit_price: item.product.price,
            quantity: item.quantity,
            currency_id: 'UYU',
          })),
          customer: customerData,
          back_urls: {
            success: `${window.location.origin}/success`,
            failure: `${window.location.origin}/failure`,
            pending: `${window.location.origin}/pending`,
          },
          auto_return: 'approved',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la preferencia de pago');
      }

      const data = await response.json();
      setPreferenceId(data.preferenceId);
    } catch (error) {
      onError('Error al inicializar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (!preferenceId) {
      createPreference();
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
      >
        Inicializando pago...
      </button>
    );
  }

  if (preferenceId) {
    return (
      <Wallet
        initialization={{ preferenceId }}
      />
    );
  }

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
    >
      Pagar con MercadoPago
    </button>
  );
}

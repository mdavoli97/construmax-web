"use client";

import { useState } from "react";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ChapasCalculatorProps {
  onCalculateResult: (
    result: number,
    calculationDetails?: CalculationRecord[]
  ) => void;
  onClose: () => void;
}

interface CalculationRecord {
  id: number;
  largo: number;
  cantidad: number;
  total: number;
}

export default function ChapasCalculator({
  onCalculateResult,
  onClose,
}: ChapasCalculatorProps) {
  const [largo, setLargo] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("1");
  const [calculations, setCalculations] = useState<CalculationRecord[]>([]);
  const [nextId, setNextId] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatToTwoDecimals = (value: number): number => {
    return Math.round(value * 100) / 100;
  };

  const handleLargoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números con hasta 2 decimales
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setLargo(value);
    }
  };

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números con hasta 2 decimales
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setCantidad(value);
    }
  };

  const agregarCalculo = () => {
    const largoNum = parseFloat(largo);
    const cantidadNum = parseFloat(cantidad);

    if (
      !isNaN(largoNum) &&
      !isNaN(cantidadNum) &&
      largoNum > 0 &&
      cantidadNum > 0
    ) {
      const total = formatToTwoDecimals(largoNum * cantidadNum);
      const newCalculation: CalculationRecord = {
        id: nextId,
        largo: largoNum,
        cantidad: cantidadNum,
        total,
      };
      setCalculations([...calculations, newCalculation]);
      setNextId(nextId + 1);
      // Reset form
      setLargo("");
      setCantidad("1");
    } else {
      alert("Por favor, ingresa valores válidos");
    }
  };

  const eliminarCalculo = (id: number) => {
    setCalculations(calculations.filter((calc) => calc.id !== id));
  };

  const getTotalGeneral = () => {
    return formatToTwoDecimals(
      calculations.reduce((sum, calc) => sum + calc.total, 0)
    );
  };

  const aplicarTotal = () => {
    const total = getTotalGeneral();
    if (total > 0) {
      // Enviar el total y los detalles de cálculo si hay múltiples cálculos
      const calculationDetails =
        calculations.length > 1 ? calculations : undefined;
      onCalculateResult(total, calculationDetails);
      // Mostrar notificación de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const limpiarTodo = () => {
    setLargo("");
    setCantidad("1");
    setCalculations([]);
    setNextId(1);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Calculadora de Chapas
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Notificación de éxito */}
        {showSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Cantidad aplicada correctamente al producto
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Largo (metros)
          </label>
          <input
            type="text"
            value={largo}
            onChange={handleLargoChange}
            placeholder="Ej: 2.50"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad
          </label>
          <input
            type="text"
            value={cantidad}
            onChange={handleCantidadChange}
            placeholder="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={agregarCalculo}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Agregar
          </button>
          <button
            onClick={limpiarTodo}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpiar Todo
          </button>
        </div>

        {/* Lista de cálculos */}
        {calculations.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Cálculos agregados:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {calculations.map((calc) => (
                <div
                  key={calc.id}
                  className="flex items-center justify-between bg-white p-2 rounded border"
                >
                  <div className="text-sm">
                    <span className="font-medium">{calc.largo}m</span> ×{" "}
                    <span className="font-medium">{calc.cantidad}</span> ={" "}
                    <span className="font-bold text-blue-600">
                      {calc.total}m
                    </span>
                  </div>
                  <button
                    onClick={() => eliminarCalculo(calc.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Eliminar cálculo"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total general */}
        {calculations.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total general:</p>
                <p className="text-2xl font-bold text-green-700">
                  {getTotalGeneral()} m
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={aplicarTotal}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Aplicar cantidad
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">💡 Cómo usar:</p>
          <p>• Ingresa el largo en metros (máx. 2 decimales)</p>
          <p>• Indica la cantidad de piezas de ese largo</p>
          <p>• Haz clic en &quot;Agregar&quot; para sumar al total</p>
          <p>
            • Puedes agregar múltiples cálculos y eliminar los que no necesites
          </p>
        </div>
      </div>
    </div>
  );
}

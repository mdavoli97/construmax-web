import { NextResponse } from "next/server";
import { getUSDToUYURate } from "@/lib/currency";

export async function GET() {
  try {
    const exchangeData = await getUSDToUYURate();

    return NextResponse.json({
      success: true,
      data: exchangeData,
    });
  } catch (error) {
    console.error("Error in exchange rate API:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener la cotización del dólar",
      },
      { status: 500 }
    );
  }
}

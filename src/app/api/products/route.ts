import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");
    const exclude = searchParams.get("exclude");

    let products;

    if (category) {
      // Get products by category
      products = await productService.getByCategory(category);
    } else {
      // Get all products
      products = await productService.getAll();
    }

    // Apply filters
    if (exclude) {
      products = products.filter((product) => product.id !== exclude);
    }

    if (limit) {
      const limitNum = parseInt(limit, 10);
      products = products.slice(0, limitNum);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

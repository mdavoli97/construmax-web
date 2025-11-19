"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  Product,
  ProductImage as ProductImageType,
  CalculationDetail,
  Category,
  PriceGroup,
} from "@/types";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/ProductImageGallery";
import ChapasCalculator from "@/components/ChapasCalculator";
import { useExchangeRate, formatUYU, convertUSDToUYU } from "@/lib/currency";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductFamilyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = params.category as string;
  const subcategory = params.subcategory as string;

  // Leer search params para producto preseleccionado
  const preselectedProductId = searchParams.get("productId");
  const preselectedThickness = searchParams.get("thickness");
  const preselectedSize = searchParams.get("size");

  // Estados principales del producto
  const [product, setProduct] = useState<Product | null>(null); // Producto seleccionado por dimensiones
  const [products, setProducts] = useState<Product[]>([]); // Todos los productos de la familia
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [priceGroup, setPriceGroup] = useState<PriceGroup | null>(null);
  const [productImages, setProductImages] = useState<ProductImageType[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplyingPreselected, setIsApplyingPreselected] = useState(false);
  const [hasValidatedPreselected, setHasValidatedPreselected] = useState(false);

  // Estados para selección de dimensiones
  const [selectedSize, setSelectedSize] = useState<string>(
    preselectedSize || ""
  );
  const [selectedThickness, setSelectedThickness] = useState<string>(
    preselectedThickness || ""
  );

  // Estados para carrito (copiados de la vista original)
  const [quantity, setQuantity] = useState<string | number>(1);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculationDetails, setCalculationDetails] = useState<
    CalculationDetail[] | undefined
  >(undefined);

  const { addItem, getItemQuantity } = useCartStore();

  // Hook para cotización de dólar
  const { exchangeRate } = useExchangeRate();

  const currentQuantity = product ? getItemQuantity(product.id) : 0;

  // Función para actualizar la URL con los parámetros del producto seleccionado
  const updateURL = (
    productId: string | null,
    thickness: string | null,
    size: string | null
  ) => {
    // No actualizar URL si estamos aplicando preselección desde search params
    if (isApplyingPreselected) return;

    const params = new URLSearchParams();

    if (productId) {
      params.set("productId", productId);
    }

    if (thickness) {
      params.set("thickness", thickness);
    }

    if (size) {
      params.set("size", size);
    }

    const queryString = params.toString();
    const newURL = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    // Usar replace para no agregar al historial del navegador
    router.replace(newURL);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [category, subcategory]);

  // Seleccionar producto preseleccionado cuando se cargan los productos
  useEffect(() => {
    console.log("Preselected values:", {
      productId: preselectedProductId,
      thickness: preselectedThickness,
      size: preselectedSize,
    });

    if (preselectedProductId && products.length > 0) {
      const targetProduct = products.find((p) => p.id === preselectedProductId);
      console.log("Found target product:", targetProduct);

      if (targetProduct) {
        setProduct(targetProduct);
        loadProductImages(targetProduct.id);

        // Asegurar que los valores de thickness y size se mantengan
        console.log(
          "Setting preselected values - thickness:",
          preselectedThickness,
          "size:",
          preselectedSize
        );
      }
    }
  }, [preselectedProductId, products, preselectedThickness, preselectedSize]);

  // Validar y ajustar valores preseleccionados contra opciones disponibles
  useEffect(() => {
    if (
      products.length > 0 &&
      (preselectedThickness || preselectedSize) &&
      !hasValidatedPreselected
    ) {
      console.log("=== Validating preselected values ===");
      console.log("Preselected thickness:", preselectedThickness);
      console.log("Preselected size:", preselectedSize);
      console.log("Current selectedThickness:", selectedThickness);
      console.log("Current selectedSize:", selectedSize);

      setIsApplyingPreselected(true);

      // Obtener opciones disponibles
      const availableThicknesses = getThicknessOptions();
      const allAvailableSizes = getSizeOptions(); // Todos los tamaños sin filtro

      console.log("Available thicknesses:", availableThicknesses);
      console.log("All available sizes:", allAvailableSizes);

      // Primero validar y establecer thickness
      let finalThickness = selectedThickness;
      if (preselectedThickness) {
        if (availableThicknesses.includes(preselectedThickness)) {
          console.log(
            "✅ Setting exact thickness match:",
            preselectedThickness
          );
          if (selectedThickness !== preselectedThickness) {
            setSelectedThickness(preselectedThickness);
          }
          finalThickness = preselectedThickness;
        } else {
          console.log(
            "❌ Preselected thickness not found, trying partial matches"
          );
          console.log("Looking for partial match in:", availableThicknesses);
          const matchingThickness = availableThicknesses.find((t) => {
            const match1 = t.includes(preselectedThickness);
            const match2 = preselectedThickness.includes(t);
            console.log(
              `Comparing "${t}" with "${preselectedThickness}": includes1=${match1}, includes2=${match2}`
            );
            return match1 || match2;
          });
          if (matchingThickness) {
            console.log("✅ Found partial thickness match:", matchingThickness);
            if (selectedThickness !== matchingThickness) {
              setSelectedThickness(matchingThickness);
            }
            finalThickness = matchingThickness;
          } else {
            console.log("❌ No thickness match found");
          }
        }
      }

      // Luego validar size - usar finalThickness si está disponible
      if (preselectedSize) {
        // Obtener tamaños para el espesor final (si hay uno)
        const sizesForThickness = finalThickness
          ? getSizeOptions(finalThickness)
          : allAvailableSizes;
        console.log(
          "Sizes for thickness",
          finalThickness,
          ":",
          sizesForThickness
        );

        if (sizesForThickness.includes(preselectedSize)) {
          console.log("✅ Setting exact size match:", preselectedSize);
          if (selectedSize !== preselectedSize) {
            setSelectedSize(preselectedSize);
          }
        } else {
          console.log("❌ Preselected size not found, trying partial matches");
          console.log("Looking for partial match in:", sizesForThickness);
          const matchingSize = sizesForThickness.find((s) => {
            const match1 = s.includes(preselectedSize);
            const match2 = preselectedSize.includes(s);
            console.log(
              `Comparing "${s}" with "${preselectedSize}": includes1=${match1}, includes2=${match2}`
            );
            return match1 || match2;
          });
          if (matchingSize) {
            console.log("✅ Found partial size match:", matchingSize);
            if (selectedSize !== matchingSize) {
              setSelectedSize(matchingSize);
            }
          } else {
            console.log("❌ No size match found");
          }
        }
      }

      console.log("=== End validation ===");

      // Marcar como validado para evitar ejecutar nuevamente
      setHasValidatedPreselected(true);

      // Limpiar la bandera después de un breve delay para asegurar que todos los efectos se ejecuten
      setTimeout(() => {
        setIsApplyingPreselected(false);
      }, 100);
    }
  }, [
    products,
    preselectedThickness,
    preselectedSize,
    hasValidatedPreselected,
  ]);

  // Debug useEffect para monitorear el estado del Select
  useEffect(() => {
    console.log("🔍 Select state debug:", {
      selectedSize,
      selectedThickness,
      hasThickness: hasThickness(),
      isDisabled: hasThickness() && !selectedThickness,
      availableSizes:
        !hasThickness() || selectedThickness
          ? getSizeOptions(hasThickness() ? selectedThickness : undefined)
          : [],
    });
  }, [selectedSize, selectedThickness]);

  // Actualizar producto seleccionado cuando cambian las dimensiones
  useEffect(() => {
    if (!products.length) return;

    const needsThickness = hasThickness();
    const needsSize = hasSize();

    // Si no hay dimensiones, seleccionar el primer producto
    if (!needsThickness && !needsSize) {
      const firstProduct = products[0];
      setProduct(firstProduct);
      if (firstProduct) {
        loadProductImages(firstProduct.id);
        // Actualizar URL con el producto seleccionado
        updateURL(firstProduct.id, null, null);
      }
      return;
    }

    // Buscar producto basado en las dimensiones disponibles
    let selectedProduct = null;

    if (needsThickness && needsSize) {
      // Ambas dimensiones requeridas
      if (selectedThickness && selectedSize) {
        selectedProduct = products.find(
          (p) => p.size === selectedSize && p.thickness === selectedThickness
        );
      }
    } else if (needsThickness && !needsSize) {
      // Solo espesor requerido
      if (selectedThickness) {
        selectedProduct = products.find(
          (p) => p.thickness === selectedThickness
        );
      }
    } else if (!needsThickness && needsSize) {
      // Solo tamaño requerido
      if (selectedSize) {
        selectedProduct = products.find((p) => p.size === selectedSize);
      }
    }

    setProduct(selectedProduct || null);

    // Si encontramos un producto, cargar sus imágenes y actualizar URL
    if (selectedProduct) {
      loadProductImages(selectedProduct.id);
      // Actualizar URL con el producto y dimensiones seleccionadas
      updateURL(selectedProduct.id, selectedThickness, selectedSize);
    } else {
      // Si no hay producto seleccionado pero hay dimensiones, limpiar productId de la URL
      if (selectedThickness || selectedSize) {
        updateURL(null, selectedThickness, selectedSize);
      }
    }
  }, [selectedSize, selectedThickness, products]);

  // Limpiar selección de tamaño cuando cambia el espesor (pero no durante preselección)
  useEffect(() => {
    // No ejecutar durante la preselección inicial o si aún no hemos validado
    if (isApplyingPreselected || !hasValidatedPreselected) {
      console.log(
        "Skipping size cleanup - applying preselected values or not validated yet"
      );
      return;
    }

    if (selectedThickness && selectedSize) {
      // Verificar si la combinación actual sigue siendo válida
      const availableSizes = getSizeOptions(selectedThickness);
      if (!availableSizes.includes(selectedSize)) {
        console.log("Clearing size - not available for current thickness");
        setSelectedSize("");
      }
    } else if (selectedThickness && products.length > 0) {
      // Solo limpiar tamaño si ya pasamos la validación inicial
      console.log("Clearing size - thickness changed after validation");
      setSelectedSize("");
    }
  }, [
    selectedThickness,
    products,
    isApplyingPreselected,
    hasValidatedPreselected,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar categorías usando el servicio
      const { categoryService } = await import("@/lib/services");
      const categoriesData = await categoryService.getAll();
      const categoryData = categoriesData.find(
        (cat: Category) => cat.slug === category
      );
      setCategoryInfo(categoryData || null);

      // Cargar productos de la categoría usando el servicio con dimensiones
      const { productService } = await import("@/lib/services");
      const productsData = await productService.getByCategoryWithDimensions(
        category
      );

      // Cargar grupos de precios
      const priceGroupsResponse = await fetch(
        `/api/price-groups?category=${category}`
      );
      const priceGroupsData = await priceGroupsResponse.json();

      if (priceGroupsData.success) {
        const selectedPriceGroup = priceGroupsData.data.find(
          (group: PriceGroup) => group.id === subcategory
        );
        setPriceGroup(selectedPriceGroup);

        console.log(productsData);

        // Filtrar productos que pertenecen a este grupo de precios
        const familyProducts = productsData.filter(
          (product: Product) => product.price_group_id === subcategory
        );

        setProducts(familyProducts);

        // Cargar imágenes del primer producto (ya que todos comparten la misma imagen)
        if (familyProducts.length > 0) {
          loadProductImages(familyProducts[0].id);
        }

        // Cargar productos relacionados (de la misma categoría pero diferentes subcategorías)
        const relatedProductsData = productsData
          .filter((product: Product) => product.price_group_id !== subcategory)
          .slice(0, 4);
        setRelatedProducts(relatedProductsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const loadProductImages = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/images`);
      if (response.ok) {
        const imageData = await response.json();
        setProductImages(imageData);
      }
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  // Obtener opciones únicas de size y thickness
  const getSizeOptions = (forThickness?: string) => {
    let filteredProducts = products;

    // Si se especifica un espesor, filtrar productos por ese espesor
    if (forThickness) {
      filteredProducts = products.filter((p) => p.thickness === forThickness);
    }

    const sizes = filteredProducts
      .map((p) => p.size)
      .filter((size): size is string => Boolean(size) && size?.trim() !== "");

    return [...new Set(sizes)].sort((a, b) => {
      // Extraer y convertir dimensiones, fracciones, números mixtos y números decimales
      const getNumericValue = (str: string) => {
        // Buscar dimensiones como 20x50, 30x70, etc.
        const dimensionMatch = str.match(/(\d+)x(\d+)/i);
        if (dimensionMatch) {
          const width = parseInt(dimensionMatch[1]);
          const height = parseInt(dimensionMatch[2]);
          // Priorizar por ancho, luego por alto
          return width * 1000 + height;
        }

        // Buscar números mixtos como 1¼, 1½, 1¾, 2¼, etc.
        const mixedMatch = str.match(/(\d+)([¼½¾⅛⅜⅝⅞])/);
        if (mixedMatch) {
          const wholeNumber = parseInt(mixedMatch[1]);
          const fraction = mixedMatch[2];

          // Mapeo de caracteres Unicode a valores decimales
          const fractionMap: { [key: string]: number } = {
            "¼": 0.25, // 1/4
            "½": 0.5, // 1/2
            "¾": 0.75, // 3/4
            "⅛": 0.125, // 1/8
            "⅜": 0.375, // 3/8
            "⅝": 0.625, // 5/8
            "⅞": 0.875, // 7/8
          };

          return wholeNumber + (fractionMap[fraction] || 0);
        }

        // Buscar fracciones simples como 1/2, 3/8, etc.
        const fractionMatch = str.match(/(\d+)\/(\d+)/);
        if (fractionMatch) {
          const numerator = parseInt(fractionMatch[1]);
          const denominator = parseInt(fractionMatch[2]);
          return numerator / denominator;
        }

        // Buscar números decimales o enteros
        const decimalMatch = str.match(/(\d+(?:\.\d+)?)/);
        return decimalMatch ? parseFloat(decimalMatch[1]) : 0;
      };

      const numA = getNumericValue(a);
      const numB = getNumericValue(b);

      return numA - numB;
    });
  };

  const getThicknessOptions = () => {
    console.log("Getting thickness options", products);
    const thicknesses = products
      .map((p) => p.thickness)
      .filter(
        (thickness): thickness is string =>
          Boolean(thickness) && thickness?.trim() !== ""
      );

    return [...new Set(thicknesses)].sort((a, b) => {
      // Extraer y convertir dimensiones, fracciones, números mixtos y números decimales
      const getNumericValue = (str: string) => {
        // Buscar dimensiones como 20x50, 30x70, etc.
        const dimensionMatch = str.match(/(\d+)x(\d+)/i);
        if (dimensionMatch) {
          const width = parseInt(dimensionMatch[1]);
          const height = parseInt(dimensionMatch[2]);
          // Priorizar por ancho, luego por alto
          return width * 1000 + height;
        }

        // Buscar números mixtos como 1¼, 1½, 1¾, 2¼, etc.
        const mixedMatch = str.match(/(\d+)([¼½¾⅛⅜⅝⅞])/);
        if (mixedMatch) {
          const wholeNumber = parseInt(mixedMatch[1]);
          const fraction = mixedMatch[2];

          // Mapeo de caracteres Unicode a valores decimales
          const fractionMap: { [key: string]: number } = {
            "¼": 0.25, // 1/4
            "½": 0.5, // 1/2
            "¾": 0.75, // 3/4
            "⅛": 0.125, // 1/8
            "⅜": 0.375, // 3/8
            "⅝": 0.625, // 5/8
            "⅞": 0.875, // 7/8
          };

          return wholeNumber + (fractionMap[fraction] || 0);
        }

        // Buscar fracciones simples como 1/2, 3/8, etc.
        const fractionMatch = str.match(/(\d+)\/(\d+)/);
        if (fractionMatch) {
          const numerator = parseInt(fractionMatch[1]);
          const denominator = parseInt(fractionMatch[2]);
          return numerator / denominator;
        }

        // Buscar números decimales (con coma o punto)
        const decimalMatch = str.match(/(\d+(?:[.,]\d+)?)/);
        return decimalMatch ? parseFloat(decimalMatch[1].replace(",", ".")) : 0;
      };

      const numA = getNumericValue(a);
      const numB = getNumericValue(b);

      return numA - numB;
    });
  };

  // Funciones para determinar qué dimensiones están disponibles
  const hasThickness = () => priceGroup?.thickness === true;
  const hasSize = () => priceGroup?.size === true;

  // Función para determinar si es necesario seleccionar dimensiones
  const needsDimensionSelection = () => {
    return hasThickness() || hasSize();
  };

  // Función para determinar si todas las dimensiones requeridas están seleccionadas
  const areRequiredDimensionsSelected = () => {
    const needsThickness = hasThickness();
    const needsSize = hasSize();

    if (!needsThickness && !needsSize) {
      // Si no hay dimensiones, seleccionar el primer producto disponible
      return products.length > 0;
    }

    if (needsThickness && needsSize) {
      return selectedThickness && selectedSize;
    }

    if (needsThickness && !needsSize) {
      return selectedThickness;
    }

    if (!needsThickness && needsSize) {
      return selectedSize;
    }

    return false;
  };

  // Funciones copiadas de ProductDetailPage
  const roundToTwoDecimals = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const getQuantityAsNumber = (): number => {
    if (typeof quantity === "string") {
      const parsed = parseFloat(quantity);
      return isNaN(parsed) ? 0 : roundToTwoDecimals(parsed);
    }
    return roundToTwoDecimals(quantity);
  };

  const handleQuantityInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setQuantity(value === "" ? "" : parseFloat(value));
    }
  };

  const getProductType = (product: Product) => {
    return product.product_type || "standard";
  };

  const getMaxQuantity = (product: Product | null) => {
    if (!product) return 1000;

    if (product.stock_type === "availability") {
      return product.is_available ? 1000 : 0;
    }

    return product.stock || 0;
  };

  const isInStock = (product: Product | null): boolean => {
    if (!product) return false;

    if (product.stock_type === "availability") {
      return product.is_available || false;
    }

    return product.stock > 0;
  };

  const handleAddToCart = () => {
    if (!product) {
      alert("Por favor selecciona las dimensiones del producto");
      return;
    }

    const quantityNum = getQuantityAsNumber();
    if (quantityNum <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    const isChapas = getProductType(product) === "chapas_conformadas";
    const minValue = isChapas ? 0.1 : 1;

    if (quantityNum < minValue) {
      alert(`La cantidad mínima es ${minValue}`);
      setQuantity(minValue);
      return;
    }

    addItem(product, quantityNum, calculationDetails);

    // Feedback visual
    const button = document.querySelector(".add-to-cart-btn");
    if (button) {
      const originalText = button.textContent;
      button.textContent = "✓ Agregado";
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  };

  const formatPrice = (price: number, currency: "USD" | "UYU" = "USD") => {
    if (!exchangeRate && currency === "USD") {
      return "Cargando...";
    }

    if (currency === "UYU") {
      return formatUYU(price);
    }

    return formatUYU(convertUSDToUYU(price, exchangeRate!.usd_to_uyu));
  };

  const formatPriceWithIVA = (
    price: number,
    currency: "USD" | "UYU" = "USD"
  ) => {
    const priceWithIVA = price * 1.22; // 22% IVA
    return formatPrice(priceWithIVA, currency);
  };

  // Calcular rango de precios
  const getPriceRange = () => {
    if (products.length === 0) return "Consultar precio";

    const prices = products
      .map((p) => {
        const currency = p.price_group?.currency || "USD";
        let priceUYU = p.price;

        if (currency === "USD" && exchangeRate) {
          priceUYU = convertUSDToUYU(p.price, exchangeRate.usd_to_uyu);
        }

        return priceUYU * 1.22; // Con IVA
      })
      .filter((price) => price > 0);

    if (prices.length === 0) return "Consultar precio";

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return formatUYU(minPrice);
    }

    return `${formatUYU(minPrice)} - ${formatUYU(maxPrice)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  console.log(products);

  if (error || !priceGroup || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Producto no encontrado"}
          </h3>
          <p className="text-gray-600 mb-4">
            El producto que buscas no existe o no está disponible.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }

  const displayProduct = product || products[0]; // Usar el primer producto para mostrar info general

  // Prevenir flash de imagen durante carga inicial
  if (loading || !displayProduct || !priceGroup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link
            href="/"
            className="hover:text-orange-600 transition-colors flex items-center"
          >
            <HomeIcon className="h-4 w-4 mr-1" />
            Inicio
          </Link>
          <span>›</span>
          <Link
            href="/productos"
            className="hover:text-orange-600 transition-colors"
          >
            Productos
          </Link>
          <span>›</span>
          <Link
            href={`/productos/${category}`}
            className="hover:text-orange-600 transition-colors"
          >
            {categoryInfo?.name}
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{priceGroup.name}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={`/productos/${category}`}
            className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a {categoryInfo?.name}
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Section */}
          <div className="order-1 lg:order-1">
            {displayProduct ? (
              <ProductImageGallery
                product={displayProduct}
                productImages={productImages}
              />
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl text-gray-400 mb-4 block">📦</span>
                  <p className="text-gray-500">Sin imagen disponible</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="order-2 lg:order-2 space-y-6">
            {/* Product Title and Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {product?.name || priceGroup.name}
              </h1>
              {priceGroup.description && (
                <p className="text-gray-600 text-sm sm:text-base">
                  {priceGroup.description}
                </p>
              )}
              {displayProduct?.brand && (
                <p className="text-sm text-gray-500 mt-2">
                  Marca: {displayProduct.brand}
                </p>
              )}
            </div>

            {/* Price Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">
                Precio (IVA incluido)
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {product
                  ? formatPriceWithIVA(
                      product.price,
                      product.price_group?.currency
                    )
                  : getPriceRange()}
              </div>
              {!product && needsDimensionSelection() && (
                <div className="text-sm text-gray-500 mt-1">
                  {hasThickness() &&
                    hasSize() &&
                    "Selecciona el espesor y tamaño para ver el precio exacto"}
                  {hasThickness() &&
                    !hasSize() &&
                    "Selecciona el espesor para ver el precio exacto"}
                  {!hasThickness() &&
                    hasSize() &&
                    "Selecciona el tamaño para ver el precio exacto"}
                </div>
              )}
            </div>

            {/* Stock Status */}
            {product && (
              <div
                className={`p-3 rounded-md ${
                  isInStock(product)
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                <p className="text-sm font-medium">
                  {isInStock(product) ? "✓ En stock" : "✗ Sin stock"}
                </p>
              </div>
            )}

            {/* Dimension Selectors */}
            {needsDimensionSelection() && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Selecciona las dimensiones
                </h3>

                <div className="space-y-4">
                  {/* Thickness Selector - Solo mostrar si está habilitado */}
                  {hasThickness() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Espesor
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getThicknessOptions().map((thickness) => (
                          <Badge
                            key={thickness}
                            variant={
                              selectedThickness === thickness
                                ? "default"
                                : "outline"
                            }
                            className={`cursor-pointer hover:bg-primary/90 text-base font-bold px-4 py-1.5 ${
                              selectedThickness === thickness
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                            onClick={() => setSelectedThickness(thickness)}
                          >
                            {thickness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selector - Solo mostrar si está habilitado */}
                  {hasSize() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tamaño
                        {hasThickness() && !selectedThickness && (
                          <span className="text-xs text-gray-500 ml-2">
                            (Selecciona un espesor primero)
                          </span>
                        )}
                      </label>
                      <Select
                        value={selectedSize}
                        onValueChange={(value) => {
                          console.log(
                            "Select onValueChange triggered with:",
                            value
                          );
                          setSelectedSize(value);
                        }}
                        disabled={hasThickness() && !selectedThickness}
                      >
                        <SelectTrigger
                          className={`w-full ${
                            hasThickness() && !selectedThickness
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              hasThickness() && !selectedThickness
                                ? "Primero selecciona un espesor"
                                : "Selecciona tamaño"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {(!hasThickness() || selectedThickness) &&
                            getSizeOptions(
                              hasThickness() ? selectedThickness : undefined
                            ).map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart - Siempre visible pero deshabilitado si no hay producto */}
            <div className="space-y-4">
              {/* Información contextual sobre opciones de cantidad - Solo para productos con calculadora */}
              {product && getProductType(product) === "chapas_conformadas" && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <span className="font-medium">
                      💡 Opciones para agregar cantidad:
                    </span>
                    <br />• Puedes escribir la cantidad directamente en el campo
                    <br />• O usar nuestra calculadora de chapas para cálculos
                    automáticos
                  </p>
                </div>
              )}

              {/* Mensaje cuando no hay producto seleccionado */}
              {!product && needsDimensionSelection() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    <span className="font-medium">
                      ⚠️ Selecciona las dimensiones para continuar
                    </span>
                    <br />
                    {hasThickness() &&
                      !selectedThickness &&
                      "• Elige un espesor"}
                    {hasThickness() &&
                      selectedThickness &&
                      hasSize() &&
                      !selectedSize &&
                      "• Elige un tamaño"}
                  </p>
                </div>
              )}

              <div className="flex flex-col w-full sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  Cantidad:
                </span>
                <div
                  className={`flex items-center justify-between border border-gray-300 rounded-md w-full md:w-fit ${
                    !product ? "opacity-50" : ""
                  }`}
                >
                  <button
                    onClick={() => {
                      if (!product) return;
                      const quantityNum = getQuantityAsNumber();
                      const isChapas =
                        getProductType(product) === "chapas_conformadas";
                      const step = isChapas ? 0.1 : 1;
                      const minValue = isChapas ? 0.1 : 1;
                      const newValue = Math.max(minValue, quantityNum - step);
                      setQuantity(Math.round(newValue * 100) / 100);
                    }}
                    className="p-2 sm:p-3 hover:bg-gray-100 transition-colors flex-shrink-0"
                    disabled={!product}
                  >
                    <MinusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityInputChange}
                    min="0"
                    step={
                      product &&
                      getProductType(product) === "chapas_conformadas"
                        ? "0.1"
                        : "1"
                    }
                    className="w-20 sm:w-24 text-center font-medium text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    disabled={!product}
                  />
                  <button
                    onClick={() => {
                      if (!product) return;
                      const quantityNum = getQuantityAsNumber();
                      const isChapas =
                        getProductType(product) === "chapas_conformadas";
                      const step = isChapas ? 0.1 : 1;
                      const maxQuantity = getMaxQuantity(product);
                      const newValue = Math.min(
                        maxQuantity,
                        quantityNum + step
                      );
                      setQuantity(Math.round(newValue * 100) / 100);
                    }}
                    className="p-2 sm:p-3 hover:bg-gray-100 transition-colors flex-shrink-0"
                    disabled={
                      !product ||
                      getQuantityAsNumber() >= getMaxQuantity(product)
                    }
                  >
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>

                {/* Calculadora para chapas conformadas */}
                {product &&
                  getProductType(product) === "chapas_conformadas" && (
                    <button
                      onClick={() => setShowCalculator(!showCalculator)}
                      className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      🧮 Calculadora
                    </button>
                  )}
              </div>

              {/* Calculadora para chapas conformadas */}
              {showCalculator &&
                product &&
                getProductType(product) === "chapas_conformadas" && (
                  <ChapasCalculator
                    onCalculateResult={(
                      result: number,
                      details?: CalculationDetail[]
                    ) => {
                      setQuantity(Math.round(result * 100) / 100);
                      setCalculationDetails(details);
                    }}
                    onClose={() => setShowCalculator(false)}
                  />
                )}

              {/* Total Price */}
              <div
                className={`bg-gray-50 p-3 sm:p-4 rounded-md ${
                  !product ? "opacity-50" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 text-sm sm:text-base">
                    Total:
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-orange-600">
                    {product
                      ? formatPriceWithIVA(
                          product.price * getQuantityAsNumber(),
                          product.price_group?.currency
                        )
                      : getPriceRange()}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className={`add-to-cart-btn w-full font-semibold py-3 px-6 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                  !product || getQuantityAsNumber() <= 0
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
                disabled={!product || getQuantityAsNumber() <= 0}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {!product ? "Selecciona un producto" : "Agregar al Carrito"}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {/* {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Otras familias de productos en {categoryInfo?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}

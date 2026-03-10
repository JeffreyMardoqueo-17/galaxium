"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Trash2, Search, ShoppingCart, AlertCircle, Barcode, X } from "lucide-react";
import BarcodeScanner from "@/components/features/BarcodeScanner";

import { ProductResponse } from "@/types/product";
import { CustomerResponseDTO } from "@/types/custoner";
import { PaymentMethodResponse } from "@/types/PaymentMethod";
import { CategoryRead } from "@/types/category";

import { SaleCreateDto } from "@/types/sale";
import { getProductsByFilter, getProducts } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { GetAllCustomers } from "@/services/customer.service";
import { getPaymentMethods } from "@/services/paymentMethod.service";
import { createSale } from "@/services/sale.service";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  stock?: number | null;
  quantity: number;
  barCode: string;
}

export default function Page() {
  // Data loading
  const [products, setProducts] = React.useState<ProductResponse[]>([]);
  const [customers, setCustomers] = React.useState<CustomerResponseDTO[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethodResponse[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);
  
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [paymentMethodId, setPaymentMethodId] = React.useState(0);
  const [customerId, setCustomerId] = React.useState<number | null>(null);
  const [discount, setDiscount] = React.useState(0);
  const [amountPaid, setAmountPaid] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Category filter
  const [categories, setCategories] = React.useState<CategoryRead[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(0);
  const [filteredProducts, setFilteredProducts] = React.useState<ProductResponse[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

  // Barcode scanner
  const [barcodeInput, setBarcodeInput] = React.useState("");
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);
  const [showScanner, setShowScanner] = React.useState(false);

  // Customer search
  const [customerSearch, setCustomerSearch] = React.useState("");
  const [filteredCustomers, setFilteredCustomers] = React.useState<CustomerResponseDTO[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = React.useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = React.useState("");

  // Load all data
  React.useEffect(() => {
    async function loadAllData() {
      setLoadingData(true);
      try {
        const [productsData, customersData, paymentMethodsData, categoriesData] = await Promise.all([
          getProducts(),
          GetAllCustomers(),
          getPaymentMethods(),
          getCategories(),
        ]);
        
        setProducts(productsData || []);
        setCustomers(customersData || []);
        setPaymentMethods(paymentMethodsData || []);
        setCategories(categoriesData || []);
        setFilteredProducts(productsData || []);
      } catch (error) {
        console.error("Error cargando datos", error);
        setProducts([]);
        setCustomers([]);
        setPaymentMethods([]);
        setCategories([]);
      } finally {
        setLoadingData(false);
        setLoadingCategories(false);
      }
    }
    loadAllData();
  }, []);
  // ===============================
  // FILTER PRODUCTS BY CATEGORY
  // ===============================
  React.useEffect(() => {
    async function filterProducts() {
      if (selectedCategoryId === 0) {
        setFilteredProducts(products);
      } else {
        try {
          const filtered = await getProductsByFilter({
            categoryId: selectedCategoryId,
            isActive: true,
            pageSize: 100,
          });
          setFilteredProducts(filtered || []);
        } catch (error) {
          console.error("Error filtrando productos", error);
          setFilteredProducts([]);
        }
      }
    }
    filterProducts();
  }, [selectedCategoryId, products]);

  // CUSTOMER SEARCH
  // ===============================
  React.useEffect(() => {
    if (!customerSearch.trim()) {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
      return;
    }

    const search = customerSearch.toLowerCase();
    const filtered = (customers || []).filter((c) =>
      c.fullName.toLowerCase().includes(search)
    );
    setFilteredCustomers(filtered);
    setShowCustomerDropdown(true);
  }, [customerSearch, customers]);

  function selectCustomer(customer: CustomerResponseDTO) {
    setCustomerId(customer.id);
    setSelectedCustomerName(customer.fullName);
    setCustomerSearch("");
    setShowCustomerDropdown(false);
  }
  // ===============================
  // BARCODE SCANNER
  // ===============================
  function handleBarcodeInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const code = barcodeInput.trim();
      if (!code) return;

      const product = filteredProducts.find((p) => p.barcode === code);
      if (product) {
        addProductFromBarcode(product.id, product);
        setBarcodeInput("");
      } else {
        alert(`Producto con código ${code} no encontrado`);
        setBarcodeInput("");
      }
    }
  }

  function addProductFromBarcode(productId: number, product: ProductResponse) {
    setCart((prev) => {
      const exists = prev.find((x) => x.productId === productId);

      if (exists) {
        return prev.map((x) =>
          x.productId === productId
            ? { ...x, quantity: x.quantity + 1 }
            : x
        );
      }

      return [
        ...prev,
        {
          productId,
          name: product.name,
          price: product.salePrice ?? 0,
          stock: product.stock,
          quantity: 1,
          barCode: product.barcode || "",
        },
      ];
    });
  }
  // ===============================
  // BARCODE CAMERA SCANNER
  // ===============================
  const handleBarcodeDetected = (code: string) => {
    console.log("[SALE] Código detectado:", code);
    setShowScanner(false);

    // Buscar producto por código de barras
    const product = products.find(
      (p) => p.barcode?.toLowerCase() === code.toLowerCase()
    );
    
    if (product) {
      addProductFromBarcode(product.id, product);
      // Mostrar notificación visual
      // alert(`✓ Producto agregado: ${product.name}`);
    } else {
      // alert(`❌ No se encontró producto con código: ${code}`);
    }
  };

  const handleScannerError = (message: string) => {
    console.error("[SALE] Error escáner:", message);
  };

  // ===============================
  // ADD PRODUCT
  // ===============================
  function addProduct(productId: number) {
    const product = filteredProducts.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const exists = prev.find((x) => x.productId === productId);

      if (exists) {
        return prev.map((x) =>
          x.productId === productId
            ? { ...x, quantity: x.quantity + 1 }
            : x
        );
      }

      return [
        ...prev,
        {
          productId,
          name: product.name,
          price: product.salePrice ?? 0,
          quantity: 1,
          barCode: product.barcode || "",
        },
      ];
    });
  }

  function removeProduct(productId: number) {
    setCart((prev) => prev.filter((x) => x.productId !== productId));
  }

  function updateQty(productId: number, qty: number) {
    setCart((prev) =>
      prev.map((x) =>
        x.productId === productId
          ? { ...x, quantity: Math.max(1, qty) }
          : x
      )
    );
  }

  // ===============================
  // TOTALS
  // ===============================
  const subTotal = React.useMemo(
    () =>
      cart.reduce((sum, x) => sum + x.price * x.quantity, 0),
    [cart]
  );

  const total = subTotal - discount;
  const changeAmount = amountPaid > total ? amountPaid - total : 0;

  // ===============================
  // SUBMIT
  // ===============================
  async function handleSubmit() {
    if (!cart.length) {
      alert("Agrega productos al carrito");
      return;
    }

    if (!paymentMethodId) {
      alert("Selecciona un método de pago");
      return;
    }

    const dto: SaleCreateDto = {
      customerId: customerId || undefined,
      paymentMethodId,
      discount,
      amountPaid: amountPaid || undefined,
      details: cart.map((x) => ({
        productId: x.productId,
        quantity: x.quantity,
      })),
    };

    setIsSubmitting(true);
    try {
      await createSale(dto);
      alert("Venta registrada exitosamente");
      
      // Reset form
      setCart([]);
      setBarcodeInput("");
      setPaymentMethodId(0);
      setCustomerId(null);
      setDiscount(0);
      setAmountPaid(0);
    } catch (error) {
      console.error("Error registrando venta:", error);
      alert("Error al registrar la venta");
    } finally {
      setIsSubmitting(false);
    }
  }

  // // Loading state
  // if (loadingData) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Cargando datos...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          💰 Registrar Venta
        </h1>
        <p className="text-gray-600">
          Selecciona categoría, escanea productos y procesa el pago
        </p>
      </div>

      {/* CONTENT */}
      <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  
                  {/* LEFT: PRODUCTS */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* CATEGORY FILTER */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        📁 Filtrar por Categoría
                      </label>
                      <SelectPrimitive.Root
                        value={selectedCategoryId.toString()}
                        onValueChange={(val) => setSelectedCategoryId(Number(val))}
                        disabled={loadingCategories}
                      >
                        <SelectPrimitive.Trigger className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white hover:border-gray-400">
                          <SelectPrimitive.Value placeholder="Todas las categorías" />
                          <SelectPrimitive.Icon>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </SelectPrimitive.Icon>
                        </SelectPrimitive.Trigger>
                        <SelectPrimitive.Content className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl z-50">
                          <SelectPrimitive.Viewport>
                            <SelectPrimitive.Item
                              value="0"
                              className="relative flex cursor-pointer select-none items-center rounded px-3 py-2.5 text-gray-900 hover:bg-green-50 data-[highlighted]:bg-green-600 data-[highlighted]:text-white transition mx-1 my-1"
                            >
                              <SelectPrimitive.ItemText>Todas las categorías</SelectPrimitive.ItemText>
                            </SelectPrimitive.Item>
                            {(categories || []).map((cat) => (
                              <SelectPrimitive.Item
                                key={cat.id}
                                value={cat.id.toString()}
                                className="relative flex cursor-pointer select-none items-center rounded px-3 py-2.5 text-gray-900 hover:bg-green-50 data-[highlighted]:bg-green-600 data-[highlighted]:text-white transition mx-1 my-1"
                              >
                                <SelectPrimitive.ItemText>{cat.name}</SelectPrimitive.ItemText>
                              </SelectPrimitive.Item>
                            ))}
                          </SelectPrimitive.Viewport>
                        </SelectPrimitive.Content>
                      </SelectPrimitive.Root>
                    </div>

                    {/* BARCODE SCANNER */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-900">
                          📱 Escanear Código de Barras
                        </label>
                        {!showScanner && (
                          <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition text-sm font-medium"
                          >
                            <Barcode className="w-4 h-4" />
                            Abrir Cámara
                          </button>
                        )}
                      </div>

                      {/* SCANNER DE CÁMARA */}
                      {showScanner && (
                        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-purple-300">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-purple-900">Escanear con Cámara</h3>
                            <button
                              type="button"
                              onClick={() => setShowScanner(false)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <BarcodeScanner
                            onDetected={handleBarcodeDetected}
                            onError={handleScannerError}
                          />
                        </div>
                      )}

                      {/* INPUT MANUAL */}
                      <div className="relative">
                        <input
                          ref={barcodeInputRef}
                          type="text"
                          placeholder="O escribe el código y presiona Enter"
                          className="w-full px-4 py-4 pl-12 rounded-lg border-2 border-green-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          onKeyDown={handleBarcodeInput}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        💡 Usa la cámara o escribe manualmente y presiona Enter
                      </p>
                    </div>

                    {/* QUICK ADD PRODUCTS */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        ➕ O Selecciona Rápidamente
                      </label>
                      {(filteredProducts || []).length === 0 ? (
                        <div className="h-40 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <ShoppingCart className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">No existen productos para vender</p>
                            <p className="text-gray-500 text-sm mt-1">Crea productos primero en el inventario</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {(filteredProducts || []).slice(0, 9).map((product) => (
                            <button
                              key={product.id}
                              onClick={() => addProduct(product.id)}
                              className="p-3 rounded-lg border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition text-left text-sm group"
                            >
                              <p className="font-semibold text-gray-900 truncate group-hover:text-green-700">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                ${product.salePrice?.toFixed(2) || "0.00"}
                              </p>
                               <p className="text-xs text-gray-600 mt-1">
                                stock: {product.stock?.toFixed(2) || "0"}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: CART */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 sticky top-8 max-h-[calc(95vh-80px)] flex flex-col">
                      
                      {/* CART HEADER */}
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-gray-100">
                        <ShoppingCart className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          Carrito
                        </h3>
                        <span className="ml-auto bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                          {cart.length}
                        </span>
                      </div>

                      {/* CART ITEMS */}
                      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                        {cart.length === 0 ? (
                          <div className="text-center py-12">
                            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">
                              Carrito vacío
                            </p>
                          </div>
                        ) : (
                          cart.map((item) => (
                            <div
                              key={item.productId}
                              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {item.name}
                                </span>
                                 <span className="font-semibold text-gray-900 text-sm">
                                  {item.barCode}
                                </span>
                                <button
                                  onClick={() => removeProduct(item.productId)}
                                  className="p-1 hover:bg-red-100 rounded transition"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                                    className="px-2 py-1 hover:bg-gray-200 rounded transition"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateQty(item.productId, Number(e.target.value))
                                    }
                                    className="w-10 text-center border rounded px-1 py-1 text-sm"
                                  />
                                  <button
                                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                                    className="px-2 py-1 hover:bg-gray-200 rounded transition"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-semibold text-green-600 text-sm">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* DIVIDER */}
                      <div className="border-t-2 border-gray-200 my-4"></div>

                      {/* CUSTOMER & PAYMENT */}
                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Cliente (Opcional)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Busca por nombre"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                              value={customerSearch || selectedCustomerName}
                              onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                if (e.target.value === "") {
                                  setCustomerId(null);
                                  setSelectedCustomerName("");
                                }
                              }}
                              onFocus={() => customerSearch && setShowCustomerDropdown(true)}
                            />
                            {showCustomerDropdown && filteredCustomers.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                                {filteredCustomers.map((customer) => (
                                  <button
                                    key={customer.id}
                                    onClick={() => selectCustomer(customer)}
                                    className="w-full text-left px-3 py-2 hover:bg-green-50 transition text-sm border-b last:border-b-0 text-gray-900"
                                  >
                                    <p className="font-semibold">{customer.fullName}</p>
                                    {customer.email && (
                                      <p className="text-xs text-gray-600">{customer.email}</p>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                            {customerSearch && filteredCustomers.length === 0 && showCustomerDropdown && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
                                <p className="text-sm text-gray-500">No se encontraron clientes</p>
                              </div>
                            )}
                            {customerId && selectedCustomerName && (
                              <button
                                onClick={() => {
                                  setCustomerId(null);
                                  setSelectedCustomerName("");
                                  setCustomerSearch("");
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-red-600 transition"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Método de Pago <span className="text-red-500">*</span>
                          </label>
                          <SelectPrimitive.Root
                            value={paymentMethodId.toString()}
                            onValueChange={(val) =>
                              setPaymentMethodId(Number(val))
                            }
                          >
                            <SelectPrimitive.Trigger className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white text-sm">
                              <SelectPrimitive.Value placeholder="Selecciona" />
                              <SelectPrimitive.Icon>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </SelectPrimitive.Icon>
                            </SelectPrimitive.Trigger>
                            <SelectPrimitive.Content className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl z-50">
                              <SelectPrimitive.Viewport>
                                {(paymentMethods || []).map((p) => (
                                  <SelectPrimitive.Item
                                    key={p.id}
                                    value={p.id.toString()}
                                    className="relative flex cursor-pointer select-none items-center rounded px-3 py-2 text-gray-900 hover:bg-green-50 data-[highlighted]:bg-green-600 data-[highlighted]:text-white transition mx-1 my-1 text-sm"
                                  >
                                    <SelectPrimitive.ItemText>{p.name}</SelectPrimitive.ItemText>
                                  </SelectPrimitive.Item>
                                ))}
                              </SelectPrimitive.Viewport>
                            </SelectPrimitive.Content>
                          </SelectPrimitive.Root>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Descuento
                          </label>
                          <input
                            type="number"
                            placeholder="0.00"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                            value={discount}
                            onChange={(e) =>
                              setDiscount(Number(e.target.value) || 0)
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Cantidad Pagada
                          </label>
                          <input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-sm"
                            value={amountPaid}
                            onChange={(e) =>
                              setAmountPaid(Number(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>

                      {/* TOTALS */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Subtotal:</span>
                          <span className="font-semibold text-gray-900">
                            ${subTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Descuento:</span>
                          <span className="font-semibold text-red-600">
                            -${discount.toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-green-200 pt-2 flex justify-between mb-2">
                          <span className="font-bold text-gray-900">Total:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${total.toFixed(2)}
                          </span>
                        </div>
                        {amountPaid > 0 && (
                          <div className="space-y-2 pt-2 border-t border-green-200">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Pagado:</span>
                              <span className="font-semibold text-gray-900">
                                ${amountPaid.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm bg-white bg-opacity-50 px-2 py-1 rounded">
                              <span className="font-bold text-gray-900">Vuelto:</span>
                              <span className="text-xl font-bold text-blue-600">
                                ${changeAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="space-y-2">
                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || cart.length === 0}
                          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition"
                        >
                          {isSubmitting ? "Procesando..." : "✓ Registrar Venta"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

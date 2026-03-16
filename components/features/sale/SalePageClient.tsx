"use client";

import * as React from "react";
import toast from "react-hot-toast";
import {
  Barcode, Boxes, CreditCard, LayoutGrid,
  Receipt, ScanLine, Search, ShoppingCart,
  Trash2, UserPlus, UserRound, Wallet, X,
} from "lucide-react";
import BarcodeScanner from "@/components/features/BarcodeScanner";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { ProductResponse } from "@/types/product";
import { CustomerCreateRequestDTO, CustomerResponseDTO } from "@/types/custoner";
import { PaymentMethodResponse } from "@/types/PaymentMethod";
import { CategoryRead } from "@/types/category";

import { SaleCreateDto } from "@/types/sale";
import { createSale } from "@/services/sale.service";
import { createCustomer } from "@/services/customer.service";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  stock: number;
  quantity: number;
  barCode: string;
}

// Formateador de moneda reutilizable fuera del componente para evitar recreaciones
const fmt = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

type SalePageClientProps = {
  initialProducts: ProductResponse[];
  initialCustomers: CustomerResponseDTO[];
  initialPaymentMethods: PaymentMethodResponse[];
  initialCategories: CategoryRead[];
};

type ComboboxOption = {
  id: number;
  label: string;
};

export default function SalePageClient({
  initialProducts,
  initialCustomers,
  initialPaymentMethods,
  initialCategories,
}: SalePageClientProps) {
  const [products] = React.useState<ProductResponse[]>(initialProducts);
  const [customers, setCustomers] = React.useState<CustomerResponseDTO[]>(initialCustomers);
  const [paymentMethods] = React.useState<PaymentMethodResponse[]>(initialPaymentMethods);

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [paymentMethodId, setPaymentMethodId] = React.useState(0);
  const [customerId, setCustomerId] = React.useState<number | null>(null);
  const [discount, setDiscount] = React.useState(0);
  const [amountPaid, setAmountPaid] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [categories] = React.useState<CategoryRead[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(0);
  const [filteredProducts, setFilteredProducts] = React.useState<ProductResponse[]>(initialProducts);

  const [barcodeInput, setBarcodeInput] = React.useState("");
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);
  const [showScanner, setShowScanner] = React.useState(false);

  const [customerSearch, setCustomerSearch] = React.useState("");
  const [filteredCustomers, setFilteredCustomers] = React.useState<CustomerResponseDTO[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = React.useState(false);
  const [highlightedCustomerIndex, setHighlightedCustomerIndex] = React.useState(-1);
  const [selectedCustomerName, setSelectedCustomerName] = React.useState("");
  const customerSearchRef = React.useRef<HTMLInputElement>(null);
  const customerSearchContainerRef = React.useRef<HTMLDivElement>(null);

  // Formulario de creación rápida de cliente
  const [showNewCustomerForm, setShowNewCustomerForm] = React.useState(false);
  const [newCustomer, setNewCustomer] = React.useState({ name: "", phone: "", email: "" });
  const [isCreatingCustomer, setIsCreatingCustomer] = React.useState(false);

  const categoryOptions = React.useMemo<ComboboxOption[]>(
    () => [{ id: 0, label: "Todas las categorias" }, ...categories.map((category) => ({ id: category.id, label: category.name }))],
    [categories],
  );

  const paymentMethodOptions = React.useMemo<ComboboxOption[]>(
    () => paymentMethods.map((paymentMethod) => ({ id: paymentMethod.id, label: paymentMethod.name })),
    [paymentMethods],
  );

  const selectedCategory = React.useMemo(
    () => categoryOptions.find((category) => category.id === selectedCategoryId) ?? categoryOptions[0] ?? null,
    [categoryOptions, selectedCategoryId],
  );

  const selectedPaymentMethod = React.useMemo(
    () => paymentMethodOptions.find((paymentMethod) => paymentMethod.id === paymentMethodId) ?? null,
    [paymentMethodId, paymentMethodOptions],
  );

  const availableProductsCount = filteredProducts.length;
  const cartItemsCount = cart.reduce((s, i) => s + i.quantity, 0);

  React.useEffect(() => {
    // En esta vista se filtra localmente para mantener UX fluida y evitar fallos por sesión en requests cliente.
    const activeProducts = (products || []).filter((product) => product.isActive);

    if (selectedCategoryId === 0) {
      setFilteredProducts(activeProducts);
      return;
    }

    const localFiltered = activeProducts.filter(
      (product) => product.categoryId === selectedCategoryId,
    );
    setFilteredProducts(localFiltered);
  }, [selectedCategoryId, products]);

  React.useEffect(() => {
    if (!customerSearch.trim()) {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
      setHighlightedCustomerIndex(-1);
      return;
    }

    const search = customerSearch.toLowerCase();
    const filtered = (customers || []).filter((c) =>
      c.fullName.toLowerCase().includes(search)
    );
    setFilteredCustomers(filtered);
    setShowCustomerDropdown(true);
    setHighlightedCustomerIndex(filtered.length > 0 ? 0 : -1);
  }, [customerSearch, customers]);

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (customerSearchContainerRef.current && !customerSearchContainerRef.current.contains(target)) {
        setShowCustomerDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function selectCustomer(customer: CustomerResponseDTO) {
    setCustomerId(customer.id);
    setSelectedCustomerName(customer.fullName);
    setCustomerSearch("");
    setShowCustomerDropdown(false);
    setShowNewCustomerForm(false);
  }

  function clearCustomer() {
    setCustomerId(null);
    setSelectedCustomerName("");
    setCustomerSearch("");
    setShowCustomerDropdown(false);
    setShowNewCustomerForm(false);
    customerSearchRef.current?.focus();
  }

  function handleCustomerSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showCustomerDropdown || filteredCustomers.length === 0) {
      if (event.key === "Escape") {
        setShowCustomerDropdown(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedCustomerIndex((prev) => {
        const next = prev + 1;
        return next >= filteredCustomers.length ? 0 : next;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedCustomerIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? filteredCustomers.length - 1 : next;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const index = highlightedCustomerIndex >= 0 ? highlightedCustomerIndex : 0;
      const customer = filteredCustomers[index];
      if (customer) {
        selectCustomer(customer);
      }
      return;
    }

    if (event.key === "Escape") {
      setShowCustomerDropdown(false);
    }
  }

  async function handleCreateCustomer() {
    const fullName = newCustomer.name.trim();
    const phone = newCustomer.phone.trim();
    const email = newCustomer.email.trim();

    if (!fullName) {
      toast.error("El nombre del cliente es obligatorio");
      return;
    }

    if (!phone) {
      toast.error("El teléfono del cliente es obligatorio para enviar factura");
      return;
    }

    if (!email) {
      toast.error("El correo del cliente es obligatorio para enviar factura");
      return;
    }

    const phoneRegex = /^[+()0-9\s-]{8,20}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Ingresa un teléfono válido");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Ingresa un correo electrónico válido");
      return;
    }

    setIsCreatingCustomer(true);
    try {
      const dto: CustomerCreateRequestDTO = {
        fullName,
        phone,
        email,
      };
      const created: CustomerResponseDTO = await createCustomer(dto);
      setCustomers((prev) => [...prev, created]);
      selectCustomer(created);
      setNewCustomer({ name: "", phone: "", email: "" });
      toast.success(`Cliente "${created.fullName}" registrado y seleccionado`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear el cliente");
    } finally {
      setIsCreatingCustomer(false);
    }
  }

  function handleBarcodeInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const code = barcodeInput.trim();
    if (!code) return;
    // Buscar en todos los productos, no solo en los filtrados por categoría
    const product = products.find((p) => p.barcode === code);
    if (product) addToCart(product);
    else toast.error(`Código "${code}" no encontrado en el catálogo`);
    setBarcodeInput("");
  }

  // Centraliza toda la lógica de agregar al carrito con validación de stock
  function addToCart(product: ProductResponse) {
    const stock = product.stock ?? 0;
    setCart((prev) => {
      const existing = prev.find((x) => x.productId === product.id);
      if (existing) {
        if (existing.quantity >= stock) {
          toast.error(`Stock máximo para "${product.name}": ${stock} unidad${stock !== 1 ? "es" : ""}`);
          return prev;
        }
        return prev.map((x) =>
          x.productId === product.id ? { ...x, quantity: x.quantity + 1 } : x,
        );
      }
      if (stock <= 0) {
        toast.error(`"${product.name}" no tiene stock disponible`);
        return prev;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.salePrice ?? 0,
          stock,
          quantity: 1,
          barCode: product.barcode || "",
        },
      ];
    });
  }

  function addProduct(productId: number) {
    const product = filteredProducts.find((p) => p.id === productId);
    if (product) addToCart(product);
  }

  const handleBarcodeDetected = (code: string) => {
    const product = products.find((p) => p.barcode?.toLowerCase() === code.toLowerCase());
    if (product) addToCart(product);
    else toast.error(`Código "${code}" no encontrado`);
  };

  const handleScannerError = (message: string) => {
    console.error("[SALE] Scanner error:", message);
  };

  function removeProduct(productId: number) {
    setCart((prev) => prev.filter((x) => x.productId !== productId));
  }

  function updateQty(productId: number, qty: number) {
    const cartItem = cart.find((x) => x.productId === productId);
    if (!cartItem) return;
    const clamped = Math.min(Math.max(1, qty), cartItem.stock);
    if (qty > cartItem.stock) toast.error(`Stock máximo: ${cartItem.stock}`);
    setCart((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity: clamped } : x)),
    );
  }

  const subTotal = React.useMemo(
    () =>
      cart.reduce((sum, x) => sum + x.price * x.quantity, 0),
    [cart]
  );

  const total = subTotal - discount;
  const changeAmount = amountPaid > total ? amountPaid - total : 0;

  async function handleSubmit() {
    if (!cart.length) { toast.error("Agrega al menos un producto al carrito"); return; }
    if (!paymentMethodId) { toast.error("Selecciona un método de pago"); return; }

    const dto: SaleCreateDto = {
      customerId: customerId || undefined,
      paymentMethodId,
      discount,
      amountPaid: amountPaid || undefined,
      details: cart.map((x) => ({ productId: x.productId, quantity: x.quantity })),
    };

    setIsSubmitting(true);
    try {
      await createSale(dto);
      toast.success("¡Venta registrada correctamente!");
      setCart([]);
      setBarcodeInput("");
      setPaymentMethodId(0);
      setCustomerId(null);
      setSelectedCustomerName("");
      setDiscount(0);
      setAmountPaid(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar la venta");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="w-full space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] xl:items-end">
            <div className="space-y-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Receipt className="h-3.5 w-3.5" />
                Punto de venta
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Registrar venta</h1>
                <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                  Opera la caja con una distribución amplia, lectura clara y acciones rápidas para registrar ventas sin saturación visual.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Productos</span>
                  <Boxes className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-foreground">{availableProductsCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">Disponibles para la venta actual</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Carrito</span>
                  <LayoutGrid className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-foreground">{cartItemsCount}</p>
                <p className="mt-1 text-xs text-muted-foreground">Unidades agregadas</p>
              </div>
              <div className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Total</span>
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-foreground">{fmt.format(total)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Cobro proyectado</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.75fr)_460px]">
          <div className="space-y-6">
            <Card className="overflow-visible border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Boxes className="h-4 w-4 text-muted-foreground" />
                      Explorador de catálogo
                    </CardTitle>
                    <CardDescription>Filtra por categoría y agrega productos con una cuadrícula más amplia dentro del área principal.</CardDescription>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm lg:min-w-80">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-background text-primary">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">Flujo de venta asistido</p>
                        <p className="text-xs leading-5 text-muted-foreground">
                          Mantén el catálogo visible a la izquierda y deja la validación de cobro fija a la derecha.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Categoría
                    </label>
                    <Combobox
                      items={categoryOptions}
                      value={selectedCategory}
                      onValueChange={(category: ComboboxOption | null) => setSelectedCategoryId(category?.id ?? 0)}
                      itemToStringLabel={(category: ComboboxOption | null) => category?.label ?? ""}
                      itemToStringValue={(category: ComboboxOption | null) => category?.id?.toString() ?? ""}
                    >
                      <ComboboxInput
                        className="w-full rounded-xl border border-input bg-background text-sm text-foreground transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
                        placeholder="Todas las categorías"
                        aria-label="Filtrar por categoría"
                        showClear
                      />
                      <ComboboxContent className="z-50 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                        <ComboboxEmpty>No se encontraron categorías</ComboboxEmpty>
                        <ComboboxList>
                          {(category: ComboboxOption) => (
                            <ComboboxItem
                              key={category.id}
                              value={category}
                              className="mx-1 my-1 rounded-lg px-3 py-2.5 text-popover-foreground data-highlighted:bg-primary data-highlighted:text-primary-foreground"
                            >
                              {category.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
                        <LayoutGrid className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">Vista operativa del catálogo</p>
                        <p className="text-sm text-muted-foreground">
                          La cuadrícula prioriza lectura, precio, stock y código con menos adornos y mejor densidad.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-foreground">Productos disponibles</h2>
                        <p className="text-xs text-muted-foreground">Acceso rápido a los artículos más relevantes del catálogo filtrado.</p>
                      </div>
                      <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {availableProductsCount} activos
                      </span>
                    </div>

                    {(filteredProducts || []).length === 0 ? (
                      <div className="flex min-h-70 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
                        <div className="text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
                            <ShoppingCart className="h-6 w-6" />
                          </div>
                          <p className="mt-4 text-sm font-medium text-foreground">No hay productos disponibles para este filtro</p>
                          <p className="mt-1 text-sm text-muted-foreground">Prueba otra categoría o revisa el estado del inventario.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                        {(filteredProducts || []).slice(0, 12).map((product) => {
                          const stock = product.stock ?? 0;
                          const inCart = cart.find((c) => c.productId === product.id);
                          const atLimit = stock <= 0 || (inCart !== undefined && inCart.quantity >= stock);
                          return (
                            <button
                              key={product.id}
                              onClick={() => addProduct(product.id)}
                              disabled={atLimit}
                              className="group h-full min-h-36 rounded-2xl border border-border bg-card p-4 text-left transition enabled:hover:border-primary/40 enabled:hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <div className="flex h-full flex-col justify-between gap-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <p className="line-clamp-2 text-sm font-semibold text-foreground">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.categoryName || "Sin categoría"}</p>
                                  </div>
                                  <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                                    {fmt.format(product.salePrice ?? 0)}
                                  </span>
                                </div>

                                <div className="flex items-end justify-between gap-3 text-xs">
                                  <span className={
                                    stock === 0 ? "font-medium text-destructive"
                                    : stock <= 3 ? "font-medium text-amber-600"
                                    : "text-muted-foreground"
                                  }>
                                    Stock {stock}
                                  </span>
                                  <span className="max-w-28 truncate text-muted-foreground">{product.barcode || "Sin código"}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Card className="border-border bg-card shadow-none">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <ScanLine className="h-4 w-4 text-muted-foreground" />
                        Escaneo y captura
                      </CardTitle>
                      <CardDescription>Agrega productos por código de barras o con la cámara del dispositivo.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">Cámara de escaneo</p>
                          <p className="text-xs text-muted-foreground">Activa el lector visual para registrar artículos más rápido.</p>
                        </div>
                        <Button onClick={() => setShowScanner(true)} size="sm" className="rounded-xl">
                          <Barcode className="h-4 w-4" />
                          Abrir
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Código manual
                        </label>
                        <div className="relative">
                          <input
                            ref={barcodeInputRef}
                            type="text"
                            placeholder="Escribe el código y presiona Enter"
                            className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            onKeyDown={handleBarcodeInput}
                          />
                          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6 border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      Carrito de venta
                    </CardTitle>
                    <CardDescription>Revisa cantidades, cliente, forma de pago y totales antes de confirmar.</CardDescription>
                  </div>
                  <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {cartItemsCount} items
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-6">
                <div className="max-h-85 space-y-3 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-10 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-foreground">El carrito está vacío</p>
                      <p className="mt-1 text-sm text-muted-foreground">Agrega productos desde el catálogo o escanéandolos.</p>
                    </div>
                  ) : (
                    cart.map((item) => {
                      const atMax = item.quantity >= item.stock;
                      return (
                        <div key={item.productId} className="rounded-2xl border border-border bg-background p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                              <p className="mt-1 truncate text-xs text-muted-foreground">{item.barCode || "Sin código registrado"}</p>
                              {atMax && (
                                <span className="mt-1 inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Stock máximo
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeProduct(item.productId)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-xl border border-border bg-background p-1">
                              <button
                                onClick={() => updateQty(item.productId, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition hover:bg-muted"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                                className="h-8 w-12 border-0 bg-transparent text-center text-sm font-semibold text-foreground outline-none"
                              />
                              <button
                                onClick={() => updateQty(item.productId, item.quantity + 1)}
                                disabled={atMax}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Subtotal</p>
                              <p className="text-sm font-semibold text-foreground">{fmt.format(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      <UserRound className="h-3.5 w-3.5" />
                      Cliente
                    </label>
                    <div className="relative" ref={customerSearchContainerRef}>
                      {selectedCustomerName ? (
                        <div className="mb-2 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{selectedCustomerName}</p>
                            <p className="text-xs text-muted-foreground">Cliente seleccionado</p>
                          </div>
                          <Button variant="ghost" size="icon-sm" onClick={clearCustomer} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null}
                      <input
                        ref={customerSearchRef}
                        type="text"
                        placeholder="Busca por nombre"
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowNewCustomerForm(false);
                        }}
                        onFocus={() => customerSearch && setShowCustomerDropdown(true)}
                        onKeyDown={handleCustomerSearchKeyDown}
                        role="combobox"
                        aria-expanded={showCustomerDropdown}
                        aria-controls="customer-search-listbox"
                        aria-activedescendant={
                          highlightedCustomerIndex >= 0 && filteredCustomers[highlightedCustomerIndex]
                            ? `customer-option-${filteredCustomers[highlightedCustomerIndex].id}`
                            : undefined
                        }
                      />
                      {showCustomerDropdown && filteredCustomers.length > 0 && (
                        <div
                          id="customer-search-listbox"
                          role="listbox"
                          className="absolute top-full left-0 right-0 z-50 mt-2 max-h-56 overflow-y-auto rounded-2xl border border-border bg-popover p-1 shadow-xl"
                        >
                          {filteredCustomers.map((customer, index) => (
                            <button
                              id={`customer-option-${customer.id}`}
                              role="option"
                              aria-selected={highlightedCustomerIndex === index}
                              key={customer.id}
                              onMouseDown={(event) => {
                                event.preventDefault();
                                selectCustomer(customer);
                              }}
                              onMouseEnter={() => setHighlightedCustomerIndex(index)}
                              className={
                                highlightedCustomerIndex === index
                                  ? "w-full rounded-xl bg-primary px-3 py-3 text-left text-primary-foreground transition"
                                  : "w-full rounded-xl px-3 py-3 text-left transition hover:bg-muted"
                              }
                            >
                              <p className={highlightedCustomerIndex === index ? "text-sm font-semibold text-primary-foreground" : "text-sm font-semibold text-foreground"}>{customer.fullName}</p>
                              {customer.email && (
                                <p className={highlightedCustomerIndex === index ? "mt-1 text-xs text-primary-foreground/80" : "mt-1 text-xs text-muted-foreground"}>
                                  {customer.email}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {customerSearch && filteredCustomers.length === 0 && showCustomerDropdown && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-border bg-popover p-3 shadow-xl">
                          <p className="text-sm text-muted-foreground">No se encontraron clientes.</p>
                          <button
                            onClick={() => {
                              setNewCustomer((p) => ({ ...p, name: customerSearch }));
                              setShowNewCustomerForm(true);
                              setShowCustomerDropdown(false);
                            }}
                            className="mt-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-primary/50 px-3 py-2 text-left text-sm text-primary transition hover:bg-primary/5"
                          >
                            <UserPlus className="h-4 w-4" />
                            Registrar &ldquo;{customerSearch}&rdquo; como nuevo cliente
                          </button>
                        </div>
                      )}
                    </div>
                    {showNewCustomerForm && (
                      <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-foreground">Nuevo cliente</p>
                        <p className="text-xs text-muted-foreground">Teléfono y correo son obligatorios para el envío de factura.</p>
                        <input
                          type="text"
                          placeholder="Nombre completo *"
                          className="h-10 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                          value={newCustomer.name}
                          onChange={(e) => setNewCustomer((p) => ({ ...p, name: e.target.value }))}
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Teléfono *"
                          className="h-10 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                          required
                        />
                        <input
                          type="email"
                          placeholder="Correo electrónico *"
                          className="h-10 w-full rounded-lg border border-input bg-muted/50 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
                          required
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 rounded-lg" onClick={handleCreateCustomer} disabled={isCreatingCustomer}>
                            <UserPlus className="h-4 w-4" />
                            {isCreatingCustomer ? "Guardando..." : "Guardar cliente"}
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setShowNewCustomerForm(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5" />
                      Método de pago
                    </label>
                    <Combobox
                      items={paymentMethodOptions}
                      value={selectedPaymentMethod}
                      onValueChange={(paymentMethod: ComboboxOption | null) => setPaymentMethodId(paymentMethod?.id ?? 0)}
                      itemToStringLabel={(paymentMethod: ComboboxOption | null) => paymentMethod?.label ?? ""}
                      itemToStringValue={(paymentMethod: ComboboxOption | null) => paymentMethod?.id?.toString() ?? ""}
                    >
                      <ComboboxInput
                        className="w-full rounded-xl border border-input bg-background text-sm text-foreground transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
                        placeholder="Selecciona método de pago"
                        aria-label="Selecciona un método de pago"
                        showClear
                      />
                      <ComboboxContent className="z-50 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                        <ComboboxEmpty>No se encontraron métodos de pago</ComboboxEmpty>
                        <ComboboxList>
                          {(paymentMethod: ComboboxOption) => (
                            <ComboboxItem
                              key={paymentMethod.id}
                              value={paymentMethod}
                              className="mx-1 my-1 rounded-lg px-3 py-2.5 text-sm text-popover-foreground data-highlighted:bg-primary data-highlighted:text-primary-foreground"
                            >
                              {paymentMethod.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Descuento</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Monto pagado</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{fmt.format(subTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Descuento</span>
                      <span>-{fmt.format(discount)}</span>
                    </div>
                    <div className="my-3 h-px bg-border" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Total a cobrar</span>
                      <span className="text-2xl font-semibold tracking-tight text-foreground">{fmt.format(total)}</span>
                    </div>
                    {amountPaid > 0 && (
                      <div className="mt-3 rounded-2xl border border-primary/20 bg-background px-4 py-3">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Pagado</span>
                          <span>{fmt.format(amountPaid)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-medium text-foreground">Cambio</span>
                          <span className="text-lg font-semibold text-emerald-700">{fmt.format(changeAmount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || cart.length === 0}
                  size="lg"
                  className="w-full rounded-2xl"
                >
                  {isSubmitting ? "Procesando venta..." : "Confirmar venta"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent className="w-full sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Escáner de código de barras</DialogTitle>
              <DialogDescription>
                Apunta al código del producto para agregarlo automáticamente al carrito.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-2xl border border-border bg-card p-3">
              <BarcodeScanner
                onDetected={handleBarcodeDetected}
                onError={handleScannerError}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Plus, Trash, ShoppingBag, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";

import { ProductResponse } from "@/types/product";
import { CustomerResponseDTO } from "@/types/custoner";
import { PaymentMethodResponse } from "@/types/PaymentMethod";

import { SaleCreateDto } from "@/types/sale";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  products: ProductResponse[];
  customers: CustomerResponseDTO[];
  paymentMethods: PaymentMethodResponse[];

  onCreate: (data: SaleCreateDto) => Promise<void>;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

type ComboboxOption = {
  id: number;
  label: string;
};

export function CreateSaleModal({
  open,
  onOpenChange,
  products,
  customers,
  paymentMethods,
  onCreate,
}: Props) {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [paymentMethodId, setPaymentMethodId] = React.useState(0);
  const [customerId, setCustomerId] = React.useState<number | null>(null);
  const [discount, setDiscount] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [productToAdd, setProductToAdd] = React.useState<ComboboxOption | null>(null);

  const customerOptions = React.useMemo<ComboboxOption[]>(
    () => customers.map((customer) => ({ id: customer.id, label: customer.fullName })),
    [customers],
  );

  const paymentMethodOptions = React.useMemo<ComboboxOption[]>(
    () => paymentMethods.map((paymentMethod) => ({ id: paymentMethod.id, label: paymentMethod.name })),
    [paymentMethods],
  );

  const productOptions = React.useMemo<ComboboxOption[]>(
    () => products.map((product) => ({ id: product.id, label: `${product.name} — $${product.salePrice ?? 0}` })),
    [products],
  );

  const selectedCustomer = React.useMemo(
    () => customerOptions.find((customer) => customer.id === customerId) ?? null,
    [customerId, customerOptions],
  );

  const selectedPaymentMethod = React.useMemo(
    () => paymentMethodOptions.find((paymentMethod) => paymentMethod.id === paymentMethodId) ?? null,
    [paymentMethodId, paymentMethodOptions],
  );

  // ===============================
  // ADD PRODUCT
  // ===============================
  function addProduct(productId: number) {
    const product = products.find((p) => p.id === productId);
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

  // ===============================
  // SUBMIT
  // ===============================
  async function handleSubmit() {
    if (!cart.length) return alert("Agrega productos");

    const dto: SaleCreateDto = {
      customerId,
      paymentMethodId,
      discount,
      details: cart.map((x) => ({
        productId: x.productId,
        quantity: x.quantity,
      })),
    };

    setIsSubmitting(true);
    await onCreate(dto);
    setIsSubmitting(false);

    setCart([]);
    onOpenChange(false);
  }

  // ===============================
  // UI
  // ===============================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 text-sm font-medium transition-all shadow-sm shadow-sky-600/30">
          <Plus className="mr-2 w-4 h-4" />
          Nueva Venta
        </button>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-4xl" showCloseButton={false}>
        {/* Header degradado sidebar */}
        <div className="bg-linear-to-r from-sky-600 to-cyan-600 px-6 pt-6 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white leading-tight">
                  Registrar Venta
                </DialogTitle>
                <DialogDescription className="text-sky-200 text-xs mt-0.5">
                  Selecciona productos y completa los datos de la venta.
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">

            {/* SELECTS */}
            <div className="grid grid-cols-3 gap-3 mb-4">

              {/* CLIENTE */}
              <Combobox
                items={customerOptions}
                value={selectedCustomer}
                onValueChange={(customer: ComboboxOption | null) => setCustomerId(customer?.id ?? null)}
                itemToStringLabel={(customer: ComboboxOption | null) => customer?.label ?? ""}
                itemToStringValue={(customer: ComboboxOption | null) => customer?.id?.toString() ?? ""}
              >
                <ComboboxInput
                  className="w-full rounded-xl border-2 border-gray-200 bg-white text-sm transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100"
                  placeholder="Cliente (opcional)"
                  aria-label="Selecciona un cliente"
                  showClear
                />
                <ComboboxContent className="rounded-xl border border-gray-200 bg-white shadow-xl">
                  <ComboboxEmpty>No se encontraron clientes</ComboboxEmpty>
                  <ComboboxList>
                    {(customer: ComboboxOption) => (
                      <ComboboxItem key={customer.id} value={customer} className="px-3 py-2 text-sm text-gray-900 data-highlighted:bg-sky-600 data-highlighted:text-white">
                        {customer.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              {/* PAYMENT */}
              <Combobox
                items={paymentMethodOptions}
                value={selectedPaymentMethod}
                onValueChange={(paymentMethod: ComboboxOption | null) => setPaymentMethodId(paymentMethod?.id ?? 0)}
                itemToStringLabel={(paymentMethod: ComboboxOption | null) => paymentMethod?.label ?? ""}
                itemToStringValue={(paymentMethod: ComboboxOption | null) => paymentMethod?.id?.toString() ?? ""}
              >
                <ComboboxInput
                  className="w-full rounded-xl border-2 border-gray-200 bg-white text-sm transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100"
                  placeholder="Método de pago"
                  aria-label="Selecciona un método de pago"
                  showClear
                />
                <ComboboxContent className="rounded-xl border border-gray-200 bg-white shadow-xl">
                  <ComboboxEmpty>No se encontraron métodos de pago</ComboboxEmpty>
                  <ComboboxList>
                    {(paymentMethod: ComboboxOption) => (
                      <ComboboxItem key={paymentMethod.id} value={paymentMethod} className="px-3 py-2 text-sm text-gray-900 data-highlighted:bg-sky-600 data-highlighted:text-white">
                        {paymentMethod.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              {/* DESCUENTO */}
              <input
                type="number"
                placeholder="Descuento"
                className="rounded-xl border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={discount}
                onChange={(e) =>
                  setDiscount(Number(e.target.value))
                }
              />
            </div>

            {/* ADD PRODUCT */}
            <div className="mb-4">
              <Combobox
                items={productOptions}
                value={productToAdd}
                onValueChange={(product: ComboboxOption | null) => {
                  if (!product) {
                    setProductToAdd(null);
                    return;
                  }

                  addProduct(product.id);
                  setProductToAdd(null);
                }}
                itemToStringLabel={(product: ComboboxOption | null) => product?.label ?? ""}
                itemToStringValue={(product: ComboboxOption | null) => product?.id?.toString() ?? ""}
              >
                <ComboboxInput
                  className="w-full rounded-xl border-2 border-gray-200 bg-white text-sm transition-colors focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100"
                  placeholder="Agregar producto"
                  aria-label="Agregar producto"
                  showClear
                />
                <ComboboxContent className="rounded-xl border border-gray-200 bg-white shadow-xl">
                  <ComboboxEmpty>No se encontraron productos</ComboboxEmpty>
                  <ComboboxList>
                    {(product: ComboboxOption) => (
                      <ComboboxItem key={product.id} value={product} className="px-3 py-2 text-sm text-gray-900 data-highlighted:bg-sky-600 data-highlighted:text-white">
                        {product.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {/* CART */}
            <div className="rounded-xl border-2 border-gray-100 mb-4 overflow-hidden">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <span className="text-sm font-medium text-gray-800 flex-1">{item.name}</span>

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQty(
                        item.productId,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 rounded-lg border-2 border-gray-200 px-2 py-1 text-sm text-center focus:outline-none focus:border-sky-500 mx-3"
                  />

                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() =>
                      removeProduct(item.productId)
                    }
                    className="ml-3 p-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No hay productos en el carrito
                </div>
              )}
            </div>

            {/* TOTALS */}
            <div className="rounded-xl border-2 border-sky-100 bg-sky-50 p-4 mb-4">
              <div className="flex justify-between text-sm text-sky-700 mb-1">
                <span>Subtotal:</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-sky-700 mb-2">
                <span>Descuento:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-sky-900 border-t border-sky-200 pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-50 text-sm font-semibold transition-all shadow-sm shadow-sky-600/30"
              >
                {isSubmitting ? "Guardando..." : "Registrar Venta"}
              </button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}


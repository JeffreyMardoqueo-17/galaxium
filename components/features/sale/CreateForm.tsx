"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Plus, Trash } from "lucide-react";

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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          <Plus className="mr-2 w-4 h-4" />
          Nueva Venta
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />

        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <DialogPrimitive.Content className="relative max-w-4xl w-full bg-white p-6 rounded shadow-lg">

            {/* HEADER */}
            <DialogPrimitive.Title className="text-lg font-semibold mb-4">
              Registrar Venta
            </DialogPrimitive.Title>

            {/* SELECTS */}
            <div className="grid grid-cols-3 gap-4 mb-4">

              {/* CLIENTE */}
              <select
                className="border rounded px-3 py-2"
                onChange={(e) =>
                  setCustomerId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">Cliente (opcional)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>

              {/* PAYMENT */}
              <select
                className="border rounded px-3 py-2"
                onChange={(e) =>
                  setPaymentMethodId(Number(e.target.value))
                }
              >
                <option value="">Método de pago</option>
                {paymentMethods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* DESCUENTO */}
              <input
                type="number"
                placeholder="Descuento"
                className="border rounded px-3 py-2"
                value={discount}
                onChange={(e) =>
                  setDiscount(Number(e.target.value))
                }
              />
            </div>

            {/* ADD PRODUCT */}
            <div className="mb-4">
              <select
                className="border rounded px-3 py-2 w-full"
                onChange={(e) =>
                  addProduct(Number(e.target.value))
                }
              >
                <option>Agregar producto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.salePrice}
                  </option>
                ))}
              </select>
            </div>

            {/* CART */}
            <div className="border rounded mb-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <span>{item.name}</span>

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQty(
                        item.productId,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 border rounded px-2"
                  />

                  <span>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() =>
                      removeProduct(item.productId)
                    }
                  >
                    <Trash className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>

            {/* TOTALS */}
            <div className="text-right space-y-1 mb-4">
              <p>SubTotal: ${subTotal.toFixed(2)}</p>
              <p>Descuento: ${discount.toFixed(2)}</p>
              <p className="text-xl font-bold">
                Total: ${total.toFixed(2)}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                {isSubmitting ? "Guardando..." : "Registrar Venta"}
              </button>
            </div>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

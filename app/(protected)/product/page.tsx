"use client";

import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { HeroTable } from "@/components/ui/tables";
import { CreateProductModal } from "@/components/features/products/ProductForm";
import { PriceFormModal } from "@/components/features/products/PriceForm";
import { ProductDetailModal } from "@/components/features/products/ProductVerMas";
import {
  ProductResponse,
  ProductCreateRequest,
  ProductFilterRequest,
} from "@/types/product";
import {
  getProductsByFilter,
  createProduct,
  getProducts,
  updateProduct,
} from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import type { CategoryRead } from "@/types/category";
//iconos
import { IoIosCreate, IoIosColorFilter } from "react-icons/io";
import { MdCleaningServices } from "react-icons/md";
import { AlertCircle, DollarSign } from "lucide-react";

export default function ProductsPage() {
  // ===============================
  // STATE
  // ===============================
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryRead[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [filters, setFilters] = useState<ProductFilterRequest>({
    page: 1,
    pageSize: 7,
  });

  const [debouncedFilters, setDebouncedFilters] =
    useState<ProductFilterRequest>(filters);

  // ===============================
  // HELPERS
  // ===============================
  function hasRealFilters(filters: ProductFilterRequest) {
    const { page, pageSize, ...rest } = filters;

    return Object.values(rest).some(
      (v) => v !== undefined && v !== null && v !== "",
    );
  }

  // ===============================
  // LOAD PRODUCTS
  // ===============================
  async function loadProducts(filter: ProductFilterRequest) {
    setLoadingProducts(true);
    try {
      const data = hasRealFilters(filter)
        ? await getProductsByFilter(filter)
        : await getProducts();

      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos", error);
    } finally {
      setLoadingProducts(false);
    }
  }

  // ===============================
  // LOAD CATEGORIES
  // ===============================
  async function loadCategories() {
    setLoadingCategories(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error cargando categorías", error);
    } finally {
      setLoadingCategories(false);
    }
  }

  // ===============================
  // EFFECTS
  // ===============================
  useEffect(() => {
    loadCategories();
  }, []);

  // 🔥 Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);

    return () => clearTimeout(timeout);
  }, [filters]);

  useEffect(() => {
    loadProducts(debouncedFilters);
  }, [debouncedFilters]);

  // ===============================
  // CREATE PRODUCT
  // ===============================
  async function handleProductCreate(product: ProductCreateRequest) {
    try {
      await createProduct(product);
      setModalOpen(false);
      await loadProducts(debouncedFilters);
    } catch (error) {
      console.error("Error creando producto:", error);
    }
  }

  // ===============================
  // UPDATE PRICE
  // ===============================
  async function handlePriceUpdate(productId: number, salePrice: number) {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      await updateProduct(productId, {
        categoryId: product.categoryId,
        name: product.name,
        salePrice: salePrice,
        minimumStock: product.minimumStock,
        isActive: product.isActive,
      });

      setPriceModalOpen(false);
      await loadProducts(debouncedFilters);
    } catch (error) {
      console.error("Error actualizando precio:", error);
      throw error;
    }
  }

  // ===============================
  // OPEN MODALS
  // ===============================
  function handleOpenPriceModal(product: ProductResponse) {
    setSelectedProduct(product);
    setPriceModalOpen(true);
  }

  function handleOpenDetailModal(product: ProductResponse) {
    setSelectedProduct(product);
    setDetailModalOpen(true);
  }

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="space-y-6 p-2 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md cursor-pointer"
        >
          <IoIosCreate size={20} />
          Nuevo producto
        </button>
      </div>

<div className="flex flex-wrap gap-4 p-4 rounded-md bg-white shadow-sm">
  {/* Nombre */}
  <input
    placeholder="Nombre"
    className="border px-2 py-1 rounded flex-grow min-w-[150px] max-w-[300px]"
    value={filters.name ?? ""}
    onChange={(e) =>
      setFilters((f) => ({
        ...f,
        name: e.target.value || undefined,
        page: 1,
      }))
    }
  />

  {/* Categorías */}
  <select
    className="border px-2 py-1 rounded flex-grow min-w-[150px] max-w-[300px]"
    value={filters.categoryId ?? ""}
    onChange={(e) =>
      setFilters((f) => ({
        ...f,
        categoryId: e.target.value ? Number(e.target.value) : undefined,
        page: 1,
      }))
    }
  >
    <option value="">Todas</option>
    {categories.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ))}
  </select>

  {/* Stock mínimo */}
  <input
    type="number"
    placeholder="Stock mínimo"
    className="border px-2 py-1 rounded flex-grow min-w-[150px] max-w-[300px]"
    value={filters.minStock ?? ""}
    onChange={(e) =>
      setFilters((f) => ({
        ...f,
        minStock: e.target.value ? Number(e.target.value) : undefined,
        page: 1,
      }))
    }
  />

  {/* Activo / Inactivo */}
  <select
    className="border px-2 py-1 rounded flex-grow min-w-[150px] max-w-[300px]"
    value={filters.isActive === undefined ? "" : filters.isActive.toString()}
    onChange={(e) =>
      setFilters((f) => ({
        ...f,
        isActive:
          e.target.value === "" ? undefined : e.target.value === "true",
        page: 1,
      }))
    }
  >
    <option value="">Todos</option>
    <option value="true">Activos</option>
    <option value="false">Inactivos</option>
  </select>

  {/* Botón filtros avanzados */}
  <button
    onClick={() => setShowAdvancedFilters((s) => !s)}
    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded cursor-pointer active:scale-95 transition active:bg-blue-200"
  >
    <IoIosColorFilter size={20} />
    {showAdvancedFilters ? "Ocultar filtros avanzados" : "Filtros avanzados"}
  </button>

  {/* Filtros avanzados */}
  {showAdvancedFilters && (
    <>
      <input
        type="number"
        placeholder="Precio mínimo"
        className="border px-2 py-1 rounded flex-grow min-w-[150px] max-w-[300px]"
        value={filters.minPrice ?? ""}
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            minPrice: e.target.value ? Number(e.target.value) : undefined,
            page: 1,
          }))
        }
      />

      <input
        type="number"
        placeholder="Precio máximo"
        className="border px-2 py-1 rounded flex-grow min-w-[150px] max-w-[300px]"
        value={filters.maxPrice ?? ""}
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            maxPrice: e.target.value ? Number(e.target.value) : undefined,
            page: 1,
          }))
        }
      />

      <select
        className="border px-2 py-1 rounded flex-grow min-w-[150px] max-w-[300px]"
        value={filters.orderBy ?? ""}
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            orderBy: e.target.value || undefined,
          }))
        }
      >
        <option value="">Ordenar por</option>
        <option value="Name">Nombre</option>
        <option value="SalePrice">Precio</option>
        <option value="Stock">Stock</option>
      </select>

      <select
        className="border px-2 py-1 rounded flex-grow min-w-[150px] max-w-[300px]"
        value={
          filters.orderDescending === undefined
            ? ""
            : filters.orderDescending.toString()
        }
        onChange={(e) =>
          setFilters((f) => ({
            ...f,
            orderDescending:
              e.target.value === ""
                ? undefined
                : e.target.value === "true",
          }))
        }
      >
        <option value="">Orden</option>
        <option value="false">Ascendente</option>
        <option value="true">Descendente</option>
      </select>
    </>
  )}

  {/* Botón limpiar */}
  <button
    className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded cursor-pointer active:scale-95 transition active:bg-blue-200"
    onClick={() =>
      setFilters({
        page: 1,
        pageSize: 7,
      })
    }
  >
    <MdCleaningServices size={20} />
    Limpiar
  </button>
</div>

      {/* LOADING VISUAL */}
      {loadingProducts && (
        <p className="text-sm text-gray-500">Cargando productos...</p>
      )}

      {/* TABLE */}

  <HeroTable
        data={products}
        columns={[
          { key: "name", label: "Nombre" },

          {
            key: "stock",
            label: "Stock",
            align: "end",
            render: (row: ProductResponse) => {
              if (row.stock === null) {
                return (
                  <span className="px-2 py-1 rounded text-gray-400 italic">
                    Sin stock
                  </span>
                );
              }

              const stock = row.stock;
              const minStock = row.minimumStock;
              let color = "";

              if (stock === 0 || stock < minStock) {
                color = "text-red-600 bg-red-100";
              } else if (stock === minStock + 1) {
                color = "text-orange-600 bg-orange-100";
              } else {
                color = "text-green-600 bg-green-100";
              }

              return (
                <span className={`px-2 py-1 rounded ${color}`}>
                  {stock}
                </span>
              );
            },
          },

          { key: "minimumStock", label: "Stock mínimo", align: "end" },

          {
            key: "salePrice",
            label: "Precio de venta",
            align: "end",
            render: (item: ProductResponse) => {
              const hasNoPrice = !item.salePrice || item.salePrice === 0;
              
              if (!hasNoPrice) {
                return `$${(item.salePrice ?? 0).toFixed(2)}`;
              }

              return (
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium group">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Sin precio</span>
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="z-50 w-72 rounded-lg border border-red-300 bg-red-50 p-4 shadow-lg"
                      sideOffset={5}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-900 mb-1">
                              Producto sin precio de venta
                            </p>
                            <p className="text-xs text-red-700">
                              Este producto no puede estar activo hasta que se asigne un precio de venta.
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-red-200">
                          <p className="text-xs text-red-800 mb-2 font-medium">
                            ¿Deseas asignar el precio ahora?
                          </p>
                          <button
                            onClick={() => handleOpenPriceModal(item)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                          >
                            <DollarSign className="w-4 h-4" />
                            Asignar Precio
                          </button>
                        </div>
                      </div>
                      <Popover.Arrow className="fill-red-300" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              );
            },
          },

          {
            key: "isActive",
            label: "Activo",
            render: (item: ProductResponse) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  item.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.isActive ? "Activo" : "Inactivo"}
              </span>
            ),
          },

          { key: "categoryName", label: "Categoría" },
        ]}
        actions={(item) => (
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => handleOpenDetailModal(item)}
              className="bg-blue-500 px-3 py-1 text-white rounded-md hover:bg-blue-600"
            >
              Ver
            </button>
            {(!item.salePrice || item.salePrice === 0) && (
              <button 
                onClick={() => handleOpenPriceModal(item)}
                className="bg-green-500 px-3 py-1 text-white rounded-md hover:bg-green-600 flex items-center gap-1"
              >
                <DollarSign className="w-4 h-4" />
                Precio
              </button>
            )}
            <button className="bg-yellow-500 px-3 py-1 text-white rounded-md hover:bg-yellow-600">
              Editar
            </button>
            <button className="bg-red-500 px-3 py-1 text-white rounded-md hover:bg-red-600">
              Eliminar
            </button>
          </div>
        )}
        page={filters.page ?? 1}
        pageSize={filters.pageSize ?? 7}
        totalItems={products.length}
        onPageChange={(page) =>
          setFilters((f) => ({
            ...f,
            page,
          }))
        }
      />

      {modalOpen && (
        <CreateProductModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          categories={categories}
          onProductCreate={handleProductCreate}
        />
      )}

      {priceModalOpen && (
        <PriceFormModal
          open={priceModalOpen}
          onOpenChange={setPriceModalOpen}
          product={selectedProduct}
          onPriceUpdate={handlePriceUpdate}
        />
      )}

      {detailModalOpen && (
        <ProductDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          product={selectedProduct}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as HoverCard from "@radix-ui/react-hover-card";
import { AlertCircle, DollarSign, ScanLine } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { HeroTable } from "@/components/ui/tables";
import { ProductCard } from "@/components/ui/card/product-card";
import { CreateProductModal } from "@/components/features/products/ProductForm";
import { PriceFormModal } from "@/components/features/products/PriceForm";
import { ProductDetailModal } from "@/components/features/products/ProductVerMas";
import {
  ProductResponse,
  ProductCreateRequest,
  ProductFilterRequest,
  ProductWithPhotosResponse,
} from "@/types/product";
import {
  getProductsByFilter,
  createProduct,
  getProducts,
  updateProduct,
  updateProductPrice,
  getProductsWithPhotos,
} from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import type { CategoryRead } from "@/types/category";
//iconos
import { IoIosCreate, IoIosColorFilter } from "react-icons/io";
import { MdCleaningServices } from "react-icons/md";
export default function ProductsPage() {
  const router = useRouter();
  
  // ===============================
  // STATE
  // ===============================
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [products, setProducts] = useState<(ProductResponse | ProductWithPhotosResponse)[]>([]);
  const [productsWithPhotos, setProductsWithPhotos] = useState<ProductWithPhotosResponse[]>([]);
  const [categories, setCategories] = useState<CategoryRead[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponse | null>(null);
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
      // Si estamos en vista de tarjetas, cargar con fotos (una sola vez)
      if (viewMode === 'cards') {
        const dataWithPhotos = await getProductsWithPhotos();
        setProductsWithPhotos(dataWithPhotos);
        setProducts(dataWithPhotos);
      } else {
        // En vista tabla, usar filtros normales
        const data = await getProductsByFilter(filter);
        setProducts(data);
      }
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

  // Cargar productos con fotos una sola vez cuando cambia a vista cards
  useEffect(() => {
    if (viewMode === 'cards' && productsWithPhotos.length === 0) {
      (async () => {
        setLoadingProducts(true);
        try {
          const dataWithPhotos = await getProductsWithPhotos();
          setProductsWithPhotos(dataWithPhotos);
          setProducts(dataWithPhotos);
        } catch (error) {
          console.error("Error cargando productos con fotos", error);
        } finally {
          setLoadingProducts(false);
        }
      })();
    }
  }, [viewMode, productsWithPhotos.length]);

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
      const result = await createProduct(product);
      await loadProducts(debouncedFilters);
      return typeof result === "number" ? result : result?.id;
    } catch (error) {
      console.error("Error creando producto:", error);
      throw error;
    }
  }

  // ===============================
  // UPDATE PRICE
  // ===============================
  async function handlePriceUpdate(productId: number, salePrice: number) {
    try {
      // Llamamos al servicio del backend
      const updatedProduct = await updateProductPrice({
        productId,
        newPrice: salePrice,
      });
      console.log("Precio actualizado:", updatedProduct);

      if (updatedProduct) {
        // Actualizamos el estado de productos en la UI
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, ...updatedProduct } : p,
          ),
        );
      }
    } catch (err) {
      console.error("Error actualizando precio:", err);
      throw err; // para que el modal muestre el error
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
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/product/add")}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-md cursor-pointer hover:bg-purple-700 transition"
          >
            <ScanLine size={20} />
            Escanear Producto
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition"
          >
            <IoIosCreate size={20} />
            Nuevo producto
          </button>
        </div>
      </div>

      {/* VIEW MODE TOGGLE */}
      <div className="flex gap-2 p-2 bg-white rounded-md shadow-sm border border-gray-200/70">
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 rounded-md font-medium transition ${
            viewMode === 'table'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vista Tabla
        </button>
        <button
          onClick={() => setViewMode('cards')}
          className={`px-4 py-2 rounded-md font-medium transition ${
            viewMode === 'cards'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Vista Tarjetas
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
          value={
            filters.isActive === undefined ? "" : filters.isActive.toString()
          }
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
          {showAdvancedFilters
            ? "Ocultar filtros avanzados"
            : "Filtros avanzados"}
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

      {/* CONTENT: TABLE OR CARDS */}
      {viewMode === 'table' ? (
        // ===== TABLA VISTA =====
        <HeroTable
          data={products as ProductResponse[]}
          columns={[
            { key: "name", label: "Nombre" },
            { key: "barcode", label: "Código de barras" },

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
                  <span className={`px-2 py-1 rounded ${color}`}>{stock}</span>
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
                    <HoverCard.Root openDelay={100} closeDelay={100}>
                      <HoverCard.Trigger asChild>
                        <button className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium group">
                          <AlertCircle className="w-5 h-5 cursor-pointer" />
                          <span className="text-sm">Sin precio</span>
                        </button>
                      </HoverCard.Trigger>

                      <HoverCard.Content
                        side="top"
                        align="center"
                        className="
                        bg-red-50 
                        border 
                        shadow-lg 
                        rounded-lg 
                        px-3 py-2 
                        text-sm 
                        text-red-700
                        animate-in fade-in zoom-in-95
                      "
                      >
                        Este producto aún no tiene precio asignado.
                      </HoverCard.Content>
                    </HoverCard.Root>
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
                                Este producto no puede estar activo hasta que se
                                asigne un precio de venta.
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
              render: (item: ProductResponse) => {
                const isInactive = !item.isActive;

                // ===== Motivo =====
                let reason = "Producto inactivo.";

                const noStock = !item.stock || item.stock === 0;
                const noPrice = !item.salePrice || item.salePrice === 0;

                if (noStock && noPrice) {
                  reason = "No está activo porque no tiene stock ni precio.";
                } else if (noStock) {
                  reason = "No está activo porque no hay stock disponible.";
                } else if (noPrice) {
                  reason = "No está activo porque no tiene precio asignado.";
                }

                const badge = (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.isActive ? "Activo" : "Inactivo"}
                  </span>
                );

                // Activo → sin hover
                if (!isInactive) return badge;

                // Inactivo → con hover
                return (
                  <HoverCard.Root openDelay={150} closeDelay={200}>
                    <HoverCard.Trigger asChild>{badge}</HoverCard.Trigger>

                    <HoverCard.Content
                      side="top"
                      align="center"
                      className="
              bg-white border border-gray-200
              shadow-xl rounded-xl
              px-3 py-2
              text-sm text-gray-700
              max-w-xs
              animate-in fade-in zoom-in-95
            "
                    >
                      {reason}
                    </HoverCard.Content>
                  </HoverCard.Root>
                );
              },
            },

            { key: "categoryName", label: "Categoría" },
          ]}
          actions={(item) => (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleOpenDetailModal(item as ProductResponse)}
                className="bg-blue-500 px-3 py-1 text-white rounded-md hover:bg-blue-600"
              >
                Ver
              </button>
              {(!item.salePrice || item.salePrice === 0) && (
                <button
                  onClick={() => handleOpenPriceModal(item as ProductResponse)}
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
      ) : (
        // ===== TARJETAS VISTA =====
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No hay productos para mostrar</p>
            </div>
          ) : (
            (products as ProductWithPhotosResponse[]).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPhotoUpdate={(productId) => {
                  // Recargar datos con fotos si es necesario
                  console.log('Foto actualizada para:', productId);
                }}
              />
            ))
          )}
        </div>
      )}

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

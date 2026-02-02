"use client";

import { useEffect, useState } from "react";
import { HeroTable } from "@/components/ui/tables";
import { CreateProductModal } from "@/components/features/products/ProductForm";
import {
  ProductResponse,
  ProductCreateRequest,
  ProductFilterRequest,
} from "@/types/product";
import {
  getProductsByFilter,
  createProduct,
  getProducts,
} from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import type { CategoryRead } from "@/types/category";
//iconos
import { IoIosCreate, IoIosColorFilter } from "react-icons/io";
import { MdCleaningServices } from "react-icons/md";

export default function ProductsPage() {
  // ===============================
  // STATE
  // ===============================
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryRead[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
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

  // 🔥 Debounce profesional
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

          // Definición del render para la columna stock
          {
            key: "stock",
            label: "Stock",
            align: "end",
            render: (row: any) => {
              const stock = row.stock;
              const minStock = row.minimumStock;
              let color = "";

              if (stock === 0 || stock < minStock) {
                // Rojo si 0 o menor al mínimo
                color = "text-red-600 bg-red-100";
              } else if (stock === minStock + 1) {
                // Naranja si es justo 1 más que el mínimo
                color = "text-orange-600 bg-orange-100";
              } else if (stock > minStock + 1) {
                // Verde si es más que 1 unidad sobre el mínimo
                color = "text-green-600 bg-green-100";
              } else {
                // Caso cuando stock === mínimo (puedes definir si lo quieres neutro o algún color)
                color = "text-gray-700";
              }

              return (
                <span className={`px-2 py-1 rounded ${color}`}>{stock}</span>
              );
            },
          },

          { key: "minimumStock", label: "Stock mínimo", align: "end" },

          {
            key: "isActive",
            label: "Activo",
            render: (item) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold
        ${
          item.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }
      `}
              >
                {item.isActive ? "Activo" : "Inactivo"}
              </span>
            ),
          },

          { key: "categoryName", label: "Categoría" },

          {
            key: "salePrice",
            label: "Precio de venta",
            align: "end",
            render: (item) => `$${item.salePrice.toFixed(2)}`,
          },
        ]}
        actions={(item) => (
          <div className="flex gap-2 justify-center">
            <button className="cursor-pointer bg-blue-500 px-3 py-1 text-white rounded-md hover:bg-blue-600 transition">
              Ver
            </button>
            <button className="cursor-pointer bg-yellow-500 px-3 py-1 text-white rounded-md hover:bg-yellow-600 transition">
              Editar
            </button>
            <button className="cursor-pointer bg-red-500 px-3 py-1 text-white rounded-md hover:bg-red-600 transition">
              Eliminar
            </button>
          </div>
        )}
        page={filters.page ?? 1}
        pageSize={filters.pageSize ?? 5}
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
    </div>
  );
}

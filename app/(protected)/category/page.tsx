"use client";

import { useEffect, useState } from "react";
import { getCategories, createCategory } from "@/services/category.service";
import { CategoryRead } from "@/types/category";
import { HeroTable } from "@/components/ui/tables";
import { CustomModal } from "@/components/ui/modales/CustomModal";

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10; // o el tamaño que quieras por página
  const totalItems = categories.length;
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setError("No se pudo cargar las categorías"));
  }, []);

  const handleCreateCategory = async () => {
    setError(null);

    if (!newCategoryName.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      const created = await createCategory({
        name: newCategoryName.trim(),
      });

      setCategories((prev) => [...prev, created]);
      setNewCategoryName("");
      setModalOpen(false);
    } catch {
      setError("Error al crear la categoría");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categorías</h1>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-[var(--color-button-bg)] text-white px-6 py-2 rounded hover:bg-[var(--color-button-hover-bg)] transition"
        >
          Crear Categoría
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>
      )}

      <HeroTable
        data={categories}
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Nombre" },
          { key: "code", label: "Código" },
          {
            key: "createdAt",
            label: "Creada",
            render: (item) => (
              <span className="text-gray-500">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            ),
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
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />

      <CustomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Categoría"
        onSubmit={handleCreateCategory}
      >
        {error && (
          <div className="mb-2 p-2 bg-red-200 text-red-800 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 focus:outline-var(--color-sidebar) transition "
        />
      </CustomModal>
    </div>
  );
}

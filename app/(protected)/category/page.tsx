"use client";

import { useEffect, useState } from "react";
import { getCategories, createCategory } from "@/services/category.service";
import { CategoryRead } from "@/types/category";
import { formatDate } from "@/utils/formatDate";
import { FormModal } from "@/components/ui/modales";
import { HeroTable } from "@/components/ui/tables";

export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);

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
          className="bg-(--color-button-bg) text-white px-6 py-2 rounded hover:bg-(--color-button-hover-bg)"
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
          <div className="flex gap-2">
            <button className="text-blue-600">Editar</button>
            <button className="text-red-600">Eliminar</button>
          </div>
        )}
      />

      {/* Modal de creación */}
      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Nueva Categoría"
        onSubmit={handleCreateCategory}
        submitText="Crear"
      >
        {error && (
          <div className="p-2 bg-red-200 text-red-800 rounded">{error}</div>
        )}

        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="w-full border rounded p-2 focus:outline-(--color-sidebar)"
        />
      </FormModal>
    </div>
  );
}

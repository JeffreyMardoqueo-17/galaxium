"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Mail, Pencil, Phone, Search, Trash2, UserCheck, UserPlus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { CreateCustomerModal } from "@/components/features/customer/CustomerFrom";
import { createCustomer, GetAllCustomers } from "@/services/customer.service";
import { CustomerCreateRequestDTO, CustomerResponseDTO } from "@/types/custoner";
import { formatDateOnly } from "@/utils/formatDate";

export default function CustomerPage() {
  const [customers, setCustomers] = React.useState<CustomerResponseDTO[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    void loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError(null);
    try {
      const response = await GetAllCustomers();
      setCustomers(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCustomer(customer: CustomerCreateRequestDTO) {
    await createCustomer(customer);
    toast.success("Cliente registrado correctamente");
    await loadCustomers();
  }

  const filteredCustomers = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.fullName, customer.email, customer.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [customers, search]);

  const customersWithEmail = customers.filter((customer) => !!customer.email).length;
  const customersWithPhone = customers.filter((customer) => !!customer.phone).length;

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="w-full space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Gestión de clientes
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Clientes</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Mantén una vista clara del directorio de clientes con acciones uniformes y estructura profesional.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{customers.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Con correo</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{customersWithEmail}</p>
              </div>
              <div className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Con teléfono</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{customersWithPhone}</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              Directorio de clientes
            </CardTitle>
            <CardDescription>Búsqueda rápida, tabla responsive y botones alineados al diseño global.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, correo o teléfono"
                  className="pl-9"
                />
              </div>

              <Button onClick={() => setModalOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Nuevo cliente
              </Button>
            </div>

            {loading ? (
              <div className="py-8 text-sm text-muted-foreground">Cargando clientes...</div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {!loading && !error ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        No hay clientes para el criterio de búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.fullName}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {customer.email || "Sin correo"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {customer.phone || "Sin teléfono"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDateOnly(customer.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => toast("Vista detalle pendiente")}> 
                              <UserCheck className="h-4 w-4" />
                              Ver
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toast("Edición pendiente")}> 
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => toast("Eliminación pendiente")}> 
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : null}
          </CardContent>
        </Card>

        <CreateCustomerModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onCustomerCreate={handleCreateCustomer}
        />
      </div>
    </div>
  );
}

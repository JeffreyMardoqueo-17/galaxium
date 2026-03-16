"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, Search, ShieldCheck, UserCog, UserRoundCheck, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showToast } from "@/components/ui/modales/Toast";
import { getAllUsers, getRoles, updateUserRole, updateUserStatus } from "@/services/user.service";
import { UserResponse } from "@/types/user";
import { formatDate } from "@/utils/formatDate";
import { isUnauthorizedError } from "@/utils/getAddHeaders";

type RoleResponse = { id: number; name: string };
type ComboboxOption = { id: string; label: string };

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getRoleTone(roleName: string): string {
  switch (roleName.toLowerCase()) {
    case "administrador":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "supervisor":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "encargado de inventario":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "cajero":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = React.useState<UserResponse[]>([]);
  const [roles, setRoles] = React.useState<RoleResponse[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [savingUserId, setSavingUserId] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [usersResult, rolesResult] = await Promise.all([getAllUsers(), getRoles()]);
      setUsers(usersResult);
      setRoles(rolesResult);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente para continuar.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      setError(getErrorMessage(error, "No se pudo cargar la administracion de usuarios"));
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleRoleChange(userId: number, roleId: number) {
    setSavingUserId(userId);

    try {
      await updateUserRole(userId, { roleId });
      showToast({
        title: "Rol actualizado",
        description: "El rol del usuario fue actualizado correctamente.",
        color: "success",
      });
      await loadData();
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente para continuar.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      showToast({
        title: "No se pudo actualizar el rol",
        description: getErrorMessage(error, "Operacion rechazada por el servidor."),
        color: "danger",
      });
    } finally {
      setSavingUserId(null);
    }
  }

  async function handleStatusToggle(user: UserResponse) {
    setSavingUserId(user.id);

    try {
      await updateUserStatus(user.id, { isActive: !user.isActive });
      showToast({
        title: user.isActive ? "Usuario desactivado" : "Usuario activado",
        description: "El estado del usuario fue actualizado correctamente.",
        color: "success",
      });
      await loadData();
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        showToast({
          title: "Sesion expirada",
          description: "Inicia sesion nuevamente para continuar.",
          color: "danger",
        });
        router.replace("/login");
        return;
      }

      showToast({
        title: "No se pudo cambiar el estado",
        description: getErrorMessage(error, "Operacion rechazada por el servidor."),
        color: "danger",
      });
    } finally {
      setSavingUserId(null);
    }
  }

  const roleOptions = React.useMemo<ComboboxOption[]>(() => {
    return [{ id: "", label: "Todos los roles" }, ...roles.map((role) => ({ id: String(role.id), label: role.name }))];
  }, [roles]);

  const selectedRole = React.useMemo(() => {
    return roleOptions.find((option) => option.id === selectedRoleId) ?? roleOptions[0] ?? null;
  }, [roleOptions, selectedRoleId]);

  const filteredUsers = React.useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = selectedRoleId ? String(user.roleId) === selectedRoleId : true;
      const matchesSearch =
        !term ||
        [user.username, user.fullName, user.roleName]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesRole && matchesSearch;
    });
  }, [search, selectedRoleId, users]);

  const activeUsers = React.useMemo(() => users.filter((user) => user.isActive).length, [users]);
  const adminUsers = React.useMemo(
    () => users.filter((user) => user.roleName.toLowerCase() === "administrador").length,
    [users]
  );

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Gobierno y acceso
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Usuarios y roles</h1>
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                Administra cuentas, roles operativos y estado de acceso sin salir del panel protegido.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Usuarios</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{users.length}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Activos</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{activeUsers}</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Admins</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{adminUsers}</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              Filtros y acciones
            </CardTitle>
            <CardDescription>Busca por nombre o usuario y filtra por rol sin perder contexto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Buscar por usuario, nombre o rol"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <Combobox
                items={roleOptions}
                value={selectedRole}
                onValueChange={(option: ComboboxOption | null) => setSelectedRoleId(option?.id ?? "")}
                itemToStringLabel={(option) => option?.label ?? ""}
                itemToStringValue={(option) => option?.id ?? ""}
              >
                <ComboboxInput placeholder="Filtrar por rol" showClear />
                <ComboboxContent className="z-50">
                  <ComboboxEmpty>Sin resultados</ComboboxEmpty>
                  <ComboboxList>
                    {(option: ComboboxOption) => (
                      <ComboboxItem key={option.id || "all-roles"} value={option}>
                        {option.label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Recargar
              </Button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users2 className="h-4 w-4 text-muted-foreground" />
              Directorio operativo
            </CardTitle>
            <CardDescription>
              {loading ? "Actualizando informacion de accesos..." : `${filteredUsers.length} usuarios visibles en la vista actual.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol actual</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const busy = savingUserId === user.id;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleTone(user.roleName)}`}>
                            {user.roleName}
                          </span>
                          <select
                            className="h-9 min-w-45 rounded-md border border-input bg-background px-3 text-sm"
                            value={user.roleId}
                            disabled={busy}
                            onChange={(event) => void handleRoleChange(user.id, Number(event.target.value))}
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            user.isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {user.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void handleStatusToggle(user)}
                          >
                            <UserRoundCheck className="h-4 w-4" />
                            {user.isActive ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!loading && filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No hay usuarios que coincidan con los filtros actuales.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

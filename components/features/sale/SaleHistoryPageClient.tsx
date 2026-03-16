"use client";

import * as React from "react";
import toast from "react-hot-toast";
import {
  CalendarRange,
  Download,
  FileDown,
  FileText,
  Receipt,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  downloadDailyInvoicesPdf,
  downloadInvoicePdf,
  downloadSalesReportPdf,
  getSalesHistory,
} from "@/services/sale.service";
import { SaleHistoryItemDto, SaleHistoryResponseDto } from "@/types/sale";
import { formatDate } from "@/utils/formatDate";

const money = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function toInputDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function todayInputDate(): string {
  return toInputDate(new Date());
}

function firstDayOfMonthInputDate(): string {
  const now = new Date();
  return toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function triggerPdfDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function SaleHistoryPageClient() {
  const [startDate, setStartDate] = React.useState<string>(firstDayOfMonthInputDate());
  const [endDate, setEndDate] = React.useState<string>(todayInputDate());
  const [history, setHistory] = React.useState<SaleHistoryResponseDto | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isDownloadingReport, setIsDownloadingReport] = React.useState<boolean>(false);
  const [isDownloadingDayInvoices, setIsDownloadingDayInvoices] = React.useState<boolean>(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = React.useState<number | null>(null);

  const loadHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getSalesHistory(startDate, endDate);
      setHistory(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el historial de ventas");
    } finally {
      setIsLoading(false);
    }
  }, [endDate, startDate]);

  React.useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function handleDownloadInvoice(sale: SaleHistoryItemDto) {
    setDownloadingInvoiceId(sale.id);
    try {
      const pdfBlob = await downloadInvoicePdf(sale.id);
      triggerPdfDownload(pdfBlob, `Factura-${sale.invoiceNumber}.pdf`);
      toast.success(`Factura ${sale.invoiceNumber} descargada`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo descargar la factura");
    } finally {
      setDownloadingInvoiceId(null);
    }
  }

  async function handleDownloadRangeReport() {
    setIsDownloadingReport(true);
    try {
      const pdfBlob = await downloadSalesReportPdf(startDate, endDate);
      triggerPdfDownload(pdfBlob, `Reporte-Ventas-${startDate}-${endDate}.pdf`);
      toast.success("Reporte PDF descargado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar el reporte PDF");
    } finally {
      setIsDownloadingReport(false);
    }
  }

  async function handleDownloadDayInvoices() {
    if (!startDate || !endDate || startDate !== endDate) {
      toast.error("Para descargar facturas del día, usa una fecha específica (inicio = fin)");
      return;
    }

    setIsDownloadingDayInvoices(true);
    try {
      const pdfBlob = await downloadDailyInvoicesPdf(startDate);
      triggerPdfDownload(pdfBlob, `Facturas-Dia-${startDate}.pdf`);
      toast.success("Facturas del día descargadas");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron descargar las facturas del día");
    } finally {
      setIsDownloadingDayInvoices(false);
    }
  }

  function applyTodayPreset() {
    const today = todayInputDate();
    setStartDate(today);
    setEndDate(today);
  }

  function applyMonthPreset() {
    setStartDate(firstDayOfMonthInputDate());
    setEndDate(todayInputDate());
  }

  const summary = history?.summary;

  return (
    <div className="min-h-full bg-background px-4 py-5 md:px-6 xl:px-8 2xl:px-10">
      <div className="w-full space-y-6">
        <section className="rounded-[26px] border border-border bg-card px-5 py-6 shadow-xs md:px-7">
          <div className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <CalendarRange className="h-3.5 w-3.5" />
              Historial de ventas
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Reportes y facturación
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              Consulta ventas por rango o fecha específica, revisa la trazabilidad monetaria y descarga facturas o reportes en PDF.
            </p>
          </div>
        </section>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              Filtros de consulta
            </CardTitle>
            <CardDescription>
              Puedes elegir rango de fechas o usar una fecha específica para descargar las facturas del día.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Desde
                </label>
                <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Hasta
                </label>
                <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" className="w-full" onClick={applyTodayPreset}>
                  Hoy
                </Button>
                <Button variant="outline" className="w-full" onClick={applyMonthPreset}>
                  Este mes
                </Button>
              </div>
              <div className="flex items-end gap-2">
                <Button className="w-full" onClick={() => void loadHistory()} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                  Consultar
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Button variant="outline" onClick={() => void handleDownloadRangeReport()} disabled={isDownloadingReport}>
                <FileText className="h-4 w-4" />
                {isDownloadingReport ? "Generando reporte..." : "Descargar reporte PDF"}
              </Button>
              <Button variant="outline" onClick={() => void handleDownloadDayInvoices()} disabled={isDownloadingDayInvoices}>
                <Download className="h-4 w-4" />
                {isDownloadingDayInvoices ? "Generando facturas del día..." : "Descargar facturas del día"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ventas</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{summary?.totalSales ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Productos vendidos</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{summary?.totalProductsSold ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/25 bg-primary/5 shadow-xs">
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">Total facturado</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{money.format(summary?.totalRevenue ?? 0)}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-xs">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ticket promedio</p>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold text-foreground">{money.format(summary?.averageTicket ?? 0)}</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-foreground">Registro de ventas</CardTitle>
            <CardDescription>
              Solo lectura. Cada fila permite descargar la factura PDF individual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factura</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Recibido</TableHead>
                  <TableHead>Vuelto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history?.sales ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="py-10 text-center text-muted-foreground">
                      No hay ventas para el rango seleccionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  (history?.sales ?? []).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                          {sale.invoiceNumber}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(sale.saleDate)}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell>{sale.sellerName}</TableCell>
                      <TableCell>{sale.paymentMethod}</TableCell>
                      <TableCell>{sale.productsSold}</TableCell>
                      <TableCell>{money.format(sale.subTotal)}</TableCell>
                      <TableCell className="text-rose-600">-{money.format(sale.discount)}</TableCell>
                      <TableCell>{money.format(sale.total)}</TableCell>
                      <TableCell>{money.format(sale.amountPaid)}</TableCell>
                      <TableCell>{money.format(sale.changeAmount)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="default"
                          className="shadow-sm"
                          disabled={downloadingInvoiceId === sale.id}
                          onClick={() => void handleDownloadInvoice(sale)}
                        >
                          <FileDown className="h-4 w-4" />
                          {downloadingInvoiceId === sale.id ? "Descargando..." : "Factura PDF"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

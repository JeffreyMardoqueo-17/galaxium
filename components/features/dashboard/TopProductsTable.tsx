import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TopSellingProductsResponse } from "@/types/dasboard";

type Props = {
  topProducts: TopSellingProductsResponse;
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
};

export function TopProductsTable({
  topProducts,
  currencyFormatter,
  numberFormatter,
}: Props) {
  const maxRevenue = topProducts.products.reduce((acc, current) => {
    const revenue =
      typeof current.totalRevenue === "number"
        ? current.totalRevenue
        : typeof current.revenueGenerated === "number"
          ? current.revenueGenerated
          : 0;

    return Math.max(acc, revenue);
  }, 0);

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Top productos</CardTitle>
            <CardDescription>
              Rendimiento por ingresos y unidades vendidas
            </CardDescription>
          </div>
          <span className="inline-flex items-center rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Top {topProducts.requestedTop}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-16">#</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Unidades</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No hay productos para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.products.map((p, idx) => {
                  const revenue =
                    typeof p.totalRevenue === "number"
                      ? p.totalRevenue
                      : typeof p.revenueGenerated === "number"
                        ? p.revenueGenerated
                        : 0;

                  const share =
                    maxRevenue > 0
                      ? Math.round((revenue / maxRevenue) * 100)
                      : 0;

                  return (
                    <TableRow key={p.productId} className="hover:bg-muted/25">
                      <TableCell>
                        <span className="inline-flex min-w-8 justify-center rounded-md border bg-muted/40 px-2 py-0.5 text-xs font-semibold">
                          {idx + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <p
                            className="truncate max-w-[120px] sm:max-w-[180px] lg:max-w-[250px]"
                            title={p.productName}
                          >
                            {p.productName}
                          </p>
                          <div className="h-1.5 rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-linear-to-r from-sky-500 to-cyan-400"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {numberFormatter.format(p.totalSold)}
                      </TableCell>
                      <TableCell className="text-right">
                        {currencyFormatter.format(revenue)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// C:\Users\Admin\Documents\Projects\Proyectos\galaxium\types\sale.ts

// ===============================
// SALE DETAIL
// ===============================

export interface SaleDetailCreateDto {
  productId: number;
  quantity: number;
}

export interface SaleDetailResponseDto {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

// ===============================
// SALE CREATE
//  public record SaleCreateDto(
//         int? CustomerId,
//         int PaymentMethodId,
//         decimal Discount,
//         decimal? AmountPaid,  // Cantidad pagada por el cliente (solo para efectivo)
//         List<SaleDetailCreateDto> Details
//     );
// ===============================

export interface SaleCreateDto {
  customerId?: number | null;
  paymentMethodId: number;
  discount: number;
  amountPaid?: number | null;  // Cantidad pagada por el cliente (solo para efectivo)
  details: SaleDetailCreateDto[];
}

// ===============================
// SALE RESPONSE
    // public record SaleResponseDto(
    //         int Id,
    //         int? CustomerId,
    //         int UserId,
    //         int PaymentMethodId,
    //         decimal SubTotal,
    //         decimal Discount,
    //         decimal Total,
    //         decimal AmountPaid,     // Dinero recibido
    //         decimal ChangeAmount,   // Vuelto entregado
    //         string Status,
    //         string? InvoiceNumber,
    //         DateTime SaleDate,
    //         DateTime CreatedAt,
    //         List<SaleDetailResponseDto> Details
    //     );
// ===============================

export interface SaleResponseDto {
  id: number;
  customerId?: number | null;
  userId: number;
  paymentMethodId: number;
  subTotal: number;
  discount: number;
  total: number;
  amountPaid?: number | null;  // Dinero recibido
  changeAmount?: number | null; // Vuelto entregado
  status: string;
  invoiceNumber?: string | null;
  saleDate: string;     // DateTime → string ISO
  createdAt: string;   // DateTime → string ISO
  details: SaleDetailResponseDto[];
}

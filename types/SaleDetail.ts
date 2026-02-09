//  public record SaleDetailCreateDto(
//         int ProductId,
//         int Quantity
//     );
export interface SaleDetailsCreateDto {
    productId: number;
    quantity: number;
}
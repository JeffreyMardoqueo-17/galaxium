export interface ProductCardModel {
  id: string | number
  name: string
  sku: string
  stock: number
  minimumStock: number
  isActive: boolean
  categoryName: string
  salePrice: number
}

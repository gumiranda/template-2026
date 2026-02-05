export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

export function calculateDiscountedPrice(
  price: number,
  discountPercentage?: number
): number {
  if (!discountPercentage || discountPercentage <= 0) {
    return price;
  }
  return price * (1 - discountPercentage / 100);
}

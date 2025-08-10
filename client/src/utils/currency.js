// Simple VND formatter used across the app
// Usage: formatVND(12345) => "₫12,345"
export function formatVND(value) {
  const num = Number(value) || 0;
  // Use vi-VN grouping, no decimals, prepend dong symbol
  return `₫${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num)}`;
}

// If you ever need with currency style (symbol at the end), use below:
// export function formatVNDCurrency(value) {
//   const num = Number(value) || 0;
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);
// }

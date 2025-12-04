export default function formatNumber(
  value: number,
  decimals: number = 0,
  sign: boolean = false,
): string {
  let result = Number(value.toFixed(decimals)).toLocaleString();
  if (sign && value > 0.0) {
    result = "" + result;
  }
  return result;
}

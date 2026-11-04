export function rand(amount: number): string {
  const [whole, cents] = amount.toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return cents === '00' ? `R${grouped}` : `R${grouped}.${cents}`;
}

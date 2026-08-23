export function quarterOf(d: Date): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

export function quarterRange(quarter: string): { start: Date; end: Date } {
  const [yearStr, qStr] = quarter.split('-Q');
  const year = Number(yearStr);
  const q = Number(qStr);
  const startMonth = (q - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0); // last day of the quarter
  return { start, end };
}

export function adjacentQuarter(quarter: string, delta: number): string {
  const [yearStr, qStr] = quarter.split('-Q');
  let year = Number(yearStr);
  let q = Number(qStr) + delta;
  while (q > 4) {
    q -= 4;
    year += 1;
  }
  while (q < 1) {
    q += 4;
    year -= 1;
  }
  return `${year}-Q${q}`;
}

export function quarterLabel(quarter: string): string {
  const [year, q] = quarter.split('-Q');
  const names = ['Jan \u2013 Mar', 'Apr \u2013 Jun', 'Jul \u2013 Sep', 'Oct \u2013 Dec'];
  return `${names[Number(q) - 1]} ${year}`;
}

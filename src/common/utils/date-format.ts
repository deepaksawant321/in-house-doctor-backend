const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

/** App-wide date format for user-facing text: dd/MMM/yyyy, hh:mm AM/PM (server local time). */
export function formatDateTimeDMY(value: string | number | Date): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const h = d.getHours();
  return `${pad(d.getDate())}/${MONTHS[d.getMonth()]}/${d.getFullYear()}, ${pad(h % 12 || 12)}:${pad(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
}

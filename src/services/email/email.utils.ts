export const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const formatCurrency = (amount: number | null | undefined, currency: string = 'INR'): string => {
  if (amount == null) return 'Not provided';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'Not provided';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Not provided';
  
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata' // Defaulting to Indian business context as per instructions
  }).format(d);
};

export const formatText = (text: string | null | undefined): string => {
  if (!text) return 'Not provided';
  return escapeHtml(text).replace(/\n/g, '<br/>');
};

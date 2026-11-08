/**
 * Converts a numeric Ghana Cedi amount into words
 * e.g. 2450.50 -> "Two Thousand Four Hundred and Fifty Ghana Cedis, Fifty Pesewas Only"
 */

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertBelowThousand(num: number): string {
  if (num === 0) return '';
  if (num < 20) return ones[num];
  if (num < 100) {
    const unit = num % 10;
    return tens[Math.floor(num / 10)] + (unit ? '-' + ones[unit] : '');
  }
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  let str = ones[hundred] + ' Hundred';
  if (remainder > 0) {
    str += ' and ' + convertBelowThousand(remainder);
  }
  return str;
}

export function formatCedisInWords(amount: number): string {
  if (amount === 0) return 'Zero Ghana Cedis Only';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const cedis = Math.floor(absAmount);
  const pesewas = Math.round((absAmount - cedis) * 100);

  let cediWords = '';
  if (cedis === 0) {
    cediWords = 'Zero';
  } else {
    const millions = Math.floor(cedis / 1000000);
    const thousands = Math.floor((cedis % 1000000) / 1000);
    const remainder = cedis % 1000;

    const parts: string[] = [];
    if (millions > 0) {
      parts.push(convertBelowThousand(millions) + ' Million');
    }
    if (thousands > 0) {
      parts.push(convertBelowThousand(thousands) + ' Thousand');
    }
    if (remainder > 0) {
      parts.push(convertBelowThousand(remainder));
    }
    cediWords = parts.join(', ');
  }

  let result = (isNegative ? 'Negative ' : '') + cediWords + ' Ghana Cedis';

  if (pesewas > 0) {
    result += ', and ' + convertBelowThousand(pesewas) + ' Pesewas';
  }
  result += ' Only';

  return result;
}

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('GHS', 'GH₵');
}

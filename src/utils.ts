const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

export function numberToWords(num: number): string {
  if (num === 0) return 'ZERO TAKA ONLY';
  const integerPart = Math.floor(num);
  let word = '';
  let n = integerPart;
  
  if (n >= 10000000) {
    word += numberToWordsInternal(Math.floor(n / 10000000)) + ' CRORE ';
    n %= 10000000;
  }
  if (n >= 100000) {
    word += numberToWordsInternal(Math.floor(n / 100000)) + ' LAC ';
    n %= 100000;
  }
  if (n >= 1000) {
    word += numberToWordsInternal(Math.floor(n / 1000)) + ' THOUSAND ';
    n %= 1000;
  }
  if (n >= 100) {
    word += numberToWordsInternal(Math.floor(n / 100)) + ' HUNDRED ';
    n %= 100;
  }
  if (n > 0) {
    word += numberToWordsInternal(n) + ' ';
  }
  
  return word.trim() + ' TAKA ONLY';
}

function numberToWordsInternal(num: number): string {
  let word = '';
  if (num < 20) {
    word = ones[num];
  } else {
    word = tens[Math.floor(num / 10)];
    if (num % 10 > 0) {
      word += ' ' + ones[num % 10];
    }
  }
  return word;
}

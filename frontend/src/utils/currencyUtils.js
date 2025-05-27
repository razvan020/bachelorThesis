// Currency conversion utility

// Exchange rates (as of a specific date - these should ideally come from an API)
const exchangeRates = {
  EUR: {
    RON: 5.0, // 1 EUR = 5.0 RON
    USD: 1.1, // 1 EUR = 1.1 USD
    GBP: 0.85, // 1 EUR = 0.85 GBP
  }
};

// Currency symbols
const currencySymbols = {
  RON: 'RON',
  EUR: '€',
  USD: '$',
  GBP: '£'
};

// Map countries to their currencies
const countryCurrencies = {
  'Romania': 'RON',
  'Spain': 'EUR',
  'France': 'EUR',
  'Germany': 'EUR',
  'Italy': 'EUR',
  'Austria': 'EUR',
  'Belgium': 'EUR',
  'Netherlands': 'EUR',
  'United Kingdom': 'GBP',
  'USA': 'USD',
  // Add more countries as needed
};

// Default currency if country is not found
const defaultCurrency = 'EUR';

/**
 * Get the currency for a specific country
 * @param {string} country - The country name
 * @returns {string} The currency code
 */
export const getCurrencyForCountry = (country) => {
  return countryCurrencies[country] || defaultCurrency;
};

/**
 * Convert an amount from EUR to another currency
 * @param {number} amount - The amount in EUR
 * @param {string} toCurrency - The target currency code
 * @returns {number} The converted amount
 */
export const convertFromEUR = (amount, toCurrency) => {
  if (toCurrency === 'EUR') return amount;

  const rate = exchangeRates.EUR[toCurrency];
  if (!rate) return amount; // If no conversion rate is found, return the original amount

  return amount * rate;
};

/**
 * Format a price with the appropriate currency symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code
 * @returns {string} The formatted price
 */
export const formatPrice = (amount, currency) => {
  const symbol = currencySymbols[currency] || currency;

  // Format the number with 2 decimal places
  const formattedAmount = amount.toFixed(2);

  // For EUR, USD, GBP, the symbol comes before the amount
  if (['EUR', 'USD', 'GBP'].includes(currency)) {
    return `${symbol}${formattedAmount}`;
  }

  // For other currencies like RON, the symbol comes after the amount
  return `${formattedAmount} ${symbol}`;
};

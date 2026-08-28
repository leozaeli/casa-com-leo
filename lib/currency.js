const FALLBACK_RATES = { usdBrl: 5.4, eurBrl: 5.85 };

export async function getExchangeRates() {
  try {
    const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_RATES;
    const data = await res.json();
    const usdBrl = Number(data?.USDBRL?.bid);
    const eurBrl = Number(data?.EURBRL?.bid);
    if (!usdBrl || !eurBrl) return FALLBACK_RATES;
    return { usdBrl, eurBrl };
  } catch (error) {
    console.error('Erro ao buscar cotação:', error);
    return FALLBACK_RATES;
  }
}

export function formatUSD(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function formatEUR(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

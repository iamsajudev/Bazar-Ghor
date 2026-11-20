// API দাম minor units-এ পাঠায় (পয়সা) — ডকে স্পষ্ট বলা আছে
export function formatPrice(minorUnits: number, currency: string = "BDT"): string {
    const amount = minorUnits / 100;
    if (currency === "BDT") {
        return `$${amount.toLocaleString("en-BD", {
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        })}`;
    }
    return `${currency} ${amount.toFixed(2)}`;
}

// UI-তে ইউজার টাকায় ইনপুট দেয় → API-তে পাঠানোর আগে পয়সায়
export function toMinorUnits(taka: number): number {
    return Math.round(taka * 100);
}
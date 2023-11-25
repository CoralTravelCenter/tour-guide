export function asapTimeframe() {
    const tomorrow = moment().add({ d: 1 });
    return {
        startMoment:    moment(tomorrow),
        endMoment:      moment(tomorrow).add({ d: 6 }),
        selectedMoment: moment(tomorrow)
    };
}
export function in2monthsTimeframe() {
    const base = moment().add({ d: 60});
    return {
        startMoment:    moment(base).subtract({ d: 3 }),
        endMoment:      moment(base).add({ d: 3 }),
        selectedMoment: moment(base)
    };
}

export async function lowBudgetLabel() {
    const { code, symbol, rate } = await currency();
    return `low ${ symbol }`;
}
export async function mediumBudgetLabel() {
    const { code, symbol, rate } = await currency();
    return `medium ${ symbol }`;
}
export async function highBudgetLabel() {
    const { code, symbol, rate } = await currency();
    return `high ${ symbol }`;
}


function currencyFromDOM() {
    return {
        name:  document.querySelector('.headerCurrency .currency-list .selected .currency-name').textContent,
        value: document.querySelector('.headerCurrency .currency-list .selected').dataset.currencyid,
    };
}
async function getActiveCurrency() {
    return new Promise(resolve => {
        if (['complete','interactive'].includes(document.readyState)) {
            resolve(currencyFromDOM());
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                resolve(currencyFromDOM());
            });
        }
    });
}
export async function currency() {
    const { name: code } = await getActiveCurrency();
    let rate = 1.0;
    let symbol = '₽';
    const [usd_rate, eur_rate] = $('.flexbox-exchange').eq(0).find('img').next().map((idx, el) => parseFloat(el.textContent.replace(',', '.'))).toArray();
    if (code === 'USD') {
        rate = usd_rate;
        symbol = '$';
    }
    if (code === 'EUR') {
        rate = eur_rate;
        symbol = '€';
    }
    return { code, symbol, rate };
}
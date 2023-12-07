import { cloneDeep } from "lodash";

export function asapTimeframe() {
    const base = moment().add({ d: 2 * 7 });
    return {
        startMoment:    moment(base),
        endMoment:      moment(base).add({ d: 6 }),
        selectedMoment: moment(base)
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
export async function currencyBudget() {
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
    const budget = {
        low: {
            labelMarkup: {
                RUB: 'до 100 000 <span style="font-family: \'Material Icons\'; margin-left: .1em;">currency_ruble</span>',
                EUR: 'до €1,000',
                USD: 'до $1,000'
            }[code],
            min: 0,
            max: { RUB: 100000, EUR: 1000, USD: 1000 }[code]
        },
        medium: {
            labelMarkup: {
                RUB: 'от 100 000 <span style="font-family: \'Material Icons\'; margin-left: .1em;">currency_ruble</span> до 200 000 <span style="font-family: \'Material Icons\'; margin-left: .1em;">currency_ruble</span>',
                EUR: 'от €1,000 до €2,000',
                USD: 'от $1,000 до $2,000',
            }[code],
            min: { RUB: 100000, EUR: 1000, USD: 1000 }[code],
            max: { RUB: 200000, EUR: 2000, USD: 2000 }[code]
        },
        high: {
            labelMarkup: {
                RUB: 'от 200 000 <span style="font-family: \'Material Icons\'; margin-left: .1em;">currency_ruble</span>',
                EUR: 'от €2,000',
                USD: 'от $2,000'
            }[code],
            min: { RUB: 200000, EUR: 2000, USD: 2000 }[code],
            max: Infinity
        },
    };
    return { code, symbol, rate, budget };
}

function intersects(list1, list2) {
    const list = [].concat(list1, list2);
    return new Set(list).size < list.length;
}
export function choiceLeadsToDeadEnd(choice, destinations, preferredSearchParams) {
    // return false;
    const tmpSearchParams = cloneDeep(preferredSearchParams);
    if (choice.kindKey) {
        tmpSearchParams.leisureKinds = [choice.kindKey];
    } else {
        for (const action of choice.actions ?? []) {
            switch (action.what) {
                case 'setPreferredBudget':
                    tmpSearchParams.budget = {
                        lowBudgetRange: { currencyCode: 'RUB', min: 0, max: 100000 },
                        mediumBudgetRange: { currencyCode: 'RUB', min: 100000, max: 200000 },
                        highBudgetRange: { currencyCode: 'RUB', min: 200000, max: Infinity },
                    }[action.predefined];
                    break;
                case 'setMaxFlightDuration':
                    tmpSearchParams.maxFlightDuration = action.predefined;
                    break;
            }
        }
    }
    return !destinations.some(dest => {
        return dest.flightDuration <= tmpSearchParams.maxFlightDuration
            && (!tmpSearchParams.leisureKinds.length || intersects(dest.leisureKinds, tmpSearchParams.leisureKinds));
    });
}
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
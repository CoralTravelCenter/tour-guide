import { pick } from "lodash";

export function apiUrl(endpoint) {
    const apiHost = location.hostname === 'localhost' ? 'http://localhost:8010/proxy' : '//b2capi.coral.ru';
    // const apiHost = location.hostname === 'localhost' ? 'http://localhost:8888' : '';
    return apiHost + endpoint;
}
export async function fetchAvailableFlights(departure, destination, charters_only) {

    if (!departure?.eeID || !destination?.eeID) {
        return Promise.reject();
    }
    const cacheKey = `${ departure.eeID }->${ destination.eeID }`;
    const cachedResponse = sessionStorage.getItem(cacheKey);
    if (cachedResponse) return Promise.resolve(JSON.parse(cachedResponse));

    return new Promise(resolve => {

        fetch(apiUrl('/PackageTourHotelProduct/ListAvailableDates'), {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                departureLocations: [{ id: departure.id, type: departure.type }],
                arrivalLocations:   [{ id: `${ destination.eeID }-0`, type: 0 }]
            })
        }).then(response => response.json()).then(json => {
            const conformedFlightsList = Array.from((function* (results) {
                for (const date_descriptor of results) {
                    const mapped = {
                        timestamp: moment(date_descriptor.date).valueOf(),
                        type:      date_descriptor.flightType
                    };
                    if (charters_only) {
                        if (date_descriptor.flightType !== 1) yield mapped;
                    } else {
                        yield mapped;
                    }
                }
            })(json.result.dates));
            sessionStorage.setItem(cacheKey, JSON.stringify(conformedFlightsList));
            resolve(conformedFlightsList);
        });

    });
}

export async function fetchAvailableNights(departure, destination, charters_only, beginDateFormatted, endDateFormatted) {
    if (!departure?.eeID || !destination?.eeID) {
        return Promise.reject();
    }
    const cacheKey = `${ departure.eeID }->${ destination.eeID }@${ beginDateFormatted }-${ endDateFormatted }`;
    const cachedResponse = sessionStorage.getItem(cacheKey);
    if (cachedResponse) return Promise.resolve(JSON.parse(cachedResponse));

    return new Promise(resolve => {

        fetch(apiUrl('/PackageTourHotelProduct/ListAvailableNights'), {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                flightType: charters_only ? 0 : 2,
                beginDates: [beginDateFormatted, endDateFormatted],
                departureLocations: [{ id: departure.id, type: departure.type }],
                arrivalLocations:   [{ id: `${ destination.eeID }-0`, type: 0 }]
            })
        }).then(response => response.json()).then(json => {
            const results = json.result.nights.map(n => n.value);
            sessionStorage.setItem(cacheKey, JSON.stringify(results));
            resolve(results);
        });

    });
}

export function fetchPackageSearchLink(departure, destination, charters_only, guest, beginDate, endDate, selectedDate, nights, filters) {
    const nights_normalized = JSON.parse(JSON.stringify(nights)).sort((a, b) => Number(a) - Number(b));
    return new Promise(resolve => {
        const departure_location = pick(departure, ['id', 'name', 'isCurrent', 'type', 'friendlyUrl']);
        departure_location.id = departure_location.id.replace(/-+$/, '');
        const queryParams = {
            reservationType: 1,
            flightType: charters_only ? 0 : 2,
            beginDates: [beginDate, endDate],
            departureLocations: [departure_location],
            arrivalLocations: [{
                id: `${ destination.eeID }-0`,
                type: 0,
                name: destination.name,
                friendlyUrl: destination.friendlyUrl
            }],
            nights: nights_normalized.map(n => ({ value: n })),
            datePickerMode: 0,
            roomCriterias: [{
                passengers: [...(function* () {
                    let number_of_adults = guest.Adults;
                    while (number_of_adults--) yield { passengerType: 0, age: 20 }
                    if (guest.Children?.length) {
                        for (let child_age of guest.Children) yield { passengerType: 1, age: child_age, birthDate: null };
                    }
                })(guest)],
            }],
            paging: { pageNumber: 1, pageSize: 20, sortType: 0 },
            additionalFilters: filters || [],
            imageSizes: [0]
        };

        console.log('+++ fetchPackageSearchLink queryParams: %o', queryParams);

        fetch(apiUrl('/PackageTourHotelProduct/PriceSearchEncrypt'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queryParams)
        }).then(response => response.json()).then(json => {
            resolve(json.result);
        });

    });
}

export function fetchHotelSearchLink(destination, guest, beginDate, endDate, nights) {
    const nights_normalized = JSON.parse(JSON.stringify(nights)).sort((a, b) => Number(a) - Number(b));
    return new Promise(resolve => {

        const queryParams = {
            reservationType: 2,
            beginDates: [beginDate, endDate],
            arrivalLocations: [{
                id: `${ destination.eeID }-0`,
                type: 0,
                name: destination.name,
                friendlyUrl: destination.friendlyUrl
            }],
            nights: nights_normalized.map(n => ({ value: n })),
            roomCriterias: [{
                passengers: [...(function* () {
                    let number_of_adults = guest.Adults;
                    while (number_of_adults--) yield { passengerType: 0, age: 20 }
                    if (guest.Children?.length) {
                        for (let child_age of guest.Children) yield { passengerType: 1, age: child_age, birthDate: null };
                    }
                })(guest)],
            }],
            paging: { pageNumber: 1, pageSize: 20, sortType: 0 },
            additionalFilters: [],
            imageSizes: [0]
        };


        console.log('+++ fetchHotelSearchLink queryParams: %o', queryParams);

        fetch(apiUrl('/OnlyHotelProduct/PriceSearchEncrypt'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(queryParams)
        }).then(response => response.json()).then(json => {
            resolve(json.result);
        });

        // $.post(apiUrl('/v1/onlyhotel/search'), reqData).done(response => {
        //     resolve(response);
        // });
    });
}


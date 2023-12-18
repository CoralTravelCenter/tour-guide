export function apiUrl(endpoint) {
    // const apiHost = location.hostname === 'localhost' ? 'http://localhost:8010/proxy' : '';
    const apiHost = location.hostname === 'localhost' ? 'http://localhost:8888' : '';
    return apiHost + endpoint;
}
export async function fetchAvailableFlights(departure, destination) {

    if (!departure?.eeID || !destination?.eeID) {
        return Promise.reject();
    }
    const cacheKey = `${ departure.eeID }->${ destination.eeID }`;
    const cachedResponse = sessionStorage.getItem(cacheKey);
    if (cachedResponse) return Promise.resolve(JSON.parse(cachedResponse));

    return new Promise(resolve => {
        $.get(apiUrl('/v1/flight/availablealldatev2'), {
            fromAreaId: departure.eeID,
            toCountryId: destination.eeID,
            destinationId: `Country${ destination.eeID }`,
            // nearestAirports: destination.airports.join(',')
        }).done(response => {
            const results = response.Result || JSON.parse(response).Result;
            const conformedFlightsList = results.map(result => {
                return {
                    timestamp: result.FlightDate.match(/\d+/)[0],
                    type: result.FlightType
                }
            });
            sessionStorage.setItem(cacheKey, JSON.stringify(conformedFlightsList));
            resolve(conformedFlightsList);
        });
    });
}
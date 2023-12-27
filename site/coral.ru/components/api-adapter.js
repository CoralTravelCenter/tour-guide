export function apiUrl(endpoint) {
    const apiHost = location.hostname === 'localhost' ? 'http://localhost:8010/proxy' : '';
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
        $.get(apiUrl('/v1/flight/availablealldatev2'), {
            fromAreaId: departure.eeID,
            toCountryId: destination.eeID,
            destinationId: `Country${ destination.eeID }`,
            // nearestAirports: destination.airports.join(',')
        }).done(response => {
            const results = response.Result || JSON.parse(response).Result;
            const conformedFlightsList = Array.from((function* (results) {
                for (const result of results) {
                    const mapped = {
                        timestamp: Number(result.FlightDate.match(/\d+/)[0]),
                        type:      result.FlightType
                    };
                    if (charters_only) {
                        if (result.FlightType !== 1) yield mapped;
                    } else {
                        yield mapped;
                    }
                }
            })(results));
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
        $.get(apiUrl('/v1/flight/availablenights'), {
            fromAreaId:    departure.eeID,
            toCountryId:   destination.eeID,
            destinationId: `Country${ destination.eeID }`,
            // nearestAirports: destination.airports.join(',')
            beginDate: beginDateFormatted,
            endDate:   endDateFormatted,
            // flightType: charters_only ? [0,2] : ''
        }).done(response => {
            const results = response.Result || JSON.parse(response).Result;
            sessionStorage.setItem(cacheKey, JSON.stringify(results));
            resolve(results);
        });
    });
}

export function fetchPackageSearchLink(departure, destination, charters_only, guest, beginDate, endDate, selectedDate, nights) {
    return new Promise(resolve => {
        const reqData = {
            isCharter: true,
            isRegular: !charters_only,
            Guest:     { ...(JSON.parse(JSON.stringify(guest))) },
            // DateRange: 3,
            BeginDate:    beginDate,
            EndDate:      endDate,
            SelectedDate: selectedDate,
            Acc: JSON.parse(JSON.stringify(nights)),
            Departures: [{ Id: departure.eeID, Label: departure.name }],
            Destination: [{
                Id:               `Country${ destination.eeID }`,
                DataId:           destination.eeID,
                TopDataId:        '',
                ParentDataId:     '',
                TitleRu:          destination.name,
                ModelType:        1,
                Priority:         1,
                RecordSourceType: 2,
                HasAirport:       false,
                NearestAirports:  (destination.airports && JSON.parse(JSON.stringify(destination.airports))) || [],
            }]
        };
        console.log('+++ fetchPackageSearchLink reqData: %o', reqData);
        $.post(apiUrl('/v1/package/search'), reqData).done(response => {
            resolve(response);
        });
    });
}

export function fetchHotelSearchLink(destination, guest, beginDate, endDate) {
    return new Promise(resolve => {
        const reqData = {
            Guest:     { ...(JSON.parse(JSON.stringify(guest))) },
            BeginDate:    beginDate,
            EndDate:      endDate,
            Destination: {
                Id:               `Country${ destination.eeID }`,
                DataId:           destination.eeID,
                TopDataId:        '',
                ParentDataId:     '',
                Title:            destination.title,
                TitleRu:          destination.name,
                ParentTitle:      '',
                ParentTitleRu:    '',
                ModelType:        1,
                Priority:         1,
                RecordSourceType: 2,
                HasAirport:       false,
                NearestAirports:  (destination.airports && JSON.parse(JSON.stringify(destination.airports))) || [],
            }
        };
        console.log('+++ fetchHotelSearchLink reqData: %o', reqData);
        $.post(apiUrl('/v1/onlyhotel/search'), reqData).done(response => {
            resolve(response);
        });
    });
}


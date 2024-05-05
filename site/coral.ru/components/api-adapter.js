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
        // POST
        // /PackageTourHotelProduct/ListAvailableDates

        // {
        //     "departureLocations": [
        //     {
        //         "id": "2671-5",
        //         "name": "Москва",
        //         "isCurrent": true,
        //         "type": 5,
        //         "friendlyUrl": "moskva"
        //     }
        // ],
        //     "arrivalLocations": [
        //     {
        //         "id": "1-0",
        //         "type": 0,
        //         "name": "Турция",
        //         "friendlyUrl": "turtsiya"
        //     }
        // ]
        // }

        // RESPONSE
        // result.dates
        // {
        //     "date": "2024-05-04",
        //     "flightType": // 0 -- charter only; 1 -- regular only; 2 -- both
        // }

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

        // $.get(apiUrl('/v1/flight/availablealldatev2'), {
        //     fromAreaId: departure.eeID,
        //     toCountryId: destination.eeID,
        //     destinationId: `Country${ destination.eeID }`,
        //     // nearestAirports: destination.airports.join(',')
        // }).done(response => {
        //     const results = response.Result || JSON.parse(response).Result;
        //     const conformedFlightsList = Array.from((function* (results) {
        //         for (const result of results) {
        //             const mapped = {
        //                 timestamp: Number(result.FlightDate.match(/\d+/)[0]),
        //                 type:      result.FlightType
        //             };
        //             if (charters_only) {
        //                 if (result.FlightType !== 1) yield mapped;
        //             } else {
        //                 yield mapped;
        //             }
        //         }
        //     })(results));
        //     sessionStorage.setItem(cacheKey, JSON.stringify(conformedFlightsList));
        //     resolve(conformedFlightsList);
        // });
    });
}

export async function fetchAvailableNights(departure, destination, charters_only, beginDateFormatted, endDateFormatted) {
    if (!departure?.eeID || !destination?.eeID) {
        return Promise.reject();
    }
    const cacheKey = `${ departure.eeID }->${ destination.eeID }@${ beginDateFormatted }-${ endDateFormatted }`;
    const cachedResponse = sessionStorage.getItem(cacheKey);
    if (cachedResponse) return Promise.resolve(JSON.parse(cachedResponse));

    // POST
    // /PackageTourHotelProduct/ListAvailableNights
    // let p = {
    //     "flightType": 2,
    //     "beginDates": [
    //         "2024-06-03",
    //         "2024-06-07"
    //     ],
    //     "calculateAvailableNightRanges": true,
    //     "departureLocations":            [
    //         {
    //             "id":          "2671-5",
    //             "name":        "Москва",
    //             "isCurrent":   true,
    //             "type":        5,
    //             "friendlyUrl": "moskva"
    //         }
    //     ],
    //     "arrivalLocations":              [
    //         {
    //             "id":          "1-0",
    //             "type":        0,
    //             "name":        "Турция",
    //             "friendlyUrl": "turtsiya"
    //         }
    //     ]
    // }

    // RESPONSE
    // result.nights
    // {
    //     "label": "1",
    //     "value": 1
    // }

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

        // $.get(apiUrl('/v1/flight/availablenights'), {
        //     fromAreaId:    departure.eeID,
        //     toCountryId:   destination.eeID,
        //     destinationId: `Country${ destination.eeID }`,
        //     // nearestAirports: destination.airports.join(',')
        //     beginDate: beginDateFormatted,
        //     endDate:   endDateFormatted,
        //     // flightType: charters_only ? [0,2] : ''
        // }).done(response => {
        //     const results = response.Result || JSON.parse(response).Result;
        //     sessionStorage.setItem(cacheKey, JSON.stringify(results));
        //     resolve(results);
        // });
    });
}

export function fetchPackageSearchLink(departure, destination, charters_only, guest, beginDate, endDate, selectedDate, nights) {
    const nights_normalized = JSON.parse(JSON.stringify(nights)).sort((a, b) => Number(a) - Number(b));
    return new Promise(resolve => {
        const reqData = {
            isCharter: true,
            isRegular: !charters_only,
            Guest:     { ...(JSON.parse(JSON.stringify(guest))) },
            // DateRange: 3,
            BeginDate:    beginDate,
            EndDate:      endDate,
            SelectedDate: selectedDate,
            Acc: nights_normalized,
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


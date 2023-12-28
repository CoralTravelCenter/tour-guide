import { approxFlightDuration, preloadScript } from "./usefuls";
import { destinations } from "../config/tour-guide";
import { fetchAvailableFlights } from "./api-adapter";

export default class YandexMap {

    static instance;
    static get apiInitialized() {
        return !!window.ymaps?.Map;
    }
    static countriesBordersData;

    el;
    ymap;
    backdropPane;
    routesPane;
    availableCountriesGOC;
    otherCountriesGOC;
    departure2placemark;
    destination2placemark;

    options = {
        variant:           0,
        chartersOnly:      false,
        variants: [
            {
                mapType:         null,
                worldFill:       '#0193CF',
                availableFill:   '#FFFFFF',
                availableStroke: '#0067B5',
                selectedFill:    '#F0AB00'
            },
            {
                mapType:         undefined,
                availableFill:   '#FFFFFFCC',
                availableStroke: '#0067B5',
                selectedFill:    '#F0AB00CC'
            }
        ],
        ymaps_api:         '//api-maps.yandex.ru/2.1.64/?apikey=49de5080-fb39-46f1-924b-dee5ddbad2f1&lang=ru-RU',
        get worldFill() { return this.variants[this.variant].worldFill },
        get mapType() { return this.variants[this.variant].mapType },
        get availableFill() { return this.variants[this.variant].availableFill },
        get availableStroke() { return this.variants[this.variant].availableStroke },
        get selectedFill() { return this.variants[this.variant].selectedFill },
        genericFill:         '#B6D7E3',
        genericStroke:       '#FFFFFF',
        homeRegionFill:      '#1EBDFF',
        departures:          [],
        selectedDeparture:   { value: null },
        destinations:        [],
        selectedDestination: { value: null },
        preferredSearchParams: {}
    }
    constructor(el, options) {
        this.el = el;
        Object.assign(this.options, options);
        YandexMap.instance = this;
    }

    async init() {
        if (YandexMap.apiInitialized) {
            return this.ymapsInit();
        } else {
            console.log('+++ loading YandexMaps API...');
            const ymaps_api_callback = `ymaps_loaded_${ Math.round(Math.random() * 1000000) }`;
            let doResolve;
            window[ymaps_api_callback] = () => doResolve(this.ymapsInit());
            preloadScript(`${ this.options.ymaps_api }&onload=${ ymaps_api_callback }`);
            return new Promise(resolve => doResolve = resolve);
        }
    }

    async ymapsInit() {
        return new Promise(async resolve => {
            window.ymap = this.ymap = new ymaps.Map(this.el, {
                center: [47.2, 92.8],
                zoom: 2,
                type: this.options.mapType,
                // margin: [70, 500, 10, 70],
                controls: ['zoomControl'],
            }, {
                minZoom: 2,
                maxZoom: 6,
                suppressMapOpenBlock: true,
                avoidFractionalZoom: false,
                autoFitToViewport: 'always',
                // restrictMapArea: [[80,-160],[-80,160]]
            });
            if (this.options.worldFill) {
                this.backdropPane = new ymaps.pane.StaticPane(this.ymap, {
                    css: { width: '100%', height: '100%', backgroundColor: this.options.worldFill },
                    zIndex: 100
                });
                this.ymap.panes.append('backdropPane', this.backdropPane);
            }
            this.routesPane = new ymaps.pane.MovablePane(this.ymap, {
                css: { width: '100%', height: '100%' },
                // zIndex: 300
                zIndex: 401
            });
            this.ymap.panes.append('routesPane', this.routesPane);

            this.ymap.events.add('boundschange', () => {
                this.ymap.container.getElement().setAttribute('data-zoom', this.ymap.getZoom());
            });
            this.ymap.container.getElement().setAttribute('data-zoom', this.ymap.getZoom());

            await this.initCountriesCollections();
            this.otherCountriesGOC && this.ymap.geoObjects.add(this.otherCountriesGOC);
            this.ymap.geoObjects.add(this.availableCountriesGOC);

            this.makeDeparturesPlacemarks();
            this.makeDestinationsPlacemarks();

            resolve(this.ymap);

        });
    }

    async initCountriesCollections() {
        const bordersData = await this.fetchCountriesBorders();
        const destinations_iso_codes = this.options.destinations.map(d => d.ISO);
        let features2add = bordersData.features.filter(feature => destinations_iso_codes.includes(feature.properties.iso3166));
        this.availableCountriesGOC = new ymaps.GeoObjectCollection(null, {
            fillColor:   this.options.availableFill,
            strokeColor: this.options.availableStroke,
            hasHint:     false,
            cursor:      'default'
        });
        for (const feature of features2add) {
            this.availableCountriesGOC.add(new ymaps.GeoObject(feature));
        }
        if (this.options.variant === 0) {
            features2add = bordersData.features.filter(feature => !destinations_iso_codes.includes(feature.properties.iso3166));
            this.otherCountriesGOC = new ymaps.GeoObjectCollection(null, {
                fillColor:   this.options.genericFill,
                strokeColor: this.options.genericStroke,
                hasHint:     false,
                cursor:      'default'
            });
            for (const feature of features2add) {
                this.otherCountriesGOC.add(new ymaps.GeoObject(feature));
            }
        }
    }

    getGeoObjectWithISOCode(iso3166) {
        const collection = this.availableCountriesGOC;
        return collection.toArray().find(go => go.properties.get('iso3166') === iso3166);
    }

    async fetchCountriesBorders() {
        if (YandexMap.countriesBordersData) {
            return Promise.resolve(YandexMap.countriesBordersData);
        } else {
            return new Promise(resolve => {
                ymaps.borders.load('001', { lang: 'ru', quality: 2 }).then(result => {
                    YandexMap.countriesBordersData = result;
                    resolve(result);
                });
            });
        }
    }

    makeDeparturesPlacemarks() {
        const layout = this.PlacemarkLayout = ymaps.templateLayoutFactory.createClass(
            `<div class='departure-placemark'>
                        <div class="place-marker"></div>
                        <div class='label'>{{ properties.departure.correctName | default:properties.departure.name }}</div>
                    </div>`,
            {
                build() {
                    layout.superclass.build.call(this);
                    const el = this.getElement();
                    const placemark = this.getData().geoObject;
                    placemark.events.add('propertieschange', (e) => {
                        const select = !!placemark.properties.get('selected');
                        el.querySelector('.departure-placemark')?.classList.toggle('selected', select);
                        placemark.options.set({ zIndex: select ? 100 : 0 });
                        const hover = !!placemark.properties.get('open');
                        el.querySelector('.departure-placemark')?.classList.toggle('open', hover);
                    });
                    placemark.events.add('mouseenter', (e) => {
                        placemark.properties.set('open', true);
                    });
                    placemark.events.add('mouseleave', (e) => {
                        placemark.properties.set('open', false);
                    });
                    placemark.events.add('click', function (e) {
                        YandexMap.instance.options.selectedDeparture.value = placemark.properties.get('departure');
                    });
                },
            }
        );
        this.departure2placemark = new Map();
        for (const departure of this.options.departures) {
            const placemark = this.makeDeparturePlacemark(departure);
            this.departure2placemark.set(departure, placemark);
            this.ymap.geoObjects.add(placemark);
        }
    }

    makeDeparturePlacemark(departure) {
        return new ymaps.Placemark(departure.latlng, {
            departure,
        }, {
            iconLayout: this.PlacemarkLayout,
            iconShape:  { type: 'Circle', coordinates: [0, -20], radius: 20 },
        });
    }

    selectDeparture(departure2select) {
        for (const departure of this.options.departures) {
            this.departure2placemark.get(departure)?.properties.set('selected', departure.eeID === departure2select.eeID);
        }
    }

    makeDestinationsPlacemarks() {
        const layout = this.DestinationPlacemarkLayout = ymaps.templateLayoutFactory.createClass(
            `<div class='destination-placemark'>
                        <div class="place-marker {{ properties.destination.ISO }}"></div>
                        <div class='label'>{{ properties.destination.name }}</div>
                    </div>`,
            {
                build() {
                    layout.superclass.build.call(this);
                    const el = this.getElement();
                    const placemark = this.getData().geoObject;
                    placemark.events.add('propertieschange', (e) => {
                        const select = !!placemark.properties.get('selected');
                        el.querySelector('.destination-placemark')?.classList.toggle('selected', select);
                        placemark.options.set({ zIndex: select ? 100 : 0 });
                        const hover = !!placemark.properties.get('open');
                        el.querySelector('.destination-placemark')?.classList.toggle('open', hover);
                    });
                    placemark.events.add('mouseenter', (e) => {
                        placemark.properties.set('open', true);
                    });
                    placemark.events.add('mouseleave', (e) => {
                        placemark.properties.set('open', false);
                    });
                    placemark.events.add('click', function (e) {
                        YandexMap.instance.options.selectedDestination.value = placemark.properties.get('destination');
                    });
                },
            }
        );

        this.destination2placemark = new Map();
        for (const destination of this.options.destinations) {
            const placemark = this.makeDestinationPlacemark(destination);
            this.destination2placemark.set(destination, placemark);
            this.ymap.geoObjects.add(placemark);
        }


    }
    makeDestinationPlacemark(destination) {
        return new ymaps.Placemark(destination.capitalLatLng, {
            destination,
        }, {
            iconLayout: this.DestinationPlacemarkLayout,
            iconShape:  { type: 'Circle', coordinates: [0, 0], radius: 20 },
            zIndex: 402
        });
    }

    selectDestination(destination2select) {
        for (const destination of this.options.destinations) {
            const select = destination.eeID === destination2select.eeID;
            this.destination2placemark.get(destination).properties.set('selected', select);
            const countryGO = this.getGeoObjectWithISOCode(destination.ISO);
            countryGO?.options.set('fillColor', select ? this.options.selectedFill : undefined);
        }
    }

    async updateRouteInfo(departure, destination) {
        departure ||= this.options.selectedDeparture.value;
        destination ||= this.options.selectedDestination.value;
        const { preferredSearchParams } = this.options;
        let flightAvailable;
        try {
            const flightsList = await fetchAvailableFlights(departure, destination, this.options.chartersOnly);
            if (preferredSearchParams.timeframe.startMoment && preferredSearchParams.timeframe.endMoment) {
                flightAvailable = flightsList.some(flight => {
                    const flightMoment = moment(Number(flight.timestamp));
                    return flightMoment.isSameOrAfter(preferredSearchParams.timeframe.startMoment.startOf('day'))
                        && flightMoment.isSameOrBefore(preferredSearchParams.timeframe.endMoment.endOf('day'));
                });
            } else {
                flightAvailable = !!flightsList.length;
            }
        } catch (ex) {}

        if (!this.draw) {
            const routes_el = this.routesPane.getElement();
            this.draw = SVG().attr({ id: 'routes-svg' });
            this.draw.addTo(routes_el);
            this.ymap.events.add('boundschange', () => { this.updateRouteInfo() });
            this.ymap.events.add('actionend', () => { this.updateRouteInfo() });
        }
        const [[tl_x, tl_y], [br_x, br_y]] = this.ymap.getGlobalPixelBounds();
        this.draw.viewbox(tl_x, tl_y, br_x - tl_x, br_y - tl_y);
        this.draw.find('*').remove();
        const from_placemark = this.departure2placemark.get(this.options.departures.find(d => d.eeID === departure.eeID));
        const to_placemark = this.destination2placemark.get(destination);
        const from_p = from_placemark.geometry.getPixelGeometry().getCoordinates();
        const to_p = to_placemark.geometry.getPixelGeometry().getCoordinates();
        const d = `M ${ from_p.join(' ') } Q ${ to_p[0] } ${ from_p[1] } ${ to_p.join(' ') }`;
        const fill = flightAvailable ? '#E27300' : '#0093D0';
        const line1 = flightAvailable ? `Прямой рейс около ${ approxFlightDuration(departure, destination) } ч` : 'Прямых рейсов нет';
        const line2 = flightAvailable ? '' : "\nТОЛЬКО ПРОЖИВАНИЕ";
        const fontSize = [10, 10, 11, 12, 13, 14, 15][this.ymap.getZoom()];
        let p =this.draw
            .path(d)
            .fill('none')
            .stroke({ width: 4, color: fill });
        const midPoint = p.pointAt(p.length() / 2);
        this.draw.foreignObject(300,100)
            .move(midPoint.x, midPoint.y)
            .add(SVG(`<div xmlns="http://www.w3.org/1999/xhtml" class="flight-info" style="color: ${ fill }; font-size: ${ fontSize }px;"><p xmlns="http://www.w3.org/1999/xhtml">${ line1 }</p>${ line2 }</div>`))

    }

    setBoundsWith(departure, destination) {
        this.ymap?.setBounds(ymaps.util.bounds.fromPoints([departure.latlng, destination.capitalLatLng]));
    }

};
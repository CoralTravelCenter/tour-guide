import { preloadScript } from "./usefuls";
import { destinations } from "../config/tour-guide";

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
        variants: [
            {
                mapType:         null,
                worldFill:       '#0193CF',
                availableFill:   '#FFFFFF',
                availableStroke: '#0067B5',
            },
            {
                mapType:         undefined,
                availableFill:   '#FFFFFFCC',
                availableStroke: '#0067B5',
            }
        ],
        ymaps_api:         '//api-maps.yandex.ru/2.1.64/?apikey=49de5080-fb39-46f1-924b-dee5ddbad2f1&lang=ru-RU',
        get worldFill() {
            return this.variants[this.variant].worldFill;
        },
        get mapType() {
            return this.variants[this.variant].mapType;
        },
        get availableFill() {
            return this.variants[this.variant].availableFill;
        },
        get availableStroke() {
            return this.variants[this.variant].availableStroke;
        },
        genericFill:         '#B6D7E3',
        genericStroke:       '#FFFFFF',
        homeRegionFill:      '#1EBDFF',
        departures:          [],
        selectedDeparture:   { value: null },
        destinations:        [],
        selectedDestination: { value: null }
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
                zIndex: 300
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
        this.departure2placemark = new WeakMap();
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

        this.destination2placemark = new WeakMap();
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
        });
    }

    selectDestination(destination2select) {
        for (const destination of this.options.destinations) {
            this.destination2placemark.get(destination).properties.set('selected', destination.eeID === destination2select.eeID);
        }
    }

};
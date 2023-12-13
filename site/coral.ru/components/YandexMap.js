import { preloadScript } from "./usefuls";

import placemark_svg from 'data-url:/site/coral.ru/assets-inline/departure-marker.svg';

export default class YandexMap {

    static get apiInitialized() {
        return !!window.ymaps?.Map;
    }
    static coutriesBordersData;

    el;
    ymap;
    backdropPane;
    routesPane;
    countriesGOC;

    options = {
        ymaps_api:      '//api-maps.yandex.ru/2.1.64/?apikey=49de5080-fb39-46f1-924b-dee5ddbad2f1&lang=ru-RU',
        worldFill:      '#0193CF',
        genericFill:    '#B6D7E3',
        genericStroke:  '#FFFFFF',
        homeRegionFill: '#1EBDFF',
        departures:     []
    }
    constructor(el, options) {
        this.el = el;
        Object.assign(this.options, options);
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
                type: null,
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
            this.backdropPane = new ymaps.pane.StaticPane(this.ymap, {
                css: { width: '100%', height: '100%', backgroundColor: this.options.worldFill },
                zIndex: 100
            });
            this.ymap.panes.append('backdropPane', this.backdropPane);
            this.routesPane = new ymaps.pane.MovablePane(this.ymap, {
                css: { width: '100%', height: '100%' },
                zIndex: 300
            });
            this.ymap.panes.append('routesPane', this.routesPane);

            const bordersData = await this.fetchCountriesBorders();
            this.countriesGOC = new ymaps.GeoObjectCollection(null, {
                fillColor: this.options.genericFill,
                strokeColor: this.options.genericStroke,
                hasHint: false,
                cursor: 'default'
            });
            for (const feature of bordersData.features) {
                this.countriesGOC.add(new ymaps.GeoObject(feature));
            }
            this.ymap.geoObjects.add(this.countriesGOC);

            resolve(this.ymap);

            this.makeDeparturesPlacemarks();

        });
    }

    async fetchCountriesBorders() {
        if (YandexMap.coutriesBordersData) {
            return Promise.resolve(YandexMap.coutriesBordersData);
        } else {
            return new Promise(resolve => {
                ymaps.borders.load('001', { lang: 'ru', quality: 1 }).then(result => {
                    YandexMap.coutriesBordersData = result;
                    resolve(result);
                });
            });
        }
    }

    makeDeparturesPlacemarks() {
        this.PlacemarkLayout = ymaps.templateLayoutFactory.createClass(
            "<div class='departure-placemark-label'>{{ properties.departure.correctName | default:properties.departure.name }}</div>"
        );
        for (const departure of this.options.departures) {
            departure.placemark = this.makeDeparturePlacemark(departure);
            this.ymap.geoObjects.add(departure.placemark);
        }
    }

    makeDeparturePlacemark(departure) {
        const placemark = new ymaps.Placemark(departure.latlng, {
            departure,
            // iconContent: departure.correctName ?? departure.name
        }, {
            iconLayout:        'default#imageWithContent',
            iconImageHref:     placemark_svg,
            iconImageSize:     [33, 43],
            iconImageOffset:   [-16, -43],
            iconContentOffset: [0, 2],
            iconContentLayout: this.PlacemarkLayout,
        });
        placemark.events.add('propertieschange', (e) => {
            debugger;
        });
        return placemark;
    }
};
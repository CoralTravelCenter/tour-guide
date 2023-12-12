import { preloadScript } from "./usefuls";

export default class YandexMap {

    static get apiInitialized() {
        return !!window.ymaps?.Map;
    }

    el;
    ymap;
    backdropPane;
    routesPane;
    countries;

    options = {
        ymaps_api:      '//api-maps.yandex.ru/2.1.64/?apikey=49de5080-fb39-46f1-924b-dee5ddbad2f1&lang=ru-RU',
        worldFill:      '#0193CF',
        genericFill:    '#B6D7E3',
        genericStroke:  '#FFFFFF',
        homeRegionFill: '#1EBDFF',
    }
    constructor(el, options) {
        this.el = el;
        Object.assign(this.options, options);
    }

    init() {
        if (YandexMap.apiInitialized) {
            this.ymapsInit();
        } else {
            console.log('+++ loading YandexMaps API...');
            const ymaps_api_callback = `ymaps_loaded_${ Math.round(Math.random() * 1000000) }`;
            window[ymaps_api_callback] = () => this.ymapsInit();
            preloadScript(`${ this.options.ymaps_api }&onload=${ ymaps_api_callback }`);
        }
    }

    ymapsInit() {
        this.ymap = new ymaps.Map(this.el, {
            center: [65, 90],
            zoom:   2,
            type:   null,
            // margin: [70, 500, 10, 70],
            controls: ['zoomControl'],
        },{
            minZoom:  2,
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

        ymaps.borders.load('001', { lang: 'ru', quality: 1 }).then((result) => {
            this.countries = new ymaps.GeoObjectCollection(null, {
                fillColor:   this.options.genericFill,
                strokeColor: this.options.genericStroke,
                hasHint:     false,
                cursor:      'default'
            });
            for (const feature of result.features) {
                this.countries.add(new ymaps.GeoObject(feature));
            }
            this.ymap.geoObjects.add(this.countries);
        });

    }
};
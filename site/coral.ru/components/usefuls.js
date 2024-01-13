export async function preloadScript(url, cb) {
    return new Promise(resolve => {
        const script_el = document.createElement('script');
        script_el.addEventListener('load', () => {
            script_el.remove();
            typeof cb === 'function' && cb();
            resolve();
        });
        script_el.src = url;
        document.head.append(script_el);
    });
}

export function observeElementProp(el, prop, callback) {
    const proto = Object.getPrototypeOf(el);
    if (proto.hasOwnProperty(prop)) {
        const descr = Object.getOwnPropertyDescriptor(proto, prop);
        Object.defineProperty(el, prop, {
            get() {
                return descr.get.apply(this, arguments);
            },
            set(v) {
                const oldv = this[prop];
                descr.set.apply(this, arguments);
                const newv = v;
                if (newv !== oldv) setTimeout(callback.bind(this, newv, oldv), 0);
            },
        });
    }
}

export function queryParam(p, source) {
    source ||= location.href;
    const [url, query] = source.split('?');
    const params_kv = query.split('&');
    const params = {};
    for (const kv of params_kv) {
        let [k, v] = kv.split('=');
        try {
            v = decodeURIComponent(v);
            v = JSON.parse(v);
        } catch (ex) {}
        params[k] = v;
    }
    if (p) {
        return params[p];
    } else {
        return params;
    }
}

export function params2query(p) {
    const kv = [];
    for (let [k, v] of Object.entries(p)) {
        kv.push(`${ k }=${ encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : v) }`);
    }
    return kv.join('&');
}

Array.prototype.distanceFrom = function (from) {
    const f1 = this[0] * Math.PI / 180;
    const f2 = from[0] * Math.PI / 180
    const df = (from[0] - this[0]) * Math.PI / 180
    const dl = (from[1] - this[1]) * Math.PI / 180
    const a = Math.sin(df / 2) * Math.sin(df / 2) + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) * Math.sin(dl / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return 6371 * c;
}

export function approxFlightDuration(departure, destination) {
    // return destination.flightDuration;
    const distance = destination.capitalLatLng.distanceFrom(departure.latlng);
    const avgSpeed = 800;
    const multiplier = 1.1;
    return Math.round(((distance / avgSpeed + 1) * multiplier) * 2) / 2;
}
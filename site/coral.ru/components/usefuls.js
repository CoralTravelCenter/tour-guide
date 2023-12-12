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
                descr.get.apply(this, arguments);
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
import { JNode, JMain } from './jqre.js';

JNode.prototype.load = function(url, data = null, complete = null) {
    let selector = null;
    if (url.indexOf(' ') > -1) {
        selector = url.substr(url.indexOf(' ') + 1);
        url = url.substr(0, url.indexOf(' '));
    }
    const settings = {};
    if (typeof data === 'function') {
        complete = data;
    } else {
        settings['data'] = data;
    }
    settings['dataType'] = 'html';
    settings['success'] = function(selector, complete, html) {
        for (const n of this) {
            if (selector) {
                const els = html[0].querySelectorAll(JMain._internal.fixSelector(selector));
                n.innerHTML = els.length ? Array.from(els).reduce((h, el) => h + el.outerHTML, '') : '';
            } else {
                n.innerHTML = html[0].outerHTML;
            }
            if (typeof complete === 'function') {
                complete.call(n);
            }
        }
    }.bind(this, selector, complete);
    JMain.ajax(url, settings);
    return this;
}
JNode.prototype.serialize = function() {
    return JMain.param(this.serializeArray());
}
JNode.prototype.serializeArray = function() {
    const els = [];
    const r = [];
    for (const n of this) {
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(n.nodeName)) {
            els.push(n);
        } else {
            for (const el of Array.from(n.querySelectorAll('input,select,textarea'))) {
                els.push(el);
            }
        }
    }
    for (const el of els) {
        if (el.name && !el.disabled) {
            switch (el.nodeName) {
                case 'INPUT':
                    switch (el.type) {
                        case 'submit':
                            break;
                        case 'checkbox':
                        case 'radio':
                            if (!el.checked) {
                                break;
                            }
                        default:
                            r.push({
                                name: el.name,
                                value: el.value
                            });
                    }
                    break;
                case 'SELECT':
                    if (el.multiple) {
                        for (const i of Array.from(el.querySelectorAll('option:checked'))) {
                            r.push({
                                name: el.name,
                                value: i.value
                            });
                        }
                        break;
                    }
                case 'TEXTAREA':
                    r.push({
                        name: el.name,
                        value: el.value
                    });
                    break;
            }
        }
    }
    return r;
}

JMain.ajax = function(url, settings = null) {
    if (typeof url === 'string') {
        if (settings !== null) {
            settings['url'] = url;
        } else {
            settings = {'url': url};
        }
    } else {
        settings = url;
    }
    return JMain._internal.ajaxBase(settings);
}
JMain.get = function(url, data = null, success = null, dataType = null) {
    if (typeof url === 'object') {
        return JMain.ajax(url);
    }
    const settings = {};
    switch (typeof data) {
        case 'function':
            settings['success'] = data;
            break;
        case 'object':
            if (data === null) {
                break;
            }
            const p = [];
            for (const key in data) {
                p.push(key + '=' + encodeURIComponent(data[key]));
            }
            data = p.join('&');
        case 'string':
            url += (url.includes('?') ? '&' : '?') + data;
            break;
    }
    settings['url'] = url;
    if (typeof success === 'function') {
        settings['success'] = success;
        if (dataType !== null) {
            settings['dataType'] = dataType;
        }
    } else if (success !== null) {
        settings['dataType'] = success;
    }
    return JMain.ajax(settings);
}
JMain.getJSON = function(url, data = null, success = null) {
    if (success !== null) {
        return JMain.get(url, data, success, 'json');
    } else if (data !== null) {
        return JMain.get(url, data, 'json');
    } else {
        return JMain.get(url, 'json');
    }
}
JMain.param = function(obj, traditional = false, parent = false) {
    let r = [];
    if (obj instanceof JNode) {
        obj = obj.serializeArray();
    }
    if (Array.isArray(obj)) {
        for (const i of obj) {
            if (typeof i.value !== 'undefined') {
                r.push(i.name + '=' + encodeURIComponent(i.value));
            }
        }
    } else {
        if (traditional) {
            for (let key in obj) {
                r.push(key + '=' + encodeURIComponent(obj[key].toString()));
            }
        } else {
            for (let key in obj) {
                if (Array.isArray(obj[key])) {
                    for (const [i, v] of obj[key].entries()) {
                        if (typeof v === 'object') {
                            r.push(JMain.param(v, traditional, parent ? parent + '[' + key + '][' + i + ']' : key + '[' + i + ']'));
                        } else {
                            r.push( (parent ? parent + '[' + key + ']' : key) + '[]=' + encodeURIComponent(v.toString()));
                        }
                    }
                } else if (typeof obj[key] === 'object') {
                    r.push(JMain.param(obj[key], traditional, parent ? parent + '[' + key + ']' : key));
                } else {
                    r.push( (parent ? parent + '[' + key + ']' : key) + '=' + encodeURIComponent(obj[key].toString()));
                }
            }
        }
    }
    for (let i=0; i<r.length; i++) {
        if (!r[i].includes('[]=')) {
            let f = false;
            for (let j=0; j<r.length; j++) {
                if (i !== j && r[i].split('=')[0] === r[j].split('=')[0]) {
                    r[j] = r[j].replace('=', '[]=');
                    f = true;
                }
            }
            if (f) {
                r[i] = r[i].replace('=', '[]=');
            }
        }
    }
    return r.join('&');
}
JMain.post = function(url, data = null, success = null, dataType = null) {
    if (typeof url === 'object') {
        url.method = 'POST';
        return JMain.ajax(url);
    }
    const settings = { 'url': url };
    if (dataType || typeof success === 'function') {
        settings['dataType'] = dataType;
        settings['success'] = success;
        settings['data'] = data;
    } else if (success !== null) {
        settings['dataType'] = success;
        if (typeof data === 'function') {
            settings['success'] = data;
        } else {
            settings['data'] = data;
        }
    } else if (typeof data === 'string') {
        settings['dataType'] = data;
    } else if (typeof data === 'function') {
        settings['success'] = data;
    } else if (data !== null) {
        settings['data'] = data;
    }
    return JMain.ajax(settings);
}
JMain._internal.ajaxBase = async function(settings) {
    settings['headers'] = settings['headers'] ?? {};
    if (settings['type'] && !settings['method']) {
        settings['method'] = settings['type'];
    }
    if (settings['method']) {
        settings['method'] = settings['method'].toUpperCase().trim();
    }

    if (settings['contentType']) {
        settings['headers']['Content-Type'] = settings['contentType'];
    } else if (!settings['headers']['Content-Type']) {
        settings['headers']['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (settings['data']) {
        if (typeof settings['data'] !== 'string') {
            settings['data'] = JMain.param(settings['data']);
        }
    }
    if (settings['username'] && settings['password']) {
        settings['headers']['Authorization'] = 'Basic ' + btoa(settings['username'] + ':' + settings['password']);
    }
    const request = new Request(settings['url'], {
        method: settings['method'] ?? (settings['data'] ? 'POST' : 'GET'),
        headers: settings['headers'],
        body: settings['data'], // string, FormData, Blob, BufferSource, or URLSearchParams
        referrer: settings['referrer'] ?? 'about:client', // or '' to send no Referer header, or an url from the current origin
        referrerPolicy: settings['referrerPolicy'] ?? 'no-referrer-when-downgrade', // no-referrer, origin, same-origin...
        mode: settings['mode'] ?? 'cors', // same-origin, no-cors
        credentials: settings['credentials'] ?? 'same-origin', // omit, include
        cache: settings['cache'] ?? 'default', // no-store, reload, no-cache, force-cache, or only-if-cached
        redirect: settings['redirect'] ?? 'follow', // manual, error
        integrity: settings['integrity'] ?? '', // a hash, like 'sha256-abcdef1234567890'
        keepalive: settings['keepalive'] ?? false, // true
        signal: settings['signal'] ?? undefined, // AbortController to abort request
        window: settings['window'] ?? null // null
    });
    if (settings['beforeSend']) {
        settings['beforeSend']({}, settings);
    }
    await fetch(request).then(async function(response) {
        if (!response.ok) {
            if (settings['error']) {
                settings['error']({}, response.statusText);
            }
        } else if (settings['success']) {
            if (!settings['dataType']) {
                const t = response.headers.get('content-type');
                if (t.indexOf('application/json') === 0) {
                    settings['dataType'] = 'json';
                } else if (t.indexOf('text/html') === 0) {
                    settings['dataType'] = 'html';
                } else if (t.indexOf('text/xml') === 0) {
                    settings['dataType'] = 'xml';
                } else if (t.indexOf('text/javascript') === 0) {
                    settings['dataType'] = 'script';
                } else {
                    settings['dataType'] = 'text';
                }
            }
            switch (settings['dataType']) {
                case 'html':
                case 'xml':
                    settings['success'](JMain.parseHTML(await response.text()), response, {});
                    break;
                case 'json':
                case 'jsonp':
                    settings['success'](await response.json(), response, {});
                    break;
                case 'script':
                default:
                    settings['success'](await response.text(), response, {});
            }
        }
        if (settings['statusCode'] && settings['statusCode'][response.status]) {
            settings['statusCode'][response.status]();
        }
        if (settings['complete']) {
            settings['complete']({}, response);
        }
    });
}

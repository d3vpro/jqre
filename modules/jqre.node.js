import { JNode, JMain } from './jqre.js';

JNode.prototype.addClass = function(className) {
    return this.toggleClass(className, true);
}
JNode.prototype.removeClass = function(className) {
    return this.toggleClass(className, false);
}
JNode.prototype.toggleClass = function(className, state = null) {
    let f = 'toggle';
    if (state !== null) {
        f = state ? 'add' : 'remove';
    }
    if (typeof className === 'string') {
        className = className.split(' ');
    }
    if (Array.isArray(className)) {
        for (const n of this) {
            // toggle does not seem to work with ...array param
            // n.classList[f](...className);
            for (const c in className) {
                n.classList[f](className[c]);
            }
        }
    } else if (typeof className === 'function') {
        for (const [i, n] of this.entries()) {
            let cn = className.call(n, i, n.className);
            if (typeof cn === 'string') {
                cn = cn.split(' ');
            }
            for (const c in cn) {
                n.classList[f](cn[c]);
            }
        }
    }
    return this;
}
JNode.prototype.hasClass = function(className) {
    for (const n of this) {
        return n.classList.contains(className);
    }
    return false;
}
JNode.prototype.attr = function(attr, value = null) {
    for (const [i, n] of this.entries()) {
        if (typeof attr === 'string') {
            if (value === null) {
                return n.getAttribute(attr);
            } else if (typeof value === 'function') {
                n.setAttribute(attr, value(i, n.getAttribute(attr)));
            } else {
                n.setAttribute(attr, value);
            }
        } else if (attr instanceof Object) {
            for (const key in attr) {
                n.setAttribute(key, attr[key]);
            }
        }
    }
    return this;
}
JNode.prototype.removeAttr = function(attributeName) {
    for (const n of this) {
        n.removeAttribute(attributeName);
    }
    return this;
}
JNode.prototype.data = function(data = null, value = null) {
    for (const n of this) {
        if (data === null) {
            return n.dataset;
        } else if (value === null) {
            if (typeof data === 'string') {
                return n.dataset[JMain.toCamelCase(data)];
            } else {
                for (let key in data) {
                    n.dataset[JMain.toCamelCase(key)] = data[key];
                }
            }
        } else {
            n.dataset[JMain.toCamelCase(data)] = value;
        }
    }
    return this;
}
JNode.prototype.removeData = function(name) {
    for (const n of this) {
        if (Array.isArray(name)) {
            for (const key in name) {
                delete n.dataset[JMain.toCamelCase(name[key])];
            }
        } else if (name.includes(' ')) {
            return this.removeData(name.split(' '));
        } else {
            delete n.dataset[JMain.toCamelCase(name)];
        }
    }
    return this;
}
JNode.prototype.prop = function(propertyName, value = null) {
    for (const [i, n] of this.entries()) {
        if (value === null) {
            if (typeof propertyName === 'string') {
                return n[propertyName];
            }
            for (let key in propertyName) {
                n[key] = propertyName[key];
            }
        } else if (typeof value === 'function') {
            n[propertyName] = value.call(n, i, n[propertyName]);
        } else {
            n[propertyName] = value;
        }
    }
    return this;
}
JNode.prototype.removeProp = function(propertyName) {
    return this.removeAttr(propertyName);
}
JNode.prototype.val = function(value = null) {
    for (const [i, n] of this.entries()) {
        if (value === null) {
            if (n.nodeName === 'SELECT' && n.multiple) {
                const r = [];
                for (let el of Array.from(n.querySelectorAll('option:checked'))) {
                    r.push(el.value);
                }
                return r;
            }
            return n.value;
        } else if (typeof value === 'function') {
            n.value = value.call(n, i, n.value);
        } else if (Array.isArray(value)) {
            for (let el of Array.from(n.querySelectorAll('option'))) {
                el.selected = value.includes(el.value);
            }
        } else {
            n.value = value;
        }
    }
    return this;
}
JNode.prototype.css = function(propertyName, value = null) {
    if (value === null) {
        if (typeof propertyName === 'string') {
            return JMain._internal.getComputedCss(this, propertyName);
        } else if (Array.isArray(propertyName)) {
            for (const n of this) {
                const r = {};
                for (const key in propertyName) {
                    r[propertyName[key]] = JMain._internal.getComputedCss(n, propertyName[key]);
                }
                return r;
            }
            return {};
        } else {
            for (const n of this) {
                for (const key in propertyName) {
                    n.style[JMain.toCamelCase(key)] = propertyName[key];
                }
            }
        }
    } else if (typeof value === 'function') {
        for (const [i, n] of this.entries()) {
            n.style[JMain.toCamelCase(propertyName)] = value.call(n, i, JMain._internal.getComputedCss(n, propertyName));
        }
    } else {
        for (const n of this) {
            n.style[JMain.toCamelCase(propertyName)] = value;
        }
    }
    return this;
}
JNode.prototype.height = function(value = null) {
    if (typeof value === 'function') {
        for (const [i, n] of this.entries()) {
            const el = new JNode().add(n);
            el.height(value.call(n, i, el.height()));
        }
        return this;
    } else if (value !== null) {
        return this.css('height', value);
    } else {
        for (const n of this) {
            if (n === window || n === document) {
                return window.innerHeight;
            } else {
                const t = parseFloat(JMain._internal.getComputedCss(n, 'height'));
                return n.offsetHeight === 0 && !isNaN(t) ? t :
                    parseFloat(n.offsetHeight) - 
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingTop')) -
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingBottom')) -
                    parseFloat(JMain._internal.getComputedCss(n, 'borderTopWidth')) -
                    parseFloat(JMain._internal.getComputedCss(n, 'borderBottomWidth'));
            }
        }
    }
    return 0;
}
JNode.prototype.width = function(value = null) {
    if (typeof value === 'function') {
        for (const [i, n] of this.entries()) {
            const el = new JNode().add(n);
            el.width(value.call(n, i, el.width()));
        }
        return this;
    } else if (value !== null) {
        return this.css('width', value);
    } else {
        for (const n of this) {
            if (n === window || n === document) {
                return window.innerWidth;
            } else {
                const t = parseFloat(JMain._internal.getComputedCss(n, 'width'));
                return n.offsetWidth === 0 && !isNaN(t) ? t :
                    parseFloat(n.offsetWidth) - 
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingLeft')) -
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingRight')) -
                    parseFloat(JMain._internal.getComputedCss(n, 'borderLeftWidth')) -
                    parseFloat(JMain._internal.getComputedCss(n, 'borderRightWidth'));
            }
        }
    }
    return 0;
}
JNode.prototype.innerHeight = function(value = null) {
    if (typeof value === 'function') {
        for (const [i, n] of this.entries()) {
            const el = new JNode().add(n);
            el.innerHeight(value.call(n, i, el.innerHeight()));
        }
        return this;
    } else if (value !== null) {
        for (const n of this) {
            const item = new JNode().add(n);
            item.height(value).height(item.height() * 2 - item.innerHeight());
        }
        return this;
    } else {
        for (const n of this) {
            if (n === window || n === document) {
                return window.innerHeight;
            } else {
                const t = parseFloat(JMain._internal.getComputedCss(n, 'height'));
                return n.offsetHeight === 0 && !isNaN(t) ? t +
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingTop')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingBottom')) :
                    parseFloat(n.offsetHeight) - 
                    parseFloat(JMain._internal.getComputedCss(n, 'borderTopWidth')) -
                    parseFloat(JMain._internal.getComputedCss(n, 'borderBottomWidth'));
            }
        }
    }
    return 0;
}
JNode.prototype.innerWidth = function(value = null) {
    if (typeof value === 'function') {
        for (const [i, n] of this.entries()) {
            const el = new JNode().add(n);
            el.innerWidth(value.call(n, i, el.innerWidth()));
        }
        return this;
    } else if (value !== null) {
        for (const n of this) {
            const item = new JNode().add(n);
            item.width(value).width(item.width() * 2 - item.innerWidth());
        }
        return this;
    } else {
        for (const n of this) {
            if (n === window || n === document) {
                return window.innerWidth;
            } else {
                const t = parseFloat(JMain._internal.getComputedCss(n, 'width'));
                return n.offsetWidth === 0 && !isNaN(t) ? t +
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingLeft')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingRight')) :
                    parseFloat(n.offsetWidth) - 
                    parseFloat(JMain._internal.getComputedCss(n, 'borderLeftWidth')) -
                    parseFloat(JMain._internal.getComputedCss(n, 'borderRightWidth'));
            }
        }
    }
    return 0;
}
JNode.prototype.outerHeight = function(value = null, includeMargin = null) {
    if (typeof value === 'function') {
        for (const [i, n] of this.entries()) {
            const el = new JNode().add(n);
            el.outerHeight(value.call(n, i, el.outerHeight(includeMargin)), includeMargin);
        }
        return this;
    } else if (includeMargin !== null || (value !== null && typeof value !== 'boolean') ) {
        for (const n of this) {
            const item = new JNode().add(n);
            item.height(value).height(item.height() * 2 - item.outerHeight(includeMargin));
        }
        return this;
    } else {
        for (const n of this) {
            if (n === window || n === document) {
                return window.outerHeight;
            } else {
                const t = parseFloat(JMain._internal.getComputedCss(n, 'height'));
                return ( n.offsetHeight === 0 && !isNaN(t) ? t +
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingTop')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingBottom')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'borderTopWidth')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'borderBottomWidth')) :
                    parseFloat(n.offsetHeight) ) +
                    ( value ? parseFloat(JMain._internal.getComputedCss(n, 'marginTop')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'marginBottom')) : 0 );
            }
        }
    }
    return 0;
}
JNode.prototype.outerWidth = function(value = null, includeMargin = null) {
    if (typeof value === 'function') {
        for (const [i, n] of this.entries()) {
            const el = new JNode().add(n);
            el.outerWidth(value.call(n, i, el.outerWidth(includeMargin)), includeMargin);
        }
        return this;
    } else if (includeMargin !== null || (value !== null && typeof value !== 'boolean') ) {
        for (const n of this) {
            const item = new JNode().add(n);
            item.width(value).width(item.width() * 2 - item.outerWidth(includeMargin));
        }
        return this;
    } else {
        for (const n of this) {
            if (n === window || n === document) {
                return window.outerWidth;
            } else {
                const t = parseFloat(JMain._internal.getComputedCss(n, 'width'));
                return ( n.offsetWidth === 0 && !isNaN(t) ? t +
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingLeft')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'paddingRight')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'borderLeftWidth')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'borderRightWidth')) :
                    parseFloat(n.offsetWidth) ) +
                    ( value ? parseFloat(JMain._internal.getComputedCss(n, 'marginLeft')) +
                    parseFloat(JMain._internal.getComputedCss(n, 'marginRight')) : 0 );
            }
        }
    }
    return 0;
}
JNode.prototype.show = function() {
    for (const n of this) {
        if (n.dataset['jqreInitialDisplay']) {
            n.style.display = n.dataset['jqreInitialDisplay'];
            delete n.dataset['jqreInitialDisplay'];
        } else {
            n.style.display = '';
        }
    }
    return this;
}
JNode.prototype.hide = function() {
    for (const n of this) {
        n.dataset['jqreInitialDisplay'] = JMain._internal.getComputedCss(n, 'display');
        n.style.display = 'none';
    }
    return this;
}
JNode.prototype.toggle = function() {
    for (const n of this) {
        if (n.dataset['jqreInitialDisplay']) {
            n.style.display = n.dataset['jqreInitialDisplay'];
            delete n.dataset['jqreInitialDisplay'];
        } else {
            n.dataset['jqreInitialDisplay'] = n.style.display;
            n.style.display = 'none';
        }
    }
    return this;
}

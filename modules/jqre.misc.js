import { JNode, JMain } from './jqre.js';

JNode.prototype.get = function(index = null) {
    if (index !== null) {
        if (index < 0) {
            index = this.length + index;
        }
        if (this.length >= index && index >= 0) {
            return this[index];
        }
        return [];
    }
    return Array.from(this);
}
JNode.prototype.size = function() {
    return this.length;
}
JNode.prototype.slice = function(start, end = null) {
    if (end === null) {
        end = this.length;
    } else {
        end = Math.min(end, this.length);
    }
    const r = new JNode();
    for (const [i, n] of this.entries()) {
        if (i >= start && i < end) {
            r.add(n);
        }
    }
    return r;
}
JNode.prototype.toArray = function() {
    return Array.from(this);
}
JNode.prototype.scrollLeft = function(value = null) {
    for (const n of this) {
        if (value === null) {
            return n.scrollLeft;
        } else {
            n.scrollLeft = parseInt(value);
        }
    }
    return this;
}
JNode.prototype.scrollTop = function(value = null) {
    for (const n of this) {
        if (value === null) {
            return n.scrollTop;
        } else {
            n.scrollTop = parseInt(value);
        }
    }
    return this;
}

JMain.clone = function(variable) {
    if (variable === undefined || variable === null || (/boolean|number|string/).test(typeof variable)) {
        return variable;
    }
    return JSON.parse(JSON.stringify(variable));
}
JMain.contains = function(container, contained) {
    return container.contains(contained);
}
JMain.data = function(element, key = null, value = null) {
    if (!(element instanceof Node)) {
        return null;
    }
    if (key !== null) {
        if (value !== null) {
            element.dataset[key] = value;
            return true;
        } else {
            return element.dataset[key];
        }
    } else {
        return element.dataset;
    }
}
JMain.each = function(array, callback) {
    for (const [i, n] of array.entries()) {
        callback(i, n);
    }
    return true;
}
JMain.fn = {
    extend: function(object) {
        for (const key in object) {
            JNode.prototype[key] = object[key];
        }
    }
}
JMain.inArray = function(value, array, fromIndex = null) {
    return array.indexOf(value, fromIndex ?? 0);
}
JMain.isArray = function(array) {
    return Array.isArray(array);
}
JMain.isEmptyObject = function(object) {
    return Object.keys(object).length === 0;
}
JMain.isFunction = function(value) {
    return typeof value === 'function';
}
JMain.isNumeric = function(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
JMain.isPlainObject = function(object) {
    return object.constructor === Object;
}
JMain.makeArray = function(obj) {
    const r = [];
    for (const key in obj) {
        r.push(obj[key]);
    }
    return r;
}
JMain.noop = function() {}
JMain.now = function() {
    return Date.now();
}

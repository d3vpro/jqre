import { JNode, JMain } from './jqre.js';

JNode.prototype.children = function(selector = null) {
    const r = new JNode();
    for (const n of this) {
        r.add(n.children);
    }
    return selector ? r.filter(selector) : r;
}
JNode.prototype.closest = function(selector, context = null) {
    const r = new JNode();
    for (const n of this) {
        const el = n.closest(selector);
        if (!el || (context !== null && !context.contains(el))) {
            continue;
        }
        r.add(el);
    }
    return r;
}
JNode.prototype.parent = function(selector = null) {
    const r = new JNode();
    for (const n of this) {
        const el = n.parentNode;
        if (selector !== null) {
            if (el.matches(selector)) {
                r.add(el);
            }
        } else {
            r.add(el);
        }
    }
    return r.unique();
}
JNode.prototype.unique = function() {
    const r = new JNode().add(this);
    for (const [i, n] of r.entries()) {
        for (const [j, m] of r.entries()) {
            if (n === m && i !== j) {
                r.splice(j, 1)
            }
        }
    }
    return r;
}
JNode.prototype.next = function(selector = null) {
    const r = new JNode();
    for (const n of this) {
        r.add(n.nextElementSibling);
    }
    return selector !== null ? r.filter(selector) : r;
}
JNode.prototype.prev = function(selector = null) {
    const r = new JNode();
    for (const n of this) {
        r.add(n.previousElementSibling);
    }
    return selector !== null ? r.filter(selector) : r;
}
JNode.prototype.first = function() {
    if (this.length) {
        return new JNode().add(Array.from(this).shift());
    }
    return new JNode();
}
JNode.prototype.last = function() {
    if (this.length > 0) {
        return new JNode().add(Array.from(this).pop());
    }
    return new JNode();
}
JNode.prototype.find = function(selector, element = null) {
    for (const n of this) {
        if (element === null) {
            return new JNode().add(n.querySelectorAll(JMain._internal.fixSelector(selector)));
        } else if (typeof element === 'boolean' && element) {
            return new JNode().add(n.querySelector(JMain._internal.fixSelector(selector)));
        } else if (element instanceof Node || element instanceof JNode) {
            return new JNode().add(n.querySelectorAll(JMain._internal.fixSelector(selector))).filter(element);
        }
    }
    return new JNode();
}
JNode.prototype.filter = function(selector) {
    const r = new JNode();
    if (!selector) {
        return r;
    }
    for (const [i, n] of this.entries()) {
        switch (typeof selector) {
            case 'string':
                if (n.matches(selector)) {
                    r.add(n);
                }
                break;
            case 'function':
                if (selector.call(n, i)) {
                    r.add(n);
                }
                break;
            default:
                if (selector instanceof NodeList || selector instanceof HTMLCollection || selector instanceof JNode) {
                    for (const el of Array.from(selector)) {
                        if (n === el) {
                            r.add(n);
                        }
                    }
                } else if (selector instanceof Node && n === selector) {
                    r.add(n);
                }
        }
    }
    return r;
}
JNode.prototype.even = function() {
    return new JNode().add(this.filter(i => i % 2 === 0));
}
JNode.prototype.odd = function() {
    return new JNode().add(this.filter(i => i % 2 === 1));
}
JNode.prototype.has = function(selector) {
    const r = new JNode();
    for (const n of this) {
        if (typeof selector === 'string') {
            if (n.querySelector(JMain._internal.fixSelector(selector))) {
                r.add(n);
            }
        } else if (n.contains(selector)) {
            r.add(n);
        }
    }
    return r;
}
JNode.prototype.is = function(selector) {
    if (typeof selector === 'function') {
        for (const [i, n] of this.entries()) {
            if (selector.call(n, i, n)) {
                return true;
            }
        }
    } else {
        for (const n of this) {
            for (const el of new JNode().add(selector)) {
                if (n === el) {
                    return true;
                }
            }
        }
    }
    return false;
}
JNode.prototype.not = function(selector) {
    const r = new JNode();
    for (const [i, n] of this.entries()) {
        if (typeof selector === 'function') {
            if (selector.call(n, i, n)) {
                continue;
            }
        } else if (selector instanceof NodeList || selector instanceof HTMLCollection  || selector instanceof JNode) {
            let f = false;
            for (const el of Array.from(selector)) {
                if (n === el) {
                    f = true;
                    break;
                }
            }
            if (f) {
                continue;
            }
        } else if (selector instanceof Node) {
            if (n === selector) {
                continue;
            }
        } else if (n.matches(selector)) {
            continue;
        }
        r.add(n);
    }
    return r;
}
JNode.prototype.index = function(selector = null) {
    if (this.length === 0) {
        return -1;
    }
    let el;
    if (selector === null) {
        el = this.first();
        return el.parent().children().indexOf(el[0]);
    } else if (typeof selector === 'string') {
        el = this.filter(selector);
    } else {
        el = new JNode().add(selector);
    }
    if (el.length) {
        return this.indexOf(el[0]);
    }
    return -1;
}

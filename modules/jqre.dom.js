import { JNode, JMain } from './jqre.js';

JNode.prototype.after = function(...data) {
    return JMain._internal.baseManipulation.call(this, 'after', ...data);
}
JNode.prototype.insertAfter = function(target) {
    return new JNode().add(target).after(this);
}
JNode.prototype.before = function(...data) {
    return JMain._internal.baseManipulation.call(this, 'before', ...data);
}
JNode.prototype.insertBefore = function(target) {
    return new JNode().add(target).before(this);
}
JNode.prototype.append = function(...data) {
    return JMain._internal.baseManipulation.call(this, 'append', ...data);
}
JNode.prototype.appendTo = function(target) {
    return new JNode().add(target).append(this);
}
JNode.prototype.prepend = function(...data) {
    return JMain._internal.baseManipulation.call(this, 'prepend', ...data);
}
JNode.prototype.prependTo = function(target) {
    return new JNode().add(target).prepend(this);
}
JNode.prototype.replaceWith = function(...newContent) {
    this.off();
    return JMain._internal.baseManipulation.call(this, 'replaceWith', ...newContent);
}
JNode.prototype.replaceAll = function(target) {
    if (!(target instanceof JNode)) {
        target = new JNode().add(target);
    }
    return target.replaceWith(this);
}
JNode.prototype.clone = function(withDataAndEvents = false, deepWithDataAndEvents = null) {
    deepWithDataAndEvents = deepWithDataAndEvents ?? withDataAndEvents;
    const r = new JNode();
    let el;
    for (const n of this) {
        if (deepWithDataAndEvents && n.children.length) {
            el = new JNode().add(n.cloneNode(false)).append(new JNode().add(n.children).clone(withDataAndEvents, deepWithDataAndEvents));
        } else {
            el = n.cloneNode(true);
        }
        r.add(el);
        if (withDataAndEvents) {
            for (let eventType in JMain._internal.eventHandler.functionMap) {
                for (const eventMap of JMain._internal.eventHandler.functionMap[eventType]) {
                    if (eventMap.target === n) {
                        JMain._internal.eventHandler.addEventListener(el, eventType, eventMap.listener, eventMap.useCapture, eventMap.selector, eventMap.data);
                    }
                }
            }
        }
    }
    return r;
}
JNode.prototype.wrap = function(wrappingElement) {
    if (typeof wrappingElement === 'function') {
        let r;
        for (const [i, n] of this.entries()) {
            r = wrappingElement.call(this, i);
            if (typeof r === 'string') {
                r = new JNode().add(r).html(n.outerHTML)[0];
            } else {
                r = r.html(n.outerHTML)[0];
            }
            n.parentNode.replaceChild(r, n);
        }
        return this;
    } else {
        wrappingElement = new JNode().add(wrappingElement, true);
    }
    this.off();
    for (const n of this) {
        n.parentNode.replaceChild(wrappingElement.clone().html(n.outerHTML)[0], n);
    }
    return this;
}
JNode.prototype.remove = function(selector = null) {
    if (selector === null) {
        this.off();
        for (const n of this) {
            n.parentNode.removeChild(n);
        }
        return new JNode();
    } else {
        const d = new JNode();
        const r = new JNode();
        for (const n of this) {
            if (n.matches(selector)) {
                d.add(n);
            } else {
                r.add(n);
            }
        }
        d.remove();
        return r;
    }
}
JNode.prototype.empty = function() {
    for (const n of this) {
        n.innerHTML = '';
    }
    return this;
}
JNode.prototype.html = function(html = null) {
    for (const [i, n] of this.entries()) {
        if (html  === null) {
            return n.innerHTML;
        } else if (typeof html === 'function') {
            n.innerHTML = html.call(n, i, n.innerHTML);
        } else {
            n.innerHTML = html;
        }
    }
    return this;
}
JNode.prototype.runScripts = function() {
	const r = new JNode();
	for (const n of this) {
		if (n.tagName === 'SCRIPT') {
			r.add(n);
		} else {
			r.add(n.getElementsByTagName('script'));
		}
	}
	for (const n of r) {
		const type = n.getAttribute('type');
		if (!type || type.indexOf('script') !== -1) {
			const src = n.getAttribute('src');
			if (src) {
				const script = document.createElement('script');
				script.setAttribute('type', type);
				script.setAttribute('src', src);
				script.addEventListener('load', function(event) {
					event.target.remove();
				});
				document.getElementsByTagName('head').item(0).appendChild(script);
			} else {
				eval(n.textContent);
			}
		}
	}
	return this;
}
JNode.prototype.text = function(text = null) {
    for (const [i, n] of this.entries()) {
        if (text === null) {
            return n.textContent;
        } else if (typeof text === 'function') {
            n.textContent = text.call(n, i, n.textContent);
        } else {
            n.textContent = text;
        }
    }
    return this;
}

/** @this {JNode} */
JMain._internal.baseManipulation = function(type, ...data) {
    let r;
    for (const d of data) {
        if (typeof d !== 'function') {
            r = new JNode().add(d);
        }
        for (const [i, n] of this.entries()) {
            if (typeof d === 'function') {
                r = new JNode().add(d.call(n, i, n.innerHTML));
            }
            for (const [j, el] of r.entries()) {
                if (i + 1 < this.length && typeof d !== 'function') {
                    n[type](el.cloneNode(true));
                // until last element do before instead of replace
                } else if (type === 'replaceWith' && j + 1 < r.length) {
                    n['before'](el);
                } else {
                    n[type](el);
                }
            }
        }
    }
    return this;
}

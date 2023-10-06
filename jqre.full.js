"use strict";
function jqre() {
    class JEventHandler {
        constructor() {
            this.functionMap = {};
        }
        addEventListener(target, eventType, listener, useCapture = false, selector = null, data = null) {
            this.functionMap[eventType] = this.functionMap[eventType] ?? [];
            let eventListener = this.handleEvent.bind(this, eventType, {
                target: target,
                listener: listener,
                selector: selector,
                data: data
            });
            this.functionMap[eventType].push({
                target: target,
                listener: listener,
                selector: selector,
                data: data,
                useCapture: useCapture,
                eventListener: eventListener
            });
            target.addEventListener(eventType.split('.')[0], eventListener, useCapture);
            this.garbageCollect();
        }
        removeEventListener(target, eventType = null, listener = null, useCapture = false, selector = null) {
            const eventTypeList = [];
            if (eventType === null) {
                eventTypeList.push.apply(eventTypeList, Object.keys(this.functionMap));
            } else if (this.functionMap[eventType]) {
                for (const e in this.functionMap) {
                    if (e === eventType || e.indexOf(eventType + '.') === 0) {
                        eventTypeList.push(e);
                    }
                }
            }
            for (eventType of eventTypeList) {
                let i = 0;
                while (i < this.functionMap[eventType].length) {
                    const eventMap = this.functionMap[eventType][i];
                    if (
                        target === eventMap.target &&
                        (listener === null || listener === eventMap.listener) &&
                        (selector === null || selector === eventMap.selector)
                    ) {
                        target.removeEventListener(eventType.split('.')[0], eventMap.eventListener, useCapture);
                        this.functionMap[eventType].splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }
            this.garbageCollect();
        }
        handleEvent(eventType, funcData, event) {
            if (funcData.data !== null) {
                event.data = funcData.data;
            }
            if ((!eventType.includes('.') && !event['namespace']) || event['namespace'] === eventType.split('.').slice(1).join('.')) {
                if (funcData.selector) {
                    for (const el of Array.from(funcData.target.querySelectorAll(JMain._internal.fixSelector(funcData.selector)))) {
                        if (el.contains(event.target)) {
                            event['delegateTarget'] = funcData.target;
                            funcData.listener.call(el, event);
                            return;
                        }
                    }
                } else {
                    funcData.listener.call(event.currentTarget, event);
                }
            }
        }
        garbageCollect() {
            for (let eventType in this.functionMap) {
                let i = 0;
                while (i < this.functionMap[eventType].length) {
                    const eventMap = this.functionMap[eventType][i];
                    if (!document.contains(eventMap.target)) {
                        this.functionMap[eventType].splice(i, 1);
                    } else {
                        i++;
                    }
                }
            }
        }
        triggerEvent(element, namespace, extraParameters, extraEventParameters, customEventType) {
            const event = new customEventType(namespace.split('.')[0], extraEventParameters === null ? {bubbles: true} : extraEventParameters);
            event['namespace'] = namespace.includes('.') ? namespace.split('.').slice(1).join('.') : '';
            for (const key in extraParameters) {
                event[key] = extraParameters[key];
            }
            element.dispatchEvent(event);
        }
    }

    class JNode extends Array {
        // Custom jQuery selectors are missing, support not planned
        // Deprecated APIs are missing, support not planned

        // .add() full support + only first boolean alternative to context
        add(selector, context = null) {
            const results = [];
            if (typeof selector === 'string') {
                if (selector.trim().substr(0, 1) !== '<') {
                    const ctx = (context !== null && typeof context !== 'boolean') ? new JNode().add(context) : [document];
                    for (const c of ctx) {
                        if (typeof context === 'boolean' && context) {
                            results.push.apply(results, [c.querySelector(JMain._internal.fixSelector(selector))]);
                            if (results.length) {
                                break;
                            }
                        } else {
                            results.push.apply(results, Array.from(c.querySelectorAll(JMain._internal.fixSelector(selector))));
                        }
                    }
                } else {
                    results.push.apply(results, [...JMain.parseHTML(selector)]);
                }
            } else if (selector instanceof NodeList || selector instanceof HTMLCollection || selector instanceof JNode) {
                results.push.apply(results, Array.from(selector));
            } else if (selector instanceof Node) {
                results.push.apply(results, [selector]);
            }
            Array.prototype.push.apply(this, results);
            return this;
        }
        // .addBack() missing, support not planned
        // .addClass() full support
        addClass(className) {
            return this.toggleClass(className, true);
        }
        // .after() full support
        after(...data) {
            return JMain._internal.baseManipulation.call(this, 'after', ...data);
        }
        // .ajax*() missing, support not planned
        // .animate() missing, support not planned
        // .append() full support
        append(...data) {
            return JMain._internal.baseManipulation.call(this, 'append', ...data);
        }
        // .appendTo() full support
        appendTo(target) {
            return new JNode().add(target).append(this);
        }
        // .attr() full support
        attr(attr, value = null) {
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
        // .before() full support
        before(...data) {
            return JMain._internal.baseManipulation.call(this, 'before', ...data);
        }
        // .blur() full support
        blur(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['blur', ...arguments]);
        }
        // callbacks.*() missing, support not planned
        // .change() full support
        change(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['change', ...arguments]);
        }
        // .children() full support
        children(selector = null) {
            const r = new JNode();
            for (const n of this) {
                r.add(n.children);
            }
            return selector ? r.filter(selector) : r;
        }
        // .clearQueue() missing, support not planned
        // .click() full support
        click(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['click', ...arguments]);
        }
        // .clone() full support
        clone(withDataAndEvents = false, deepWithDataAndEvents = null) {
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
        // .closest() full support
        closest(selector, context = null) {
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
        // .contents() missing, may get support
        // .contextmenu() full support
        contextmenu(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['contextmenu', ...arguments]);
        }
        // .css() partial support, units must be always passed
        css(propertyName, value = null) {
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
        // .data() partial support, uses element dataset instead of internal storage object
        data(data = null, value = null) {
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
        // .dblclick() full support
        dblclick(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['dblclick', ...arguments]);
        }
        // deferred.*() missing, support not planned
        // .delay() partial support, no queueName, requires await
        async delay(duration) {
            await new Promise(resolve => setTimeout(resolve, duration));
            return this;
        }
        // .dequeue() missing, support not planned
        // .detach() missing, support not planned
        // .each() full support
        each(func) {
            for (const [i, n] of this.entries()) {
                func.call(n, i);
            }
            return this;
        }
        // .empty() full support
        empty() {
            for (const n of this) {
                n.innerHTML = '';
            }
            return this;
        }
        // .end() missing, support not planned
        // .eq() full support
        eq(index) {
            if (index < 0) {
                if (this.length >= -1 * index) {
                    return new JNode().add(this[this.length + index]);
                }
            } else if (this.length >= index) {
                return new JNode().add(this[index]);
            }
            return new JNode();
        }
        // .even() full support
        even() {
            return new JNode().add(this.filter(i => i % 2 === 0));
        }
        // .fade*() missing, support not planned
        // .filter() full support
        filter(selector) {
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
        // .find() full support + only first boolean alternative to element
        find(selector, element = null) {
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
        // .finish() missing, support not planned
        // .first() full support
        first() {
            if (this.length) {
                return new JNode().add(Array.from(this).shift());
            }
            return new JNode();
        }
        // .focus() full support
        focus(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['focus', ...arguments]);
        }
        // .focusin() full support
        focusin(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['focusin', ...arguments]);
        }
        // .focusout() full support
        focusout(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['focusout', ...arguments]);
        }
        // .get() full support
        get(index = null) {
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
        // .has() full support
        has(selector) {
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
        // .hasClass() full support
        hasClass(className) {
            for (const n of this) {
                return n.classList.contains(className);
            }
            return false;
        }
        // .height() full support, does not vary with box-sizing
        height(value = null) {
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
        // .hide() partial support, just base functionality, no animation
        hide() {
            for (const n of this) {
                if (n.style.display !== 'none') {
                    n.dataset['jqreInitialDisplay'] = JMain._internal.getComputedCss(n, 'display');
                }
                n.style.display = 'none';
            }
            return this;
        }
        // .hover() full support
        hover(handlerIn, handlerOut = null) {
            if (handlerOut !== null) {
                JMain._internal.runEventShorthand.apply(this, ['mouseenter', handlerIn]);
                JMain._internal.runEventShorthand.apply(this, ['mouseleave', handlerOut]);
            } else {
                JMain._internal.runEventShorthand.apply(this, ['mouseleave', handlerIn]);
            }
            return this;
        }
        // .html() full support
        html(html = null) {
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
        // .index() full support
        index(selector = null) {
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
        // .innerHeight() full support, does not vary with box-sizing
        innerHeight(value = null) {
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
        // .innerWidth() full support, does not vary with box-sizing
        innerWidth(value = null) {
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
        // .insertAfter() full support
        insertAfter(target) {
            return new JNode().add(target).after(this);
        }
        // .insertBefore() full support
        insertBefore(target) {
            return new JNode().add(target).before(this);
        }
        // .is() full support
        is(selector) {
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
        // .keydown() full support
        keydown(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['keydown', ...arguments]);
        }
        // .keypress() full support
        keypress(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['keypress', ...arguments]);
        }
        // .keyup() full support
        keyup(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['keyup', ...arguments]);
        }
        // .last() full support
        last() {
            if (this.length > 0) {
                return new JNode().add(Array.from(this).pop());
            }
            return new JNode();
        }
        // .load() partial support, check JMain.ajax for details
        load(url, data = null, complete = null) {
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
        // .map() missing, may get support
        // .mousedown() full support
        mousedown(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['mousedown', ...arguments]);
        }
        // .mouseenter() full support
        mouseenter(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['mouseenter', ...arguments]);
        }
        // .mouseleave() full support
        mouseleave(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['mouseleave', ...arguments]);
        }
        // .mousemove() full support
        mousemove(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['mousemove', ...arguments]);
        }
        // .mouseout() full support
        mouseout(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['mouseout', ...arguments]);
        }
        // .mouseover() full support
        mouseover(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['mouseover', ...arguments]);
        }
        // .mouseup() full support
        mouseup(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['mouseup', ...arguments]);
        }
        // .next() full support
        next(selector = null) {
            const r = new JNode();
            for (const n of this) {
                r.add(n.nextElementSibling);
            }
            return selector !== null ? r.filter(selector) : r;
        }
        // .nextAll() missing, may get support
        // .nextUntil() missing, may get support
        // .not() full support
        not(selector) {
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
        // .odd() full support
        odd() {
            return new JNode().add(this.filter(i => i % 2 === 1));
        }
        // .off() full support + useCapture that replace's handler false variant and can be event listener options too
        off(events = null, selector = null, handler = null, useCapture = null) {
            if (useCapture !== null) {
            } else if (handler !== null) {
                if (typeof handler !== 'function') {
                    useCapture = handler;
                    handler = null;
                    if (typeof selector === 'function') {
                        handler = selector;
                        selector = null;
                    }
                }
            } else if (selector !== null && typeof selector !== 'string') {
                switch (typeof selector) {
                    case 'function':
                        handler = selector;
                        selector = null
                        break;
                    default:
                        useCapture = selector;
                        selector = null
                }
            }
            if (events !== null && typeof events === 'object') {
                for (const i in events) {
                    this.off(i, selector, events[i], useCapture);
                }
            } else {
                if (typeof events === 'string') {
                    events = events.split(' ');
                }
                for (const n of this) {
                    if (Array.isArray(events)) {
                        for (const e of events) {
                            JMain._internal.eventHandler.removeEventListener(n, e, handler, useCapture, selector);
                        }
                    } else if (events instanceof Event) {
                        JMain._internal.eventHandler.removeEventListener(n, events.type, null, useCapture);
                    } else if (events === null) {
                        JMain._internal.eventHandler.removeEventListener(n);
                    } else {
                        JMain._internal.eventHandler.removeEventListener(n, null, null, events);
                    }
                }
            }
            return this;
        }
        // .offset() missing, may get support
        // .offsetParent() missing, may get support
        // .on() full support + useCapture which can be event listener options too
        on(events, selector = null, data = null, handler = null, useCapture = null) {
            if (events !== null && typeof events === 'object') {
                for (let i in events) {
                    if (typeof selector === 'string') {
                        if (data !== null && typeof data === 'object') {
                            this.on(i, selector, data, events[i], handler);
                        } else {
                            this.on(i, selector, null, events[i], data);
                        }
                    } else if (selector !== null && typeof selector === 'object') {
                        this.on(i, null, selector, events[i], data);
                    } else {
                        this.on(i, null, null, events[i], selector);
                    }
                }
                return this;
            }
            events = events.split(' ');
            for (const n of this) {
                for (const i in events) {
                    if (typeof handler === 'function') {
                        JMain._internal.eventHandler.addEventListener(n, events[i], handler, useCapture, selector, data);
                    } else if (typeof data === 'function') {
                        if (typeof selector === 'string' || selector === null) {
                            JMain._internal.eventHandler.addEventListener(n, events[i], data, handler, selector);
                        } else {
                            JMain._internal.eventHandler.addEventListener(n, events[i], data, handler, null, selector);
                        }
                    } else {
                        JMain._internal.eventHandler.addEventListener(n, events[i], selector, data);
                    }
                }
            }
            return this;
        }
        // .one() missing, may get support
        // .outerHeight() full support, does not vary with box-sizing
        outerHeight(value = null, includeMargin = null) {
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
        // .outerWidth() full support, does not vary with box-sizing
        outerWidth(value = null, includeMargin = null) {
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
        // .parent() full support
        parent(selector = null) {
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
        // .parents() missing, may get support
        // .parentsUntil() missing, may get support
        // .position() missing, may get support
        // .prepend() full support
        prepend(...data) {
            return JMain._internal.baseManipulation.call(this, 'prepend', ...data);
        }
        // .prependTo() full support
        prependTo(target) {
            return new JNode().add(target).prepend(this);
        }
        // .prev() full support
        prev(selector = null) {
            const r = new JNode();
            for (const n of this) {
                r.add(n.previousElementSibling);
            }
            return selector !== null ? r.filter(selector) : r;
        }
        // .prevAll() missing, may get support
        // .prevUntil() missing, may get support
        // .promise() missing, support not planned
        // .prop() full support
        prop(propertyName, value = null) {
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
        // .pushStack() missing, support not planned
        // .queue() missing, support not planned
        // .ready() full support
        ready(handler) {
            if (document.readyState === 'complete' || document.readyState === 'loaded') {
                handler.call(this);
                return this;
            }
            return JMain._internal.runEventShorthand.apply(this, ['DOMContentLoaded', ...arguments]);
        }
        // .remove() full support
        remove(selector = null) {
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
        // .removeAttr() full support
        removeAttr(attributeName) {
            for (const n of this) {
                n.removeAttribute(attributeName);
            }
            return this;
        }
        // .removeClass() full support
        removeClass(className) {
            return this.toggleClass(className, false);
        }
        // .removeData() partial support, uses element dataset instead of internal storage object
        removeData(name) {
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
        // .removeProp() full support
        removeProp(propertyName) {
            return this.removeAttr(propertyName);
        }
        // .replaceAll() full support
        replaceAll(target) {
            if (!(target instanceof JNode)) {
                target = new JNode().add(target);
            }
            return target.replaceWith(this);
        }
        // .replaceWith() full support
        replaceWith(...newContent) {
            this.off();
            return JMain._internal.baseManipulation.call(this, 'replaceWith', ...newContent);
        }
        // .resize() full support
        resize(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['resize', ...arguments]);
        }
        // .runScripts() new function, executes scripts contained in selection tree
        runScripts() {
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
        // .scroll() full support
        scroll(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['scroll', ...arguments]);
        }
        // .scrollLeft() full support
        scrollLeft(value = null) {
            for (const n of this) {
                if (value === null) {
                    return n.scrollLeft;
                } else {
                    n.scrollLeft = parseInt(value);
                }
            }
            return this;
        }
        // .scrollTop() full support
        scrollTop(value = null) {
            for (const n of this) {
                if (value === null) {
                    return n.scrollTop;
                } else {
                    n.scrollTop = parseInt(value);
                }
            }
            return this;
        }
        // .select() full support
        select(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['select', ...arguments]);
        }
        // .serialize() full support, form elements in children are processed too
        serialize() {
            return JMain.param(this.serializeArray());
        }
        // .serializeArray() full support, form elements in children are processed too
        serializeArray() {
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
        // .show() partial support, just base functionality, no animation
        show() {
            for (const n of this) {
                if (n.dataset['jqreInitialDisplay']) {
                    n.style.display = n.dataset['jqreInitialDisplay'];
                    delete n.dataset['jqreInitialDisplay'];
                } else if (JMain._internal.getComputedCss(n, 'display') === 'none') {
                    n.style.display = 'initial';
                } else {
                    n.style.display = '';
                }
            }
            return this;
        }
        // .siblings() missing, may get support
        // .size() full support
        size() {
            return this.length;
        }
        // .slice() full support
        slice(start, end = null) {
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
        // .slideDown() missing, support not planned
        // .slideToggle() missing, support not planned
        // .slideUp() missing, support not planned
        // .stop() missing, support not planned
        // .submit() full support
        submit(eventData = null, handler = null) {
            return JMain._internal.runEventShorthand.apply(this, ['submit', ...arguments]);
        }
        // .swipe() new function, detect element swipe direction; param function with direction parameter or boolean false to remove functionality; direction is string: up, down, left or right
        swipe(func) {
            if (typeof func === 'boolean') {
                if (!func) {
                    this.trigger('swipeoff');
                }
                return;
            }
            const data = {
                x: -1,
                y: -1,
                t: 0,
                els: this,
                currentEl: null,
                callback: func
            };
            data.start = function(event) {
                event.preventDefault();
                event.stopPropagation();
                this.x = event.clientX;
                this.y = event.clientY;
                this.currentEl = event.currentTarget;
            }.bind(data);
            data.reset = function() {
                this.x = -1;
                this.y = -1;
            }.bind(data);
            data.swipeoff = function() {
                this.els.off('mousedown', this.start).off('swipeoff', this.swipeoff);
                new JNode().add(document).off('mousedown', this.reset).off('mouseup', this.end);
            }.bind(data);
            data.end = function(event) {
                if (this.x > - 1 && this.y > -1) {
                    const x = event.clientX;
                    const y = event.clientY;
                    const dx = Math.abs(this.x - x);
                    const dy = Math.abs(this.y - y);
                    let dir = '';
                    if (dy > dx) {
                        if (dy > Math.max(100, 0.1 * window.innerHeight)) {
                            if (this.y > y) {
                                dir = 'up';
                            } else {
                                dir = 'down';
                            }
                        }
                    } else {
                        if (dx > Math.max(100, 0.1 * window.innerWidth)) {
                            if (this.x > x) {
                                dir = 'left';
                            } else {
                                dir = 'right';
                            }
                        }
                    }
                    if (dir) {
                        this.callback.call(this.currentEl, dir);
                    }
                }
            }.bind(data)
            this.on('mousedown', data.start).on('swipeoff', data.swipeoff);
            new JNode().add(document).on('mousedown', data.reset).on('mouseup', data.end);
            return this;
        }
        // .text() full support
        text(text = null) {
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
        // .toArray() full support
        toArray() {
            return Array.from(this);
        }
        // .toggle() partial support, just base functionality, no animation
        toggle() {
            for (const n of this) {
                if (JMain._internal.getComputedCss(n, 'display') === 'none') {
                    if (n.dataset['jqreInitialDisplay']) {
                        n.style.display = n.dataset['jqreInitialDisplay'];
                        delete n.dataset['jqreInitialDisplay'];
                    } else {
                        n.style.display = 'initial';
                    }
                } else {
                    n.dataset['jqreInitialDisplay'] = JMain._internal.getComputedCss(n, 'display');
                    n.style.display = 'none';
                }
            }
            return this;
        }
        // .toggleClass() full support
        toggleClass(className, state = null) {
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
        // .trigger() partial support for extraParameters (they are attached to event object not as listener arguments) + extraEventParameters + customEventType
        trigger(eventType, extraParameters = null, extraEventParameters = null, customEventType = Event) {
            for (const n of this) {
                JMain._internal.eventHandler.triggerEvent(n, eventType, extraParameters, extraEventParameters, customEventType);
            }
            return this;
        }
        // .triggerHandler() missing, may get support
        // .unique() new function, remove duplicate elements
        unique() {
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
        // .unwrap() missing, may get support
        // .val() full support
        val(value = null) {
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
        // .width() full support, does not vary with box-sizing
        width(value = null) {
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
        // .wrap() full support
        wrap(wrappingElement) {
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
        // .wrapAll() missing, may get support
        // .wrapInner() missing, may get support
    }
    
    // Does not support jQuery( object ) ; extra, param can be used as boolean to return only first element
    function JMain(data, param = false) {
        const r = new JNode();
        if (data) {
            r.add(data, param);
        }
        return r;
    }
    // .jQuery.ajax() partial support, does not support: accepts, contents, context, converters, crossDomain, dataFilter, global,
    // ifModified, isLocal, jsonp, jsonpCallback, mimeType, processData, scriptAttrs, scriptCharset, timeout, traditional, xhr, xhrFields
    // extra options from fetch: referrerPolicy, mode, credentials, redirect, integrity, keepalive, signal, window
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
    // .jQuery.ajaxPrefilter() missing, support not planned
    // .jQuery.ajaxSetup() missing, support not planned
    // .jQuery.ajaxTransport() missing, support not planned
    // .jQuery.Callbacks() missing, support not planned
    // .jQuery.clone() new function, clone object with properties recursive
    JMain.clone = function(variable) {
        if (variable === undefined || variable === null || (/boolean|number|string/).test(typeof variable)) {
            return variable;
        }
        return JSON.parse(JSON.stringify(variable));
    }
    // .jQuery.contains() full support
    JMain.contains = function(container, contained) {
        return container.contains(contained);
    }
    // .jQuery.cssHooks missing, support not planned
    // .jQuery.cssNumber missing, support not planned
    // .jQuery.data() full support
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
    // .jQuery.Deferred() missing, support not planned
    // .jQuery.dequeue() missing, support not planned
    // .jQuery.each() full support
    JMain.each = function(array, callback) {
        for (const [i, n] of array.entries()) {
            callback(i, n);
        }
        return true;
    }
    // .jQuery.error() missing, support not planned
    // .jQuery.escapeSelector() missing, support not planned
    // .jQuery.extend missing, support not planned
    // .jQuery.fn.extend full support
    JMain.fn = {
        extend: function(object) {
            for (const key in object) {
                JNode.prototype[key] = object[key];
            }
        }
    }
    // .jQuery.fx.* missing, support not planned
    // .jQuery.get() partial support, check .ajax for details
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
    // .jQuery.getJSON() partial support, check .ajax for details
    JMain.getJSON = function(url, data = null, success = null) {
        if (success !== null) {
            return JMain.get(url, data, success, 'json');
        } else if (data !== null) {
            return JMain.get(url, data, 'json');
        } else {
            return JMain.get(url, 'json');
        }
    }
    // .jQuery.getScript() missing, support not planned
    // .jQuery.globalEval() missing, support not planned
    // .jQuery.grep() missing, support not planned
    // .jQuery.hasData() missing, support not planned
    // .jQuery.holdReady() missing, support not planned
    // .jQuery.htmlPrefilter() missing, support not planned
    // .jQuery.inArray() full support
    JMain.inArray = function(value, array, fromIndex = null) {
        return array.indexOf(value, fromIndex ?? 0);
    }
    // .jQuery.isArray() full support
    JMain.isArray = function(array) {
        return Array.isArray(array);
    }
    // .jQuery.isEmptyObject() full support, empty arrays return true
    JMain.isEmptyObject = function(object) {
        return Object.keys(object).length === 0;
    }
    // .jQuery.isFunction() full support
    JMain.isFunction = function(value) {
        return typeof value === 'function';
    }
    // .jQuery.isMobile() new function, check if device is mobile
    JMain.isMobile = function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    // .jQuery.isNumeric() full support
    JMain.isNumeric = function(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    // .jQuery.isPlainObject() full support
    JMain.isPlainObject = function(object) {
        return object.constructor === Object;
    }
    // .jQuery.isWindow() missing, support not planned
    // .jQuery.isXMLDoc() missing, support not planned
    // .jQuery.makeArray() full support, for objects are only their values are kept
    JMain.makeArray = function(obj) {
        const r = [];
        for (const key in obj) {
            r.push(obj[key]);
        }
        return r;
    }
    // .jQuery.map() missing, may get support
    // .jQuery.merge() missing, may get support
    // .jQuery.noConflict() missing, support not planned
    // .jQuery.noop() full support
    JMain.noop = function() {}
    // .jQuery.now() full support
    JMain.now = function() {
        return Date.now();
    }
    // .jQuery.param() full support, additional support for parent, form elements in children are processed too
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
    // .jQuery.parseHTML() partial support, no context and keepScripts
    JMain.parseHTML = function(data) {
        const r = new DOMParser().parseFromString(data, 'text/html').body;
        if (data.includes('<body')) {
            return [r];
        } else {
            return r.childNodes;
        }
    }
    // .jQuery.parseJSON() full support
    JMain.parseJSON = function(json) {
        return JSON.parse(json);
    }
    // .jQuery.parseXML() missing, may get support
    // .jQuery.post() partial support, check .ajax for details
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
    // .jQuery.queue() missing, support not planned
    // .jQuery.ready() missing, support not planned
    // .jQuery.readyException() missing, support not planned
    // .jQuery.readyData() missing, support not planned
    // .jQuery.speed missing, support not planned
    // .jQuery.toCamelCase() new function, string to camelCase
    JMain.toCamelCase = function(s) {
        return s.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
    }
    // .touchPunch() new function, simulate mouse events from touch events, option booleam param enable
    JMain.touchPunch = function(enable = true) {
        if (!window.hasOwnProperty('ontouchend')) {
            return;
        }
        if (!enable) {
            new JNode().add(document).trigger('touchpunchoff');
            return;
        }
        const data = {
            touchHandled: false,
            simulate: function(event, simulatedType) {
                if (event.changedTouches.length > 1) {
                    return;
                }
                const touch = event.changedTouches[0];
                event.target.dispatchEvent(new MouseEvent(simulatedType, {
                    'bubbles': true,
                    'cancelable': true,
                    'view': window,
                    'detail': 1,
                    'screenX': touch ? touch.screenX : null,
                    'screenY': touch ? touch.screenY : null,
                    'clientX': touch ? touch.clientX : null,
                    'clientY': touch ? touch.clientY : null,
                    'ctrlKey': false,
                    'altKey': false,
                    'shiftKey': false,
                    'metaKey': false,
                    'button': 0,
                    'relatedTarget': null
                }));
            }
        };
        data.start = function(event) {
            if (this.touchHandled) {
                return;
            }
            this.touchHandled = true;
            this.simulate(event, 'mouseover');
            this.simulate(event, 'mousemove');
            this.simulate(event, 'mousedown');
        }.bind(data);
        data.move = function(event) {
            if (!this.touchHandled) {
                return;
            }
            this.simulate(event, 'mousemove');
        }.bind(data);
        data.end = function(event) {
            if (!this.touchHandled) {
                return;
            }
            this.simulate(event, 'mouseup');
            this.simulate(event, 'mouseout');
            this.touchHandled = false;
        }.bind(data);
        data.touchpunchoff = function() {
            new JNode().add(document).off('touchstart', this.start).off('touchmove', this.move).off('touchend', this.end).off('touchpunchoff', this.touchpunchoff);
        }.bind(data);
        new JNode().add(document).on('touchstart', data.start).on('touchmove', data.move).on('touchend', data.end).on('touchpunchoff', data.touchpunchoff);
    }
    // .jQuery.uniqueSort() missing, may get support
    // .jQuery.when() missing, support not planned
    
    JMain._internal = {
        eventHandler: new JEventHandler(),
        JNode: JNode,
        // extra support for string selector as content
        /** @this {JNode} */
        baseManipulation: function(type, ...data) {
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
        },
        /** @this {JNode} */
        runEventShorthand: function(eventType, eventData = null, handler = null) {
            if (eventData === null) {
                this.trigger(eventType);
            } else {
                this.on(eventType, eventData, handler);
            }
            return this;
        },
        // settings custom properties must use strings to prevent google closure advanced rename
        ajaxBase: async function(settings) {
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
        },
        getComputedCss: function(el, propertyName) {
            if (el instanceof JNode) {
                for (const n of el) {
                    return document.defaultView.getComputedStyle(n)[JMain.toCamelCase(propertyName)];
                }
            } else {
                return document.defaultView.getComputedStyle(el)[JMain.toCamelCase(propertyName)];
            }
            return '';
        },
        fixSelector: function(selector) {
            if (selector.trim().substr(0, 1) === '>') {
                return ':scope ' + selector;
            }
            return selector;
        },
        VERSION: '2.0.0'
    }


    class ReactiveVar {
        constructor(id) {
            Object.defineProperty(this, 'id', {
                value: id,
                writable: false
            });
        }
        val() {
            let r = JMain.r.get(this.id);
            return (/boolean|number|string/).test(typeof r) ? r : JSON.parse(JSON.stringify(r));
        }
        set(index, value = undefined) {
            return JMain.r.set(this.id, index, value);
        }
        unset(index = null) {
            if (index !== null) {
                return JMain.r.unset(this.id, index);
            }
            return false;
        }
    }

    class Reactive {
        constructor(id, data) {
            let el, parent = null;
            if (data.parent.length > 0) {
                el = Reactive.data.instances[data.parent]['$el'].find(data.el, true);
                parent = Reactive.data.instances[data.parent];
            } else {
                el = new JNode().add(data.el, true);
            }
            Object.defineProperty(this, '$id', {
                value: id,
                writable: false
            });
            Object.defineProperty(this, '$el', {
                value: el,
                writable: false
            });
            Object.defineProperty(this, '$parent', {
                value: parent,
                writable: false
            });
            Object.defineProperty(this, '$children', {
                value: {},
                writable: true
            });
            for (const i in data.data) {
                Object.defineProperty(this, i, {
                    value: data.data[i],
                    writable: true
                });
            }
            for (const i in data.methods) {
                Object.defineProperty(this, i, {
                    value: data.methods[i],
                    writable: true
                });
            }
        }
        $emit(event, data = null) {
            let id = this['$id'];
            const path = id.split('.');
            while (id.length) {
                if (Reactive.data.instancesCustomEvents[id][event]) {
                    const delayed = Reactive.delayRefresh;
                    if (!delayed) {
                        Reactive.delayRefresh = true;
                    }
                    Reactive.data.instancesCustomEvents[id][event].call(Reactive.data.instances[id], data);
                    if (!delayed) {
                        Reactive.delayRefresh = false;
                        JMain.r.refresh(null);
                    }
                    return true;
                }
                path.pop();
                id = path.join('.');
            }
            return false;
        }
        $find(selector) {
            return this['$el'].find(selector);
        }
        $remove(selector) {
            const els = this['$el'].find(selector);
            if (els.length) {
                if (!Reactive.data.instancesRestoreData[this['$id']]) {
                    Reactive.data.instancesRestoreData[this['$id']] = {};
                }
                if (!Reactive.data.instancesRestoreData[this['$id']][selector]) {
                    Reactive.data.instancesRestoreData[this['$id']][selector] = [];
                }
            }
            for (const [i, el] of els.entries()) {
                let comment = document.createComment(this['$id'] + ' ' + selector + ' ' + i);
                el.parentNode.replaceChild(comment, el);
                Reactive.data.instancesRestoreData[this['$id']][selector].push({
                    node: comment,
                    html: el
                });
            }
        }
        $restore(selector) {
            if (Reactive.data.instancesRestoreData[this['$id']] && Reactive.data.instancesRestoreData[this['$id']][selector]) {
                for (const rd of Reactive.data.instancesRestoreData[this['$id']][selector]) {
                    rd.node.parentNode.replaceChild(rd.html, rd.node);
                }
                delete Reactive.data.instancesRestoreData[this['$id']][selector];
            }
        }
        static delayRefresh = false;
        static refreshDelayedList = new Set();
        static reactiveMap = new WeakMap();
        static initReactive(target, path, root = true) {
            const proxy = new Proxy(target, {
                get(target, key) {
                    if (key == '__isProxy') {
                        return true;
                    }
                    const info = Reactive.reactiveMap.get(target);
                    let value;
                    if (info.root) {
                        value = target[key]
                        if (value instanceof ReactiveVar) {
                            value = JMain.r.get(value.id);
                        } else if (typeof value === 'function' && !['$emit', '$find', '$remove', '$restore'].includes(key)) {
                            return value.bind(info.proxy);
                        } else if (key == '$children') {
                            target[key] = {};
                            for (const k in Reactive.data.instances) {
                                if (k.length > target.$id.length && k.indexOf(target.$id) === 0 && k.split('.').length === target.$id.split('.').length + 1) {
                                    target[key][k.substring(target.$id.length + 1)] = Reactive.data.instances[k];
                                }
                            }
                            return target[key];
                        } else {
                            return target[key];
                        }
                    } else {
                        value = target[key];
                    }
                    if (typeof value === 'object' && value !== null && !value.__isProxy) {
                        if (Reactive.reactiveMap.has(value)) {
                            return Reactive.reactiveMap.get(value).proxy;
                        } else {
                            return Reactive.initReactive(value, info.root ? info.path + '.' + key : info.path, false);
                        }
                    } else {
                        return value;
                    }
                },
                set(target, key, value) {
                    if (key !== 'length' || !Array.isArray(target)) {
                        const info = Reactive.reactiveMap.get(target);
                        if (info.root) {
                            if (target[key] instanceof ReactiveVar) {
                                JMain.r.set(target[key], value);
                            } else {
                                return false;
                            }
                        } else {
                            const oldVal = target[key];
                            target[key] = value;
                            JMain.r.refresh(info.path, null, oldVal);
                        }
                        return true;
                    } else {
                        target[key] = value;
                        return true;
                    }
                },
                deleteProperty(target, key) {
                    const info = Reactive.reactiveMap.get(target);
                    if (info.root) {
                        if (target[key] instanceof ReactiveVar) {
                            JMain.r.unset(info.path + '.' + key);
                        } else {
                            return;
                        }
                    } else {
                        const oldVal = target[key];
                        delete target[key];
                        JMain.r.refresh(info.path, null, oldVal);
                    }
                    return true;
                },
            });
            Reactive.reactiveMap.set(target, {
                path: path,
                proxy: proxy,
                root: root,
            });
            return proxy;
        }
    }
    Reactive.data = {
        definitions: {},
        instances: {},
        instancesCustomEvents: {},
        instancesRestoreData: {},
        state: {},
        stateUpdateEvents: {}
    };
    JMain.r = {
        listDefinitions: function() {
            return Object.keys(Reactive.data.definitions);
        },
        listInstances: function() {
            return Object.keys(Reactive.data.instances);
        },
        listInstancesCustomEvents: function() {
            const result = {};
            for (const key in Reactive.data.instancesCustomEvents) {
                result[key] = Object.keys(Reactive.data.instancesCustomEvents[key]);
            }
            return result;
        },
        listInstancesRestoreData: function() {
            const result = {};
            for (const key in Reactive.data.instancesRestoreData) {
                result[key] = Object.keys(Reactive.data.instancesRestoreData[key]);
            }
            return result;
        },
        listState: function() {
            return Object.keys(Reactive.data.state);
        },
        listStateUpdateEvents: function() {
            const result = {};
            for (const key in Reactive.data.stateUpdateEvents) {
                result[key] = Reactive.data.stateUpdateEvents[key].filter(val => val !== undefined).length;
            }
            return result;
        },
        define: function(type, data) {
            if (Reactive.data.definitions[type]) {
                return false;
            }
            const d = {};
            d.data = data['data'] ?? {};
            d.events = data['events'] ?? {};
            d.methods = data['methods'] ?? {};
            Reactive.data.definitions[type] = d;
            return true;
        },
        init: function(id, instanceData) {
            const data = Reactive.data.definitions[instanceData.type];
            if (!data) {
                console.error(`Type '${instanceData.type}' not defined!`);
                return false;
            }
            if (Reactive.data.instances[id] !== undefined) {
                console.error(`ID '${id}' already exists!`);
                return false;
            }
            data.el = instanceData['el'];
            data.type = instanceData['type'];
            data.parent = id.includes('.') ? id.split('.').slice(0, -1).join('.') : '';
            if (instanceData['data']) {
                for (const i in instanceData['data']) {
                    if (data.data.hasOwnProperty(i)) {
                        data.data[i] = instanceData['data'][i];
                    }
                }
            }
            for (const i in data.data) {
                if (!(data.data[i] instanceof ReactiveVar)) {
                    JMain.r.set(id + '.' + i, data.data[i]);
                    data.data[i] = JMain.r.ref(id + '.' + i);
                }
            }
            Reactive.data.instances[id] = Reactive.initReactive(new Reactive(id, data), id);
            Reactive.data.instancesCustomEvents[id] = {};
            const updateEventsToExecute = [];
            if (data.events) {
                if (data.events['create']) {
                    const delayed = Reactive.delayRefresh;
                    if (!delayed) {
                        Reactive.delayRefresh = true;
                    }
                    data.events['create'].call(Reactive.data.instances[id]);
                    if (!delayed) {
                        Reactive.delayRefresh = false;
                        JMain.r.refresh(null);
                    }
                }
                if (data.events['update']) {
                    for (const i in data.data) {
                        if (data.events['update'][i]) {
                            JMain.r.attach(data.data[i], data.events['update'][i], id);
                            updateEventsToExecute.push(data.data[i]);
                        }
                    }
                }
                if (data.events['destroy']) {
                    Reactive.data.instances[id]['$el'].on('jqreDestroy', data.events['destroy'].bind(Reactive.data.instances[id]));
                }
                for (const i in data.events) {
                    if (i === 'create' || i === 'update') {
                        continue;
                    }
                    if (typeof data.events[i] === 'object') {
                        for (const j in data.events[i]) {
                            let handler = data.events[i][j];
                            let useCapture = null;
                            let eventData = {};
                            if (typeof handler !== 'function') {
                                eventData = handler['data'] ?? {};
                                useCapture = handler['useCapture'] ?? null;
                                handler = handler['handler'];
                            }
                            Reactive.data.instances[id]['$el'].on(i, j, eventData, function (event) {
                                const delayed = Reactive.delayRefresh;
                                if (!delayed) {
                                    Reactive.delayRefresh = true;
                                }
                                handler.call(Reactive.data.instances[id], event);
                                if (!delayed) {
                                    Reactive.delayRefresh = false;
                                    JMain.r.refresh(null);
                                }
                            }, useCapture);
                        }
                    } else {
                        Reactive.data.instancesCustomEvents[id][i] = data.events[i];
                    }
                }
            }
            for (const i of updateEventsToExecute) {
                JMain.r.refresh(i);
            }
            return true;
        },
        trigger: function(id, event, data = null) {
            if (Reactive.data.instances.hasOwnProperty(id)) {
                return Reactive.data.instances[id].$emit(event, data);
            }
            return false;
        },
        destroy: function(id) {
            if (Reactive.data.instances.hasOwnProperty(id)) {
                const idC = id + '.';

                for (const i in Reactive.data.instances) {
                    if (i.substr(0, idC.length) === idC) {
                        JMain.r.destroy(i);
                    }
                }
                Reactive.data.instances[id]['$el'].trigger('jqreDestroy');

                for (const i in Reactive.data.state) {
                    if (i.substr(0, idC.length) === idC) {
                        JMain.r.unset(i);
                    }
                }

                delete Reactive.data.instancesCustomEvents[id];

                if (Reactive.data.instancesRestoreData[id]) {
                    for (const i in Reactive.data.instancesRestoreData[id]) {
                        Reactive.data.instances[id].$restore(i);
                    }
                    delete Reactive.data.instancesRestoreData[id];
                }

                Reactive.data.instances[id]['$el'].off();
                delete Reactive.data.instances[id];

                return true;
            }
            return false;
        },

        get: function(idRef) {
            if (typeof idRef !== 'string') {
                idRef = idRef.id;
            }
            return idRef ? ( Reactive.data.state[idRef] ?? null ) : null;
        },
        ref: function(id) {
            return new ReactiveVar(id);
        },
        attach: function(idRef, handler, instanceId = null) {
            if (typeof idRef !== 'string') {
                idRef = idRef.id;
            }
            if (idRef && Reactive.data.stateUpdateEvents[idRef]) {
                for (const i in Reactive.data.stateUpdateEvents[idRef]) {
                    if (Reactive.data.stateUpdateEvents[idRef][i].handler === handler && Reactive.data.stateUpdateEvents[idRef][i].instanceId === instanceId) {
                        return i;
                    }
                }
            } else {
                Reactive.data.stateUpdateEvents[idRef] = [];
            }
            return Reactive.data.stateUpdateEvents[idRef].push({
                handler: handler,
                instanceId: instanceId
            }) - 1;
        },
        deattach: function(idRef, handlerOrIndex = null, instanceId = null) {
            if (typeof idRef !== 'string') {
                idRef = idRef.id;
            }
            if (Reactive.data.stateUpdateEvents[idRef]) {
                if (typeof handlerOrIndex === 'function') {
                    for (const i in Reactive.data.stateUpdateEvents[idRef]) {
                        if (Reactive.data.stateUpdateEvents[idRef][i].handler === handlerOrIndex && Reactive.data.stateUpdateEvents[idRef][i].instanceId === instanceId) {
                            delete Reactive.data.stateUpdateEvents[idRef][i];
                            return true;
                        }
                    }
                } else if (!isNaN(handlerOrIndex)) {
                    if (Reactive.data.stateUpdateEvents[idRef][handlerOrIndex]) {
                        delete Reactive.data.stateUpdateEvents[idRef][handlerOrIndex];
                        return true;
                    }
                } else {
                    delete Reactive.data.stateUpdateEvents[idRef];
                    return true;
                }
            }
            return false;
        },
        refresh: async function(idRef, handlerOrIndex = null, oldVal = undefined) {
            if (idRef === null) {
                Reactive.refreshDelayedList.forEach(item => {
                    Reactive.refreshDelayedList.delete(item);
                    JMain.r.refresh(item.idRef, item.handlerOrIndex, item.oldVal);
                });
                return;
            }
            if (Reactive.delayRefresh) {
                Reactive.refreshDelayedList.add({
                    idRef: idRef,
                    handlerOrIndex: handlerOrIndex,
                    oldVal: oldVal,
                });
                return;
            }
            if (typeof idRef !== 'string') {
                idRef = idRef.id;
            }
            let ret = false;
            const delayed = Reactive.delayRefresh;
            if (!delayed) {
                Reactive.delayRefresh = true;
            }
            if (Reactive.data.stateUpdateEvents[idRef]) {
                if (oldVal === undefined) {
                    oldVal = JMain.r.get(idRef);
                }
                if (handlerOrIndex) {
                    if (typeof handlerOrIndex === 'function') {
                        for (const i in Reactive.data.stateUpdateEvents[idRef]) {
                            if (Reactive.data.stateUpdateEvents[idRef][i].handler === handlerOrIndex) {
                                Reactive.data.stateUpdateEvents[idRef][i].handler.call(Reactive.data.instances[Reactive.data.stateUpdateEvents[idRef][i].instanceId], oldVal);
                                ret = true;
                                break;
                            }
                        }
                    } else if (!isNaN(handlerOrIndex)) {
                        if (Reactive.data.stateUpdateEvents[idRef][handlerOrIndex]) {
                            Reactive.data.stateUpdateEvents[idRef][handlerOrIndex].handler.call(Reactive.data.instances[Reactive.data.stateUpdateEvents[idRef][handlerOrIndex].instanceId], oldVal);
                            ret = true;
                        }
                    }
                } else {
                    for (const i in Reactive.data.stateUpdateEvents[idRef]) {
                        if (Reactive.data.stateUpdateEvents[idRef][i] && Reactive.data.instances[Reactive.data.stateUpdateEvents[idRef][i].instanceId]) {
                            Reactive.data.stateUpdateEvents[idRef][i].handler.call(Reactive.data.instances[Reactive.data.stateUpdateEvents[idRef][i].instanceId], oldVal);
                            ret = true;
                        }
                    }
                }
            }
            if (!delayed) {
                Reactive.delayRefresh = false;
                JMain.r.refresh(null);
            }
            return ret;
        },
        set: function(idRef, index, value = undefined) {
            if (typeof idRef !== 'string') {
                idRef = idRef.id;
            }
            let oldVal = JMain.r.get(idRef);
            oldVal = (/boolean|number|string/).test(typeof oldVal) ? oldVal : JSON.parse(JSON.stringify(oldVal));
            let newVal;
            if (value === undefined) {
                newVal = index;
            } else {
                newVal = (/boolean|number|string/).test(typeof oldVal) ? oldVal : JSON.parse(JSON.stringify(oldVal));
                if (typeof newVal === 'object' && newVal !== null) {
                    newVal[index] = value;
                } else {
                    return false;
                }
            }
            let different = false;
            if ((/boolean|number|string/).test(typeof oldVal) && (/boolean|number|string/).test(typeof variable)) {
                different = oldVal !== newVal;
            } else {
                different = JSON.stringify(oldVal) !== JSON.stringify(newVal);
            }
            if (different) {
                if (value === undefined) {
                    Reactive.data.state[idRef] = index;
                } else {
                    Reactive.data.state[idRef][index] = value;
                }
                JMain.r.refresh(idRef, null, oldVal);
            }
            return true;
        },
        unset: function(idRef, index = null) {
            if (typeof idRef !== 'string') {
                idRef = idRef.id;
            }
            const currentVal = JMain.r.get(idRef);
            const oldVal = (/boolean|number|string/).test(typeof currentVal) ? currentVal : JSON.parse(JSON.stringify(currentVal));
            if (index !== null) {
                if (typeof currentVal === 'object' && currentVal !== null && index in currentVal) {
                    delete Reactive.data.state[idRef][index];
                    if (Array.isArray(currentVal)) {
                        Reactive.data.state[idRef] = currentVal.filter(val => val !== undefined);
                    }
                    JMain.r.refresh(idRef, null, oldVal);
                    return true;
                }
            } else if (idRef in Reactive.data.state) {
                if (currentVal === undefined || currentVal === null) {
                } else if (Array.isArray(currentVal)) {
                    Reactive.data.state[idRef] = [];
                } else {
                    switch (typeof currentVal) {
                        case 'object': Reactive.data.state[idRef] = {}; break;
                        case 'boolean': Reactive.data.state[idRef] = false; break;
                        case 'string': Reactive.data.state[idRef] = ''; break;
                        case 'number': case 'bigint': Reactive.data.state[idRef] = 0; break;
                        default: Reactive.data.state[idRef] = null;
                    }
                }
                JMain.r.refresh(idRef, null, oldVal);
                delete Reactive.data.state[idRef];
                delete Reactive.data.stateUpdateEvents[idRef];
                return true;
            }
            return false;
        }
    }
    JMain.r.data = {
        'definitions': Reactive.data.definitions,
        'instances': Reactive.data.instances,
        'instancesCustomEvents': Reactive.data.instancesCustomEvents,
        'instancesRestoreData': Reactive.data.instancesRestoreData,
        'state': Reactive.data.state,
        'stateUpdateEvents': Reactive.data.stateUpdateEvents,
        'map': Reactive.reactiveMap,
        'refreshDelayedList': Reactive.refreshDelayedList,
    };


    class Autocomplete {
        constructor(data) {
            if (typeof data['source'] === 'object' && data['source'] !== null) {
                const d = [];
                for (const i of Object.keys(data['source'])) {
                    if (typeof data['source'][i] === 'object' && data['source'][i] !== null) {
                        if (data['source'][i].hasOwnProperty('label') && data['source'][i].hasOwnProperty('value')) {
                            d.push({'label': data['source'][i]['label'], 'value': data['source'][i]['value']});
                        }
                    } else {
                        d.push({'label': data['source'][i], 'value': i});
                    }
                }
                this.doSearch = async function(req, callback) {
                    callback(this.filter((t) => t['label'] && t['label'].toLowerCase().includes(req['term'].toLowerCase())));
                }.bind(d);
            } else if (typeof data['source'] === 'function') {
                this.doSearch = data['source'];
            }
            const defaults = {
                'allowCustom': false,
                'applyStyle': true,
                'autoFocus': true,
                'disabled': false,
            };
            for (const i in defaults) {
                if (data.hasOwnProperty(i)) {
                    this[i] = data[i] == true;
                } else {
                    this[i] = defaults[i];
                }
            }
            for (const i of ['change', 'close', 'create', 'focus', 'open', 'response', 'search', 'select', 'renderItem']) {
                if (typeof data[i] === 'function') {
                    this['f_' + i] = data[i].bind(this);
                } else {
                    this['f_' + i] = null;
                }
            }
            this['classes'] = {};
            for (const i of ['ui-autocomplete', 'ui-autocomplete-input', 'ui-autocomplete-loading', 'active']) {
                if (typeof data['classes'] === 'object' && data['classes'] !== null && typeof data['classes'][i] === 'string' && data['classes'][i]) {
                    this['classes'][i] = data['classes'][i];
                } else {
                    this['classes'][i] = i;
                }
            }
            if (data.hasOwnProperty('delay') && !isNaN(data['delay'])) {
                this['delay'] = data['delay'];
            } else {
                this['delay'] = 300;
            }
            if (data.hasOwnProperty('minLength') && !isNaN(data['minLength'])) {
                this['minLength'] = data['minLength'];
            } else {
                this['minLength'] = 1;
            }
            if (data['position'] && data['position'] === 'after') {
                this['position'] = data['position'];
            } else {
                this['position'] = 'before';
            }
            this.valueSelected = true;
            this.originalInput = new JNode().add(data.el);
            this.input = this.originalInput.clone().removeAttr('name').addClass(this['classes']['ui-autocomplete-input']);
            this.originalInput.removeAttr('id').after(this.input).hide();
            if (this['f_change']) {
                this.input.on('change', event => {
                    this['f_change'](event, {'item': {'label': event.target.value, 'value': this.originalInput.val()}});
                });
            }
            let style = 'display:none;';
            if (this['applyStyle']) {
                style += 'position:absolute;background:#fff;margin-top:' + (this['position'] === 'before' ? this.input.outerHeight() : 0) + 'px;width:' + this.input.outerWidth() + 'px;overflow:hidden auto;list-style:none;padding:5px;';
            }
            this.input[this['position']]('<ul style="' + style + '"></ul>');
            this['widget'] = this['position'] === 'after' ? this.input.next() : this.input.prev();
            this['widget'].addClass(this['classes']['ui-autocomplete']).on('click', 'a', event => {
                event.preventDefault();
                this.select(event.target);
            }).on('mouseover', 'a', event => {
                this.focus(event.target);
            }).on('mouseout', 'a', () => {
                this['widget'].find('a.' + this['classes']['active'].split(' ')[0]).removeClass(this['classes']['active']);
            });
            this.input.on('blur', event => {
                if (!event.relatedTarget || event.relatedTarget.closest('ul') !== this['widget'][0]) {
                    if (!this['allowCustom'] && !this.valueSelected) {
                        this.input.val('');
                        this.originalInput.val('');
                    }
                    this.close();
                }
            });
            this.input.on('keydown', event => {
                const focusClass = this['classes']['active'].split(' ')[0];
                let s = this['widget'].find('a.' + focusClass);
                switch (event.key) {
                    case 'Tab':
                    case 'Enter':
                        if (s.length) {
                            this.select(s[0]);
                        }
                        break;
                    case 'ArrowUp':
                        event.preventDefault();
                        if (s.length === 0 || this['widget'].css('display') === 'none') {
                            if (this['widget'].children().length) {
                                this['widget'].css('display', 'block');
                                this.focus(this['widget'].find('a').last());
                            } else {
                                return;
                            }
                        } else {
                            if (s.parent().prev().length) {
                                this.focus(s.parent().prev().find('a', true));
                            } else {
                                this.focus(this['widget'].children().last().find('a', true));
                            }
                        }
                        s = this['widget'].find('a.' + focusClass, true);
                        this['widget'].scrollTop(Math.min(s[0].offsetTop, Math.max(this['widget'][0].scrollTop, s[0].offsetTop - this['widget'].height() + s.height())));
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        if (s.length === 0 || this['widget'].css('display') === 'none') {
                            if (this['widget'].children().length) {
                                this['widget'].css('display', 'block');
                                this.focus(this['widget'].find('a').first());
                            } else {
                                return;
                            }
                        } else {
                            if (s.parent().next().length) {
                                this.focus(s.parent().next().find('a', true));
                            } else {
                                this.focus(this['widget'].children().first().find('a', true));
                            }
                        }
                        s = this['widget'].find('a.' + focusClass, true);
                        this['widget'].scrollTop(Math.min(s[0].offsetTop, Math.max(this['widget'][0].scrollTop, s[0].offsetTop - this['widget'].height() + s.height())));
                        break;
                    case 'Escape':
                        this.close();
                        break;
                    case 'PageUp':
                        this['widget'].scrollTop(Math.min(this['widget'][0].scrollHeight, Math.max(this['widget'][0].scrollTop - this['widget'].height(), 0)));
                        break;
                    case 'PageDown':
                        this['widget'].scrollTop(Math.min(this['widget'][0].scrollHeight, Math.max(this['widget'][0].scrollTop + this['widget'].height(), 0)));
                        break;
                }
            });
            this._currTm = null;
            this.input.on('input', () => {
                if (this['disabled']) return;
                this.valueSelected = false;
                if (this.input.val().length >= this['minLength']) {
                    clearTimeout(this._currTm);
                    this._currTm = setTimeout(function() {
                        if (this['f_search']) {
                            this['f_search'](null, null);
                        }
                        this.input.addClass(this['classes']['ui-autocomplete-loading']);
                        this.doSearch({'term': this.input.val()}, data => {
                            this.input.removeClass(this['classes']['ui-autocomplete-loading']);
                            if (this['f_response']) {
                                this['f_response'](null, {'content': data});
                            }
                            this['widget'].html('');
                            for (const i in data) {
                                if (this['f_renderItem']) {
                                    this['f_renderItem'](this['widget'][0], data[i]);
                                } else {
                                    if (typeof data[i] === 'object' && data[i] !== null) {
                                        if (data[i].hasOwnProperty('label') && data[i].hasOwnProperty('value')) {
                                            this['widget'].append($('<li data-value="' + data[i].value + '"><a href="">' + data[i].label + '</a></li>'));
                                        }
                                    } else {
                                        this['widget'].append($('<li data-value="' + i + '"><a href="">' + data[i] + '</a></li>'));
                                    }
                                }
                            }
                            if (this['widget'].children().length > 0) {
                                if (this['widget'].css('display') === 'none') {
                                    if (this['f_open']) {
                                        this['f_open'](null, null);
                                    }
                                }
                                this['widget'].css('display', 'block');
                                if (this.autoFocus) {
                                    this.focus(this['widget'].find('a').first());
                                }
                            } else {
                                this.close();
                            }
                        });
                    }.bind(this), this['delay']);
                }
            });
            if (this['f_create']) {
                this['f_create'](null, null);
            }
        }
        focus(el) {
            this['widget'].find('a.' + this['classes']['active'].split(' ')[0]).removeClass(this['classes']['active']);
            el = new JNode().add(el).addClass(this['classes']['active']);
            if (this['f_focus']) {
                this['f_focus'](null, {'item': {'label': el.text(), 'value': el.parent().data('value')}});
            }
        }
        select(el) {
            const event = new Event('select', {
                'cancelable': true
            });
            if (this['f_select']) {
                this['f_select'](event, {'item': {'label': el.textContent, 'value': el.parentNode.dataset['value']}});
            }
            if (!event.defaultPrevented) {
                this.valueSelected = true;
                this.input.val(el.textContent);
                this.originalInput.val(el.parentNode.dataset['value']);
                this.close();
            }
        }
        close() {
            if (this['widget'].css('display') !== 'none') {
                this['widget'].find('a.' + this['classes']['active'].split(' ')[0]).removeClass(this['classes']['active']);
                this['widget'].css('display', 'none');
                if (this['f_close']) {
                    this['f_close'](null, null);
                }
                clearTimeout(this._currTm);
            }
        }
    }
    Autocomplete.data = [];

    // .autocomplete() partial support (except appendTo, position only 'after' 'before', classes overwrite if specified and added classes.active, option method, _renderMenu, _resizeMenu
    // renderItem (without _) is supported but is passed as a normal method
    // .data('ui-autocomplete') change to .data('uiAutocomplete') and return just an numeric id; event param only for change and select, otherwise null
    // instance different ; + allowCustom, applyStyle)
    // field value is value instead of label
    JNode.prototype.autocomplete = function(data, prop = null) {
        const inputs = this.filter('input[type=text]');
        if (inputs.length) {
            for (const i of inputs) {
                if (typeof data === 'object' && data !== null) {
                    data.el = i;
                    const ac = new Autocomplete(data);
                    i.dataset['uiAutocomplete'] = Autocomplete.data.push(ac) - 1;
                    ac.input[0].dataset['uiAutocomplete'] = i.dataset['uiAutocomplete'];
                    return this;
                } else if (typeof data === 'string') {
                    const acId = i.dataset['uiAutocomplete'];
                    if (acId && Autocomplete.data[acId]) {
                        const ac = Autocomplete.data[acId];
                        switch (data) {
                            case 'widget':
                                return ac['widget'];
                            case 'instance':
                                return ac;
                            case 'enable':
                                ac['disabled'] = false;
                                break;
                            case 'disable':
                                ac['disabled'] = true;
                                break;
                            case 'close':
                                ac.close();
                                break;
                            case 'destroy':
                                let id = ac.originalInput.data('ui-autocomplete');
                                ac['widget'].remove();
                                ac.originalInput.attr('id', ac.input.attr('id'));
                                ac.originalInput.removeData('uiAutocomplete');
                                ac.input.remove();
                                ac.originalInput.show();
                                Autocomplete.data[id] = null;
                                break;
                            case 'search':
                                if (prop !== null) {
                                    ac.input.val(prop);
                                }
                                ac.input.trigger('input');
                                break;
                        }
                        continue;
                    }
                }
                break;
            }
        }
        return this;
    }


    class Dialog {
        constructor(data) {
            let defaults = {
                'applyStyle': true,
                'closeOnModalClick': true,
                'autoOpen': true,
                'closeOnEscape': true,
                'modal': false,
                'preventBodyScroll': true
            };
            for (const i in defaults) {
                if (data.hasOwnProperty(i)) {
                    this[i] = data[i] == true;
                } else {
                    this[i] = defaults[i];
                }
            }
            for (const i of ['beforeClose', 'close', 'create', 'open']) {
                if (typeof data[i] === 'function') {
                    this['f_' + i] = data[i].bind(this);
                } else {
                    this['f_' + i] = null;
                }
            }
            this['classes'] = {};
            for (const i of ['ui-dialog-container', 'ui-dialog-overlay', 'ui-dialog']) {
                if (typeof data['classes'] === 'object' && data['classes'] !== null && typeof data['classes'][i] === 'string' && data['classes'][i]) {
                    this['classes'][i] = data['classes'][i];
                } else {
                    this['classes'][i] = i;
                }
            }
            this.originalElement = new JNode().add(data.el);
            defaults = {
                'width': this.originalElement.width() + 'px',
                'height': this.originalElement.height() + 'px',
                'minWidth': '150px',
                'minHeight': '150px',
                'maxWidth': 'none',
                'maxHeight': 'none'
            };
            for (const i in defaults) {
                if (data[i]) {
                    this[i] = isNaN(data[i]) ? data[i] : data[i] + 'px';
                } else {
                    this[i] = defaults[i];
                }
            }
            this['widget'] = new JNode().add('<div></div>').addClass(this['classes']['ui-dialog-container']);
            if (this['applyStyle']) {
                this['widget'].css({
                    'position': 'fixed',
                    'top': 0,
                    'left': 0,
                    'width': '100%',
                    'height': '100%',
                    'z-index': 10,
                    'display': 'none',
                    'align-items': 'center',
                    'justify-content': 'center'
                });
            }
            if (this['modal']) {
                this['widget'].append('<div class="' + this['classes']['ui-dialog-overlay'] + '"></div>');
                if (this['applyStyle']) {
                    this['widget'].children().css({
                        'position': 'absolute',
                        'top': 0,
                        'left': 0,
                        'width': '100%',
                        'height': '100%',
                        'z-index': 10,
                        'background': 'rgba(0, 0, 0, 0.5)'
                    });
                }
                if (this['closeOnModalClick']) {
                    this['widget'].children().on('click', () => {this.close();});
                }
            }
            this['widget'].append('<div class="' + this['classes']['ui-dialog'] + '"></div>');
            if (this['applyStyle']) {
                this['widget'].children().last().css({
                    'position': 'relative',
                    'display': 'inline-block',
                    'width': this['width'],
                    'height': this['width'],
                    'min-width': this['minWidth'],
                    'max-width': this['maxWidth'],
                    'min-height': this['minHeight'],
                    'max-height': this['maxHeight'],
                    'z-index': 11,
                    'background': '#fff',
                    'overflow': 'hidden auto',
                    'overscroll-behavior': 'contain'
                });
            }
            this['widget'].children().last().append(this.originalElement);
            this.keyDownFunction = event => {
                if (event.key === 'Escape') {
                    this.close();
                }
            };
            if (this['closeOnEscape']) {
                new JNode().add(document.body).on('keydown', this.keyDownFunction);
            }
            document.body.appendChild(this['widget'][0]);
            if (this['f_create']) {
                this['f_create'](null, null);
            }
            if (this['autoOpen']) {
                this.open();
            }
        }
        open() {
            if (this['widget'].css('display') !== 'flex') {
                this['widget'].css('display', 'flex');
                if (this['preventBodyScroll']) {
                    new JNode().add('html,body').css('overflow', 'hidden');
                }
                if (this['f_open']) {
                    this['f_open'](null, null);
                }
            }
        }
        close() {
            if (this['widget'].css('display') !== 'none') {
                if (this['f_beforeClose']) {
                    this['f_beforeClose'](null, null);
                }
                this['widget'].css('display', 'none');
                if (this['preventBodyScroll']) {
                    new JNode().add('html,body').css('overflow', '');
                }
                if (this['f_close']) {
                    this['f_close'](null, null);
                }
            }
        }
    }
    Dialog.data = [];

    // .dialog() partial support (except appendTo, buttons, closeText, dialogClass, draggable, hide, position, resizable, show, title, classes only ui-dialog kept and overwrite if specified and added classes.ui-dialog-overlay classes.ui-dialog-container, option and moveToTop methods, _allowInteraction
    // destroy removes dialog element without restoring anything, events missing drag* resize* focus and params are null
    // instance different ; + applyStyle, closeOnModalClick, preventBodyScroll)
    // dialog does not contain any content (not even close button), position is always center of window x and y (if not changed with css), focus and tabindex not handled specifically
    // final list of options:
    // properties: autoOpen classes applyStyle closeOnEscape closeOnModalClick preventBodyScroll height maxHeight minHeight width maxWidth minWidth modal
    // events: beforeClose close create open
    // methods: close destroy instance isOpen open widget
    JNode.prototype.dialog = function(data) {
        for (const n of this) {
            if (typeof data === 'object' && data !== null) {
                data.el = n;
                const d = new Dialog(data);
                n.dataset['uiDialog'] = Dialog.data.push(d) - 1;
                return this;
            } else if (typeof data === 'string') {
                const dId = n.dataset['uiDialog'];
                if (dId && Dialog.data[dId]) {
                    const d = Dialog.data[dId];
                    switch (data) {
                        case 'widget':
                            return d['widget'];
                        case 'instance':
                            return d;
                        case 'isOpen':
                            return d['widget'].css('display') !== 'none';
                        case 'open':
                            d.open();
                            break;
                        case 'close':
                            d.close();
                            break;
                        case 'destroy':
                            if (d['closeOnEscape']) {
                                new JNode().add(document.body).off('keydown', d.keyDownFunction);
                            }
                            d['widget'].remove();
                            Dialog.data[dId] = null;
                            break;
                    }
                    continue;
                }
            }
            break;
        }
        return this;
    }
    return JMain;
}

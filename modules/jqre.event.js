import { JNode, JMain } from './jqre.js';

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

JNode.prototype.off = function(events = null, selector = null, handler = null, useCapture = null) {
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
JNode.prototype.on = function(events, selector = null, data = null, handler = null, useCapture = null) {
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
JNode.prototype.swipe = function(func) {
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
JNode.prototype.trigger = function(eventType, extraParameters = null, extraEventParameters = null, customEventType = Event) {
    for (const n of this) {
        JMain._internal.eventHandler.triggerEvent(n, eventType, extraParameters, extraEventParameters, customEventType);
    }
    return this;
}

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
JMain._internal.eventHandler = new JEventHandler();
/** @this {JNode} */
JMain._internal.runEventShorthand = function(eventType, eventData = null, handler = null) {
    if (eventData === null) {
        this.trigger(eventType);
    } else {
        this.on(eventType, eventData, handler);
    }
    return this;
}

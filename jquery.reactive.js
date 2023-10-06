jQuery.extend({
    r: (function () {

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
            el = Reactive.data.instances[data.parent]['$el'].find(data.el).first();
            parent = Reactive.data.instances[data.parent];
        } else {
            el = jQuery(data.el).first();
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
        for (const [i, el] of els.toArray().entries()) {
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

const JMain = {};
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

        return JMain.r;
    })(),
});

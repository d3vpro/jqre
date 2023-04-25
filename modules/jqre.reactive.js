import { JNode, JMain } from './jqre.js';

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
            parent = Reactive.data.instances[data.parent]['$el'];
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
        for (const i in data.data) {
            Object.defineProperty(this, i, {
                value: data.data[i],
                writable: false
            });
        }
        for (const i in data.methods) {
            Object.defineProperty(this, i, {
                value: data.methods[i].bind(this),
                writable: false
            });
        }
    }
    $emit(event, data = null) {
        let id = this['$id'];
        const path = id.split('.');
        while (id.length) {
            if (Reactive.data.instancesCustomEvents[id][event]) {
                Reactive.data.instancesCustomEvents[id][event].call(Reactive.data.instances[id], data);
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
        return Object.keys(Reactive.data.instances);
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
        d.components = data['components'] ?? {};
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
        if (instanceData['components']) {
            for (const i in instanceData['components']) {
                const cd = Reactive.data.definitions[data.components[i]['type']];
                if (!cd) {
                    console.error(`Type '${data.components[i]['type']}' not defined!`);
                    return false;
                }
                if (!data.components[i].hasOwnProperty('data')) {
                    data.components[i].data = {};
                }
                if (instanceData['components'][i]['data']) {
                    for (const j in instanceData['components'][i]['data']) {
                        if (cd.data.hasOwnProperty(j)) {
                            data.components[i].data[j] = instanceData['components'][i].data[j];
                        }
                    }
                }
                if (instanceData['components'][i]['components']) {
                    data.components[i].components = instanceData['components'][i].components;
                }
            }
        }
        for (const i in data.components) {
            if (data.components[i].data) {
                for (const j in data.components[i].data) {
                    const k = data.components[i].data[j]
                    if (k instanceof ReactiveVar) {
                        if (k.id.split('.')[0] === 'this') {
                            data.components[i].data[j] = JMain.r.ref(id + '.' + k.id.substr(5));
                        }
                    }
                }
            }
        }
        for (const i in data.data) {
            if (!(data.data[i] instanceof ReactiveVar)) {
                JMain.r.set(id + '.' + i, data.data[i]);
                data.data[i] = JMain.r.ref(id + '.' + i);
            }
        }
        Reactive.data.instances[id] = new Reactive(id, data);
        Reactive.data.instancesCustomEvents[id] = {};
        const updateEventsToExecute = [];
        if (data.events) {
            if (data.events['create']) {
                data.events['create'].call(Reactive.data.instances[id]);
            }
            if (data.events['update']) {
                for (const i in data.data) {
                    if (data.events['update'][i]) {
                        JMain.r.attach(data.data[i], data.events['update'][i], id);
                        updateEventsToExecute.push(data.data[i]);
                    }
                }
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
                        Reactive.data.instances[id]['$el'].on(i, j, eventData, handler.bind(Reactive.data.instances[id]), useCapture);
                    }
                } else {
                    Reactive.data.instancesCustomEvents[id][i] = data.events[i];
                }
            }
        }
        for (const i in data.components) {
            JMain.r.init(id + '.' + i, data.components[i]);
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
        if (!id.includes('.') && Reactive.data.instances.hasOwnProperty(id)) {
            const idC = id + '.';
            const idLength = idC.length;

            for (const i in Reactive.data.state) {
                if (i.substr(0, idLength) === idC) {
                    JMain.r.unset(i);
                }
            }

            for (const i in Reactive.data.instancesCustomEvents) {
                if (i.substr(0, idLength) === idC) {
                    delete Reactive.data.instancesCustomEvents[i];
                }
            }
            delete Reactive.data.instancesCustomEvents[id];

            for (const i in Reactive.data.instancesRestoreData) {
                if (i.substr(0, idLength) === idC) {
                    for (const j in Reactive.data.instancesRestoreData[i]) {
                        Reactive.data.instances[i].$restore(j);
                    }
                    delete Reactive.data.instancesRestoreData[i];
                }
            }
            if (Reactive.data.instancesRestoreData[id]) {
                for (const i in Reactive.data.instancesRestoreData[id]) {
                    Reactive.data.instances[id].$restore(i);
                }
                delete Reactive.data.instancesRestoreData[id];
            }

            for (const i in Reactive.data.instances) {
                if (i.substr(0, idLength) === idC) {
                    Reactive.data.instances[i]['$el'].off();
                    delete Reactive.data.instances[i];
                }
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
    refresh: function(idRef, handlerOrIndex = null, oldVal = undefined) {
        if (typeof idRef !== 'string') {
            idRef = idRef.id;
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
                            return true;
                        }
                    }
                } else if (!isNaN(handlerOrIndex)) {
                    if (Reactive.data.stateUpdateEvents[idRef][handlerOrIndex]) {
                        Reactive.data.stateUpdateEvents[idRef][handlerOrIndex].handler.call(Reactive.data.instances[Reactive.data.stateUpdateEvents[idRef][handlerOrIndex].instanceId], oldVal);
                        return true;
                    }
                }
            } else {
                let r = false;
                for (const i in Reactive.data.stateUpdateEvents[idRef]) {
                    if (Reactive.data.stateUpdateEvents[idRef][i]) {
                        Reactive.data.stateUpdateEvents[idRef][i].handler.call(Reactive.data.instances[Reactive.data.stateUpdateEvents[idRef][i].instanceId], oldVal);
                        r = true;
                    }
                }
                return r;
            }
        }
        return false;
    },
    set: function(idRef, index, value = undefined) {
        if (typeof idRef !== 'string') {
            idRef = idRef.id;
        }
        const oldVal = JMain.r.get(idRef);
        if (value === undefined) {
            value = index;
        } else {
            const newValue = value;
            value = (/boolean|number|string/).test(typeof oldVal) ? oldVal : JSON.parse(JSON.stringify(oldVal));
            if (typeof value === 'object' && value !== null) {
                value[index] = newValue;
            } else {
                return false;
            }
        }
        let different = false;
        if ((/boolean|number|string/).test(typeof oldVal) && (/boolean|number|string/).test(typeof variable)) {
            different = oldVal !== value;
        } else {
            different = JSON.stringify(oldVal) !== JSON.stringify(value);
            value = JSON.parse(JSON.stringify(value));
        }
        if (different) {
            Reactive.data.state[idRef] = value;
            JMain.r.refresh(idRef, null, oldVal);
        }
        return true;
    },
    unset: function(idRef, index = null) {
        if (typeof idRef !== 'string') {
            idRef = idRef.id;
        }
        if (index !== null) {
            const oldVal = JMain.r.get(idRef);
            if (typeof oldVal === 'object' && oldVal !== null && oldVal[index]) {
                let value;
                if (Array.isArray(oldVal)) {
                    value = JSON.parse(JSON.stringify(oldVal));
                    delete value[index];
                    value = value.filter(val => val !== undefined);
                } else {
                    value = Object.assign({}, oldVal);
                    delete value[index];
                }
                return JMain.r.set(idRef, value);
            }
        } else if (Reactive.data.state[idRef]) {
            let oldVal = JMain.r.get(idRef);
            oldVal = (/boolean|number|string/).test(typeof oldVal) ? oldVal : JSON.parse(JSON.stringify(oldVal));
            if (oldVal === undefined || oldVal === null) {
                Reactive.data.state[idRef] = oldVal;
            } else if (Array.isArray(oldVal)) {
                Reactive.data.state[idRef] = [];
            } else {
                switch (typeof oldVal) {
                    case 'object': Reactive.data.state[idRef] = {}; break;
                    case 'boolean': Reactive.data.state[idRef] = false; break;
                    case 'string': Reactive.data.state[idRef] = ''; break;
                    case 'number': case 'bigint': Reactive.data.state[idRef] = 0; break;
                    default: Reactive.data.state[idRef] = null
                }
            }
            if (Reactive.data.stateUpdateEvents[idRef]) {
                for (const i in Reactive.data.stateUpdateEvents[idRef]) {
                    if (Reactive.data.stateUpdateEvents[idRef][i]) {
                        Reactive.data.stateUpdateEvents[idRef][i].handler.call(Reactive.data.instances[Reactive.data.stateUpdateEvents[idRef][i].instanceId], oldVal);
                    }
                }
            }
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
    'stateUpdateEvents': Reactive.data.stateUpdateEvents
};

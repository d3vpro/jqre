class ReactiveVar {
    constructor(id) {}
    val() {}
    set(index, value = undefined) {}
    unset(index = null) {}
}

class Reactive {
    constructor(id, data) {}
    $emit(event, data = null) {}
    $find(selector) {}
    $remove(selector) {}
    $restore(selector) {}
}

$.r = {
    listDefinitions: function() {},
    listInstances: function() {},
    listInstancesCustomEvents: function() {},
    listInstancesRestoreData: function() {},
    listState: function() {},
    listStateUpdateEvents: function() {},

    define: function(type, data) {},
    init: function(id, instanceData) {},
    trigger: function(id, event, data = null) {},
    destroy: function(id) {},

    get: function(idRef) {},
    ref: function(id) {},
    attach: function(idRef, handler, instanceId = null) {},
    deattach: function(idRef, handlerOrIndex = null, instanceId = null) {},
    refresh: async function(idRef, handlerOrIndex = null, oldVal = undefined) {},
    set: function(idRef, index, value = undefined) {},
    unset: function(idRef, index = null) {}
}

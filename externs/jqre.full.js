const $ = jqre();

class JNode extends Array {
    add(selector, context = null) {}
    addClass(className) {}
    after(...data) {}
    append(...data) {}
    appendTo(target) {}
    attr(attr, value = null) {}
    before(...data) {}
    blur(eventData = null, handler = null) {}
    change(eventData = null, handler = null) {}
    children(selector = null) {}
    click(eventData = null, handler = null) {}
    clone(withDataAndEvents = false, deepWithDataAndEvents = null) {}
    closest(selector, context = null) {}
    contextmenu(eventData = null, handler = null) {}
    css(propertyName, value = null) {}
    data(data = null, value = null) {}
    dblclick(eventData = null, handler = null) {}
    each(func) {}
    empty() {}
    eq(index) {}
    even() {}
    filter(selector) {}
    find(selector, element = null) {}
    first() {}
    focus(eventData = null, handler = null) {}
    focusin(eventData = null, handler = null) {}
    focusout(eventData = null, handler = null) {}
    get(index = null) {}
    has(selector) {}
    hasClass(className) {}
    height(value = null) {}
    hide() {}
    hover(handlerIn, handlerOut = null) {}
    html(html = null) {}
    index(selector = null) {}
    innerHeight(value = null) {}
    innerWidth(value = null) {}
    insertAfter(target) {}
    insertBefore(target) {}
    is(selector) {}
    keydown(eventData = null, handler = null) {}
    keypress(eventData = null, handler = null) {}
    keyup(eventData = null, handler = null) {}
    last() {}
    load(url, data = null, complete = null) {}
    mousedown(eventData = null, handler = null) {}
    mouseenter(eventData = null, handler = null) {}
    mouseleave(eventData = null, handler = null) {}
    mousemove(eventData = null, handler = null) {}
    mouseout(eventData = null, handler = null) {}
    mouseover(eventData = null, handler = null) {}
    mouseup(eventData = null, handler = null) {}
    next(selector = null) {}
    not(selector) {}
    odd() {}
    off(events = null, selector = null, handler = null, useCapture = null) {}
    on(events, selector = null, data = null, handler = null, useCapture = null) {}
    outerHeight(value = null, includeMargin = null) {}
    outerWidth(value = null, includeMargin = null) {}
    parent(selector = null) {}
    prepend(...data) {}
    prependTo(target) {}
    prev(selector = null) {}
    prop(propertyName, value = null) {}
    ready(handler) {}
    remove(selector = null) {}
    removeAttr(attributeName) {}
    removeClass(className) {}
    removeData(name) {}
    removeProp(propertyName) {}
    replaceAll(target) {}
    replaceWith(...newContent) {}
    resize(eventData = null, handler = null) {}
    runScripts() {}
    scroll(eventData = null, handler = null) {}
    scrollLeft(value = null) {}
    scrollTop(value = null) {}
    select(eventData = null, handler = null) {}
    serialize() {}
    serializeArray() {}
    show() {}
    size() {}
    slice(start, end = null) {}
    submit(eventData = null, handler = null) {}
    swipe(func) {}
    text(text = null) {}
    toArray() {}
    toggle() {}
    toggleClass(className, state = null) {}
    trigger(eventType, extraParameters = null) {}
    unique() {}
    val(value = null) {}
    width(value = null) {}
    wrap(wrappingElement) {}
    autocomplete(data, prop = null) {}
    dialog(data) {}
}

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

$.ajax = function(url, settings = null) {};
$.clone = function(variable) {};
$.contains = function(container, contained) {};
$.data = function(element, key = null, value = null) {};
$.each = function(array, callback) {};
$.fn = {};
$.get = function(url, data = null, success = null, dataType = null) {};
$.getJSON = function(url, data = null, success = null) {};
$.inArray = function(value, array, fromIndex = null) {};
$.isArray = function(array) {};
$.isEmptyObject = function(object) {};
$.isFunction = function(value) {};
$.isMobile = function() {};
$.isNumeric = function(value) {};
$.isPlainObject = function(object) {};
$.makeArray = function(obj) {};
$.noop = function() {};
$.now = function() {};
$.param = function(obj, traditional = false, parent = false) {};
$.parseHTML = function(data) {};
$.parseJSON = function(json) {};
$.post = function(url, data = null, success = null, dataType = null) {};
$.toCamelCase = function(s) {};
$.touchPunch = function(enable = true) {};

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
    refresh: function(idRef, handlerOrIndex = null, oldVal = undefined) {},
    set: function(idRef, index, value = undefined) {},
    unset: function(idRef, index = null) {}
}

// Uncomment to export _internal
/*
$._internal = {
    eventHandler: {},
    JNode: JNode,
    baseManipution: function(type, ...data) {},
    runEventShorthand: function(eventType, eventData = null, handler = null) {},
    ajaxBase: async function(settings) {},
    getComputedCss: function(el, propertyName) {},
    fixSelector: function(selector) {},
    VERSION: '1.0.4'
};
*/

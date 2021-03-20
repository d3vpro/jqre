import { JNode, JMain } from './jqre.js';

JNode.prototype.blur = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['blur', ...arguments]);
}
JNode.prototype.change = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['change', ...arguments]);
}
JNode.prototype.click = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['click', ...arguments]);
}
JNode.prototype.contextmenu = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['contextmenu', ...arguments]);
}
JNode.prototype.dblclick = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['dblclick', ...arguments]);
}
JNode.prototype.focus = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['focus', ...arguments]);
}
JNode.prototype.focusin = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['focusin', ...arguments]);
}
JNode.prototype.focusout = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['focusout', ...arguments]);
}
JNode.prototype.hover = function(handlerIn, handlerOut = null) {
    if (handlerOut !== null) {
        JMain._internal.runEventShorthand.apply(this, ['mouseenter', handlerIn]);
        JMain._internal.runEventShorthand.apply(this, ['mouseleave', handlerOut]);
    } else {
        JMain._internal.runEventShorthand.apply(this, ['mouseleave', handlerIn]);
    }
    return this;
}
JNode.prototype.keydown = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['keydown', ...arguments]);
}
JNode.prototype.keypress = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['keypress', ...arguments]);
}
JNode.prototype.keyup = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['keyup', ...arguments]);
}
JNode.prototype.mousedown = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['mousedown', ...arguments]);
}
JNode.prototype.mouseenter = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['mouseenter', ...arguments]);
}
JNode.prototype.mouseleave = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['mouseleave', ...arguments]);
}
JNode.prototype.mousemove = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['mousemove', ...arguments]);
}
JNode.prototype.mouseout = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['mouseout', ...arguments]);
}
JNode.prototype.mouseover = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['mouseover', ...arguments]);
}
JNode.prototype.mouseup = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['mouseup', ...arguments]);
}
JNode.prototype.ready = function(handler) {
    if (document.readyState === 'complete' || document.readyState === 'loaded') {
        handler.call(this);
        return this;
    }
    return JMain._internal.runEventShorthand.apply(this, ['DOMContentLoaded', ...arguments]);
}
JNode.prototype.resize = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['resize', ...arguments]);
}
JNode.prototype.scroll = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['scroll', ...arguments]);
}
JNode.prototype.select = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['select', ...arguments]);
}
JNode.prototype.submit = function(eventData = null, handler = null) {
    return JMain._internal.runEventShorthand.apply(this, ['submit', ...arguments]);
}

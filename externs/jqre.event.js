JNode.prototype.off = function(events = null, selector = null, handler = null, useCapture = null) {}
JNode.prototype.on = function(events, selector = null, data = null, handler = null, useCapture = null) {}
JNode.prototype.trigger = function(eventType, extraParameters = null) {}
JNode.prototype.swipe = function(func) {}

$.touchPunch = function(enable = true) {}

// Uncomment to export _internal
// $._internal.eventHandler = {};
// $._internal.runEventShorthand = function(eventType, eventData = null, handler = null) {}

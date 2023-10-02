const $ = jqre();

class JNode extends Array {
    add(selector, context = null) {}
    async delay(duration) {}
    each(func) {}
    eq(index) {}
}

$.isMobile = function() {}
$.parseHTML = function(data) {}
$.parseJSON = function(json) {}
$.toCamelCase = function(s) {}

// Uncomment to export _internal
/*
$._internal = {
    JNode: JNode,
    getComputedCss: function(el, propertyName) {},
    fixSelector: function(selector) {},
    VERSION: '1.1.0'
}
*/

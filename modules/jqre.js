class JNode extends Array {
    constructor() {
        super();
        return new Proxy(this, {
            get: function(target, key) {
                if (key === 'then') {
                    return;
                }
                if (!(key in target)) {
                    return JMain.loadModuleByFunction(key, false);
                }
                return target[key];
            }
        });
    }
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
    async delay(duration) {
        await new Promise(resolve => setTimeout(resolve, duration));
        return this;
    }
    each(func) {
        for (const [i, n] of this.entries()) {
            func.call(n, i);
        }
        return this;
    }
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
}

function JMain(data, param = false) {
    const r = new JNode();
    if (data) {
        r.add(data, param);
    }
    return r;
}
JMain.isMobile = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
JMain.parseHTML = function(data) {
    const r = new DOMParser().parseFromString(data, 'text/html').body;
    if (data.includes('<body')) {
        return [r];
    } else {
        return r.childNodes;
    }
}
JMain.parseJSON = function(json) {
    return JSON.parse(json);
}
JMain.toCamelCase = function(s) {
    return s.replace(/-([a-z])/g, function(g) { return g[1].toUpperCase(); });
}
JMain._internal = {
    JNode: JNode,
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

async function jqre(modules = []) {
    JMain._internal.moduleList = [
        'node',
        'dom',
        'navigation',
        'event',
        'shortevent',
        'misc',
        'ajax',
        'reactive',
        'autocomplete',
        'dialog'
    ];
    JMain._internal.moduleDepedencies = {
        'dom': ['event'],
        'shortevent': ['event'],
        'reactive': ['navigation', 'event'],
        'autocomplete': ['node', 'dom', 'navigation', 'event', 'misc'],
        'dialog': ['node', 'dom', 'navigation', 'event']
    };
    JMain._internal.moduleLoaded = [];
    JMain.addModule = function(name) {
        if (!JMain._internal.moduleList.includes(name)) {
            JMain._internal.moduleList.push('name');
        }
    };
    JMain.loadModule = async function(name) {
        if (!JMain._internal.moduleLoaded.includes(name)) {
            JMain._internal.moduleLoaded.push(name);
            if (JMain._internal.moduleDepedencies[name]) {
                for (const j of JMain._internal.moduleDepedencies[name]) {
                    await JMain.loadModule(j);
                }
            }
            await import('./jqre.' + name + '.js');
        }
    };
    JMain.loadModuleByFunction = async function(func, main) {
        if (main) {
            const JMainModulesFunctions = {
                'dom': [
                    'baseManipution',
                ],
                'ajax': [
                    'ajax',
                    'get',
                    'getJSON',
                    'param',
                    'post',
                    'ajaxBase',
                ],
                'event': [
                    'touchPounch',
                    'eventHandler',
                    'runEventShorthand',
                ],
                'misc': [
                    'clone',
                    'contains',
                    'data',
                    'each',
                    'fn',
                    'inArray',
                    'isArray',
                    'isEmptyObject',
                    'isFunction',
                    'isNumeric',
                    'isPlainObject',
                    'makeArray',
                    'noop',
                    'now',
                ],
                'reactive': [
                    'r',
                ]
            };
            for (const m in JMainModulesFunctions) {
                if (JMainModulesFunctions[m].includes(func)) {
                    await JMain.loadModule(m);
                    break;
                }
            }
            return;
        }
        const JNodeModulesFunctions = {
            'node': [
                'addClass',
                'removeClass',
                'toggleClass',
                'hasClass',
                'attr',
                'removeAttr',
                'data',
                'removeData',
                'prop',
                'removeProp',
                'val',
                'css',
                'height',
                'width',
                'innerHeight',
                'innerWidth',
                'outerHeight',
                'outerWidth',
                'show',
                'hide',
                'toggle',
            ],
            'dom': [
                'after',
                'insertAfter',
                'before',
                'insertBefore',
                'append',
                'appendTo',
                'prepend',
                'prependTo',
                'replaceWith',
                'replaceAll',
                'clone',
                'wrap',
                'remove',
                'empty',
                'html',
                'runScripts',
                'text',
            ],
            'navigation': [
                'children',
                'closest',
                'parent',
                'unique',
                'next',
                'prev',
                'first',
                'last',
                'find',
                'filter',
                'even',
                'odd',
                'has',
                'is',
                'not',
                'index',
            ],
            'ajax': [
                'load',
                'serialize',
                'serializeArray',
            ],
            'event': [
                'off',
                'on',
                'swipe',
                'trigger',
            ],
            'shortevent': [
                'blur',
                'change',
                'click',
                'contextmenu',
                'dblclick',
                'focus',
                'focusin',
                'focusout',
                'hover',
                'keydown',
                'keypress',
                'keyup',
                'mousedown',
                'mouseenter',
                'mouseleave',
                'mousemove',
                'mouseout',
                'mouseover',
                'mouseup',
                'ready',
                'resize',
                'scroll',
                'submit',
                'select',
            ],
            'misc': [
                'get',
                'size',
                'slice',
                'toArray',
                'scrollLeft',
                'scrollTop',
            ],
            'autocomplete': [
                'autocomplete',
            ],
            'dialog': [
                'dialog',
            ]
        }
        for (const m in JNodeModulesFunctions) {
            if (JNodeModulesFunctions[m].includes(func)) {
                await JMain.loadModule(m);
            }
        }
    }
    if (modules.length === 1 && modules[0] === 'all') {
        modules = JMain._internal.moduleList;
    }
    for (const i of modules) {
        await JMain.loadModule(i);
    }
    return new Proxy(JMain, {
        get: function(target, key) {
            if (key === 'then') {
                return;
            }
            if (!(key in target)) {
                if (key === '_internal') {
                    return JMain.loadModule(['dom', 'ajax', 'event']);
                } else if (key === 'r') {
                    return JMain.loadModule(['reactive']);
                } else if (key === 'fn') {
                    return JMain.loadModule(['misc']);
                } else {
                    return JMain.loadModuleByFunction(key, true);
                }
            }
            return target[key];
        }
    });
}

export { JNode, JMain, jqre };

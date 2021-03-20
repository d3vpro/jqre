import { JNode, JMain } from './jqre.js';

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
        const event = new Event('select');
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

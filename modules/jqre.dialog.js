import { JNode, JMain } from './jqre.js';

class Dialog {
    constructor(data) {
        let defaults = {
            'applyStyle': true,
            'closeOnModalClick': true,
            'autoOpen': true,
            'closeOnEscape': true,
            'modal': false,
            'preventBodyScroll': true
        };
        for (const i in defaults) {
            if (data.hasOwnProperty(i)) {
                this[i] = data[i] == true;
            } else {
                this[i] = defaults[i];
            }
        }
        for (const i of ['beforeClose', 'close', 'create', 'open']) {
            if (typeof data[i] === 'function') {
                this['f_' + i] = data[i].bind(this);
            } else {
                this['f_' + i] = null;
            }
        }
        this['classes'] = {};
        for (const i of ['ui-dialog-container', 'ui-dialog-overlay', 'ui-dialog']) {
            if (typeof data['classes'] === 'object' && data['classes'] !== null && typeof data['classes'][i] === 'string' && data['classes'][i]) {
                this['classes'][i] = data['classes'][i];
            } else {
                this['classes'][i] = i;
            }
        }
        this.originalElement = new JNode().add(data.el);
        defaults = {
            'width': this.originalElement.width() + 'px',
            'height': this.originalElement.height() + 'px',
            'minWidth': '150px',
            'minHeight': '150px',
            'maxWidth': 'none',
            'maxHeight': 'none'
        };
        for (const i in defaults) {
            if (data[i]) {
                this[i] = isNaN(data[i]) ? data[i] : data[i] + 'px';
            } else {
                this[i] = defaults[i];
            }
        }
        this['widget'] = new JNode().add('<div></div>').addClass(this['classes']['ui-dialog-container']);
        if (this['applyStyle']) {
            this['widget'].css({
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'width': '100%',
                'height': '100%',
                'z-index': 10,
                'display': 'none',
                'align-items': 'center',
                'justify-content': 'center'
            });
        }
        if (this['modal']) {
            this['widget'].append('<div class="' + this['classes']['ui-dialog-overlay'] + '"></div>');
            if (this['applyStyle']) {
                this['widget'].children().css({
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'width': '100%',
                    'height': '100%',
                    'z-index': 10,
                    'background': 'rgba(0, 0, 0, 0.5)'
                });
            }
            if (this['closeOnModalClick']) {
                this['widget'].children().on('click', () => {this.close();});
            }
        }
        this['widget'].append('<div class="' + this['classes']['ui-dialog'] + '"></div>');
        if (this['applyStyle']) {
            this['widget'].children().last().css({
                'position': 'relative',
                'display': 'inline-block',
                'width': this['width'],
                'height': this['width'],
                'min-width': this['minWidth'],
                'max-width': this['maxWidth'],
                'min-height': this['minHeight'],
                'max-height': this['maxHeight'],
                'z-index': 11,
                'background': '#fff',
                'overflow': 'hidden auto',
                'overscroll-behavior': 'contain'
            });
        }
        this['widget'].children().last().append(this.originalElement);
        this.keyDownFunction = event => {
            if (event.key === 'Escape') {
                this.close();
            }
        };
        if (this['closeOnEscape']) {
            new JNode().add(document.body).on('keydown', this.keyDownFunction);
        }
        document.body.appendChild(this['widget'][0]);
        if (this['f_create']) {
            this['f_create'](null, null);
        }
        if (this['autoOpen']) {
            this.open();
        }
    }
    open() {
        if (this['widget'].css('display') !== 'flex') {
            this['widget'].css('display', 'flex');
            if (this['preventBodyScroll']) {
                new JNode().add('html,body').css('overflow', 'hidden');
            }
            if (this['f_open']) {
                this['f_open'](null, null);
            }
        }
    }
    close() {
        if (this['widget'].css('display') !== 'none') {
            if (this['f_beforeClose']) {
                this['f_beforeClose'](null, null);
            }
            this['widget'].css('display', 'none');
            if (this['preventBodyScroll']) {
                new JNode().add('html,body').css('overflow', '');
            }
            if (this['f_close']) {
                this['f_close'](null, null);
            }
        }
    }
}
Dialog.data = [];

JNode.prototype.dialog = function(data) {
    for (const n of this) {
        if (typeof data === 'object' && data !== null) {
            data.el = n;
            const d = new Dialog(data);
            n.dataset['uiDialog'] = Dialog.data.push(d) - 1;
            return this;
        } else if (typeof data === 'string') {
            const dId = n.dataset['uiDialog'];
            if (dId && Dialog.data[dId]) {
                const d = Dialog.data[dId];
                switch (data) {
                    case 'widget':
                        return d['widget'];
                    case 'instance':
                        return d;
                    case 'isOpen':
                        return d['widget'].css('display') !== 'none';
                    case 'open':
                        d.open();
                        break;
                    case 'close':
                        d.close();
                        break;
                    case 'destroy':
                        if (d['closeOnEscape']) {
                            new JNode().add(document.body).off('keydown', d.keyDownFunction);
                        }
                        d['widget'].remove();
                        Dialog.data[dId] = null;
                        break;
                }
                continue;
            }
        }
        break;
    }
    return this;
}

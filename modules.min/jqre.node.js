import{JNode,JMain}from"./jqre.js";JNode.prototype.addClass=function(t){return this.toggleClass(t,!0)},JNode.prototype.removeClass=function(t){return this.toggleClass(t,!1)},JNode.prototype.toggleClass=function(t,e=null){let o="toggle";if(null!==e&&(o=e?"add":"remove"),"string"==typeof t&&(t=t.split(" ")),Array.isArray(t))for(const e of this)for(const n in t)e.classList[o](t[n]);else if("function"==typeof t)for(const[e,n]of this.entries()){let i=t.call(n,e,n.className);"string"==typeof i&&(i=i.split(" "));for(const t in i)n.classList[o](i[t])}return this},JNode.prototype.hasClass=function(t){for(const e of this)return e.classList.contains(t);return!1},JNode.prototype.attr=function(t,e=null){for(const[o,n]of this.entries())if("string"==typeof t){if(null===e)return n.getAttribute(t);"function"==typeof e?n.setAttribute(t,e(o,n.getAttribute(t))):n.setAttribute(t,e)}else if(t instanceof Object)for(const e in t)n.setAttribute(e,t[e]);return this},JNode.prototype.removeAttr=function(t){for(const e of this)e.removeAttribute(t);return this},JNode.prototype.data=function(t=null,e=null){for(const o of this){if(null===t)return o.dataset;if(null===e){if("string"==typeof t)return o.dataset[JMain.toCamelCase(t)];for(let e in t)o.dataset[JMain.toCamelCase(e)]=t[e]}else o.dataset[JMain.toCamelCase(t)]=e}return this},JNode.prototype.removeData=function(t){for(const e of this)if(Array.isArray(t))for(const o in t)delete e.dataset[JMain.toCamelCase(t[o])];else{if(t.includes(" "))return this.removeData(t.split(" "));delete e.dataset[JMain.toCamelCase(t)]}return this},JNode.prototype.prop=function(t,e=null){for(const[o,n]of this.entries())if(null===e){if("string"==typeof t)return n[t];for(let e in t)n[e]=t[e]}else n[t]="function"==typeof e?e.call(n,o,n[t]):e;return this},JNode.prototype.removeProp=function(t){return this.removeAttr(t)},JNode.prototype.val=function(t=null){for(const[e,o]of this.entries()){if(null===t){if("SELECT"===o.nodeName&&o.multiple){const t=[];for(let e of Array.from(o.querySelectorAll("option:checked")))t.push(e.value);return t}return o.value}if("function"==typeof t)o.value=t.call(o,e,o.value);else if(Array.isArray(t))for(let e of Array.from(o.querySelectorAll("option")))e.selected=t.includes(e.value);else o.value=t}return this},JNode.prototype.css=function(t,e=null){if(null===e){if("string"==typeof t)return JMain._internal.getComputedCss(this,t);if(Array.isArray(t)){for(const e of this){const o={};for(const n in t)o[t[n]]=JMain._internal.getComputedCss(e,t[n]);return o}return{}}for(const e of this)for(const o in t)e.style[JMain.toCamelCase(o)]=t[o]}else if("function"==typeof e)for(const[o,n]of this.entries())n.style[JMain.toCamelCase(t)]=e.call(n,o,JMain._internal.getComputedCss(n,t));else for(const o of this)o.style[JMain.toCamelCase(t)]=e;return this},JNode.prototype.height=function(t=null){if("function"==typeof t){for(const[e,o]of this.entries()){const n=(new JNode).add(o);n.height(t.call(o,e,n.height()))}return this}if(null!==t)return this.css("height",t);for(const t of this){if(t===window||t===document)return window.innerHeight;{const e=parseFloat(JMain._internal.getComputedCss(t,"height"));return 0!==t.offsetHeight||isNaN(e)?parseFloat(t.offsetHeight)-parseFloat(JMain._internal.getComputedCss(t,"paddingTop"))-parseFloat(JMain._internal.getComputedCss(t,"paddingBottom"))-parseFloat(JMain._internal.getComputedCss(t,"borderTopWidth"))-parseFloat(JMain._internal.getComputedCss(t,"borderBottomWidth")):e}}return 0},JNode.prototype.width=function(t=null){if("function"==typeof t){for(const[e,o]of this.entries()){const n=(new JNode).add(o);n.width(t.call(o,e,n.width()))}return this}if(null!==t)return this.css("width",t);for(const t of this){if(t===window||t===document)return window.innerWidth;{const e=parseFloat(JMain._internal.getComputedCss(t,"width"));return 0!==t.offsetWidth||isNaN(e)?parseFloat(t.offsetWidth)-parseFloat(JMain._internal.getComputedCss(t,"paddingLeft"))-parseFloat(JMain._internal.getComputedCss(t,"paddingRight"))-parseFloat(JMain._internal.getComputedCss(t,"borderLeftWidth"))-parseFloat(JMain._internal.getComputedCss(t,"borderRightWidth")):e}}return 0},JNode.prototype.innerHeight=function(t=null){if("function"==typeof t){for(const[e,o]of this.entries()){const n=(new JNode).add(o);n.innerHeight(t.call(o,e,n.innerHeight()))}return this}if(null!==t){for(const e of this){const o=(new JNode).add(e);o.height(t).height(2*o.height()-o.innerHeight())}return this}for(const t of this){if(t===window||t===document)return window.innerHeight;{const e=parseFloat(JMain._internal.getComputedCss(t,"height"));return 0!==t.offsetHeight||isNaN(e)?parseFloat(t.offsetHeight)-parseFloat(JMain._internal.getComputedCss(t,"borderTopWidth"))-parseFloat(JMain._internal.getComputedCss(t,"borderBottomWidth")):e+parseFloat(JMain._internal.getComputedCss(t,"paddingTop"))+parseFloat(JMain._internal.getComputedCss(t,"paddingBottom"))}}return 0},JNode.prototype.innerWidth=function(t=null){if("function"==typeof t){for(const[e,o]of this.entries()){const n=(new JNode).add(o);n.innerWidth(t.call(o,e,n.innerWidth()))}return this}if(null!==t){for(const e of this){const o=(new JNode).add(e);o.width(t).width(2*o.width()-o.innerWidth())}return this}for(const t of this){if(t===window||t===document)return window.innerWidth;{const e=parseFloat(JMain._internal.getComputedCss(t,"width"));return 0!==t.offsetWidth||isNaN(e)?parseFloat(t.offsetWidth)-parseFloat(JMain._internal.getComputedCss(t,"borderLeftWidth"))-parseFloat(JMain._internal.getComputedCss(t,"borderRightWidth")):e+parseFloat(JMain._internal.getComputedCss(t,"paddingLeft"))+parseFloat(JMain._internal.getComputedCss(t,"paddingRight"))}}return 0},JNode.prototype.outerHeight=function(t=null,e=null){if("function"==typeof t){for(const[o,n]of this.entries()){const i=(new JNode).add(n);i.outerHeight(t.call(n,o,i.outerHeight(e)),e)}return this}if(null!==e||null!==t&&"boolean"!=typeof t){for(const o of this){const n=(new JNode).add(o);n.height(t).height(2*n.height()-n.outerHeight(e))}return this}for(const e of this){if(e===window||e===document)return window.outerHeight;{const o=parseFloat(JMain._internal.getComputedCss(e,"height"));return(0!==e.offsetHeight||isNaN(o)?parseFloat(e.offsetHeight):o+parseFloat(JMain._internal.getComputedCss(e,"paddingTop"))+parseFloat(JMain._internal.getComputedCss(e,"paddingBottom"))+parseFloat(JMain._internal.getComputedCss(e,"borderTopWidth"))+parseFloat(JMain._internal.getComputedCss(e,"borderBottomWidth")))+(t?parseFloat(JMain._internal.getComputedCss(e,"marginTop"))+parseFloat(JMain._internal.getComputedCss(e,"marginBottom")):0)}}return 0},JNode.prototype.outerWidth=function(t=null,e=null){if("function"==typeof t){for(const[o,n]of this.entries()){const i=(new JNode).add(n);i.outerWidth(t.call(n,o,i.outerWidth(e)),e)}return this}if(null!==e||null!==t&&"boolean"!=typeof t){for(const o of this){const n=(new JNode).add(o);n.width(t).width(2*n.width()-n.outerWidth(e))}return this}for(const e of this){if(e===window||e===document)return window.outerWidth;{const o=parseFloat(JMain._internal.getComputedCss(e,"width"));return(0!==e.offsetWidth||isNaN(o)?parseFloat(e.offsetWidth):o+parseFloat(JMain._internal.getComputedCss(e,"paddingLeft"))+parseFloat(JMain._internal.getComputedCss(e,"paddingRight"))+parseFloat(JMain._internal.getComputedCss(e,"borderLeftWidth"))+parseFloat(JMain._internal.getComputedCss(e,"borderRightWidth")))+(t?parseFloat(JMain._internal.getComputedCss(e,"marginLeft"))+parseFloat(JMain._internal.getComputedCss(e,"marginRight")):0)}}return 0},JNode.prototype.show=function(){for(const t of this)t.dataset.jqreInitialDisplay?(t.style.display=t.dataset.jqreInitialDisplay,delete t.dataset.jqreInitialDisplay):t.style.display="";return this},JNode.prototype.hide=function(){for(const t of this)t.dataset.jqreInitialDisplay=JMain._internal.getComputedCss(t,"display"),t.style.display="none";return this},JNode.prototype.toggle=function(){for(const t of this)t.dataset.jqreInitialDisplay?(t.style.display=t.dataset.jqreInitialDisplay,delete t.dataset.jqreInitialDisplay):(t.dataset.jqreInitialDisplay=t.style.display,t.style.display="none");return this};
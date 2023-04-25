import{JNode,JMain}from"./jqre.js";JNode.prototype.load=function(e,t=null,n=null){let a=null;e.indexOf(" ")>-1&&(a=e.substr(e.indexOf(" ")+1),e=e.substr(0,e.indexOf(" ")));const o={};return"function"==typeof t?n=t:o.data=t,o.dataType="html",o.success=function(e,t,n){for(const a of this){if(e){const t=n[0].querySelectorAll(JMain._internal.fixSelector(e));a.innerHTML=t.length?Array.from(t).reduce(((e,t)=>e+t.outerHTML),""):""}else a.innerHTML=n[0].outerHTML;"function"==typeof t&&t.call(a)}}.bind(this,a,n),JMain.ajax(e,o),this},JNode.prototype.serialize=function(){return JMain.param(this.serializeArray())},JNode.prototype.serializeArray=function(){const e=[],t=[];for(const t of this)if(["INPUT","SELECT","TEXTAREA"].includes(t.nodeName))e.push(t);else for(const n of Array.from(t.querySelectorAll("input,select,textarea")))e.push(n);for(const n of e)if(n.name&&!n.disabled)switch(n.nodeName){case"INPUT":switch(n.type){case"submit":break;case"checkbox":case"radio":if(!n.checked)break;default:t.push({name:n.name,value:n.value})}break;case"SELECT":if(n.multiple){for(const e of Array.from(n.querySelectorAll("option:checked")))t.push({name:n.name,value:e.value});break}case"TEXTAREA":t.push({name:n.name,value:n.value})}return t},JMain.ajax=function(e,t=null){return"string"==typeof e?null!==t?t.url=e:t={url:e}:t=e,JMain._internal.ajaxBase(t)},JMain.get=function(e,t=null,n=null,a=null){if("object"==typeof e)return JMain.ajax(e);const o={};switch(typeof t){case"function":o.success=t;break;case"object":if(null===t)break;const n=[];for(const e in t)n.push(e+"="+encodeURIComponent(t[e]));t=n.join("&");case"string":e+=(e.includes("?")?"&":"?")+t}return o.url=e,"function"==typeof n?(o.success=n,null!==a&&(o.dataType=a)):null!==n&&(o.dataType=n),JMain.ajax(o)},JMain.getJSON=function(e,t=null,n=null){return null!==n?JMain.get(e,t,n,"json"):null!==t?JMain.get(e,t,"json"):JMain.get(e,"json")},JMain.param=function(e,t=!1,n=!1){let a=[];if(e instanceof JNode&&(e=e.serializeArray()),Array.isArray(e))for(const t of e)void 0!==t.value&&a.push(t.name+"="+encodeURIComponent(t.value));else if(t)for(let t in e)a.push(t+"="+encodeURIComponent(e[t].toString()));else for(let o in e)if(Array.isArray(e[o]))for(const[r,s]of e[o].entries())"object"==typeof s?a.push(JMain.param(s,t,n?n+"["+o+"]["+r+"]":o+"["+r+"]")):a.push((n?n+"["+o+"]":o)+"[]="+encodeURIComponent(s.toString()));else"object"==typeof e[o]?a.push(JMain.param(e[o],t,n?n+"["+o+"]":o)):a.push((n?n+"["+o+"]":o)+"="+encodeURIComponent(e[o].toString()));for(let e=0;e<a.length;e++)if(!a[e].includes("[]=")){let t=!1;for(let n=0;n<a.length;n++)e!==n&&a[e].split("=")[0]===a[n].split("=")[0]&&(a[n]=a[n].replace("=","[]="),t=!0);t&&(a[e]=a[e].replace("=","[]="))}return a.join("&")},JMain.post=function(e,t=null,n=null,a=null){if("object"==typeof e)return e.method="POST",JMain.ajax(e);const o={url:e};return a||"function"==typeof n?(o.dataType=a,o.success=n,o.data=t):null!==n?(o.dataType=n,"function"==typeof t?o.success=t:o.data=t):"string"==typeof t?o.dataType=t:"function"==typeof t?o.success=t:null!==t&&(o.data=t),JMain.ajax(o)},JMain._internal.ajaxBase=async function(e){e.headers=e.headers??{},e.type&&!e.method&&(e.method=e.type),e.method&&(e.method=e.method.toUpperCase().trim()),e.contentType?e.headers["Content-Type"]=e.contentType:e.headers["Content-Type"]||(e.headers["Content-Type"]="application/x-www-form-urlencoded"),e.data&&"string"!=typeof e.data&&(e.data=JMain.param(e.data)),e.username&&e.password&&(e.headers.Authorization="Basic "+btoa(e.username+":"+e.password));const t=new Request(e.url,{method:e.method??(e.data?"POST":"GET"),headers:e.headers,body:e.data,referrer:e.referrer??"about:client",referrerPolicy:e.referrerPolicy??"no-referrer-when-downgrade",mode:e.mode??"cors",credentials:e.credentials??"same-origin",cache:e.cache??"default",redirect:e.redirect??"follow",integrity:e.integrity??"",keepalive:e.keepalive??!1,signal:e.signal??void 0,window:e.window??null});e.beforeSend&&e.beforeSend({},e),await fetch(t).then((async function(t){if(t.ok){if(e.success){if(!e.dataType){const n=t.headers.get("content-type");0===n.indexOf("application/json")?e.dataType="json":0===n.indexOf("text/html")?e.dataType="html":0===n.indexOf("text/xml")?e.dataType="xml":0===n.indexOf("text/javascript")?e.dataType="script":e.dataType="text"}switch(e.dataType){case"html":case"xml":e.success(JMain.parseHTML(await t.text()),t,{});break;case"json":case"jsonp":e.success(await t.json(),t,{});break;default:e.success(await t.text(),t,{})}}}else e.error&&e.error({},t.statusText);e.statusCode&&e.statusCode[t.status]&&e.statusCode[t.status](),e.complete&&e.complete({},t)}))};
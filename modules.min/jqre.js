class JNode extends Array{add(e,n=null){const t=[];if("string"==typeof e)if("<"!==e.trim().substr(0,1)){const i=null!==n&&"boolean"!=typeof n?(new JNode).add(n):[document];for(const o of i)if("boolean"==typeof n&&n){if(t.push.apply(t,[o.querySelector(JMain._internal.fixSelector(e))]),t.length)break}else t.push.apply(t,Array.from(o.querySelectorAll(JMain._internal.fixSelector(e))))}else t.push.apply(t,[...JMain.parseHTML(e)]);else e instanceof NodeList||e instanceof HTMLCollection||e instanceof JNode?t.push.apply(t,Array.from(e)):e instanceof Node&&t.push.apply(t,[e]);return Array.prototype.push.apply(this,t),this}async delay(e){return await new Promise((n=>setTimeout(n,e))),this}each(e){for(const[n,t]of this.entries())e.call(t,n);return this}eq(e){if(e<0){if(this.length>=-1*e)return(new JNode).add(this[this.length+e])}else if(this.length>=e)return(new JNode).add(this[e]);return new JNode}}function JMain(e,n=!1){const t=new JNode;return e&&t.add(e,n),t}async function jqre(e=[]){JMain._internal.moduleList=["node","dom","navigation","event","shortevent","misc","ajax","reactive","autocomplete","dialog"],JMain._internal.moduleDepedencies={dom:["event"],shortevent:["event"],reactive:["navigation","event"],autocomplete:["node","dom","navigation","event","misc"],dialog:["node","dom","navigation","event"]},JMain._internal.moduleLoaded=[],JMain.addModule=function(e){JMain._internal.moduleList.includes(e)||JMain._internal.moduleList.push("name")},JMain.loadModule=async function(e){if(!JMain._internal.moduleLoaded.includes(e)){if(JMain._internal.moduleLoaded.push(e),JMain._internal.moduleDepedencies[e])for(const n of JMain._internal.moduleDepedencies[e])await JMain.loadModule(n);await import("./jqre."+e+".js")}},1===e.length&&"all"===e[0]&&(e=JMain._internal.moduleList);for(const n of e)await JMain.loadModule(n);return JMain}JMain.isMobile=function(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)},JMain.parseHTML=function(e){const n=(new DOMParser).parseFromString(e,"text/html").body;return e.includes("<body")?[n]:n.childNodes},JMain.parseJSON=function(e){return JSON.parse(e)},JMain.toCamelCase=function(e){return e.replace(/-([a-z])/g,(function(e){return e[1].toUpperCase()}))},JMain._internal={JNode:JNode,getComputedCss:function(e,n){if(!(e instanceof JNode))return document.defaultView.getComputedStyle(e)[JMain.toCamelCase(n)];for(const t of e)return document.defaultView.getComputedStyle(t)[JMain.toCamelCase(n)];return""},fixSelector:function(e){return">"===e.trim().substr(0,1)?":scope "+e:e},VERSION:"1.0.4"};export{JNode,JMain,jqre};
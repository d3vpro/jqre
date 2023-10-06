# jQRe

jQuery compatible library developed with a modular approach and including a reactive component

## Table of contents

- [Why rewriting jQuery?](#why)
- [Objectives](#objectives)
- [Roadmap](#roadmap)
- [How to use](#how-to-use)
    - [jQ part](#first-part-of-jqre-the-jquery-replacement)
    - [Re part](#second-part-of-jqre-the-reactive-component)
    - [Autocomplete](#autocomplete-module)
    - [Dialog](#dialog-module)
    - [New functions](#new-functions)
- [How to contribute](#how-to-contribute)
- [Functions reference](#functions-reference)

## Why

I did not plan to publish this library but I am pleased with its current form so I decided to share it with you. I have used jQuery for many years and I really appreciate the contribution it has to the state of todays web.

As the javascript ecosystem grew, libraries efficiency and management became more and more important. jQuery includes a lot of apis, but usually I use only a fraction of them, especially as modern browsers feature set is more and more consistent and the motivation to support old browsers fades away. As ES6 modules support was implemented in all modern browsers I craved more and more for a more *lightweight* and *modular* library.

At the same time I am aware of the modern trend regarding reactive frameworks. I worked with a few, namely Angular which I personally did not like at all, React which I did not like and Vue.js which is kind of ok. What I do not like regarding all of these frameworks is that they pollute the HTML source. I personally like to have the HTML as clean as possible, I hate to have all sort of conditions and strange attributes in the source code. On the other hand, in my opinion reactive frameworks are too heavy for the benefits they offer. For me, reactivity makes sense when you need the same data to be displayed and/or manipulated in more than one place. But for this purpose I want a far more lightweight (and javascript-only) component than those available.

The corner stone that made me start writing this library was when I needed to optimize the Lighthouse score for a website and jQuery stand in the way. For example, in order to fix *"Does not use passive listeners to improve scrolling performance"* it was needed to alter the source code and rebuild the library. This made me analyze the source code and realize that if I rewrite the functions I use, targeting only modern browsers, and improving where I needed, I will end with a significantly lightweight modular library.

## Objectives

The proposed requirements for this library are:

### 1. jQuery compatible

I have many applications that reside on jQuery, so I don't want to rewrite them, I want a drop-in replacement. I propose to rewrite only the most used apis. Anything regarding animations is excluded as css transitions and animations are a better alternative. Ajax will be written using fetch.

### 2. Modularity

I want functions to be grouped in modules. Currently, I grouped implemented apis into 7 modules (node, dom, navigation, event, shortevent, ajax, misc). Also, some jQuery UI apis will be developed, each having its own module. For now, only `autocomplete` and `dialog` modules have been developed, with partial compatibility. jQuery UI replacement modules will not necessary implement all properties, methods and events of the original apis. Additionally, important functions like `isMobile`, `touchPunch`, `swipe` and others will be developed additionally and integrated in the most suitable module. The reactive component will have its own module.

### 3. The reactive module requirements

#### 3.1. No HTML integration

The HTML code will remain perfectly clean. All control structures will be implemented in js.

#### 3.2. Global state management by default

All variables from all reactive component instances, as well as custom variables, will be stored in the same global store under the component namespace.

#### 3.3. Full reactivity both ways

A variable that is referenced in multiple places, no matter that the component is a parent or a child or even outside of components, can be directly updated and all instances will be notified about the update.

### 4. Availability as monolith and as ES6 modules using in-browser dynamic import

From this point I will always use modular architecture with dynamic module import for all my projects, but for existing apps I also need the library available in monolithic form.

### 5. Simple tests for every part of the library

### 6. Compressor scripts

### 7. Modules for Bootstrap 5 js components

I love Bootstrap too. For the css part of bootstrap I use PurgeCss to get rid of the unused css but for the js part there is no simple way. Also, the js is quite heavy so I want to rewrite every Bootstrap 5 component js part as a module for jQRe.

## Roadmap

- [x] Rewrite the most important jQuery apis (113 functions currently)
- [x] Monolith and modular versions
- [x] Reactive module
- [x] Autocomplete module
- [x] Dialog module
- [x] Simple tests
- [x] `touchPunch` and `swipe` functions
- [x] Compressor scripts
    
 I am pretty pleased to mention that the full monolithic library has only 42 KB minified.
- [ ] Rewrite more apis, that are marked with *may get support*

## How to use

### First part of jQRe, the jQuery replacement

**For the modular architecture**, lets suppose you put the scripts in `/js/jqre.min/`. Then you will need to the have a script that does something like this:

```
<script type="module">
import {jqre} from '/js/jqre.min/jqre.js';
(async () => {
    window.$ = await jqre(['all']);
})();
</script>
```

If you give no parameter to `jqre()` function, just the core functions will be loaded. If you pass an array containing `all`, then all modules will be loaded. Otherwise you must pass an array with all the modules desired. If you want to load modules at a later time you can do this using `loadModule` function (dependencies are loaded automatically), for example:

```
await $.loadModule('autocomplete');
```

Another way to load modules, if you do not know in what module a function resides, is by awaiting on it:

```
await $.isArray;
$.isArray([]);

await $("#id").children;
$("#id").children().length;
```

Also, if you create your own jQRe module you can add it and load it:

```
$.addModule('mymodule');
await $.loadModule('mymodule');
```

**For the monolithic version**, just include `jqre.full.min.js`. Before running any script, add:

```
window.$ = jqre();
// and if you need
window.jQuery = $;
```

I chose this instantiation approach because this way you can use any variable name. You can even use multiple jQRe instances or run it alongside jQuery.

**Minifying the monolithic version** with some modules

For this you need to have installed `google-closure-compiler` globally and then run:

```
jqre.full.minify.sh PARAMS
```

`PARAMS` is optional and can be `ADVANCED` (default), `SIMPLE` or `ADVANCED modules`, for example:

```
jqre.full.minify.sh ADVANCED node dom navigation event
```

**Minifying the modular architecture**

Google closure compiler does not support ES6 modules so I used `terser` for minification. It is not as efficient, but it does the job. To minify, just run:

```
jqre.mod.minify.sh
```

A full list of implemented jQuery functions and details about their implementation can be found in the [Functions reference](#functions-reference) section.

### Second part of jQRe, the Reactive component

The reactive component can be accessed using `$.r`.

**Global apis on reactive component**

```
- define(type, settings)
    'type' - a unqiue identifier for this component type
    'settings' - an object with the following structure
        'data' - object containing key - value pairs
        'methods' - object with functions
        'events'
            'create' - function
            'destroy' - function
            'update' - object
                'dataVariableName' - function(oldValue)
            'domEvent' - object
                'selector' - function(event)
                'selector' - object
                    'handler' - function(event)
                    'data' - data to pass to event
                    'useCapture' - boolean or object
            'customEvent' - function

    Example:
    
    $.r.define('post-list', {
        data: {
            title: '',
            posts: [],
            totalPosts: 0
        },
        methods: {
            addPost: function(title) {
                this.posts.push({title: title});
            }
        },
        events: {
            create: function() {
                if (this.$find('#no-posts').length === 0) {
                    this.$el.append('<div id="no-posts"><p>' + this.noPostsMessage + '</p></div>');
                }
            },
            destroy: function() {
                console.log(this.$id + ' destroyed');
            },
            update: {
                posts: function(oldV) {
                    if (this.posts.length > 0) {
                        this.$restore('#posts');
                        this.$remove('#no-posts');
                    } else {
                        this.$remove('#posts');
                        this.$restore('#no-posts');
                    }
                    this.totalPosts = this.posts.length;
                },
                totalPosts: function(oldV) {
                    this.$find('.heading').text(this.title + ' (' + this.totalPosts + ')');
                }
            },
            click: {
                '.add': function() {
                    let title;
                    if (title = prompt('Title: ')) {
                        this.addPost(title);
                    }
                }
            }
        }
    });

- init (id, settings)
    'id' - a unqiue identifier for this instance
    'settings' - an object with the following structure
        'type' - component type
        'el' - component root element or selector
        'data' - object containing key - value pairs

    Example:

    $.r.init('app', {
        type: 'post-list',
        el: '#app',
        data: {
            title: 'Title',
            posts: postsData
        }
    });

- destroy(id)
  Current component and all their children will be destroyed recursively.
  The HTML is not removed but is restored.
- trigger(id, customEvent, params = null)
  Global function that can trigger a custom event on an instance with specified params.
- get(refId)
  Global function to get a reactive variable value.
  Variable refId is built using parent component chain and variable name joined by dots: "parentComponent.component.variable".
- ref(refId)
  Return a reference to a reactive variable that can be used anywhere, like when instantiang a component, or in a child component data.
  All refs with the same refId point to the same actual variable, no extra memory is used.
- attach(idRef, handler, instanceId = null)
  Bind a function to a variable update event. The function receives the old value of the variable as parameter.
  This way, the reactivity can be used without using components too.
- deattach(idRef, handler, instanceId = null)
  Remove a function from a variable update event.
- refresh(idRef, handler = null, oldValue = undefined)
  Force trigger the update event of a variable, for a handler or for all handler. An old value can be forced too.
- set(idRef, index, value = undefined)
  Set a variable value. If the variable is an array, an index can be provided in order to update only its value.
- unset(idRef, index = null)
  Unset a variable. If the variable is an array, an index can be provided in order to delete only that index.
- data
  Is the internal storage of the reactive component.
  I was not sure if I should expose it or not, I chose to expose, but you should not use it directly.
  To get global info, the following self-explanatory listing functions can be used.
- listDefinitions
- listInstances
- listInstancesCustomEvents
- listInstancesRestoreData
- listState
- listStateUpdateEvents
```

**Apis on reactive instances**

```
- $id instance id
- $el instance root element
- $parent instance of the parent if exists
- $children array of child instances
- $emit(event, data = null)
  Emit a custom event with the given data. Event bubbles until it is first captured.
- $find(selector)
  Equivalent to "this.$el.find()".
- $remove(selector)
  Used to remove element from DOM.
- $restore(selector)
  Used to restore element to DOM.
  The $remove and $restore are alternatives to using if conditions in HTML in other reactive frameworks.
```

**Reactive variables functions**

```
- val()
    Reactive variables can be used normally using ".val()", ".set()" and ".unset()" functions.
    When inside a component method or event, they are accessed directly; a deep proxy is used to preserve reactivity in this case.
    Update events do not run during component methods or events.
- set(index, value = undefined)
    Set a variable value, or optionally, the value at the specified index, if it's an array or object.
- unset(index = null)
    A variable cannot be unset by calling variable.unset(), only it's keys can be deleted this way, if it is and array or object.
```

A simple, fully working example can be found at [`test/re.html`](test/re.html).


**A version of the reactive module for jQuery as well as generation and minifying scripts can be found in root.**


### Autocomplete module

The autocomplete module is only partially compatible with the jQuery UI widget. The differences are:

- `appendTo` property, `option` method, `_renderMenu` and `_resizeMenu` are not supported
- `position` supports only one of the values `after` or `before`, defaults to `before`
- `classes`, if specified, are not appended to default ones but they overwrite them. So if you want to keep the default classes and add other classes too, you must add the default ones too. Also, `active` class was added, it is the class added to the list item when it is focused
- `renderItem` (without `_`) is supported but must be passed on initialization like `open` and `close` methods
- `.data('ui-autocomplete')` is changed to `.data('uiAutocomplete')` and returns just an numeric id
- `event` parameter is not `null` only for `change` and `select` events
- the instance has different structure
- new property `allowCustom`, if `true` it means that typed values that are not found in the list are allowed, defaults to `false`
- new property `applyStyle`, if `true` it applies css in order for the autocomplete to display correctly, otherwise you must manually make the autocomplete display correctly; defaults to `true`
- the biggest change is that in the original field, the selected `value` is saved instead of the `label`, so it is not necessary to store it in another field on `change` / `select`

### Dialog module

The dialog module is only partially compatible with the jQuery UI widget. The differences are:

- dialogs have no content by default (not even a close button)
- `buttons`, `closeText`, `dialogClass`, `draggable`, `hide`, `position`, `resizable`, `show`, `title`, `_allowInteraction`, `option` and `moveToTop` methods are not supported as well as `drag*`, `resize*` and `focus` events
- position is by default the center of the window, use css to change it
- `focus` and `tabindex` are not handled specifically
- `classes`, if specified, are not appended to default ones but they overwrite them. So if you want to keep the default classes and add other classes too, you must add the default ones too. Only `ui-dialog` is kept. Also, `ui-dialog-overlay` class was added as the modal class and `ui-dialog-container` was added as the container class
- `destroy` removes dialog element without restoring anything
- events parameters are `null`
- the instance has different structure
- new property `applyStyle`, if `true` it applies css in order for the dialog to display correctly, otherwise you must manually make the dialog display correctly; defaults to `true`
- new property `closeOnModalClick`, self-explanatory, defaults to `true`
- new property `preventBodyScroll`, self-explanatory as well, defaults to `true`
- to conclude, the supported options are:
	- properties: `autoOpen` `classes` `applyStyle` `closeOnEscape` `closeOnModalClick` `preventBodyScroll` `height` `maxHeight` `minHeight` `width` `maxWidth` `minWidth` `modal`
	- methods: `close` `destroy` `instance` `isOpen` `open` `widget`
	- events: `beforeClose` `close` `create` `open`

### New functions

There are a few new functions implemented in jQRe:

- `runScripts()`: executes scripts contained in selection tree. Used to compensate the fact that scripts added in HTML strings are not automatically run
- `swipe(func)` : executes a callback with one parameter, the swipe direction on the element. The direction can be one of `up`, `down`, `left` or `right`. If `func` is `false`, callbacks are removed for the element
- `unique()` : removes duplicate elements from jQRe object; it is used internally by the `parent()` method
- `$.clone(variable)` : clones an object / array recursively; uses json encode - decode
- `$.isMobile()` : returns `true` if the device is mobile
- `$.toCamelCase(s)` : convert a string to camelCase
- `$.touchPunch(enable)` : enables / disables mouse events simulation from touch events
- `$._internal` : a collection of internal items:
    - `eventHandler` : internal event handler class instance; gives access to `functionMap`
    - `JNode` : reference to class, to be able to extend it using prototype
    - `baseManipution` : used internally by `after`, `append`, `before`, `prepend`, `replaceWith` and related functions
    - `runEventShorthand` : used internally for short events functions
    - `ajaxBase` : used internally by ajax functions
    - `getComputedCss` : used internally to obtain computed css values of elements
    - `fixSelector` : used internally to fix selectors starting with `>`
    - `VERSION` : current jQRe version

## How to contribute

You can contribute in several ways:

1. Use the library, report issues, join the development

2. Write better tests than I did

   I was never good at writing test (or never had enough time). I know the tests I wrote are very primitive, but it was fast and for now they do the job.

   If anyone offers to write proper tests, be my guest :)

3. Develop modules

   As you can see if you analyze the code, modules are just a `Class` and a function added to `JMain` primitive.

   When writing code please check that the language features you use are supported by all modern browsers. Roughly, the code I write uses features up to ES2018, but it is better to check per feature.

4. Spread the word

   If you find any value in this library, share it with others. The more interest it has, the more it will be developed.

5. Donate on [patreon](https://www.patreon.com/razvan0925)

   Usually when I use a library that is really useful for me and I use it in commercial purposes, I try to support the developers. If that's the case for you, any support is appreciated, thank you!

## Functions reference

|Function|Support|Module|Details|
|:---|:---|:---|:---|
add|full+|core|context - if true return only the first match|
addBack|no|||
addClass|full|node||
after|full|dom||
ajax*|no|||
animate|no|||
append|full|dom||
appendTo|full|dom||
attr|full|node||
before|full|dom||
blur|full|shortevent||
callbacks.*|no|||
change|full|shortevent||
children|full|navigation||
clearQueue|no|||
click|full|shortevent||
clone|full|dom||
closest|full|navigation||
contents|no, may get|||
contextmenu|full|shortevent||
css|partial|node|units must always be mentioned|
data|partial|node|uses element dataset instead of internal storage object|
dblclick|full|shortevent||
deferred.*|no|||
delay|partial||no queueName; requires await|
dequeue|no|||
detach|no|||
each|full|core||
empty|full|dom||
end|no|||
eq|full|core||
even|full|navigation||
fade*|no|||
filter|full|navigation||
find|full+|navigation|element - if true return only the first match|
finish|no|||
first|full|navigation||
focus|full|shortevent||
focusin|full|shortevent||
focusout|full|shortevent||
get|full|misc||
has|full|navigation||
hasClass|full|node||
height|full|node|does not vary with box-sizing|
hide|partial|node|just base functionality, no animation|
hover|full|shortevent||
html|full|dom||
index|full|navigation||
innerHeight|full|node|does not vary with box-sizing|
innerWidth|full|node|does not vary with box-sizing|
insertAfter|full|dom||
insertBefore|full|dom||
is|full|navigation||
keydown|full|shortevent||
keypress|full|shortevent||
keyup|full|shortevent||
last|full|navigation||
load|partial|ajax|details below table|
map|no, may get|||
mousedown|full|shortevent||
mouseenter|full|shortevent||
mouseleave|full|shortevent||
mousemove|full|shortevent||
mouseout|full|shortevent||
mouseover|full|shortevent||
mouseup|full|shortevent||
next|full|navigation||
nextAll|no, may get|||
nextUntil|no, may get|||
not|full|navigation||
odd|full|navigation||
off|full+|event|+ useCapture / options; incompatible with handler false|
offset|no, may get|||
offsetParent|no, may get|||
on|full+|event|+ useCapture / options|
one|no, may get|||
outerHeight|full|node|does not vary with box-sizing|
outerWidth|full|node|does not vary with box-sizing|
parent|full|navigation||
parents|no, may get|||
parentsUntil|no, may get|||
position|no, may get|||
prepend|full|dom||
prependTo|full|dom||
prev|full|navigation||
prevAll|no, may get|||
prevUntil|no, may get|||
promise|no|||
prop|full|node||
pushStack|no|||
queue|no|||
ready|full|shortevent||
remove|full|dom||
removeAttr|full|node||
removeClass|full|node||
removeData|partial|node|uses element dataset instead of internal storage object|
removeProp|full|node||
replaceAll|full|dom||
replaceWith|full|dom||
resize|full|shortevent||
runScripts|new|dom|executes scripts contained in selection tree|
scroll|full|shortevent||
scrollLeft|full|misc||
scrollTop|full|misc||
select|full|shortevent||
serialize|full|ajax|form elements in children are processed too|
serializeArray|full|ajax|form elements in children are processed too|
show|partial|node|just base functionality, no animation|
siblings|no, may get|||
size|full|misc||
slice|full|misc||
slideDown|no|||
slideToggle|no|||
slideUp|no|||
stop|no|||
submit|full|shortevent||
swipe|new|event|executes a callback with the swipe direction|
text|full|dom||
toArray|full|misc||
toggle|partial|node|just base functionality, no animation|
toggleClass|full|node||
trigger|partial+|event|extraParameters - attached to event object, not as listener arguments<br />+ extraEventParameters + customEventType|
triggerHandler|no, may get|||
unique|new|navigation|remove duplicate elements|
unwrap|no, may get|||
val|full|node||
width|full|node|does not vary with box-sizing|
wrap|full|dom||
wrapAll|no, may get|||
wrapInner|no, may get|||
||||
$()|partial|core|does not support $(object)<br />context - if true return only the first match|
$.ajax|partial|ajax|details below table|
$.ajaxPrefilter|no|||
$.ajaxSetup|no|||
$.ajaxTransport|no|||
$.Callbacks|no|||
$.clone|new|misc|clone variable recursively|
$.contains|full|misc||
$.cssHooks|no|||
$.cssNumber|no|||
$.data|full|misc||
$.Deferred|no|||
$.dequeue|no|||
$.each|full|misc||
$.error|no|||
$.escapeSelector|no|||
$.extend|no|||
$.fn.extend|full|misc||
$.fx.*|no|||
$.get|partial|ajax|details below table|
$.getJSON|partial|ajax|details below table|
$.getScript|no|||
$.globalEval|no|||
$.grep|no|||
$.hasData|no|||
$.holdReady|no|||
$.htmlPrefilter|no|||
$.inArray|full|misc||
$.isArray|full|misc||
$.isEmptyObject|partial|misc|empty arrays return true|
$.isFunction|full|misc||
$.isMobile|new|core|returns true if the device is mobile|
$.isNumeric|full|misc||
$.isPlainObject|full|misc||
$.isWindow|no|||
$.isXMLDoc|no|||
$.makeArray|partial|misc|for objects, only their values are kept|
$.map|no, may get|||
$.merge|no, may get|||
$.noConflict|no|||
$.noop|full|misc||
$.now|full|misc||
$.param|full+|ajax|form elements in children are processed too; + parent|
$.parseHTML|partial|core|no context and keepScripts|
$.parseJSON|full|core||
$.parseXML|no, may get|||
$.post|partial|ajax|details below table|
$.queue|no|||
$.ready|no|||
$.readyException|no|||
$.readyData|no|||
$.speed|no|||
$.toCamelCase|new|node|string to camelCase|
$.touchPunch|new|event|enables mouse events simulation from touch events|
$.uniqueSort|no, may get|||
$.when|no|||
||||
$._internal|new|-many-|internal objects and functions described in [New functions](#new-functions)

Scripts in HTML strings are not automatically run for any function (full support functions included). `runScripts()` must be called manually when needed.

Ajax functions have partial support as they do not support: `accepts`, `contents`, `context`, `converters`, `crossDomain`, `dataFilter`, `global`, `ifModified`, `isLocal`, `jsonp`, `jsonpCallback`, `mimeType`, `processData`, `scriptAttrs`, `scriptCharset`, `timeout`, `traditional`, `xhr`, `xhrFields`.
Extra options available from fetch: `referrerPolicy`, `mode`, `credentials`, `redirect`, `integrity`, `keepalive`, `signal`, `window`.

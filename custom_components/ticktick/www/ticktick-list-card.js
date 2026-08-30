/**
 * TickTick List Card
 *
 * A Lovelace card that renders a `sensor.ticktick_*` entity (created by the
 * TickTick Home Assistant integration) the way the TickTick app renders a
 * list: a priority-colored checkbox ring + due-date bucket grouping for
 * TASK-kind lists, and a note/tag-chip layout for NOTE-kind lists. Includes
 * a two-level (primary + secondary) sort control and a filter panel.
 */

// -----------------------------------------------------------------------
// Vendored dependency: SortableJS 1.15.6 (MIT license)
// https://github.com/SortableJS/Sortable
//
// Used below to let the user drag-and-drop reorder the tag group headings
// when grouping by tag (see the Sortable usage inside _render()). Bundled
// inline (rather than as a second served file) so this card stays a
// single self-contained no-build JS file - the integration only ever
// serves ticktick-list-card.js through its dedicated content-type-safe
// view (see TickTickCardView in __init__.py); a second vendored file
// would fall back to the generic static-path handler and risk the exact
// missing-.js-mimetype issue that view was built to work around.
//
// Captured via the standard UMD "CommonJS shim" trick below so the
// unmodified upstream file can be pasted in verbatim: the library detects
// `typeof module !== "undefined"` and assigns its export to
// `module.exports` instead of touching `window`/`globalThis`, so nothing
// here leaks outside this local scope except the `Sortable` binding.
// Do not hand-edit the minified body below - update by replacing it
// wholesale with a newer pinned release instead.
// -----------------------------------------------------------------------
const Sortable = (function () {
  const module = { exports: {} };
  const exports = module.exports;
/*! Sortable 1.15.6 - MIT | git://github.com/SortableJS/Sortable.git */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).Sortable=e()}(this,function(){"use strict";function e(e,t){var n,o=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),o.push.apply(o,n)),o}function I(o){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?e(Object(i),!0).forEach(function(t){var e,n;e=o,t=i[n=t],n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t}):Object.getOwnPropertyDescriptors?Object.defineProperties(o,Object.getOwnPropertyDescriptors(i)):e(Object(i)).forEach(function(t){Object.defineProperty(o,t,Object.getOwnPropertyDescriptor(i,t))})}return o}function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function a(){return(a=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n,o=arguments[e];for(n in o)Object.prototype.hasOwnProperty.call(o,n)&&(t[n]=o[n])}return t}).apply(this,arguments)}function i(t,e){if(null==t)return{};var n,o=function(t,e){if(null==t)return{};for(var n,o={},i=Object.keys(t),r=0;r<i.length;r++)n=i[r],0<=e.indexOf(n)||(o[n]=t[n]);return o}(t,e);if(Object.getOwnPropertySymbols)for(var i=Object.getOwnPropertySymbols(t),r=0;r<i.length;r++)n=i[r],0<=e.indexOf(n)||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n]);return o}function r(t){return function(t){if(Array.isArray(t))return l(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||function(t,e){if(t){if("string"==typeof t)return l(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?l(t,e):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,o=new Array(e);n<e;n++)o[n]=t[n];return o}function t(t){if("undefined"!=typeof window&&window.navigator)return!!navigator.userAgent.match(t)}var y=t(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i),w=t(/Edge/i),s=t(/firefox/i),u=t(/safari/i)&&!t(/chrome/i)&&!t(/android/i),c=t(/iP(ad|od|hone)/i),n=t(/chrome/i)&&t(/android/i),d={capture:!1,passive:!1};function h(t,e,n){t.addEventListener(e,n,!y&&d)}function p(t,e,n){t.removeEventListener(e,n,!y&&d)}function f(t,e){if(e&&(">"===e[0]&&(e=e.substring(1)),t))try{if(t.matches)return t.matches(e);if(t.msMatchesSelector)return t.msMatchesSelector(e);if(t.webkitMatchesSelector)return t.webkitMatchesSelector(e)}catch(t){return}}function g(t){return t.host&&t!==document&&t.host.nodeType?t.host:t.parentNode}function P(t,e,n,o){if(t){n=n||document;do{if(null!=e&&(">"!==e[0]||t.parentNode===n)&&f(t,e)||o&&t===n)return t}while(t!==n&&(t=g(t)))}return null}var m,v=/\s+/g;function k(t,e,n){var o;t&&e&&(t.classList?t.classList[n?"add":"remove"](e):(o=(" "+t.className+" ").replace(v," ").replace(" "+e+" "," "),t.className=(o+(n?" "+e:"")).replace(v," ")))}function R(t,e,n){var o=t&&t.style;if(o){if(void 0===n)return document.defaultView&&document.defaultView.getComputedStyle?n=document.defaultView.getComputedStyle(t,""):t.currentStyle&&(n=t.currentStyle),void 0===e?n:n[e];o[e=!(e in o||-1!==e.indexOf("webkit"))?"-webkit-"+e:e]=n+("string"==typeof n?"":"px")}}function b(t,e){var n="";if("string"==typeof t)n=t;else do{var o=R(t,"transform")}while(o&&"none"!==o&&(n=o+" "+n),!e&&(t=t.parentNode));var i=window.DOMMatrix||window.WebKitCSSMatrix||window.CSSMatrix||window.MSCSSMatrix;return i&&new i(n)}function D(t,e,n){if(t){var o=t.getElementsByTagName(e),i=0,r=o.length;if(n)for(;i<r;i++)n(o[i],i);return o}return[]}function O(){var t=document.scrollingElement;return t||document.documentElement}function X(t,e,n,o,i){if(t.getBoundingClientRect||t===window){var r,a,l,s,c,u,d=t!==window&&t.parentNode&&t!==O()?(a=(r=t.getBoundingClientRect()).top,l=r.left,s=r.bottom,c=r.right,u=r.height,r.width):(l=a=0,s=window.innerHeight,c=window.innerWidth,u=window.innerHeight,window.innerWidth);if((e||n)&&t!==window&&(i=i||t.parentNode,!y))do{if(i&&i.getBoundingClientRect&&("none"!==R(i,"transform")||n&&"static"!==R(i,"position"))){var h=i.getBoundingClientRect();a-=h.top+parseInt(R(i,"border-top-width")),l-=h.left+parseInt(R(i,"border-left-width")),s=a+r.height,c=l+r.width;break}}while(i=i.parentNode);return o&&t!==window&&(o=(e=b(i||t))&&e.a,t=e&&e.d,e&&(s=(a/=t)+(u/=t),c=(l/=o)+(d/=o))),{top:a,left:l,bottom:s,right:c,width:d,height:u}}}function Y(t,e,n){for(var o=M(t,!0),i=X(t)[e];o;){var r=X(o)[n];if(!("top"===n||"left"===n?r<=i:i<=r))return o;if(o===O())break;o=M(o,!1)}return!1}function B(t,e,n,o){for(var i=0,r=0,a=t.children;r<a.length;){if("none"!==a[r].style.display&&a[r]!==jt.ghost&&(o||a[r]!==jt.dragged)&&P(a[r],n.draggable,t,!1)){if(i===e)return a[r];i++}r++}return null}function F(t,e){for(var n=t.lastElementChild;n&&(n===jt.ghost||"none"===R(n,"display")||e&&!f(n,e));)n=n.previousElementSibling;return n||null}function j(t,e){var n=0;if(!t||!t.parentNode)return-1;for(;t=t.previousElementSibling;)"TEMPLATE"===t.nodeName.toUpperCase()||t===jt.clone||e&&!f(t,e)||n++;return n}function E(t){var e=0,n=0,o=O();if(t)do{var i=b(t),r=i.a,i=i.d}while(e+=t.scrollLeft*r,n+=t.scrollTop*i,t!==o&&(t=t.parentNode));return[e,n]}function M(t,e){if(!t||!t.getBoundingClientRect)return O();var n=t,o=!1;do{if(n.clientWidth<n.scrollWidth||n.clientHeight<n.scrollHeight){var i=R(n);if(n.clientWidth<n.scrollWidth&&("auto"==i.overflowX||"scroll"==i.overflowX)||n.clientHeight<n.scrollHeight&&("auto"==i.overflowY||"scroll"==i.overflowY)){if(!n.getBoundingClientRect||n===document.body)return O();if(o||e)return n;o=!0}}}while(n=n.parentNode);return O()}function S(t,e){return Math.round(t.top)===Math.round(e.top)&&Math.round(t.left)===Math.round(e.left)&&Math.round(t.height)===Math.round(e.height)&&Math.round(t.width)===Math.round(e.width)}function _(e,n){return function(){var t;m||(1===(t=arguments).length?e.call(this,t[0]):e.apply(this,t),m=setTimeout(function(){m=void 0},n))}}function H(t,e,n){t.scrollLeft+=e,t.scrollTop+=n}function C(t){var e=window.Polymer,n=window.jQuery||window.Zepto;return e&&e.dom?e.dom(t).cloneNode(!0):n?n(t).clone(!0)[0]:t.cloneNode(!0)}function T(t,e){R(t,"position","absolute"),R(t,"top",e.top),R(t,"left",e.left),R(t,"width",e.width),R(t,"height",e.height)}function x(t){R(t,"position",""),R(t,"top",""),R(t,"left",""),R(t,"width",""),R(t,"height","")}function L(n,o,i){var r={};return Array.from(n.children).forEach(function(t){var e;P(t,o.draggable,n,!1)&&!t.animated&&t!==i&&(e=X(t),r.left=Math.min(null!==(t=r.left)&&void 0!==t?t:1/0,e.left),r.top=Math.min(null!==(t=r.top)&&void 0!==t?t:1/0,e.top),r.right=Math.max(null!==(t=r.right)&&void 0!==t?t:-1/0,e.right),r.bottom=Math.max(null!==(t=r.bottom)&&void 0!==t?t:-1/0,e.bottom))}),r.width=r.right-r.left,r.height=r.bottom-r.top,r.x=r.left,r.y=r.top,r}var K="Sortable"+(new Date).getTime();function A(){var e,o=[];return{captureAnimationState:function(){o=[],this.options.animation&&[].slice.call(this.el.children).forEach(function(t){var e,n;"none"!==R(t,"display")&&t!==jt.ghost&&(o.push({target:t,rect:X(t)}),e=I({},o[o.length-1].rect),!t.thisAnimationDuration||(n=b(t,!0))&&(e.top-=n.f,e.left-=n.e),t.fromRect=e)})},addAnimationState:function(t){o.push(t)},removeAnimationState:function(t){o.splice(function(t,e){for(var n in t)if(t.hasOwnProperty(n))for(var o in e)if(e.hasOwnProperty(o)&&e[o]===t[n][o])return Number(n);return-1}(o,{target:t}),1)},animateAll:function(t){var c=this;if(!this.options.animation)return clearTimeout(e),void("function"==typeof t&&t());var u=!1,d=0;o.forEach(function(t){var e=0,n=t.target,o=n.fromRect,i=X(n),r=n.prevFromRect,a=n.prevToRect,l=t.rect,s=b(n,!0);s&&(i.top-=s.f,i.left-=s.e),n.toRect=i,n.thisAnimationDuration&&S(r,i)&&!S(o,i)&&(l.top-i.top)/(l.left-i.left)==(o.top-i.top)/(o.left-i.left)&&(t=l,s=r,r=a,a=c.options,e=Math.sqrt(Math.pow(s.top-t.top,2)+Math.pow(s.left-t.left,2))/Math.sqrt(Math.pow(s.top-r.top,2)+Math.pow(s.left-r.left,2))*a.animation),S(i,o)||(n.prevFromRect=o,n.prevToRect=i,e=e||c.options.animation,c.animate(n,l,i,e)),e&&(u=!0,d=Math.max(d,e),clearTimeout(n.animationResetTimer),n.animationResetTimer=setTimeout(function(){n.animationTime=0,n.prevFromRect=null,n.fromRect=null,n.prevToRect=null,n.thisAnimationDuration=null},e),n.thisAnimationDuration=e)}),clearTimeout(e),u?e=setTimeout(function(){"function"==typeof t&&t()},d):"function"==typeof t&&t(),o=[]},animate:function(t,e,n,o){var i,r;o&&(R(t,"transition",""),R(t,"transform",""),i=(r=b(this.el))&&r.a,r=r&&r.d,i=(e.left-n.left)/(i||1),r=(e.top-n.top)/(r||1),t.animatingX=!!i,t.animatingY=!!r,R(t,"transform","translate3d("+i+"px,"+r+"px,0)"),this.forRepaintDummy=t.offsetWidth,R(t,"transition","transform "+o+"ms"+(this.options.easing?" "+this.options.easing:"")),R(t,"transform","translate3d(0,0,0)"),"number"==typeof t.animated&&clearTimeout(t.animated),t.animated=setTimeout(function(){R(t,"transition",""),R(t,"transform",""),t.animated=!1,t.animatingX=!1,t.animatingY=!1},o))}}}var N=[],W={initializeByDefault:!0},z={mount:function(e){for(var t in W)!W.hasOwnProperty(t)||t in e||(e[t]=W[t]);N.forEach(function(t){if(t.pluginName===e.pluginName)throw"Sortable: Cannot mount plugin ".concat(e.pluginName," more than once")}),N.push(e)},pluginEvent:function(e,n,o){var t=this;this.eventCanceled=!1,o.cancel=function(){t.eventCanceled=!0};var i=e+"Global";N.forEach(function(t){n[t.pluginName]&&(n[t.pluginName][i]&&n[t.pluginName][i](I({sortable:n},o)),n.options[t.pluginName]&&n[t.pluginName][e]&&n[t.pluginName][e](I({sortable:n},o)))})},initializePlugins:function(n,o,i,t){for(var e in N.forEach(function(t){var e=t.pluginName;(n.options[e]||t.initializeByDefault)&&((t=new t(n,o,n.options)).sortable=n,t.options=n.options,n[e]=t,a(i,t.defaults))}),n.options){var r;n.options.hasOwnProperty(e)&&(void 0!==(r=this.modifyOption(n,e,n.options[e]))&&(n.options[e]=r))}},getEventProperties:function(e,n){var o={};return N.forEach(function(t){"function"==typeof t.eventProperties&&a(o,t.eventProperties.call(n[t.pluginName],e))}),o},modifyOption:function(e,n,o){var i;return N.forEach(function(t){e[t.pluginName]&&t.optionListeners&&"function"==typeof t.optionListeners[n]&&(i=t.optionListeners[n].call(e[t.pluginName],o))}),i}};function G(t){var e=t.sortable,n=t.rootEl,o=t.name,i=t.targetEl,r=t.cloneEl,a=t.toEl,l=t.fromEl,s=t.oldIndex,c=t.newIndex,u=t.oldDraggableIndex,d=t.newDraggableIndex,h=t.originalEvent,p=t.putSortable,f=t.extraEventProperties;if(e=e||n&&n[K]){var g,m=e.options,t="on"+o.charAt(0).toUpperCase()+o.substr(1);!window.CustomEvent||y||w?(g=document.createEvent("Event")).initEvent(o,!0,!0):g=new CustomEvent(o,{bubbles:!0,cancelable:!0}),g.to=a||n,g.from=l||n,g.item=i||n,g.clone=r,g.oldIndex=s,g.newIndex=c,g.oldDraggableIndex=u,g.newDraggableIndex=d,g.originalEvent=h,g.pullMode=p?p.lastPutMode:void 0;var v,b=I(I({},f),z.getEventProperties(o,e));for(v in b)g[v]=b[v];n&&n.dispatchEvent(g),m[t]&&m[t].call(e,g)}}function U(t,e){var n=(o=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{}).evt,o=i(o,q);z.pluginEvent.bind(jt)(t,e,I({dragEl:Z,parentEl:$,ghostEl:Q,rootEl:J,nextEl:tt,lastDownEl:et,cloneEl:nt,cloneHidden:ot,dragStarted:mt,putSortable:ct,activeSortable:jt.active,originalEvent:n,oldIndex:it,oldDraggableIndex:at,newIndex:rt,newDraggableIndex:lt,hideGhostForTarget:Xt,unhideGhostForTarget:Yt,cloneNowHidden:function(){ot=!0},cloneNowShown:function(){ot=!1},dispatchSortableEvent:function(t){V({sortable:e,name:t,originalEvent:n})}},o))}var q=["evt"];function V(t){G(I({putSortable:ct,cloneEl:nt,targetEl:Z,rootEl:J,oldIndex:it,oldDraggableIndex:at,newIndex:rt,newDraggableIndex:lt},t))}var Z,$,Q,J,tt,et,nt,ot,it,rt,at,lt,st,ct,ut,dt,ht,pt,ft,gt,mt,vt,bt,yt,wt,Dt=!1,Et=!1,St=[],_t=!1,Ct=!1,Tt=[],xt=!1,Ot=[],Mt="undefined"!=typeof document,At=c,Nt=w||y?"cssFloat":"float",It=Mt&&!n&&!c&&"draggable"in document.createElement("div"),Pt=function(){if(Mt){if(y)return!1;var t=document.createElement("x");return t.style.cssText="pointer-events:auto","auto"===t.style.pointerEvents}}(),kt=function(t,e){var n=R(t),o=parseInt(n.width)-parseInt(n.paddingLeft)-parseInt(n.paddingRight)-parseInt(n.borderLeftWidth)-parseInt(n.borderRightWidth),i=B(t,0,e),r=B(t,1,e),a=i&&R(i),l=r&&R(r),s=a&&parseInt(a.marginLeft)+parseInt(a.marginRight)+X(i).width,t=l&&parseInt(l.marginLeft)+parseInt(l.marginRight)+X(r).width;if("flex"===n.display)return"column"===n.flexDirection||"column-reverse"===n.flexDirection?"vertical":"horizontal";if("grid"===n.display)return n.gridTemplateColumns.split(" ").length<=1?"vertical":"horizontal";if(i&&a.float&&"none"!==a.float){e="left"===a.float?"left":"right";return!r||"both"!==l.clear&&l.clear!==e?"horizontal":"vertical"}return i&&("block"===a.display||"flex"===a.display||"table"===a.display||"grid"===a.display||o<=s&&"none"===n[Nt]||r&&"none"===n[Nt]&&o<s+t)?"vertical":"horizontal"},Rt=function(t){function l(r,a){return function(t,e,n,o){var i=t.options.group.name&&e.options.group.name&&t.options.group.name===e.options.group.name;if(null==r&&(a||i))return!0;if(null==r||!1===r)return!1;if(a&&"clone"===r)return r;if("function"==typeof r)return l(r(t,e,n,o),a)(t,e,n,o);e=(a?t:e).options.group.name;return!0===r||"string"==typeof r&&r===e||r.join&&-1<r.indexOf(e)}}var e={},n=t.group;n&&"object"==o(n)||(n={name:n}),e.name=n.name,e.checkPull=l(n.pull,!0),e.checkPut=l(n.put),e.revertClone=n.revertClone,t.group=e},Xt=function(){!Pt&&Q&&R(Q,"display","none")},Yt=function(){!Pt&&Q&&R(Q,"display","")};Mt&&!n&&document.addEventListener("click",function(t){if(Et)return t.preventDefault(),t.stopPropagation&&t.stopPropagation(),t.stopImmediatePropagation&&t.stopImmediatePropagation(),Et=!1},!0);function Bt(t){if(Z){t=t.touches?t.touches[0]:t;var e=(i=t.clientX,r=t.clientY,St.some(function(t){var e=t[K].options.emptyInsertThreshold;if(e&&!F(t)){var n=X(t),o=i>=n.left-e&&i<=n.right+e,e=r>=n.top-e&&r<=n.bottom+e;return o&&e?a=t:void 0}}),a);if(e){var n,o={};for(n in t)t.hasOwnProperty(n)&&(o[n]=t[n]);o.target=o.rootEl=e,o.preventDefault=void 0,o.stopPropagation=void 0,e[K]._onDragOver(o)}}var i,r,a}function Ft(t){Z&&Z.parentNode[K]._isOutsideThisEl(t.target)}function jt(t,e){if(!t||!t.nodeType||1!==t.nodeType)throw"Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(t));this.el=t,this.options=e=a({},e),t[K]=this;var n,o,i={group:null,sort:!0,disabled:!1,store:null,handle:null,draggable:/^[uo]l$/i.test(t.nodeName)?">li":">*",swapThreshold:1,invertSwap:!1,invertedSwapThreshold:null,removeCloneOnHide:!0,direction:function(){return kt(t,this.options)},ghostClass:"sortable-ghost",chosenClass:"sortable-chosen",dragClass:"sortable-drag",ignore:"a, img",filter:null,preventOnFilter:!0,animation:0,easing:null,setData:function(t,e){t.setData("Text",e.textContent)},dropBubble:!1,dragoverBubble:!1,dataIdAttr:"data-id",delay:0,delayOnTouchOnly:!1,touchStartThreshold:(Number.parseInt?Number:window).parseInt(window.devicePixelRatio,10)||1,forceFallback:!1,fallbackClass:"sortable-fallback",fallbackOnBody:!1,fallbackTolerance:0,fallbackOffset:{x:0,y:0},supportPointer:!1!==jt.supportPointer&&"PointerEvent"in window&&(!u||c),emptyInsertThreshold:5};for(n in z.initializePlugins(this,t,i),i)n in e||(e[n]=i[n]);for(o in Rt(e),this)"_"===o.charAt(0)&&"function"==typeof this[o]&&(this[o]=this[o].bind(this));this.nativeDraggable=!e.forceFallback&&It,this.nativeDraggable&&(this.options.touchStartThreshold=1),e.supportPointer?h(t,"pointerdown",this._onTapStart):(h(t,"mousedown",this._onTapStart),h(t,"touchstart",this._onTapStart)),this.nativeDraggable&&(h(t,"dragover",this),h(t,"dragenter",this)),St.push(this.el),e.store&&e.store.get&&this.sort(e.store.get(this)||[]),a(this,A())}function Ht(t,e,n,o,i,r,a,l){var s,c,u=t[K],d=u.options.onMove;return!window.CustomEvent||y||w?(s=document.createEvent("Event")).initEvent("move",!0,!0):s=new CustomEvent("move",{bubbles:!0,cancelable:!0}),s.to=e,s.from=t,s.dragged=n,s.draggedRect=o,s.related=i||e,s.relatedRect=r||X(e),s.willInsertAfter=l,s.originalEvent=a,t.dispatchEvent(s),c=d?d.call(u,s,a):c}function Lt(t){t.draggable=!1}function Kt(){xt=!1}function Wt(t){return setTimeout(t,0)}function zt(t){return clearTimeout(t)}jt.prototype={constructor:jt,_isOutsideThisEl:function(t){this.el.contains(t)||t===this.el||(vt=null)},_getDirection:function(t,e){return"function"==typeof this.options.direction?this.options.direction.call(this,t,e,Z):this.options.direction},_onTapStart:function(e){if(e.cancelable){var n=this,o=this.el,t=this.options,i=t.preventOnFilter,r=e.type,a=e.touches&&e.touches[0]||e.pointerType&&"touch"===e.pointerType&&e,l=(a||e).target,s=e.target.shadowRoot&&(e.path&&e.path[0]||e.composedPath&&e.composedPath()[0])||l,c=t.filter;if(!function(t){Ot.length=0;var e=t.getElementsByTagName("input"),n=e.length;for(;n--;){var o=e[n];o.checked&&Ot.push(o)}}(o),!Z&&!(/mousedown|pointerdown/.test(r)&&0!==e.button||t.disabled)&&!s.isContentEditable&&(this.nativeDraggable||!u||!l||"SELECT"!==l.tagName.toUpperCase())&&!((l=P(l,t.draggable,o,!1))&&l.animated||et===l)){if(it=j(l),at=j(l,t.draggable),"function"==typeof c){if(c.call(this,e,l,this))return V({sortable:n,rootEl:s,name:"filter",targetEl:l,toEl:o,fromEl:o}),U("filter",n,{evt:e}),void(i&&e.preventDefault())}else if(c=c&&c.split(",").some(function(t){if(t=P(s,t.trim(),o,!1))return V({sortable:n,rootEl:t,name:"filter",targetEl:l,fromEl:o,toEl:o}),U("filter",n,{evt:e}),!0}))return void(i&&e.preventDefault());t.handle&&!P(s,t.handle,o,!1)||this._prepareDragStart(e,a,l)}}},_prepareDragStart:function(t,e,n){var o,i=this,r=i.el,a=i.options,l=r.ownerDocument;n&&!Z&&n.parentNode===r&&(o=X(n),J=r,$=(Z=n).parentNode,tt=Z.nextSibling,et=n,st=a.group,ut={target:jt.dragged=Z,clientX:(e||t).clientX,clientY:(e||t).clientY},ft=ut.clientX-o.left,gt=ut.clientY-o.top,this._lastX=(e||t).clientX,this._lastY=(e||t).clientY,Z.style["will-change"]="all",o=function(){U("delayEnded",i,{evt:t}),jt.eventCanceled?i._onDrop():(i._disableDelayedDragEvents(),!s&&i.nativeDraggable&&(Z.draggable=!0),i._triggerDragStart(t,e),V({sortable:i,name:"choose",originalEvent:t}),k(Z,a.chosenClass,!0))},a.ignore.split(",").forEach(function(t){D(Z,t.trim(),Lt)}),h(l,"dragover",Bt),h(l,"mousemove",Bt),h(l,"touchmove",Bt),a.supportPointer?(h(l,"pointerup",i._onDrop),this.nativeDraggable||h(l,"pointercancel",i._onDrop)):(h(l,"mouseup",i._onDrop),h(l,"touchend",i._onDrop),h(l,"touchcancel",i._onDrop)),s&&this.nativeDraggable&&(this.options.touchStartThreshold=4,Z.draggable=!0),U("delayStart",this,{evt:t}),!a.delay||a.delayOnTouchOnly&&!e||this.nativeDraggable&&(w||y)?o():jt.eventCanceled?this._onDrop():(a.supportPointer?(h(l,"pointerup",i._disableDelayedDrag),h(l,"pointercancel",i._disableDelayedDrag)):(h(l,"mouseup",i._disableDelayedDrag),h(l,"touchend",i._disableDelayedDrag),h(l,"touchcancel",i._disableDelayedDrag)),h(l,"mousemove",i._delayedDragTouchMoveHandler),h(l,"touchmove",i._delayedDragTouchMoveHandler),a.supportPointer&&h(l,"pointermove",i._delayedDragTouchMoveHandler),i._dragStartTimer=setTimeout(o,a.delay)))},_delayedDragTouchMoveHandler:function(t){t=t.touches?t.touches[0]:t;Math.max(Math.abs(t.clientX-this._lastX),Math.abs(t.clientY-this._lastY))>=Math.floor(this.options.touchStartThreshold/(this.nativeDraggable&&window.devicePixelRatio||1))&&this._disableDelayedDrag()},_disableDelayedDrag:function(){Z&&Lt(Z),clearTimeout(this._dragStartTimer),this._disableDelayedDragEvents()},_disableDelayedDragEvents:function(){var t=this.el.ownerDocument;p(t,"mouseup",this._disableDelayedDrag),p(t,"touchend",this._disableDelayedDrag),p(t,"touchcancel",this._disableDelayedDrag),p(t,"pointerup",this._disableDelayedDrag),p(t,"pointercancel",this._disableDelayedDrag),p(t,"mousemove",this._delayedDragTouchMoveHandler),p(t,"touchmove",this._delayedDragTouchMoveHandler),p(t,"pointermove",this._delayedDragTouchMoveHandler)},_triggerDragStart:function(t,e){e=e||"touch"==t.pointerType&&t,!this.nativeDraggable||e?this.options.supportPointer?h(document,"pointermove",this._onTouchMove):h(document,e?"touchmove":"mousemove",this._onTouchMove):(h(Z,"dragend",this),h(J,"dragstart",this._onDragStart));try{document.selection?Wt(function(){document.selection.empty()}):window.getSelection().removeAllRanges()}catch(t){}},_dragStarted:function(t,e){var n;Dt=!1,J&&Z?(U("dragStarted",this,{evt:e}),this.nativeDraggable&&h(document,"dragover",Ft),n=this.options,t||k(Z,n.dragClass,!1),k(Z,n.ghostClass,!0),jt.active=this,t&&this._appendGhost(),V({sortable:this,name:"start",originalEvent:e})):this._nulling()},_emulateDragOver:function(){if(dt){this._lastX=dt.clientX,this._lastY=dt.clientY,Xt();for(var t=document.elementFromPoint(dt.clientX,dt.clientY),e=t;t&&t.shadowRoot&&(t=t.shadowRoot.elementFromPoint(dt.clientX,dt.clientY))!==e;)e=t;if(Z.parentNode[K]._isOutsideThisEl(t),e)do{if(e[K])if(e[K]._onDragOver({clientX:dt.clientX,clientY:dt.clientY,target:t,rootEl:e})&&!this.options.dragoverBubble)break}while(e=g(t=e));Yt()}},_onTouchMove:function(t){if(ut){var e=this.options,n=e.fallbackTolerance,o=e.fallbackOffset,i=t.touches?t.touches[0]:t,r=Q&&b(Q,!0),a=Q&&r&&r.a,l=Q&&r&&r.d,e=At&&wt&&E(wt),a=(i.clientX-ut.clientX+o.x)/(a||1)+(e?e[0]-Tt[0]:0)/(a||1),l=(i.clientY-ut.clientY+o.y)/(l||1)+(e?e[1]-Tt[1]:0)/(l||1);if(!jt.active&&!Dt){if(n&&Math.max(Math.abs(i.clientX-this._lastX),Math.abs(i.clientY-this._lastY))<n)return;this._onDragStart(t,!0)}Q&&(r?(r.e+=a-(ht||0),r.f+=l-(pt||0)):r={a:1,b:0,c:0,d:1,e:a,f:l},r="matrix(".concat(r.a,",").concat(r.b,",").concat(r.c,",").concat(r.d,",").concat(r.e,",").concat(r.f,")"),R(Q,"webkitTransform",r),R(Q,"mozTransform",r),R(Q,"msTransform",r),R(Q,"transform",r),ht=a,pt=l,dt=i),t.cancelable&&t.preventDefault()}},_appendGhost:function(){if(!Q){var t=this.options.fallbackOnBody?document.body:J,e=X(Z,!0,At,!0,t),n=this.options;if(At){for(wt=t;"static"===R(wt,"position")&&"none"===R(wt,"transform")&&wt!==document;)wt=wt.parentNode;wt!==document.body&&wt!==document.documentElement?(wt===document&&(wt=O()),e.top+=wt.scrollTop,e.left+=wt.scrollLeft):wt=O(),Tt=E(wt)}k(Q=Z.cloneNode(!0),n.ghostClass,!1),k(Q,n.fallbackClass,!0),k(Q,n.dragClass,!0),R(Q,"transition",""),R(Q,"transform",""),R(Q,"box-sizing","border-box"),R(Q,"margin",0),R(Q,"top",e.top),R(Q,"left",e.left),R(Q,"width",e.width),R(Q,"height",e.height),R(Q,"opacity","0.8"),R(Q,"position",At?"absolute":"fixed"),R(Q,"zIndex","100000"),R(Q,"pointerEvents","none"),jt.ghost=Q,t.appendChild(Q),R(Q,"transform-origin",ft/parseInt(Q.style.width)*100+"% "+gt/parseInt(Q.style.height)*100+"%")}},_onDragStart:function(t,e){var n=this,o=t.dataTransfer,i=n.options;U("dragStart",this,{evt:t}),jt.eventCanceled?this._onDrop():(U("setupClone",this),jt.eventCanceled||((nt=C(Z)).removeAttribute("id"),nt.draggable=!1,nt.style["will-change"]="",this._hideClone(),k(nt,this.options.chosenClass,!1),jt.clone=nt),n.cloneId=Wt(function(){U("clone",n),jt.eventCanceled||(n.options.removeCloneOnHide||J.insertBefore(nt,Z),n._hideClone(),V({sortable:n,name:"clone"}))}),e||k(Z,i.dragClass,!0),e?(Et=!0,n._loopId=setInterval(n._emulateDragOver,50)):(p(document,"mouseup",n._onDrop),p(document,"touchend",n._onDrop),p(document,"touchcancel",n._onDrop),o&&(o.effectAllowed="move",i.setData&&i.setData.call(n,o,Z)),h(document,"drop",n),R(Z,"transform","translateZ(0)")),Dt=!0,n._dragStartId=Wt(n._dragStarted.bind(n,e,t)),h(document,"selectstart",n),mt=!0,window.getSelection().removeAllRanges(),u&&R(document.body,"user-select","none"))},_onDragOver:function(n){var o,i,r,t,e,a=this.el,l=n.target,s=this.options,c=s.group,u=jt.active,d=st===c,h=s.sort,p=ct||u,f=this,g=!1;if(!xt){if(void 0!==n.preventDefault&&n.cancelable&&n.preventDefault(),l=P(l,s.draggable,a,!0),O("dragOver"),jt.eventCanceled)return g;if(Z.contains(n.target)||l.animated&&l.animatingX&&l.animatingY||f._ignoreWhileAnimating===l)return A(!1);if(Et=!1,u&&!s.disabled&&(d?h||(i=$!==J):ct===this||(this.lastPutMode=st.checkPull(this,u,Z,n))&&c.checkPut(this,u,Z,n))){if(r="vertical"===this._getDirection(n,l),o=X(Z),O("dragOverValid"),jt.eventCanceled)return g;if(i)return $=J,M(),this._hideClone(),O("revert"),jt.eventCanceled||(tt?J.insertBefore(Z,tt):J.appendChild(Z)),A(!0);var m=F(a,s.draggable);if(m&&(S=n,c=r,x=X(F((E=this).el,E.options.draggable)),E=L(E.el,E.options,Q),!(c?S.clientX>E.right+10||S.clientY>x.bottom&&S.clientX>x.left:S.clientY>E.bottom+10||S.clientX>x.right&&S.clientY>x.top)||m.animated)){if(m&&(t=n,e=r,C=X(B((_=this).el,0,_.options,!0)),_=L(_.el,_.options,Q),e?t.clientX<_.left-10||t.clientY<C.top&&t.clientX<C.right:t.clientY<_.top-10||t.clientY<C.bottom&&t.clientX<C.left)){var v=B(a,0,s,!0);if(v===Z)return A(!1);if(D=X(l=v),!1!==Ht(J,a,Z,o,l,D,n,!1))return M(),a.insertBefore(Z,v),$=a,N(),A(!0)}else if(l.parentNode===a){var b,y,w,D=X(l),E=Z.parentNode!==a,S=(S=Z.animated&&Z.toRect||o,x=l.animated&&l.toRect||D,_=(e=r)?S.left:S.top,t=e?S.right:S.bottom,C=e?S.width:S.height,v=e?x.left:x.top,S=e?x.right:x.bottom,x=e?x.width:x.height,!(_===v||t===S||_+C/2===v+x/2)),_=r?"top":"left",C=Y(l,"top","top")||Y(Z,"top","top"),v=C?C.scrollTop:void 0;if(vt!==l&&(y=D[_],_t=!1,Ct=!S&&s.invertSwap||E),0!==(b=function(t,e,n,o,i,r,a,l){var s=o?t.clientY:t.clientX,c=o?n.height:n.width,t=o?n.top:n.left,o=o?n.bottom:n.right,n=!1;if(!a)if(l&&yt<c*i){if(_t=!_t&&(1===bt?t+c*r/2<s:s<o-c*r/2)?!0:_t)n=!0;else if(1===bt?s<t+yt:o-yt<s)return-bt}else if(t+c*(1-i)/2<s&&s<o-c*(1-i)/2)return function(t){return j(Z)<j(t)?1:-1}(e);if((n=n||a)&&(s<t+c*r/2||o-c*r/2<s))return t+c/2<s?1:-1;return 0}(n,l,D,r,S?1:s.swapThreshold,null==s.invertedSwapThreshold?s.swapThreshold:s.invertedSwapThreshold,Ct,vt===l)))for(var T=j(Z);(w=$.children[T-=b])&&("none"===R(w,"display")||w===Q););if(0===b||w===l)return A(!1);bt=b;var x=(vt=l).nextElementSibling,E=!1,S=Ht(J,a,Z,o,l,D,n,E=1===b);if(!1!==S)return 1!==S&&-1!==S||(E=1===S),xt=!0,setTimeout(Kt,30),M(),E&&!x?a.appendChild(Z):l.parentNode.insertBefore(Z,E?x:l),C&&H(C,0,v-C.scrollTop),$=Z.parentNode,void 0===y||Ct||(yt=Math.abs(y-X(l)[_])),N(),A(!0)}}else{if(m===Z)return A(!1);if((l=m&&a===n.target?m:l)&&(D=X(l)),!1!==Ht(J,a,Z,o,l,D,n,!!l))return M(),m&&m.nextSibling?a.insertBefore(Z,m.nextSibling):a.appendChild(Z),$=a,N(),A(!0)}if(a.contains(Z))return A(!1)}return!1}function O(t,e){U(t,f,I({evt:n,isOwner:d,axis:r?"vertical":"horizontal",revert:i,dragRect:o,targetRect:D,canSort:h,fromSortable:p,target:l,completed:A,onMove:function(t,e){return Ht(J,a,Z,o,t,X(t),n,e)},changed:N},e))}function M(){O("dragOverAnimationCapture"),f.captureAnimationState(),f!==p&&p.captureAnimationState()}function A(t){return O("dragOverCompleted",{insertion:t}),t&&(d?u._hideClone():u._showClone(f),f!==p&&(k(Z,(ct||u).options.ghostClass,!1),k(Z,s.ghostClass,!0)),ct!==f&&f!==jt.active?ct=f:f===jt.active&&ct&&(ct=null),p===f&&(f._ignoreWhileAnimating=l),f.animateAll(function(){O("dragOverAnimationComplete"),f._ignoreWhileAnimating=null}),f!==p&&(p.animateAll(),p._ignoreWhileAnimating=null)),(l===Z&&!Z.animated||l===a&&!l.animated)&&(vt=null),s.dragoverBubble||n.rootEl||l===document||(Z.parentNode[K]._isOutsideThisEl(n.target),t||Bt(n)),!s.dragoverBubble&&n.stopPropagation&&n.stopPropagation(),g=!0}function N(){rt=j(Z),lt=j(Z,s.draggable),V({sortable:f,name:"change",toEl:a,newIndex:rt,newDraggableIndex:lt,originalEvent:n})}},_ignoreWhileAnimating:null,_offMoveEvents:function(){p(document,"mousemove",this._onTouchMove),p(document,"touchmove",this._onTouchMove),p(document,"pointermove",this._onTouchMove),p(document,"dragover",Bt),p(document,"mousemove",Bt),p(document,"touchmove",Bt)},_offUpEvents:function(){var t=this.el.ownerDocument;p(t,"mouseup",this._onDrop),p(t,"touchend",this._onDrop),p(t,"pointerup",this._onDrop),p(t,"pointercancel",this._onDrop),p(t,"touchcancel",this._onDrop),p(document,"selectstart",this)},_onDrop:function(t){var e=this.el,n=this.options;rt=j(Z),lt=j(Z,n.draggable),U("drop",this,{evt:t}),$=Z&&Z.parentNode,rt=j(Z),lt=j(Z,n.draggable),jt.eventCanceled||(_t=Ct=Dt=!1,clearInterval(this._loopId),clearTimeout(this._dragStartTimer),zt(this.cloneId),zt(this._dragStartId),this.nativeDraggable&&(p(document,"drop",this),p(e,"dragstart",this._onDragStart)),this._offMoveEvents(),this._offUpEvents(),u&&R(document.body,"user-select",""),R(Z,"transform",""),t&&(mt&&(t.cancelable&&t.preventDefault(),n.dropBubble||t.stopPropagation()),Q&&Q.parentNode&&Q.parentNode.removeChild(Q),(J===$||ct&&"clone"!==ct.lastPutMode)&&nt&&nt.parentNode&&nt.parentNode.removeChild(nt),Z&&(this.nativeDraggable&&p(Z,"dragend",this),Lt(Z),Z.style["will-change"]="",mt&&!Dt&&k(Z,(ct||this).options.ghostClass,!1),k(Z,this.options.chosenClass,!1),V({sortable:this,name:"unchoose",toEl:$,newIndex:null,newDraggableIndex:null,originalEvent:t}),J!==$?(0<=rt&&(V({rootEl:$,name:"add",toEl:$,fromEl:J,originalEvent:t}),V({sortable:this,name:"remove",toEl:$,originalEvent:t}),V({rootEl:$,name:"sort",toEl:$,fromEl:J,originalEvent:t}),V({sortable:this,name:"sort",toEl:$,originalEvent:t})),ct&&ct.save()):rt!==it&&0<=rt&&(V({sortable:this,name:"update",toEl:$,originalEvent:t}),V({sortable:this,name:"sort",toEl:$,originalEvent:t})),jt.active&&(null!=rt&&-1!==rt||(rt=it,lt=at),V({sortable:this,name:"end",toEl:$,originalEvent:t}),this.save())))),this._nulling()},_nulling:function(){U("nulling",this),J=Z=$=Q=tt=nt=et=ot=ut=dt=mt=rt=lt=it=at=vt=bt=ct=st=jt.dragged=jt.ghost=jt.clone=jt.active=null,Ot.forEach(function(t){t.checked=!0}),Ot.length=ht=pt=0},handleEvent:function(t){switch(t.type){case"drop":case"dragend":this._onDrop(t);break;case"dragenter":case"dragover":Z&&(this._onDragOver(t),function(t){t.dataTransfer&&(t.dataTransfer.dropEffect="move");t.cancelable&&t.preventDefault()}(t));break;case"selectstart":t.preventDefault()}},toArray:function(){for(var t,e=[],n=this.el.children,o=0,i=n.length,r=this.options;o<i;o++)P(t=n[o],r.draggable,this.el,!1)&&e.push(t.getAttribute(r.dataIdAttr)||function(t){var e=t.tagName+t.className+t.src+t.href+t.textContent,n=e.length,o=0;for(;n--;)o+=e.charCodeAt(n);return o.toString(36)}(t));return e},sort:function(t,e){var n={},o=this.el;this.toArray().forEach(function(t,e){e=o.children[e];P(e,this.options.draggable,o,!1)&&(n[t]=e)},this),e&&this.captureAnimationState(),t.forEach(function(t){n[t]&&(o.removeChild(n[t]),o.appendChild(n[t]))}),e&&this.animateAll()},save:function(){var t=this.options.store;t&&t.set&&t.set(this)},closest:function(t,e){return P(t,e||this.options.draggable,this.el,!1)},option:function(t,e){var n=this.options;if(void 0===e)return n[t];var o=z.modifyOption(this,t,e);n[t]=void 0!==o?o:e,"group"===t&&Rt(n)},destroy:function(){U("destroy",this);var t=this.el;t[K]=null,p(t,"mousedown",this._onTapStart),p(t,"touchstart",this._onTapStart),p(t,"pointerdown",this._onTapStart),this.nativeDraggable&&(p(t,"dragover",this),p(t,"dragenter",this)),Array.prototype.forEach.call(t.querySelectorAll("[draggable]"),function(t){t.removeAttribute("draggable")}),this._onDrop(),this._disableDelayedDragEvents(),St.splice(St.indexOf(this.el),1),this.el=t=null},_hideClone:function(){ot||(U("hideClone",this),jt.eventCanceled||(R(nt,"display","none"),this.options.removeCloneOnHide&&nt.parentNode&&nt.parentNode.removeChild(nt),ot=!0))},_showClone:function(t){"clone"===t.lastPutMode?ot&&(U("showClone",this),jt.eventCanceled||(Z.parentNode!=J||this.options.group.revertClone?tt?J.insertBefore(nt,tt):J.appendChild(nt):J.insertBefore(nt,Z),this.options.group.revertClone&&this.animate(Z,nt),R(nt,"display",""),ot=!1)):this._hideClone()}},Mt&&h(document,"touchmove",function(t){(jt.active||Dt)&&t.cancelable&&t.preventDefault()}),jt.utils={on:h,off:p,css:R,find:D,is:function(t,e){return!!P(t,e,t,!1)},extend:function(t,e){if(t&&e)for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t},throttle:_,closest:P,toggleClass:k,clone:C,index:j,nextTick:Wt,cancelNextTick:zt,detectDirection:kt,getChild:B,expando:K},jt.get=function(t){return t[K]},jt.mount=function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];(e=e[0].constructor===Array?e[0]:e).forEach(function(t){if(!t.prototype||!t.prototype.constructor)throw"Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(t));t.utils&&(jt.utils=I(I({},jt.utils),t.utils)),z.mount(t)})},jt.create=function(t,e){return new jt(t,e)};var Gt,Ut,qt,Vt,Zt,$t,Qt=[],Jt=!(jt.version="1.15.6");function te(){Qt.forEach(function(t){clearInterval(t.pid)}),Qt=[]}function ee(){clearInterval($t)}var ne,oe=_(function(n,t,e,o){if(t.scroll){var i,r=(n.touches?n.touches[0]:n).clientX,a=(n.touches?n.touches[0]:n).clientY,l=t.scrollSensitivity,s=t.scrollSpeed,c=O(),u=!1;Ut!==e&&(Ut=e,te(),Gt=t.scroll,i=t.scrollFn,!0===Gt&&(Gt=M(e,!0)));var d=0,h=Gt;do{var p=h,f=X(p),g=f.top,m=f.bottom,v=f.left,b=f.right,y=f.width,w=f.height,D=void 0,E=void 0,S=p.scrollWidth,_=p.scrollHeight,C=R(p),T=p.scrollLeft,f=p.scrollTop,E=p===c?(D=y<S&&("auto"===C.overflowX||"scroll"===C.overflowX||"visible"===C.overflowX),w<_&&("auto"===C.overflowY||"scroll"===C.overflowY||"visible"===C.overflowY)):(D=y<S&&("auto"===C.overflowX||"scroll"===C.overflowX),w<_&&("auto"===C.overflowY||"scroll"===C.overflowY)),T=D&&(Math.abs(b-r)<=l&&T+y<S)-(Math.abs(v-r)<=l&&!!T),f=E&&(Math.abs(m-a)<=l&&f+w<_)-(Math.abs(g-a)<=l&&!!f);if(!Qt[d])for(var x=0;x<=d;x++)Qt[x]||(Qt[x]={});Qt[d].vx==T&&Qt[d].vy==f&&Qt[d].el===p||(Qt[d].el=p,Qt[d].vx=T,Qt[d].vy=f,clearInterval(Qt[d].pid),0==T&&0==f||(u=!0,Qt[d].pid=setInterval(function(){o&&0===this.layer&&jt.active._onTouchMove(Zt);var t=Qt[this.layer].vy?Qt[this.layer].vy*s:0,e=Qt[this.layer].vx?Qt[this.layer].vx*s:0;"function"==typeof i&&"continue"!==i.call(jt.dragged.parentNode[K],e,t,n,Zt,Qt[this.layer].el)||H(Qt[this.layer].el,e,t)}.bind({layer:d}),24))),d++}while(t.bubbleScroll&&h!==c&&(h=M(h,!1)));Jt=u}},30),n=function(t){var e=t.originalEvent,n=t.putSortable,o=t.dragEl,i=t.activeSortable,r=t.dispatchSortableEvent,a=t.hideGhostForTarget,t=t.unhideGhostForTarget;e&&(i=n||i,a(),e=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:e,e=document.elementFromPoint(e.clientX,e.clientY),t(),i&&!i.el.contains(e)&&(r("spill"),this.onSpill({dragEl:o,putSortable:n})))};function ie(){}function re(){}ie.prototype={startIndex:null,dragStart:function(t){t=t.oldDraggableIndex;this.startIndex=t},onSpill:function(t){var e=t.dragEl,n=t.putSortable;this.sortable.captureAnimationState(),n&&n.captureAnimationState();t=B(this.sortable.el,this.startIndex,this.options);t?this.sortable.el.insertBefore(e,t):this.sortable.el.appendChild(e),this.sortable.animateAll(),n&&n.animateAll()},drop:n},a(ie,{pluginName:"revertOnSpill"}),re.prototype={onSpill:function(t){var e=t.dragEl,t=t.putSortable||this.sortable;t.captureAnimationState(),e.parentNode&&e.parentNode.removeChild(e),t.animateAll()},drop:n},a(re,{pluginName:"removeOnSpill"});var ae,le,se,ce,ue,de=[],he=[],pe=!1,fe=!1,ge=!1;function me(n,o){he.forEach(function(t,e){e=o.children[t.sortableIndex+(n?Number(e):0)];e?o.insertBefore(t,e):o.appendChild(t)})}function ve(){de.forEach(function(t){t!==se&&t.parentNode&&t.parentNode.removeChild(t)})}return jt.mount(new function(){function t(){for(var t in this.defaults={scroll:!0,forceAutoScrollFallback:!1,scrollSensitivity:30,scrollSpeed:10,bubbleScroll:!0},this)"_"===t.charAt(0)&&"function"==typeof this[t]&&(this[t]=this[t].bind(this))}return t.prototype={dragStarted:function(t){t=t.originalEvent;this.sortable.nativeDraggable?h(document,"dragover",this._handleAutoScroll):this.options.supportPointer?h(document,"pointermove",this._handleFallbackAutoScroll):t.touches?h(document,"touchmove",this._handleFallbackAutoScroll):h(document,"mousemove",this._handleFallbackAutoScroll)},dragOverCompleted:function(t){t=t.originalEvent;this.options.dragOverBubble||t.rootEl||this._handleAutoScroll(t)},drop:function(){this.sortable.nativeDraggable?p(document,"dragover",this._handleAutoScroll):(p(document,"pointermove",this._handleFallbackAutoScroll),p(document,"touchmove",this._handleFallbackAutoScroll),p(document,"mousemove",this._handleFallbackAutoScroll)),ee(),te(),clearTimeout(m),m=void 0},nulling:function(){Zt=Ut=Gt=Jt=$t=qt=Vt=null,Qt.length=0},_handleFallbackAutoScroll:function(t){this._handleAutoScroll(t,!0)},_handleAutoScroll:function(e,n){var o,i=this,r=(e.touches?e.touches[0]:e).clientX,a=(e.touches?e.touches[0]:e).clientY,t=document.elementFromPoint(r,a);Zt=e,n||this.options.forceAutoScrollFallback||w||y||u?(oe(e,this.options,t,n),o=M(t,!0),!Jt||$t&&r===qt&&a===Vt||($t&&ee(),$t=setInterval(function(){var t=M(document.elementFromPoint(r,a),!0);t!==o&&(o=t,te()),oe(e,i.options,t,n)},10),qt=r,Vt=a)):this.options.bubbleScroll&&M(t,!0)!==O()?oe(e,this.options,M(t,!1),!1):te()}},a(t,{pluginName:"scroll",initializeByDefault:!0})}),jt.mount(re,ie),jt.mount(new function(){function t(){this.defaults={swapClass:"sortable-swap-highlight"}}return t.prototype={dragStart:function(t){t=t.dragEl;ne=t},dragOverValid:function(t){var e=t.completed,n=t.target,o=t.onMove,i=t.activeSortable,r=t.changed,a=t.cancel;i.options.swap&&(t=this.sortable.el,i=this.options,n&&n!==t&&(t=ne,ne=!1!==o(n)?(k(n,i.swapClass,!0),n):null,t&&t!==ne&&k(t,i.swapClass,!1)),r(),e(!0),a())},drop:function(t){var e,n,o=t.activeSortable,i=t.putSortable,r=t.dragEl,a=i||this.sortable,l=this.options;ne&&k(ne,l.swapClass,!1),ne&&(l.swap||i&&i.options.swap)&&r!==ne&&(a.captureAnimationState(),a!==o&&o.captureAnimationState(),n=ne,t=(e=r).parentNode,l=n.parentNode,t&&l&&!t.isEqualNode(n)&&!l.isEqualNode(e)&&(i=j(e),r=j(n),t.isEqualNode(l)&&i<r&&r++,t.insertBefore(n,t.children[i]),l.insertBefore(e,l.children[r])),a.animateAll(),a!==o&&o.animateAll())},nulling:function(){ne=null}},a(t,{pluginName:"swap",eventProperties:function(){return{swapItem:ne}}})}),jt.mount(new function(){function t(o){for(var t in this)"_"===t.charAt(0)&&"function"==typeof this[t]&&(this[t]=this[t].bind(this));o.options.avoidImplicitDeselect||(o.options.supportPointer?h(document,"pointerup",this._deselectMultiDrag):(h(document,"mouseup",this._deselectMultiDrag),h(document,"touchend",this._deselectMultiDrag))),h(document,"keydown",this._checkKeyDown),h(document,"keyup",this._checkKeyUp),this.defaults={selectedClass:"sortable-selected",multiDragKey:null,avoidImplicitDeselect:!1,setData:function(t,e){var n="";de.length&&le===o?de.forEach(function(t,e){n+=(e?", ":"")+t.textContent}):n=e.textContent,t.setData("Text",n)}}}return t.prototype={multiDragKeyDown:!1,isMultiDrag:!1,delayStartGlobal:function(t){t=t.dragEl;se=t},delayEnded:function(){this.isMultiDrag=~de.indexOf(se)},setupClone:function(t){var e=t.sortable,t=t.cancel;if(this.isMultiDrag){for(var n=0;n<de.length;n++)he.push(C(de[n])),he[n].sortableIndex=de[n].sortableIndex,he[n].draggable=!1,he[n].style["will-change"]="",k(he[n],this.options.selectedClass,!1),de[n]===se&&k(he[n],this.options.chosenClass,!1);e._hideClone(),t()}},clone:function(t){var e=t.sortable,n=t.rootEl,o=t.dispatchSortableEvent,t=t.cancel;this.isMultiDrag&&(this.options.removeCloneOnHide||de.length&&le===e&&(me(!0,n),o("clone"),t()))},showClone:function(t){var e=t.cloneNowShown,n=t.rootEl,t=t.cancel;this.isMultiDrag&&(me(!1,n),he.forEach(function(t){R(t,"display","")}),e(),ue=!1,t())},hideClone:function(t){var e=this,n=(t.sortable,t.cloneNowHidden),t=t.cancel;this.isMultiDrag&&(he.forEach(function(t){R(t,"display","none"),e.options.removeCloneOnHide&&t.parentNode&&t.parentNode.removeChild(t)}),n(),ue=!0,t())},dragStartGlobal:function(t){t.sortable;!this.isMultiDrag&&le&&le.multiDrag._deselectMultiDrag(),de.forEach(function(t){t.sortableIndex=j(t)}),de=de.sort(function(t,e){return t.sortableIndex-e.sortableIndex}),ge=!0},dragStarted:function(t){var e,n=this,t=t.sortable;this.isMultiDrag&&(this.options.sort&&(t.captureAnimationState(),this.options.animation&&(de.forEach(function(t){t!==se&&R(t,"position","absolute")}),e=X(se,!1,!0,!0),de.forEach(function(t){t!==se&&T(t,e)}),pe=fe=!0)),t.animateAll(function(){pe=fe=!1,n.options.animation&&de.forEach(function(t){x(t)}),n.options.sort&&ve()}))},dragOver:function(t){var e=t.target,n=t.completed,t=t.cancel;fe&&~de.indexOf(e)&&(n(!1),t())},revert:function(t){var n,o,e=t.fromSortable,i=t.rootEl,r=t.sortable,a=t.dragRect;1<de.length&&(de.forEach(function(t){r.addAnimationState({target:t,rect:fe?X(t):a}),x(t),t.fromRect=a,e.removeAnimationState(t)}),fe=!1,n=!this.options.removeCloneOnHide,o=i,de.forEach(function(t,e){e=o.children[t.sortableIndex+(n?Number(e):0)];e?o.insertBefore(t,e):o.appendChild(t)}))},dragOverCompleted:function(t){var e,n=t.sortable,o=t.isOwner,i=t.insertion,r=t.activeSortable,a=t.parentEl,l=t.putSortable,t=this.options;i&&(o&&r._hideClone(),pe=!1,t.animation&&1<de.length&&(fe||!o&&!r.options.sort&&!l)&&(e=X(se,!1,!0,!0),de.forEach(function(t){t!==se&&(T(t,e),a.appendChild(t))}),fe=!0),o||(fe||ve(),1<de.length?(o=ue,r._showClone(n),r.options.animation&&!ue&&o&&he.forEach(function(t){r.addAnimationState({target:t,rect:ce}),t.fromRect=ce,t.thisAnimationDuration=null})):r._showClone(n)))},dragOverAnimationCapture:function(t){var e=t.dragRect,n=t.isOwner,t=t.activeSortable;de.forEach(function(t){t.thisAnimationDuration=null}),t.options.animation&&!n&&t.multiDrag.isMultiDrag&&(ce=a({},e),e=b(se,!0),ce.top-=e.f,ce.left-=e.e)},dragOverAnimationComplete:function(){fe&&(fe=!1,ve())},drop:function(t){var o,i,r,a,n,e,l,s=t.originalEvent,c=t.rootEl,u=t.parentEl,d=t.sortable,h=t.dispatchSortableEvent,p=t.oldIndex,t=t.putSortable,f=t||this.sortable;s&&(o=this.options,i=u.children,ge||(o.multiDragKey&&!this.multiDragKeyDown&&this._deselectMultiDrag(),k(se,o.selectedClass,!~de.indexOf(se)),~de.indexOf(se)?(de.splice(de.indexOf(se),1),ae=null,G({sortable:d,rootEl:c,name:"deselect",targetEl:se,originalEvent:s})):(de.push(se),G({sortable:d,rootEl:c,name:"select",targetEl:se,originalEvent:s}),s.shiftKey&&ae&&d.el.contains(ae)?(r=j(ae),a=j(se),~r&&~a&&r!==a&&function(){for(var e,t=r<a?(e=r,a):(e=a,r+1),n=o.filter;e<t;e++)~de.indexOf(i[e])||P(i[e],o.draggable,u,!1)&&(n&&("function"==typeof n?n.call(d,s,i[e],d):n.split(",").some(function(t){return P(i[e],t.trim(),u,!1)}))||(k(i[e],o.selectedClass,!0),de.push(i[e]),G({sortable:d,rootEl:c,name:"select",targetEl:i[e],originalEvent:s})))}()):ae=se,le=f)),ge&&this.isMultiDrag&&(fe=!1,(u[K].options.sort||u!==c)&&1<de.length&&(n=X(se),e=j(se,":not(."+this.options.selectedClass+")"),!pe&&o.animation&&(se.thisAnimationDuration=null),f.captureAnimationState(),pe||(o.animation&&(se.fromRect=n,de.forEach(function(t){var e;t.thisAnimationDuration=null,t!==se&&(e=fe?X(t):n,t.fromRect=e,f.addAnimationState({target:t,rect:e}))})),ve(),de.forEach(function(t){i[e]?u.insertBefore(t,i[e]):u.appendChild(t),e++}),p===j(se)&&(l=!1,de.forEach(function(t){t.sortableIndex!==j(t)&&(l=!0)}),l&&(h("update"),h("sort")))),de.forEach(function(t){x(t)}),f.animateAll()),le=f),(c===u||t&&"clone"!==t.lastPutMode)&&he.forEach(function(t){t.parentNode&&t.parentNode.removeChild(t)}))},nullingGlobal:function(){this.isMultiDrag=ge=!1,he.length=0},destroyGlobal:function(){this._deselectMultiDrag(),p(document,"pointerup",this._deselectMultiDrag),p(document,"mouseup",this._deselectMultiDrag),p(document,"touchend",this._deselectMultiDrag),p(document,"keydown",this._checkKeyDown),p(document,"keyup",this._checkKeyUp)},_deselectMultiDrag:function(t){if(!(void 0!==ge&&ge||le!==this.sortable||t&&P(t.target,this.options.draggable,this.sortable.el,!1)||t&&0!==t.button))for(;de.length;){var e=de[0];k(e,this.options.selectedClass,!1),de.shift(),G({sortable:this.sortable,rootEl:this.sortable.el,name:"deselect",targetEl:e,originalEvent:t})}},_checkKeyDown:function(t){t.key===this.options.multiDragKey&&(this.multiDragKeyDown=!0)},_checkKeyUp:function(t){t.key===this.options.multiDragKey&&(this.multiDragKeyDown=!1)}},a(t,{pluginName:"multiDrag",utils:{select:function(t){var e=t.parentNode[K];e&&e.options.multiDrag&&!~de.indexOf(t)&&(le&&le!==e&&(le.multiDrag._deselectMultiDrag(),le=e),k(t,e.options.selectedClass,!0),de.push(t))},deselect:function(t){var e=t.parentNode[K],n=de.indexOf(t);e&&e.options.multiDrag&&~n&&(k(t,e.options.selectedClass,!1),de.splice(n,1))}},eventProperties:function(){var n=this,o=[],i=[];return de.forEach(function(t){var e;o.push({multiDragElement:t,index:t.sortableIndex}),e=fe&&t!==se?-1:fe?j(t,":not(."+n.options.selectedClass+")"):j(t),i.push({multiDragElement:t,index:e})}),{items:r(de),clones:[].concat(he),oldIndicies:o,newIndicies:i}},optionListeners:{multiDragKey:function(t){return"ctrl"===(t=t.toLowerCase())?t="Control":1<t.length&&(t=t.charAt(0).toUpperCase()+t.substr(1)),t}}})}),jt});
  return module.exports;
})();
// ----------------------------- end vendored SortableJS -----------------------------


const SORT_KEYS = ["dueDate", "priority", "startDate", "title", "tag"];

// All the card's own UI text (not the item data itself, which comes from
// TickTick as-is) lives here in German/English pairs. resolveLanguage/t()
// below pick between them based on hass.locale.language, falling back to
// English for anything that isn't German - date/weekday formatting and
// string sorting are handled separately via Intl (see formatParsedDate/
// compareBy), which already localizes to whatever exact locale HA reports.
const STRINGS = {
  de: {
    sortDueDate: "Fälligkeitsdatum",
    sortPriority: "Priorität",
    sortStartDate: "Startdatum",
    sortTitle: "Alphabetisch",
    sortTag: "Etikett",
    directionAsc: "Aufsteigend",
    directionDesc: "Absteigend",
    menuGroup: "Gruppieren nach",
    menuSort: "Sortieren nach",
    menuOrder: "Reihenfolge",
    menuFilter: "Filtern",
    filterDue: "Fälligkeit",
    filterActiveCount: (n) => `${n} aktiv`,
    filterAll: "Alle",
    priorityNone: "Ohne Priorität",
    priorityLow: "Niedrig",
    priorityMedium: "Mittel",
    priorityHigh: "Hoch",
    bucketOverdue: "Überfällig",
    bucketToday: "Heute",
    bucketTomorrow: "Morgen",
    bucketNext7: "Nächste 7 Tage",
    bucketLater: "Später",
    bucketNoDate: "Kein Datum",
    noTag: "Ohne Etikett",
    dragToReorderTag: "Ziehen, um die Reihenfolge zu ändern",
    completedGroup: "Erledigt",
    reopen: "Wieder öffnen",
    markComplete: "Als erledigt markieren",
    note: "Notiz",
    sortAndFilter: "Sortieren & Filtern",
    selectEntity: "Bitte eine TickTick-Listen-Entität auswählen.",
    entityNotFound: (id) => `Entität ${id} wurde nicht gefunden.`,
    noEntries: "Keine Einträge.",
    close: "Schließen",
    detailDue: "Fällig",
    detailStart: "Start",
    detailStatus: "Status",
    statusCompleted: "Erledigt",
    statusOpen: "Offen",
    detailTags: "Etiketten",
    addTag: "Etikett hinzufügen",
    removeTag: "Etikett entfernen",
    openInNewTab: "In neuem Tab öffnen",
    linkPreviewLoading: "Vorschau wird geladen …",
    linkPreviewUnavailable: "Vorschau nicht verfügbar. Bitte in neuem Tab öffnen.",
    editorEntity: "Entität",
    editorTitle: "Titel (optional)",
    editorTouchOptimized: "Touch-Optimierung",
    cardDescription: "Zeigt eine TickTick-Liste (Aufgaben oder Notizen) im Stil der TickTick-App an.",
  },
  en: {
    sortDueDate: "Due date",
    sortPriority: "Priority",
    sortStartDate: "Start date",
    sortTitle: "Alphabetical",
    sortTag: "Tag",
    directionAsc: "Ascending",
    directionDesc: "Descending",
    menuGroup: "Group by",
    menuSort: "Sort by",
    menuOrder: "Order",
    menuFilter: "Filter",
    filterDue: "Due date",
    filterActiveCount: (n) => `${n} active`,
    filterAll: "All",
    priorityNone: "No priority",
    priorityLow: "Low",
    priorityMedium: "Medium",
    priorityHigh: "High",
    bucketOverdue: "Overdue",
    bucketToday: "Today",
    bucketTomorrow: "Tomorrow",
    bucketNext7: "Next 7 days",
    bucketLater: "Later",
    bucketNoDate: "No date",
    noTag: "No tag",
    dragToReorderTag: "Drag to reorder",
    completedGroup: "Completed",
    reopen: "Reopen",
    markComplete: "Mark as done",
    note: "Note",
    sortAndFilter: "Sort & filter",
    selectEntity: "Please select a TickTick list entity.",
    entityNotFound: (id) => `Entity ${id} was not found.`,
    noEntries: "No entries.",
    close: "Close",
    detailDue: "Due",
    detailStart: "Start",
    detailStatus: "Status",
    statusCompleted: "Completed",
    statusOpen: "Open",
    detailTags: "Tags",
    addTag: "Add tag",
    removeTag: "Remove tag",
    openInNewTab: "Open in new tab",
    linkPreviewLoading: "Loading preview …",
    linkPreviewUnavailable: "Preview unavailable. Please open in a new tab.",
    editorEntity: "Entity",
    editorTitle: "Title (optional)",
    editorTouchOptimized: "Touch optimization",
    cardDescription: "Shows a TickTick list (tasks or notes) styled like the TickTick app.",
  },
};

function resolveLanguage(language) {
  return typeof language === "string" && language.toLowerCase().startsWith("de") ? "de" : "en";
}

function t(key, language, ...args) {
  const value = STRINGS[resolveLanguage(language)][key] ?? STRINGS.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

const SORT_LABEL_KEYS = {
  dueDate: "sortDueDate",
  priority: "sortPriority",
  startDate: "sortStartDate",
  title: "sortTitle",
  tag: "sortTag",
};

const DIRECTION_LABEL_KEYS = { asc: "directionAsc", desc: "directionDesc" };
const DIRECTION_ICONS = { asc: "mdi:sort-ascending", desc: "mdi:sort-descending" };

const SORT_KEY_ICONS = {
  dueDate: "mdi:calendar-clock",
  priority: "mdi:flag-outline",
  startDate: "mdi:calendar-start",
  title: "mdi:sort-alphabetical-variant",
  tag: "mdi:tag-outline",
};

// Mirrors the TickTick app's own menu: "Group by" drives both the visible
// sections (see _groupedItems) and the primary sort key, "Sort by" orders
// items within a group, "Order" is the shared direction toggle. "Filter" is
// folded into the same popup as a 4th entry instead of its own button/panel.
const MENU_FIELDS = [
  { field: "group", labelKey: "menuGroup", icon: "mdi:layers-outline" },
  { field: "sort", labelKey: "menuSort", icon: "mdi:sort" },
  { field: "order", labelKey: "menuOrder", icon: "mdi:swap-vertical" },
  { field: "filter", labelKey: "menuFilter", icon: "mdi:filter-variant" },
];

const FILTER_GROUP_ICONS = {
  priority: "mdi:flag-outline",
  tag: "mdi:tag-outline",
  due: "mdi:calendar-clock",
};

const PRIORITY_LABEL_KEYS = {
  NONE: "priorityNone",
  LOW: "priorityLow",
  MEDIUM: "priorityMedium",
  HIGH: "priorityHigh",
};

const BUCKET_ORDER = ["overdue", "today", "tomorrow", "next7", "later", "noDate"];

const BUCKET_LABEL_KEYS = {
  overdue: "bucketOverdue",
  today: "bucketToday",
  tomorrow: "bucketTomorrow",
  next7: "bucketNext7",
  later: "bucketLater",
  noDate: "bucketNoDate",
};

const NO_TAG_KEY = "__no_tag__";
const COMPLETED_GROUP_KEY = "__completed__";

// Persists the live sort/group/order/filter state per entity across page
// reloads (setConfig only ever carries the YAML defaults, never what the
// user picked in the popup menu - that state used to live purely in memory
// and vanish on every reload). Keyed by entity id rather than the card
// instance so the choice survives the card being torn down and recreated
// (e.g. a dashboard reload), which is exactly the case that needs fixing.
const STATE_STORAGE_PREFIX = "ticktick-list-card-state:";

function loadStoredState(entityId) {
  if (!entityId) return null;
  try {
    const raw = localStorage.getItem(STATE_STORAGE_PREFIX + entityId);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function saveStoredState(entityId, state) {
  if (!entityId) return;
  try {
    localStorage.setItem(STATE_STORAGE_PREFIX + entityId, JSON.stringify(state));
  } catch (err) {
    // Storage disabled/full/unavailable (e.g. private browsing) - the
    // in-memory state still works for the rest of this session, it just
    // won't survive a reload.
  }
}

const CHECK_ICON =
  '<svg class="check-icon" viewBox="0 0 16 16"><path d="M3 8.5L6.5 12L13 4.5" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Checking off a task doesn't report it to TickTick right away - the row
// just shows checked/struck-through optimistically, and the actual
// complete_task call is delayed by this long. Unchecking it again before
// the delay elapses cancels the pending call entirely (it's never reported
// at all), rather than reporting it immediately and trying to undo an
// already-irreversible completion afterward.
const COMPLETION_REPORT_DELAY_MS = 60000;

// Backend endpoint (registered by TickTickLinkPreviewView in __init__.py)
// that decides, server-side, whether a link clicked in the detail dialog
// can be framed live or needs a reader-mode fallback - see _openLinkPreview.
const LINK_PREVIEW_URL = "/ticktick_files/link_preview";

function escapeHtml(value) {
  // Escapes quotes too (not just <, >, &) since this is used both in text
  // content and inside double-quoted HTML attributes built via template
  // strings below (e.g. tag names, task ids sourced from the TickTick API).
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function linkify(escapedText, asLinks = true) {
  // No inline onclick="event.stopPropagation()" here (there used to be) -
  // that would stop a link click from ever reaching the delegated
  // shadowRoot click listener at all, which is exactly where _onClick()
  // now needs to see it (to intercept a click inside the open detail
  // dialog into a link preview, and to stop it from also opening/fighting
  // with a row's own click-opens-detail behavior elsewhere).
  //
  // asLinks:false (Touch-Optimierung, see setConfig/_renderRow) skips
  // wrapping URLs as <a> entirely - row/list previews then show plain
  // text instead of small, easy-to-mis-tap inline links competing with
  // the row's own much bigger "tap anywhere to open" target.
  if (!asLinks) return escapedText;
  return escapedText.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

const MARKDOWN_LINK_RE = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;

function renderText(value, { linkify: asLinks = true } = {}) {
  // TickTick descriptions/titles can carry markdown-style links, e.g.
  // "[How to share a list](https://...)" - shown as-is those brackets
  // and the raw URL would just be noise, so they're rendered as a plain
  // clickable link (label only) instead. Runs before escapeHtml/linkify so
  // the raw '[' ']' '(' ')' syntax chars are consumed here, not escaped.
  const raw = String(value ?? "");
  let result = "";
  let lastIndex = 0;
  MARKDOWN_LINK_RE.lastIndex = 0;
  let match;
  while ((match = MARKDOWN_LINK_RE.exec(raw))) {
    const [full, label, url] = match;
    result += linkify(escapeHtml(raw.slice(lastIndex, match.index)), asLinks);
    result += asLinks
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
      : escapeHtml(label);
    lastIndex = match.index + full.length;
  }
  result += linkify(escapeHtml(raw.slice(lastIndex)), asLinks);
  return result;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseLocalDate(iso) {
  // TickTick sends due dates as an ISO string with a UTC offset (e.g.
  // "2026-08-07T00:00:00+0200"). Parsing that with `new Date(iso)` and then
  // reading it back with the viewer's LOCAL getters can roll the calendar
  // day backward or forward by one whenever the offsets don't line up
  // (exactly the "shows Aug 6 instead of Aug 7" bug). The calendar day
  // TickTick actually means is the one written before the offset, so read
  // those Y-M-D digits directly and build a local-midnight Date from them,
  // never letting the offset shift the day at all.
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) {
    const fallback = new Date(iso);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function parseDueDate(iso) {
  // Due dates specifically still land one calendar day early even after
  // reading the Y-M-D digits verbatim (TickTick's API encodes them a day
  // back of the intended day for this account/timezone) - nudge just the
  // due-date reading forward by one day to compensate. start_date isn't
  // affected, so this stays separate from the generic parseLocalDate used
  // there.
  const date = parseLocalDate(iso);
  if (!date) return null;
  date.setDate(date.getDate() + 1);
  return date;
}

function computeBucket(dueDateIso, now) {
  const due = parseDueDate(dueDateIso);
  if (!due) return "noDate";
  const diffDays = Math.round(
    (startOfDay(due).getTime() - startOfDay(now).getTime()) / 86400000
  );
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays <= 7) return "next7";
  return "later";
}

function formatParsedDate(date, language) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(language || undefined, {
      day: "numeric",
      month: "short",
    }).format(date);
  } catch (err) {
    return date.toLocaleDateString();
  }
}

function formatDate(iso, language) {
  return formatParsedDate(parseLocalDate(iso), language);
}

function formatDueDate(iso, language) {
  return formatParsedDate(parseDueDate(iso), language);
}

function formatDueLabel(iso, now, language) {
  // Mirrors the TickTick app's own due-date wording: Heute/Morgen, then the
  // weekday name through the rest of "next 7 days", then the plain date
  // (unchanged) for anything further out - overdue items also keep the
  // plain date, matching the reference screenshot.
  const date = parseDueDate(iso);
  if (!date) return "";
  const diffDays = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86400000
  );
  if (diffDays === 0) return t("bucketToday", language);
  if (diffDays === 1) return t("bucketTomorrow", language);
  if (diffDays > 1 && diffDays <= 7) {
    try {
      return new Intl.DateTimeFormat(language || undefined, { weekday: "short" }).format(date);
    } catch (err) {
      return formatParsedDate(date, language);
    }
  }
  return formatParsedDate(date, language);
}

function isNoteItem(item, projectKind) {
  // TickTick's item.kind can mark an individual item as note-style even
  // inside an otherwise TASK-kind project - but only kind:"NOTE" means
  // that. "TEXT" and "CHECKLIST" are both still checkable tasks (a plain
  // task vs. one with sub-items), just without a checklist body. Purely
  // additive on top of the project-level check (never turns a note-project
  // item back into a checkbox).
  return projectKind === "NOTE" || item.kind === "NOTE";
}

function capitalize(str) {
  // Display-only: TickTick tags come back lowercase, but grouping/filter
  // matching still compares the raw values, so this is never applied to
  // sortValue/data-filter-value, only to what's shown on screen.
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function firstTag(item) {
  if (!item.tags || !item.tags.length) return null;
  return item.tags.slice().sort((a, b) => a.localeCompare(b))[0];
}

// Combines the user's drag-and-drop-saved tag order with the tags actually
// present right now: anything named in storedOrder keeps that relative
// position (entries for tags no longer present are simply skipped); any
// tag not yet in storedOrder (brand new, or the user has never dragged
// anything) is appended afterward, alphabetically. With an empty
// storedOrder this degenerates to plain alphabetical order, i.e. today's
// existing behavior - so nothing changes until a user actually reorders.
function applyTagOrder(storedOrder, presentTags) {
  const present = new Set(presentTags);
  const ordered = (storedOrder || []).filter((tag) => present.has(tag));
  const orderedSet = new Set(ordered);
  const rest = presentTags
    .filter((tag) => !orderedSet.has(tag))
    .sort((a, b) => a.localeCompare(b));
  return [...ordered, ...rest];
}

const TAG_COLOR_PALETTE = [
  "#e53935", // red
  "#fb8c00", // orange
  "#fdd835", // yellow
  "#7cb342", // light green
  "#43a047", // green
  "#00897b", // teal
  "#00acc1", // cyan
  "#039be5", // light blue
  "#3949ab", // indigo
  "#8e24aa", // purple
  "#d81b60", // pink
  "#f4511e", // deep orange
];

function tagColor(tag) {
  // Deterministic per-tag color (same tag always gets the same swatch,
  // independent of item/row), picked from a hand-picked vivid palette
  // rather than a raw hash-to-hue mapping - two tags landing on nearby
  // hues (e.g. 3deg apart) would look nearly identical, so this always
  // lands on one of a fixed set of clearly distinguishable colors.
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return TAG_COLOR_PALETTE[hash % TAG_COLOR_PALETTE.length];
}

function renderTagSquares(tags) {
  if (!tags || !tags.length) return "";
  return `<div class="tag-squares">${tags
    .map(
      (t) =>
        `<span class="tag-square" style="background:${tagColor(t)}" title="${escapeHtml(capitalize(t))}"></span>`
    )
    .join("")}</div>`;
}

function sortValue(item, key) {
  switch (key) {
    case "dueDate":
      return item.due_date ? new Date(item.due_date).getTime() : null;
    case "startDate":
      return item.start_date ? new Date(item.start_date).getTime() : null;
    case "priority":
      return item.priority_value ?? 0;
    case "title":
      return (item.title || "").toLocaleLowerCase();
    case "tag":
      return firstTag(item);
    default:
      return null;
  }
}

function compareBy(key, direction, language) {
  const factor = direction === "desc" ? -1 : 1;
  // Plain `<`/`>` on strings compares raw UTF-16 code units, which sorts
  // German umlauts (ä/ö/ü) after 'z' instead of near a/o/u - looks
  // "unsorted" for tag/title values in particular. A locale-aware collator
  // fixes that; only string sortValues (tag, title) hit this path at all.
  const collator = new Intl.Collator(language || undefined, { sensitivity: "base" });

  if (key === "tag") {
    // Multi-tag items always cluster together at the top, ahead of
    // single-tag and no-tag items - unconditionally (not flipped by
    // direction: this key is only ever used as a secondary/tie-break sort,
    // whose direction is its own fixed default, never the shared
    // "Reihenfolge" toggle). Only the alphabetical order *within* each of
    // those two clusters honors that direction.
    return (a, b) => {
      const aMulti = (a.tags?.length || 0) > 1 ? 0 : 1;
      const bMulti = (b.tags?.length || 0) > 1 ? 0 : 1;
      if (aMulti !== bMulti) return aMulti - bMulti;
      const va = firstTag(a);
      const vb = firstTag(b);
      if (va === null && vb === null) return 0;
      if (va === null) return 1; // items with no value always sort last
      if (vb === null) return -1;
      return collator.compare(va, vb) * factor;
    };
  }

  return (a, b) => {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);
    const aEmpty = va === null || va === undefined || va === "";
    const bEmpty = vb === null || vb === undefined || vb === "";
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1; // items with no value always sort last
    if (bEmpty) return -1;
    if (typeof va === "string" && typeof vb === "string") {
      return collator.compare(va, vb) * factor;
    }
    if (va < vb) return -1 * factor;
    if (va > vb) return 1 * factor;
    return 0;
  };
}

function defaultSecondaryDirection(key) {
  // "Ascending" numerically means high-priority-last, which reads backwards
  // as a tie-breaker (you'd expect the more urgent item first even without
  // touching the shared "Reihenfolge" direction toggle) - every other key's
  // natural ascending order (earliest date, A-Z) already reads correctly.
  return key === "priority" ? "desc" : "asc";
}

function combinedCompare(primaryKey, direction, secondaryKey, language) {
  const primaryCmp = compareBy(primaryKey, direction, language);
  const secondaryCmp = compareBy(secondaryKey, defaultSecondaryDirection(secondaryKey), language);
  return (a, b) => {
    const primary = primaryCmp(a, b);
    return primary !== 0 ? primary : secondaryCmp(a, b);
  };
}

class TickTickListCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // id -> { ts, timerId }: ts is when it was checked off (Date.now()),
    // timerId is the pending setTimeout that actually reports the
    // completion to TickTick once COMPLETION_REPORT_DELAY_MS elapses -
    // cancelled (and never fired) if unchecked again before then.
    this._localCompleted = new Map();
    this._filters = null;
    this._menuOpen = false;
    this._menuField = null; // null = root menu, else "group" | "sort" | "order" | "filter"
    this._detailItem = null;
    // { url, mode: "loading"|"iframe"|"reader"|"error", title?, html?, message? } -
    // set while a link clicked inside the detail dialog is being previewed.
    this._linkPreview = null;
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
  }

  disconnectedCallback() {
    for (const entry of this._localCompleted.values()) {
      clearTimeout(entry.timerId);
    }
    if (this._sortable) {
      this._sortable.destroy();
      this._sortable = null;
    }
  }

  setConfig(config) {
    // Deliberately does not throw on a missing entity: the card picker and
    // the visual editor both render a live preview of the card before the
    // user has chosen an entity, and a thrown error there can leave those
    // dialogs stuck rather than showing a helpful placeholder.
    const cfg = config || {};
    this._config = cfg;
    // The user's live choices (from a previous session, or from before this
    // element got torn down and recreated) take priority over the YAML
    // defaults below - those defaults only ever apply the very first time a
    // given entity's card is used.
    const stored = loadStoredState(cfg.entity) || {};
    this._sortBy = stored.sortBy || cfg.sort_by || "dueDate";
    this._sortBySecondary = stored.sortBySecondary || cfg.sort_by_secondary || "title";
    this._sortDirection =
      stored.sortDirection || (cfg.sort_direction === "desc" ? "desc" : "asc");
    this._filters = {
      priority: new Set(stored.filterPriority || cfg.filter_priority || []),
      tags: new Set(stored.filterTags || cfg.filter_tags || []),
      buckets: new Set(stored.filterDueBuckets || cfg.filter_due_buckets || []),
    };
    // User-customized order of tag group headings when grouping by tag
    // (drag-and-drop reordering, see the Sortable usage in _render()) - no
    // YAML fallback, same reasoning as the other live-choice fields above.
    this._tagOrder = Array.isArray(stored.tagOrder) ? stored.tagOrder : [];
    // A card-level setting (visual editor toggle, not a localStorage live
    // preference like the sort/filter state above) rather than a per-
    // session choice, since it changes how the card behaves structurally,
    // not just how it's currently sorted/filtered - defaults to off (the
    // original link behavior) so nothing changes for an existing card
    // until someone deliberately turns it on. See _onClick's link
    // handling and _renderRow's renderText() calls for what it actually
    // does.
    this._touchOptimized = cfg.touch_optimized === true;
    this._detailItem = null;
    this._linkPreview = null;
    // setConfig can land after hass already has (e.g. the visual editor's
    // live preview re-configuring an already-hass'd card element in place,
    // or config changing without a fresh custom-element instance) - the
    // hass setter below won't otherwise notice anything changed here (it
    // only reacts to the *entity's own state object* changing), so this is
    // the only path that would ever re-render for a config-only change.
    // Guarded against an in-flight tag-header drag for the same reason as
    // the hass setter below (an unlikely but cheap-to-guard case: the
    // visual editor reconfiguring the card while a drag is in progress).
    if (this._hass && !this._tagDragActive) this._render();
  }

  _persistState() {
    saveStoredState(this._config?.entity, {
      sortBy: this._sortBy,
      sortBySecondary: this._sortBySecondary,
      sortDirection: this._sortDirection,
      filterPriority: [...this._filters.priority],
      filterTags: [...this._filters.tags],
      filterDueBuckets: [...this._filters.buckets],
      tagOrder: this._tagOrder,
    });
  }

  getGridOptions() {
    // Sections-view sizing: at least 2 grid cells wide. Height is "auto" by
    // default (content dictates it), but the user can turn that off in the
    // card's own native HA "Layout" tab and pick a fixed row count - the
    // card fills whatever height that gives it and scrolls internally (see
    // the :host/ha-card/.list-body flex rules in _styles()).
    return { columns: 6, min_columns: 2, rows: "auto", min_rows: 2 };
  }

  set hass(hass) {
    // HA calls this setter on *every* state change anywhere in the whole
    // system, not just to this card's own entity - a plain unconditional
    // `this._render()` here means a full `shadowRoot.innerHTML` replacement
    // (destroying and recreating <ha-card> and everything under it) on
    // every single one of those, which on a busy instance can be many
    // times a second. Besides the wasted work, that's actively hostile to
    // anything reaching into this card's shadow root from outside and
    // touching that DOM directly - a theme-wide card-mod style targeting
    // ha-card, say - since a full re-render throws away whatever it
    // attached, every time, often faster than it can reapply. HA's own
    // state objects are immutable and only get a new reference when that
    // exact entity's state actually changes, so comparing references (not
    // deep-equality) is the standard, cheap way to detect "did anything
    // this card actually reads change" - locale is checked too since it
    // drives every _t()/Intl call in _render() but isn't part of any
    // entity's state object.
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._config) return;
    const entity = this._config.entity;
    const stateChanged = !oldHass || oldHass.states[entity] !== hass.states[entity];
    const localeChanged = oldHass?.locale?.language !== hass?.locale?.language;
    // Also skipped while a tag-header drag is in progress (this._tagDragActive,
    // set/cleared around the Sortable instance in _render()) - a full
    // innerHTML rebuild mid-drag would rip the DOM out from under it. The
    // drag's own onEnd always calls _render() once it finishes, which
    // picks up whatever hass state landed here in the meantime (this._hass
    // itself is still updated unconditionally above).
    if ((stateChanged || localeChanged) && !this._tagDragActive) this._render();
  }

  getCardSize() {
    const items = this._entityItems();
    return 1 + Math.max(1, Math.ceil((items ? items.length : 3) / 2));
  }

  static getStubConfig(hass) {
    // Entity ids are derived from the TickTick list's own name (e.g.
    // sensor.haushalt), not a "ticktick_" prefix, so pick the first sensor
    // that carries our sensor's signature attribute instead of guessing a
    // naming pattern.
    if (!hass) return { entity: "" };
    const first = Object.keys(hass.states).find(
      (e) => e.startsWith("sensor.") && hass.states[e].attributes.project_kind !== undefined
    );
    return { entity: first || "" };
  }

  static getConfigElement() {
    return document.createElement("ticktick-list-card-editor");
  }

  _stateObj() {
    if (!this._hass || !this._config) return null;
    return this._hass.states[this._config.entity];
  }

  _t(key, ...args) {
    return t(key, this._hass?.locale?.language, ...args);
  }

  _entityItems() {
    const stateObj = this._stateObj();
    return stateObj?.attributes?.items || [];
  }

  _effectiveStatus(item) {
    return this._localCompleted.has(item.id) ? "completed" : item.status;
  }

  _visibleItems() {
    const items = this._entityItems();
    const { priority, tags, buckets } = this._filters;
    const now = new Date();

    return items.filter((item) => {
      if (priority.size && !priority.has(item.priority || "NONE")) return false;
      if (tags.size) {
        const itemTags = item.tags || [];
        if (!itemTags.some((t) => tags.has(t))) return false;
      }
      if (buckets.size) {
        const bucket = computeBucket(item.due_date, now);
        if (!buckets.has(bucket)) return false;
      }
      return true;
    });
  }

  _groupedItems(items) {
    const language = this._hass?.locale?.language;
    // Checked-off items don't just sink within whichever due-date/tag
    // group they'd otherwise fall into - they leave their group entirely
    // and collect in one "Completed" section at the very end of the whole
    // list, same as the reference app.
    const isDone = (item) => this._effectiveStatus(item) === "completed";
    const openItems = items.filter((item) => !isDone(item));
    const completedItems = items.filter(isDone);

    const groups = this._groupOpenItems(openItems, language);

    if (completedItems.length) {
      const cmp = compareBy(this._sortBySecondary, defaultSecondaryDirection(this._sortBySecondary), language);
      groups.push({
        label: this._t("completedGroup"),
        key: COMPLETED_GROUP_KEY,
        items: completedItems.slice().sort(cmp),
      });
    }

    return groups;
  }

  // Groups/sorts only the still-open items - completed ones are handled
  // separately by _groupedItems, which appends them as their own trailing
  // section instead of leaving them mixed into these groups.
  _groupOpenItems(items, language) {
    if (this._sortBy === "dueDate" || this._sortBy === "tag") {
      // Grouping already carries the primary key's own ordering (bucket
      // order / alphabetical tag order below), so the secondary key sorts
      // WITHIN each group directly rather than tie-breaking a whole-array
      // sort: due dates are nearly always distinct, so a tie-break would
      // rarely apply and the secondary key would barely affect anything.
      const secondaryCmp = compareBy(this._sortBySecondary, defaultSecondaryDirection(this._sortBySecondary), language);

      if (this._sortBy === "dueDate") {
        const now = new Date();
        const groups = new Map();
        for (const item of items) {
          const bucket = computeBucket(item.due_date, now);
          if (!groups.has(bucket)) groups.set(bucket, []);
          groups.get(bucket).push(item);
        }
        return BUCKET_ORDER.filter((b) => groups.has(b)).map((b) => ({
          label: this._t(BUCKET_LABEL_KEYS[b]),
          key: b,
          items: groups.get(b).slice().sort(secondaryCmp),
        }));
      }

      // An item with several tags is grouped under whichever of its own
      // tags currently ranks highest (topmost) in the user's tag order,
      // not whichever sorts first alphabetically - dragging a tag to the
      // top should actually pull every item that carries it into that
      // heading, rather than alphabetical order silently overriding the
      // drag. That needs the full resolved order (every tag actually in
      // use - drag order, plus anything not yet placed appended
      // alphabetically, see applyTagOrder) computed up front, before
      // grouping, rather than derived from the groups afterward.
      const allTags = new Set();
      for (const item of items) {
        (item.tags || []).forEach((t) => allTags.add(t));
      }
      const orderedTags = applyTagOrder(this._tagOrder, [...allTags]);
      const rankOf = new Map(orderedTags.map((tag, i) => [tag, i]));

      const groups = new Map();
      for (const item of items) {
        const itemTags = item.tags || [];
        const tag = itemTags.length
          ? itemTags.reduce((best, t) => (rankOf.get(t) < rankOf.get(best) ? t : best))
          : NO_TAG_KEY;
        if (!groups.has(tag)) groups.set(tag, []);
        groups.get(tag).push(item);
      }
      // Only tags that actually ended up as some item's top-ranked tag get
      // their own heading here - a tag that's always outranked by a
      // co-tag on every item carrying it never becomes a group of its
      // own, so an empty heading for it would be pointless. "No tag"
      // always stays pinned last.
      const usedOrderedTags = orderedTags.filter((tag) => groups.has(tag));
      const orderedKeys = groups.has(NO_TAG_KEY) ? [...usedOrderedTags, NO_TAG_KEY] : usedOrderedTags;
      return orderedKeys.map((tag) => ({
        label: tag === NO_TAG_KEY ? this._t("noTag") : capitalize(tag),
        key: tag,
        color: tag === NO_TAG_KEY ? null : tagColor(tag),
        // Items carrying more than one tag surface at the top of their
        // group - a quick visual cue that an item also lives under other
        // headings - with the existing secondary sort only breaking ties
        // within that (mirrors the same clustering compareBy("tag")
        // already does when tag is used as a secondary/tie-break key).
        items: groups.get(tag).slice().sort((a, b) => {
          const aMulti = (a.tags?.length || 0) > 1 ? 0 : 1;
          const bMulti = (b.tags?.length || 0) > 1 ? 0 : 1;
          return aMulti !== bMulti ? aMulti - bMulti : secondaryCmp(a, b);
        }),
      }));
    }

    const sorted = items
      .slice()
      .sort(combinedCompare(this._sortBy, this._sortDirection, this._sortBySecondary, language));
    return [{ label: null, key: "all", items: sorted }];
  }

  _onClick(ev) {
    // A click anywhere outside the open popup (and not on its own toggle
    // button) closes it first, then the click still falls through to
    // whatever else it was aimed at below (e.g. a row) - matching how a
    // dropdown menu normally behaves.
    if (
      this._menuOpen &&
      !ev.target.closest(".menu-popup") &&
      !ev.target.closest("#menu-toggle")
    ) {
      this._menuOpen = false;
      this._menuField = null;
      this._render();
    }

    // Close on the explicit close button, or a click landing directly on
    // the backdrop itself (not bubbled from inside .detail-card). Any open
    // link preview is a child of this same dialog conceptually, so it goes
    // away with it too rather than lingering with nothing to belong to.
    if (ev.target.closest(".detail-close") || ev.target.classList?.contains("detail-overlay")) {
      this._detailItem = null;
      this._linkPreview = null;
      this._render();
      return;
    }
    // Same idea, one level up: its own close button or its own backdrop
    // closes only the link preview, leaving the detail dialog underneath
    // open.
    if (ev.target.closest(".link-preview-close") || ev.target.classList?.contains("link-preview-overlay")) {
      this._linkPreview = null;
      this._render();
      return;
    }
    // The whole row is clickable (not just the checkbox), and is checked
    // before the general ".checkbox" handler below since the subtask
    // checkbox carries that class too (for shared styling).
    const subtaskRow = ev.target.closest(".subtask-row");
    if (subtaskRow) {
      const parentId = subtaskRow.dataset.parentId;
      const subtaskId = subtaskRow.dataset.subtaskId;
      const parent = this._entityItems().find((i) => i.id === parentId);
      const sub = parent?.items?.find((s) => s.id === subtaskId);
      if (parent && sub) this._toggleSubtask(parent, sub);
      return;
    }
    const tagToggle = ev.target.closest("[data-tag-toggle]");
    if (tagToggle) {
      if (this._detailItem) this._toggleItemTag(this._detailItem, tagToggle.dataset.tagToggle);
      return;
    }
    const checkbox = ev.target.closest(".checkbox");
    if (checkbox) {
      const id = checkbox.dataset.id;
      const items = this._entityItems();
      const item = items.find((i) => i.id === id);
      if (item) this._toggleComplete(item);
      return;
    }
    // Links rendered by renderText()/linkify() (task/note content, markdown
    // links) - only intercepted inside the open detail dialog, where a big
    // near-fullscreen preview makes sense; a link inside a row's own
    // content-line preview keeps its plain target="_blank" behavior
    // unchanged. Returning either way (not falling through to the .row
    // branch below) is what keeps clicking a link from also opening/
    // fighting with the row's own click-opens-detail behavior - previously
    // handled by an inline onclick="event.stopPropagation()" on every
    // link, which would have blocked this interception from ever seeing
    // the click at all, so that's gone from renderText()/linkify() now.
    const link = ev.target.closest("a[href]");
    if (link) {
      if (this._touchOptimized && link.closest(".detail-card")) {
        ev.preventDefault();
        this._openLinkPreview(link.href);
      }
      return;
    }
    const row = ev.target.closest(".row");
    if (row && row.dataset.id) {
      const items = this._entityItems();
      const item = items.find((i) => i.id === row.dataset.id);
      if (item) {
        this._detailItem = item;
        this._render();
      }
      return;
    }
    if (ev.target.closest("#menu-toggle")) {
      this._menuOpen = !this._menuOpen;
      this._menuField = null;
      this._render();
      return;
    }
    const menuBack = ev.target.closest("[data-menu-back]");
    if (menuBack) {
      this._menuField = null;
      this._render();
      return;
    }
    const menuRow = ev.target.closest("[data-menu-row]");
    if (menuRow) {
      this._menuField = menuRow.dataset.menuRow;
      this._render();
      return;
    }
    const menuOption = ev.target.closest("[data-menu-option]");
    if (menuOption) {
      const field = menuOption.dataset.menuField;
      const value = menuOption.dataset.menuValue;
      if (field === "group") this._sortBy = value;
      else if (field === "sort") this._sortBySecondary = value;
      else if (field === "order") this._sortDirection = value;
      this._menuOpen = false;
      this._menuField = null;
      this._persistState();
      this._render();
      return;
    }
    // Filter chips are multi-select, so - unlike the single-choice sort
    // options above - picking one just toggles it and leaves the popup
    // open on the filter view for further adjustments.
    const filterChip = ev.target.closest("[data-filter-group]");
    if (filterChip) {
      const group = filterChip.dataset.filterGroup;
      const value = filterChip.dataset.filterValue;
      const set = this._filters[group];
      if (set.has(value)) set.delete(value);
      else set.add(value);
      this._persistState();
      this._render();
    }
  }

  _toggleComplete(item) {
    if (this._localCompleted.has(item.id)) {
      // Unchecking within COMPLETION_REPORT_DELAY_MS cancels the pending
      // complete_task call outright - if it hasn't fired yet, TickTick
      // never hears about this completion at all, so there's nothing to
      // "undo" server-side.
      clearTimeout(this._localCompleted.get(item.id).timerId);
      this._localCompleted.delete(item.id);
      this._render();
      return;
    }
    if (this._effectiveStatus(item) === "completed") return;
    const stateObj = this._stateObj();
    const projectId = stateObj?.attributes?.project_id;
    const timerId = setTimeout(() => {
      this._hass
        .callService("ticktick", "complete_task", {
          projectId,
          taskId: item.id,
        })
        .catch((err) => {
          this._localCompleted.delete(item.id);
          this._render();
          console.error("ticktick-list-card: failed to complete task", err);
        });
    }, COMPLETION_REPORT_DELAY_MS);
    this._localCompleted.set(item.id, { ts: Date.now(), timerId });
    this._render();
  }

  _toggleSubtask(parentItem, subItem) {
    // Same delayed-report pattern as _toggleComplete - and for the same
    // reason: there's no "uncomplete" API for checklist items either, so
    // reporting a completion immediately makes unchecking it again purely
    // cosmetic (it'd get reported to TickTick right at the click, and the
    // next data refresh would just show it checked again - "permanently
    // stuck checked" from the user's perspective). Delaying the report is
    // what makes undo actually mean something here.
    if (this._localCompleted.has(subItem.id)) {
      clearTimeout(this._localCompleted.get(subItem.id).timerId);
      this._localCompleted.delete(subItem.id);
      this._syncParentCompletion(parentItem);
      this._render();
      return;
    }
    if (subItem.status === "completed") return;
    const stateObj = this._stateObj();
    const projectId = stateObj?.attributes?.project_id;
    const timerId = setTimeout(() => {
      this._hass
        .callService("ticktick", "complete_subtask", {
          projectId,
          taskId: parentItem.id,
          itemId: subItem.id,
        })
        .catch((err) => {
          this._localCompleted.delete(subItem.id);
          this._syncParentCompletion(parentItem);
          this._render();
          console.error("ticktick-list-card: failed to complete checklist item", err);
        });
    }, COMPLETION_REPORT_DELAY_MS);
    this._localCompleted.set(subItem.id, { ts: Date.now(), timerId });
    this._syncParentCompletion(parentItem);
    this._render();
  }

  // Keeps the parent checklist task's own completed state in sync with its
  // sub-items: once every sub-item is (locally or already) completed, the
  // whole checklist is marked completed too - through the exact same
  // optimistic-mark-then-delayed-report flow as clicking its own checkbox,
  // so it's still undoable within COMPLETION_REPORT_DELAY_MS. Unchecking a
  // sub-item that breaks a full completion undoes the parent the same way.
  _syncParentCompletion(parentItem) {
    if (!parentItem.items || !parentItem.items.length) return;
    const allDone = parentItem.items.every(
      (sub) => this._localCompleted.has(sub.id) || sub.status === "completed"
    );
    const parentLocallyCompleted = this._localCompleted.has(parentItem.id);
    if (allDone !== parentLocallyCompleted) {
      this._toggleComplete(parentItem);
    }
  }

  _activeFilterCount() {
    const { priority, tags, buckets } = this._filters;
    return priority.size + tags.size + buckets.size;
  }

  _menuRowValueLabel(field) {
    if (field === "group") return this._t(SORT_LABEL_KEYS[this._sortBy]);
    if (field === "sort") return this._t(SORT_LABEL_KEYS[this._sortBySecondary]);
    if (field === "order") return this._t(DIRECTION_LABEL_KEYS[this._sortDirection]);
    const n = this._activeFilterCount();
    return n ? this._t("filterActiveCount", n) : this._t("filterAll");
  }

  _renderMenu() {
    if (!this._menuOpen) return "";

    if (!this._menuField) {
      return `<div class="menu-popup">
        ${MENU_FIELDS.map(
          ({ field, labelKey, icon }) => `
          <div class="menu-row" data-menu-row="${field}">
            <span class="menu-row-label"><ha-icon icon="${icon}"></ha-icon><span>${this._t(labelKey)}</span></span>
            <span class="menu-row-value">
              <span>${escapeHtml(this._menuRowValueLabel(field))}</span>
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </span>
          </div>`
        ).join("")}
      </div>`;
    }

    if (this._menuField === "filter") {
      return this._renderFilterMenu();
    }

    const field = this._menuField;
    const fieldLabel = this._t(MENU_FIELDS.find((f) => f.field === field).labelKey);
    const currentValue =
      field === "order" ? this._sortDirection : field === "group" ? this._sortBy : this._sortBySecondary;
    const options =
      field === "order"
        ? [
            ["asc", this._t("directionAsc"), DIRECTION_ICONS.asc],
            ["desc", this._t("directionDesc"), DIRECTION_ICONS.desc],
          ]
        : SORT_KEYS.map((k) => [k, this._t(SORT_LABEL_KEYS[k]), SORT_KEY_ICONS[k]]);

    return `<div class="menu-popup">
      <div class="menu-back" data-menu-back="true">
        <ha-icon icon="mdi:chevron-left"></ha-icon>
        <span>${fieldLabel}</span>
      </div>
      ${options
        .map(
          ([value, label, icon]) => `
          <div class="menu-option ${value === currentValue ? "active" : ""}" data-menu-option="true" data-menu-field="${field}" data-menu-value="${value}">
            <span class="menu-row-label"><ha-icon icon="${icon}"></ha-icon><span>${escapeHtml(label)}</span></span>
            ${value === currentValue ? '<ha-icon icon="mdi:check" class="menu-check"></ha-icon>' : ""}
          </div>`
        )
        .join("")}
    </div>`;
  }

  _renderFilterMenu() {
    const tagSet = new Set();
    for (const item of this._entityItems()) {
      (item.tags || []).forEach((t) => tagSet.add(t));
    }

    return `<div class="menu-popup menu-popup-wide">
      <div class="menu-back" data-menu-back="true">
        <ha-icon icon="mdi:chevron-left"></ha-icon>
        <span>${this._t("menuFilter")}</span>
      </div>
      <div class="menu-filter-body">
        <div class="filter-group">
          <div class="filter-group-title"><ha-icon icon="${FILTER_GROUP_ICONS.priority}"></ha-icon><span>${this._t("sortPriority")}</span></div>
          <div class="filter-chip-row">
            ${Object.keys(PRIORITY_LABEL_KEYS)
              .map(
                (p) =>
                  `<button class="chip ${this._filters.priority.has(p) ? "active" : ""}" style="--chip-color:var(--ticktick-priority-${p.toLowerCase()}-color)" data-filter-group="priority" data-filter-value="${p}">${this._t(PRIORITY_LABEL_KEYS[p])}</button>`
              )
              .join("")}
          </div>
        </div>
        ${
          tagSet.size
            ? `<div class="filter-group">
                <div class="filter-group-title"><ha-icon icon="${FILTER_GROUP_ICONS.tag}"></ha-icon><span>${this._t("sortTag")}</span></div>
                <div class="filter-chip-row">
                  ${[...tagSet]
                    .sort((a, b) => a.localeCompare(b))
                    .map(
                      (t) =>
                        `<button class="chip ${this._filters.tags.has(t) ? "active" : ""}" style="--chip-color:${tagColor(t)}" data-filter-group="tags" data-filter-value="${escapeHtml(t)}">${escapeHtml(capitalize(t))}</button>`
                    )
                    .join("")}
                </div>
              </div>`
            : ""
        }
        <div class="filter-group">
          <div class="filter-group-title"><ha-icon icon="${FILTER_GROUP_ICONS.due}"></ha-icon><span>${this._t("filterDue")}</span></div>
          <div class="filter-chip-row">
            ${BUCKET_ORDER.map(
              (b) =>
                `<button class="chip ${this._filters.buckets.has(b) ? "active" : ""}" data-filter-group="buckets" data-filter-value="${b}">${this._t(BUCKET_LABEL_KEYS[b])}</button>`
            ).join("")}
          </div>
        </div>
      </div>
    </div>`;
  }

  _renderRow(item, projectKind, excludeTag) {
    const status = this._effectiveStatus(item);
    const completed = status === "completed";
    const priority = (item.priority || "NONE").toLowerCase();
    const visibleTags = item.tags && item.tags.length
      ? excludeTag
        ? item.tags.filter((t) => t !== excludeTag)
        : item.tags
      : [];
    const hasContentLine = Boolean(item.content) || visibleTags.length > 0;
    // Touch-Optimierung (see setConfig): row/list previews get plain,
    // non-clickable text instead of small inline links - only the detail
    // dialog's own renderText() calls (unaffected by this) stay linked,
    // since those are what Touch-Optimierung's other half (the big link
    // preview view) actually needs to be clickable at all.
    const rowLinkify = { linkify: !this._touchOptimized };

    if (isNoteItem(item, projectKind)) {
      return `<div class="row note-row" data-id="${escapeHtml(item.id)}">
        <div class="note-checkbox priority-${priority}" title="${escapeHtml(this._t("note"))}"><svg viewBox="0 0 16 16"><text x="50%" y="52%" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="700">N</text></svg></div>
        <div class="row-main">
          <div class="row-title">${renderText(item.title, rowLinkify)}</div>
          ${
            hasContentLine
              ? `<div class="content-line">
            ${item.content ? `<div class="row-content clamp">${renderText(item.content, rowLinkify)}</div>` : ""}
            ${renderTagSquares(visibleTags)}
          </div>`
              : ""
          }
        </div>
      </div>`;
    }

    const isOverdue = computeBucket(item.due_date, new Date()) === "overdue" && !completed;

    const hasChecklist = item.kind === "CHECKLIST";

    return `<div class="row task-row ${completed ? "completed" : ""}" data-id="${escapeHtml(item.id)}">
      <button class="checkbox priority-${priority} ${completed ? "checked" : ""}" data-id="${escapeHtml(item.id)}" title="${escapeHtml(this._localCompleted.has(item.id) ? this._t("reopen") : this._t("markComplete"))}">${completed ? CHECK_ICON : hasChecklist ? '<span class="checklist-lines"><span></span><span></span></span>' : ""}</button>
      <div class="row-main">
        ${
          item.due_date
            ? `<div class="due ${isOverdue ? "overdue" : ""}">${formatDueLabel(item.due_date, new Date(), this._hass?.locale?.language)}</div>`
            : ""
        }
        <div class="row-title">${renderText(item.title, rowLinkify)}</div>
        ${
          hasContentLine
            ? `<div class="content-line">
          ${item.content ? `<div class="row-content clamp">${renderText(item.content, rowLinkify)}</div>` : ""}
          ${renderTagSquares(visibleTags)}
        </div>`
            : ""
        }
      </div>
    </div>`;
  }

  // Content first (the description a user is most likely to actually read),
  // then checklist, then tags - the three most frequently read/edited
  // things surfaced right under the title instead of buried below the
  // (mostly read-only) metadata, per explicit ordering request. Due/start/
  // priority/status are what's left, folded into one compact wrapping row
  // (see .detail-facts) instead of one full-width block each.
  _renderDetail(projectKind) {
    const item = this._detailItem;
    if (!item) return "";
    const status = this._effectiveStatus(item);
    const lang = this._hass?.locale?.language;

    const sections = [];

    if (item.content) {
      sections.push(`<div class="detail-section">${renderText(item.content)}</div>`);
    }

    if (item.kind === "CHECKLIST" && item.items && item.items.length) {
      sections.push(`<div class="detail-section">${this._renderSubtaskList(item)}</div>`);
    }

    const tagsRow = this._renderDetailTagsRow(item);
    if (tagsRow) {
      sections.push(`<div class="detail-section"><div class="detail-label">${this._t("detailTags")}</div>${tagsRow}</div>`);
    }

    const facts = [];
    if (item.due_date) facts.push([this._t("detailDue"), escapeHtml(formatDueDate(item.due_date, lang))]);
    if (item.start_date) facts.push([this._t("detailStart"), escapeHtml(formatDate(item.start_date, lang))]);
    facts.push([this._t("sortPriority"), escapeHtml(this._t(PRIORITY_LABEL_KEYS[item.priority || "NONE"]))]);
    if (!isNoteItem(item, projectKind)) {
      facts.push([this._t("detailStatus"), status === "completed" ? this._t("statusCompleted") : this._t("statusOpen")]);
    }
    sections.push(
      `<div class="detail-facts">${facts
        .map(([label, value]) => `<div class="detail-fact"><span class="detail-fact-label">${label}</span><span>${value}</span></div>`)
        .join("")}</div>`
    );

    return `<div class="detail-overlay">
      <div class="detail-card">
        <div class="detail-header">
          <div class="detail-title">${renderText(item.title)}</div>
          <button class="icon-btn detail-close" title="${escapeHtml(this._t("close"))}"><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        <div class="detail-body">
          ${sections.join("")}
        </div>
      </div>
    </div>`;
  }

  // Kicks off a link preview: shows a loading state immediately (open
  // TickTickLinkPreviewView's own docstring for why this asks the backend
  // first instead of just framing the URL directly), then asks the backend
  // whether the target page can actually be framed live or needs the
  // reader-mode fallback it already extracted server-side if not.
  _openLinkPreview(url) {
    this._linkPreview = { url, mode: "loading" };
    this._render();
    this._hass
      .fetchWithAuth(
        `${LINK_PREVIEW_URL}?url=${encodeURIComponent(url)}&lang=${encodeURIComponent(this._hass?.locale?.language || "en")}`
      )
      .then((resp) => resp.json())
      .then((data) => {
        // The user may have closed this preview, or clicked a different
        // link, while the request was in flight - a stale response
        // landing after that shouldn't resurrect/overwrite whatever's
        // showing now.
        if (this._linkPreview?.url !== url) return;
        this._linkPreview = { url, ...data };
        this._render();
      })
      .catch((err) => {
        if (this._linkPreview?.url !== url) return;
        this._linkPreview = { url, mode: "error" };
        this._render();
        console.error("ticktick-list-card: link preview request failed", err);
      });
  }

  // A near-fullscreen preview for a link clicked inside the open detail
  // dialog (see the "a[href]" branch in _onClick()), stacked above
  // .detail-overlay (higher z-index) so the detail dialog stays open
  // underneath it. The header (URL, "open in new tab", close) is the same
  // across every mode; only the body differs:
  // - loading: request to the backend (see _openLinkPreview) still in flight.
  // - iframe: the backend found no framing restriction, so this is the
  //   live page, same as before this got a backend round-trip at all.
  // - reader: the backend found the page blocks framing (X-Frame-Options/
  //   CSP frame-ancestors) and extracted+sanitized its readable content
  //   server-side instead (see link_preview.py) - shown as plain styled
  //   HTML here, already safe to inject directly.
  // - error: the backend couldn't fetch or extract anything usable (blocked
  //   URL, non-HTML response, network failure, ...) - "open in new tab" in
  //   the header above is the only way forward at that point, same as it
  //   always was for a page that simply can't be shown in-page at all.
  _renderLinkPreview() {
    const preview = this._linkPreview;
    if (!preview) return "";
    const { url, mode } = preview;
    let body;
    if (mode === "iframe") {
      body = `<iframe class="link-preview-frame" src="${escapeHtml(url)}" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>`;
    } else if (mode === "reader") {
      body = `<div class="link-reader">
        ${preview.title ? `<div class="link-reader-title">${escapeHtml(preview.title)}</div>` : ""}
        <div class="link-reader-content">${preview.html || ""}</div>
      </div>`;
    } else if (mode === "error") {
      body = `<div class="link-preview-message">${escapeHtml(this._t("linkPreviewUnavailable"))}</div>`;
    } else {
      body = `<div class="link-preview-message">${escapeHtml(this._t("linkPreviewLoading"))}</div>`;
    }
    return `<div class="link-preview-overlay">
      <div class="link-preview-card">
        <div class="link-preview-header">
          <div class="link-preview-url">${escapeHtml(url)}</div>
          <a class="icon-btn" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(this._t("openInNewTab"))}"><ha-icon icon="mdi:open-in-new"></ha-icon></a>
          <button class="icon-btn link-preview-close" title="${escapeHtml(this._t("close"))}"><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        ${body}
      </div>
    </div>`;
  }

  // Every tag already used anywhere in this list is offered as a toggle -
  // "existing" tags only, per the feature's scope (no free-text new-tag
  // entry here). Reuses the exact same .chip/--chip-color styling as the
  // sort/filter popup's chips (same touch-target size, same active-state
  // recipe) rather than a bespoke smaller style, so both popups' tappable
  // chips feel identical. Filled = already on this item (click removes),
  // outlined = not on it yet (click adds). Returns null (no row at all)
  // when there's nothing to offer, i.e. this item and the rest of the list
  // are both entirely untagged.
  _renderDetailTagsRow(item) {
    const itemTags = new Set(item.tags || []);
    const allTags = new Set(itemTags);
    for (const other of this._entityItems()) {
      (other.tags || []).forEach((t) => allTags.add(t));
    }
    if (!allTags.size) return null;
    return `<div class="tag-row">${[...allTags]
      .sort((a, b) => a.localeCompare(b))
      .map((t) => {
        const active = itemTags.has(t);
        return `<button type="button" class="chip ${active ? "active" : ""}" style="--chip-color:${tagColor(t)}" data-tag-toggle="${escapeHtml(t)}" title="${escapeHtml(active ? this._t("removeTag") : this._t("addTag"))}">${escapeHtml(capitalize(t))}</button>`;
      })
      .join("")}</div>`;
  }

  // Fires the update_task service immediately (no delay/undo window like
  // _toggleComplete's - tags aren't subject to the same "avoid reporting a
  // mis-click" concern task completion has). item is the actual object
  // from _entityItems() (a live reference into the entity's own state
  // attributes, not a copy), so mutating item.tags here also updates the
  // tag squares on this item's row in the main list immediately, not just
  // the open detail dialog - reverted the same way if the service call
  // fails.
  _toggleItemTag(item, tag) {
    const previousTags = item.tags || [];
    const newTags = previousTags.includes(tag)
      ? previousTags.filter((t) => t !== tag)
      : [...previousTags, tag];
    item.tags = newTags;
    this._render();
    const stateObj = this._stateObj();
    const projectId = stateObj?.attributes?.project_id;
    this._hass
      .callService("ticktick", "update_task", {
        projectId,
        taskId: item.id,
        tags: newTags,
      })
      .catch((err) => {
        item.tags = previousTags;
        this._render();
        console.error("ticktick-list-card: failed to update tags", err);
      });
  }

  _renderSubtaskList(item) {
    return `<div class="subtask-list">
      ${item.items
        .map((sub) => {
          const subCompleted = this._localCompleted.has(sub.id) || sub.status === "completed";
          return `<div class="subtask-row" data-parent-id="${escapeHtml(item.id)}" data-subtask-id="${escapeHtml(sub.id)}">
            <button class="checkbox subtask-checkbox ${subCompleted ? "checked" : ""}" title="${escapeHtml(this._localCompleted.has(sub.id) ? this._t("reopen") : this._t("markComplete"))}">${subCompleted ? CHECK_ICON : ""}</button>
            <span class="subtask-title ${subCompleted ? "completed" : ""}">${escapeHtml(sub.title)}</span>
          </div>`;
        })
        .join("")}
    </div>`;
  }

  _ensureDom() {
    // <ha-card> (and the shadow root generally) is created exactly once
    // here and never replaced again - every _render() below only ever
    // mutates *contents* (ha-card.innerHTML / the detail slot's
    // innerHTML), never re-creates ha-card itself. That matters because
    // external tooling that reaches into an open shadow root and modifies
    // ha-card directly - a theme-wide card-mod style, in particular -
    // attaches to *this specific node*. The previous approach (the whole
    // shadow root replaced via one big innerHTML template on every
    // render, including every click inside the card - opening the menu,
    // toggling a filter chip, anything) tore that exact node out and
    // rebuilt a fresh one each time, discarding whatever had been
    // attached to it. Confirmed as the actual cause of a reported bug:
    // card-mod's theme reverted within seconds of any interaction with
    // the card, never observed on a test instance without card-mod's
    // theme-wide styling active.
    if (this._cardEl) return;
    this.shadowRoot.innerHTML = `${this._styles()}<ha-card></ha-card><div class="detail-slot"></div>`;
    this._cardEl = this.shadowRoot.querySelector("ha-card");
    this._detailSlot = this.shadowRoot.querySelector(".detail-slot");
  }

  _render() {
    if (!this._config) return;
    this._ensureDom();

    if (!this._config.entity) {
      this._cardEl.innerHTML = `<div class="warning">${this._t("selectEntity")}</div>`;
      this._detailSlot.innerHTML = "";
      return;
    }

    const stateObj = this._stateObj();

    if (!stateObj) {
      this._cardEl.innerHTML = `<div class="warning">${this._t("entityNotFound", escapeHtml(this._config.entity))}</div>`;
      this._detailSlot.innerHTML = "";
      return;
    }

    const projectKind = stateObj.attributes.project_kind === "NOTE" ? "NOTE" : "TASK";
    const title = this._config.title || stateObj.attributes.friendly_name || "";
    const visible = this._visibleItems();
    const groups = this._groupedItems(visible);

    let body;
    if (this._sortBy === "tag") {
      // Real tag groups are wrapped in their own container so it alone can
      // be handed to Sortable below - "No tag"/"Completed" stay structurally
      // outside it and are therefore never reachable as a drag target,
      // rather than relying on runtime filtering to keep them pinned last.
      const realTagGroups = groups.filter(
        (g) => g.key !== NO_TAG_KEY && g.key !== COMPLETED_GROUP_KEY
      );
      const pinnedGroups = groups.filter(
        (g) => g.key === NO_TAG_KEY || g.key === COMPLETED_GROUP_KEY
      );
      const showHandles = realTagGroups.length > 1; // nothing to reorder against with just one
      const tagGroupsHtml = realTagGroups
        .map((group) => this._renderGroup(group, projectKind, showHandles))
        .join("");
      const pinnedGroupsHtml = pinnedGroups
        .map((group) => this._renderGroup(group, projectKind, false))
        .join("");
      body = `<div class="tag-groups">${tagGroupsHtml}</div>${pinnedGroupsHtml}`;
    } else {
      body = groups.map((group) => this._renderGroup(group, projectKind, false)).join("");
    }

    this._cardEl.innerHTML = `
        <div class="header">
          <div class="title">${escapeHtml(title)}</div>
          <div class="controls">
            <button id="menu-toggle" class="icon-btn" title="${escapeHtml(this._t("sortAndFilter"))}"><ha-icon icon="mdi:tune"></ha-icon></button>
          </div>
          ${this._renderMenu()}
        </div>
        <div class="list-body">
          ${visible.length ? body : `<div class="empty">${this._t("noEntries")}</div>`}
        </div>`;
    this._detailSlot.innerHTML = this._renderDetail(projectKind) + this._renderLinkPreview();
    // Enlarges checkbox tap targets (see the .touch-optimized rules in
    // _styles()) without resizing anything visibly - toggled on these two
    // persistent containers (not rebuilt every render, unlike their
    // contents) rather than baked into the row/subtask markup itself, so
    // it stays in sync with the live setting with no extra plumbing
    // through _renderRow()/_renderSubtaskList().
    this._cardEl.classList.toggle("touch-optimized", this._touchOptimized);
    this._detailSlot.classList.toggle("touch-optimized", this._touchOptimized);
    this._setupTagDrag();
  }

  // Builds the markup for one group section (tag/due-date/etc. heading plus
  // its rows). data-group-key lets both this method's caller and the
  // Sortable onEnd handler below identify which tag a .group element is,
  // without needing to keep a separate parallel array in sync.
  _renderGroup(group, projectKind, showDragHandle) {
    const handle = showDragHandle
      ? `<span class="group-drag-handle" title="${escapeHtml(this._t("dragToReorderTag"))}"><ha-icon icon="mdi:drag-vertical"></ha-icon></span>`
      : "";
    return `
        <div class="group" data-group-key="${escapeHtml(group.key)}">
          ${
            group.label
              ? `<div class="group-header">${
                  group.color
                    ? `<span class="group-header-tag" style="background:${group.color}">${escapeHtml(group.label)}</span>`
                    : escapeHtml(group.label)
                }<span class="count">${group.items.length}</span>${handle}</div>`
              : ""
          }
          ${group.items
            .map((item) =>
              this._renderRow(item, projectKind, this._sortBy === "tag" ? group.key : null)
            )
            .join("")}
        </div>`;
  }

  // (Re-)creates the Sortable instance driving tag-heading drag reordering.
  // Called at the end of every _render() - which always rebuilds the whole
  // .tag-groups subtree from scratch - so any previous instance would
  // otherwise be left pointing at DOM nodes that no longer exist.
  _setupTagDrag() {
    if (this._sortable) {
      this._sortable.destroy();
      this._sortable = null;
    }
    if (this._sortBy !== "tag") return;
    const container = this._cardEl.querySelector(".tag-groups");
    if (!container) return;
    this._sortable = new Sortable(container, {
      handle: ".group-drag-handle",
      animation: 150,
      ghostClass: "group-drag-ghost",
      chosenClass: "group-drag-chosen",
      onStart: () => {
        this._tagDragActive = true;
      },
      onEnd: () => {
        this._tagDragActive = false;
        // Sortable has already physically reordered the .group elements at
        // this point, so reading data-group-key straight off the DOM here
        // gives the new order directly - applyTagOrder is only used for
        // consistency with _groupOpenItems, not to resolve any conflict
        // (storedOrder and presentTags are the same list here).
        const domOrder = [...container.querySelectorAll(":scope > .group")].map(
          (el) => el.dataset.groupKey
        );
        this._tagOrder = applyTagOrder(domOrder, domOrder);
        this._persistState();
        this._render();
      },
    });
  }

  _styles() {
    return `<style>
      :host {
        --ticktick-priority-none-color: var(--secondary-text-color, #9e9e9e);
        --ticktick-priority-low-color: #4772fa;
        --ticktick-priority-medium-color: #ff9f0a;
        --ticktick-priority-high-color: #f2454a;
      }
      :host { display: block; height: 100%; }
      /* Purely a stable mount point for the detail overlay's innerHTML
         (see _ensureDom) - the overlay itself is position:fixed and
         doesn't need a positioned/sized ancestor, so this shouldn't
         generate a box of its own at all. */
      .detail-slot { display: contents; }
      ha-card {
        /* ha-card already themes its own background/border/border-radius/
           box-shadow just by using the element - none of that needs
           setting here, it comes from the dashboard/theme automatically. */
        padding: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px 4px 16px;
        position: relative;
        flex-shrink: 0;
      }
      .title {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .controls { display: flex; gap: 4px; }
      .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        padding: 6px;
        border-radius: 6px;
        display: flex;
        /* Only ever wraps an <ha-icon> (no visible text), but this class is
           also used on a plain <a> now (the link preview's "open in new
           tab" action) - a default link underline/color would otherwise
           flash under the icon on some browsers/themes. */
        text-decoration: none;
      }
      .icon-btn:hover { background: var(--divider-color); }
      #menu-toggle {
        /* The button's own padding otherwise insets the icon glyph past
           where the row divider lines end on the right - cancel exactly
           that padding so the icon lines up flush with them instead. */
        margin-right: -6px;
      }
      #menu-toggle ha-icon { --mdc-icon-size: 17px; }
      .menu-popup {
        position: absolute;
        top: 100%;
        right: 16px;
        margin-top: 6px;
        box-sizing: border-box;
        /* This popup is visually an extension of ha-card itself (it hangs
           directly off the card's own header), not a separate floating
           menu or a dialog - so unlike .detail-card below (a genuine modal,
           mirroring ha-dialog's tokens instead), it mirrors ha-card's own
           border/radius chain exactly (verified against the real HA
           frontend bundle), right down to the 1px border ha-card renders
           by default. A theme that reskins its cards' border/radius then
           reskins this popup's border/radius the same way. Background is
           its own fixed dark-glass look instead (see below), not mirrored
           from the theme. */
        /* Frosted glass, not a solid panel: an opaque background (ha-card's
           own real default) would make the blur below invisible - there'd
           be nothing showing through it to blur. Deliberately a fixed
           dark gray rather than the theme's own (possibly light) card
           color, so the frosted look stays consistent across themes
           instead of flipping to a white pane on light dashboards.
           Text/icon/divider colors inside the popup are locally
           overridden right below for the same reason - a fixed dark
           background needs fixed light text, not whatever --primary-
           text-color the active theme happens to use. */
        background: rgba(28, 28, 30, 0.8);
        --primary-text-color: #fff;
        --secondary-text-color: rgba(255, 255, 255, 0.7);
        --divider-color: rgba(255, 255, 255, 0.16);
        /* Real frosted-glass recipe (blur + a saturation boost so colors
           showing through don't just look washed-out gray): mirrors
           --ha-card-backdrop-filter so a theme's own explicit choice still
           wins, same as the box-shadow fallback below, but with a strong
           blur+saturate default instead of ha-card's real "none" - a plain
           blur alone reads muddy without the saturation boost. -webkit-
           prefix included because Safari still requires it for
           backdrop-filter to apply at all (verified against ha-card's own
           real CSS, which carries the same prefix for the same reason). */
        -webkit-backdrop-filter: var(--ha-card-backdrop-filter, blur(60px) saturate(200%));
        backdrop-filter: var(--ha-card-backdrop-filter, blur(60px) saturate(200%));
        border: var(--ha-card-border-width, 1px) solid
          var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
        color: var(--primary-text-color);
        /* --ha-card-box-shadow's own real default (verified against HA's
           frontend bundle) is "none" - fine for ha-card itself, but wrong
           here since this is an always-elevated overlay that needs visual
           separation from the page even when a theme flattens its cards.
           Reusing the variable still lets a theme's explicit box-shadow
           choice carry over; the fallback is our own elevation shadow, not
           the token's real default. */
        box-shadow: var(--ha-card-box-shadow, 0 4px 16px rgba(0, 0, 0, 0.35));
        min-width: 240px;
        overflow: hidden;
        z-index: 50;
        font-size: 0.88em;
      }
      .menu-popup-wide { min-width: 270px; max-width: 310px; }
      .menu-row, .menu-option, .menu-back {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 14px;
        cursor: pointer;
      }
      .menu-row:hover, .menu-option:hover, .menu-back:hover {
        background: var(--divider-color);
      }
      .menu-row-label, .menu-row-value {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .menu-row-value { gap: 4px; color: var(--secondary-text-color); }
      .menu-row-label ha-icon { --mdc-icon-size: 17px; color: var(--secondary-text-color); }
      .menu-row-value ha-icon { --mdc-icon-size: 17px; color: var(--secondary-text-color); }
      .menu-back {
        justify-content: flex-start;
        font-weight: 500;
        border-bottom: 1px solid var(--divider-color);
      }
      .menu-back ha-icon { --mdc-icon-size: 17px; }
      .menu-option.active { color: var(--primary-color); }
      .menu-option.active .menu-row-label ha-icon { color: var(--primary-color); }
      .menu-check { --mdc-icon-size: 17px; color: var(--primary-color); }
      .menu-filter-body {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 14px;
        max-height: 360px;
        overflow-y: auto;
      }
      .filter-group { display: flex; flex-direction: column; gap: 8px; }
      .filter-group-title {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--secondary-text-color);
        font-size: 0.85em;
      }
      .filter-group-title ha-icon { --mdc-icon-size: 16px; }
      .filter-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .chip {
        border: 1px solid var(--divider-color);
        background: none;
        border-radius: 8px;
        padding: 9px 14px;
        min-height: 38px;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        color: var(--primary-text-color);
        font-size: 0.95em;
      }
      /* Priority/tag chips set --chip-color inline (priority: the same
         --ticktick-priority-*-color used for the checkboxes; tag: that
         tag's own palette swatch) so an active chip reads as "this
         priority/tag" at a glance. Chips without a --chip-color (the
         Fälligkeit/due-bucket group) fall back to the plain accent color. */
      .chip.active { background: var(--chip-color, var(--primary-color)); color: var(--text-primary-color, #fff); border-color: var(--chip-color, var(--primary-color)); }
      .list-body {
        padding: 4px 0 8px 0;
        flex: 1;
        min-height: 0;
        overflow-x: hidden;
        overflow-y: auto;
        /* Row content (hover highlights, dividers) reaches edge-to-edge,
           so without this it can paint past ha-card's own rounded bottom
           corners as a square instead of following them - the header
           above has no fill of its own, so the top corners already show
           ha-card's real background/rounding through untouched and don't
           need the same treatment. Scoped to just this element (not
           ha-card itself) so the sort/filter popup - anchored to the
           header, and taller than a short fixed-height card can be - stays
           free to overflow past the card's own bottom edge as before.
           --ha-card-border-radius itself falls back to the more general
           --ha-border-radius-lg design token (both default to 12px) if a
           theme doesn't set it directly - mirroring that exact chain here
           (rather than just falling straight to a hardcoded 12px) is what
           keeps this matching custom themes that only customize the more
           general token. */
        border-radius: 0 0 var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px))
          var(--ha-card-border-radius, var(--ha-border-radius-lg, 12px));
      }
      .group-header {
        padding: 8px 16px 4px 16px;
        font-weight: 600;
        color: var(--secondary-text-color);
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .group-header .count { font-weight: 400; opacity: 0.7; margin-left: 8px; }
      .group-header-tag {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        color: #fff;
      }
      /* Wrapper purely for handing the real tag groups to Sortable as one
         container (see _setupTagDrag()) - display:contents keeps its
         children participating in .list-body's normal flow exactly as if
         this wrapper weren't there at all. */
      .tag-groups {
        display: contents;
      }
      .group-drag-handle {
        display: inline-flex;
        align-items: center;
        margin-left: auto;
        cursor: grab;
        color: var(--secondary-text-color);
        opacity: 0.6;
      }
      .group-drag-handle:hover { opacity: 1; }
      .group-drag-handle ha-icon { --mdc-icon-size: 16px; }
      .group-drag-handle:active { cursor: grabbing; }
      .group-drag-ghost {
        opacity: 0.4;
      }
      .group-drag-chosen {
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
        background: var(--card-background-color, #fff);
        border-radius: 8px;
      }
      .row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        /* No bottom padding here (unlike the top) - row-main's own
           padding-bottom+border below is the only spacing after the
           divider line, so .row's box starts exactly at the line above it
           (the previous row's border) and ends exactly at its own line,
           with no extra dead space on either side. */
        padding: 8px 16px 0 16px;
        cursor: pointer;
        position: relative;
        /* Without this, .row (position:relative but z-index:auto) doesn't
           establish its own stacking context, so the ::before's z-index:-1
           below escapes it entirely and paints behind ha-card's own opaque
           background instead of just behind this row's own content -
           making the hover highlight invisible rather than just tucked
           behind the checkbox/text. */
        isolation: isolate;
      }
      /* The hover highlight is a separate layer covering .row's own box
         (which, per the padding note above, spans from the divider line
         above this row to this row's own divider line below), extended 1px
         further up to paint over that upper line too - same color as the
         line itself, so it reads as one continuous highlighted block
         instead of stopping just short of it. The row's OWN line below is
         a child (row-main)'s border, always painted on top of this layer
         regardless of extent, so only the upper line (a previous, already
         painted sibling) can actually be covered this way. z-index -1
         keeps it behind the row's normal-flow content (checkbox/row-main),
         painting only underneath it. */
      .row::before {
        content: "";
        position: absolute;
        top: -1px;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: -1;
      }
      .row:hover::before { background: var(--divider-color); }
      .row-main {
        flex: 1;
        min-width: 0;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }
      /* Standard clearfix: without this, a row whose title is short enough
         to fit entirely beside the floated .due badge (and has no
         content-line below to clear it, e.g. no description/tags) would
         let that float poke out past row-main's own bottom edge instead of
         being counted in its height - this keeps the divider line below
         always landing right after the taller of the two. */
      .row-main::after {
        content: "";
        display: block;
        clear: both;
      }
      .row:last-child .row-main { border-bottom: none; }
      /* The hover overlay above already paints over the line ABOVE this
         row (it extends 1px past its own top edge for exactly that). This
         row's OWN line is a child (row-main)'s border though, which always
         paints on top of the row's own background/pseudo regardless of
         z-index - color-swapping it to transparent (not removing it, to
         avoid a layout shift) is the only way to hide that one too, so a
         hovered row reads as one clean block with no border seams at all. */
      .row:hover .row-main { border-bottom-color: transparent; }
      .row-title { color: var(--primary-text-color); word-break: break-word; }
      .row-content { color: var(--secondary-text-color); font-size: 0.88em; margin-top: 2px; word-break: break-word; }
      .row-content.clamp {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .row-content a, .row-title a, .detail-title a, .detail-body a {
        color: var(--primary-color);
        text-decoration: none;
      }
      .task-row.completed .row-title { text-decoration: line-through; color: var(--secondary-text-color); }
      /* clear:both keeps this always full-width below the floated .due
         badge (see .due above) - only the title above it wraps around that
         corner badge, the description/tags line never does. */
      .content-line { display: flex; align-items: center; gap: 8px; min-width: 0; margin-top: 2px; clear: both; }
      .content-line .row-content { margin-top: 0; flex: 1; min-width: 0; }
      .tag-squares { display: flex; gap: 4px; flex-shrink: 0; margin-left: auto; }
      .tag-square { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
      .checkbox, .note-checkbox {
        font: inherit;
        box-sizing: border-box;
        width: 1em;
        height: 1em;
        min-width: 1em;
        border-radius: 5px;
        border: 1px solid var(--ticktick-priority-none-color);
        background: color-mix(in srgb, var(--ticktick-priority-none-color) 8%, transparent);
        color: var(--ticktick-priority-none-color);
        margin-top: 2px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .checkbox { cursor: pointer; position: relative; }
      .note-checkbox { cursor: default; }
      /* Touch-Optimierung (see setConfig/_render): the checkbox itself
         stays exactly 1em (its normal visual size) - only its tappable
         area grows, via an invisible ::before extending past the box on
         every side. A generated pseudo-element isn't independently
         click-targetable, so a tap anywhere in that extended zone still
         resolves to ev.target being the real .checkbox button in
         _onClick(), no JS changes needed beyond the class toggle. Applies
         to both the row list (.checkbox) and the detail dialog's
         checklist (.subtask-checkbox carries the same base class) - kept
         modest rather than maximal so it doesn't eat into the row's own
         much larger "tap anywhere else to open detail" area right next
         to it. */
      .touch-optimized .checkbox::before {
        content: "";
        position: absolute;
        inset: -10px;
      }
      .note-checkbox svg {
        width: 62%;
        height: 62%;
        overflow: visible;
      }
      .note-checkbox svg text { font-size: 22px; }
      .checklist-lines { display: flex; flex-direction: column; gap: 0.16em; width: 55%; margin-left: 0.1em; }
      .checklist-lines span { display: block; height: 1px; background: currentColor; border-radius: 0; }
      .checkbox.checked .checklist-lines span { background: var(--card-background-color, #fff); }
      /* Only ever rendered on a checked checkbox, so the checkmark can
         always be the light color that reads against the solid
         priority-colored fill .checkbox.checked gets below. */
      .check-icon { width: 62%; height: 62%; overflow: visible; }
      .check-icon path { stroke: var(--card-background-color, #fff); }
      .checkbox.priority-low, .note-checkbox.priority-low {
        border-color: var(--ticktick-priority-low-color);
        background: color-mix(in srgb, var(--ticktick-priority-low-color) 8%, transparent);
        color: var(--ticktick-priority-low-color);
      }
      .checkbox.priority-medium, .note-checkbox.priority-medium {
        border-color: var(--ticktick-priority-medium-color);
        background: color-mix(in srgb, var(--ticktick-priority-medium-color) 8%, transparent);
        color: var(--ticktick-priority-medium-color);
      }
      .checkbox.priority-high, .note-checkbox.priority-high {
        border-color: var(--ticktick-priority-high-color);
        background: color-mix(in srgb, var(--ticktick-priority-high-color) 8%, transparent);
        color: var(--ticktick-priority-high-color);
      }
      .checkbox.checked { background: var(--ticktick-priority-none-color); }
      .checkbox.priority-low.checked { background: var(--ticktick-priority-low-color); }
      .checkbox.priority-medium.checked { background: var(--ticktick-priority-medium-color); }
      .checkbox.priority-high.checked { background: var(--ticktick-priority-high-color); }
      .due {
        font-size: 0.82em;
        color: var(--secondary-text-color);
        white-space: nowrap;
        /* Floated (not absolutely positioned, not a flex sibling) and
           placed as row-main's first child, right before .row-title below
           - a float only pulls the inline text that follows it in the same
           block formatting context around itself, so only the title wraps
           around this corner badge. It deliberately does NOT shrink
           row-main's own box (the content-line/border-bottom below stay
           full width - see content-line's clear:both), unlike flex-basis
           siblings or a reserved padding would. */
        float: right;
        margin-left: 8px;
      }
      .due.overdue { color: var(--error-color, #db4437); }
      /* Same gap as .filter-chip-row - this reuses .chip/.chip.active
         itself too (see _renderDetailTagsRow()), so both popups' chip
         rows end up pixel-identical, not just similarly sized. */
      .tag-row { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 8px; }
      .empty, .warning { padding: 16px; color: var(--secondary-text-color); }
      .detail-overlay {
        position: fixed;
        inset: 0;
        /* Mirrors HA's own ha-dialog scrim exactly (verified against the
           real frontend bundle): a themeable color layer (defaulting to
           transparent, same as HA's own default) plus a brightness dip on
           whatever is behind it, rather than a flat hardcoded black
           overlay - so a theme that recolors its dialog scrim (dark/AMOLED
           themes commonly do) affects this overlay the same way it affects
           every native HA dialog. */
        background-color: var(--mdc-dialog-scrim-color, transparent);
        backdrop-filter: var(--ha-dialog-scrim-backdrop-filter, brightness(68%));
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
        padding: 16px;
        box-sizing: border-box;
      }
      .detail-card {
        /* The real ha-dialog surface token (verified against the actual
           frontend bundle: background:var(--ha-dialog-surface-background,
           var(--mdc-theme-surface,#fff)) is what every native HA dialog's
           own panel uses) rather than --card-background-color - a theme
           that gives dialogs a different surface tone than cards (some
           dark themes do) now renders this the same way it renders every
           other HA dialog, not like a card. */
        background: var(--ha-dialog-surface-background, var(--mdc-theme-surface, #fff));
        /* Also real (default "none", themeable) - mirrors the scrim's own
           backdrop-filter var below for the same reason. */
        backdrop-filter: var(--ha-dialog-surface-backdrop-filter, none);
        color: var(--primary-text-color);
        /* This overlay is a genuine modal dialog, not card chrome - so it
           mirrors ha-dialog's own radius chain (verified against the real
           frontend bundle) rather than ha-card's. --ha-dialog-border-radius
           falls back to the more general --ha-border-radius-2xl token,
           which defaults to 20px (not 12px) - mirroring the full chain
           keeps this matching a theme that only customizes the general
           token, same reasoning as .list-body's border-radius below. */
        border-radius: var(--ha-dialog-border-radius, var(--ha-border-radius-2xl, 20px));
        max-width: 480px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        /* --dialog-box-shadow is the real dialog elevation token (falls
           back through --ha-card-box-shadow, matching .menu-popup's own
           fallback, before finally landing on our own elevation shadow -
           --ha-card-box-shadow's real default is "none", so that middle
           fallback alone would be invisible on an unthemed instance). */
        box-shadow: var(--dialog-box-shadow, var(--ha-card-box-shadow, 0 4px 16px rgba(0, 0, 0, 0.35)));
      }
      .detail-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
        padding: 16px 16px 12px 16px;
        position: sticky;
        top: 0;
        background: inherit;
        border-radius: var(--ha-dialog-border-radius, var(--ha-border-radius-2xl, 20px))
          var(--ha-dialog-border-radius, var(--ha-border-radius-2xl, 20px)) 0 0;
      }
      /* Real dialogs color their header title via this dedicated token
         (verified against the frontend bundle) rather than the body's
         --primary-text-color directly, even though both default to the
         same value - a theme can then restyle just the header title. */
      .detail-title {
        font-size: 1.15em;
        font-weight: 500;
        word-break: break-word;
        color: var(--ha-dialog-header-title-color, var(--primary-text-color));
      }
      .detail-body { padding: 12px 16px 16px 16px; display: flex; flex-direction: column; gap: 18px; }
      .detail-section { font-size: 0.95em; }
      .detail-label { color: var(--secondary-text-color); font-size: 0.8em; margin-bottom: 2px; }
      /* The short due/start/priority/status facts as one wrapping row of
         inline "label value" pairs instead of a full-width block each -
         far less vertical space than the old one-row-per-fact layout. */
      .detail-facts { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 0.85em; }
      .detail-fact { display: flex; align-items: baseline; gap: 4px; }
      .detail-fact-label { color: var(--secondary-text-color); }
      .subtask-list { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
      .subtask-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
      .subtask-title { color: var(--primary-text-color); word-break: break-word; }
      .subtask-title.completed { text-decoration: line-through; color: var(--secondary-text-color); }
      /* Stacked above .detail-overlay (z-index 100) so the detail dialog
         stays visible/open underneath while a link preview is up - same
         scrim recipe as .detail-overlay, just a taller z-index. */
      .link-preview-overlay {
        position: fixed;
        inset: 0;
        background-color: var(--mdc-dialog-scrim-color, transparent);
        backdrop-filter: var(--ha-dialog-scrim-backdrop-filter, brightness(68%));
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 150;
        padding: 16px;
        box-sizing: border-box;
      }
      /* Near-fullscreen by design (per the "large window, almost
         fullscreen" request) rather than .detail-card's own fixed
         max-width, but otherwise the same real dialog tokens. */
      .link-preview-card {
        background: var(--ha-dialog-surface-background, var(--mdc-theme-surface, #fff));
        border-radius: var(--ha-dialog-border-radius, var(--ha-border-radius-2xl, 20px));
        box-shadow: var(--dialog-box-shadow, var(--ha-card-box-shadow, 0 4px 16px rgba(0, 0, 0, 0.35)));
        width: 95vw;
        height: 92vh;
        max-width: 1400px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .link-preview-header {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 8px 8px 14px;
        border-bottom: 1px solid var(--divider-color);
        flex-shrink: 0;
      }
      .link-preview-url {
        flex: 1;
        min-width: 0;
        color: var(--secondary-text-color);
        font-size: 0.85em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .link-preview-frame { flex: 1; min-height: 0; border: none; width: 100%; }
      .link-preview-message {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        text-align: center;
        padding: 32px;
      }
      .link-reader {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 24px;
        box-sizing: border-box;
      }
      .link-reader-title { font-size: 1.4em; font-weight: 600; margin-bottom: 12px; }
      /* Server-extracted/sanitized article content (see link_preview.py) -
         it arrives stripped of the source site's own classes/styles, so
         its typography is entirely ours here rather than inherited. */
      .link-reader-content {
        max-width: 720px;
        margin: 0 auto;
        line-height: 1.6;
      }
      .link-reader-content :is(h1, h2, h3, h4, h5, h6) { margin: 1.2em 0 0.5em; line-height: 1.3; }
      .link-reader-content p { margin: 0 0 1em; }
      .link-reader-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.5em 0; }
      .link-reader-content a { color: var(--primary-color); }
      .link-reader-content :is(ul, ol) { padding-left: 1.4em; margin: 0 0 1em; }
      .link-reader-content blockquote {
        margin: 0 0 1em;
        padding-left: 12px;
        border-left: 3px solid var(--divider-color);
        color: var(--secondary-text-color);
      }
      /* The generic (non-Recipe-JSON-LD) extraction path can carry over a
         source page's own <table> as-is (e.g. an ingredient list) with no
         styling of its own otherwise. */
      .link-reader-content table { width: 100%; border-collapse: collapse; margin: 0 0 1em; }
      .link-reader-content td { padding: 4px 8px 4px 0; border-bottom: 1px solid var(--divider-color); }
    </style>`;
  }
}

class TickTickListCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _t(key) {
    return t(key, this._hass?.locale?.language);
  }

  _schema() {
    // Sort/filter defaults are configured live in the card's own popup menu
    // instead (see MENU_FIELDS). Height/width live in HA's own native
    // "Layout" tab (via getGridOptions() on the card), not here - the card
    // just fills whatever height that tab gives it (see _styles()).
    return [
      { name: "entity", selector: { entity: { domain: "sensor", integration: "ticktick" } } },
      { name: "title", selector: { text: {} } },
      { name: "touch_optimized", selector: { boolean: {} } },
    ];
  }

  _labels() {
    return {
      entity: this._t("editorEntity"),
      title: this._t("editorTitle"),
      touch_optimized: this._t("editorTouchOptimized"),
    };
  }

  _render() {
    if (!this._hass) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        this._config = ev.detail.value;
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config: this._config } })
        );
      });
      this.innerHTML = "";
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    // touch_optimized defaults to off (see TickTickListCard.setConfig)
    // when absent from config entirely - spelled out here too so the
    // toggle itself reflects that default instead of showing on/checked
    // for every card that simply hasn't touched this setting yet.
    this._form.data = { touch_optimized: false, ...this._config };
    this._form.schema = this._schema();
    this._form.computeLabel = (schemaItem) => this._labels()[schemaItem.name] || schemaItem.name;
  }
}

customElements.define("ticktick-list-card", TickTickListCard);
customElements.define("ticktick-list-card-editor", TickTickListCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ticktick-list-card",
  name: "TickTick List",
  // The card picker isn't tied to any specific dashboard/entity here, so
  // there's no hass.locale to read - the browser's own language is the
  // best available signal for this one description string.
  description: t("cardDescription", typeof navigator !== "undefined" ? navigator.language : undefined),
});

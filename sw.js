try{self["workbox:core:7.4.0"]&&_()}catch(t){}const qt=(t,...e)=>{let n=t;return e.length>0&&(n+=" :: ".concat(JSON.stringify(e))),n},zt=qt;class m extends Error{constructor(e,n){const r=zt(e,n);super(r),this.name=e,this.details=n}}const I={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:typeof registration<"u"?registration.scope:""},se=t=>[I.prefix,t,I.suffix].filter(e=>e&&e.length>0).join("-"),Gt=t=>{for(const e of Object.keys(I))t(e)},Z={updateDetails:t=>{Gt(e=>{typeof t[e]=="string"&&(I[e]=t[e])})},getGoogleAnalyticsName:t=>t||se(I.googleAnalytics),getPrecacheName:t=>t||se(I.precache),getPrefix:()=>I.prefix,getRuntimeName:t=>t||se(I.runtime),getSuffix:()=>I.suffix};function je(t,e){const n=e();return t.waitUntil(n),n}try{self["workbox:precaching:7.4.0"]&&_()}catch(t){}const Yt="__WB_REVISION__";function Jt(t){if(!t)throw new m("add-to-cache-list-unexpected-type",{entry:t});if(typeof t=="string"){const o=new URL(t,location.href);return{cacheKey:o.href,url:o.href}}const{revision:e,url:n}=t;if(!n)throw new m("add-to-cache-list-unexpected-type",{entry:t});if(!e){const o=new URL(n,location.href);return{cacheKey:o.href,url:o.href}}const r=new URL(n,location.href),s=new URL(n,location.href);return r.searchParams.set(Yt,e),{cacheKey:r.href,url:s.href}}class Xt{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:n})=>{n&&(n.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:n,cachedResponse:r})=>{if(e.type==="install"&&n&&n.originalRequest&&n.originalRequest instanceof Request){const s=n.originalRequest.url;r?this.notUpdatedURLs.push(s):this.updatedURLs.push(s)}return r}}}class Qt{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:n,params:r})=>{const s=(r==null?void 0:r.cacheKey)||this._precacheController.getCacheKeyForURL(n.url);return s?new Request(s,{headers:n.headers}):n},this._precacheController=e}}let K;function Zt(){if(K===void 0){const t=new Response("");if("body"in t)try{new Response(t.body),K=!0}catch(e){K=!1}K=!1}return K}async function en(t,e){let n=null;if(t.url&&(n=new URL(t.url).origin),n!==self.location.origin)throw new m("cross-origin-copy-response",{origin:n});const r=t.clone(),o={headers:new Headers(r.headers),status:r.status,statusText:r.statusText},a=Zt()?r.body:await r.blob();return new Response(a,o)}const tn=t=>new URL(String(t),location.href).href.replace(new RegExp("^".concat(location.origin)),"");function xe(t,e){const n=new URL(t);for(const r of e)n.searchParams.delete(r);return n.href}async function nn(t,e,n,r){const s=xe(e.url,n);if(e.url===s)return t.match(e,r);const o=Object.assign(Object.assign({},r),{ignoreSearch:!0}),a=await t.keys(e,o);for(const i of a){const c=xe(i.url,n);if(s===c)return t.match(i,r)}}let rn=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};const sn=new Set;async function on(){for(const t of sn)await t()}function st(t){return new Promise(e=>setTimeout(e,t))}try{self["workbox:strategies:7.4.0"]&&_()}catch(t){}function q(t){return typeof t=="string"?new Request(t):t}class an{constructor(e,n){this._cacheKeys={},Object.assign(this,n),this.event=n.event,this._strategy=e,this._handlerDeferred=new rn,this._extendLifetimePromises=[],this._plugins=[...e.plugins],this._pluginStateMap=new Map;for(const r of this._plugins)this._pluginStateMap.set(r,{});this.event.waitUntil(this._handlerDeferred.promise)}async fetch(e){const{event:n}=this;let r=q(e);if(r.mode==="navigate"&&n instanceof FetchEvent&&n.preloadResponse){const a=await n.preloadResponse;if(a)return a}const s=this.hasCallback("fetchDidFail")?r.clone():null;try{for(const a of this.iterateCallbacks("requestWillFetch"))r=await a({request:r.clone(),event:n})}catch(a){if(a instanceof Error)throw new m("plugin-error-request-will-fetch",{thrownErrorMessage:a.message})}const o=r.clone();try{let a;a=await fetch(r,r.mode==="navigate"?void 0:this._strategy.fetchOptions);for(const i of this.iterateCallbacks("fetchDidSucceed"))a=await i({event:n,request:o,response:a});return a}catch(a){throw s&&await this.runCallbacks("fetchDidFail",{error:a,event:n,originalRequest:s.clone(),request:o.clone()}),a}}async fetchAndCachePut(e){const n=await this.fetch(e),r=n.clone();return this.waitUntil(this.cachePut(e,r)),n}async cacheMatch(e){const n=q(e);let r;const{cacheName:s,matchOptions:o}=this._strategy,a=await this.getCacheKey(n,"read"),i=Object.assign(Object.assign({},o),{cacheName:s});r=await caches.match(a,i);for(const c of this.iterateCallbacks("cachedResponseWillBeUsed"))r=await c({cacheName:s,matchOptions:o,cachedResponse:r,request:a,event:this.event})||void 0;return r}async cachePut(e,n){const r=q(e);await st(0);const s=await this.getCacheKey(r,"write");if(!n)throw new m("cache-put-with-no-response",{url:tn(s.url)});const o=await this._ensureResponseSafeToCache(n);if(!o)return!1;const{cacheName:a,matchOptions:i}=this._strategy,c=await self.caches.open(a),l=this.hasCallback("cacheDidUpdate"),u=l?await nn(c,s.clone(),["__WB_REVISION__"],i):null;try{await c.put(s,l?o.clone():o)}catch(h){if(h instanceof Error)throw h.name==="QuotaExceededError"&&await on(),h}for(const h of this.iterateCallbacks("cacheDidUpdate"))await h({cacheName:a,oldResponse:u,newResponse:o.clone(),request:s,event:this.event});return!0}async getCacheKey(e,n){const r="".concat(e.url," | ").concat(n);if(!this._cacheKeys[r]){let s=e;for(const o of this.iterateCallbacks("cacheKeyWillBeUsed"))s=q(await o({mode:n,request:s,event:this.event,params:this.params}));this._cacheKeys[r]=s}return this._cacheKeys[r]}hasCallback(e){for(const n of this._strategy.plugins)if(e in n)return!0;return!1}async runCallbacks(e,n){for(const r of this.iterateCallbacks(e))await r(n)}*iterateCallbacks(e){for(const n of this._strategy.plugins)if(typeof n[e]=="function"){const r=this._pluginStateMap.get(n);yield o=>{const a=Object.assign(Object.assign({},o),{state:r});return n[e](a)}}}waitUntil(e){return this._extendLifetimePromises.push(e),e}async doneWaiting(){for(;this._extendLifetimePromises.length;){const e=this._extendLifetimePromises.splice(0),r=(await Promise.allSettled(e)).find(s=>s.status==="rejected");if(r)throw r.reason}}destroy(){this._handlerDeferred.resolve(null)}async _ensureResponseSafeToCache(e){let n=e,r=!1;for(const s of this.iterateCallbacks("cacheWillUpdate"))if(n=await s({request:this.request,response:n,event:this.event})||void 0,r=!0,!n)break;return r||n&&n.status!==200&&(n=void 0),n}}class ot{constructor(e={}){this.cacheName=Z.getRuntimeName(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[n]=this.handleAll(e);return n}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const n=e.event,r=typeof e.request=="string"?new Request(e.request):e.request,s="params"in e?e.params:void 0,o=new an(this,{event:n,request:r,params:s}),a=this._getResponse(o,r,n),i=this._awaitComplete(a,o,r,n);return[a,i]}async _getResponse(e,n,r){await e.runCallbacks("handlerWillStart",{event:r,request:n});let s;try{if(s=await this._handle(n,e),!s||s.type==="error")throw new m("no-response",{url:n.url})}catch(o){if(o instanceof Error){for(const a of e.iterateCallbacks("handlerDidError"))if(s=await a({error:o,event:r,request:n}),s)break}if(!s)throw o}for(const o of e.iterateCallbacks("handlerWillRespond"))s=await o({event:r,request:n,response:s});return s}async _awaitComplete(e,n,r,s){let o,a;try{o=await e}catch(i){}try{await n.runCallbacks("handlerDidRespond",{event:s,request:r,response:o}),await n.doneWaiting()}catch(i){i instanceof Error&&(a=i)}if(await n.runCallbacks("handlerDidComplete",{event:s,request:r,response:o,error:a}),n.destroy(),a)throw a}}class v extends ot{constructor(e={}){e.cacheName=Z.getPrecacheName(e.cacheName),super(e),this._fallbackToNetwork=e.fallbackToNetwork!==!1,this.plugins.push(v.copyRedirectedCacheableResponsesPlugin)}async _handle(e,n){const r=await n.cacheMatch(e);return r||(n.event&&n.event.type==="install"?await this._handleInstall(e,n):await this._handleFetch(e,n))}async _handleFetch(e,n){let r;const s=n.params||{};if(this._fallbackToNetwork){const o=s.integrity,a=e.integrity,i=!a||a===o;r=await n.fetch(new Request(e,{integrity:e.mode!=="no-cors"?a||o:void 0})),o&&i&&e.mode!=="no-cors"&&(this._useDefaultCacheabilityPluginIfNeeded(),await n.cachePut(e,r.clone()))}else throw new m("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return r}async _handleInstall(e,n){this._useDefaultCacheabilityPluginIfNeeded();const r=await n.fetch(e);if(!await n.cachePut(e,r.clone()))throw new m("bad-precaching-response",{url:e.url,status:r.status});return r}_useDefaultCacheabilityPluginIfNeeded(){let e=null,n=0;for(const[r,s]of this.plugins.entries())s!==v.copyRedirectedCacheableResponsesPlugin&&(s===v.defaultPrecacheCacheabilityPlugin&&(e=r),s.cacheWillUpdate&&n++);n===0?this.plugins.push(v.defaultPrecacheCacheabilityPlugin):n>1&&e!==null&&this.plugins.splice(e,1)}}v.defaultPrecacheCacheabilityPlugin={async cacheWillUpdate({response:t}){return!t||t.status>=400?null:t}};v.copyRedirectedCacheableResponsesPlugin={async cacheWillUpdate({response:t}){return t.redirected?await en(t):t}};class cn{constructor({cacheName:e,plugins:n=[],fallbackToNetwork:r=!0}={}){this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map,this._strategy=new v({cacheName:Z.getPrecacheName(e),plugins:[...n,new Qt({precacheController:this})],fallbackToNetwork:r}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this._strategy}precache(e){this.addToCacheList(e),this._installAndActiveListenersAdded||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this._installAndActiveListenersAdded=!0)}addToCacheList(e){const n=[];for(const r of e){typeof r=="string"?n.push(r):r&&r.revision===void 0&&n.push(r.url);const{cacheKey:s,url:o}=Jt(r),a=typeof r!="string"&&r.revision?"reload":"default";if(this._urlsToCacheKeys.has(o)&&this._urlsToCacheKeys.get(o)!==s)throw new m("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(o),secondEntry:s});if(typeof r!="string"&&r.integrity){if(this._cacheKeysToIntegrities.has(s)&&this._cacheKeysToIntegrities.get(s)!==r.integrity)throw new m("add-to-cache-list-conflicting-integrities",{url:o});this._cacheKeysToIntegrities.set(s,r.integrity)}if(this._urlsToCacheKeys.set(o,s),this._urlsToCacheModes.set(o,a),n.length>0){const i="Workbox is precaching URLs without revision info: ".concat(n.join(", "),"\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache");console.warn(i)}}}install(e){return je(e,async()=>{const n=new Xt;this.strategy.plugins.push(n);for(const[o,a]of this._urlsToCacheKeys){const i=this._cacheKeysToIntegrities.get(a),c=this._urlsToCacheModes.get(o),l=new Request(o,{integrity:i,cache:c,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:a},request:l,event:e}))}const{updatedURLs:r,notUpdatedURLs:s}=n;return{updatedURLs:r,notUpdatedURLs:s}})}activate(e){return je(e,async()=>{const n=await self.caches.open(this.strategy.cacheName),r=await n.keys(),s=new Set(this._urlsToCacheKeys.values()),o=[];for(const a of r)s.has(a.url)||(await n.delete(a),o.push(a.url));return{deletedURLs:o}})}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const n=new URL(e,location.href);return this._urlsToCacheKeys.get(n.href)}getIntegrityForCacheKey(e){return this._cacheKeysToIntegrities.get(e)}async matchPrecache(e){const n=e instanceof Request?e.url:e,r=this.getCacheKeyForURL(n);if(r)return(await self.caches.open(this.strategy.cacheName)).match(r)}createHandlerBoundToURL(e){const n=this.getCacheKeyForURL(e);if(!n)throw new m("non-precached-url",{url:e});return r=>(r.request=new Request(e),r.params=Object.assign({cacheKey:n},r.params),this.strategy.handle(r))}}let oe;const at=()=>(oe||(oe=new cn),oe);try{self["workbox:routing:7.4.0"]&&_()}catch(t){}const it="GET",z=t=>t&&typeof t=="object"?t:{handle:t};class ${constructor(e,n,r=it){this.handler=z(n),this.match=e,this.method=r}setCatchHandler(e){this.catchHandler=z(e)}}class ln extends ${constructor(e,n,r){const s=({url:o})=>{const a=e.exec(o.href);if(a&&!(o.origin!==location.origin&&a.index!==0))return a.slice(1)};super(s,n,r)}}class un{constructor(){this._routes=new Map,this._defaultHandlerMap=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",e=>{const{request:n}=e,r=this.handleRequest({request:n,event:e});r&&e.respondWith(r)})}addCacheListener(){self.addEventListener("message",e=>{if(e.data&&e.data.type==="CACHE_URLS"){const{payload:n}=e.data,r=Promise.all(n.urlsToCache.map(s=>{typeof s=="string"&&(s=[s]);const o=new Request(...s);return this.handleRequest({request:o,event:e})}));e.waitUntil(r),e.ports&&e.ports[0]&&r.then(()=>e.ports[0].postMessage(!0))}})}handleRequest({request:e,event:n}){const r=new URL(e.url,location.href);if(!r.protocol.startsWith("http"))return;const s=r.origin===location.origin,{params:o,route:a}=this.findMatchingRoute({event:n,request:e,sameOrigin:s,url:r});let i=a&&a.handler;const c=e.method;if(!i&&this._defaultHandlerMap.has(c)&&(i=this._defaultHandlerMap.get(c)),!i)return;let l;try{l=i.handle({url:r,request:e,event:n,params:o})}catch(h){l=Promise.reject(h)}const u=a&&a.catchHandler;return l instanceof Promise&&(this._catchHandler||u)&&(l=l.catch(async h=>{if(u)try{return await u.handle({url:r,request:e,event:n,params:o})}catch(f){f instanceof Error&&(h=f)}if(this._catchHandler)return this._catchHandler.handle({url:r,request:e,event:n});throw h})),l}findMatchingRoute({url:e,sameOrigin:n,request:r,event:s}){const o=this._routes.get(r.method)||[];for(const a of o){let i;const c=a.match({url:e,sameOrigin:n,request:r,event:s});if(c)return i=c,(Array.isArray(i)&&i.length===0||c.constructor===Object&&Object.keys(c).length===0||typeof c=="boolean")&&(i=void 0),{route:a,params:i}}return{}}setDefaultHandler(e,n=it){this._defaultHandlerMap.set(n,z(e))}setCatchHandler(e){this._catchHandler=z(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new m("unregister-route-but-not-found-with-method",{method:e.method});const n=this._routes.get(e.method).indexOf(e);if(n>-1)this._routes.get(e.method).splice(n,1);else throw new m("unregister-route-route-not-registered")}}let V;const hn=()=>(V||(V=new un,V.addFetchListener(),V.addCacheListener()),V);function ct(t,e,n){let r;if(typeof t=="string"){const o=new URL(t,location.href),a=({url:i})=>i.href===o.href;r=new $(a,e,n)}else if(t instanceof RegExp)r=new ln(t,e,n);else if(typeof t=="function")r=new $(t,e,n);else if(t instanceof $)r=t;else throw new m("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});return hn().registerRoute(r),r}function dn(t,e=[]){for(const n of[...t.searchParams.keys()])e.some(r=>r.test(n))&&t.searchParams.delete(n);return t}function*fn(t,{ignoreURLParametersMatching:e=[/^utm_/,/^fbclid$/],directoryIndex:n="index.html",cleanURLs:r=!0,urlManipulation:s}={}){const o=new URL(t,location.href);o.hash="",yield o.href;const a=dn(o,e);if(yield a.href,n&&a.pathname.endsWith("/")){const i=new URL(a.href);i.pathname+=n,yield i.href}if(r){const i=new URL(a.href);i.pathname+=".html",yield i.href}if(s){const i=s({url:o});for(const c of i)yield c.href}}class pn extends ${constructor(e,n){const r=({request:s})=>{const o=e.getURLsToCacheKeys();for(const a of fn(s.url,n)){const i=o.get(a);if(i){const c=e.getIntegrityForCacheKey(i);return{cacheKey:i,integrity:c}}}};super(r,e.strategy)}}function gn(t){const e=at(),n=new pn(e,t);ct(n)}const mn="-precache-",bn=async(t,e=mn)=>{const r=(await self.caches.keys()).filter(s=>s.includes(e)&&s.includes(self.registration.scope)&&s!==t);return await Promise.all(r.map(s=>self.caches.delete(s))),r};function wn(){self.addEventListener("activate",t=>{const e=Z.getPrecacheName();t.waitUntil(bn(e).then(n=>{}))})}function yn(t){at().precache(t)}function _n(t,e){yn(t),gn(e)}class Sn extends ${constructor(e,{allowlist:n=[/./],denylist:r=[]}={}){super(s=>this._match(s),e),this._allowlist=n,this._denylist=r}_match({url:e,request:n}){if(n&&n.mode!=="navigate")return!1;const r=e.pathname+e.search;for(const s of this._denylist)if(s.test(r))return!1;return!!this._allowlist.some(s=>s.test(r))}}class En extends ot{constructor(e={}){super(e),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}async _handle(e,n){let r,s;try{const o=[n.fetch(e)];if(this._networkTimeoutSeconds){const a=st(this._networkTimeoutSeconds*1e3);o.push(a)}if(s=await Promise.race(o),!s)throw new Error("Timed out the network response after ".concat(this._networkTimeoutSeconds," seconds."))}catch(o){o instanceof Error&&(r=o)}if(!s)throw new m("no-response",{url:e.url,error:r});return s}}const In=()=>{};var $e={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lt=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},An=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const o=t[n++];e[r++]=String.fromCharCode((s&31)<<6|o&63)}else if(s>239&&s<365){const o=t[n++],a=t[n++],i=t[n++],c=((s&7)<<18|(o&63)<<12|(a&63)<<6|i&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const o=t[n++],a=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(o&63)<<6|a&63)}}return e.join("")},ut={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const o=t[s],a=s+1<t.length,i=a?t[s+1]:0,c=s+2<t.length,l=c?t[s+2]:0,u=o>>2,h=(o&3)<<4|i>>4;let f=(i&15)<<2|l>>6,p=l&63;c||(p=64,a||(f=64)),r.push(n[u],n[h],n[f],n[p])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(lt(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):An(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const o=n[t.charAt(s++)],i=s<t.length?n[t.charAt(s)]:0;++s;const l=s<t.length?n[t.charAt(s)]:64;++s;const h=s<t.length?n[t.charAt(s)]:64;if(++s,o==null||i==null||l==null||h==null)throw new Cn;const f=o<<2|i>>4;if(r.push(f),l!==64){const p=i<<4&240|l>>2;if(r.push(p),h!==64){const b=l<<6&192|h;r.push(b)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Cn extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const vn=function(t){const e=lt(t);return ut.encodeByteArray(e,!0)},ht=function(t){return vn(t).replace(/\./g,"")},Tn=function(t){try{return ut.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dn(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rn=()=>Dn().__FIREBASE_DEFAULTS__,kn=()=>{if(typeof process>"u"||typeof $e>"u")return;const t=$e.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},On=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(n){return}const e=t&&Tn(t[1]);return e&&JSON.parse(e)},Nn=()=>{try{return In()||Rn()||kn()||On()}catch(t){console.info("Unable to get __FIREBASE_DEFAULTS__ due to: ".concat(t));return}},dt=()=>{var t;return(t=Nn())===null||t===void 0?void 0:t.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pn{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}function ft(){try{return typeof indexedDB=="object"}catch(t){return!1}}function pt(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var o;e(((o=s.error)===null||o===void 0?void 0:o.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mn="FirebaseError";class H extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=Mn,Object.setPrototypeOf(this,H.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ee.prototype.create)}}class ee{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s="".concat(this.service,"/").concat(e),o=this.errors[e],a=o?Ln(o,r):"Error",i="".concat(this.serviceName,": ").concat(a," (").concat(s,").");return new H(s,i,r)}}function Ln(t,e){return t.replace(Bn,(n,r)=>{const s=e[r];return s!=null?String(s):"<".concat(r,"?>")})}const Bn=/\{\$([^}]+)}/g;function be(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const o=t[s],a=e[s];if(Fe(o)&&Fe(a)){if(!be(o,a))return!1}else if(o!==a)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function Fe(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gt(t){return t&&t._delegate?t._delegate:t}class P{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const O="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jn{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Pn;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch(s){}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(o){if(s)return null;throw o}else{if(s)return null;throw Error("Service ".concat(this.name," is not available"))}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error("Mismatching Component ".concat(e.name," for Provider ").concat(this.name,"."));if(this.component)throw Error("Component for ".concat(this.name," has already been provided"));if(this.component=e,!!this.shouldAutoInitialize()){if($n(e))try{this.getOrInitializeService({instanceIdentifier:O})}catch(n){}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const o=this.getOrInitializeService({instanceIdentifier:s});r.resolve(o)}catch(o){}}}}clearInstance(e=O){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=O){return this.instances.has(e)}getOptions(e=O){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error("".concat(this.name,"(").concat(r,") has already been initialized"));if(!this.isComponentSet())throw Error("Component ".concat(this.name," has not been registered yet"));const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[o,a]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(o);r===i&&a.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),o=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;o.add(e),this.onInitCallbacks.set(s,o);const a=this.instances.get(s);return a&&e(a,s),()=>{o.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch(o){}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:xn(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch(s){}return r||null}normalizeInstanceIdentifier(e=O){return this.component?this.component.multipleInstances?e:O:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function xn(t){return t===O?void 0:t}function $n(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fn{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error("Component ".concat(e.name," has already been registered with ").concat(this.name));n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new jn(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var d;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(d||(d={}));const Un={debug:d.DEBUG,verbose:d.VERBOSE,info:d.INFO,warn:d.WARN,error:d.ERROR,silent:d.SILENT},Hn=d.INFO,Kn={[d.DEBUG]:"log",[d.VERBOSE]:"log",[d.INFO]:"info",[d.WARN]:"warn",[d.ERROR]:"error"},Vn=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=Kn[e];if(s)console[s]("[".concat(r,"]  ").concat(t.name,":"),...n);else throw new Error("Attempted to log a message with an invalid logType (value: ".concat(e,")"))};class Wn{constructor(e){this.name=e,this._logLevel=Hn,this._logHandler=Vn,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in d))throw new TypeError('Invalid value "'.concat(e,'" assigned to `logLevel`'));this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Un[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,d.DEBUG,...e),this._logHandler(this,d.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,d.VERBOSE,...e),this._logHandler(this,d.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,d.INFO,...e),this._logHandler(this,d.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,d.WARN,...e),this._logHandler(this,d.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,d.ERROR,...e),this._logHandler(this,d.ERROR,...e)}}const qn=(t,e)=>e.some(n=>t instanceof n);let Ue,He;function zn(){return Ue||(Ue=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Gn(){return He||(He=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const mt=new WeakMap,we=new WeakMap,bt=new WeakMap,ae=new WeakMap,Ae=new WeakMap;function Yn(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",o),t.removeEventListener("error",a)},o=()=>{n(A(t.result)),s()},a=()=>{r(t.error),s()};t.addEventListener("success",o),t.addEventListener("error",a)});return e.then(n=>{n instanceof IDBCursor&&mt.set(n,t)}).catch(()=>{}),Ae.set(e,t),e}function Jn(t){if(we.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",o),t.removeEventListener("error",a),t.removeEventListener("abort",a)},o=()=>{n(),s()},a=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",o),t.addEventListener("error",a),t.addEventListener("abort",a)});we.set(t,e)}let ye={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return we.get(t);if(e==="objectStoreNames")return t.objectStoreNames||bt.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return A(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Xn(t){ye=t(ye)}function Qn(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(ie(this),e,...n);return bt.set(r,e.sort?e.sort():[e]),A(r)}:Gn().includes(t)?function(...e){return t.apply(ie(this),e),A(mt.get(this))}:function(...e){return A(t.apply(ie(this),e))}}function Zn(t){return typeof t=="function"?Qn(t):(t instanceof IDBTransaction&&Jn(t),qn(t,zn())?new Proxy(t,ye):t)}function A(t){if(t instanceof IDBRequest)return Yn(t);if(ae.has(t))return ae.get(t);const e=Zn(t);return e!==t&&(ae.set(t,e),Ae.set(e,t)),e}const ie=t=>Ae.get(t);function te(t,e,{blocked:n,upgrade:r,blocking:s,terminated:o}={}){const a=indexedDB.open(t,e),i=A(a);return r&&a.addEventListener("upgradeneeded",c=>{r(A(a.result),c.oldVersion,c.newVersion,A(a.transaction),c)}),n&&a.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),i.then(c=>{o&&c.addEventListener("close",()=>o()),s&&c.addEventListener("versionchange",l=>s(l.oldVersion,l.newVersion,l))}).catch(()=>{}),i}function ce(t,{blocked:e}={}){const n=indexedDB.deleteDatabase(t);return e&&n.addEventListener("blocked",r=>e(r.oldVersion,r)),A(n).then(()=>{})}const er=["get","getKey","getAll","getAllKeys","count"],tr=["put","add","delete","clear"],le=new Map;function Ke(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(le.get(e))return le.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=tr.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||er.includes(n)))return;const o=async function(a,...i){const c=this.transaction(a,s?"readwrite":"readonly");let l=c.store;return r&&(l=l.index(i.shift())),(await Promise.all([l[n](...i),s&&c.done]))[0]};return le.set(e,o),o}Xn(t=>({...t,get:(e,n,r)=>Ke(e,n)||t.get(e,n,r),has:(e,n)=>!!Ke(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nr{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(rr(n)){const r=n.getImmediate();return"".concat(r.library,"/").concat(r.version)}else return null}).filter(n=>n).join(" ")}}function rr(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const _e="@firebase/app",Ve="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C=new Wn("@firebase/app"),sr="@firebase/app-compat",or="@firebase/analytics-compat",ar="@firebase/analytics",ir="@firebase/app-check-compat",cr="@firebase/app-check",lr="@firebase/auth",ur="@firebase/auth-compat",hr="@firebase/database",dr="@firebase/data-connect",fr="@firebase/database-compat",pr="@firebase/functions",gr="@firebase/functions-compat",mr="@firebase/installations",br="@firebase/installations-compat",wr="@firebase/messaging",yr="@firebase/messaging-compat",_r="@firebase/performance",Sr="@firebase/performance-compat",Er="@firebase/remote-config",Ir="@firebase/remote-config-compat",Ar="@firebase/storage",Cr="@firebase/storage-compat",vr="@firebase/firestore",Tr="@firebase/ai",Dr="@firebase/firestore-compat",Rr="firebase";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Se="[DEFAULT]",kr={[_e]:"fire-core",[sr]:"fire-core-compat",[ar]:"fire-analytics",[or]:"fire-analytics-compat",[cr]:"fire-app-check",[ir]:"fire-app-check-compat",[lr]:"fire-auth",[ur]:"fire-auth-compat",[hr]:"fire-rtdb",[dr]:"fire-data-connect",[fr]:"fire-rtdb-compat",[pr]:"fire-fn",[gr]:"fire-fn-compat",[mr]:"fire-iid",[br]:"fire-iid-compat",[wr]:"fire-fcm",[yr]:"fire-fcm-compat",[_r]:"fire-perf",[Sr]:"fire-perf-compat",[Er]:"fire-rc",[Ir]:"fire-rc-compat",[Ar]:"fire-gcs",[Cr]:"fire-gcs-compat",[vr]:"fire-fst",[Dr]:"fire-fst-compat",[Tr]:"fire-vertex","fire-js":"fire-js",[Rr]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const G=new Map,Or=new Map,Ee=new Map;function We(t,e){try{t.container.addComponent(e)}catch(n){C.debug("Component ".concat(e.name," failed to register with FirebaseApp ").concat(t.name),n)}}function U(t){const e=t.name;if(Ee.has(e))return C.debug("There were multiple attempts to register component ".concat(e,".")),!1;Ee.set(e,t);for(const n of G.values())We(n,t);for(const n of Or.values())We(n,t);return!0}function Ce(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nr={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},T=new ee("app","Firebase",Nr);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pr{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new P("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw T.create("app-deleted",{appName:this._name})}}function wt(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Se,automaticDataCollectionEnabled:!0},e),s=r.name;if(typeof s!="string"||!s)throw T.create("bad-app-name",{appName:String(s)});if(n||(n=dt()),!n)throw T.create("no-options");const o=G.get(s);if(o){if(be(n,o.options)&&be(r,o.config))return o;throw T.create("duplicate-app",{appName:s})}const a=new Fn(s);for(const c of Ee.values())a.addComponent(c);const i=new Pr(n,r,a);return G.set(s,i),i}function Mr(t=Se){const e=G.get(t);if(!e&&t===Se&&dt())return wt();if(!e)throw T.create("no-app",{appName:t});return e}function F(t,e,n){var r;let s=(r=kr[t])!==null&&r!==void 0?r:t;n&&(s+="-".concat(n));const o=s.match(/\s|\//),a=e.match(/\s|\//);if(o||a){const i=['Unable to register library "'.concat(s,'" with version "').concat(e,'":')];o&&i.push('library name "'.concat(s,'" contains illegal characters (whitespace or "/")')),o&&a&&i.push("and"),a&&i.push('version name "'.concat(e,'" contains illegal characters (whitespace or "/")')),C.warn(i.join(" "));return}U(new P("".concat(s,"-version"),()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lr="firebase-heartbeat-database",Br=1,W="firebase-heartbeat-store";let ue=null;function yt(){return ue||(ue=te(Lr,Br,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(W)}catch(n){console.warn(n)}}}}).catch(t=>{throw T.create("idb-open",{originalErrorMessage:t.message})})),ue}async function jr(t){try{const n=(await yt()).transaction(W),r=await n.objectStore(W).get(_t(t));return await n.done,r}catch(e){if(e instanceof H)C.warn(e.message);else{const n=T.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});C.warn(n.message)}}}async function qe(t,e){try{const r=(await yt()).transaction(W,"readwrite");await r.objectStore(W).put(e,_t(t)),await r.done}catch(n){if(n instanceof H)C.warn(n.message);else{const r=T.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});C.warn(r.message)}}}function _t(t){return"".concat(t.name,"!").concat(t.options.appId)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xr=1024,$r=30;class Fr{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Hr(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=ze();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(a=>a.date===o))return;if(this._heartbeatsCache.heartbeats.push({date:o,agent:s}),this._heartbeatsCache.heartbeats.length>$r){const a=Kr(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){C.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=ze(),{heartbeatsToSend:r,unsentEntries:s}=Ur(this._heartbeatsCache.heartbeats),o=ht(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(n){return C.warn(n),""}}}function ze(){return new Date().toISOString().substring(0,10)}function Ur(t,e=xr){const n=[];let r=t.slice();for(const s of t){const o=n.find(a=>a.agent===s.agent);if(o){if(o.dates.push(s.date),Ge(n)>e){o.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),Ge(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class Hr{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return ft()?pt().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await jr(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return qe(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return qe(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Ge(t){return ht(JSON.stringify({version:2,heartbeats:t})).length}function Kr(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vr(t){U(new P("platform-logger",e=>new nr(e),"PRIVATE")),U(new P("heartbeat",e=>new Fr(e),"PRIVATE")),F(_e,Ve,t),F(_e,Ve,"esm2017"),F("fire-js","")}Vr("");var Wr="firebase",qr="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */F(Wr,qr,"app");const St="@firebase/installations",ve="0.6.18";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et=1e4,It="w:".concat(ve),At="FIS_v2",zr="https://firebaseinstallations.googleapis.com/v1",Gr=60*60*1e3,Yr="installations",Jr="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xr={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},M=new ee(Yr,Jr,Xr);function Ct(t){return t instanceof H&&t.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vt({projectId:t}){return"".concat(zr,"/projects/").concat(t,"/installations")}function Tt(t){return{token:t.token,requestStatus:2,expiresIn:Zr(t.expiresIn),creationTime:Date.now()}}async function Dt(t,e){const r=(await e.json()).error;return M.create("request-failed",{requestName:t,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function Rt({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function Qr(t,{refreshToken:e}){const n=Rt(t);return n.append("Authorization",es(e)),n}async function kt(t){const e=await t();return e.status>=500&&e.status<600?t():e}function Zr(t){return Number(t.replace("s","000"))}function es(t){return"".concat(At," ").concat(t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ts({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const r=vt(t),s=Rt(t),o=e.getImmediate({optional:!0});if(o){const l=await o.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const a={fid:n,authVersion:At,appId:t.appId,sdkVersion:It},i={method:"POST",headers:s,body:JSON.stringify(a)},c=await kt(()=>fetch(r,i));if(c.ok){const l=await c.json();return{fid:l.fid||n,registrationStatus:2,refreshToken:l.refreshToken,authToken:Tt(l.authToken)}}else throw await Dt("Create Installation",c)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ot(t){return new Promise(e=>{setTimeout(e,t)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ns(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rs=/^[cdef][\w-]{21}$/,Ie="";function ss(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const n=os(t);return rs.test(n)?n:Ie}catch(t){return Ie}}function os(t){return ns(t).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ne(t){return"".concat(t.appName,"!").concat(t.appId)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nt=new Map;function Pt(t,e){const n=ne(t);Mt(n,e),as(n,e)}function Mt(t,e){const n=Nt.get(t);if(n)for(const r of n)r(e)}function as(t,e){const n=is();n&&n.postMessage({key:t,fid:e}),cs()}let N=null;function is(){return!N&&"BroadcastChannel"in self&&(N=new BroadcastChannel("[Firebase] FID Change"),N.onmessage=t=>{Mt(t.data.key,t.data.fid)}),N}function cs(){Nt.size===0&&N&&(N.close(),N=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ls="firebase-installations-database",us=1,L="firebase-installations-store";let he=null;function Te(){return he||(he=te(ls,us,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(L)}}})),he}async function Y(t,e){const n=ne(t),s=(await Te()).transaction(L,"readwrite"),o=s.objectStore(L),a=await o.get(n);return await o.put(e,n),await s.done,(!a||a.fid!==e.fid)&&Pt(t,e.fid),e}async function Lt(t){const e=ne(t),r=(await Te()).transaction(L,"readwrite");await r.objectStore(L).delete(e),await r.done}async function re(t,e){const n=ne(t),s=(await Te()).transaction(L,"readwrite"),o=s.objectStore(L),a=await o.get(n),i=e(a);return i===void 0?await o.delete(n):await o.put(i,n),await s.done,i&&(!a||a.fid!==i.fid)&&Pt(t,i.fid),i}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function De(t){let e;const n=await re(t.appConfig,r=>{const s=hs(r),o=ds(t,s);return e=o.registrationPromise,o.installationEntry});return n.fid===Ie?{installationEntry:await e}:{installationEntry:n,registrationPromise:e}}function hs(t){const e=t||{fid:ss(),registrationStatus:0};return Bt(e)}function ds(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(M.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=fs(t,n);return{installationEntry:n,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:ps(t)}:{installationEntry:e}}async function fs(t,e){try{const n=await ts(t,e);return Y(t.appConfig,n)}catch(n){throw Ct(n)&&n.customData.serverCode===409?await Lt(t.appConfig):await Y(t.appConfig,{fid:e.fid,registrationStatus:0}),n}}async function ps(t){let e=await Ye(t.appConfig);for(;e.registrationStatus===1;)await Ot(100),e=await Ye(t.appConfig);if(e.registrationStatus===0){const{installationEntry:n,registrationPromise:r}=await De(t);return r||n}return e}function Ye(t){return re(t,e=>{if(!e)throw M.create("installation-not-found");return Bt(e)})}function Bt(t){return gs(t)?{fid:t.fid,registrationStatus:0}:t}function gs(t){return t.registrationStatus===1&&t.registrationTime+Et<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ms({appConfig:t,heartbeatServiceProvider:e},n){const r=bs(t,n),s=Qr(t,n),o=e.getImmediate({optional:!0});if(o){const l=await o.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const a={installation:{sdkVersion:It,appId:t.appId}},i={method:"POST",headers:s,body:JSON.stringify(a)},c=await kt(()=>fetch(r,i));if(c.ok){const l=await c.json();return Tt(l)}else throw await Dt("Generate Auth Token",c)}function bs(t,{fid:e}){return"".concat(vt(t),"/").concat(e,"/authTokens:generate")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Re(t,e=!1){let n;const r=await re(t.appConfig,o=>{if(!jt(o))throw M.create("not-registered");const a=o.authToken;if(!e&&_s(a))return o;if(a.requestStatus===1)return n=ws(t,e),o;{if(!navigator.onLine)throw M.create("app-offline");const i=Es(o);return n=ys(t,i),i}});return n?await n:r.authToken}async function ws(t,e){let n=await Je(t.appConfig);for(;n.authToken.requestStatus===1;)await Ot(100),n=await Je(t.appConfig);const r=n.authToken;return r.requestStatus===0?Re(t,e):r}function Je(t){return re(t,e=>{if(!jt(e))throw M.create("not-registered");const n=e.authToken;return Is(n)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function ys(t,e){try{const n=await ms(t,e),r=Object.assign(Object.assign({},e),{authToken:n});return await Y(t.appConfig,r),n}catch(n){if(Ct(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await Lt(t.appConfig);else{const r=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await Y(t.appConfig,r)}throw n}}function jt(t){return t!==void 0&&t.registrationStatus===2}function _s(t){return t.requestStatus===2&&!Ss(t)}function Ss(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+Gr}function Es(t){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},t),{authToken:e})}function Is(t){return t.requestStatus===1&&t.requestTime+Et<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function As(t){const e=t,{installationEntry:n,registrationPromise:r}=await De(e);return r?r.catch(console.error):Re(e).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Cs(t,e=!1){const n=t;return await vs(n),(await Re(n,e)).token}async function vs(t){const{registrationPromise:e}=await De(t);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ts(t){if(!t||!t.options)throw de("App Configuration");if(!t.name)throw de("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw de(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function de(t){return M.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xt="installations",Ds="installations-internal",Rs=t=>{const e=t.getProvider("app").getImmediate(),n=Ts(e),r=Ce(e,"heartbeat");return{app:e,appConfig:n,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},ks=t=>{const e=t.getProvider("app").getImmediate(),n=Ce(e,xt).getImmediate();return{getId:()=>As(n),getToken:s=>Cs(n,s)}};function Os(){U(new P(xt,Rs,"PUBLIC")),U(new P(Ds,ks,"PRIVATE"))}Os();F(St,ve);F(St,ve,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $t="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",Ns="https://fcmregistrations.googleapis.com/v1",Ft="FCM_MSG",Ps="google.c.a.c_id",Ms=3,Ls=1;var J;(function(t){t[t.DATA_MESSAGE=1]="DATA_MESSAGE",t[t.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(J||(J={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var X;(function(t){t.PUSH_RECEIVED="push-received",t.NOTIFICATION_CLICKED="notification-clicked"})(X||(X={}));/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function E(t){const e=new Uint8Array(t);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function Bs(t){const e="=".repeat((4-t.length%4)%4),n=(t+e).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(n),s=new Uint8Array(r.length);for(let o=0;o<r.length;++o)s[o]=r.charCodeAt(o);return s}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fe="fcm_token_details_db",js=5,Xe="fcm_token_object_Store";async function xs(t){if("databases"in indexedDB&&!(await indexedDB.databases()).map(o=>o.name).includes(fe))return null;let e=null;return(await te(fe,js,{upgrade:async(r,s,o,a)=>{var i;if(s<2||!r.objectStoreNames.contains(Xe))return;const c=a.objectStore(Xe),l=await c.index("fcmSenderId").get(t);if(await c.clear(),!!l){if(s===2){const u=l;if(!u.auth||!u.p256dh||!u.endpoint)return;e={token:u.fcmToken,createTime:(i=u.createTime)!==null&&i!==void 0?i:Date.now(),subscriptionOptions:{auth:u.auth,p256dh:u.p256dh,endpoint:u.endpoint,swScope:u.swScope,vapidKey:typeof u.vapidKey=="string"?u.vapidKey:E(u.vapidKey)}}}else if(s===3){const u=l;e={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:E(u.auth),p256dh:E(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:E(u.vapidKey)}}}else if(s===4){const u=l;e={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:E(u.auth),p256dh:E(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:E(u.vapidKey)}}}}}})).close(),await ce(fe),await ce("fcm_vapid_details_db"),await ce("undefined"),$s(e)?e:null}function $s(t){if(!t||!t.subscriptionOptions)return!1;const{subscriptionOptions:e}=t;return typeof t.createTime=="number"&&t.createTime>0&&typeof t.token=="string"&&t.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fs="firebase-messaging-database",Us=1,B="firebase-messaging-store";let pe=null;function ke(){return pe||(pe=te(Fs,Us,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(B)}}})),pe}async function Oe(t){const e=Pe(t),r=await(await ke()).transaction(B).objectStore(B).get(e);if(r)return r;{const s=await xs(t.appConfig.senderId);if(s)return await Ne(t,s),s}}async function Ne(t,e){const n=Pe(t),s=(await ke()).transaction(B,"readwrite");return await s.objectStore(B).put(e,n),await s.done,e}async function Hs(t){const e=Pe(t),r=(await ke()).transaction(B,"readwrite");await r.objectStore(B).delete(e),await r.done}function Pe({appConfig:t}){return t.appId}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ks={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},w=new ee("messaging","Messaging",Ks);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vs(t,e){const n=await Le(t),r=Ht(e),s={method:"POST",headers:n,body:JSON.stringify(r)};let o;try{o=await(await fetch(Me(t.appConfig),s)).json()}catch(a){throw w.create("token-subscribe-failed",{errorInfo:a==null?void 0:a.toString()})}if(o.error){const a=o.error.message;throw w.create("token-subscribe-failed",{errorInfo:a})}if(!o.token)throw w.create("token-subscribe-no-token");return o.token}async function Ws(t,e){const n=await Le(t),r=Ht(e.subscriptionOptions),s={method:"PATCH",headers:n,body:JSON.stringify(r)};let o;try{o=await(await fetch("".concat(Me(t.appConfig),"/").concat(e.token),s)).json()}catch(a){throw w.create("token-update-failed",{errorInfo:a==null?void 0:a.toString()})}if(o.error){const a=o.error.message;throw w.create("token-update-failed",{errorInfo:a})}if(!o.token)throw w.create("token-update-no-token");return o.token}async function Ut(t,e){const r={method:"DELETE",headers:await Le(t)};try{const o=await(await fetch("".concat(Me(t.appConfig),"/").concat(e),r)).json();if(o.error){const a=o.error.message;throw w.create("token-unsubscribe-failed",{errorInfo:a})}}catch(s){throw w.create("token-unsubscribe-failed",{errorInfo:s==null?void 0:s.toString()})}}function Me({projectId:t}){return"".concat(Ns,"/projects/").concat(t,"/registrations")}async function Le({appConfig:t,installations:e}){const n=await e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t.apiKey,"x-goog-firebase-installations-auth":"FIS ".concat(n)})}function Ht({p256dh:t,auth:e,endpoint:n,vapidKey:r}){const s={web:{endpoint:n,auth:e,p256dh:t}};return r!==$t&&(s.web.applicationPubKey=r),s}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qs=7*24*60*60*1e3;async function zs(t){const e=await Ys(t.swRegistration,t.vapidKey),n={vapidKey:t.vapidKey,swScope:t.swRegistration.scope,endpoint:e.endpoint,auth:E(e.getKey("auth")),p256dh:E(e.getKey("p256dh"))},r=await Oe(t.firebaseDependencies);if(r){if(Js(r.subscriptionOptions,n))return Date.now()>=r.createTime+qs?Gs(t,{token:r.token,createTime:Date.now(),subscriptionOptions:n}):r.token;try{await Ut(t.firebaseDependencies,r.token)}catch(s){console.warn(s)}return Ze(t.firebaseDependencies,n)}else return Ze(t.firebaseDependencies,n)}async function Qe(t){const e=await Oe(t.firebaseDependencies);e&&(await Ut(t.firebaseDependencies,e.token),await Hs(t.firebaseDependencies));const n=await t.swRegistration.pushManager.getSubscription();return n?n.unsubscribe():!0}async function Gs(t,e){try{const n=await Ws(t.firebaseDependencies,e),r=Object.assign(Object.assign({},e),{token:n,createTime:Date.now()});return await Ne(t.firebaseDependencies,r),n}catch(n){throw n}}async function Ze(t,e){const r={token:await Vs(t,e),createTime:Date.now(),subscriptionOptions:e};return await Ne(t,r),r.token}async function Ys(t,e){const n=await t.pushManager.getSubscription();return n||t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Bs(e)})}function Js(t,e){const n=e.vapidKey===t.vapidKey,r=e.endpoint===t.endpoint,s=e.auth===t.auth,o=e.p256dh===t.p256dh;return n&&r&&s&&o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xs(t){const e={from:t.from,collapseKey:t.collapse_key,messageId:t.fcmMessageId};return Qs(e,t),Zs(e,t),eo(e,t),e}function Qs(t,e){if(!e.notification)return;t.notification={};const n=e.notification.title;n&&(t.notification.title=n);const r=e.notification.body;r&&(t.notification.body=r);const s=e.notification.image;s&&(t.notification.image=s);const o=e.notification.icon;o&&(t.notification.icon=o)}function Zs(t,e){e.data&&(t.data=e.data)}function eo(t,e){var n,r,s,o,a;if(!e.fcmOptions&&!(!((n=e.notification)===null||n===void 0)&&n.click_action))return;t.fcmOptions={};const i=(s=(r=e.fcmOptions)===null||r===void 0?void 0:r.link)!==null&&s!==void 0?s:(o=e.notification)===null||o===void 0?void 0:o.click_action;i&&(t.fcmOptions.link=i);const c=(a=e.fcmOptions)===null||a===void 0?void 0:a.analytics_label;c&&(t.fcmOptions.analyticsLabel=c)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function to(t){return typeof t=="object"&&!!t&&Ps in t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function no(t){return new Promise(e=>{setTimeout(e,t)})}async function ro(t,e){const n=so(e,await t.firebaseDependencies.installations.getId());oo(t,n,e.productId)}function so(t,e){var n,r;const s={};return t.from&&(s.project_number=t.from),t.fcmMessageId&&(s.message_id=t.fcmMessageId),s.instance_id=e,t.notification?s.message_type=J.DISPLAY_NOTIFICATION.toString():s.message_type=J.DATA_MESSAGE.toString(),s.sdk_platform=Ms.toString(),s.package_name=self.origin.replace(/(^\w+:|^)\/\//,""),t.collapse_key&&(s.collapse_key=t.collapse_key),s.event=Ls.toString(),!((n=t.fcmOptions)===null||n===void 0)&&n.analytics_label&&(s.analytics_label=(r=t.fcmOptions)===null||r===void 0?void 0:r.analytics_label),s}function oo(t,e,n){const r={};r.event_time_ms=Math.floor(Date.now()).toString(),r.source_extension_json_proto3=JSON.stringify({messaging_client_event:e}),n&&(r.compliance_data=ao(n)),t.logEvents.push(r)}function ao(t){return{privacy_context:{prequest:{origin_associated_product_id:t}}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function io(t,e){var n,r;const{newSubscription:s}=t;if(!s){await Qe(e);return}const o=await Oe(e.firebaseDependencies);await Qe(e),e.vapidKey=(r=(n=o==null?void 0:o.subscriptionOptions)===null||n===void 0?void 0:n.vapidKey)!==null&&r!==void 0?r:$t,await zs(e)}async function co(t,e){const n=ho(t);if(!n)return;e.deliveryMetricsExportedToBigQueryEnabled&&await ro(e,n);const r=await Kt();if(po(r))return go(r,n);if(n.notification&&await mo(uo(n)),!!e&&e.onBackgroundMessageHandler){const s=Xs(n);typeof e.onBackgroundMessageHandler=="function"?await e.onBackgroundMessageHandler(s):e.onBackgroundMessageHandler.next(s)}}async function lo(t){var e,n;const r=(n=(e=t.notification)===null||e===void 0?void 0:e.data)===null||n===void 0?void 0:n[Ft];if(r){if(t.action)return}else return;t.stopImmediatePropagation(),t.notification.close();const s=bo(r);if(!s)return;const o=new URL(s,self.location.href),a=new URL(self.location.origin);if(o.host!==a.host)return;let i=await fo(o);if(i?i=await i.focus():(i=await self.clients.openWindow(s),await no(3e3)),!!i)return r.messageType=X.NOTIFICATION_CLICKED,r.isFirebaseMessaging=!0,i.postMessage(r)}function uo(t){const e=Object.assign({},t.notification);return e.data={[Ft]:t},e}function ho({data:t}){if(!t)return null;try{return t.json()}catch(e){return null}}async function fo(t){const e=await Kt();for(const n of e){const r=new URL(n.url,self.location.href);if(t.host===r.host)return n}return null}function po(t){return t.some(e=>e.visibilityState==="visible"&&!e.url.startsWith("chrome-extension://"))}function go(t,e){e.isFirebaseMessaging=!0,e.messageType=X.PUSH_RECEIVED;for(const n of t)n.postMessage(e)}function Kt(){return self.clients.matchAll({type:"window",includeUncontrolled:!0})}function mo(t){var e;const{actions:n}=t,{maxActions:r}=Notification;return n&&r&&n.length>r&&console.warn("This browser only supports ".concat(r," actions. The remaining actions will not be displayed.")),self.registration.showNotification((e=t.title)!==null&&e!==void 0?e:"",t)}function bo(t){var e,n,r;const s=(n=(e=t.fcmOptions)===null||e===void 0?void 0:e.link)!==null&&n!==void 0?n:(r=t.notification)===null||r===void 0?void 0:r.click_action;return s||(to(t.data)?self.location.origin:null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wo(t){if(!t||!t.options)throw ge("App Configuration Object");if(!t.name)throw ge("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:n}=t;for(const r of e)if(!n[r])throw ge(r);return{appName:t.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function ge(t){return w.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yo{constructor(e,n,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const s=wo(e);this.firebaseDependencies={app:e,appConfig:s,installations:n,analyticsProvider:r}}_delete(){return Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _o=t=>{const e=new yo(t.getProvider("app").getImmediate(),t.getProvider("installations-internal").getImmediate(),t.getProvider("analytics-internal"));return self.addEventListener("push",n=>{n.waitUntil(co(n,e))}),self.addEventListener("pushsubscriptionchange",n=>{n.waitUntil(io(n,e))}),self.addEventListener("notificationclick",n=>{n.waitUntil(lo(n))}),e};function So(){U(new P("messaging-sw",_o,"PUBLIC"))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Eo(){return ft()&&await pt()&&"PushManager"in self&&"Notification"in self&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Io(t,e){if(self.document!==void 0)throw w.create("only-available-in-sw");return t.onBackgroundMessageHandler=e,()=>{t.onBackgroundMessageHandler=null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ao(t=Mr()){return Eo().then(e=>{if(!e)throw w.create("unsupported-browser")},e=>{throw w.create("indexed-db-unsupported")}),Ce(gt(t),"messaging-sw").getImmediate()}function Co(t,e){return t=gt(t),Io(t,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */So();const vo="my-admin-local",et=11,g={CF_SALARY_DISTRIBUTION:"cashflow_salary_distribution",CF_MY_PROJECTS:"cashflow_my_projects",CF_ASSETS:"cashflow_assets",CF_ACCOUNTS_MASTER:"cashflow_accounts_master",TAXI_VEHICLES:"taxi_vehicles",FINANCE_GRID_TRADES:"finance_grid_trades",FINANCE_CALC_LIST:"finance_calc_list",FINANCE_LOANS:"finance_loans",MISC_TASKS:"misc_tasks",DOMOTICA_SOLAR_CALC:"domotica_solar_calc",APP_METADATA:"app_metadata"};let D=null,R=null;function k(t,e,n,r,s,o){if(t.objectStoreNames.contains(r)){t.objectStoreNames.contains(n)&&t.deleteObjectStore(n);return}const a=t.createObjectStore(r,s);t.objectStoreNames.contains(n)&&(e.objectStore(n).openCursor().onsuccess=i=>{const c=i.target.result;if(!c){t.deleteObjectStore(n);return}o?a.put(c.value,c.key):a.put(c.value),c.continue()})}function j(){return D?Promise.resolve(D):R||(R=new Promise((t,e)=>{const n=indexedDB.open(vo,et);n.onupgradeneeded=r=>{const s=r.target.result,o=r.target.transaction;k(s,o,"salary-distribution",g.CF_SALARY_DISTRIBUTION,void 0,!0),k(s,o,"my-projects",g.CF_MY_PROJECTS,{keyPath:"id"},!1),k(s,o,"assets",g.CF_ASSETS,{keyPath:"id"},!1),k(s,o,"accounts-master",g.CF_ACCOUNTS_MASTER,{keyPath:"id"},!1),k(s,o,"metadata",g.APP_METADATA,void 0,!0),k(s,o,"taxi-vehicles",g.TAXI_VEHICLES,{keyPath:"id"},!1),k(s,o,"tasks",g.MISC_TASKS,{keyPath:"id"},!1),s.objectStoreNames.contains(g.FINANCE_GRID_TRADES)||s.createObjectStore(g.FINANCE_GRID_TRADES,{keyPath:"id"}),s.objectStoreNames.contains(g.FINANCE_CALC_LIST)||s.createObjectStore(g.FINANCE_CALC_LIST,{keyPath:"id"}),s.objectStoreNames.contains(g.FINANCE_LOANS)||s.createObjectStore(g.FINANCE_LOANS,{keyPath:"id"}),s.objectStoreNames.contains(g.DOMOTICA_SOLAR_CALC)||s.createObjectStore(g.DOMOTICA_SOLAR_CALC,{keyPath:"id"})},n.onsuccess=r=>{D=r.target.result,R=null,D.onversionchange=()=>{D.close(),D=null},t(D)},n.onerror=r=>{R=null,e(r.target.error)},n.onblocked=()=>{const r="idb-reload-v".concat(et);sessionStorage.getItem(r)?(R=null,e(new Error("IDB upgrade blocked. Cierra otras pestañas de la app y recarga."))):(sessionStorage.setItem(r,"1"),window.location.reload())}}),R)}const S=g,tt=g.CF_ACCOUNTS_MASTER;async function To(){const t=await j();return new Promise((e,n)=>{const s=t.transaction(tt,"readonly").objectStore(tt).getAll();s.onsuccess=o=>{var a;return e((a=o.target.result)!=null?a:[])},s.onerror=o=>n(o.target.error)})}const Q=g.TAXI_VEHICLES;async function Do(t){const n=(await j()).transaction(Q,"readwrite"),r=n.objectStore(Q);r.clear();for(const s of t)r.put(s);return new Promise((s,o)=>{n.oncomplete=s,n.onerror=()=>o(n.error)})}async function Ro(){const t=await j();return new Promise((e,n)=>{const s=t.transaction(Q,"readonly").objectStore(Q).getAll();s.onsuccess=()=>{var o;return e((o=s.result)!=null?o:[])},s.onerror=()=>n(s.error)})}const nt=g.APP_METADATA,ko="pico-placa-notify-hours",me=[8,12,17];async function Oo(){try{const t=await j();return await new Promise(e=>{const r=t.transaction(nt,"readonly").objectStore(nt).get(ko);r.onsuccess=()=>e(Array.isArray(r.result)?r.result:me),r.onerror=()=>e(me)})}catch(t){return me}}const No=t=>Object.keys(t!=null?t:{}).some(e=>Number(e)>12),Po=(t,e,n)=>{var r,s,o,a,i;if(!t)return null;if(No(t)){const c=(r=t[e])!=null?r:t[String(e)];return(o=(s=c==null?void 0:c[n])!=null?s:c==null?void 0:c[String(n)])!=null?o:null}return(i=(a=t[n])!=null?a:t[String(n)])!=null?i:null},Mo=(t,e,n)=>{const r=Po(t,e,n);return r?[r.d1,r.d2,r.d3].filter(Boolean).map(Number):[]},Lo=["Hoy","Mañana","En 2 días","En 3 días","En 4 días"];async function Bo(){try{const t=new Date,e=t.getHours();if(!(await Oo()).includes(e))return;const r=t.toISOString().split("T")[0],s="pico-placa-".concat(r,"-").concat(e),o=await j();if(await new Promise(p=>{const y=o.transaction(S.APP_METADATA,"readonly").objectStore(S.APP_METADATA).get(s);y.onsuccess=()=>p(!!y.result),y.onerror=()=>p(!1)}))return;let i=await Ro();if(i.length||(i=await xo(),i.length&&await Do(i)),!i.length)return;const c=[];for(let p=0;p<=4;p++){const b=new Date(t);b.setDate(b.getDate()+p);const y=i.filter(x=>jo(x.restrictions,b.getFullYear(),b.getMonth()+1,b.getDate())).map(x=>x.plate);p===0?c.push(y.length?"Hoy: ".concat(y.join(", ")):"Hoy: sin pico y placa"):y.length&&c.push("".concat(Lo[p],": ").concat(y.join(", ")))}const l="Pico y Placa",u=c.join(" | ");await(typeof self.registration<"u"?self.registration:await navigator.serviceWorker.ready).showNotification(l,{body:u,icon:"/icons/icon.svg",tag:"pico-y-placa",badge:"/icons/icon.svg"});const f=o.transaction(S.APP_METADATA,"readwrite");f.objectStore(S.APP_METADATA).put(!0,s),await new Promise((p,b)=>{f.oncomplete=p,f.onerror=()=>b(f.error)})}catch(t){console.error("Error in pico-y-placa check:",t)}}function jo(t,e,n,r){return Mo(t,e,n).includes(r)}async function xo(){var t;try{const r="https://firestore.googleapis.com/v1/projects/".concat("cashflow-9cbbc","/databases/(default)/documents/CashFlow_taxi_vehiculos?key=").concat("AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g"),s=await fetch(r);return s.ok?((t=(await s.json()).documents)!=null?t:[]).map($o).filter(a=>a.plate):[]}catch(e){return[]}}function rt(t){var n,r,s,o,a,i,c,l,u,h,f,p;const e=t!=null?t:{};return{d1:Number((o=(s=(n=e.d1)==null?void 0:n.integerValue)!=null?s:(r=e.d1)==null?void 0:r.doubleValue)!=null?o:0),d2:Number((l=(c=(a=e.d2)==null?void 0:a.integerValue)!=null?c:(i=e.d2)==null?void 0:i.doubleValue)!=null?l:0),d3:Number((p=(f=(u=e.d3)==null?void 0:u.integerValue)!=null?f:(h=e.d3)==null?void 0:h.doubleValue)!=null?p:0)}}function $o(t){var o,a,i,c,l,u,h,f;const e=(o=t.fields)!=null?o:{},n=t.name.split("/").pop(),r=(c=(i=(a=e.restrictions)==null?void 0:a.mapValue)==null?void 0:i.fields)!=null?c:{},s={};for(const[p,b]of Object.entries(r)){const y=Number(p)>12,x=(u=(l=b.mapValue)==null?void 0:l.fields)!=null?u:{};y?s[p]=Object.fromEntries(Object.entries(x).map(([Vt,Wt])=>{var Be;return[Vt,rt((Be=Wt.mapValue)==null?void 0:Be.fields)]})):s[p]=rt(x)}return{id:n,plate:(f=(h=e.plate)==null?void 0:h.stringValue)!=null?f:"",restrictions:s}}self.addEventListener("activate",t=>{t.waitUntil(self.clients.claim())});self.addEventListener("fetch",t=>{new URL(t.request.url).pathname!=="/share-target"||t.request.method!=="POST"||t.respondWith((async()=>{try{const r=(await t.request.formData()).get("file");if(r&&r instanceof File){const s=await r.arrayBuffer(),o=await j();await new Promise((a,i)=>{const c=o.transaction(S.APP_METADATA,"readwrite");c.objectStore(S.APP_METADATA).put({buffer:s,type:r.type,name:r.name},"pending-share"),c.oncomplete=a,c.onerror=()=>i(c.error)})}}catch(n){console.error("[SW] share-target error:",n)}return Response.redirect("/finance/management/account-status?share=".concat(Date.now()),303)})())});_n([{"revision":"c6f3e2a98fcef6c3d4c0c1533ea1f3f4","url":"offline.html"},{"revision":"8f6a0106de0a347a8c3d594700b9e93b","url":"index.html"},{"revision":"5b08b3f17508d9fe42f47af44a6c43a7","url":"favicon.ico"},{"revision":"3394026d133157e5039a62aefd1165a8","url":"404.html"},{"revision":"25646df2740513abb67bbb95c3c474de","url":"vendor/dx.material.blue.light.css"},{"revision":"2ca4711890cc60e49b7d31da309d9494","url":"vendor/ar-js-ui.css"},{"revision":"013cfeac59f632fe60c8b14e66d7ff2a","url":"vendor/ar-js-designer.css"},{"revision":"cf249e2748cfd5df29895a053146b5c3","url":"vendor/icons/dxiconsmaterial.woff2"},{"revision":"89726e9815ac597d2cf682798f135710","url":"vendor/icons/dxiconsmaterial.woff"},{"revision":"ff1692082f366d6076a6d19f8edc8c00","url":"vendor/icons/dxiconsfluent.woff2"},{"revision":"2ceba156178a078faeb79d942f1dba53","url":"vendor/icons/dxiconsfluent.woff"},{"revision":"75770ce3154a83deb87fd29fc2244bc9","url":"vendor/icons/dxicons.woff2"},{"revision":"6ab9cee21c9a076178a88c1bb60b541d","url":"vendor/icons/dxicons.woff"},{"revision":"b4639486fd4ede917de4e099a40605d8","url":"icons/icon.svg"},{"revision":null,"url":"assets/xlsx-legacy-BCdpevo0.js"},{"revision":null,"url":"assets/xlsx-BtTX4vxo.js"},{"revision":null,"url":"assets/workbox-window.prod.es5-legacy-BMyJTwtC.js"},{"revision":null,"url":"assets/workbox-window.prod.es5-RNCgxoJe.js"},{"revision":null,"url":"assets/websocketService-legacy-BlIOiAVB.js"},{"revision":null,"url":"assets/websocketService-DE5XTfFm.js"},{"revision":null,"url":"assets/vendor-pdfjs-legacy-BU2-Mn86.js"},{"revision":null,"url":"assets/vendor-pdfjs-DFuvzjGi.js"},{"revision":null,"url":"assets/vendor-firebase-legacy-B06dJ_Fh.js"},{"revision":null,"url":"assets/vendor-firebase-CEOsSTQM.js"},{"revision":null,"url":"assets/useUsdCopRate-legacy-Cr6sugK9.js"},{"revision":null,"url":"assets/useUsdCopRate-JAf2TPvA.js"},{"revision":null,"url":"assets/useLocaleData-legacy-CrP0xI_R.js"},{"revision":null,"url":"assets/useLocaleData-DZ-p_MbP.js"},{"revision":null,"url":"assets/useIsMobile-legacy-DpQefTAn.js"},{"revision":null,"url":"assets/useIsMobile-C_hY1nIG.js"},{"revision":null,"url":"assets/useCryptoPrices-legacy-D_46zaiU.js"},{"revision":null,"url":"assets/useCryptoPrices-CdWU3Zf3.js"},{"revision":null,"url":"assets/tradeUtils-legacy-Bdxm1eq4.js"},{"revision":null,"url":"assets/tradeUtils-CJhSIbxR.js"},{"revision":null,"url":"assets/taxi-legacy-BIfCZ1CJ.js"},{"revision":null,"url":"assets/taxi-CV4aCWjf.js"},{"revision":null,"url":"assets/skypatrolCommands-xAJhfgmi.js"},{"revision":null,"url":"assets/skypatrolCommands-legacy-D59IbE8P.js"},{"revision":null,"url":"assets/reselect-legacy-R18s4UXN.js"},{"revision":null,"url":"assets/reselect-D9L2APdZ.js"},{"revision":null,"url":"assets/raspberrypi-Cq0hdVK6.svg"},{"revision":null,"url":"assets/purify.es-legacy-F4BO2A0i.js"},{"revision":null,"url":"assets/purify.es-BLBSPc95.js"},{"revision":null,"url":"assets/polyfills-legacy-DfBd4Joa.js"},{"revision":null,"url":"assets/masters-legacy-CuAL2iNK.js"},{"revision":null,"url":"assets/masters-QR0GCCwm.css"},{"revision":null,"url":"assets/leaflet-legacy-BieHMpoj.js"},{"revision":null,"url":"assets/leaflet-D-XLe8Bz.js"},{"revision":null,"url":"assets/leaflet-CKBlaIOB.css"},{"revision":null,"url":"assets/jspdf.es.min-legacy-XmHnXZ_k.js"},{"revision":null,"url":"assets/jspdf.es.min-CH3jSqNW.js"},{"revision":null,"url":"assets/inmobiliaria-legacy-m7Ab-j2a.js"},{"revision":null,"url":"assets/inmobiliaria-CTfrhT_J.js"},{"revision":null,"url":"assets/index.esm-legacy-vMGHHaxa.js"},{"revision":null,"url":"assets/index.esm-legacy-jSUTxtuV.js"},{"revision":null,"url":"assets/index.esm-legacy-BZKB1mn5.js"},{"revision":null,"url":"assets/index.esm-TdaBATcD.js"},{"revision":null,"url":"assets/index.esm-DdL6Q_zR.js"},{"revision":null,"url":"assets/index.esm-BpWM6HAb.js"},{"revision":null,"url":"assets/index.es-legacy-BbEmNsK4.js"},{"revision":null,"url":"assets/index.es--D_XCXcK.js"},{"revision":null,"url":"assets/index-zTVPIJHv.js"},{"revision":null,"url":"assets/index-x3ZqVl14.css"},{"revision":null,"url":"assets/index-raqstX4n.js"},{"revision":null,"url":"assets/index-legacy-wwFwmZha.js"},{"revision":null,"url":"assets/index-legacy-wSxj2qAW.js"},{"revision":null,"url":"assets/index-legacy-wCL5hgn8.js"},{"revision":null,"url":"assets/index-legacy-p2hSVr_V.js"},{"revision":null,"url":"assets/index-legacy-nstXTICs.js"},{"revision":null,"url":"assets/index-legacy-nYYqPEpg.js"},{"revision":null,"url":"assets/index-legacy-my_yGrma.js"},{"revision":null,"url":"assets/index-legacy-WChytIK2.js"},{"revision":null,"url":"assets/index-legacy-Ka2cA9_T.js"},{"revision":null,"url":"assets/index-legacy-DtO2UgRF.js"},{"revision":null,"url":"assets/index-legacy-Dp0qrUeO.js"},{"revision":null,"url":"assets/index-legacy-DnVnvj9o.js"},{"revision":null,"url":"assets/index-legacy-DfB42mqy.js"},{"revision":null,"url":"assets/index-legacy-D_etOivs.js"},{"revision":null,"url":"assets/index-legacy-D_9tlC1o.js"},{"revision":null,"url":"assets/index-legacy-DWz8gNwx.js"},{"revision":null,"url":"assets/index-legacy-DWbjK9Yr.js"},{"revision":null,"url":"assets/index-legacy-DTk-33fM.js"},{"revision":null,"url":"assets/index-legacy-DOh4Mwaw.js"},{"revision":null,"url":"assets/index-legacy-DOP258_e.js"},{"revision":null,"url":"assets/index-legacy-DOIc1kmS.js"},{"revision":null,"url":"assets/index-legacy-DNCj0uC4.js"},{"revision":null,"url":"assets/index-legacy-DHyuQwbd.js"},{"revision":null,"url":"assets/index-legacy-DBmD63ot.js"},{"revision":null,"url":"assets/index-legacy-DA3kZjkA.js"},{"revision":null,"url":"assets/index-legacy-D3cQY3Wg.js"},{"revision":null,"url":"assets/index-legacy-Cv5L0Ihy.js"},{"revision":null,"url":"assets/index-legacy-Cv4Rt7qO.js"},{"revision":null,"url":"assets/index-legacy-CtlRVJEf.js"},{"revision":null,"url":"assets/index-legacy-CmB_5fKF.js"},{"revision":null,"url":"assets/index-legacy-Chdeuw6s.js"},{"revision":null,"url":"assets/index-legacy-CgP-1zaM.js"},{"revision":null,"url":"assets/index-legacy-CYkMy6jS.js"},{"revision":null,"url":"assets/index-legacy-CS1dcimk.js"},{"revision":null,"url":"assets/index-legacy-CRY6Z6V4.js"},{"revision":null,"url":"assets/index-legacy-CRNG4xMA.js"},{"revision":null,"url":"assets/index-legacy-CQ6WUSI6.js"},{"revision":null,"url":"assets/index-legacy-CHT2bKuR.js"},{"revision":null,"url":"assets/index-legacy-CCqjPU5j.js"},{"revision":null,"url":"assets/index-legacy-C71i_-qk.js"},{"revision":null,"url":"assets/index-legacy-C6rANs6l.js"},{"revision":null,"url":"assets/index-legacy-BxufD8N4.js"},{"revision":null,"url":"assets/index-legacy-BkhnOC_H.js"},{"revision":null,"url":"assets/index-legacy-Bk9kupMY.js"},{"revision":null,"url":"assets/index-legacy-BjyJ4Dfv.js"},{"revision":null,"url":"assets/index-legacy-BWrvD4_v.js"},{"revision":null,"url":"assets/index-legacy-BWmEdPL5.js"},{"revision":null,"url":"assets/index-legacy-BU714vxH.js"},{"revision":null,"url":"assets/index-legacy-BJgv1uLj.js"},{"revision":null,"url":"assets/index-legacy-BGjvplZH.js"},{"revision":null,"url":"assets/index-legacy-B6uhUpx_.js"},{"revision":null,"url":"assets/index-legacy-3HDSIOsX.js"},{"revision":null,"url":"assets/index-legacy-2XhXAWNr.js"},{"revision":null,"url":"assets/index-legacy-19PBIeHJ.js"},{"revision":null,"url":"assets/index-gLfZib4W.js"},{"revision":null,"url":"assets/index-fcpK6SJO.css"},{"revision":null,"url":"assets/index-aWWWGneb.css"},{"revision":null,"url":"assets/index-Vn3Q8ilQ.css"},{"revision":null,"url":"assets/index-UmxbhTpA.css"},{"revision":null,"url":"assets/index-TkZz_ILd.js"},{"revision":null,"url":"assets/index-T3K4QeZZ.js"},{"revision":null,"url":"assets/index-RLi2slKH.css"},{"revision":null,"url":"assets/index-PpCncnhs.js"},{"revision":null,"url":"assets/index-OVhWOYKL.js"},{"revision":null,"url":"assets/index-Lm8D0s0E.css"},{"revision":null,"url":"assets/index-KqgNzKKt.css"},{"revision":null,"url":"assets/index-HIF1L5Xg.css"},{"revision":null,"url":"assets/index-Dwd8wwi8.js"},{"revision":null,"url":"assets/index-DvHLrxmE.js"},{"revision":null,"url":"assets/index-Duy8tV-A.js"},{"revision":null,"url":"assets/index-DtH7X4HY.js"},{"revision":null,"url":"assets/index-Dq3CeaD-.js"},{"revision":null,"url":"assets/index-Dnhk7HFP.js"},{"revision":null,"url":"assets/index-DflLhxWS.js"},{"revision":null,"url":"assets/index-D_6a0MYr.js"},{"revision":null,"url":"assets/index-DR42ZvT1.js"},{"revision":null,"url":"assets/index-DO4h-e4P.js"},{"revision":null,"url":"assets/index-DMeZ3_Ho.js"},{"revision":null,"url":"assets/index-DH1aIpRB.js"},{"revision":null,"url":"assets/index-DDglYvuH.js"},{"revision":null,"url":"assets/index-DDX3ilEL.css"},{"revision":null,"url":"assets/index-DCOS5-H0.js"},{"revision":null,"url":"assets/index-D9gZL_Py.css"},{"revision":null,"url":"assets/index-D9Gud8qt.css"},{"revision":null,"url":"assets/index-D8B0V89-.js"},{"revision":null,"url":"assets/index-D5NZUkdC.js"},{"revision":null,"url":"assets/index-D4SkU01v.js"},{"revision":null,"url":"assets/index-D4BwvD6V.js"},{"revision":null,"url":"assets/index-D15dgOjY.js"},{"revision":null,"url":"assets/index-D-NXHS8i.css"},{"revision":null,"url":"assets/index-CwnN4Nmw.css"},{"revision":null,"url":"assets/index-CvP5y-WE.js"},{"revision":null,"url":"assets/index-CvJKp6pu.css"},{"revision":null,"url":"assets/index-CvICVRwg.js"},{"revision":null,"url":"assets/index-Copwwzpc.css"},{"revision":null,"url":"assets/index-Coiycqu6.js"},{"revision":null,"url":"assets/index-CoZhSUtv.js"},{"revision":null,"url":"assets/index-CiyzC_fS.js"},{"revision":null,"url":"assets/index-Ci9vE_OW.css"},{"revision":null,"url":"assets/index-Ci03jkyp.css"},{"revision":null,"url":"assets/index-CgH2Qwz-.css"},{"revision":null,"url":"assets/index-CfY37duh.js"},{"revision":null,"url":"assets/index-CbJuPzip.js"},{"revision":null,"url":"assets/index-CVPzOpEx.css"},{"revision":null,"url":"assets/index-CTDMc8PD.css"},{"revision":null,"url":"assets/index-CPQQAs3-.css"},{"revision":null,"url":"assets/index-CNCoxqxh.js"},{"revision":null,"url":"assets/index-CGVATda1.js"},{"revision":null,"url":"assets/index-CB8zXp3f.css"},{"revision":null,"url":"assets/index-C8qQAhY0.css"},{"revision":null,"url":"assets/index-C8b1wAL4.js"},{"revision":null,"url":"assets/index-C8V3oVwP.css"},{"revision":null,"url":"assets/index-C72HTJ42.js"},{"revision":null,"url":"assets/index-C12NeRUj.js"},{"revision":null,"url":"assets/index-BwF5gY2i.js"},{"revision":null,"url":"assets/index-Bu9IUXOI.css"},{"revision":null,"url":"assets/index-BsrstdQz.js"},{"revision":null,"url":"assets/index-BfWY6yOX.js"},{"revision":null,"url":"assets/index-BY_DOrUx.js"},{"revision":null,"url":"assets/index-BXSxSwtp.css"},{"revision":null,"url":"assets/index-BXHb8xHn.js"},{"revision":null,"url":"assets/index-BVyWHlqZ.css"},{"revision":null,"url":"assets/index-BUsQhxWi.css"},{"revision":null,"url":"assets/index-BTIlBIoI.css"},{"revision":null,"url":"assets/index-BSIU9Zns.css"},{"revision":null,"url":"assets/index-BS3-H-_D.js"},{"revision":null,"url":"assets/index-BOXsn0lU.js"},{"revision":null,"url":"assets/index-BIQ-5g31.js"},{"revision":null,"url":"assets/index-BH0Q3FRO.js"},{"revision":null,"url":"assets/index-BEtdOWd8.css"},{"revision":null,"url":"assets/index-BCper7To.css"},{"revision":null,"url":"assets/index-BBK2xM6v.css"},{"revision":null,"url":"assets/index-BANorbzj.css"},{"revision":null,"url":"assets/index-B90JOYAH.js"},{"revision":null,"url":"assets/index-B8SfqsHn.js"},{"revision":null,"url":"assets/index-B39xfnWC.js"},{"revision":null,"url":"assets/index-B2mlk2q2.js"},{"revision":null,"url":"assets/index-9s3cERYf.css"},{"revision":null,"url":"assets/index-94LErsfl.css"},{"revision":null,"url":"assets/index-4WdrtPCW.js"},{"revision":null,"url":"assets/index-3VIx8Ck-.js"},{"revision":null,"url":"assets/index--KkxWxZ8.js"},{"revision":null,"url":"assets/imageFacade-legacy-ChMhqklN.js"},{"revision":null,"url":"assets/imageFacade-C6LfBm3v.js"},{"revision":null,"url":"assets/html2canvas.esm-legacy-DIGTxsNk.js"},{"revision":null,"url":"assets/html2canvas.esm-BJcB2cAV.js"},{"revision":null,"url":"assets/geoUtils-lr5R6qwh.js"},{"revision":null,"url":"assets/geoUtils-legacy-DSxUaZh9.js"},{"revision":null,"url":"assets/galleries-legacy-DZz-LeyN.js"},{"revision":null,"url":"assets/galleries-CGEI8A7E.js"},{"revision":null,"url":"assets/formatters-legacy-CrrFfwI4.js"},{"revision":null,"url":"assets/formatters-DEFct8K3.js"},{"revision":null,"url":"assets/finance-legacy-tUtuQhgS.js"},{"revision":null,"url":"assets/finance-P7XgaRlC.js"},{"revision":null,"url":"assets/fileHelpers-legacy-eSx2fQ56.js"},{"revision":null,"url":"assets/fileHelpers-RA5AmS_H.js"},{"revision":null,"url":"assets/cryptoPurchaseHelpers-legacy-AxWYtUF4.js"},{"revision":null,"url":"assets/cryptoPurchaseHelpers-DG45whTA.js"},{"revision":null,"url":"assets/cryptoHelper-legacy-C7tmD7Ap.js"},{"revision":null,"url":"assets/cryptoHelper-BVphwZtQ.js"},{"revision":null,"url":"assets/contractPdf-legacy-bD6uInA8.js"},{"revision":null,"url":"assets/contractPdf-DPEPZfq5.js"},{"revision":null,"url":"assets/cil-x-legacy-Qr_cwwg3.js"},{"revision":null,"url":"assets/cil-x-CfQSVFP2.js"},{"revision":null,"url":"assets/cil-warning-legacy-CzEvJIux.js"},{"revision":null,"url":"assets/cil-warning-CEGefZLr.js"},{"revision":null,"url":"assets/cil-trash-legacy-C42VUvsZ.js"},{"revision":null,"url":"assets/cil-trash-gHK8YSrs.js"},{"revision":null,"url":"assets/cil-terminal-legacy-CHvaaCeC.js"},{"revision":null,"url":"assets/cil-terminal-Dlxribu1.js"},{"revision":null,"url":"assets/cil-sync-legacy-DqYim_X5.js"},{"revision":null,"url":"assets/cil-sync-BvztI_v8.js"},{"revision":null,"url":"assets/cil-storage-vCxUaE-Z.js"},{"revision":null,"url":"assets/cil-storage-legacy-Cr2YzXY0.js"},{"revision":null,"url":"assets/cil-star-legacy-DJpdc5pf.js"},{"revision":null,"url":"assets/cil-star-DrZ260am.js"},{"revision":null,"url":"assets/cil-plus-legacy-QLKf2chB.js"},{"revision":null,"url":"assets/cil-plus-CjZkVDO0.js"},{"revision":null,"url":"assets/cil-people-legacy-CWYhgM2E.js"},{"revision":null,"url":"assets/cil-people-BzpFUCRV.js"},{"revision":null,"url":"assets/cil-pencil-legacy-CP7gv1FJ.js"},{"revision":null,"url":"assets/cil-pencil-c89ONrkF.js"},{"revision":null,"url":"assets/cil-magnifying-glass-legacy-jKzJX5Hz.js"},{"revision":null,"url":"assets/cil-magnifying-glass-Bjd2ULXB.js"},{"revision":null,"url":"assets/cil-list-legacy-BpzB1YWv.js"},{"revision":null,"url":"assets/cil-list-CJ0Z10xx.js"},{"revision":null,"url":"assets/cil-grid-legacy-B-Cde07x.js"},{"revision":null,"url":"assets/cil-grid-DOYbA8pO.js"},{"revision":null,"url":"assets/cil-fullscreen-legacy-hDkGwXP0.js"},{"revision":null,"url":"assets/cil-fullscreen-VYg6FsV3.js"},{"revision":null,"url":"assets/cil-fullscreen-CsRryDwx.css"},{"revision":null,"url":"assets/cil-description-legacy-BBPaynXm.js"},{"revision":null,"url":"assets/cil-description-CAWk7Qv3.js"},{"revision":null,"url":"assets/cil-copy-legacy-B25iN0fH.js"},{"revision":null,"url":"assets/cil-copy-BsaR4wcz.js"},{"revision":null,"url":"assets/cil-chevron-right-legacy-BHIg_UAi.js"},{"revision":null,"url":"assets/cil-chevron-right-Bt1LshHI.js"},{"revision":null,"url":"assets/cil-chevron-bottom-legacy-C4rpVcn5.js"},{"revision":null,"url":"assets/cil-chevron-bottom-BNubmxZH.js"},{"revision":null,"url":"assets/cil-check-circle-legacy-J6-GJGMW.js"},{"revision":null,"url":"assets/cil-check-circle-CHux44rA.js"},{"revision":null,"url":"assets/cil-chart-pie-legacy-mzLfX48g.js"},{"revision":null,"url":"assets/cil-chart-pie-MIABLvpV.js"},{"revision":null,"url":"assets/cil-car-alt-legacy-BX6OujyW.js"},{"revision":null,"url":"assets/cil-car-alt-D6f-5LuT.js"},{"revision":null,"url":"assets/cil-bug-legacy-B_LgX7UU.js"},{"revision":null,"url":"assets/cil-bug-DIlRYuvG.js"},{"revision":null,"url":"assets/cil-bell-legacy-BpFjnS-u.js"},{"revision":null,"url":"assets/cil-bell-CZe3Rh8Q.js"},{"revision":null,"url":"assets/cil-arrow-top-legacy-ClqzXtem.js"},{"revision":null,"url":"assets/cil-arrow-top-DErzQfBQ.js"},{"revision":null,"url":"assets/cil-arrow-left-legacy-RqyR1cLw.js"},{"revision":null,"url":"assets/cil-arrow-left-DrtzzmuU.js"},{"revision":null,"url":"assets/cil-arrow-bottom-legacy-DUy9YACi.js"},{"revision":null,"url":"assets/cil-arrow-bottom-DbQMsyby.js"},{"revision":null,"url":"assets/categoryMonthStats-legacy-C3hsWLfp.js"},{"revision":null,"url":"assets/categoryMonthStats-CmTYNP01.js"},{"revision":null,"url":"assets/cashFlow-legacy-Bb8yJegt.js"},{"revision":null,"url":"assets/cashFlow-DxVpL7m9.js"},{"revision":null,"url":"assets/browser-legacy-BY2P-TOi.js"},{"revision":null,"url":"assets/browser-CboWctPp.js"},{"revision":null,"url":"assets/auditHelpers-mQnDDK2F.js"},{"revision":null,"url":"assets/auditHelpers-legacy-B9HCQCja.js"},{"revision":null,"url":"assets/Visits-legacy-DMWSYyNy.js"},{"revision":null,"url":"assets/Visits-BbZPxFKl.js"},{"revision":null,"url":"assets/Vehicles-n6qec_kG.js"},{"revision":null,"url":"assets/Vehicles-legacy-CbLfAfzo.js"},{"revision":null,"url":"assets/Users-legacy-dqe5k6sO.js"},{"revision":null,"url":"assets/Users-Cj-bngBa.js"},{"revision":null,"url":"assets/UserEdit-r6VPxDo0.js"},{"revision":null,"url":"assets/UserEdit-legacy-BYN5J3b7.js"},{"revision":null,"url":"assets/Tenants-legacy-GXXXDlW8.js"},{"revision":null,"url":"assets/Tenants-BPI8HvM9.js"},{"revision":null,"url":"assets/TaxisLayout-legacy-BesBZeHS.js"},{"revision":null,"url":"assets/TaxisLayout-NFkJgO0J.css"},{"revision":null,"url":"assets/TaxisLayout-DNVG19_P.js"},{"revision":null,"url":"assets/TasksPage-legacy-Bfra5H95.js"},{"revision":null,"url":"assets/TasksPage-DqBeh-DO.css"},{"revision":null,"url":"assets/TasksPage-BIsBQmHD.js"},{"revision":null,"url":"assets/SystemLayout-legacy-BaJCMu3j.js"},{"revision":null,"url":"assets/SystemLayout-CD-jXtu4.js"},{"revision":null,"url":"assets/Summary-legacy-C8CV8GtN.js"},{"revision":null,"url":"assets/Summary-BmntFxEF.js"},{"revision":null,"url":"assets/SolarPanel-legacy-bTR2Ir23.js"},{"revision":null,"url":"assets/SolarPanel-DKX4_Ofe.css"},{"revision":null,"url":"assets/SolarPanel-Bh5W9-cr.js"},{"revision":null,"url":"assets/SolarLocationModal-legacy-DwYr1hjz.js"},{"revision":null,"url":"assets/SolarLocationModal-DY0Bpleg.css"},{"revision":null,"url":"assets/SolarLocationModal-4OvrJl_8.js"},{"revision":null,"url":"assets/SolarCalculatorLocal-legacy-CNZkqNl0.js"},{"revision":null,"url":"assets/SolarCalculatorLocal-Bibm_-MA.js"},{"revision":null,"url":"assets/SolarCalculator-legacy-kdLbdFo-.js"},{"revision":null,"url":"assets/SolarCalculator-BUprDQGm.css"},{"revision":null,"url":"assets/SolarCalculator-207EKeGT.js"},{"revision":null,"url":"assets/SerialConsole-legacy-CXJ-boIb.js"},{"revision":null,"url":"assets/SerialConsole-d3OtkgDm.css"},{"revision":null,"url":"assets/SerialConsole-CR5bhwI_.js"},{"revision":null,"url":"assets/SelectApp-legacy-DQ96Ru8L.js"},{"revision":null,"url":"assets/SelectApp-DXPSncRs.js"},{"revision":null,"url":"assets/SelectApp-B8ySWQ6M.css"},{"revision":null,"url":"assets/SalaryDistribution-legacy-D4zmCP-N.js"},{"revision":null,"url":"assets/SalaryDistribution-B7L08D3L.js"},{"revision":null,"url":"assets/Register-legacy-Tlw5H919.js"},{"revision":null,"url":"assets/Register-gVktm4kD.js"},{"revision":null,"url":"assets/PushSubscribers-legacy-CtuVJrZh.js"},{"revision":null,"url":"assets/PushSubscribers-BwMYfMb2.js"},{"revision":null,"url":"assets/Profile-legacy-X6v-0t_d.js"},{"revision":null,"url":"assets/Profile-BXC6M3bR.js"},{"revision":null,"url":"assets/Profile--CFRU_BO.css"},{"revision":null,"url":"assets/PerfLogsPage-legacy-MA2C5-dP.js"},{"revision":null,"url":"assets/PerfLogsPage-CFL9NQHN.js"},{"revision":null,"url":"assets/Payments-legacy-DB3c0w4G.js"},{"revision":null,"url":"assets/Payments-legacy-C3LRVqdz.js"},{"revision":null,"url":"assets/Payments-Cw2sfArr.js"},{"revision":null,"url":"assets/Payments-CmLfzskm.css"},{"revision":null,"url":"assets/Payments-BP6kndtq.css"},{"revision":null,"url":"assets/Partners-legacy-CzwexTfM.js"},{"revision":null,"url":"assets/Partners-9_Y7Komx.js"},{"revision":null,"url":"assets/Page500-legacy-BTi8nq-N.js"},{"revision":null,"url":"assets/Page500-B-mwE9fE.js"},{"revision":null,"url":"assets/Page404-legacy-ebXNHBl6.js"},{"revision":null,"url":"assets/Page404-DTwtkCV4.js"},{"revision":null,"url":"assets/Operations-legacy-B2U5zGI1.js"},{"revision":null,"url":"assets/Operations-DQxxKrSq.css"},{"revision":null,"url":"assets/Operations-BwY5Kyto.js"},{"revision":null,"url":"assets/NoteFullPage-legacy-D8yc0cui.js"},{"revision":null,"url":"assets/NoteFullPage-DLZ4P4Rm.css"},{"revision":null,"url":"assets/NoteFullPage-BdMsCIFd.js"},{"revision":null,"url":"assets/MiscelaneaLayout-legacy-D4z4MuJ7.js"},{"revision":null,"url":"assets/MiscelaneaLayout-CcbN7eD-.js"},{"revision":null,"url":"assets/LoginSuper-legacy-BIVpnetD.js"},{"revision":null,"url":"assets/LoginSuper-BEtVxNwu.js"},{"revision":null,"url":"assets/Login-legacy-DagqYIgC.js"},{"revision":null,"url":"assets/Login-legacy-CGc71PlZ.js"},{"revision":null,"url":"assets/Login-DEeaVLWi.css"},{"revision":null,"url":"assets/Login-CxGmu700.css"},{"revision":null,"url":"assets/Login-ByxnUVI2.js"},{"revision":null,"url":"assets/InlinePaymentMethod-legacy-D4o80wAY.js"},{"revision":null,"url":"assets/InlinePaymentMethod-B3s9yO6Y.js"},{"revision":null,"url":"assets/Index-legacy-Ci8aezru.js"},{"revision":null,"url":"assets/Index-legacy-BvQEd3Ps.js"},{"revision":null,"url":"assets/Index-legacy-BU5sSNaZ.js"},{"revision":null,"url":"assets/Index-legacy-B4Z9xuSJ.js"},{"revision":null,"url":"assets/Index-Ih7T1Dkn.css"},{"revision":null,"url":"assets/Index-DmapxQAD.js"},{"revision":null,"url":"assets/Index-DIshBAYo.css"},{"revision":null,"url":"assets/Index-DFZANTH9.js"},{"revision":null,"url":"assets/Index-D-c80uEX.css"},{"revision":null,"url":"assets/Index-CcNnE9i3.css"},{"revision":null,"url":"assets/Index-BsKz6xhx.js"},{"revision":null,"url":"assets/Index-BcFogUFS.js"},{"revision":null,"url":"assets/IncreaseDecrease-legacy-7jHAf65-.js"},{"revision":null,"url":"assets/IncreaseDecrease-Cl95sQL1.js"},{"revision":null,"url":"assets/Home-legacy-CouVHLyI.js"},{"revision":null,"url":"assets/Home-legacy-BJ54tezG.js"},{"revision":null,"url":"assets/Home-Fn9acN-E.css"},{"revision":null,"url":"assets/Home-CNKa9Lbx.js"},{"revision":null,"url":"assets/Home-BJTvfqqa.js"},{"revision":null,"url":"assets/HardRefresh-legacy-BQp9SMUm.js"},{"revision":null,"url":"assets/HardRefresh-DOBWRC9o.js"},{"revision":null,"url":"assets/FinanceLayout-legacy-D-nIJoFi.js"},{"revision":null,"url":"assets/FinanceLayout-DL9As09y.js"},{"revision":null,"url":"assets/Expenses-legacy-BDlJ9Vkw.js"},{"revision":null,"url":"assets/Expenses-BICLdYXH.js"},{"revision":null,"url":"assets/ErrorLogsPage-legacy-C2EwauuH.js"},{"revision":null,"url":"assets/ErrorLogsPage-Rt4KYn4R.js"},{"revision":null,"url":"assets/ErrorLogsPage-DUi7-TH-.css"},{"revision":null,"url":"assets/EmptyLayout-legacy-Bt4MxQSp.js"},{"revision":null,"url":"assets/EmptyLayout-BxyYACNE.js"},{"revision":null,"url":"assets/Eggs-legacy-DuaVtPb3.js"},{"revision":null,"url":"assets/Eggs-aR7gte7N.js"},{"revision":null,"url":"assets/Drivers-legacy-Btpe9GLv.js"},{"revision":null,"url":"assets/Drivers-1DJwcvxM.js"},{"revision":null,"url":"assets/DriverEditor-legacy-CEd0yMU-.js"},{"revision":null,"url":"assets/DriverEditor-BfUJdo7w.js"},{"revision":null,"url":"assets/DriverDocuments-legacy-CKwHRf7C.js"},{"revision":null,"url":"assets/DriverDocuments-BYSUTkyj.js"},{"revision":null,"url":"assets/DomoticaLayout-legacy-BbCAfM7V.js"},{"revision":null,"url":"assets/DomoticaLayout-BRaxSIuJ.js"},{"revision":null,"url":"assets/DocsExample-legacy-CBkjUclB.js"},{"revision":null,"url":"assets/DocsExample-Qt0GzNZw.js"},{"revision":null,"url":"assets/DocsExample-Bf9WI3wN.css"},{"revision":null,"url":"assets/Distributions-legacy-D-1S0YTk.js"},{"revision":null,"url":"assets/Distributions-CQ5XHYCa.js"},{"revision":null,"url":"assets/Devices-legacy-Cagap5eB.js"},{"revision":null,"url":"assets/Devices-CYyiNn4Q.js"},{"revision":null,"url":"assets/Devices-BnDFC5s2.css"},{"revision":null,"url":"assets/Designs-legacy-Didx6kQi.js"},{"revision":null,"url":"assets/Designs-Dd1_2Mfq.css"},{"revision":null,"url":"assets/DeclaracionRenta-legacy-C3EcDVbK.js"},{"revision":null,"url":"assets/DeclaracionRenta-DqnpLrkl.js"},{"revision":null,"url":"assets/DeclaracionRenta-Bu-ZGZbV.css"},{"revision":null,"url":"assets/Dashboard-legacy-C9WsWpI8.js"},{"revision":null,"url":"assets/Dashboard-IMu5tVli.css"},{"revision":null,"url":"assets/Dashboard-B00oZxy5.js"},{"revision":null,"url":"assets/CryptoReport-legacy-ClUK72-z.js"},{"revision":null,"url":"assets/CryptoReport-DU9pQaU_.css"},{"revision":null,"url":"assets/CryptoReport-CmoVusIb.js"},{"revision":null,"url":"assets/CryptoQuery-legacy-NvnRJqDb.js"},{"revision":null,"url":"assets/CryptoQuery-LN03rOw4.js"},{"revision":null,"url":"assets/CryptoQuery-D3-rvF63.css"},{"revision":null,"url":"assets/CryptoActivityDashboard-legacy-C63W8IjV.js"},{"revision":null,"url":"assets/CryptoActivityDashboard-D3un5zml.js"},{"revision":null,"url":"assets/CryptoActivityDashboard-B_2XXvOa.css"},{"revision":null,"url":"assets/ContactMessages-legacy-Bu0Yh_dE.js"},{"revision":null,"url":"assets/ContactMessages-CyKfV4W4.js"},{"revision":null,"url":"assets/CommandDictionary-legacy-LAjJSe7X.js"},{"revision":null,"url":"assets/CommandDictionary-Dw_5RGPH.css"},{"revision":null,"url":"assets/CommandDictionary-BfAEiQyV.js"},{"revision":null,"url":"assets/Cleanup-legacy--bnfqJzG.js"},{"revision":null,"url":"assets/Cleanup-DGy2KPY0.js"},{"revision":null,"url":"assets/Cleanup-BZ1xxKNt.css"},{"revision":null,"url":"assets/CategoryMonthStatement-legacy-DjwKmKaM.js"},{"revision":null,"url":"assets/CategoryMonthStatement-cVQPcs_X.js"},{"revision":null,"url":"assets/CategoryMonthStatement-4pSD1m3c.css"},{"revision":null,"url":"assets/CToastBody-legacy-DwPjo5t6.js"},{"revision":null,"url":"assets/CToastBody-CtLLnsnd.js"},{"revision":null,"url":"assets/CRow-legacy-DOOV9yMf.js"},{"revision":null,"url":"assets/CRow-MPXsXp_f.js"},{"revision":null,"url":"assets/CModalTitle-legacy-b3nhIHnB.js"},{"revision":null,"url":"assets/CModalTitle-BXTUyx9O.js"},{"revision":null,"url":"assets/CModalFooter-legacy-xFaNG3do.js"},{"revision":null,"url":"assets/CModalFooter-DJ9xSxOP.js"},{"revision":null,"url":"assets/CListGroupItem-legacy-BxII_5yt.js"},{"revision":null,"url":"assets/CListGroupItem-C7sI-7Fm.js"},{"revision":null,"url":"assets/CLink-legacy-CMQxe-Gp.js"},{"revision":null,"url":"assets/CLink-Vv0v3afT.js"},{"revision":null,"url":"assets/CInputGroupText-legacy-C3cEJvmM.js"},{"revision":null,"url":"assets/CInputGroupText-BAlUYbtM.js"},{"revision":null,"url":"assets/CFormSelect-legacy-DIyzZBY7.js"},{"revision":null,"url":"assets/CFormSelect-DZBxVc1P.js"},{"revision":null,"url":"assets/CFormLabel-pTPp_DJJ.js"},{"revision":null,"url":"assets/CFormLabel-legacy-BsM5VXta.js"},{"revision":null,"url":"assets/CFormInput-legacy-CqotgIy_.js"},{"revision":null,"url":"assets/CFormInput-BveUf21E.js"},{"revision":null,"url":"assets/CFormControlWrapper-legacy-BVmTogyd.js"},{"revision":null,"url":"assets/CFormControlWrapper-BRf4pTNn.js"},{"revision":null,"url":"assets/CFormCheck-legacy-6bpBGfJM.js"},{"revision":null,"url":"assets/CFormCheck-BZjU7rkf.js"},{"revision":null,"url":"assets/CContainer-legacy-DOMVlYwB.js"},{"revision":null,"url":"assets/CContainer-CTWlvyVA.js"},{"revision":null,"url":"assets/CCollapse-legacy-B1ofWPKz.js"},{"revision":null,"url":"assets/CCollapse-B9LBOeIi.js"},{"revision":null,"url":"assets/CCardHeader-legacy-B1XhrVkG.js"},{"revision":null,"url":"assets/CCardHeader-B0ESnYbc.js"},{"revision":null,"url":"assets/CCardBody-legacy-UYycL9Ha.js"},{"revision":null,"url":"assets/CCardBody-DIVeZqjP.js"},{"revision":null,"url":"assets/CCard-legacy-fLgT6sGJ.js"},{"revision":null,"url":"assets/CCard-Dvq_2wZH.js"},{"revision":null,"url":"assets/CAlert-legacy-_grBrJQJ.js"},{"revision":null,"url":"assets/CAlert-PJEiTUv-.js"},{"revision":null,"url":"assets/BrandName-legacy-DpKauRfQ.js"},{"revision":null,"url":"assets/BrandName-DdT8wYcQ.js"},{"revision":null,"url":"assets/AuditLogsPage-legacy-Cre36QEf.js"},{"revision":null,"url":"assets/AuditLogsPage-BldrA7QG.js"},{"revision":null,"url":"assets/Assets-legacy-Czeq7-Ip.js"},{"revision":null,"url":"assets/Assets-dn20hx98.css"},{"revision":null,"url":"assets/Assets-BXFYgge0.js"},{"revision":null,"url":"assets/AppSettings-legacy-COKOE-LG.js"},{"revision":null,"url":"assets/AppSettings-fwv1rK2t.js"},{"revision":null,"url":"assets/AppIcons-m_iclm1D.js"},{"revision":null,"url":"assets/AppIcons-legacy-g8mQNF_-.js"},{"revision":null,"url":"assets/AnnualSummary-legacy-DvFxGPJs.js"},{"revision":null,"url":"assets/AnnualSummary-S0xVZe6a.js"},{"revision":null,"url":"assets/AnnualSummary-LJxsOGO-.css"},{"revision":null,"url":"assets/Accounts-legacy-M7Tzg3ua.js"},{"revision":null,"url":"assets/Accounts-DwHkiBed.js"},{"revision":"5b08b3f17508d9fe42f47af44a6c43a7","url":"favicon.ico"},{"revision":"b4639486fd4ede917de4e099a40605d8","url":"icons/icon.svg"},{"revision":"e111845fdeb48ec259e05bafbcd6043c","url":"manifest.webmanifest"}]);wn();ct(new Sn(new En({plugins:[{handlerDidError:async()=>caches.match("/offline.html")}]})));self.addEventListener("message",t=>{var e;((e=t.data)==null?void 0:e.type)==="SKIP_WAITING"&&self.skipWaiting()});const Fo=wt({apiKey:"AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g",authDomain:"cashflow-9cbbc.firebaseapp.com",projectId:"cashflow-9cbbc",storageBucket:"cashflow-9cbbc.appspot.com",messagingSenderId:"221005846539",appId:"1:221005846539:web:b51908636c88cb25998f0e"}),Uo=Ao(Fo);Co(Uo,t=>{var r;const{title:e,body:n}=(r=t.notification)!=null?r:{};self.registration.showNotification(e!=null?e:"Notificación",{body:n,icon:"/icons/icon.svg"})});self.addEventListener("periodicsync",t=>{t.tag==="check-active-accounts"&&t.waitUntil(Ho()),t.tag==="pico-y-placa"&&t.waitUntil(Bo())});async function Ho(){try{const t=new Date,e=t.getHours();if(![8,12,18].includes(e))return;const r=t.toISOString().split("T")[0],s="last-notify-".concat(r,"-").concat(e),o=await j();if(await new Promise(u=>{const f=o.transaction(S.APP_METADATA,"readonly").objectStore(S.APP_METADATA).get(s);f.onsuccess=()=>u(!!f.result),f.onerror=()=>u(!1)}))return;const c=(await To()).filter(u=>u.active===!0).length;await self.registration.showNotification("Cuentas Activas",{body:"Hay ".concat(c," cuentas activas en este momento."),icon:"/icons/icon.svg",tag:"active-accounts-notification",badge:"/icons/icon.svg"});const l=o.transaction(S.APP_METADATA,"readwrite");l.objectStore(S.APP_METADATA).put(!0,s),await new Promise((u,h)=>{l.oncomplete=()=>u(),l.onerror=()=>h(l.error)})}catch(t){console.error("Error in periodic sync checkActiveAccountsAndNotify:",t)}}

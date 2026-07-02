try{self["workbox:core:7.4.0"]&&_()}catch(t){}const Yt=(t,...e)=>{let n=t;return e.length>0&&(n+=" :: ".concat(JSON.stringify(e))),n},Jt=Yt;class m extends Error{constructor(e,n){const r=Jt(e,n);super(r),this.name=e,this.details=n}}const I={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:typeof registration<"u"?registration.scope:""},ae=t=>[I.prefix,t,I.suffix].filter(e=>e&&e.length>0).join("-"),Xt=t=>{for(const e of Object.keys(I))t(e)},ee={updateDetails:t=>{Xt(e=>{typeof t[e]=="string"&&(I[e]=t[e])})},getGoogleAnalyticsName:t=>t||ae(I.googleAnalytics),getPrecacheName:t=>t||ae(I.precache),getPrefix:()=>I.prefix,getRuntimeName:t=>t||ae(I.runtime),getSuffix:()=>I.suffix};function Ue(t,e){const n=e();return t.waitUntil(n),n}try{self["workbox:precaching:7.4.0"]&&_()}catch(t){}const Qt="__WB_REVISION__";function Zt(t){if(!t)throw new m("add-to-cache-list-unexpected-type",{entry:t});if(typeof t=="string"){const a=new URL(t,location.href);return{cacheKey:a.href,url:a.href}}const{revision:e,url:n}=t;if(!n)throw new m("add-to-cache-list-unexpected-type",{entry:t});if(!e){const a=new URL(n,location.href);return{cacheKey:a.href,url:a.href}}const r=new URL(n,location.href),s=new URL(n,location.href);return r.searchParams.set(Qt,e),{cacheKey:r.href,url:s.href}}class en{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:n})=>{n&&(n.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:n,cachedResponse:r})=>{if(e.type==="install"&&n&&n.originalRequest&&n.originalRequest instanceof Request){const s=n.originalRequest.url;r?this.notUpdatedURLs.push(s):this.updatedURLs.push(s)}return r}}}class tn{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:n,params:r})=>{const s=(r==null?void 0:r.cacheKey)||this._precacheController.getCacheKeyForURL(n.url);return s?new Request(s,{headers:n.headers}):n},this._precacheController=e}}let K;function nn(){if(K===void 0){const t=new Response("");if("body"in t)try{new Response(t.body),K=!0}catch(e){K=!1}K=!1}return K}async function rn(t,e){let n=null;if(t.url&&(n=new URL(t.url).origin),n!==self.location.origin)throw new m("cross-origin-copy-response",{origin:n});const r=t.clone(),a={headers:new Headers(r.headers),status:r.status,statusText:r.statusText},o=nn()?r.body:await r.blob();return new Response(o,a)}const sn=t=>new URL(String(t),location.href).href.replace(new RegExp("^".concat(location.origin)),"");function He(t,e){const n=new URL(t);for(const r of e)n.searchParams.delete(r);return n.href}async function an(t,e,n,r){const s=He(e.url,n);if(e.url===s)return t.match(e,r);const a=Object.assign(Object.assign({},r),{ignoreSearch:!0}),o=await t.keys(e,a);for(const i of o){const c=He(i.url,n);if(s===c)return t.match(i,r)}}let on=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};const cn=new Set;async function ln(){for(const t of cn)await t()}function it(t){return new Promise(e=>setTimeout(e,t))}try{self["workbox:strategies:7.4.0"]&&_()}catch(t){}function z(t){return typeof t=="string"?new Request(t):t}class un{constructor(e,n){this._cacheKeys={},Object.assign(this,n),this.event=n.event,this._strategy=e,this._handlerDeferred=new on,this._extendLifetimePromises=[],this._plugins=[...e.plugins],this._pluginStateMap=new Map;for(const r of this._plugins)this._pluginStateMap.set(r,{});this.event.waitUntil(this._handlerDeferred.promise)}async fetch(e){const{event:n}=this;let r=z(e);if(r.mode==="navigate"&&n instanceof FetchEvent&&n.preloadResponse){const o=await n.preloadResponse;if(o)return o}const s=this.hasCallback("fetchDidFail")?r.clone():null;try{for(const o of this.iterateCallbacks("requestWillFetch"))r=await o({request:r.clone(),event:n})}catch(o){if(o instanceof Error)throw new m("plugin-error-request-will-fetch",{thrownErrorMessage:o.message})}const a=r.clone();try{let o;o=await fetch(r,r.mode==="navigate"?void 0:this._strategy.fetchOptions);for(const i of this.iterateCallbacks("fetchDidSucceed"))o=await i({event:n,request:a,response:o});return o}catch(o){throw s&&await this.runCallbacks("fetchDidFail",{error:o,event:n,originalRequest:s.clone(),request:a.clone()}),o}}async fetchAndCachePut(e){const n=await this.fetch(e),r=n.clone();return this.waitUntil(this.cachePut(e,r)),n}async cacheMatch(e){const n=z(e);let r;const{cacheName:s,matchOptions:a}=this._strategy,o=await this.getCacheKey(n,"read"),i=Object.assign(Object.assign({},a),{cacheName:s});r=await caches.match(o,i);for(const c of this.iterateCallbacks("cachedResponseWillBeUsed"))r=await c({cacheName:s,matchOptions:a,cachedResponse:r,request:o,event:this.event})||void 0;return r}async cachePut(e,n){const r=z(e);await it(0);const s=await this.getCacheKey(r,"write");if(!n)throw new m("cache-put-with-no-response",{url:sn(s.url)});const a=await this._ensureResponseSafeToCache(n);if(!a)return!1;const{cacheName:o,matchOptions:i}=this._strategy,c=await self.caches.open(o),l=this.hasCallback("cacheDidUpdate"),u=l?await an(c,s.clone(),["__WB_REVISION__"],i):null;try{await c.put(s,l?a.clone():a)}catch(d){if(d instanceof Error)throw d.name==="QuotaExceededError"&&await ln(),d}for(const d of this.iterateCallbacks("cacheDidUpdate"))await d({cacheName:o,oldResponse:u,newResponse:a.clone(),request:s,event:this.event});return!0}async getCacheKey(e,n){const r="".concat(e.url," | ").concat(n);if(!this._cacheKeys[r]){let s=e;for(const a of this.iterateCallbacks("cacheKeyWillBeUsed"))s=z(await a({mode:n,request:s,event:this.event,params:this.params}));this._cacheKeys[r]=s}return this._cacheKeys[r]}hasCallback(e){for(const n of this._strategy.plugins)if(e in n)return!0;return!1}async runCallbacks(e,n){for(const r of this.iterateCallbacks(e))await r(n)}*iterateCallbacks(e){for(const n of this._strategy.plugins)if(typeof n[e]=="function"){const r=this._pluginStateMap.get(n);yield a=>{const o=Object.assign(Object.assign({},a),{state:r});return n[e](o)}}}waitUntil(e){return this._extendLifetimePromises.push(e),e}async doneWaiting(){for(;this._extendLifetimePromises.length;){const e=this._extendLifetimePromises.splice(0),r=(await Promise.allSettled(e)).find(s=>s.status==="rejected");if(r)throw r.reason}}destroy(){this._handlerDeferred.resolve(null)}async _ensureResponseSafeToCache(e){let n=e,r=!1;for(const s of this.iterateCallbacks("cacheWillUpdate"))if(n=await s({request:this.request,response:n,event:this.event})||void 0,r=!0,!n)break;return r||n&&n.status!==200&&(n=void 0),n}}class ct{constructor(e={}){this.cacheName=ee.getRuntimeName(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[n]=this.handleAll(e);return n}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const n=e.event,r=typeof e.request=="string"?new Request(e.request):e.request,s="params"in e?e.params:void 0,a=new un(this,{event:n,request:r,params:s}),o=this._getResponse(a,r,n),i=this._awaitComplete(o,a,r,n);return[o,i]}async _getResponse(e,n,r){await e.runCallbacks("handlerWillStart",{event:r,request:n});let s;try{if(s=await this._handle(n,e),!s||s.type==="error")throw new m("no-response",{url:n.url})}catch(a){if(a instanceof Error){for(const o of e.iterateCallbacks("handlerDidError"))if(s=await o({error:a,event:r,request:n}),s)break}if(!s)throw a}for(const a of e.iterateCallbacks("handlerWillRespond"))s=await a({event:r,request:n,response:s});return s}async _awaitComplete(e,n,r,s){let a,o;try{a=await e}catch(i){}try{await n.runCallbacks("handlerDidRespond",{event:s,request:r,response:a}),await n.doneWaiting()}catch(i){i instanceof Error&&(o=i)}if(await n.runCallbacks("handlerDidComplete",{event:s,request:r,response:a,error:o}),n.destroy(),o)throw o}}class v extends ct{constructor(e={}){e.cacheName=ee.getPrecacheName(e.cacheName),super(e),this._fallbackToNetwork=e.fallbackToNetwork!==!1,this.plugins.push(v.copyRedirectedCacheableResponsesPlugin)}async _handle(e,n){const r=await n.cacheMatch(e);return r||(n.event&&n.event.type==="install"?await this._handleInstall(e,n):await this._handleFetch(e,n))}async _handleFetch(e,n){let r;const s=n.params||{};if(this._fallbackToNetwork){const a=s.integrity,o=e.integrity,i=!o||o===a;r=await n.fetch(new Request(e,{integrity:e.mode!=="no-cors"?o||a:void 0})),a&&i&&e.mode!=="no-cors"&&(this._useDefaultCacheabilityPluginIfNeeded(),await n.cachePut(e,r.clone()))}else throw new m("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return r}async _handleInstall(e,n){this._useDefaultCacheabilityPluginIfNeeded();const r=await n.fetch(e);if(!await n.cachePut(e,r.clone()))throw new m("bad-precaching-response",{url:e.url,status:r.status});return r}_useDefaultCacheabilityPluginIfNeeded(){let e=null,n=0;for(const[r,s]of this.plugins.entries())s!==v.copyRedirectedCacheableResponsesPlugin&&(s===v.defaultPrecacheCacheabilityPlugin&&(e=r),s.cacheWillUpdate&&n++);n===0?this.plugins.push(v.defaultPrecacheCacheabilityPlugin):n>1&&e!==null&&this.plugins.splice(e,1)}}v.defaultPrecacheCacheabilityPlugin={async cacheWillUpdate({response:t}){return!t||t.status>=400?null:t}};v.copyRedirectedCacheableResponsesPlugin={async cacheWillUpdate({response:t}){return t.redirected?await rn(t):t}};class hn{constructor({cacheName:e,plugins:n=[],fallbackToNetwork:r=!0}={}){this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map,this._strategy=new v({cacheName:ee.getPrecacheName(e),plugins:[...n,new tn({precacheController:this})],fallbackToNetwork:r}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this._strategy}precache(e){this.addToCacheList(e),this._installAndActiveListenersAdded||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this._installAndActiveListenersAdded=!0)}addToCacheList(e){const n=[];for(const r of e){typeof r=="string"?n.push(r):r&&r.revision===void 0&&n.push(r.url);const{cacheKey:s,url:a}=Zt(r),o=typeof r!="string"&&r.revision?"reload":"default";if(this._urlsToCacheKeys.has(a)&&this._urlsToCacheKeys.get(a)!==s)throw new m("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(a),secondEntry:s});if(typeof r!="string"&&r.integrity){if(this._cacheKeysToIntegrities.has(s)&&this._cacheKeysToIntegrities.get(s)!==r.integrity)throw new m("add-to-cache-list-conflicting-integrities",{url:a});this._cacheKeysToIntegrities.set(s,r.integrity)}if(this._urlsToCacheKeys.set(a,s),this._urlsToCacheModes.set(a,o),n.length>0){const i="Workbox is precaching URLs without revision info: ".concat(n.join(", "),"\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache");console.warn(i)}}}install(e){return Ue(e,async()=>{const n=new en;this.strategy.plugins.push(n);for(const[a,o]of this._urlsToCacheKeys){const i=this._cacheKeysToIntegrities.get(o),c=this._urlsToCacheModes.get(a),l=new Request(a,{integrity:i,cache:c,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:o},request:l,event:e}))}const{updatedURLs:r,notUpdatedURLs:s}=n;return{updatedURLs:r,notUpdatedURLs:s}})}activate(e){return Ue(e,async()=>{const n=await self.caches.open(this.strategy.cacheName),r=await n.keys(),s=new Set(this._urlsToCacheKeys.values()),a=[];for(const o of r)s.has(o.url)||(await n.delete(o),a.push(o.url));return{deletedURLs:a}})}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const n=new URL(e,location.href);return this._urlsToCacheKeys.get(n.href)}getIntegrityForCacheKey(e){return this._cacheKeysToIntegrities.get(e)}async matchPrecache(e){const n=e instanceof Request?e.url:e,r=this.getCacheKeyForURL(n);if(r)return(await self.caches.open(this.strategy.cacheName)).match(r)}createHandlerBoundToURL(e){const n=this.getCacheKeyForURL(e);if(!n)throw new m("non-precached-url",{url:e});return r=>(r.request=new Request(e),r.params=Object.assign({cacheKey:n},r.params),this.strategy.handle(r))}}let oe;const lt=()=>(oe||(oe=new hn),oe);try{self["workbox:routing:7.4.0"]&&_()}catch(t){}const ut="GET",G=t=>t&&typeof t=="object"?t:{handle:t};class ${constructor(e,n,r=ut){this.handler=G(n),this.match=e,this.method=r}setCatchHandler(e){this.catchHandler=G(e)}}class dn extends ${constructor(e,n,r){const s=({url:a})=>{const o=e.exec(a.href);if(o&&!(a.origin!==location.origin&&o.index!==0))return o.slice(1)};super(s,n,r)}}class fn{constructor(){this._routes=new Map,this._defaultHandlerMap=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",e=>{const{request:n}=e,r=this.handleRequest({request:n,event:e});r&&e.respondWith(r)})}addCacheListener(){self.addEventListener("message",e=>{if(e.data&&e.data.type==="CACHE_URLS"){const{payload:n}=e.data,r=Promise.all(n.urlsToCache.map(s=>{typeof s=="string"&&(s=[s]);const a=new Request(...s);return this.handleRequest({request:a,event:e})}));e.waitUntil(r),e.ports&&e.ports[0]&&r.then(()=>e.ports[0].postMessage(!0))}})}handleRequest({request:e,event:n}){const r=new URL(e.url,location.href);if(!r.protocol.startsWith("http"))return;const s=r.origin===location.origin,{params:a,route:o}=this.findMatchingRoute({event:n,request:e,sameOrigin:s,url:r});let i=o&&o.handler;const c=e.method;if(!i&&this._defaultHandlerMap.has(c)&&(i=this._defaultHandlerMap.get(c)),!i)return;let l;try{l=i.handle({url:r,request:e,event:n,params:a})}catch(d){l=Promise.reject(d)}const u=o&&o.catchHandler;return l instanceof Promise&&(this._catchHandler||u)&&(l=l.catch(async d=>{if(u)try{return await u.handle({url:r,request:e,event:n,params:a})}catch(f){f instanceof Error&&(d=f)}if(this._catchHandler)return this._catchHandler.handle({url:r,request:e,event:n});throw d})),l}findMatchingRoute({url:e,sameOrigin:n,request:r,event:s}){const a=this._routes.get(r.method)||[];for(const o of a){let i;const c=o.match({url:e,sameOrigin:n,request:r,event:s});if(c)return i=c,(Array.isArray(i)&&i.length===0||c.constructor===Object&&Object.keys(c).length===0||typeof c=="boolean")&&(i=void 0),{route:o,params:i}}return{}}setDefaultHandler(e,n=ut){this._defaultHandlerMap.set(n,G(e))}setCatchHandler(e){this._catchHandler=G(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new m("unregister-route-but-not-found-with-method",{method:e.method});const n=this._routes.get(e.method).indexOf(e);if(n>-1)this._routes.get(e.method).splice(n,1);else throw new m("unregister-route-route-not-registered")}}let V;const pn=()=>(V||(V=new fn,V.addFetchListener(),V.addCacheListener()),V);function ht(t,e,n){let r;if(typeof t=="string"){const a=new URL(t,location.href),o=({url:i})=>i.href===a.href;r=new $(o,e,n)}else if(t instanceof RegExp)r=new dn(t,e,n);else if(typeof t=="function")r=new $(t,e,n);else if(t instanceof $)r=t;else throw new m("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});return pn().registerRoute(r),r}function gn(t,e=[]){for(const n of[...t.searchParams.keys()])e.some(r=>r.test(n))&&t.searchParams.delete(n);return t}function*mn(t,{ignoreURLParametersMatching:e=[/^utm_/,/^fbclid$/],directoryIndex:n="index.html",cleanURLs:r=!0,urlManipulation:s}={}){const a=new URL(t,location.href);a.hash="",yield a.href;const o=gn(a,e);if(yield o.href,n&&o.pathname.endsWith("/")){const i=new URL(o.href);i.pathname+=n,yield i.href}if(r){const i=new URL(o.href);i.pathname+=".html",yield i.href}if(s){const i=s({url:a});for(const c of i)yield c.href}}class bn extends ${constructor(e,n){const r=({request:s})=>{const a=e.getURLsToCacheKeys();for(const o of mn(s.url,n)){const i=a.get(o);if(i){const c=e.getIntegrityForCacheKey(i);return{cacheKey:i,integrity:c}}}};super(r,e.strategy)}}function wn(t){const e=lt(),n=new bn(e,t);ht(n)}const yn="-precache-",_n=async(t,e=yn)=>{const r=(await self.caches.keys()).filter(s=>s.includes(e)&&s.includes(self.registration.scope)&&s!==t);return await Promise.all(r.map(s=>self.caches.delete(s))),r};function Sn(){self.addEventListener("activate",t=>{const e=ee.getPrecacheName();t.waitUntil(_n(e).then(n=>{}))})}function En(t){lt().precache(t)}function In(t,e){En(t),wn(e)}class An extends ${constructor(e,{allowlist:n=[/./],denylist:r=[]}={}){super(s=>this._match(s),e),this._allowlist=n,this._denylist=r}_match({url:e,request:n}){if(n&&n.mode!=="navigate")return!1;const r=e.pathname+e.search;for(const s of this._denylist)if(s.test(r))return!1;return!!this._allowlist.some(s=>s.test(r))}}class Cn extends ct{constructor(e={}){super(e),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}async _handle(e,n){let r,s;try{const a=[n.fetch(e)];if(this._networkTimeoutSeconds){const o=it(this._networkTimeoutSeconds*1e3);a.push(o)}if(s=await Promise.race(a),!s)throw new Error("Timed out the network response after ".concat(this._networkTimeoutSeconds," seconds."))}catch(a){a instanceof Error&&(r=a)}if(!s)throw new m("no-response",{url:e.url,error:r});return s}}const vn=()=>{};var Ke={};/**
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
 */const dt=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},Tn=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const a=t[n++];e[r++]=String.fromCharCode((s&31)<<6|a&63)}else if(s>239&&s<365){const a=t[n++],o=t[n++],i=t[n++],c=((s&7)<<18|(a&63)<<12|(o&63)<<6|i&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const a=t[n++],o=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(a&63)<<6|o&63)}}return e.join("")},ft={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const a=t[s],o=s+1<t.length,i=o?t[s+1]:0,c=s+2<t.length,l=c?t[s+2]:0,u=a>>2,d=(a&3)<<4|i>>4;let f=(i&15)<<2|l>>6,g=l&63;c||(g=64,o||(f=64)),r.push(n[u],n[d],n[f],n[g])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(dt(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Tn(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const a=n[t.charAt(s++)],i=s<t.length?n[t.charAt(s)]:0;++s;const l=s<t.length?n[t.charAt(s)]:64;++s;const d=s<t.length?n[t.charAt(s)]:64;if(++s,a==null||i==null||l==null||d==null)throw new Dn;const f=a<<2|i>>4;if(r.push(f),l!==64){const g=i<<4&240|l>>2;if(r.push(g),d!==64){const b=l<<6&192|d;r.push(b)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Dn extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Rn=function(t){const e=dt(t);return ft.encodeByteArray(e,!0)},pt=function(t){return Rn(t).replace(/\./g,"")},kn=function(t){try{return ft.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function On(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Nn=()=>On().__FIREBASE_DEFAULTS__,Pn=()=>{if(typeof process>"u"||typeof Ke>"u")return;const t=Ke.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Mn=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(n){return}const e=t&&kn(t[1]);return e&&JSON.parse(e)},Ln=()=>{try{return vn()||Nn()||Pn()||Mn()}catch(t){console.info("Unable to get __FIREBASE_DEFAULTS__ due to: ".concat(t));return}},gt=()=>{var t;return(t=Ln())===null||t===void 0?void 0:t.config};/**
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
 */class Bn{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}function mt(){try{return typeof indexedDB=="object"}catch(t){return!1}}function bt(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var a;e(((a=s.error)===null||a===void 0?void 0:a.message)||"")}}catch(n){e(n)}})}/**
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
 */const xn="FirebaseError";class H extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=xn,Object.setPrototypeOf(this,H.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,te.prototype.create)}}class te{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s="".concat(this.service,"/").concat(e),a=this.errors[e],o=a?jn(a,r):"Error",i="".concat(this.serviceName,": ").concat(o," (").concat(s,").");return new H(s,i,r)}}function jn(t,e){return t.replace($n,(n,r)=>{const s=e[r];return s!=null?String(s):"<".concat(r,"?>")})}const $n=/\{\$([^}]+)}/g;function we(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const a=t[s],o=e[s];if(Ve(a)&&Ve(o)){if(!we(a,o))return!1}else if(a!==o)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function Ve(t){return t!==null&&typeof t=="object"}/**
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
 */function wt(t){return t&&t._delegate?t._delegate:t}class P{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */class Fn{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Bn;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch(s){}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(a){if(s)return null;throw a}else{if(s)return null;throw Error("Service ".concat(this.name," is not available"))}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error("Mismatching Component ".concat(e.name," for Provider ").concat(this.name,"."));if(this.component)throw Error("Component for ".concat(this.name," has already been provided"));if(this.component=e,!!this.shouldAutoInitialize()){if(Hn(e))try{this.getOrInitializeService({instanceIdentifier:O})}catch(n){}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const a=this.getOrInitializeService({instanceIdentifier:s});r.resolve(a)}catch(a){}}}}clearInstance(e=O){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=O){return this.instances.has(e)}getOptions(e=O){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error("".concat(this.name,"(").concat(r,") has already been initialized"));if(!this.isComponentSet())throw Error("Component ".concat(this.name," has not been registered yet"));const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[a,o]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(a);r===i&&o.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),a=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;a.add(e),this.onInitCallbacks.set(s,a);const o=this.instances.get(s);return o&&e(o,s),()=>{a.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch(a){}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Un(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch(s){}return r||null}normalizeInstanceIdentifier(e=O){return this.component?this.component.multipleInstances?e:O:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Un(t){return t===O?void 0:t}function Hn(t){return t.instantiationMode==="EAGER"}/**
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
 */class Kn{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error("Component ".concat(e.name," has already been registered with ").concat(this.name));n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Fn(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var h;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(h||(h={}));const Vn={debug:h.DEBUG,verbose:h.VERBOSE,info:h.INFO,warn:h.WARN,error:h.ERROR,silent:h.SILENT},Wn=h.INFO,qn={[h.DEBUG]:"log",[h.VERBOSE]:"log",[h.INFO]:"info",[h.WARN]:"warn",[h.ERROR]:"error"},zn=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=qn[e];if(s)console[s]("[".concat(r,"]  ").concat(t.name,":"),...n);else throw new Error("Attempted to log a message with an invalid logType (value: ".concat(e,")"))};class Gn{constructor(e){this.name=e,this._logLevel=Wn,this._logHandler=zn,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in h))throw new TypeError('Invalid value "'.concat(e,'" assigned to `logLevel`'));this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Vn[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,h.DEBUG,...e),this._logHandler(this,h.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,h.VERBOSE,...e),this._logHandler(this,h.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,h.INFO,...e),this._logHandler(this,h.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,h.WARN,...e),this._logHandler(this,h.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,h.ERROR,...e),this._logHandler(this,h.ERROR,...e)}}const Yn=(t,e)=>e.some(n=>t instanceof n);let We,qe;function Jn(){return We||(We=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Xn(){return qe||(qe=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const yt=new WeakMap,ye=new WeakMap,_t=new WeakMap,ie=new WeakMap,Ce=new WeakMap;function Qn(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",a),t.removeEventListener("error",o)},a=()=>{n(A(t.result)),s()},o=()=>{r(t.error),s()};t.addEventListener("success",a),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&yt.set(n,t)}).catch(()=>{}),Ce.set(e,t),e}function Zn(t){if(ye.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",a),t.removeEventListener("error",o),t.removeEventListener("abort",o)},a=()=>{n(),s()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",a),t.addEventListener("error",o),t.addEventListener("abort",o)});ye.set(t,e)}let _e={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return ye.get(t);if(e==="objectStoreNames")return t.objectStoreNames||_t.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return A(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function er(t){_e=t(_e)}function tr(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(ce(this),e,...n);return _t.set(r,e.sort?e.sort():[e]),A(r)}:Xn().includes(t)?function(...e){return t.apply(ce(this),e),A(yt.get(this))}:function(...e){return A(t.apply(ce(this),e))}}function nr(t){return typeof t=="function"?tr(t):(t instanceof IDBTransaction&&Zn(t),Yn(t,Jn())?new Proxy(t,_e):t)}function A(t){if(t instanceof IDBRequest)return Qn(t);if(ie.has(t))return ie.get(t);const e=nr(t);return e!==t&&(ie.set(t,e),Ce.set(e,t)),e}const ce=t=>Ce.get(t);function ne(t,e,{blocked:n,upgrade:r,blocking:s,terminated:a}={}){const o=indexedDB.open(t,e),i=A(o);return r&&o.addEventListener("upgradeneeded",c=>{r(A(o.result),c.oldVersion,c.newVersion,A(o.transaction),c)}),n&&o.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),i.then(c=>{a&&c.addEventListener("close",()=>a()),s&&c.addEventListener("versionchange",l=>s(l.oldVersion,l.newVersion,l))}).catch(()=>{}),i}function le(t,{blocked:e}={}){const n=indexedDB.deleteDatabase(t);return e&&n.addEventListener("blocked",r=>e(r.oldVersion,r)),A(n).then(()=>{})}const rr=["get","getKey","getAll","getAllKeys","count"],sr=["put","add","delete","clear"],ue=new Map;function ze(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(ue.get(e))return ue.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=sr.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||rr.includes(n)))return;const a=async function(o,...i){const c=this.transaction(o,s?"readwrite":"readonly");let l=c.store;return r&&(l=l.index(i.shift())),(await Promise.all([l[n](...i),s&&c.done]))[0]};return ue.set(e,a),a}er(t=>({...t,get:(e,n,r)=>ze(e,n)||t.get(e,n,r),has:(e,n)=>!!ze(e,n)||t.has(e,n)}));/**
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
 */class ar{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(or(n)){const r=n.getImmediate();return"".concat(r.library,"/").concat(r.version)}else return null}).filter(n=>n).join(" ")}}function or(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Se="@firebase/app",Ge="0.13.2";/**
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
 */const C=new Gn("@firebase/app"),ir="@firebase/app-compat",cr="@firebase/analytics-compat",lr="@firebase/analytics",ur="@firebase/app-check-compat",hr="@firebase/app-check",dr="@firebase/auth",fr="@firebase/auth-compat",pr="@firebase/database",gr="@firebase/data-connect",mr="@firebase/database-compat",br="@firebase/functions",wr="@firebase/functions-compat",yr="@firebase/installations",_r="@firebase/installations-compat",Sr="@firebase/messaging",Er="@firebase/messaging-compat",Ir="@firebase/performance",Ar="@firebase/performance-compat",Cr="@firebase/remote-config",vr="@firebase/remote-config-compat",Tr="@firebase/storage",Dr="@firebase/storage-compat",Rr="@firebase/firestore",kr="@firebase/ai",Or="@firebase/firestore-compat",Nr="firebase";/**
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
 */const Ee="[DEFAULT]",Pr={[Se]:"fire-core",[ir]:"fire-core-compat",[lr]:"fire-analytics",[cr]:"fire-analytics-compat",[hr]:"fire-app-check",[ur]:"fire-app-check-compat",[dr]:"fire-auth",[fr]:"fire-auth-compat",[pr]:"fire-rtdb",[gr]:"fire-data-connect",[mr]:"fire-rtdb-compat",[br]:"fire-fn",[wr]:"fire-fn-compat",[yr]:"fire-iid",[_r]:"fire-iid-compat",[Sr]:"fire-fcm",[Er]:"fire-fcm-compat",[Ir]:"fire-perf",[Ar]:"fire-perf-compat",[Cr]:"fire-rc",[vr]:"fire-rc-compat",[Tr]:"fire-gcs",[Dr]:"fire-gcs-compat",[Rr]:"fire-fst",[Or]:"fire-fst-compat",[kr]:"fire-vertex","fire-js":"fire-js",[Nr]:"fire-js-all"};/**
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
 */const Y=new Map,Mr=new Map,Ie=new Map;function Ye(t,e){try{t.container.addComponent(e)}catch(n){C.debug("Component ".concat(e.name," failed to register with FirebaseApp ").concat(t.name),n)}}function U(t){const e=t.name;if(Ie.has(e))return C.debug("There were multiple attempts to register component ".concat(e,".")),!1;Ie.set(e,t);for(const n of Y.values())Ye(n,t);for(const n of Mr.values())Ye(n,t);return!0}function ve(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}/**
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
 */const Lr={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},T=new te("app","Firebase",Lr);/**
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
 */class Br{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new P("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw T.create("app-deleted",{appName:this._name})}}function St(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Ee,automaticDataCollectionEnabled:!0},e),s=r.name;if(typeof s!="string"||!s)throw T.create("bad-app-name",{appName:String(s)});if(n||(n=gt()),!n)throw T.create("no-options");const a=Y.get(s);if(a){if(we(n,a.options)&&we(r,a.config))return a;throw T.create("duplicate-app",{appName:s})}const o=new Kn(s);for(const c of Ie.values())o.addComponent(c);const i=new Br(n,r,o);return Y.set(s,i),i}function xr(t=Ee){const e=Y.get(t);if(!e&&t===Ee&&gt())return St();if(!e)throw T.create("no-app",{appName:t});return e}function F(t,e,n){var r;let s=(r=Pr[t])!==null&&r!==void 0?r:t;n&&(s+="-".concat(n));const a=s.match(/\s|\//),o=e.match(/\s|\//);if(a||o){const i=['Unable to register library "'.concat(s,'" with version "').concat(e,'":')];a&&i.push('library name "'.concat(s,'" contains illegal characters (whitespace or "/")')),a&&o&&i.push("and"),o&&i.push('version name "'.concat(e,'" contains illegal characters (whitespace or "/")')),C.warn(i.join(" "));return}U(new P("".concat(s,"-version"),()=>({library:s,version:e}),"VERSION"))}/**
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
 */const jr="firebase-heartbeat-database",$r=1,W="firebase-heartbeat-store";let he=null;function Et(){return he||(he=ne(jr,$r,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(W)}catch(n){console.warn(n)}}}}).catch(t=>{throw T.create("idb-open",{originalErrorMessage:t.message})})),he}async function Fr(t){try{const n=(await Et()).transaction(W),r=await n.objectStore(W).get(It(t));return await n.done,r}catch(e){if(e instanceof H)C.warn(e.message);else{const n=T.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});C.warn(n.message)}}}async function Je(t,e){try{const r=(await Et()).transaction(W,"readwrite");await r.objectStore(W).put(e,It(t)),await r.done}catch(n){if(n instanceof H)C.warn(n.message);else{const r=T.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});C.warn(r.message)}}}function It(t){return"".concat(t.name,"!").concat(t.options.appId)}/**
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
 */const Ur=1024,Hr=30;class Kr{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Wr(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=Xe();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(o=>o.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:s}),this._heartbeatsCache.heartbeats.length>Hr){const o=qr(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){C.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Xe(),{heartbeatsToSend:r,unsentEntries:s}=Vr(this._heartbeatsCache.heartbeats),a=pt(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),a}catch(n){return C.warn(n),""}}}function Xe(){return new Date().toISOString().substring(0,10)}function Vr(t,e=Ur){const n=[];let r=t.slice();for(const s of t){const a=n.find(o=>o.agent===s.agent);if(a){if(a.dates.push(s.date),Qe(n)>e){a.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),Qe(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class Wr{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return mt()?bt().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Fr(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return Je(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return Je(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Qe(t){return pt(JSON.stringify({version:2,heartbeats:t})).length}function qr(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
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
 */function zr(t){U(new P("platform-logger",e=>new ar(e),"PRIVATE")),U(new P("heartbeat",e=>new Kr(e),"PRIVATE")),F(Se,Ge,t),F(Se,Ge,"esm2017"),F("fire-js","")}zr("");var Gr="firebase",Yr="11.10.0";/**
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
 */F(Gr,Yr,"app");const At="@firebase/installations",Te="0.6.18";/**
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
 */const Ct=1e4,vt="w:".concat(Te),Tt="FIS_v2",Jr="https://firebaseinstallations.googleapis.com/v1",Xr=60*60*1e3,Qr="installations",Zr="Installations";/**
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
 */const es={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},M=new te(Qr,Zr,es);function Dt(t){return t instanceof H&&t.code.includes("request-failed")}/**
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
 */function Rt({projectId:t}){return"".concat(Jr,"/projects/").concat(t,"/installations")}function kt(t){return{token:t.token,requestStatus:2,expiresIn:ns(t.expiresIn),creationTime:Date.now()}}async function Ot(t,e){const r=(await e.json()).error;return M.create("request-failed",{requestName:t,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function Nt({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function ts(t,{refreshToken:e}){const n=Nt(t);return n.append("Authorization",rs(e)),n}async function Pt(t){const e=await t();return e.status>=500&&e.status<600?t():e}function ns(t){return Number(t.replace("s","000"))}function rs(t){return"".concat(Tt," ").concat(t)}/**
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
 */async function ss({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const r=Rt(t),s=Nt(t),a=e.getImmediate({optional:!0});if(a){const l=await a.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const o={fid:n,authVersion:Tt,appId:t.appId,sdkVersion:vt},i={method:"POST",headers:s,body:JSON.stringify(o)},c=await Pt(()=>fetch(r,i));if(c.ok){const l=await c.json();return{fid:l.fid||n,registrationStatus:2,refreshToken:l.refreshToken,authToken:kt(l.authToken)}}else throw await Ot("Create Installation",c)}/**
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
 */function Mt(t){return new Promise(e=>{setTimeout(e,t)})}/**
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
 */function as(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
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
 */const os=/^[cdef][\w-]{21}$/,Ae="";function is(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const n=cs(t);return os.test(n)?n:Ae}catch(t){return Ae}}function cs(t){return as(t).substr(0,22)}/**
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
 */function re(t){return"".concat(t.appName,"!").concat(t.appId)}/**
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
 */const Lt=new Map;function Bt(t,e){const n=re(t);xt(n,e),ls(n,e)}function xt(t,e){const n=Lt.get(t);if(n)for(const r of n)r(e)}function ls(t,e){const n=us();n&&n.postMessage({key:t,fid:e}),hs()}let N=null;function us(){return!N&&"BroadcastChannel"in self&&(N=new BroadcastChannel("[Firebase] FID Change"),N.onmessage=t=>{xt(t.data.key,t.data.fid)}),N}function hs(){Lt.size===0&&N&&(N.close(),N=null)}/**
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
 */const ds="firebase-installations-database",fs=1,L="firebase-installations-store";let de=null;function De(){return de||(de=ne(ds,fs,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(L)}}})),de}async function J(t,e){const n=re(t),s=(await De()).transaction(L,"readwrite"),a=s.objectStore(L),o=await a.get(n);return await a.put(e,n),await s.done,(!o||o.fid!==e.fid)&&Bt(t,e.fid),e}async function jt(t){const e=re(t),r=(await De()).transaction(L,"readwrite");await r.objectStore(L).delete(e),await r.done}async function se(t,e){const n=re(t),s=(await De()).transaction(L,"readwrite"),a=s.objectStore(L),o=await a.get(n),i=e(o);return i===void 0?await a.delete(n):await a.put(i,n),await s.done,i&&(!o||o.fid!==i.fid)&&Bt(t,i.fid),i}/**
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
 */async function Re(t){let e;const n=await se(t.appConfig,r=>{const s=ps(r),a=gs(t,s);return e=a.registrationPromise,a.installationEntry});return n.fid===Ae?{installationEntry:await e}:{installationEntry:n,registrationPromise:e}}function ps(t){const e=t||{fid:is(),registrationStatus:0};return $t(e)}function gs(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(M.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=ms(t,n);return{installationEntry:n,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:bs(t)}:{installationEntry:e}}async function ms(t,e){try{const n=await ss(t,e);return J(t.appConfig,n)}catch(n){throw Dt(n)&&n.customData.serverCode===409?await jt(t.appConfig):await J(t.appConfig,{fid:e.fid,registrationStatus:0}),n}}async function bs(t){let e=await Ze(t.appConfig);for(;e.registrationStatus===1;)await Mt(100),e=await Ze(t.appConfig);if(e.registrationStatus===0){const{installationEntry:n,registrationPromise:r}=await Re(t);return r||n}return e}function Ze(t){return se(t,e=>{if(!e)throw M.create("installation-not-found");return $t(e)})}function $t(t){return ws(t)?{fid:t.fid,registrationStatus:0}:t}function ws(t){return t.registrationStatus===1&&t.registrationTime+Ct<Date.now()}/**
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
 */async function ys({appConfig:t,heartbeatServiceProvider:e},n){const r=_s(t,n),s=ts(t,n),a=e.getImmediate({optional:!0});if(a){const l=await a.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const o={installation:{sdkVersion:vt,appId:t.appId}},i={method:"POST",headers:s,body:JSON.stringify(o)},c=await Pt(()=>fetch(r,i));if(c.ok){const l=await c.json();return kt(l)}else throw await Ot("Generate Auth Token",c)}function _s(t,{fid:e}){return"".concat(Rt(t),"/").concat(e,"/authTokens:generate")}/**
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
 */async function ke(t,e=!1){let n;const r=await se(t.appConfig,a=>{if(!Ft(a))throw M.create("not-registered");const o=a.authToken;if(!e&&Is(o))return a;if(o.requestStatus===1)return n=Ss(t,e),a;{if(!navigator.onLine)throw M.create("app-offline");const i=Cs(a);return n=Es(t,i),i}});return n?await n:r.authToken}async function Ss(t,e){let n=await et(t.appConfig);for(;n.authToken.requestStatus===1;)await Mt(100),n=await et(t.appConfig);const r=n.authToken;return r.requestStatus===0?ke(t,e):r}function et(t){return se(t,e=>{if(!Ft(e))throw M.create("not-registered");const n=e.authToken;return vs(n)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function Es(t,e){try{const n=await ys(t,e),r=Object.assign(Object.assign({},e),{authToken:n});return await J(t.appConfig,r),n}catch(n){if(Dt(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await jt(t.appConfig);else{const r=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await J(t.appConfig,r)}throw n}}function Ft(t){return t!==void 0&&t.registrationStatus===2}function Is(t){return t.requestStatus===2&&!As(t)}function As(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+Xr}function Cs(t){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},t),{authToken:e})}function vs(t){return t.requestStatus===1&&t.requestTime+Ct<Date.now()}/**
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
 */async function Ts(t){const e=t,{installationEntry:n,registrationPromise:r}=await Re(e);return r?r.catch(console.error):ke(e).catch(console.error),n.fid}/**
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
 */async function Ds(t,e=!1){const n=t;return await Rs(n),(await ke(n,e)).token}async function Rs(t){const{registrationPromise:e}=await Re(t);e&&await e}/**
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
 */function ks(t){if(!t||!t.options)throw fe("App Configuration");if(!t.name)throw fe("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw fe(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function fe(t){return M.create("missing-app-config-values",{valueName:t})}/**
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
 */const Ut="installations",Os="installations-internal",Ns=t=>{const e=t.getProvider("app").getImmediate(),n=ks(e),r=ve(e,"heartbeat");return{app:e,appConfig:n,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},Ps=t=>{const e=t.getProvider("app").getImmediate(),n=ve(e,Ut).getImmediate();return{getId:()=>Ts(n),getToken:s=>Ds(n,s)}};function Ms(){U(new P(Ut,Ns,"PUBLIC")),U(new P(Os,Ps,"PRIVATE"))}Ms();F(At,Te);F(At,Te,"esm2017");/**
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
 */const Ht="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",Ls="https://fcmregistrations.googleapis.com/v1",Kt="FCM_MSG",Bs="google.c.a.c_id",xs=3,js=1;var X;(function(t){t[t.DATA_MESSAGE=1]="DATA_MESSAGE",t[t.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(X||(X={}));/**
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
 */var Q;(function(t){t.PUSH_RECEIVED="push-received",t.NOTIFICATION_CLICKED="notification-clicked"})(Q||(Q={}));/**
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
 */function E(t){const e=new Uint8Array(t);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function $s(t){const e="=".repeat((4-t.length%4)%4),n=(t+e).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(n),s=new Uint8Array(r.length);for(let a=0;a<r.length;++a)s[a]=r.charCodeAt(a);return s}/**
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
 */const pe="fcm_token_details_db",Fs=5,tt="fcm_token_object_Store";async function Us(t){if("databases"in indexedDB&&!(await indexedDB.databases()).map(a=>a.name).includes(pe))return null;let e=null;return(await ne(pe,Fs,{upgrade:async(r,s,a,o)=>{var i;if(s<2||!r.objectStoreNames.contains(tt))return;const c=o.objectStore(tt),l=await c.index("fcmSenderId").get(t);if(await c.clear(),!!l){if(s===2){const u=l;if(!u.auth||!u.p256dh||!u.endpoint)return;e={token:u.fcmToken,createTime:(i=u.createTime)!==null&&i!==void 0?i:Date.now(),subscriptionOptions:{auth:u.auth,p256dh:u.p256dh,endpoint:u.endpoint,swScope:u.swScope,vapidKey:typeof u.vapidKey=="string"?u.vapidKey:E(u.vapidKey)}}}else if(s===3){const u=l;e={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:E(u.auth),p256dh:E(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:E(u.vapidKey)}}}else if(s===4){const u=l;e={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:E(u.auth),p256dh:E(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:E(u.vapidKey)}}}}}})).close(),await le(pe),await le("fcm_vapid_details_db"),await le("undefined"),Hs(e)?e:null}function Hs(t){if(!t||!t.subscriptionOptions)return!1;const{subscriptionOptions:e}=t;return typeof t.createTime=="number"&&t.createTime>0&&typeof t.token=="string"&&t.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
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
 */const Ks="firebase-messaging-database",Vs=1,B="firebase-messaging-store";let ge=null;function Oe(){return ge||(ge=ne(Ks,Vs,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(B)}}})),ge}async function Ne(t){const e=Me(t),r=await(await Oe()).transaction(B).objectStore(B).get(e);if(r)return r;{const s=await Us(t.appConfig.senderId);if(s)return await Pe(t,s),s}}async function Pe(t,e){const n=Me(t),s=(await Oe()).transaction(B,"readwrite");return await s.objectStore(B).put(e,n),await s.done,e}async function Ws(t){const e=Me(t),r=(await Oe()).transaction(B,"readwrite");await r.objectStore(B).delete(e),await r.done}function Me({appConfig:t}){return t.appId}/**
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
 */const qs={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},w=new te("messaging","Messaging",qs);/**
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
 */async function zs(t,e){const n=await Be(t),r=Wt(e),s={method:"POST",headers:n,body:JSON.stringify(r)};let a;try{a=await(await fetch(Le(t.appConfig),s)).json()}catch(o){throw w.create("token-subscribe-failed",{errorInfo:o==null?void 0:o.toString()})}if(a.error){const o=a.error.message;throw w.create("token-subscribe-failed",{errorInfo:o})}if(!a.token)throw w.create("token-subscribe-no-token");return a.token}async function Gs(t,e){const n=await Be(t),r=Wt(e.subscriptionOptions),s={method:"PATCH",headers:n,body:JSON.stringify(r)};let a;try{a=await(await fetch("".concat(Le(t.appConfig),"/").concat(e.token),s)).json()}catch(o){throw w.create("token-update-failed",{errorInfo:o==null?void 0:o.toString()})}if(a.error){const o=a.error.message;throw w.create("token-update-failed",{errorInfo:o})}if(!a.token)throw w.create("token-update-no-token");return a.token}async function Vt(t,e){const r={method:"DELETE",headers:await Be(t)};try{const a=await(await fetch("".concat(Le(t.appConfig),"/").concat(e),r)).json();if(a.error){const o=a.error.message;throw w.create("token-unsubscribe-failed",{errorInfo:o})}}catch(s){throw w.create("token-unsubscribe-failed",{errorInfo:s==null?void 0:s.toString()})}}function Le({projectId:t}){return"".concat(Ls,"/projects/").concat(t,"/registrations")}async function Be({appConfig:t,installations:e}){const n=await e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t.apiKey,"x-goog-firebase-installations-auth":"FIS ".concat(n)})}function Wt({p256dh:t,auth:e,endpoint:n,vapidKey:r}){const s={web:{endpoint:n,auth:e,p256dh:t}};return r!==Ht&&(s.web.applicationPubKey=r),s}/**
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
 */const Ys=7*24*60*60*1e3;async function Js(t){const e=await Qs(t.swRegistration,t.vapidKey),n={vapidKey:t.vapidKey,swScope:t.swRegistration.scope,endpoint:e.endpoint,auth:E(e.getKey("auth")),p256dh:E(e.getKey("p256dh"))},r=await Ne(t.firebaseDependencies);if(r){if(Zs(r.subscriptionOptions,n))return Date.now()>=r.createTime+Ys?Xs(t,{token:r.token,createTime:Date.now(),subscriptionOptions:n}):r.token;try{await Vt(t.firebaseDependencies,r.token)}catch(s){console.warn(s)}return rt(t.firebaseDependencies,n)}else return rt(t.firebaseDependencies,n)}async function nt(t){const e=await Ne(t.firebaseDependencies);e&&(await Vt(t.firebaseDependencies,e.token),await Ws(t.firebaseDependencies));const n=await t.swRegistration.pushManager.getSubscription();return n?n.unsubscribe():!0}async function Xs(t,e){try{const n=await Gs(t.firebaseDependencies,e),r=Object.assign(Object.assign({},e),{token:n,createTime:Date.now()});return await Pe(t.firebaseDependencies,r),n}catch(n){throw n}}async function rt(t,e){const r={token:await zs(t,e),createTime:Date.now(),subscriptionOptions:e};return await Pe(t,r),r.token}async function Qs(t,e){const n=await t.pushManager.getSubscription();return n||t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:$s(e)})}function Zs(t,e){const n=e.vapidKey===t.vapidKey,r=e.endpoint===t.endpoint,s=e.auth===t.auth,a=e.p256dh===t.p256dh;return n&&r&&s&&a}/**
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
 */function ea(t){const e={from:t.from,collapseKey:t.collapse_key,messageId:t.fcmMessageId};return ta(e,t),na(e,t),ra(e,t),e}function ta(t,e){if(!e.notification)return;t.notification={};const n=e.notification.title;n&&(t.notification.title=n);const r=e.notification.body;r&&(t.notification.body=r);const s=e.notification.image;s&&(t.notification.image=s);const a=e.notification.icon;a&&(t.notification.icon=a)}function na(t,e){e.data&&(t.data=e.data)}function ra(t,e){var n,r,s,a,o;if(!e.fcmOptions&&!(!((n=e.notification)===null||n===void 0)&&n.click_action))return;t.fcmOptions={};const i=(s=(r=e.fcmOptions)===null||r===void 0?void 0:r.link)!==null&&s!==void 0?s:(a=e.notification)===null||a===void 0?void 0:a.click_action;i&&(t.fcmOptions.link=i);const c=(o=e.fcmOptions)===null||o===void 0?void 0:o.analytics_label;c&&(t.fcmOptions.analyticsLabel=c)}/**
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
 */function sa(t){return typeof t=="object"&&!!t&&Bs in t}/**
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
 */function aa(t){return new Promise(e=>{setTimeout(e,t)})}async function oa(t,e){const n=ia(e,await t.firebaseDependencies.installations.getId());ca(t,n,e.productId)}function ia(t,e){var n,r;const s={};return t.from&&(s.project_number=t.from),t.fcmMessageId&&(s.message_id=t.fcmMessageId),s.instance_id=e,t.notification?s.message_type=X.DISPLAY_NOTIFICATION.toString():s.message_type=X.DATA_MESSAGE.toString(),s.sdk_platform=xs.toString(),s.package_name=self.origin.replace(/(^\w+:|^)\/\//,""),t.collapse_key&&(s.collapse_key=t.collapse_key),s.event=js.toString(),!((n=t.fcmOptions)===null||n===void 0)&&n.analytics_label&&(s.analytics_label=(r=t.fcmOptions)===null||r===void 0?void 0:r.analytics_label),s}function ca(t,e,n){const r={};r.event_time_ms=Math.floor(Date.now()).toString(),r.source_extension_json_proto3=JSON.stringify({messaging_client_event:e}),n&&(r.compliance_data=la(n)),t.logEvents.push(r)}function la(t){return{privacy_context:{prequest:{origin_associated_product_id:t}}}}/**
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
 */async function ua(t,e){var n,r;const{newSubscription:s}=t;if(!s){await nt(e);return}const a=await Ne(e.firebaseDependencies);await nt(e),e.vapidKey=(r=(n=a==null?void 0:a.subscriptionOptions)===null||n===void 0?void 0:n.vapidKey)!==null&&r!==void 0?r:Ht,await Js(e)}async function ha(t,e){const n=pa(t);if(!n)return;e.deliveryMetricsExportedToBigQueryEnabled&&await oa(e,n);const r=await qt();if(ma(r))return ba(r,n);if(n.notification&&await wa(fa(n)),!!e&&e.onBackgroundMessageHandler){const s=ea(n);typeof e.onBackgroundMessageHandler=="function"?await e.onBackgroundMessageHandler(s):e.onBackgroundMessageHandler.next(s)}}async function da(t){var e,n;const r=(n=(e=t.notification)===null||e===void 0?void 0:e.data)===null||n===void 0?void 0:n[Kt];if(r){if(t.action)return}else return;t.stopImmediatePropagation(),t.notification.close();const s=ya(r);if(!s)return;const a=new URL(s,self.location.href),o=new URL(self.location.origin);if(a.host!==o.host)return;let i=await ga(a);if(i?i=await i.focus():(i=await self.clients.openWindow(s),await aa(3e3)),!!i)return r.messageType=Q.NOTIFICATION_CLICKED,r.isFirebaseMessaging=!0,i.postMessage(r)}function fa(t){const e=Object.assign({},t.notification);return e.data={[Kt]:t},e}function pa({data:t}){if(!t)return null;try{return t.json()}catch(e){return null}}async function ga(t){const e=await qt();for(const n of e){const r=new URL(n.url,self.location.href);if(t.host===r.host)return n}return null}function ma(t){return t.some(e=>e.visibilityState==="visible"&&!e.url.startsWith("chrome-extension://"))}function ba(t,e){e.isFirebaseMessaging=!0,e.messageType=Q.PUSH_RECEIVED;for(const n of t)n.postMessage(e)}function qt(){return self.clients.matchAll({type:"window",includeUncontrolled:!0})}function wa(t){var e;const{actions:n}=t,{maxActions:r}=Notification;return n&&r&&n.length>r&&console.warn("This browser only supports ".concat(r," actions. The remaining actions will not be displayed.")),self.registration.showNotification((e=t.title)!==null&&e!==void 0?e:"",t)}function ya(t){var e,n,r;const s=(n=(e=t.fcmOptions)===null||e===void 0?void 0:e.link)!==null&&n!==void 0?n:(r=t.notification)===null||r===void 0?void 0:r.click_action;return s||(sa(t.data)?self.location.origin:null)}/**
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
 */function _a(t){if(!t||!t.options)throw me("App Configuration Object");if(!t.name)throw me("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:n}=t;for(const r of e)if(!n[r])throw me(r);return{appName:t.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function me(t){return w.create("missing-app-config-values",{valueName:t})}/**
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
 */class Sa{constructor(e,n,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const s=_a(e);this.firebaseDependencies={app:e,appConfig:s,installations:n,analyticsProvider:r}}_delete(){return Promise.resolve()}}/**
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
 */const Ea=t=>{const e=new Sa(t.getProvider("app").getImmediate(),t.getProvider("installations-internal").getImmediate(),t.getProvider("analytics-internal"));return self.addEventListener("push",n=>{n.waitUntil(ha(n,e))}),self.addEventListener("pushsubscriptionchange",n=>{n.waitUntil(ua(n,e))}),self.addEventListener("notificationclick",n=>{n.waitUntil(da(n))}),e};function Ia(){U(new P("messaging-sw",Ea,"PUBLIC"))}/**
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
 */async function Aa(){return mt()&&await bt()&&"PushManager"in self&&"Notification"in self&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
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
 */function Ca(t,e){if(self.document!==void 0)throw w.create("only-available-in-sw");return t.onBackgroundMessageHandler=e,()=>{t.onBackgroundMessageHandler=null}}/**
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
 */function va(t=xr()){return Aa().then(e=>{if(!e)throw w.create("unsupported-browser")},e=>{throw w.create("indexed-db-unsupported")}),ve(wt(t),"messaging-sw").getImmediate()}function Ta(t,e){return t=wt(t),Ca(t,e)}/**
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
 */Ia();const Da="my-admin-local",st=11,p={CF_SALARY_DISTRIBUTION:"cashflow_salary_distribution",CF_MY_PROJECTS:"cashflow_my_projects",CF_ASSETS:"cashflow_assets",CF_ACCOUNTS_MASTER:"cashflow_accounts_master",TAXI_VEHICLES:"taxi_vehicles",FINANCE_GRID_TRADES:"finance_grid_trades",FINANCE_CALC_LIST:"finance_calc_list",FINANCE_LOANS:"finance_loans",MISC_TASKS:"misc_tasks",DOMOTICA_SOLAR_CALC:"domotica_solar_calc",APP_METADATA:"app_metadata"};let D=null,R=null;function k(t,e,n,r,s,a){if(t.objectStoreNames.contains(r)){t.objectStoreNames.contains(n)&&t.deleteObjectStore(n);return}const o=t.createObjectStore(r,s);t.objectStoreNames.contains(n)&&(e.objectStore(n).openCursor().onsuccess=i=>{const c=i.target.result;if(!c){t.deleteObjectStore(n);return}a?o.put(c.value,c.key):o.put(c.value),c.continue()})}function x(){return D?Promise.resolve(D):R||(R=new Promise((t,e)=>{const n=indexedDB.open(Da,st);n.onupgradeneeded=r=>{const s=r.target.result,a=r.target.transaction;k(s,a,"salary-distribution",p.CF_SALARY_DISTRIBUTION,void 0,!0),k(s,a,"my-projects",p.CF_MY_PROJECTS,{keyPath:"id"},!1),k(s,a,"assets",p.CF_ASSETS,{keyPath:"id"},!1),k(s,a,"accounts-master",p.CF_ACCOUNTS_MASTER,{keyPath:"id"},!1),k(s,a,"metadata",p.APP_METADATA,void 0,!0),k(s,a,"taxi-vehicles",p.TAXI_VEHICLES,{keyPath:"id"},!1),k(s,a,"tasks",p.MISC_TASKS,{keyPath:"id"},!1),s.objectStoreNames.contains(p.FINANCE_GRID_TRADES)||s.createObjectStore(p.FINANCE_GRID_TRADES,{keyPath:"id"}),s.objectStoreNames.contains(p.FINANCE_CALC_LIST)||s.createObjectStore(p.FINANCE_CALC_LIST,{keyPath:"id"}),s.objectStoreNames.contains(p.FINANCE_LOANS)||s.createObjectStore(p.FINANCE_LOANS,{keyPath:"id"}),s.objectStoreNames.contains(p.DOMOTICA_SOLAR_CALC)||s.createObjectStore(p.DOMOTICA_SOLAR_CALC,{keyPath:"id"})},n.onsuccess=r=>{D=r.target.result,R=null,D.onversionchange=()=>{D.close(),D=null},t(D)},n.onerror=r=>{R=null,e(r.target.error)},n.onblocked=()=>{const r="idb-reload-v".concat(st);sessionStorage.getItem(r)?(R=null,e(new Error("IDB upgrade blocked. Cierra otras pestañas de la app y recarga."))):(sessionStorage.setItem(r,"1"),window.location.reload())}}),R)}const S=p,at=p.CF_ACCOUNTS_MASTER;async function Ra(){const t=await x();return new Promise((e,n)=>{const s=t.transaction(at,"readonly").objectStore(at).getAll();s.onsuccess=a=>{var o;return e((o=a.target.result)!=null?o:[])},s.onerror=a=>n(a.target.error)})}const Z=p.TAXI_VEHICLES;async function ka(t){const n=(await x()).transaction(Z,"readwrite"),r=n.objectStore(Z);r.clear();for(const s of t)r.put(s);return new Promise((s,a)=>{n.oncomplete=s,n.onerror=()=>a(n.error)})}async function Oa(){const t=await x();return new Promise((e,n)=>{const s=t.transaction(Z,"readonly").objectStore(Z).getAll();s.onsuccess=()=>{var a;return e((a=s.result)!=null?a:[])},s.onerror=()=>n(s.error)})}const ot=p.APP_METADATA,Na="pico-placa-notify-hours",be=[8,12,17];async function Pa(){try{const t=await x();return await new Promise(e=>{const r=t.transaction(ot,"readonly").objectStore(ot).get(Na);r.onsuccess=()=>e(Array.isArray(r.result)?r.result:be),r.onerror=()=>e(be)})}catch(t){return be}}const Ma=["Hoy","Mañana","En 2 días","En 3 días","En 4 días"];async function La(){try{const t=new Date,e=t.getHours();if(!(await Pa()).includes(e))return;const r=t.toISOString().split("T")[0],s="pico-placa-".concat(r,"-").concat(e),a=await x();if(await new Promise(g=>{const y=a.transaction(S.APP_METADATA,"readonly").objectStore(S.APP_METADATA).get(s);y.onsuccess=()=>g(!!y.result),y.onerror=()=>g(!1)}))return;let i=await Oa();if(i.length||(i=await xa(),i.length&&await ka(i)),!i.length)return;const c=[];for(let g=0;g<=4;g++){const b=new Date(t);b.setDate(b.getDate()+g);const y=i.filter(j=>Ba(j.restrictions,b.getMonth()+1,b.getDate())).map(j=>j.plate);g===0?c.push(y.length?"Hoy: ".concat(y.join(", ")):"Hoy: sin pico y placa"):y.length&&c.push("".concat(Ma[g],": ").concat(y.join(", ")))}const l="Pico y Placa",u=c.join(" | ");await(typeof self.registration<"u"?self.registration:await navigator.serviceWorker.ready).showNotification(l,{body:u,icon:"/icons/icon.svg",tag:"pico-y-placa",badge:"/icons/icon.svg"});const f=a.transaction(S.APP_METADATA,"readwrite");f.objectStore(S.APP_METADATA).put(!0,s),await new Promise((g,b)=>{f.oncomplete=g,f.onerror=()=>b(f.error)})}catch(t){console.error("Error in pico-y-placa check:",t)}}function Ba(t,e,n){if(!t)return!1;const r=t[String(e)];if(!r)return!1;const s=Number(r.d1)||0,a=Number(r.d2)||0;return s!==0&&s===n||a!==0&&a===n}async function xa(){var t;try{const r="https://firestore.googleapis.com/v1/projects/".concat("cashflow-9cbbc","/databases/(default)/documents/CashFlow_taxi_vehiculos?key=").concat("AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g"),s=await fetch(r);return s.ok?((t=(await s.json()).documents)!=null?t:[]).map(ja).filter(o=>o.plate):[]}catch(e){return[]}}function ja(t){var a,o,i,c,l,u,d,f,g,b,y,j,xe,je,$e,Fe;const e=(a=t.fields)!=null?a:{},n=t.name.split("/").pop(),r=(c=(i=(o=e.restrictions)==null?void 0:o.mapValue)==null?void 0:i.fields)!=null?c:{},s={};for(const[zt,Gt]of Object.entries(r)){const q=(u=(l=Gt.mapValue)==null?void 0:l.fields)!=null?u:{};s[zt]={d1:Number((b=(g=(d=q.d1)==null?void 0:d.integerValue)!=null?g:(f=q.d1)==null?void 0:f.doubleValue)!=null?b:0),d2:Number((je=(xe=(y=q.d2)==null?void 0:y.integerValue)!=null?xe:(j=q.d2)==null?void 0:j.doubleValue)!=null?je:0)}}return{id:n,plate:(Fe=($e=e.plate)==null?void 0:$e.stringValue)!=null?Fe:"",restrictions:s}}self.addEventListener("activate",t=>{t.waitUntil(self.clients.claim())});self.addEventListener("fetch",t=>{new URL(t.request.url).pathname!=="/share-target"||t.request.method!=="POST"||t.respondWith((async()=>{try{const r=(await t.request.formData()).get("file");if(r&&r instanceof File){const s=await r.arrayBuffer(),a=await x();await new Promise((o,i)=>{const c=a.transaction(S.APP_METADATA,"readwrite");c.objectStore(S.APP_METADATA).put({buffer:s,type:r.type,name:r.name},"pending-share"),c.oncomplete=o,c.onerror=()=>i(c.error)})}}catch(n){console.error("[SW] share-target error:",n)}return Response.redirect("/finance/management/account-status?share=".concat(Date.now()),303)})())});In([{"revision":"c6f3e2a98fcef6c3d4c0c1533ea1f3f4","url":"offline.html"},{"revision":"226f22b4a73ef3c385ba20b48ba13b1f","url":"index.html"},{"revision":"5b08b3f17508d9fe42f47af44a6c43a7","url":"favicon.ico"},{"revision":"3394026d133157e5039a62aefd1165a8","url":"404.html"},{"revision":"25646df2740513abb67bbb95c3c474de","url":"vendor/dx.material.blue.light.css"},{"revision":"2ca4711890cc60e49b7d31da309d9494","url":"vendor/ar-js-ui.css"},{"revision":"013cfeac59f632fe60c8b14e66d7ff2a","url":"vendor/ar-js-designer.css"},{"revision":"cf249e2748cfd5df29895a053146b5c3","url":"vendor/icons/dxiconsmaterial.woff2"},{"revision":"89726e9815ac597d2cf682798f135710","url":"vendor/icons/dxiconsmaterial.woff"},{"revision":"ff1692082f366d6076a6d19f8edc8c00","url":"vendor/icons/dxiconsfluent.woff2"},{"revision":"2ceba156178a078faeb79d942f1dba53","url":"vendor/icons/dxiconsfluent.woff"},{"revision":"75770ce3154a83deb87fd29fc2244bc9","url":"vendor/icons/dxicons.woff2"},{"revision":"6ab9cee21c9a076178a88c1bb60b541d","url":"vendor/icons/dxicons.woff"},{"revision":"b4639486fd4ede917de4e099a40605d8","url":"icons/icon.svg"},{"revision":null,"url":"assets/workbox-window.prod.es5-legacy-BMyJTwtC.js"},{"revision":null,"url":"assets/workbox-window.prod.es5-RNCgxoJe.js"},{"revision":null,"url":"assets/websocketService-legacy-efJ0pyEe.js"},{"revision":null,"url":"assets/websocketService-DYsVRTjt.js"},{"revision":null,"url":"assets/vendor-pdfjs-legacy-DtNXiqXJ.js"},{"revision":null,"url":"assets/vendor-pdfjs-B0ZCgLYt.js"},{"revision":null,"url":"assets/vendor-firebase-legacy-syBJKgDF.js"},{"revision":null,"url":"assets/vendor-firebase-TeyIuh6V.js"},{"revision":null,"url":"assets/useLocaleData-mOQsssvG.js"},{"revision":null,"url":"assets/useLocaleData-legacy-CCMzcdrG.js"},{"revision":null,"url":"assets/useIsMobile-legacy-Co8Yz-aH.js"},{"revision":null,"url":"assets/useIsMobile-BD7gtvVh.js"},{"revision":null,"url":"assets/useCryptoPrices-legacy-B6_I7FEV.js"},{"revision":null,"url":"assets/useCryptoPrices-Ccm1F0HG.js"},{"revision":null,"url":"assets/typeof-legacy-CF8Q5s-V.js"},{"revision":null,"url":"assets/typeof-QjJsDpFa.js"},{"revision":null,"url":"assets/tradeUtils-legacy-Bdxm1eq4.js"},{"revision":null,"url":"assets/tradeUtils-CJhSIbxR.js"},{"revision":null,"url":"assets/taxi-legacy-BIfCZ1CJ.js"},{"revision":null,"url":"assets/taxi-CV4aCWjf.js"},{"revision":null,"url":"assets/skypatrolCommands-xAJhfgmi.js"},{"revision":null,"url":"assets/skypatrolCommands-legacy-D59IbE8P.js"},{"revision":null,"url":"assets/reselect-legacy-R18s4UXN.js"},{"revision":null,"url":"assets/reselect-D9L2APdZ.js"},{"revision":null,"url":"assets/raspberrypi-Cq0hdVK6.svg"},{"revision":null,"url":"assets/purify.es-legacy-Cej7vNHU.js"},{"revision":null,"url":"assets/purify.es-B_7ar3hJ.js"},{"revision":null,"url":"assets/polyfills-legacy-DffucyFL.js"},{"revision":null,"url":"assets/masters-legacy-CRbykDIM.js"},{"revision":null,"url":"assets/masters-B20ZtHuD.css"},{"revision":null,"url":"assets/leaflet-legacy-CZHzKV1E.js"},{"revision":null,"url":"assets/leaflet-CKBlaIOB.css"},{"revision":null,"url":"assets/leaflet-5wXCEmd5.js"},{"revision":null,"url":"assets/jspdf.es.min-legacy-DGDDdflh.js"},{"revision":null,"url":"assets/jspdf.es.min-DL7Qp7lq.js"},{"revision":null,"url":"assets/inmobiliaria-legacy-m7Ab-j2a.js"},{"revision":null,"url":"assets/inmobiliaria-CTfrhT_J.js"},{"revision":null,"url":"assets/index.esm-legacy-DRsOWBgz.js"},{"revision":null,"url":"assets/index.esm-legacy-CMGfBUvt.js"},{"revision":null,"url":"assets/index.esm-legacy-BsxYMLWp.js"},{"revision":null,"url":"assets/index.esm-TyrxgI8J.js"},{"revision":null,"url":"assets/index.esm-DvvML1YS.js"},{"revision":null,"url":"assets/index.esm-C7FtRj8Y.js"},{"revision":null,"url":"assets/index.es-legacy-CcCSqE9u.js"},{"revision":null,"url":"assets/index.es-CFnPjX6m.js"},{"revision":null,"url":"assets/index-xlsTNksK.js"},{"revision":null,"url":"assets/index-xN-mkPfl.js"},{"revision":null,"url":"assets/index-x3ZqVl14.css"},{"revision":null,"url":"assets/index-reWaq8k_.js"},{"revision":null,"url":"assets/index-qe8DejBs.js"},{"revision":null,"url":"assets/index-nz1Cb4Xq.js"},{"revision":null,"url":"assets/index-mc_g_yzO.js"},{"revision":null,"url":"assets/index-legacy-wXJXzJbx.js"},{"revision":null,"url":"assets/index-legacy-qtqVOyqp.js"},{"revision":null,"url":"assets/index-legacy-jvdC1dsN.js"},{"revision":null,"url":"assets/index-legacy-dqYOxSoi.js"},{"revision":null,"url":"assets/index-legacy-Vy3syFoM.js"},{"revision":null,"url":"assets/index-legacy-T5lB_0qW.js"},{"revision":null,"url":"assets/index-legacy-N519sZVG.js"},{"revision":null,"url":"assets/index-legacy-EhhKirMu.js"},{"revision":null,"url":"assets/index-legacy-Ee5HifKG.js"},{"revision":null,"url":"assets/index-legacy-DusC2HbJ.js"},{"revision":null,"url":"assets/index-legacy-DowQy5je.js"},{"revision":null,"url":"assets/index-legacy-DnHdpzZm.js"},{"revision":null,"url":"assets/index-legacy-DWnTOSwR.js"},{"revision":null,"url":"assets/index-legacy-DSxVQuh6.js"},{"revision":null,"url":"assets/index-legacy-DPumnR-t.js"},{"revision":null,"url":"assets/index-legacy-DP-KA0OU.js"},{"revision":null,"url":"assets/index-legacy-DFo4_a0t.js"},{"revision":null,"url":"assets/index-legacy-DE1eqsXj.js"},{"revision":null,"url":"assets/index-legacy-D5Ajpolq.js"},{"revision":null,"url":"assets/index-legacy-CxxzgP8m.js"},{"revision":null,"url":"assets/index-legacy-Cn0UcKUR.js"},{"revision":null,"url":"assets/index-legacy-ClW5FHA6.js"},{"revision":null,"url":"assets/index-legacy-CkfMqv_F.js"},{"revision":null,"url":"assets/index-legacy-CiXMed7B.js"},{"revision":null,"url":"assets/index-legacy-Cg7fP-U4.js"},{"revision":null,"url":"assets/index-legacy-COIUU74j.js"},{"revision":null,"url":"assets/index-legacy-CJbNem_r.js"},{"revision":null,"url":"assets/index-legacy-CGNbFm7E.js"},{"revision":null,"url":"assets/index-legacy-CFxHCD_3.js"},{"revision":null,"url":"assets/index-legacy-CAMXL2RD.js"},{"revision":null,"url":"assets/index-legacy-C8W3tOlJ.js"},{"revision":null,"url":"assets/index-legacy-C1hCGtLT.js"},{"revision":null,"url":"assets/index-legacy-Buq-b5Kp.js"},{"revision":null,"url":"assets/index-legacy-BuXqUNRI.js"},{"revision":null,"url":"assets/index-legacy-BmJokr3Z.js"},{"revision":null,"url":"assets/index-legacy-Bk1LDpby.js"},{"revision":null,"url":"assets/index-legacy-BiwDfuD-.js"},{"revision":null,"url":"assets/index-legacy-Ba6hTNY-.js"},{"revision":null,"url":"assets/index-legacy-BZ33fcJu.js"},{"revision":null,"url":"assets/index-legacy-BOhjUUYb.js"},{"revision":null,"url":"assets/index-legacy-BNy4arrX.js"},{"revision":null,"url":"assets/index-legacy-BNOnnfnj.js"},{"revision":null,"url":"assets/index-legacy-BMi_LEM1.js"},{"revision":null,"url":"assets/index-legacy-BLDhYgTw.js"},{"revision":null,"url":"assets/index-legacy-BJGhy8YP.js"},{"revision":null,"url":"assets/index-legacy-BHZuFzhi.js"},{"revision":null,"url":"assets/index-legacy-BE1osCu0.js"},{"revision":null,"url":"assets/index-legacy-7ltJY_sa.js"},{"revision":null,"url":"assets/index-l3VLKhS3.js"},{"revision":null,"url":"assets/index-jMSN8IJ4.js"},{"revision":null,"url":"assets/index-irJuHkmF.js"},{"revision":null,"url":"assets/index-fcpK6SJO.css"},{"revision":null,"url":"assets/index-fQTHpSkQ.css"},{"revision":null,"url":"assets/index-eM1_ZPIr.js"},{"revision":null,"url":"assets/index-eEIqHTc_.js"},{"revision":null,"url":"assets/index-duxAN51J.js"},{"revision":null,"url":"assets/index-browser-esm-legacy-DJK9SAKR.js"},{"revision":null,"url":"assets/index-browser-esm-Un4MHIRw.js"},{"revision":null,"url":"assets/index-Y-f7PCOM.js"},{"revision":null,"url":"assets/index-Vn3Q8ilQ.css"},{"revision":null,"url":"assets/index-RLi2slKH.css"},{"revision":null,"url":"assets/index-Ocmg88VG.css"},{"revision":null,"url":"assets/index-N5pimF9W.js"},{"revision":null,"url":"assets/index-Lm8D0s0E.css"},{"revision":null,"url":"assets/index-KqsZi-UL.js"},{"revision":null,"url":"assets/index-KqgNzKKt.css"},{"revision":null,"url":"assets/index-HIF1L5Xg.css"},{"revision":null,"url":"assets/index-Dw4Ch-17.js"},{"revision":null,"url":"assets/index-DvsKS1wE.js"},{"revision":null,"url":"assets/index-DuM3HI94.js"},{"revision":null,"url":"assets/index-Ds3w-ZvU.js"},{"revision":null,"url":"assets/index-DqcEOfro.js"},{"revision":null,"url":"assets/index-Do9cgTsG.js"},{"revision":null,"url":"assets/index-DiKUCT2-.js"},{"revision":null,"url":"assets/index-DhGpVE_h.js"},{"revision":null,"url":"assets/index-Dc3pLP64.js"},{"revision":null,"url":"assets/index-Dc1ll2g4.js"},{"revision":null,"url":"assets/index-DPgaO0qd.js"},{"revision":null,"url":"assets/index-DFacP2p5.js"},{"revision":null,"url":"assets/index-DDX3ilEL.css"},{"revision":null,"url":"assets/index-D9gZL_Py.css"},{"revision":null,"url":"assets/index-D9Gud8qt.css"},{"revision":null,"url":"assets/index-Cwv8oGy4.js"},{"revision":null,"url":"assets/index-CvJKp6pu.css"},{"revision":null,"url":"assets/index-Cuu_I2DG.js"},{"revision":null,"url":"assets/index-Copwwzpc.css"},{"revision":null,"url":"assets/index-Cn4G-hvZ.js"},{"revision":null,"url":"assets/index-CmtpPiBZ.js"},{"revision":null,"url":"assets/index-Ci03jkyp.css"},{"revision":null,"url":"assets/index-CgH2Qwz-.css"},{"revision":null,"url":"assets/index-CbyOlulz.js"},{"revision":null,"url":"assets/index-CZvW61t1.css"},{"revision":null,"url":"assets/index-CZjLdb3h.js"},{"revision":null,"url":"assets/index-CTDMc8PD.css"},{"revision":null,"url":"assets/index-CSGzFecC.js"},{"revision":null,"url":"assets/index-CQRh54y2.js"},{"revision":null,"url":"assets/index-CB8zXp3f.css"},{"revision":null,"url":"assets/index-C8V3oVwP.css"},{"revision":null,"url":"assets/index-C2cNibjz.js"},{"revision":null,"url":"assets/index-BwaufAqD.js"},{"revision":null,"url":"assets/index-BncKbx8B.js"},{"revision":null,"url":"assets/index-Bb2PAzYk.js"},{"revision":null,"url":"assets/index-BYMLYPH0.js"},{"revision":null,"url":"assets/index-BXSxSwtp.css"},{"revision":null,"url":"assets/index-BXDMEfMS.js"},{"revision":null,"url":"assets/index-BTIlBIoI.css"},{"revision":null,"url":"assets/index-BSIU9Zns.css"},{"revision":null,"url":"assets/index-BPw72ykS.js"},{"revision":null,"url":"assets/index-BH5hbjnV.js"},{"revision":null,"url":"assets/index-BEtdOWd8.css"},{"revision":null,"url":"assets/index-BCper7To.css"},{"revision":null,"url":"assets/index-BBK2xM6v.css"},{"revision":null,"url":"assets/index-BB1i8Qzm.js"},{"revision":null,"url":"assets/index-BAzrwujB.js"},{"revision":null,"url":"assets/index-BANorbzj.css"},{"revision":null,"url":"assets/index-B4XW2-jc.js"},{"revision":null,"url":"assets/index-B3nSQm_N.css"},{"revision":null,"url":"assets/index-B2RTC_rI.css"},{"revision":null,"url":"assets/index-9s3cERYf.css"},{"revision":null,"url":"assets/index-94LErsfl.css"},{"revision":null,"url":"assets/index-8iTy7pbv.js"},{"revision":null,"url":"assets/index-31W7N8Dx.js"},{"revision":null,"url":"assets/imageFacade-legacy-BRkti0q6.js"},{"revision":null,"url":"assets/imageFacade-Dc0LpGYg.js"},{"revision":null,"url":"assets/html2canvas.esm-legacy-DIGTxsNk.js"},{"revision":null,"url":"assets/html2canvas.esm-BJcB2cAV.js"},{"revision":null,"url":"assets/geoUtils-legacy-BLc5UNCY.js"},{"revision":null,"url":"assets/geoUtils-BAPyyTMf.js"},{"revision":null,"url":"assets/galleries-legacy-DZz-LeyN.js"},{"revision":null,"url":"assets/galleries-CGEI8A7E.js"},{"revision":null,"url":"assets/formatters-legacy-PwijdaEX.js"},{"revision":null,"url":"assets/formatters-ClUZAJ0Y.js"},{"revision":null,"url":"assets/finance-legacy-CR0uC2PV.js"},{"revision":null,"url":"assets/finance-B9Wf8DAt.js"},{"revision":null,"url":"assets/fileHelpers-legacy-JEMePfzY.js"},{"revision":null,"url":"assets/fileHelpers-CCFI9xaO.js"},{"revision":null,"url":"assets/cryptoHelper-legacy-C7tmD7Ap.js"},{"revision":null,"url":"assets/cryptoHelper-BVphwZtQ.js"},{"revision":null,"url":"assets/contractPdf-legacy-BsOzfSm4.js"},{"revision":null,"url":"assets/contractPdf-dMKdNJc6.js"},{"revision":null,"url":"assets/cil-x-legacy-Qr_cwwg3.js"},{"revision":null,"url":"assets/cil-x-CfQSVFP2.js"},{"revision":null,"url":"assets/cil-warning-legacy-CzEvJIux.js"},{"revision":null,"url":"assets/cil-warning-CEGefZLr.js"},{"revision":null,"url":"assets/cil-trash-legacy-C42VUvsZ.js"},{"revision":null,"url":"assets/cil-trash-gHK8YSrs.js"},{"revision":null,"url":"assets/cil-terminal-legacy-CHvaaCeC.js"},{"revision":null,"url":"assets/cil-terminal-Dlxribu1.js"},{"revision":null,"url":"assets/cil-storage-vCxUaE-Z.js"},{"revision":null,"url":"assets/cil-storage-legacy-Cr2YzXY0.js"},{"revision":null,"url":"assets/cil-plus-legacy-QLKf2chB.js"},{"revision":null,"url":"assets/cil-plus-CjZkVDO0.js"},{"revision":null,"url":"assets/cil-people-legacy-CWYhgM2E.js"},{"revision":null,"url":"assets/cil-people-BzpFUCRV.js"},{"revision":null,"url":"assets/cil-pencil-legacy-CP7gv1FJ.js"},{"revision":null,"url":"assets/cil-pencil-c89ONrkF.js"},{"revision":null,"url":"assets/cil-magnifying-glass-legacy-jKzJX5Hz.js"},{"revision":null,"url":"assets/cil-magnifying-glass-Bjd2ULXB.js"},{"revision":null,"url":"assets/cil-list-legacy-BpzB1YWv.js"},{"revision":null,"url":"assets/cil-list-CJ0Z10xx.js"},{"revision":null,"url":"assets/cil-grid-legacy-B-Cde07x.js"},{"revision":null,"url":"assets/cil-grid-DOYbA8pO.js"},{"revision":null,"url":"assets/cil-fullscreen-legacy-DrFAl-eU.js"},{"revision":null,"url":"assets/cil-fullscreen-DRPxGrRq.js"},{"revision":null,"url":"assets/cil-fullscreen-CsRryDwx.css"},{"revision":null,"url":"assets/cil-description-legacy-BBPaynXm.js"},{"revision":null,"url":"assets/cil-description-CAWk7Qv3.js"},{"revision":null,"url":"assets/cil-copy-legacy-B25iN0fH.js"},{"revision":null,"url":"assets/cil-copy-BsaR4wcz.js"},{"revision":null,"url":"assets/cil-chevron-right-legacy-BHIg_UAi.js"},{"revision":null,"url":"assets/cil-chevron-right-Bt1LshHI.js"},{"revision":null,"url":"assets/cil-chevron-bottom-legacy-C4rpVcn5.js"},{"revision":null,"url":"assets/cil-chevron-bottom-BNubmxZH.js"},{"revision":null,"url":"assets/cil-check-circle-legacy-J6-GJGMW.js"},{"revision":null,"url":"assets/cil-check-circle-CHux44rA.js"},{"revision":null,"url":"assets/cil-car-alt-legacy-BX6OujyW.js"},{"revision":null,"url":"assets/cil-car-alt-D6f-5LuT.js"},{"revision":null,"url":"assets/cil-bug-legacy-B_LgX7UU.js"},{"revision":null,"url":"assets/cil-bug-DIlRYuvG.js"},{"revision":null,"url":"assets/cil-bell-legacy-BpFjnS-u.js"},{"revision":null,"url":"assets/cil-bell-CZe3Rh8Q.js"},{"revision":null,"url":"assets/cil-arrow-top-legacy-ClqzXtem.js"},{"revision":null,"url":"assets/cil-arrow-top-DErzQfBQ.js"},{"revision":null,"url":"assets/cil-arrow-left-legacy-RqyR1cLw.js"},{"revision":null,"url":"assets/cil-arrow-left-DrtzzmuU.js"},{"revision":null,"url":"assets/cil-arrow-bottom-legacy-DUy9YACi.js"},{"revision":null,"url":"assets/cil-arrow-bottom-DbQMsyby.js"},{"revision":null,"url":"assets/cashFlow-legacy-DrLIdbKh.js"},{"revision":null,"url":"assets/cashFlow-DGTZDhOY.js"},{"revision":null,"url":"assets/browser-legacy-BY2P-TOi.js"},{"revision":null,"url":"assets/browser-CboWctPp.js"},{"revision":null,"url":"assets/auditHelpers-mQnDDK2F.js"},{"revision":null,"url":"assets/auditHelpers-legacy-B9HCQCja.js"},{"revision":null,"url":"assets/Visits-legacy-oqGPAv9h.js"},{"revision":null,"url":"assets/Visits-DW21iI45.js"},{"revision":null,"url":"assets/Vehicles-legacy-Cemp7m6P.js"},{"revision":null,"url":"assets/Vehicles-4EB1nlvG.js"},{"revision":null,"url":"assets/Users-legacy-BE2lgkkv.js"},{"revision":null,"url":"assets/Users-CEPzKcHq.js"},{"revision":null,"url":"assets/UserEdit-legacy-BBfaVnDF.js"},{"revision":null,"url":"assets/UserEdit-Dw3k-p2g.js"},{"revision":null,"url":"assets/Tenants-legacy-CwFCED7G.js"},{"revision":null,"url":"assets/Tenants-CqTHKc67.js"},{"revision":null,"url":"assets/TaxisLayout-legacy-DuG5RkQk.js"},{"revision":null,"url":"assets/TaxisLayout-NFkJgO0J.css"},{"revision":null,"url":"assets/TaxisLayout-DfrbPZoT.js"},{"revision":null,"url":"assets/TasksPage-legacy-T92ATT0m.js"},{"revision":null,"url":"assets/TasksPage-DqBeh-DO.css"},{"revision":null,"url":"assets/TasksPage-CZ5ooxd2.js"},{"revision":null,"url":"assets/SystemLayout-legacy-D57fT6-m.js"},{"revision":null,"url":"assets/SystemLayout-DbW9BKMN.js"},{"revision":null,"url":"assets/Summary-legacy-DcBPvqNs.js"},{"revision":null,"url":"assets/Summary-Bs2iy_PI.js"},{"revision":null,"url":"assets/SolarPanel-legacy-Ds5Cx7yY.js"},{"revision":null,"url":"assets/SolarPanel-DKX4_Ofe.css"},{"revision":null,"url":"assets/SolarPanel-Bpuw5Gho.js"},{"revision":null,"url":"assets/SolarLocationModal-legacy-G-T4RkNU.js"},{"revision":null,"url":"assets/SolarLocationModal-DY0Bpleg.css"},{"revision":null,"url":"assets/SolarLocationModal-D-TkxLaS.js"},{"revision":null,"url":"assets/SolarCalculatorLocal-legacy-4pR3YCkz.js"},{"revision":null,"url":"assets/SolarCalculatorLocal-B2IbfILl.js"},{"revision":null,"url":"assets/SolarCalculator-legacy-DXu9mAlx.js"},{"revision":null,"url":"assets/SolarCalculator-Dq-Ol8h-.js"},{"revision":null,"url":"assets/SolarCalculator-BUprDQGm.css"},{"revision":null,"url":"assets/SerialConsole-zNm_m-g-.js"},{"revision":null,"url":"assets/SerialConsole-legacy-Ba_XbsVM.js"},{"revision":null,"url":"assets/SerialConsole-d3OtkgDm.css"},{"revision":null,"url":"assets/SelectApp-legacy-BGSvAMiQ.js"},{"revision":null,"url":"assets/SelectApp-CjiOmEx2.js"},{"revision":null,"url":"assets/SelectApp-B8ySWQ6M.css"},{"revision":null,"url":"assets/SalaryDistribution-legacy-CCJW5UPe.js"},{"revision":null,"url":"assets/SalaryDistribution-Fifwedp4.js"},{"revision":null,"url":"assets/Register-legacy-Cxr36g9E.js"},{"revision":null,"url":"assets/Register-CsUpoxeY.js"},{"revision":null,"url":"assets/PushSubscribers-legacy-mz_R2sMA.js"},{"revision":null,"url":"assets/PushSubscribers-DVKDRoLj.js"},{"revision":null,"url":"assets/Profile-legacy-DD0q2Yiv.js"},{"revision":null,"url":"assets/Profile-Bb88fxlQ.js"},{"revision":null,"url":"assets/Profile--CFRU_BO.css"},{"revision":null,"url":"assets/PerfLogsPage-legacy-BJTJd4YF.js"},{"revision":null,"url":"assets/PerfLogsPage-BnsTpK4q.js"},{"revision":null,"url":"assets/Payments-legacy-Ck4WbbpC.js"},{"revision":null,"url":"assets/Payments-legacy-C3LRVqdz.js"},{"revision":null,"url":"assets/Payments-CmLfzskm.css"},{"revision":null,"url":"assets/Payments-CAahCLDk.js"},{"revision":null,"url":"assets/Payments-BP6kndtq.css"},{"revision":null,"url":"assets/Partners-legacy-CVK9uz3a.js"},{"revision":null,"url":"assets/Partners-B7MLl7Jj.js"},{"revision":null,"url":"assets/Page500-legacy-NYszpOXM.js"},{"revision":null,"url":"assets/Page500-DG-pxBL8.js"},{"revision":null,"url":"assets/Page404-legacy-B022kMMI.js"},{"revision":null,"url":"assets/Page404-Cb_P2sa7.js"},{"revision":null,"url":"assets/Operations-legacy-CR-Ie2Fz.js"},{"revision":null,"url":"assets/Operations-kjQ_lhyA.js"},{"revision":null,"url":"assets/Operations-DQxxKrSq.css"},{"revision":null,"url":"assets/NoteFullPage-legacy-8WGLIUHx.js"},{"revision":null,"url":"assets/NoteFullPage-di7RzpXW.css"},{"revision":null,"url":"assets/NoteFullPage-B8dyuU5B.js"},{"revision":null,"url":"assets/MiscelaneaLayout-legacy-F11jzJbQ.js"},{"revision":null,"url":"assets/MiscelaneaLayout-UI3rQcc5.js"},{"revision":null,"url":"assets/LoginSuper-legacy-BPRAVAs0.js"},{"revision":null,"url":"assets/LoginSuper-CX7pthri.js"},{"revision":null,"url":"assets/Login-legacy-pCftRjqa.js"},{"revision":null,"url":"assets/Login-legacy-CGc71PlZ.js"},{"revision":null,"url":"assets/Login-DEeaVLWi.css"},{"revision":null,"url":"assets/Login-CxGmu700.css"},{"revision":null,"url":"assets/Login-Cs7G_sUO.js"},{"revision":null,"url":"assets/InlinePaymentMethod-legacy-BskqZMSy.js"},{"revision":null,"url":"assets/InlinePaymentMethod-BTdfveRJ.js"},{"revision":null,"url":"assets/Index-legacy-DxPOFjSr.js"},{"revision":null,"url":"assets/Index-legacy-Br58CGxr.js"},{"revision":null,"url":"assets/Index-legacy-BWNJW22M.js"},{"revision":null,"url":"assets/Index-legacy-8v2_7W50.js"},{"revision":null,"url":"assets/Index-Ih7T1Dkn.css"},{"revision":null,"url":"assets/Index-DuVByE_Q.js"},{"revision":null,"url":"assets/Index-DRCQnd5D.css"},{"revision":null,"url":"assets/Index-DIshBAYo.css"},{"revision":null,"url":"assets/Index-DGGnDJYc.js"},{"revision":null,"url":"assets/Index-D-c80uEX.css"},{"revision":null,"url":"assets/Index-BCV3yrAj.js"},{"revision":null,"url":"assets/Index-3RZryD5J.js"},{"revision":null,"url":"assets/IncreaseDecrease-s5kDzmU_.js"},{"revision":null,"url":"assets/IncreaseDecrease-legacy-Di3MKwDU.js"},{"revision":null,"url":"assets/Home-legacy-DCJccZNR.js"},{"revision":null,"url":"assets/Home-legacy-C9HN32zv.js"},{"revision":null,"url":"assets/Home-XpGQ_7yQ.css"},{"revision":null,"url":"assets/Home-Js0D8O7-.js"},{"revision":null,"url":"assets/Home-BS-ghm-q.js"},{"revision":null,"url":"assets/HardRefresh-legacy-DCkAOI8z.js"},{"revision":null,"url":"assets/HardRefresh-B00oSlGh.js"},{"revision":null,"url":"assets/FinanceLayout-legacy-CdwrsboF.js"},{"revision":null,"url":"assets/FinanceLayout-DAZjvx2g.js"},{"revision":null,"url":"assets/Expenses-legacy-Dl-69M70.js"},{"revision":null,"url":"assets/Expenses-CETiOUCX.js"},{"revision":null,"url":"assets/ErrorLogsPage-legacy-D_phMdux.js"},{"revision":null,"url":"assets/ErrorLogsPage-DUi7-TH-.css"},{"revision":null,"url":"assets/ErrorLogsPage-BPEcHQyX.js"},{"revision":null,"url":"assets/EmptyLayout-legacy-D6Z0te6a.js"},{"revision":null,"url":"assets/EmptyLayout-D8PF_vwk.js"},{"revision":null,"url":"assets/Eggs-legacy-CkDGvBYT.js"},{"revision":null,"url":"assets/Eggs-ZCMjtfbb.js"},{"revision":null,"url":"assets/Drivers-legacy-9WTVPVui.js"},{"revision":null,"url":"assets/Drivers-QdNf4VbA.js"},{"revision":null,"url":"assets/DriverEditor-legacy-Cu4XNL8w.js"},{"revision":null,"url":"assets/DriverEditor-C_4VOVAW.js"},{"revision":null,"url":"assets/DriverDocuments-legacy-DQhtwklL.js"},{"revision":null,"url":"assets/DriverDocuments-CaxfL7NP.js"},{"revision":null,"url":"assets/DomoticaLayout-legacy-CXnbkW8V.js"},{"revision":null,"url":"assets/DomoticaLayout-DK06WMyD.js"},{"revision":null,"url":"assets/DocsExample-legacy-C9ZR8Z5Q.js"},{"revision":null,"url":"assets/DocsExample-C2_OZq34.css"},{"revision":null,"url":"assets/DocsExample-BiSEohdQ.js"},{"revision":null,"url":"assets/Distributions-legacy-UfvUO1nL.js"},{"revision":null,"url":"assets/Distributions-IseQOIR1.js"},{"revision":null,"url":"assets/Devices-legacy-D7uLoAHK.js"},{"revision":null,"url":"assets/Devices-BnDFC5s2.css"},{"revision":null,"url":"assets/Devices-BifcUT6P.js"},{"revision":null,"url":"assets/Designs-legacy-Didx6kQi.js"},{"revision":null,"url":"assets/Designs-Dd1_2Mfq.css"},{"revision":null,"url":"assets/DeclaracionRenta-legacy-BiBWtRsN.js"},{"revision":null,"url":"assets/DeclaracionRenta-BvFbv7k7.js"},{"revision":null,"url":"assets/DeclaracionRenta-Bu-ZGZbV.css"},{"revision":null,"url":"assets/Dashboard-legacy-DzDPQt40.js"},{"revision":null,"url":"assets/Dashboard-iUr00sfA.css"},{"revision":null,"url":"assets/Dashboard-CxrUU35c.js"},{"revision":null,"url":"assets/ContactMessages-legacy-D8SGDNsR.js"},{"revision":null,"url":"assets/ContactMessages-CrLGv7IB.js"},{"revision":null,"url":"assets/CommandDictionary-legacy-CjKw5fLU.js"},{"revision":null,"url":"assets/CommandDictionary-Dw_5RGPH.css"},{"revision":null,"url":"assets/CommandDictionary-D-9hyluq.js"},{"revision":null,"url":"assets/Cleanup-legacy-BXSfNJ9P.js"},{"revision":null,"url":"assets/Cleanup-DtlIIuSI.js"},{"revision":null,"url":"assets/Cleanup-BZ1xxKNt.css"},{"revision":null,"url":"assets/CToastBody-lgnPv5-L.js"},{"revision":null,"url":"assets/CToastBody-legacy-DO5epmXa.js"},{"revision":null,"url":"assets/CRow-legacy-D-MfMbRF.js"},{"revision":null,"url":"assets/CRow-D__sFNJI.js"},{"revision":null,"url":"assets/CModalTitle-legacy-KfboY4bo.js"},{"revision":null,"url":"assets/CModalTitle-D_Cik3lK.js"},{"revision":null,"url":"assets/CModalFooter-legacy-DFbBXiMT.js"},{"revision":null,"url":"assets/CModalFooter-DGkbyEWI.js"},{"revision":null,"url":"assets/CListGroupItem-legacy-C-c3g_ru.js"},{"revision":null,"url":"assets/CListGroupItem-Cn6H0Dgw.js"},{"revision":null,"url":"assets/CInputGroupText-legacy-Dh5h9w03.js"},{"revision":null,"url":"assets/CInputGroupText-CcXtW5mN.js"},{"revision":null,"url":"assets/CFormSelect-legacy-B6GF8Ebs.js"},{"revision":null,"url":"assets/CFormSelect-Bh55RBO5.js"},{"revision":null,"url":"assets/CFormLabel-legacy-ZsT_oPHv.js"},{"revision":null,"url":"assets/CFormLabel-D45Kv1Ft.js"},{"revision":null,"url":"assets/CFormInput-legacy-BghSQe3A.js"},{"revision":null,"url":"assets/CFormInput-CnW1tnnD.js"},{"revision":null,"url":"assets/CFormControlWrapper-legacy-DfSRWd-0.js"},{"revision":null,"url":"assets/CFormControlWrapper-CokJw_ou.js"},{"revision":null,"url":"assets/CFormControlValidation-legacy-DNipJ_RE.js"},{"revision":null,"url":"assets/CFormControlValidation-C3SUKyAs.js"},{"revision":null,"url":"assets/CFormCheck-legacy-jhO3m5Gf.js"},{"revision":null,"url":"assets/CFormCheck-CogvYxcz.js"},{"revision":null,"url":"assets/CContainer-legacy-CprJOyIm.js"},{"revision":null,"url":"assets/CContainer-BomMO_Po.js"},{"revision":null,"url":"assets/CCollapse-legacy-DfbPxns7.js"},{"revision":null,"url":"assets/CCollapse-DhQneOD3.js"},{"revision":null,"url":"assets/CCardHeader-legacy-B3klMqu6.js"},{"revision":null,"url":"assets/CCardHeader-C9OVhkQi.js"},{"revision":null,"url":"assets/CCardBody-legacy-CYygL8Wq.js"},{"revision":null,"url":"assets/CCardBody-Dhxn1Ny3.js"},{"revision":null,"url":"assets/CCard-legacy-DbkBPzjk.js"},{"revision":null,"url":"assets/CCard-BtcRlHaC.js"},{"revision":null,"url":"assets/CAlert-legacy-DCePp7bs.js"},{"revision":null,"url":"assets/CAlert-iVvWPub7.js"},{"revision":null,"url":"assets/BrandName-legacy-D2qABrrv.js"},{"revision":null,"url":"assets/BrandName-BoZK-5wu.js"},{"revision":null,"url":"assets/AuditLogsPage-legacy-DQ_zO8u9.js"},{"revision":null,"url":"assets/AuditLogsPage-Bjy84h2H.js"},{"revision":null,"url":"assets/Assets-legacy-CDAUqo-C.js"},{"revision":null,"url":"assets/Assets-B4Z-GvBG.js"},{"revision":null,"url":"assets/AppSettings-legacy-B77mSkkN.js"},{"revision":null,"url":"assets/AppSettings-BeHeEe-y.js"},{"revision":null,"url":"assets/AppModal-legacy-CVY7T70X.js"},{"revision":null,"url":"assets/AppModal-DMWrNvje.css"},{"revision":null,"url":"assets/AppModal-B15j_PNc.js"},{"revision":null,"url":"assets/AppIcons-legacy-D7qp3XOL.js"},{"revision":null,"url":"assets/AppIcons-DRutp8iB.js"},{"revision":null,"url":"assets/Accounts-legacy-CbNugoRD.js"},{"revision":null,"url":"assets/Accounts-4yipBHpT.js"},{"revision":"5b08b3f17508d9fe42f47af44a6c43a7","url":"favicon.ico"},{"revision":"b4639486fd4ede917de4e099a40605d8","url":"icons/icon.svg"},{"revision":"e111845fdeb48ec259e05bafbcd6043c","url":"manifest.webmanifest"}]);Sn();ht(new An(new Cn({plugins:[{handlerDidError:async()=>caches.match("/offline.html")}]})));self.addEventListener("message",t=>{var e;((e=t.data)==null?void 0:e.type)==="SKIP_WAITING"&&self.skipWaiting()});const $a=St({apiKey:"AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g",authDomain:"cashflow-9cbbc.firebaseapp.com",projectId:"cashflow-9cbbc",storageBucket:"cashflow-9cbbc.appspot.com",messagingSenderId:"221005846539",appId:"1:221005846539:web:b51908636c88cb25998f0e"}),Fa=va($a);Ta(Fa,t=>{var r;const{title:e,body:n}=(r=t.notification)!=null?r:{};self.registration.showNotification(e!=null?e:"Notificación",{body:n,icon:"/icons/icon.svg"})});self.addEventListener("periodicsync",t=>{t.tag==="check-active-accounts"&&t.waitUntil(Ua()),t.tag==="pico-y-placa"&&t.waitUntil(La())});async function Ua(){try{const t=new Date,e=t.getHours();if(![8,12,18].includes(e))return;const r=t.toISOString().split("T")[0],s="last-notify-".concat(r,"-").concat(e),a=await x();if(await new Promise(u=>{const f=a.transaction(S.APP_METADATA,"readonly").objectStore(S.APP_METADATA).get(s);f.onsuccess=()=>u(!!f.result),f.onerror=()=>u(!1)}))return;const c=(await Ra()).filter(u=>u.active===!0).length;await self.registration.showNotification("Cuentas Activas",{body:"Hay ".concat(c," cuentas activas en este momento."),icon:"/icons/icon.svg",tag:"active-accounts-notification",badge:"/icons/icon.svg"});const l=a.transaction(S.APP_METADATA,"readwrite");l.objectStore(S.APP_METADATA).put(!0,s),await new Promise((u,d)=>{l.oncomplete=()=>u(),l.onerror=()=>d(l.error)})}catch(t){console.error("Error in periodic sync checkActiveAccountsAndNotify:",t)}}

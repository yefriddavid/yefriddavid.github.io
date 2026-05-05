try{self["workbox:core:7.4.0"]&&_()}catch(t){}const Kt=(t,...e)=>{let n=t;return e.length>0&&(n+=" :: ".concat(JSON.stringify(e))),n},Vt=Kt;class m extends Error{constructor(e,n){const r=Vt(e,n);super(r),this.name=e,this.details=n}}const I={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:typeof registration<"u"?registration.scope:""},te=t=>[I.prefix,t,I.suffix].filter(e=>e&&e.length>0).join("-"),Wt=t=>{for(const e of Object.keys(I))t(e)},J={updateDetails:t=>{Wt(e=>{typeof t[e]=="string"&&(I[e]=t[e])})},getGoogleAnalyticsName:t=>t||te(I.googleAnalytics),getPrecacheName:t=>t||te(I.precache),getPrefix:()=>I.prefix,getRuntimeName:t=>t||te(I.runtime),getSuffix:()=>I.suffix};function xe(t,e){const n=e();return t.waitUntil(n),n}try{self["workbox:precaching:7.4.0"]&&_()}catch(t){}const qt="__WB_REVISION__";function zt(t){if(!t)throw new m("add-to-cache-list-unexpected-type",{entry:t});if(typeof t=="string"){const o=new URL(t,location.href);return{cacheKey:o.href,url:o.href}}const{revision:e,url:n}=t;if(!n)throw new m("add-to-cache-list-unexpected-type",{entry:t});if(!e){const o=new URL(n,location.href);return{cacheKey:o.href,url:o.href}}const r=new URL(n,location.href),s=new URL(n,location.href);return r.searchParams.set(qt,e),{cacheKey:r.href,url:s.href}}class Gt{constructor(){this.updatedURLs=[],this.notUpdatedURLs=[],this.handlerWillStart=async({request:e,state:n})=>{n&&(n.originalRequest=e)},this.cachedResponseWillBeUsed=async({event:e,state:n,cachedResponse:r})=>{if(e.type==="install"&&n&&n.originalRequest&&n.originalRequest instanceof Request){const s=n.originalRequest.url;r?this.notUpdatedURLs.push(s):this.updatedURLs.push(s)}return r}}}class Yt{constructor({precacheController:e}){this.cacheKeyWillBeUsed=async({request:n,params:r})=>{const s=(r==null?void 0:r.cacheKey)||this._precacheController.getCacheKeyForURL(n.url);return s?new Request(s,{headers:n.headers}):n},this._precacheController=e}}let U;function Jt(){if(U===void 0){const t=new Response("");if("body"in t)try{new Response(t.body),U=!0}catch(e){U=!1}U=!1}return U}async function Xt(t,e){let n=null;if(t.url&&(n=new URL(t.url).origin),n!==self.location.origin)throw new m("cross-origin-copy-response",{origin:n});const r=t.clone(),o={headers:new Headers(r.headers),status:r.status,statusText:r.statusText},i=Jt()?r.body:await r.blob();return new Response(i,o)}const Qt=t=>new URL(String(t),location.href).href.replace(new RegExp("^".concat(location.origin)),"");function $e(t,e){const n=new URL(t);for(const r of e)n.searchParams.delete(r);return n.href}async function Zt(t,e,n,r){const s=$e(e.url,n);if(e.url===s)return t.match(e,r);const o=Object.assign(Object.assign({},r),{ignoreSearch:!0}),i=await t.keys(e,o);for(const a of i){const c=$e(a.url,n);if(s===c)return t.match(a,r)}}let en=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};const tn=new Set;async function nn(){for(const t of tn)await t()}function tt(t){return new Promise(e=>setTimeout(e,t))}try{self["workbox:strategies:7.4.0"]&&_()}catch(t){}function V(t){return typeof t=="string"?new Request(t):t}class rn{constructor(e,n){this._cacheKeys={},Object.assign(this,n),this.event=n.event,this._strategy=e,this._handlerDeferred=new en,this._extendLifetimePromises=[],this._plugins=[...e.plugins],this._pluginStateMap=new Map;for(const r of this._plugins)this._pluginStateMap.set(r,{});this.event.waitUntil(this._handlerDeferred.promise)}async fetch(e){const{event:n}=this;let r=V(e);if(r.mode==="navigate"&&n instanceof FetchEvent&&n.preloadResponse){const i=await n.preloadResponse;if(i)return i}const s=this.hasCallback("fetchDidFail")?r.clone():null;try{for(const i of this.iterateCallbacks("requestWillFetch"))r=await i({request:r.clone(),event:n})}catch(i){if(i instanceof Error)throw new m("plugin-error-request-will-fetch",{thrownErrorMessage:i.message})}const o=r.clone();try{let i;i=await fetch(r,r.mode==="navigate"?void 0:this._strategy.fetchOptions);for(const a of this.iterateCallbacks("fetchDidSucceed"))i=await a({event:n,request:o,response:i});return i}catch(i){throw s&&await this.runCallbacks("fetchDidFail",{error:i,event:n,originalRequest:s.clone(),request:o.clone()}),i}}async fetchAndCachePut(e){const n=await this.fetch(e),r=n.clone();return this.waitUntil(this.cachePut(e,r)),n}async cacheMatch(e){const n=V(e);let r;const{cacheName:s,matchOptions:o}=this._strategy,i=await this.getCacheKey(n,"read"),a=Object.assign(Object.assign({},o),{cacheName:s});r=await caches.match(i,a);for(const c of this.iterateCallbacks("cachedResponseWillBeUsed"))r=await c({cacheName:s,matchOptions:o,cachedResponse:r,request:i,event:this.event})||void 0;return r}async cachePut(e,n){const r=V(e);await tt(0);const s=await this.getCacheKey(r,"write");if(!n)throw new m("cache-put-with-no-response",{url:Qt(s.url)});const o=await this._ensureResponseSafeToCache(n);if(!o)return!1;const{cacheName:i,matchOptions:a}=this._strategy,c=await self.caches.open(i),l=this.hasCallback("cacheDidUpdate"),u=l?await Zt(c,s.clone(),["__WB_REVISION__"],a):null;try{await c.put(s,l?o.clone():o)}catch(d){if(d instanceof Error)throw d.name==="QuotaExceededError"&&await nn(),d}for(const d of this.iterateCallbacks("cacheDidUpdate"))await d({cacheName:i,oldResponse:u,newResponse:o.clone(),request:s,event:this.event});return!0}async getCacheKey(e,n){const r="".concat(e.url," | ").concat(n);if(!this._cacheKeys[r]){let s=e;for(const o of this.iterateCallbacks("cacheKeyWillBeUsed"))s=V(await o({mode:n,request:s,event:this.event,params:this.params}));this._cacheKeys[r]=s}return this._cacheKeys[r]}hasCallback(e){for(const n of this._strategy.plugins)if(e in n)return!0;return!1}async runCallbacks(e,n){for(const r of this.iterateCallbacks(e))await r(n)}*iterateCallbacks(e){for(const n of this._strategy.plugins)if(typeof n[e]=="function"){const r=this._pluginStateMap.get(n);yield o=>{const i=Object.assign(Object.assign({},o),{state:r});return n[e](i)}}}waitUntil(e){return this._extendLifetimePromises.push(e),e}async doneWaiting(){for(;this._extendLifetimePromises.length;){const e=this._extendLifetimePromises.splice(0),r=(await Promise.allSettled(e)).find(s=>s.status==="rejected");if(r)throw r.reason}}destroy(){this._handlerDeferred.resolve(null)}async _ensureResponseSafeToCache(e){let n=e,r=!1;for(const s of this.iterateCallbacks("cacheWillUpdate"))if(n=await s({request:this.request,response:n,event:this.event})||void 0,r=!0,!n)break;return r||n&&n.status!==200&&(n=void 0),n}}class nt{constructor(e={}){this.cacheName=J.getRuntimeName(e.cacheName),this.plugins=e.plugins||[],this.fetchOptions=e.fetchOptions,this.matchOptions=e.matchOptions}handle(e){const[n]=this.handleAll(e);return n}handleAll(e){e instanceof FetchEvent&&(e={event:e,request:e.request});const n=e.event,r=typeof e.request=="string"?new Request(e.request):e.request,s="params"in e?e.params:void 0,o=new rn(this,{event:n,request:r,params:s}),i=this._getResponse(o,r,n),a=this._awaitComplete(i,o,r,n);return[i,a]}async _getResponse(e,n,r){await e.runCallbacks("handlerWillStart",{event:r,request:n});let s;try{if(s=await this._handle(n,e),!s||s.type==="error")throw new m("no-response",{url:n.url})}catch(o){if(o instanceof Error){for(const i of e.iterateCallbacks("handlerDidError"))if(s=await i({error:o,event:r,request:n}),s)break}if(!s)throw o}for(const o of e.iterateCallbacks("handlerWillRespond"))s=await o({event:r,request:n,response:s});return s}async _awaitComplete(e,n,r,s){let o,i;try{o=await e}catch(a){}try{await n.runCallbacks("handlerDidRespond",{event:s,request:r,response:o}),await n.doneWaiting()}catch(a){a instanceof Error&&(i=a)}if(await n.runCallbacks("handlerDidComplete",{event:s,request:r,response:o,error:i}),n.destroy(),i)throw i}}class A extends nt{constructor(e={}){e.cacheName=J.getPrecacheName(e.cacheName),super(e),this._fallbackToNetwork=e.fallbackToNetwork!==!1,this.plugins.push(A.copyRedirectedCacheableResponsesPlugin)}async _handle(e,n){const r=await n.cacheMatch(e);return r||(n.event&&n.event.type==="install"?await this._handleInstall(e,n):await this._handleFetch(e,n))}async _handleFetch(e,n){let r;const s=n.params||{};if(this._fallbackToNetwork){const o=s.integrity,i=e.integrity,a=!i||i===o;r=await n.fetch(new Request(e,{integrity:e.mode!=="no-cors"?i||o:void 0})),o&&a&&e.mode!=="no-cors"&&(this._useDefaultCacheabilityPluginIfNeeded(),await n.cachePut(e,r.clone()))}else throw new m("missing-precache-entry",{cacheName:this.cacheName,url:e.url});return r}async _handleInstall(e,n){this._useDefaultCacheabilityPluginIfNeeded();const r=await n.fetch(e);if(!await n.cachePut(e,r.clone()))throw new m("bad-precaching-response",{url:e.url,status:r.status});return r}_useDefaultCacheabilityPluginIfNeeded(){let e=null,n=0;for(const[r,s]of this.plugins.entries())s!==A.copyRedirectedCacheableResponsesPlugin&&(s===A.defaultPrecacheCacheabilityPlugin&&(e=r),s.cacheWillUpdate&&n++);n===0?this.plugins.push(A.defaultPrecacheCacheabilityPlugin):n>1&&e!==null&&this.plugins.splice(e,1)}}A.defaultPrecacheCacheabilityPlugin={async cacheWillUpdate({response:t}){return!t||t.status>=400?null:t}};A.copyRedirectedCacheableResponsesPlugin={async cacheWillUpdate({response:t}){return t.redirected?await Xt(t):t}};class sn{constructor({cacheName:e,plugins:n=[],fallbackToNetwork:r=!0}={}){this._urlsToCacheKeys=new Map,this._urlsToCacheModes=new Map,this._cacheKeysToIntegrities=new Map,this._strategy=new A({cacheName:J.getPrecacheName(e),plugins:[...n,new Yt({precacheController:this})],fallbackToNetwork:r}),this.install=this.install.bind(this),this.activate=this.activate.bind(this)}get strategy(){return this._strategy}precache(e){this.addToCacheList(e),this._installAndActiveListenersAdded||(self.addEventListener("install",this.install),self.addEventListener("activate",this.activate),this._installAndActiveListenersAdded=!0)}addToCacheList(e){const n=[];for(const r of e){typeof r=="string"?n.push(r):r&&r.revision===void 0&&n.push(r.url);const{cacheKey:s,url:o}=zt(r),i=typeof r!="string"&&r.revision?"reload":"default";if(this._urlsToCacheKeys.has(o)&&this._urlsToCacheKeys.get(o)!==s)throw new m("add-to-cache-list-conflicting-entries",{firstEntry:this._urlsToCacheKeys.get(o),secondEntry:s});if(typeof r!="string"&&r.integrity){if(this._cacheKeysToIntegrities.has(s)&&this._cacheKeysToIntegrities.get(s)!==r.integrity)throw new m("add-to-cache-list-conflicting-integrities",{url:o});this._cacheKeysToIntegrities.set(s,r.integrity)}if(this._urlsToCacheKeys.set(o,s),this._urlsToCacheModes.set(o,i),n.length>0){const a="Workbox is precaching URLs without revision info: ".concat(n.join(", "),"\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache");console.warn(a)}}}install(e){return xe(e,async()=>{const n=new Gt;this.strategy.plugins.push(n);for(const[o,i]of this._urlsToCacheKeys){const a=this._cacheKeysToIntegrities.get(i),c=this._urlsToCacheModes.get(o),l=new Request(o,{integrity:a,cache:c,credentials:"same-origin"});await Promise.all(this.strategy.handleAll({params:{cacheKey:i},request:l,event:e}))}const{updatedURLs:r,notUpdatedURLs:s}=n;return{updatedURLs:r,notUpdatedURLs:s}})}activate(e){return xe(e,async()=>{const n=await self.caches.open(this.strategy.cacheName),r=await n.keys(),s=new Set(this._urlsToCacheKeys.values()),o=[];for(const i of r)s.has(i.url)||(await n.delete(i),o.push(i.url));return{deletedURLs:o}})}getURLsToCacheKeys(){return this._urlsToCacheKeys}getCachedURLs(){return[...this._urlsToCacheKeys.keys()]}getCacheKeyForURL(e){const n=new URL(e,location.href);return this._urlsToCacheKeys.get(n.href)}getIntegrityForCacheKey(e){return this._cacheKeysToIntegrities.get(e)}async matchPrecache(e){const n=e instanceof Request?e.url:e,r=this.getCacheKeyForURL(n);if(r)return(await self.caches.open(this.strategy.cacheName)).match(r)}createHandlerBoundToURL(e){const n=this.getCacheKeyForURL(e);if(!n)throw new m("non-precached-url",{url:e});return r=>(r.request=new Request(e),r.params=Object.assign({cacheKey:n},r.params),this.strategy.handle(r))}}let ne;const rt=()=>(ne||(ne=new sn),ne);try{self["workbox:routing:7.4.0"]&&_()}catch(t){}const st="GET",W=t=>t&&typeof t=="object"?t:{handle:t};class L{constructor(e,n,r=st){this.handler=W(n),this.match=e,this.method=r}setCatchHandler(e){this.catchHandler=W(e)}}class on extends L{constructor(e,n,r){const s=({url:o})=>{const i=e.exec(o.href);if(i&&!(o.origin!==location.origin&&i.index!==0))return i.slice(1)};super(s,n,r)}}class an{constructor(){this._routes=new Map,this._defaultHandlerMap=new Map}get routes(){return this._routes}addFetchListener(){self.addEventListener("fetch",e=>{const{request:n}=e,r=this.handleRequest({request:n,event:e});r&&e.respondWith(r)})}addCacheListener(){self.addEventListener("message",e=>{if(e.data&&e.data.type==="CACHE_URLS"){const{payload:n}=e.data,r=Promise.all(n.urlsToCache.map(s=>{typeof s=="string"&&(s=[s]);const o=new Request(...s);return this.handleRequest({request:o,event:e})}));e.waitUntil(r),e.ports&&e.ports[0]&&r.then(()=>e.ports[0].postMessage(!0))}})}handleRequest({request:e,event:n}){const r=new URL(e.url,location.href);if(!r.protocol.startsWith("http"))return;const s=r.origin===location.origin,{params:o,route:i}=this.findMatchingRoute({event:n,request:e,sameOrigin:s,url:r});let a=i&&i.handler;const c=e.method;if(!a&&this._defaultHandlerMap.has(c)&&(a=this._defaultHandlerMap.get(c)),!a)return;let l;try{l=a.handle({url:r,request:e,event:n,params:o})}catch(d){l=Promise.reject(d)}const u=i&&i.catchHandler;return l instanceof Promise&&(this._catchHandler||u)&&(l=l.catch(async d=>{if(u)try{return await u.handle({url:r,request:e,event:n,params:o})}catch(f){f instanceof Error&&(d=f)}if(this._catchHandler)return this._catchHandler.handle({url:r,request:e,event:n});throw d})),l}findMatchingRoute({url:e,sameOrigin:n,request:r,event:s}){const o=this._routes.get(r.method)||[];for(const i of o){let a;const c=i.match({url:e,sameOrigin:n,request:r,event:s});if(c)return a=c,(Array.isArray(a)&&a.length===0||c.constructor===Object&&Object.keys(c).length===0||typeof c=="boolean")&&(a=void 0),{route:i,params:a}}return{}}setDefaultHandler(e,n=st){this._defaultHandlerMap.set(n,W(e))}setCatchHandler(e){this._catchHandler=W(e)}registerRoute(e){this._routes.has(e.method)||this._routes.set(e.method,[]),this._routes.get(e.method).push(e)}unregisterRoute(e){if(!this._routes.has(e.method))throw new m("unregister-route-but-not-found-with-method",{method:e.method});const n=this._routes.get(e.method).indexOf(e);if(n>-1)this._routes.get(e.method).splice(n,1);else throw new m("unregister-route-route-not-registered")}}let F;const cn=()=>(F||(F=new an,F.addFetchListener(),F.addCacheListener()),F);function ot(t,e,n){let r;if(typeof t=="string"){const o=new URL(t,location.href),i=({url:a})=>a.href===o.href;r=new L(i,e,n)}else if(t instanceof RegExp)r=new on(t,e,n);else if(typeof t=="function")r=new L(t,e,n);else if(t instanceof L)r=t;else throw new m("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});return cn().registerRoute(r),r}function ln(t,e=[]){for(const n of[...t.searchParams.keys()])e.some(r=>r.test(n))&&t.searchParams.delete(n);return t}function*un(t,{ignoreURLParametersMatching:e=[/^utm_/,/^fbclid$/],directoryIndex:n="index.html",cleanURLs:r=!0,urlManipulation:s}={}){const o=new URL(t,location.href);o.hash="",yield o.href;const i=ln(o,e);if(yield i.href,n&&i.pathname.endsWith("/")){const a=new URL(i.href);a.pathname+=n,yield a.href}if(r){const a=new URL(i.href);a.pathname+=".html",yield a.href}if(s){const a=s({url:o});for(const c of a)yield c.href}}class hn extends L{constructor(e,n){const r=({request:s})=>{const o=e.getURLsToCacheKeys();for(const i of un(s.url,n)){const a=o.get(i);if(a){const c=e.getIntegrityForCacheKey(a);return{cacheKey:a,integrity:c}}}};super(r,e.strategy)}}function dn(t){const e=rt(),n=new hn(e,t);ot(n)}const fn="-precache-",pn=async(t,e=fn)=>{const r=(await self.caches.keys()).filter(s=>s.includes(e)&&s.includes(self.registration.scope)&&s!==t);return await Promise.all(r.map(s=>self.caches.delete(s))),r};function gn(){self.addEventListener("activate",t=>{const e=J.getPrecacheName();t.waitUntil(pn(e).then(n=>{}))})}function mn(t){rt().precache(t)}function bn(t,e){mn(t),dn(e)}class wn extends L{constructor(e,{allowlist:n=[/./],denylist:r=[]}={}){super(s=>this._match(s),e),this._allowlist=n,this._denylist=r}_match({url:e,request:n}){if(n&&n.mode!=="navigate")return!1;const r=e.pathname+e.search;for(const s of this._denylist)if(s.test(r))return!1;return!!this._allowlist.some(s=>s.test(r))}}class yn extends nt{constructor(e={}){super(e),this._networkTimeoutSeconds=e.networkTimeoutSeconds||0}async _handle(e,n){let r,s;try{const o=[n.fetch(e)];if(this._networkTimeoutSeconds){const i=tt(this._networkTimeoutSeconds*1e3);o.push(i)}if(s=await Promise.race(o),!s)throw new Error("Timed out the network response after ".concat(this._networkTimeoutSeconds," seconds."))}catch(o){o instanceof Error&&(r=o)}if(!s)throw new m("no-response",{url:e.url,error:r});return s}}const _n=()=>{};var je={};/**
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
 */const it=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},Sn=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const o=t[n++];e[r++]=String.fromCharCode((s&31)<<6|o&63)}else if(s>239&&s<365){const o=t[n++],i=t[n++],a=t[n++],c=((s&7)<<18|(o&63)<<12|(i&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const o=t[n++],i=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(o&63)<<6|i&63)}}return e.join("")},at={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const o=t[s],i=s+1<t.length,a=i?t[s+1]:0,c=s+2<t.length,l=c?t[s+2]:0,u=o>>2,d=(o&3)<<4|a>>4;let f=(a&15)<<2|l>>6,p=l&63;c||(p=64,i||(f=64)),r.push(n[u],n[d],n[f],n[p])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(it(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):Sn(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const o=n[t.charAt(s++)],a=s<t.length?n[t.charAt(s)]:0;++s;const l=s<t.length?n[t.charAt(s)]:64;++s;const d=s<t.length?n[t.charAt(s)]:64;if(++s,o==null||a==null||l==null||d==null)throw new En;const f=o<<2|a>>4;if(r.push(f),l!==64){const p=a<<4&240|l>>2;if(r.push(p),d!==64){const w=l<<6&192|d;r.push(w)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class En extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const In=function(t){const e=it(t);return at.encodeByteArray(e,!0)},ct=function(t){return In(t).replace(/\./g,"")},vn=function(t){try{return at.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Tn(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const An=()=>Tn().__FIREBASE_DEFAULTS__,Cn=()=>{if(typeof process>"u"||typeof je>"u")return;const t=je.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Dn=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(n){return}const e=t&&vn(t[1]);return e&&JSON.parse(e)},Rn=()=>{try{return _n()||An()||Cn()||Dn()}catch(t){console.info("Unable to get __FIREBASE_DEFAULTS__ due to: ".concat(t));return}},lt=()=>{var t;return(t=Rn())===null||t===void 0?void 0:t.config};/**
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
 */class kn{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}function ut(){try{return typeof indexedDB=="object"}catch(t){return!1}}function ht(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var o;e(((o=s.error)===null||o===void 0?void 0:o.message)||"")}}catch(n){e(n)}})}/**
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
 */const On="FirebaseError";class $ extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=On,Object.setPrototypeOf(this,$.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,X.prototype.create)}}class X{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s="".concat(this.service,"/").concat(e),o=this.errors[e],i=o?Nn(o,r):"Error",a="".concat(this.serviceName,": ").concat(i," (").concat(s,").");return new $(s,a,r)}}function Nn(t,e){return t.replace(Mn,(n,r)=>{const s=e[r];return s!=null?String(s):"<".concat(r,"?>")})}const Mn=/\{\$([^}]+)}/g;function pe(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const o=t[s],i=e[s];if(Ue(o)&&Ue(i)){if(!pe(o,i))return!1}else if(o!==i)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function Ue(t){return t!==null&&typeof t=="object"}/**
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
 */function dt(t){return t&&t._delegate?t._delegate:t}class k{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const D="[DEFAULT]";/**
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
 */class Pn{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new kn;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch(s){}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(o){if(s)return null;throw o}else{if(s)return null;throw Error("Service ".concat(this.name," is not available"))}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error("Mismatching Component ".concat(e.name," for Provider ").concat(this.name,"."));if(this.component)throw Error("Component for ".concat(this.name," has already been provided"));if(this.component=e,!!this.shouldAutoInitialize()){if(Bn(e))try{this.getOrInitializeService({instanceIdentifier:D})}catch(n){}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const o=this.getOrInitializeService({instanceIdentifier:s});r.resolve(o)}catch(o){}}}}clearInstance(e=D){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=D){return this.instances.has(e)}getOptions(e=D){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error("".concat(this.name,"(").concat(r,") has already been initialized"));if(!this.isComponentSet())throw Error("Component ".concat(this.name," has not been registered yet"));const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[o,i]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(o);r===a&&i.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),o=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;o.add(e),this.onInitCallbacks.set(s,o);const i=this.instances.get(s);return i&&e(i,s),()=>{o.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch(o){}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Ln(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch(s){}return r||null}normalizeInstanceIdentifier(e=D){return this.component?this.component.multipleInstances?e:D:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Ln(t){return t===D?void 0:t}function Bn(t){return t.instantiationMode==="EAGER"}/**
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
 */class xn{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error("Component ".concat(e.name," has already been registered with ").concat(this.name));n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Pn(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var h;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(h||(h={}));const $n={debug:h.DEBUG,verbose:h.VERBOSE,info:h.INFO,warn:h.WARN,error:h.ERROR,silent:h.SILENT},jn=h.INFO,Un={[h.DEBUG]:"log",[h.VERBOSE]:"log",[h.INFO]:"info",[h.WARN]:"warn",[h.ERROR]:"error"},Fn=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=Un[e];if(s)console[s]("[".concat(r,"]  ").concat(t.name,":"),...n);else throw new Error("Attempted to log a message with an invalid logType (value: ".concat(e,")"))};class Hn{constructor(e){this.name=e,this._logLevel=jn,this._logHandler=Fn,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in h))throw new TypeError('Invalid value "'.concat(e,'" assigned to `logLevel`'));this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?$n[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,h.DEBUG,...e),this._logHandler(this,h.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,h.VERBOSE,...e),this._logHandler(this,h.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,h.INFO,...e),this._logHandler(this,h.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,h.WARN,...e),this._logHandler(this,h.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,h.ERROR,...e),this._logHandler(this,h.ERROR,...e)}}const Kn=(t,e)=>e.some(n=>t instanceof n);let Fe,He;function Vn(){return Fe||(Fe=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Wn(){return He||(He=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const ft=new WeakMap,ge=new WeakMap,pt=new WeakMap,re=new WeakMap,Se=new WeakMap;function qn(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",o),t.removeEventListener("error",i)},o=()=>{n(v(t.result)),s()},i=()=>{r(t.error),s()};t.addEventListener("success",o),t.addEventListener("error",i)});return e.then(n=>{n instanceof IDBCursor&&ft.set(n,t)}).catch(()=>{}),Se.set(e,t),e}function zn(t){if(ge.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",o),t.removeEventListener("error",i),t.removeEventListener("abort",i)},o=()=>{n(),s()},i=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",o),t.addEventListener("error",i),t.addEventListener("abort",i)});ge.set(t,e)}let me={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return ge.get(t);if(e==="objectStoreNames")return t.objectStoreNames||pt.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return v(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Gn(t){me=t(me)}function Yn(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(se(this),e,...n);return pt.set(r,e.sort?e.sort():[e]),v(r)}:Wn().includes(t)?function(...e){return t.apply(se(this),e),v(ft.get(this))}:function(...e){return v(t.apply(se(this),e))}}function Jn(t){return typeof t=="function"?Yn(t):(t instanceof IDBTransaction&&zn(t),Kn(t,Vn())?new Proxy(t,me):t)}function v(t){if(t instanceof IDBRequest)return qn(t);if(re.has(t))return re.get(t);const e=Jn(t);return e!==t&&(re.set(t,e),Se.set(e,t)),e}const se=t=>Se.get(t);function Q(t,e,{blocked:n,upgrade:r,blocking:s,terminated:o}={}){const i=indexedDB.open(t,e),a=v(i);return r&&i.addEventListener("upgradeneeded",c=>{r(v(i.result),c.oldVersion,c.newVersion,v(i.transaction),c)}),n&&i.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),a.then(c=>{o&&c.addEventListener("close",()=>o()),s&&c.addEventListener("versionchange",l=>s(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}function oe(t,{blocked:e}={}){const n=indexedDB.deleteDatabase(t);return e&&n.addEventListener("blocked",r=>e(r.oldVersion,r)),v(n).then(()=>{})}const Xn=["get","getKey","getAll","getAllKeys","count"],Qn=["put","add","delete","clear"],ie=new Map;function Ke(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(ie.get(e))return ie.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=Qn.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||Xn.includes(n)))return;const o=async function(i,...a){const c=this.transaction(i,s?"readwrite":"readonly");let l=c.store;return r&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),s&&c.done]))[0]};return ie.set(e,o),o}Gn(t=>({...t,get:(e,n,r)=>Ke(e,n)||t.get(e,n,r),has:(e,n)=>!!Ke(e,n)||t.has(e,n)}));/**
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
 */class Zn{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(er(n)){const r=n.getImmediate();return"".concat(r.library,"/").concat(r.version)}else return null}).filter(n=>n).join(" ")}}function er(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const be="@firebase/app",Ve="0.13.2";/**
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
 */const T=new Hn("@firebase/app"),tr="@firebase/app-compat",nr="@firebase/analytics-compat",rr="@firebase/analytics",sr="@firebase/app-check-compat",or="@firebase/app-check",ir="@firebase/auth",ar="@firebase/auth-compat",cr="@firebase/database",lr="@firebase/data-connect",ur="@firebase/database-compat",hr="@firebase/functions",dr="@firebase/functions-compat",fr="@firebase/installations",pr="@firebase/installations-compat",gr="@firebase/messaging",mr="@firebase/messaging-compat",br="@firebase/performance",wr="@firebase/performance-compat",yr="@firebase/remote-config",_r="@firebase/remote-config-compat",Sr="@firebase/storage",Er="@firebase/storage-compat",Ir="@firebase/firestore",vr="@firebase/ai",Tr="@firebase/firestore-compat",Ar="firebase";/**
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
 */const we="[DEFAULT]",Cr={[be]:"fire-core",[tr]:"fire-core-compat",[rr]:"fire-analytics",[nr]:"fire-analytics-compat",[or]:"fire-app-check",[sr]:"fire-app-check-compat",[ir]:"fire-auth",[ar]:"fire-auth-compat",[cr]:"fire-rtdb",[lr]:"fire-data-connect",[ur]:"fire-rtdb-compat",[hr]:"fire-fn",[dr]:"fire-fn-compat",[fr]:"fire-iid",[pr]:"fire-iid-compat",[gr]:"fire-fcm",[mr]:"fire-fcm-compat",[br]:"fire-perf",[wr]:"fire-perf-compat",[yr]:"fire-rc",[_r]:"fire-rc-compat",[Sr]:"fire-gcs",[Er]:"fire-gcs-compat",[Ir]:"fire-fst",[Tr]:"fire-fst-compat",[vr]:"fire-vertex","fire-js":"fire-js",[Ar]:"fire-js-all"};/**
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
 */const q=new Map,Dr=new Map,ye=new Map;function We(t,e){try{t.container.addComponent(e)}catch(n){T.debug("Component ".concat(e.name," failed to register with FirebaseApp ").concat(t.name),n)}}function x(t){const e=t.name;if(ye.has(e))return T.debug("There were multiple attempts to register component ".concat(e,".")),!1;ye.set(e,t);for(const n of q.values())We(n,t);for(const n of Dr.values())We(n,t);return!0}function Ee(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}/**
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
 */const Rr={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},C=new X("app","Firebase",Rr);/**
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
 */class kr{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new k("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw C.create("app-deleted",{appName:this._name})}}function gt(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:we,automaticDataCollectionEnabled:!0},e),s=r.name;if(typeof s!="string"||!s)throw C.create("bad-app-name",{appName:String(s)});if(n||(n=lt()),!n)throw C.create("no-options");const o=q.get(s);if(o){if(pe(n,o.options)&&pe(r,o.config))return o;throw C.create("duplicate-app",{appName:s})}const i=new xn(s);for(const c of ye.values())i.addComponent(c);const a=new kr(n,r,i);return q.set(s,a),a}function Or(t=we){const e=q.get(t);if(!e&&t===we&&lt())return gt();if(!e)throw C.create("no-app",{appName:t});return e}function B(t,e,n){var r;let s=(r=Cr[t])!==null&&r!==void 0?r:t;n&&(s+="-".concat(n));const o=s.match(/\s|\//),i=e.match(/\s|\//);if(o||i){const a=['Unable to register library "'.concat(s,'" with version "').concat(e,'":')];o&&a.push('library name "'.concat(s,'" contains illegal characters (whitespace or "/")')),o&&i&&a.push("and"),i&&a.push('version name "'.concat(e,'" contains illegal characters (whitespace or "/")')),T.warn(a.join(" "));return}x(new k("".concat(s,"-version"),()=>({library:s,version:e}),"VERSION"))}/**
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
 */const Nr="firebase-heartbeat-database",Mr=1,H="firebase-heartbeat-store";let ae=null;function mt(){return ae||(ae=Q(Nr,Mr,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(H)}catch(n){console.warn(n)}}}}).catch(t=>{throw C.create("idb-open",{originalErrorMessage:t.message})})),ae}async function Pr(t){try{const n=(await mt()).transaction(H),r=await n.objectStore(H).get(bt(t));return await n.done,r}catch(e){if(e instanceof $)T.warn(e.message);else{const n=C.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});T.warn(n.message)}}}async function qe(t,e){try{const r=(await mt()).transaction(H,"readwrite");await r.objectStore(H).put(e,bt(t)),await r.done}catch(n){if(n instanceof $)T.warn(n.message);else{const r=C.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});T.warn(r.message)}}}function bt(t){return"".concat(t.name,"!").concat(t.options.appId)}/**
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
 */const Lr=1024,Br=30;class xr{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new jr(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=ze();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(i=>i.date===o))return;if(this._heartbeatsCache.heartbeats.push({date:o,agent:s}),this._heartbeatsCache.heartbeats.length>Br){const i=Ur(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(i,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){T.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=ze(),{heartbeatsToSend:r,unsentEntries:s}=$r(this._heartbeatsCache.heartbeats),o=ct(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(n){return T.warn(n),""}}}function ze(){return new Date().toISOString().substring(0,10)}function $r(t,e=Lr){const n=[];let r=t.slice();for(const s of t){const o=n.find(i=>i.agent===s.agent);if(o){if(o.dates.push(s.date),Ge(n)>e){o.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),Ge(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class jr{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return ut()?ht().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Pr(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return qe(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return qe(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Ge(t){return ct(JSON.stringify({version:2,heartbeats:t})).length}function Ur(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
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
 */function Fr(t){x(new k("platform-logger",e=>new Zn(e),"PRIVATE")),x(new k("heartbeat",e=>new xr(e),"PRIVATE")),B(be,Ve,t),B(be,Ve,"esm2017"),B("fire-js","")}Fr("");var Hr="firebase",Kr="11.10.0";/**
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
 */B(Hr,Kr,"app");const wt="@firebase/installations",Ie="0.6.18";/**
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
 */const yt=1e4,_t="w:".concat(Ie),St="FIS_v2",Vr="https://firebaseinstallations.googleapis.com/v1",Wr=60*60*1e3,qr="installations",zr="Installations";/**
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
 */const Gr={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},O=new X(qr,zr,Gr);function Et(t){return t instanceof $&&t.code.includes("request-failed")}/**
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
 */function It({projectId:t}){return"".concat(Vr,"/projects/").concat(t,"/installations")}function vt(t){return{token:t.token,requestStatus:2,expiresIn:Jr(t.expiresIn),creationTime:Date.now()}}async function Tt(t,e){const r=(await e.json()).error;return O.create("request-failed",{requestName:t,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function At({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function Yr(t,{refreshToken:e}){const n=At(t);return n.append("Authorization",Xr(e)),n}async function Ct(t){const e=await t();return e.status>=500&&e.status<600?t():e}function Jr(t){return Number(t.replace("s","000"))}function Xr(t){return"".concat(St," ").concat(t)}/**
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
 */async function Qr({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const r=It(t),s=At(t),o=e.getImmediate({optional:!0});if(o){const l=await o.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const i={fid:n,authVersion:St,appId:t.appId,sdkVersion:_t},a={method:"POST",headers:s,body:JSON.stringify(i)},c=await Ct(()=>fetch(r,a));if(c.ok){const l=await c.json();return{fid:l.fid||n,registrationStatus:2,refreshToken:l.refreshToken,authToken:vt(l.authToken)}}else throw await Tt("Create Installation",c)}/**
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
 */function Dt(t){return new Promise(e=>{setTimeout(e,t)})}/**
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
 */function Zr(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
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
 */const es=/^[cdef][\w-]{21}$/,_e="";function ts(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const n=ns(t);return es.test(n)?n:_e}catch(t){return _e}}function ns(t){return Zr(t).substr(0,22)}/**
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
 */function Z(t){return"".concat(t.appName,"!").concat(t.appId)}/**
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
 */const Rt=new Map;function kt(t,e){const n=Z(t);Ot(n,e),rs(n,e)}function Ot(t,e){const n=Rt.get(t);if(n)for(const r of n)r(e)}function rs(t,e){const n=ss();n&&n.postMessage({key:t,fid:e}),os()}let R=null;function ss(){return!R&&"BroadcastChannel"in self&&(R=new BroadcastChannel("[Firebase] FID Change"),R.onmessage=t=>{Ot(t.data.key,t.data.fid)}),R}function os(){Rt.size===0&&R&&(R.close(),R=null)}/**
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
 */const is="firebase-installations-database",as=1,N="firebase-installations-store";let ce=null;function ve(){return ce||(ce=Q(is,as,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(N)}}})),ce}async function z(t,e){const n=Z(t),s=(await ve()).transaction(N,"readwrite"),o=s.objectStore(N),i=await o.get(n);return await o.put(e,n),await s.done,(!i||i.fid!==e.fid)&&kt(t,e.fid),e}async function Nt(t){const e=Z(t),r=(await ve()).transaction(N,"readwrite");await r.objectStore(N).delete(e),await r.done}async function ee(t,e){const n=Z(t),s=(await ve()).transaction(N,"readwrite"),o=s.objectStore(N),i=await o.get(n),a=e(i);return a===void 0?await o.delete(n):await o.put(a,n),await s.done,a&&(!i||i.fid!==a.fid)&&kt(t,a.fid),a}/**
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
 */async function Te(t){let e;const n=await ee(t.appConfig,r=>{const s=cs(r),o=ls(t,s);return e=o.registrationPromise,o.installationEntry});return n.fid===_e?{installationEntry:await e}:{installationEntry:n,registrationPromise:e}}function cs(t){const e=t||{fid:ts(),registrationStatus:0};return Mt(e)}function ls(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(O.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=us(t,n);return{installationEntry:n,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:hs(t)}:{installationEntry:e}}async function us(t,e){try{const n=await Qr(t,e);return z(t.appConfig,n)}catch(n){throw Et(n)&&n.customData.serverCode===409?await Nt(t.appConfig):await z(t.appConfig,{fid:e.fid,registrationStatus:0}),n}}async function hs(t){let e=await Ye(t.appConfig);for(;e.registrationStatus===1;)await Dt(100),e=await Ye(t.appConfig);if(e.registrationStatus===0){const{installationEntry:n,registrationPromise:r}=await Te(t);return r||n}return e}function Ye(t){return ee(t,e=>{if(!e)throw O.create("installation-not-found");return Mt(e)})}function Mt(t){return ds(t)?{fid:t.fid,registrationStatus:0}:t}function ds(t){return t.registrationStatus===1&&t.registrationTime+yt<Date.now()}/**
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
 */async function fs({appConfig:t,heartbeatServiceProvider:e},n){const r=ps(t,n),s=Yr(t,n),o=e.getImmediate({optional:!0});if(o){const l=await o.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const i={installation:{sdkVersion:_t,appId:t.appId}},a={method:"POST",headers:s,body:JSON.stringify(i)},c=await Ct(()=>fetch(r,a));if(c.ok){const l=await c.json();return vt(l)}else throw await Tt("Generate Auth Token",c)}function ps(t,{fid:e}){return"".concat(It(t),"/").concat(e,"/authTokens:generate")}/**
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
 */async function Ae(t,e=!1){let n;const r=await ee(t.appConfig,o=>{if(!Pt(o))throw O.create("not-registered");const i=o.authToken;if(!e&&bs(i))return o;if(i.requestStatus===1)return n=gs(t,e),o;{if(!navigator.onLine)throw O.create("app-offline");const a=ys(o);return n=ms(t,a),a}});return n?await n:r.authToken}async function gs(t,e){let n=await Je(t.appConfig);for(;n.authToken.requestStatus===1;)await Dt(100),n=await Je(t.appConfig);const r=n.authToken;return r.requestStatus===0?Ae(t,e):r}function Je(t){return ee(t,e=>{if(!Pt(e))throw O.create("not-registered");const n=e.authToken;return _s(n)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function ms(t,e){try{const n=await fs(t,e),r=Object.assign(Object.assign({},e),{authToken:n});return await z(t.appConfig,r),n}catch(n){if(Et(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await Nt(t.appConfig);else{const r=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await z(t.appConfig,r)}throw n}}function Pt(t){return t!==void 0&&t.registrationStatus===2}function bs(t){return t.requestStatus===2&&!ws(t)}function ws(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+Wr}function ys(t){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},t),{authToken:e})}function _s(t){return t.requestStatus===1&&t.requestTime+yt<Date.now()}/**
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
 */async function Ss(t){const e=t,{installationEntry:n,registrationPromise:r}=await Te(e);return r?r.catch(console.error):Ae(e).catch(console.error),n.fid}/**
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
 */async function Es(t,e=!1){const n=t;return await Is(n),(await Ae(n,e)).token}async function Is(t){const{registrationPromise:e}=await Te(t);e&&await e}/**
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
 */function vs(t){if(!t||!t.options)throw le("App Configuration");if(!t.name)throw le("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw le(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function le(t){return O.create("missing-app-config-values",{valueName:t})}/**
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
 */const Lt="installations",Ts="installations-internal",As=t=>{const e=t.getProvider("app").getImmediate(),n=vs(e),r=Ee(e,"heartbeat");return{app:e,appConfig:n,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},Cs=t=>{const e=t.getProvider("app").getImmediate(),n=Ee(e,Lt).getImmediate();return{getId:()=>Ss(n),getToken:s=>Es(n,s)}};function Ds(){x(new k(Lt,As,"PUBLIC")),x(new k(Ts,Cs,"PRIVATE"))}Ds();B(wt,Ie);B(wt,Ie,"esm2017");/**
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
 */const Bt="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",Rs="https://fcmregistrations.googleapis.com/v1",xt="FCM_MSG",ks="google.c.a.c_id",Os=3,Ns=1;var G;(function(t){t[t.DATA_MESSAGE=1]="DATA_MESSAGE",t[t.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(G||(G={}));/**
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
 */var Y;(function(t){t.PUSH_RECEIVED="push-received",t.NOTIFICATION_CLICKED="notification-clicked"})(Y||(Y={}));/**
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
 */function E(t){const e=new Uint8Array(t);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function Ms(t){const e="=".repeat((4-t.length%4)%4),n=(t+e).replace(/\-/g,"+").replace(/_/g,"/"),r=atob(n),s=new Uint8Array(r.length);for(let o=0;o<r.length;++o)s[o]=r.charCodeAt(o);return s}/**
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
 */const ue="fcm_token_details_db",Ps=5,Xe="fcm_token_object_Store";async function Ls(t){if("databases"in indexedDB&&!(await indexedDB.databases()).map(o=>o.name).includes(ue))return null;let e=null;return(await Q(ue,Ps,{upgrade:async(r,s,o,i)=>{var a;if(s<2||!r.objectStoreNames.contains(Xe))return;const c=i.objectStore(Xe),l=await c.index("fcmSenderId").get(t);if(await c.clear(),!!l){if(s===2){const u=l;if(!u.auth||!u.p256dh||!u.endpoint)return;e={token:u.fcmToken,createTime:(a=u.createTime)!==null&&a!==void 0?a:Date.now(),subscriptionOptions:{auth:u.auth,p256dh:u.p256dh,endpoint:u.endpoint,swScope:u.swScope,vapidKey:typeof u.vapidKey=="string"?u.vapidKey:E(u.vapidKey)}}}else if(s===3){const u=l;e={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:E(u.auth),p256dh:E(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:E(u.vapidKey)}}}else if(s===4){const u=l;e={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:E(u.auth),p256dh:E(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:E(u.vapidKey)}}}}}})).close(),await oe(ue),await oe("fcm_vapid_details_db"),await oe("undefined"),Bs(e)?e:null}function Bs(t){if(!t||!t.subscriptionOptions)return!1;const{subscriptionOptions:e}=t;return typeof t.createTime=="number"&&t.createTime>0&&typeof t.token=="string"&&t.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
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
 */const xs="firebase-messaging-database",$s=1,M="firebase-messaging-store";let he=null;function Ce(){return he||(he=Q(xs,$s,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(M)}}})),he}async function De(t){const e=ke(t),r=await(await Ce()).transaction(M).objectStore(M).get(e);if(r)return r;{const s=await Ls(t.appConfig.senderId);if(s)return await Re(t,s),s}}async function Re(t,e){const n=ke(t),s=(await Ce()).transaction(M,"readwrite");return await s.objectStore(M).put(e,n),await s.done,e}async function js(t){const e=ke(t),r=(await Ce()).transaction(M,"readwrite");await r.objectStore(M).delete(e),await r.done}function ke({appConfig:t}){return t.appId}/**
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
 */const Us={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},y=new X("messaging","Messaging",Us);/**
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
 */async function Fs(t,e){const n=await Ne(t),r=jt(e),s={method:"POST",headers:n,body:JSON.stringify(r)};let o;try{o=await(await fetch(Oe(t.appConfig),s)).json()}catch(i){throw y.create("token-subscribe-failed",{errorInfo:i==null?void 0:i.toString()})}if(o.error){const i=o.error.message;throw y.create("token-subscribe-failed",{errorInfo:i})}if(!o.token)throw y.create("token-subscribe-no-token");return o.token}async function Hs(t,e){const n=await Ne(t),r=jt(e.subscriptionOptions),s={method:"PATCH",headers:n,body:JSON.stringify(r)};let o;try{o=await(await fetch("".concat(Oe(t.appConfig),"/").concat(e.token),s)).json()}catch(i){throw y.create("token-update-failed",{errorInfo:i==null?void 0:i.toString()})}if(o.error){const i=o.error.message;throw y.create("token-update-failed",{errorInfo:i})}if(!o.token)throw y.create("token-update-no-token");return o.token}async function $t(t,e){const r={method:"DELETE",headers:await Ne(t)};try{const o=await(await fetch("".concat(Oe(t.appConfig),"/").concat(e),r)).json();if(o.error){const i=o.error.message;throw y.create("token-unsubscribe-failed",{errorInfo:i})}}catch(s){throw y.create("token-unsubscribe-failed",{errorInfo:s==null?void 0:s.toString()})}}function Oe({projectId:t}){return"".concat(Rs,"/projects/").concat(t,"/registrations")}async function Ne({appConfig:t,installations:e}){const n=await e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t.apiKey,"x-goog-firebase-installations-auth":"FIS ".concat(n)})}function jt({p256dh:t,auth:e,endpoint:n,vapidKey:r}){const s={web:{endpoint:n,auth:e,p256dh:t}};return r!==Bt&&(s.web.applicationPubKey=r),s}/**
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
 */const Ks=7*24*60*60*1e3;async function Vs(t){const e=await qs(t.swRegistration,t.vapidKey),n={vapidKey:t.vapidKey,swScope:t.swRegistration.scope,endpoint:e.endpoint,auth:E(e.getKey("auth")),p256dh:E(e.getKey("p256dh"))},r=await De(t.firebaseDependencies);if(r){if(zs(r.subscriptionOptions,n))return Date.now()>=r.createTime+Ks?Ws(t,{token:r.token,createTime:Date.now(),subscriptionOptions:n}):r.token;try{await $t(t.firebaseDependencies,r.token)}catch(s){console.warn(s)}return Ze(t.firebaseDependencies,n)}else return Ze(t.firebaseDependencies,n)}async function Qe(t){const e=await De(t.firebaseDependencies);e&&(await $t(t.firebaseDependencies,e.token),await js(t.firebaseDependencies));const n=await t.swRegistration.pushManager.getSubscription();return n?n.unsubscribe():!0}async function Ws(t,e){try{const n=await Hs(t.firebaseDependencies,e),r=Object.assign(Object.assign({},e),{token:n,createTime:Date.now()});return await Re(t.firebaseDependencies,r),n}catch(n){throw n}}async function Ze(t,e){const r={token:await Fs(t,e),createTime:Date.now(),subscriptionOptions:e};return await Re(t,r),r.token}async function qs(t,e){const n=await t.pushManager.getSubscription();return n||t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Ms(e)})}function zs(t,e){const n=e.vapidKey===t.vapidKey,r=e.endpoint===t.endpoint,s=e.auth===t.auth,o=e.p256dh===t.p256dh;return n&&r&&s&&o}/**
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
 */function Gs(t){const e={from:t.from,collapseKey:t.collapse_key,messageId:t.fcmMessageId};return Ys(e,t),Js(e,t),Xs(e,t),e}function Ys(t,e){if(!e.notification)return;t.notification={};const n=e.notification.title;n&&(t.notification.title=n);const r=e.notification.body;r&&(t.notification.body=r);const s=e.notification.image;s&&(t.notification.image=s);const o=e.notification.icon;o&&(t.notification.icon=o)}function Js(t,e){e.data&&(t.data=e.data)}function Xs(t,e){var n,r,s,o,i;if(!e.fcmOptions&&!(!((n=e.notification)===null||n===void 0)&&n.click_action))return;t.fcmOptions={};const a=(s=(r=e.fcmOptions)===null||r===void 0?void 0:r.link)!==null&&s!==void 0?s:(o=e.notification)===null||o===void 0?void 0:o.click_action;a&&(t.fcmOptions.link=a);const c=(i=e.fcmOptions)===null||i===void 0?void 0:i.analytics_label;c&&(t.fcmOptions.analyticsLabel=c)}/**
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
 */function Qs(t){return typeof t=="object"&&!!t&&ks in t}/**
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
 */function Zs(t){return new Promise(e=>{setTimeout(e,t)})}async function eo(t,e){const n=to(e,await t.firebaseDependencies.installations.getId());no(t,n,e.productId)}function to(t,e){var n,r;const s={};return t.from&&(s.project_number=t.from),t.fcmMessageId&&(s.message_id=t.fcmMessageId),s.instance_id=e,t.notification?s.message_type=G.DISPLAY_NOTIFICATION.toString():s.message_type=G.DATA_MESSAGE.toString(),s.sdk_platform=Os.toString(),s.package_name=self.origin.replace(/(^\w+:|^)\/\//,""),t.collapse_key&&(s.collapse_key=t.collapse_key),s.event=Ns.toString(),!((n=t.fcmOptions)===null||n===void 0)&&n.analytics_label&&(s.analytics_label=(r=t.fcmOptions)===null||r===void 0?void 0:r.analytics_label),s}function no(t,e,n){const r={};r.event_time_ms=Math.floor(Date.now()).toString(),r.source_extension_json_proto3=JSON.stringify({messaging_client_event:e}),n&&(r.compliance_data=ro(n)),t.logEvents.push(r)}function ro(t){return{privacy_context:{prequest:{origin_associated_product_id:t}}}}/**
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
 */async function so(t,e){var n,r;const{newSubscription:s}=t;if(!s){await Qe(e);return}const o=await De(e.firebaseDependencies);await Qe(e),e.vapidKey=(r=(n=o==null?void 0:o.subscriptionOptions)===null||n===void 0?void 0:n.vapidKey)!==null&&r!==void 0?r:Bt,await Vs(e)}async function oo(t,e){const n=co(t);if(!n)return;e.deliveryMetricsExportedToBigQueryEnabled&&await eo(e,n);const r=await Ut();if(uo(r))return ho(r,n);if(n.notification&&await fo(ao(n)),!!e&&e.onBackgroundMessageHandler){const s=Gs(n);typeof e.onBackgroundMessageHandler=="function"?await e.onBackgroundMessageHandler(s):e.onBackgroundMessageHandler.next(s)}}async function io(t){var e,n;const r=(n=(e=t.notification)===null||e===void 0?void 0:e.data)===null||n===void 0?void 0:n[xt];if(r){if(t.action)return}else return;t.stopImmediatePropagation(),t.notification.close();const s=po(r);if(!s)return;const o=new URL(s,self.location.href),i=new URL(self.location.origin);if(o.host!==i.host)return;let a=await lo(o);if(a?a=await a.focus():(a=await self.clients.openWindow(s),await Zs(3e3)),!!a)return r.messageType=Y.NOTIFICATION_CLICKED,r.isFirebaseMessaging=!0,a.postMessage(r)}function ao(t){const e=Object.assign({},t.notification);return e.data={[xt]:t},e}function co({data:t}){if(!t)return null;try{return t.json()}catch(e){return null}}async function lo(t){const e=await Ut();for(const n of e){const r=new URL(n.url,self.location.href);if(t.host===r.host)return n}return null}function uo(t){return t.some(e=>e.visibilityState==="visible"&&!e.url.startsWith("chrome-extension://"))}function ho(t,e){e.isFirebaseMessaging=!0,e.messageType=Y.PUSH_RECEIVED;for(const n of t)n.postMessage(e)}function Ut(){return self.clients.matchAll({type:"window",includeUncontrolled:!0})}function fo(t){var e;const{actions:n}=t,{maxActions:r}=Notification;return n&&r&&n.length>r&&console.warn("This browser only supports ".concat(r," actions. The remaining actions will not be displayed.")),self.registration.showNotification((e=t.title)!==null&&e!==void 0?e:"",t)}function po(t){var e,n,r;const s=(n=(e=t.fcmOptions)===null||e===void 0?void 0:e.link)!==null&&n!==void 0?n:(r=t.notification)===null||r===void 0?void 0:r.click_action;return s||(Qs(t.data)?self.location.origin:null)}/**
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
 */function go(t){if(!t||!t.options)throw de("App Configuration Object");if(!t.name)throw de("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:n}=t;for(const r of e)if(!n[r])throw de(r);return{appName:t.name,projectId:n.projectId,apiKey:n.apiKey,appId:n.appId,senderId:n.messagingSenderId}}function de(t){return y.create("missing-app-config-values",{valueName:t})}/**
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
 */class mo{constructor(e,n,r){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const s=go(e);this.firebaseDependencies={app:e,appConfig:s,installations:n,analyticsProvider:r}}_delete(){return Promise.resolve()}}/**
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
 */const bo=t=>{const e=new mo(t.getProvider("app").getImmediate(),t.getProvider("installations-internal").getImmediate(),t.getProvider("analytics-internal"));return self.addEventListener("push",n=>{n.waitUntil(oo(n,e))}),self.addEventListener("pushsubscriptionchange",n=>{n.waitUntil(so(n,e))}),self.addEventListener("notificationclick",n=>{n.waitUntil(io(n))}),e};function wo(){x(new k("messaging-sw",bo,"PUBLIC"))}/**
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
 */async function yo(){return ut()&&await ht()&&"PushManager"in self&&"Notification"in self&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
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
 */function _o(t,e){if(self.document!==void 0)throw y.create("only-available-in-sw");return t.onBackgroundMessageHandler=e,()=>{t.onBackgroundMessageHandler=null}}/**
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
 */function So(t=Or()){return yo().then(e=>{if(!e)throw y.create("unsupported-browser")},e=>{throw y.create("indexed-db-unsupported")}),Ee(dt(t),"messaging-sw").getImmediate()}function Eo(t,e){return t=dt(t),_o(t,e)}/**
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
 */wo();const Io="my-admin-local",vo=6,b={SALARY_DISTRIBUTION:"salary-distribution",MY_PROJECTS:"my-projects",ASSETS:"assets",ACCOUNTS_MASTER:"accounts-master",METADATA:"metadata",TAXI_VEHICLES:"taxi-vehicles"};function j(){return new Promise((t,e)=>{const n=indexedDB.open(Io,vo);n.onupgradeneeded=r=>{const s=r.target.result;s.objectStoreNames.contains(b.SALARY_DISTRIBUTION)||s.createObjectStore(b.SALARY_DISTRIBUTION),s.objectStoreNames.contains(b.MY_PROJECTS)||s.createObjectStore(b.MY_PROJECTS,{keyPath:"id"}),s.objectStoreNames.contains(b.ASSETS)||s.createObjectStore(b.ASSETS,{keyPath:"id"}),s.objectStoreNames.contains(b.ACCOUNTS_MASTER)||s.createObjectStore(b.ACCOUNTS_MASTER,{keyPath:"id"}),s.objectStoreNames.contains(b.METADATA)||s.createObjectStore(b.METADATA),s.objectStoreNames.contains(b.TAXI_VEHICLES)||s.createObjectStore(b.TAXI_VEHICLES,{keyPath:"id"})},n.onsuccess=r=>t(r.target.result),n.onerror=r=>e(r.target.error)})}const g=b,et=g.ACCOUNTS_MASTER;async function To(){const t=await j();return new Promise((e,n)=>{const s=t.transaction(et,"readonly").objectStore(et).getAll();s.onsuccess=o=>{var i;return e((i=o.target.result)!=null?i:[])},s.onerror=o=>n(o.target.error)})}async function Ao(t){const n=(await j()).transaction(g.TAXI_VEHICLES,"readwrite"),r=n.objectStore(g.TAXI_VEHICLES);r.clear();for(const s of t)r.put(s);await new Promise((s,o)=>{n.oncomplete=s,n.onerror=()=>o(n.error)})}async function Co(){const t=await j();return new Promise((e,n)=>{const s=t.transaction(g.TAXI_VEHICLES,"readonly").objectStore(g.TAXI_VEHICLES).getAll();s.onsuccess=()=>{var o;return e((o=s.result)!=null?o:[])},s.onerror=()=>n(s.error)})}const Do="pico-placa-notify-hours",fe=[8,12,17];async function Ro(){try{const t=await j();return await new Promise(e=>{const r=t.transaction(g.METADATA,"readonly").objectStore(g.METADATA).get(Do);r.onsuccess=()=>e(Array.isArray(r.result)?r.result:fe),r.onerror=()=>e(fe)})}catch(t){return fe}}const ko=["Hoy","Mañana","En 2 días","En 3 días","En 4 días"];async function Oo(){try{const t=new Date,e=t.getHours();if(!(await Ro()).includes(e))return;const r=t.toISOString().split("T")[0],s="pico-placa-".concat(r,"-").concat(e),o=await j();if(await new Promise(p=>{const S=o.transaction(g.METADATA,"readonly").objectStore(g.METADATA).get(s);S.onsuccess=()=>p(!!S.result),S.onerror=()=>p(!1)}))return;let a=await Co();if(a.length||(a=await Mo(),a.length&&await Ao(a)),!a.length)return;const c=[];for(let p=0;p<=4;p++){const w=new Date(t);w.setDate(w.getDate()+p);const S=a.filter(P=>No(P.restrictions,w.getMonth()+1,w.getDate())).map(P=>P.plate);p===0?c.push(S.length?"Hoy: ".concat(S.join(", ")):"Hoy: sin pico y placa"):S.length&&c.push("".concat(ko[p],": ").concat(S.join(", ")))}const l="Pico y Placa",u=c.join(" | ");await(typeof self.registration<"u"?self.registration:await navigator.serviceWorker.ready).showNotification(l,{body:u,icon:"/icons/icon.svg",tag:"pico-y-placa",badge:"/icons/icon.svg"});const f=o.transaction(g.METADATA,"readwrite");f.objectStore(g.METADATA).put(!0,s),await new Promise((p,w)=>{f.oncomplete=p,f.onerror=()=>w(f.error)})}catch(t){console.error("Error in pico-y-placa check:",t)}}function No(t,e,n){if(!t)return!1;const r=t[String(e)];if(!r)return!1;const s=Number(r.d1)||0,o=Number(r.d2)||0;return s!==0&&s===n||o!==0&&o===n}async function Mo(){var t;try{const r="https://firestore.googleapis.com/v1/projects/".concat("cashflow-9cbbc","/databases/(default)/documents/CashFlow_taxi_vehiculos?key=").concat("AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g"),s=await fetch(r);return s.ok?((t=(await s.json()).documents)!=null?t:[]).map(Po).filter(i=>i.plate):[]}catch(e){return[]}}function Po(t){var o,i,a,c,l,u,d,f,p,w,S,P,Me,Pe,Le,Be;const e=(o=t.fields)!=null?o:{},n=t.name.split("/").pop(),r=(c=(a=(i=e.restrictions)==null?void 0:i.mapValue)==null?void 0:a.fields)!=null?c:{},s={};for(const[Ft,Ht]of Object.entries(r)){const K=(u=(l=Ht.mapValue)==null?void 0:l.fields)!=null?u:{};s[Ft]={d1:Number((w=(p=(d=K.d1)==null?void 0:d.integerValue)!=null?p:(f=K.d1)==null?void 0:f.doubleValue)!=null?w:0),d2:Number((Pe=(Me=(S=K.d2)==null?void 0:S.integerValue)!=null?Me:(P=K.d2)==null?void 0:P.doubleValue)!=null?Pe:0)}}return{id:n,plate:(Be=(Le=e.plate)==null?void 0:Le.stringValue)!=null?Be:"",restrictions:s}}bn([{"revision":"c6f3e2a98fcef6c3d4c0c1533ea1f3f4","url":"offline.html"},{"revision":"4e07454a9e4cfcbd4578f94ca62f34d0","url":"index.html"},{"revision":"5b08b3f17508d9fe42f47af44a6c43a7","url":"favicon.ico"},{"revision":"3394026d133157e5039a62aefd1165a8","url":"404.html"},{"revision":"b4639486fd4ede917de4e099a40605d8","url":"icons/icon.svg"},{"revision":null,"url":"assets/workbox-window.prod.es5-legacy-BMyJTwtC.js"},{"revision":null,"url":"assets/workbox-window.prod.es5-RNCgxoJe.js"},{"revision":null,"url":"assets/vendor-pdfjs-legacy-DtNXiqXJ.js"},{"revision":null,"url":"assets/vendor-pdfjs-B0ZCgLYt.js"},{"revision":null,"url":"assets/vendor-firebase-legacy-COKkpRsX.js"},{"revision":null,"url":"assets/vendor-firebase-Bnk3q4Xh.js"},{"revision":null,"url":"assets/useTranslation-wR32x-Ln.js"},{"revision":null,"url":"assets/useTranslation-legacy-t27ToRkK.js"},{"revision":null,"url":"assets/useLocaleData-legacy-MEpF80QX.js"},{"revision":null,"url":"assets/useLocaleData-C-PULVPt.js"},{"revision":null,"url":"assets/typeof-legacy-CF8Q5s-V.js"},{"revision":null,"url":"assets/typeof-QjJsDpFa.js"},{"revision":null,"url":"assets/taxi-legacy-CWfcLykU.js"},{"revision":null,"url":"assets/taxi-BsNMIyCh.js"},{"revision":null,"url":"assets/skypatrolCommands-xAJhfgmi.js"},{"revision":null,"url":"assets/skypatrolCommands-legacy-D59IbE8P.js"},{"revision":null,"url":"assets/raspberrypi-Cq0hdVK6.svg"},{"revision":null,"url":"assets/purify.es-legacy--e_Ioqdx.js"},{"revision":null,"url":"assets/purify.es-CalY6-J1.js"},{"revision":null,"url":"assets/polyfills-legacy-CeUvjBkr.js"},{"revision":null,"url":"assets/masters-legacy-mlcq2Jpm.js"},{"revision":null,"url":"assets/masters-CslZem0d.css"},{"revision":null,"url":"assets/leaflet-rtiNkjbd.js"},{"revision":null,"url":"assets/leaflet-legacy-plxfjtTY.js"},{"revision":null,"url":"assets/leaflet-CKBlaIOB.css"},{"revision":null,"url":"assets/jspdf.es.min-legacy-CPj9ln7F.js"},{"revision":null,"url":"assets/jspdf.es.min-DPeg6p1-.js"},{"revision":null,"url":"assets/index.esm-legacy-8fDNaF7j.js"},{"revision":null,"url":"assets/index.esm-legacy-0S-dgFHa.js"},{"revision":null,"url":"assets/index.esm-HYp8EoIh.js"},{"revision":null,"url":"assets/index.esm-Bnds3ePR.js"},{"revision":null,"url":"assets/index.es-legacy-C7wuY3ky.js"},{"revision":null,"url":"assets/index.es-d216AfXj.js"},{"revision":null,"url":"assets/index-legacy-jvdC1dsN.js"},{"revision":null,"url":"assets/index-legacy-KsYhwcrR.js"},{"revision":null,"url":"assets/index-legacy-DZbc4QF8.js"},{"revision":null,"url":"assets/index-legacy-DVn68ERm.js"},{"revision":null,"url":"assets/index-legacy-D5wZW39c.js"},{"revision":null,"url":"assets/index-legacy-CT5yHhGV.js"},{"revision":null,"url":"assets/index-legacy-BcSR2L2Z.js"},{"revision":null,"url":"assets/index-legacy-BM0fkr1x.js"},{"revision":null,"url":"assets/index-legacy-BEgmfZeY.js"},{"revision":null,"url":"assets/index-legacy-B0EcDoDp.js"},{"revision":null,"url":"assets/index-legacy-9wJjs9EL.js"},{"revision":null,"url":"assets/index-legacy-4Xg69GtT.js"},{"revision":null,"url":"assets/index-jMSN8IJ4.js"},{"revision":null,"url":"assets/index-browser-esm-legacy-DJK9SAKR.js"},{"revision":null,"url":"assets/index-browser-esm-Un4MHIRw.js"},{"revision":null,"url":"assets/index-OcEK1b8d.js"},{"revision":null,"url":"assets/index-E_g9bvl5.js"},{"revision":null,"url":"assets/index-DvLh_pJg.css"},{"revision":null,"url":"assets/index-DqrLJxVT.js"},{"revision":null,"url":"assets/index-DHrYQ3bA.js"},{"revision":null,"url":"assets/index-CuBvI_iT.js"},{"revision":null,"url":"assets/index-CkL7zOHO.css"},{"revision":null,"url":"assets/index-CJ6PThlw.js"},{"revision":null,"url":"assets/index-CGKD2Kjf.js"},{"revision":null,"url":"assets/index-C2H7eynt.js"},{"revision":null,"url":"assets/index-BcpbRG50.css"},{"revision":null,"url":"assets/index-BI4FCn1q.js"},{"revision":null,"url":"assets/index-BFykYkVa.css"},{"revision":null,"url":"assets/index-BCrK8qDC.js"},{"revision":null,"url":"assets/index-BANorbzj.css"},{"revision":null,"url":"assets/index-B4OduJw_.css"},{"revision":null,"url":"assets/index-3BcH-B98.css"},{"revision":null,"url":"assets/index-1uH8QSP7.js"},{"revision":null,"url":"assets/html2canvas.esm-legacy-DIGTxsNk.js"},{"revision":null,"url":"assets/html2canvas.esm-BJcB2cAV.js"},{"revision":null,"url":"assets/fileHelpers-legacy-BWyg_XSA.js"},{"revision":null,"url":"assets/fileHelpers-Cm_UUqQZ.js"},{"revision":null,"url":"assets/cil-x-legacy-Qr_cwwg3.js"},{"revision":null,"url":"assets/cil-x-CfQSVFP2.js"},{"revision":null,"url":"assets/cil-warning-legacy-CzEvJIux.js"},{"revision":null,"url":"assets/cil-warning-CEGefZLr.js"},{"revision":null,"url":"assets/cil-trash-legacy-C42VUvsZ.js"},{"revision":null,"url":"assets/cil-trash-gHK8YSrs.js"},{"revision":null,"url":"assets/cil-settings-legacy-Wz-5t8FH.js"},{"revision":null,"url":"assets/cil-settings-CvamCGgV.js"},{"revision":null,"url":"assets/cil-reload-legacy-eAUOUnWA.js"},{"revision":null,"url":"assets/cil-reload-BVwYFWgW.js"},{"revision":null,"url":"assets/cil-plus-legacy-QLKf2chB.js"},{"revision":null,"url":"assets/cil-plus-CjZkVDO0.js"},{"revision":null,"url":"assets/cil-pencil-legacy-CP7gv1FJ.js"},{"revision":null,"url":"assets/cil-pencil-c89ONrkF.js"},{"revision":null,"url":"assets/cil-magnifying-glass-legacy-jKzJX5Hz.js"},{"revision":null,"url":"assets/cil-magnifying-glass-Bjd2ULXB.js"},{"revision":null,"url":"assets/cil-copy-legacy-B25iN0fH.js"},{"revision":null,"url":"assets/cil-copy-BsaR4wcz.js"},{"revision":null,"url":"assets/cil-calendar-legacy-0x7vYkI6.js"},{"revision":null,"url":"assets/cil-calendar-BVcJRLOY.js"},{"revision":null,"url":"assets/cil-arrow-bottom-legacy-DUy9YACi.js"},{"revision":null,"url":"assets/cil-arrow-bottom-DbQMsyby.js"},{"revision":null,"url":"assets/cashFlow-legacy-BbC-LncG.js"},{"revision":null,"url":"assets/cashFlow-CHsH9Lg1.js"},{"revision":null,"url":"assets/auth-legacy-1QwPIftm.js"},{"revision":null,"url":"assets/auth-Clnv4Am_.js"},{"revision":null,"url":"assets/auditHelpers-mQnDDK2F.js"},{"revision":null,"url":"assets/auditHelpers-legacy-B9HCQCja.js"},{"revision":null,"url":"assets/appSettings-legacy-_Ep_mSbU.js"},{"revision":null,"url":"assets/appSettings-CkCQiuz_.js"},{"revision":null,"url":"assets/Visits-legacy-D4kPJRXC.js"},{"revision":null,"url":"assets/Visits-BKhBKwHY.js"},{"revision":null,"url":"assets/Vehicles-legacy-84tmZzBA.js"},{"revision":null,"url":"assets/Vehicles-CQlkPdN2.js"},{"revision":null,"url":"assets/Users-legacy-CJvcUkPA.js"},{"revision":null,"url":"assets/Users-D7_0AWPi.js"},{"revision":null,"url":"assets/Tenants-legacy-BWHXzzg8.js"},{"revision":null,"url":"assets/Tenants-kPuJQuCR.js"},{"revision":null,"url":"assets/TaxisLayout-legacy-DJnWLVP4.js"},{"revision":null,"url":"assets/TaxisLayout-D9JSlEq_.js"},{"revision":null,"url":"assets/Summary-legacy-BHLHurvV.js"},{"revision":null,"url":"assets/Summary-D-SMrp3U.js"},{"revision":null,"url":"assets/StandardForm-legacy-DyYCdeKE.js"},{"revision":null,"url":"assets/StandardForm-CNukXdh9.js"},{"revision":null,"url":"assets/SolarPanel-legacy-VgqQ9Y-f.js"},{"revision":null,"url":"assets/SolarPanel-BgbIe-dq.css"},{"revision":null,"url":"assets/SolarPanel-BfaQR1Mb.js"},{"revision":null,"url":"assets/SerialConsole-legacy-Dxcx6Uoe.js"},{"revision":null,"url":"assets/SerialConsole-B9YlnqOL.css"},{"revision":null,"url":"assets/SerialConsole-B0gFx0Dg.js"},{"revision":null,"url":"assets/SelectApp-legacy-DxKTiJQ9.js"},{"revision":null,"url":"assets/SelectApp-D7MfCL84.js"},{"revision":null,"url":"assets/SelectApp-CmEMKwL-.css"},{"revision":null,"url":"assets/SalaryDistribution-legacy-D3tAhHON.js"},{"revision":null,"url":"assets/SalaryDistribution-LAvogxlN.js"},{"revision":null,"url":"assets/Register-legacy-CLVqQbWT.js"},{"revision":null,"url":"assets/Register-BCGfxBZN.js"},{"revision":null,"url":"assets/PushSubscribers-legacy-DULwaf6J.js"},{"revision":null,"url":"assets/PushSubscribers-CBG75zoy.js"},{"revision":null,"url":"assets/Profile-legacy-CrwkOosx.js"},{"revision":null,"url":"assets/Profile-KQYWBvZM.js"},{"revision":null,"url":"assets/Payments-legacy-De3pZrGf.js"},{"revision":null,"url":"assets/Payments-legacy-BxO8n6Gk.js"},{"revision":null,"url":"assets/Payments-Bp5koFwM.js"},{"revision":null,"url":"assets/Payments-BRlHlEqS.css"},{"revision":null,"url":"assets/Payments-BPwmEINR.css"},{"revision":null,"url":"assets/Partners-pL40XxRP.js"},{"revision":null,"url":"assets/Partners-legacy-B2HXVuvY.js"},{"revision":null,"url":"assets/Page500-pZKq8aRJ.js"},{"revision":null,"url":"assets/Page500-legacy-DP6jysvC.js"},{"revision":null,"url":"assets/Page404-vW3gZk0p.js"},{"revision":null,"url":"assets/Page404-legacy-DDDASZke.js"},{"revision":null,"url":"assets/Operations-legacy-CnidH6IR.js"},{"revision":null,"url":"assets/Operations-KM7V-xhL.js"},{"revision":null,"url":"assets/Login-legacy-Dmp7BnN-.js"},{"revision":null,"url":"assets/Login-legacy-DS4gN3Id.js"},{"revision":null,"url":"assets/Login-DVbGumOa.js"},{"revision":null,"url":"assets/Login-BkpcoX3i.css"},{"revision":null,"url":"assets/ItemDetail-legacy-B0V5KW0j.js"},{"revision":null,"url":"assets/ItemDetail-D61TxUQ7.css"},{"revision":null,"url":"assets/InlinePaymentMethod-legacy-Gw5y2JYH.js"},{"revision":null,"url":"assets/InlinePaymentMethod-CWsQnwRH.js"},{"revision":null,"url":"assets/Index-xZfYrYPt.js"},{"revision":null,"url":"assets/Index-pNC9Rzx2.css"},{"revision":null,"url":"assets/Index-legacy-BPM_SmJw.js"},{"revision":null,"url":"assets/Index-legacy-B-IhpjFJ.js"},{"revision":null,"url":"assets/Index-EGmuJ3of.css"},{"revision":null,"url":"assets/Index-DX3diBGp.js"},{"revision":null,"url":"assets/IncreaseDecrease-legacy-BVnIqEph.js"},{"revision":null,"url":"assets/IncreaseDecrease-d1pZBMP8.js"},{"revision":null,"url":"assets/Home-legacy-CxKjq7R-.js"},{"revision":null,"url":"assets/Home-legacy-CgFTwC2w.js"},{"revision":null,"url":"assets/Home-PdnLLaOg.css"},{"revision":null,"url":"assets/Home-IaBxUxTN.js"},{"revision":null,"url":"assets/Home-DC6VHxj9.js"},{"revision":null,"url":"assets/HardRefresh-legacy-BzyHER3U.js"},{"revision":null,"url":"assets/HardRefresh-Jc4i9zgF.js"},{"revision":null,"url":"assets/Expenses-legacy-D1TQ82MN.js"},{"revision":null,"url":"assets/Expenses-_hij62Z_.js"},{"revision":null,"url":"assets/Eggs-wswrijUU.js"},{"revision":null,"url":"assets/Eggs-legacy-BrWzodKw.js"},{"revision":null,"url":"assets/Drivers-legacy-CZVE_jiX.js"},{"revision":null,"url":"assets/Drivers-CzqdA8xZ.js"},{"revision":null,"url":"assets/DomoticaLayout-legacy-C9gLvj6g.js"},{"revision":null,"url":"assets/DomoticaLayout-CpIf68S-.js"},{"revision":null,"url":"assets/DocsExample-legacy-MhWBDfqM.js"},{"revision":null,"url":"assets/DocsExample-En_GSTxy.js"},{"revision":null,"url":"assets/DocsExample-DKaJiZGn.css"},{"revision":null,"url":"assets/Distributions-legacy-CQOtnQKj.js"},{"revision":null,"url":"assets/Distributions-CaH6rufc.js"},{"revision":null,"url":"assets/Devices-legacy-Bxw-j_PA.js"},{"revision":null,"url":"assets/Devices-DU6iCbQN.css"},{"revision":null,"url":"assets/Devices-B1bnJRQb.js"},{"revision":null,"url":"assets/DetailPanel-legacy-RU1S-7bI.js"},{"revision":null,"url":"assets/DetailPanel-BSyE63lv.js"},{"revision":null,"url":"assets/DefaultLayout-legacy-CZxRU9dB.js"},{"revision":null,"url":"assets/DefaultLayout-BKSgEvxN.js"},{"revision":null,"url":"assets/DefaultLayout-B-xBg0WV.css"},{"revision":null,"url":"assets/Dashboard-legacy-Dd5SmjV_.js"},{"revision":null,"url":"assets/Dashboard-CEAaHXHC.css"},{"revision":null,"url":"assets/Dashboard-C0nc2JP_.js"},{"revision":null,"url":"assets/CommandDictionary-legacy-9cvQZOhL.js"},{"revision":null,"url":"assets/CommandDictionary-CIEt-_T3.css"},{"revision":null,"url":"assets/CommandDictionary-BegXWNpU.js"},{"revision":null,"url":"assets/Cleanup-legacy-BEcRKW2N.js"},{"revision":null,"url":"assets/Cleanup-j4p0VO-P.js"},{"revision":null,"url":"assets/Cleanup-CiK77u9B.css"},{"revision":null,"url":"assets/CToastBody-legacy-3VGPwTWn.js"},{"revision":null,"url":"assets/CToastBody-DL0rY-N5.js"},{"revision":null,"url":"assets/CTable-legacy-BeR-yPfE.js"},{"revision":null,"url":"assets/CTable-DV3sWCvE.js"},{"revision":null,"url":"assets/CTabPane-legacy-B_EX90Ht.js"},{"revision":null,"url":"assets/CTabPane-6QTnu9CR.js"},{"revision":null,"url":"assets/CRow-legacy-B-fazkfw.js"},{"revision":null,"url":"assets/CRow-DcdK1mEm.js"},{"revision":null,"url":"assets/CModalTitle-u0VlbBI5.js"},{"revision":null,"url":"assets/CModalTitle-legacy-DSus9uHh.js"},{"revision":null,"url":"assets/CModalFooter-legacy-BmqCL7hZ.js"},{"revision":null,"url":"assets/CModalFooter-BpDSNuSk.js"},{"revision":null,"url":"assets/CListGroupItem-legacy-DHMzmozJ.js"},{"revision":null,"url":"assets/CListGroupItem-BHfbE80O.js"},{"revision":null,"url":"assets/CLink-yhWatbfm.js"},{"revision":null,"url":"assets/CLink-legacy-hsQhQaeQ.js"},{"revision":null,"url":"assets/CInputGroupText-legacy-CzzQ94LY.js"},{"revision":null,"url":"assets/CInputGroupText-DVfdo_LB.js"},{"revision":null,"url":"assets/CFormSelect-legacy-Wqgr3Ted.js"},{"revision":null,"url":"assets/CFormSelect-9WmwS_4-.js"},{"revision":null,"url":"assets/CFormLabel-legacy-C-huebT3.js"},{"revision":null,"url":"assets/CFormLabel-45t9DBj_.js"},{"revision":null,"url":"assets/CFormInput-legacy-Ble4dAq_.js"},{"revision":null,"url":"assets/CFormInput-DZELEZ6s.js"},{"revision":null,"url":"assets/CFormControlWrapper-legacy-BJyJHHld.js"},{"revision":null,"url":"assets/CFormControlWrapper-TduRmnNU.js"},{"revision":null,"url":"assets/CFormCheck-legacy-VvFXElxn.js"},{"revision":null,"url":"assets/CFormCheck-CsVmIjQZ.js"},{"revision":null,"url":"assets/CForm-legacy-DYjSbKMV.js"},{"revision":null,"url":"assets/CForm-BW-BM44P.js"},{"revision":null,"url":"assets/CContainer-legacy-D81ikb__.js"},{"revision":null,"url":"assets/CContainer-B5Kd7biR.js"},{"revision":null,"url":"assets/CCollapse-legacy-CTqSu94W.js"},{"revision":null,"url":"assets/CCollapse-DwYOcvVa.js"},{"revision":null,"url":"assets/CCloseButton-legacy-BVChE_71.js"},{"revision":null,"url":"assets/CCloseButton-BqQGFrme.js"},{"revision":null,"url":"assets/CCardHeader-legacy-BPbIROlF.js"},{"revision":null,"url":"assets/CCardHeader-CxTD_9E-.js"},{"revision":null,"url":"assets/CCardBody-legacy-DU1buIk0.js"},{"revision":null,"url":"assets/CCardBody-DvOze4Rt.js"},{"revision":null,"url":"assets/CButton-legacy-GrtKvHW8.js"},{"revision":null,"url":"assets/CButton-DNqXxzpH.js"},{"revision":null,"url":"assets/CBadge-legacy-CvFedq-e.js"},{"revision":null,"url":"assets/CBadge-Br5kRhE1.js"},{"revision":null,"url":"assets/CAlert-legacy-BVnZH3ZV.js"},{"revision":null,"url":"assets/CAlert-BL91_RB7.js"},{"revision":null,"url":"assets/BrandName-legacy-Bzj7SHTO.js"},{"revision":null,"url":"assets/BrandName-DgiRdFbZ.js"},{"revision":null,"url":"assets/AttachmentViewer-legacy-B0BoxyyA.js"},{"revision":null,"url":"assets/AttachmentViewer-CfDlnnXd.js"},{"revision":null,"url":"assets/AttachmentViewer-BIl1o2Z8.css"},{"revision":null,"url":"assets/Assets-legacy-VglIYT-V.js"},{"revision":null,"url":"assets/Assets-BSUYCI0z.js"},{"revision":null,"url":"assets/AppSettings-legacy-3e1_Hs2v.js"},{"revision":null,"url":"assets/AppSettings-CBG7mBeM.js"},{"revision":null,"url":"assets/AppModal-legacy-De3SONqO.js"},{"revision":null,"url":"assets/AppModal-Di-ce7VC.css"},{"revision":null,"url":"assets/AppModal-Crg_S2iQ.js"},{"revision":null,"url":"assets/AppIcons-legacy-DoucZKim.js"},{"revision":null,"url":"assets/AppIcons-DzvhNooi.js"},{"revision":null,"url":"assets/Accounts-pGv1S1r0.js"},{"revision":null,"url":"assets/Accounts-legacy-BsXKZcqy.js"},{"revision":"5b08b3f17508d9fe42f47af44a6c43a7","url":"favicon.ico"},{"revision":"b4639486fd4ede917de4e099a40605d8","url":"icons/icon.svg"},{"revision":"5799344d081240e4e674912aa225665a","url":"manifest.webmanifest"}]);gn();ot(new wn(new yn({plugins:[{handlerDidError:async()=>caches.match("/offline.html")}]})));self.addEventListener("message",t=>{var e;((e=t.data)==null?void 0:e.type)==="SKIP_WAITING"&&self.skipWaiting()});const Lo=gt({apiKey:"AIzaSyBCul4mFCoDYWWKwBjNUrkPQSbmq6vXi4g",authDomain:"cashflow-9cbbc.firebaseapp.com",projectId:"cashflow-9cbbc",storageBucket:"cashflow-9cbbc.appspot.com",messagingSenderId:"221005846539",appId:"1:221005846539:web:b51908636c88cb25998f0e"}),Bo=So(Lo);Eo(Bo,t=>{var r;const{title:e,body:n}=(r=t.notification)!=null?r:{};self.registration.showNotification(e!=null?e:"Notificación",{body:n,icon:"/icons/icon.svg"})});self.addEventListener("periodicsync",t=>{t.tag==="check-active-accounts"&&t.waitUntil(xo()),t.tag==="pico-y-placa"&&t.waitUntil(Oo())});async function xo(){try{const t=new Date,e=t.getHours();if(![8,12,18].includes(e))return;const r=t.toISOString().split("T")[0],s="last-notify-".concat(r,"-").concat(e),o=await j();if(await new Promise(u=>{const f=o.transaction(g.METADATA,"readonly").objectStore(g.METADATA).get(s);f.onsuccess=()=>u(!!f.result),f.onerror=()=>u(!1)}))return;const c=(await To()).filter(u=>u.active===!0).length;await self.registration.showNotification("Cuentas Activas",{body:"Hay ".concat(c," cuentas activas en este momento."),icon:"/icons/icon.svg",tag:"active-accounts-notification",badge:"/icons/icon.svg"});const l=o.transaction(g.METADATA,"readwrite");l.objectStore(g.METADATA).put(!0,s),await new Promise((u,d)=>{l.oncomplete=()=>u(),l.onerror=()=>d(l.error)})}catch(t){console.error("Error in periodic sync checkActiveAccountsAndNotify:",t)}}

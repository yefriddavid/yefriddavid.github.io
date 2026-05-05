System.register([],function(t,e){"use strict";return{execute:function(){t({A:D,B:A,D:function(){return!("undefined"==typeof navigator||!navigator.cookieEnabled)}
/**
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
             */,H:function(t){return JSON.stringify(t)}
/**
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
             */,I:O,J:
/**
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
             */
function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},K:function(t,e){return Object.prototype.hasOwnProperty.call(t,e)?t[e]:void 0},M:function(t,e,n){const r={};for(const s in t)Object.prototype.hasOwnProperty.call(t,s)&&(r[s]=e.call(n,t[s],s,t));return r},R:function(t,e){return`${t} failed: ${e} argument `}
/**
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
             */,W:
/**
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
             */
function(t){return l(void 0,t)},Z:function(){return!0===n.NODE_ADMIN},_:Jt,a0:_,a1:function(t,e){const n="object"==typeof t?t:re(),r="string"==typeof t?t:cr,s=Jt(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const t=m("firestore");t&&function(t,e,n,r={}){var s;t=vn(t,su);const i=w(e),o=t._getSettings(),a=Object.assign(Object.assign({},o),{emulatorOptions:t._getEmulatorOptions()}),c=`${e}:${n}`;i&&(b(`https://${c}`),I("Firestore",!0)),o.host!==eu&&o.host!==c&&Me("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const u=Object.assign(Object.assign({},o),{host:c,ssl:i,emulatorOptions:r});if(!L(u,a)&&(t._setSettings(u),r.mockUserToken)){let e,n;if("string"==typeof r.mockUserToken)e=r.mockUserToken,n=Ne.MOCK_USER;else{e=_(r.mockUserToken,null===(s=t._app)||void 0===s?void 0:s.options.projectId);const i=r.mockUserToken.sub||r.mockUserToken.user_id;if(!i)throw new qe(Be.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");n=new Ne(i)}t._authCredentials=new He(new ze(e,n))}}
/**
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
             */(s,...t)}return s},a2:ne,a3:function(t,e,...n){let r=[];e instanceof Ku&&r.push(e),r=r.concat(n),function(t){const e=t.filter(t=>t instanceof Xu).length,n=t.filter(t=>t instanceof Wu).length;if(e>1||e>0&&n>0)throw new qe(Be.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}
/**
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
             */(r);for(const s of r)t=s._apply(t);return t},a4:function(t,e,n){const r=e,s=Gu("where",t);return Wu._create(s,r,n)},a5:function(t,e,...n){if(t=F(t),fn("collection","path",e),t instanceof su){const r=un.fromString(e,...n);return gn(r),new au(t,null,r)}{if(!(t instanceof ou||t instanceof au))throw new qe(Be.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(un.fromString(e,...n));return gn(r),new au(t.firestore,null,r)}},a6:function(t){t=vn(t,iu);const e=vn(t.firestore,fu),n=pu(e),r=new uh(e);return Hu(t._query),function(t,e,n={}){const r=new $e;return t.asyncQueue.enqueueAndForget(async()=>function(t,e,n,r,s){const i=new Hc({next:n=>{i.Ou(),e.enqueueAndForget(()=>ac(t,o)),n.fromCache&&"server"===r.source?s.reject(new qe(Be.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):s.resolve(n)},error:t=>s.reject(t)}),o=new fc(n,i,{includeMetadataChanges:!0,ka:!0});return oc(t,o)}(await Yc(t),t.asyncQueue,e,n,r)),r.promise}(n,t._query).then(n=>new ah(e,r,t,n))},a7:function(t,e,n,...r){t=vn(t,ou);const s=vn(t.firestore,fu),i=Du(s);let o;return o="string"==typeof(e=F(e))||e instanceof vu?xu(i,"updateDoc",t._key,e,n,r):Ou(i,"updateDoc",t._key,e),hh(s,[o.toMutation(t._key,Js.exists(!0))])},a8:function(t,e){const n=vn(t.firestore,fu),r=cu(t),s=rh(t.converter,e);return hh(n,[Nu(Du(t.firestore),"addDoc",r._key,s,null!==t.converter,{}).toMutation(r._key,Js.exists(!1))]).then(()=>r)},a9:cu,aa:function(){return new Ru("serverTimestamp")}
/**
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
             */,ab:function(t){return hh(vn(t.firestore,fu),[new hi(t._key,Js.none())])},ac:function(t,e,n){t=vn(t,ou);const r=vn(t.firestore,fu),s=rh(t.converter,e,n);return hh(r,[Nu(Du(r),"setDoc",t._key,s,null!==t.converter,n).toMutation(t._key,Js.none())])},ad:function(t,e="asc"){const n=e,r=Gu("orderBy",t);return Ju._create(r,n)},ae:function(t){return function(t,e){if(e<=0)throw new qe(Be.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}
/**
             * @license
             * Copyright 2025 Google LLC
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
             */("limit",t),Yu._create("limit",t,"F")},ag:
/**
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
             */
function(t){t=vn(t,ou);const e=vn(t.firestore,fu);return function(t,e,n={}){const r=new $e;return t.asyncQueue.enqueueAndForget(async()=>function(t,e,n,r,s){const i=new Hc({next:a=>{i.Ou(),e.enqueueAndForget(()=>ac(t,o));const c=a.docs.has(n);!c&&a.fromCache?s.reject(new qe(Be.UNAVAILABLE,"Failed to get document because the client is offline.")):c&&a.fromCache&&r&&"server"===r.source?s.reject(new qe(Be.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):s.resolve(a)},error:t=>s.reject(t)}),o=new fc(as(n.path),i,{includeMetadataChanges:!0,ka:!0});return oc(t,o)}(await Yc(t),t.asyncQueue,e,n,r)),r.promise}(pu(e),t._key).then(n=>lh(e,t,n))},ah:function(t){return pu(t=vn(t,fu)),new dh(t,e=>hh(t,e))},ai:function(t){return function(t,e){const n=vn(t.firestore,fu),r=pu(n),s=function(t,e){const n=[];for(const r in t)Object.prototype.hasOwnProperty.call(t,r)&&n.push(e(t[r],r,t));return n}(e,(t,e)=>new gi(e,t.aggregateType,t._internalFieldPath));return function(t,e,n){const r=new $e;return t.asyncQueue.enqueueAndForget(async()=>{try{const s=await function(t){return Jc(t).then(t=>t.datastore)}(t);r.resolve(async function(t,e,n){var r;const s=je(t),{request:i,ft:o,parent:a}=function(t,e,n){const{Vt:r,parent:s}=Zi(t,e),i={},o=[];let a=0;return n.forEach(t=>{const e="aggregate_"+a++;i[e]=t.alias,"count"===t.aggregateType?o.push({alias:e,count:{}}):"avg"===t.aggregateType?o.push({alias:e,avg:{field:io(t.fieldPath)}}):"sum"===t.aggregateType&&o.push({alias:e,sum:{field:io(t.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:o,structuredQuery:r.structuredQuery},parent:r.parent},ft:i,parent:s}}(s.serializer,function(t){const e=je(t);return e.de||(e.de=ds(e,t.explicitOrderBy)),e.de}(e),n);s.connection.Qo||delete i.parent;const c=(await s.Jo("RunAggregationQuery",s.serializer.databaseId,a,i,1)).filter(t=>!!t.result);Ue(1===c.length,64727);const u=null===(r=c[0].result)||void 0===r?void 0:r.aggregateFields;return Object.keys(u).reduce((t,e)=>(t[o[e]]=u[e],t),{})}(s,e,n))}catch(t){r.reject(t)}}),r.promise
/**
             * @license
             * Copyright 2023 Google LLC
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
             */}(r,t._query,s).then(e=>function(t,e,n){const r=new uh(t);return new mu(e,r,n)}
/**
             * @license
             * Copyright 2023 Google LLC
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
             */(n,t,e))}
/**
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
             */(t,{count:new gu("count")})},aj:function(t,...e){var n,r,s;t=F(t);let i={includeMetadataChanges:!1,source:"default"},o=0;"object"!=typeof e[o]||du(e[o])||(i=e[o++]);const a={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(du(e[o])){const t=e[o];e[o]=null===(n=t.next)||void 0===n?void 0:n.bind(t),e[o+1]=null===(r=t.error)||void 0===r?void 0:r.bind(t),e[o+2]=null===(s=t.complete)||void 0===s?void 0:s.bind(t)}let c,u,h;if(t instanceof ou)u=vn(t.firestore,fu),h=as(t._key.path),c={next:n=>{e[o]&&e[o](lh(u,t,n))},error:e[o+1],complete:e[o+2]};else{const n=vn(t,iu);u=vn(n.firestore,fu),h=n._query;const r=new uh(u);c={next:t=>{e[o]&&e[o](new ah(u,r,n,t))},error:e[o+1],complete:e[o+2]},Hu(t._query)}return function(t,e,n,r){const s=new Hc(r),i=new fc(e,s,n);return t.asyncQueue.enqueueAndForget(async()=>oc(await Yc(t),i)),()=>{s.Ou(),t.asyncQueue.enqueueAndForget(async()=>ac(await Yc(t),i))}}(pu(u),h,a,c)},c:re,d:L,e:S,f:function(){const t=S();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0},g:F,h:Yt,i:w,j:function(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0},k:function(){return"undefined"!=typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(S())},l:function(){return"object"==typeof navigator&&"ReactNative"===navigator.product},n:function(){const t="object"==typeof chrome?chrome.runtime:"object"==typeof browser?browser.runtime:void 0;return"object"==typeof t&&void 0!==t.id},p:b,q:
/**
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
             */
function(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(t=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(t))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""},r:function(){return"undefined"!=typeof navigator&&"Cloudflare-Workers"===navigator.userAgent},s:Xt,t:se,u:I,v:function(t,e){const n=new P(t,e);return n.subscribe.bind(n)},w:function(t){const e={};return t.replace(/^\?/,"").split("&").forEach(t=>{if(t){const[n,r]=t.split("=");e[decodeURIComponent(n)]=decodeURIComponent(r)}}),e},x:function(t){const e=t.indexOf("?");if(!e)return"";const n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}
/**
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
             */,y:ct,z:function(t,{blocked:e}={}){const n=indexedDB.deleteDatabase(t);return e&&n.addEventListener("blocked",t=>e(t.oldVersion,t)),ot(n).then(()=>{})}});var e={};
/**
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
             */const n={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"},r=t("G",function(t,e){if(!t)throw s(e)}),s=t("Q",function(t){return new Error("Firebase Database ("+n.SDK_VERSION+") INTERNAL ASSERT FAILED: "+t)}),i=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=63&s|128):55296==(64512&s)&&r+1<t.length&&56320==(64512&t.charCodeAt(r+1))?(s=65536+((1023&s)<<10)+(1023&t.charCodeAt(++r)),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=63&s|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=63&s|128)}return e},o=t("P",{byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const e=t[s],i=s+1<t.length,o=i?t[s+1]:0,a=s+2<t.length,c=a?t[s+2]:0,u=e>>2,h=(3&e)<<4|o>>4;let l=(15&o)<<2|c>>6,d=63&c;a||(d=64,i||(l=64)),r.push(n[u],n[h],n[l],n[d])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(i(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((31&s)<<6|63&i)}else if(s>239&&s<365){const i=((7&s)<<18|(63&t[n++])<<12|(63&t[n++])<<6|63&t[n++])-65536;e[r++]=String.fromCharCode(55296+(i>>10)),e[r++]=String.fromCharCode(56320+(1023&i))}else{const i=t[n++],o=t[n++];e[r++]=String.fromCharCode((15&s)<<12|(63&i)<<6|63&o)}}return e.join("")}(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const e=n[t.charAt(s++)],i=s<t.length?n[t.charAt(s)]:0;++s;const o=s<t.length?n[t.charAt(s)]:64;++s;const c=s<t.length?n[t.charAt(s)]:64;if(++s,null==e||null==i||null==o||null==c)throw new a;const u=e<<2|i>>4;if(r.push(u),64!==o){const t=i<<4&240|o>>2;if(r.push(t),64!==c){const t=o<<6&192|c;r.push(t)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}});
/**
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
             */class a extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const c=t("Y",function(t){const e=i(t);return o.encodeByteArray(e,!0)}),u=function(t){return c(t).replace(/\./g,"")},h=t("o",function(t){try{return o.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null});function l(t,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:return new Date(e.getTime());case Object:void 0===t&&(t={});break;case Array:t=[];break;default:return e}for(const n in e)e.hasOwnProperty(n)&&d(n)&&(t[n]=l(t[n],e[n]));return t}function d(t){return"__proto__"!==t}
/**
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
             */
/**
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
             */
const f=()=>function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("Unable to locate global object.")}().__FIREBASE_DEFAULTS__,p=()=>{try{return f()||(()=>{if("undefined"==typeof process)return;const t=e.__FIREBASE_DEFAULTS__;return t?JSON.parse(t):void 0})()||(()=>{if("undefined"==typeof document)return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(n){return}const e=t&&h(t[1]);return e&&JSON.parse(e)})()}catch(t){return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`)}},g=t("b",t=>{var e,n;return null===(n=null===(e=p())||void 0===e?void 0:e.emulatorHosts)||void 0===n?void 0:n[t]}),m=t("$",t=>{const e=g(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return"["===e[0]?[e.substring(1,n-1),r]:[e.substring(0,n),r]}),y=()=>{var t;return null===(t=p())||void 0===t?void 0:t.config};t("a",t=>{var e;return null===(e=p())||void 0===e?void 0:e[`_${t}`]});
/**
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
             */
class v{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}wrapCallback(t){return(e,n)=>{e?this.reject(e):this.resolve(n),"function"==typeof t&&(this.promise.catch(()=>{}),1===t.length?t(e):t(e,n))}}}
/**
             * @license
             * Copyright 2025 Google LLC
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
             */
function w(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch(e){return!1}}async function b(t){return(await fetch(t,{credentials:"include"})).ok}
/**
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
             */function _(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n=e||"demo-project",r=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const i=Object.assign({iss:`https://securetoken.google.com/${n}`,aud:n,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},t);return[u(JSON.stringify({alg:"none",type:"JWT"})),u(JSON.stringify(i)),""].join(".")}t("T",v);const E={};let T=!1;function I(t,e){if("undefined"==typeof window||"undefined"==typeof document||!w(window.location.host)||E[t]===e||E[t]||T)return;function n(t){return`__firebase__banner__${t}`}E[t]=e;const r="__firebase__banner",s=function(){const t={prod:[],emulator:[]};for(const e of Object.keys(E))E[e]?t.emulator.push(e):t.prod.push(e);return t}().prod.length>0;function i(){const t=document.createElement("span");return t.style.cursor="pointer",t.style.marginLeft="16px",t.style.fontSize="24px",t.innerHTML=" &times;",t.onclick=()=>{T=!0,function(){const t=document.getElementById(r);t&&t.remove()}()},t}function o(){const t=function(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}(r),e=n("text"),o=document.getElementById(e)||document.createElement("span"),a=n("learnmore"),c=document.getElementById(a)||document.createElement("a"),u=n("preprendIcon"),h=document.getElementById(u)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(t.created){const e=t.element;!function(t){t.style.display="flex",t.style.background="#7faaf0",t.style.position="fixed",t.style.bottom="5px",t.style.left="5px",t.style.padding=".5em",t.style.borderRadius="5px",t.style.alignItems="center"}(e),function(t,e){t.setAttribute("id",e),t.innerText="Learn more",t.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",t.setAttribute("target","__blank"),t.style.paddingLeft="5px",t.style.textDecoration="underline"}(c,a);const n=i();!function(t,e){t.setAttribute("width","24"),t.setAttribute("id",e),t.setAttribute("height","24"),t.setAttribute("viewBox","0 0 24 24"),t.setAttribute("fill","none"),t.style.marginLeft="-6px"}(h,u),e.append(h,o,c,n),document.body.appendChild(e)}s?(o.innerText="Preview backend disconnected.",h.innerHTML='<g clip-path="url(#clip0_6013_33858)">\n<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>\n</g>\n<defs>\n<clipPath id="clip0_6013_33858">\n<rect width="24" height="24" fill="white"/>\n</clipPath>\n</defs>'):(h.innerHTML='<g clip-path="url(#clip0_6083_34804)">\n<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>\n</g>\n<defs>\n<clipPath id="clip0_6083_34804">\n<rect width="24" height="24" fill="white"/>\n</clipPath>\n</defs>',o.innerText="Preview backend running in this workspace."),o.setAttribute("id",e)}"loading"===document.readyState?window.addEventListener("DOMContentLoaded",o):o()}
/**
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
             */function S(){return"undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:""}function C(){return!function(){var t;const e=null===(t=p())||void 0===t?void 0:t.forceEnvironment;if("node"===e)return!0;if("browser"===e)return!1;try{return"[object process]"===Object.prototype.toString.call(global.process)}catch(n){return!1}}()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function A(){try{return"object"==typeof indexedDB}catch(t){return!1}}function D(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var t;e((null===(t=s.error)||void 0===t?void 0:t.message)||"")}}catch(n){e(n)}})}class N extends Error{constructor(t,e,n){super(e),this.code=t,this.customData=n,this.name="FirebaseError",Object.setPrototypeOf(this,N.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,k.prototype.create)}}t("F",N);class k{constructor(t,e,n){this.service=t,this.serviceName=e,this.errors=n}create(t,...e){const n=e[0]||{},r=`${this.service}/${t}`,s=this.errors[t],i=s?function(t,e){return t.replace(R,(t,n)=>{const r=e[n];return null!=r?String(r):`<${n}?>`})}(s,n):"Error",o=`${this.serviceName}: ${i} (${r}).`;return new N(r,o,n)}}t("E",k);const R=/\{\$([^}]+)}/g;
/**
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
             */function O(t){return JSON.parse(t)}const x=function(t){let e={},n={},r={},s="";try{const i=t.split(".");e=O(h(i[0])||""),n=O(h(i[1])||""),s=i[2],r=n.d||{},delete n.d}catch(i){}return{header:e,claims:n,data:r,signature:s}};function L(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const n=t[s],i=e[s];if(M(n)&&M(i)){if(!L(n,i))return!1}else if(n!==i)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function M(t){return null!==t&&"object"==typeof t}t("V",function(t){const e=x(t).claims;return!!e&&"object"==typeof e&&e.hasOwnProperty("iat")}),t("U",function(t){const e=x(t).claims;return"object"==typeof e&&!0===e.admin}),t("O",class{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=64,this.pad_[0]=128;for(let t=1;t<this.blockSize;++t)this.pad_[t]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(t,e){e||(e=0);const n=this.W_;if("string"==typeof t)for(let h=0;h<16;h++)n[h]=t.charCodeAt(e)<<24|t.charCodeAt(e+1)<<16|t.charCodeAt(e+2)<<8|t.charCodeAt(e+3),e+=4;else for(let h=0;h<16;h++)n[h]=t[e]<<24|t[e+1]<<16|t[e+2]<<8|t[e+3],e+=4;for(let h=16;h<80;h++){const t=n[h-3]^n[h-8]^n[h-14]^n[h-16];n[h]=4294967295&(t<<1|t>>>31)}let r,s,i=this.chain_[0],o=this.chain_[1],a=this.chain_[2],c=this.chain_[3],u=this.chain_[4];for(let h=0;h<80;h++){h<40?h<20?(r=c^o&(a^c),s=1518500249):(r=o^a^c,s=1859775393):h<60?(r=o&a|c&(o|a),s=2400959708):(r=o^a^c,s=3395469782);const t=(i<<5|i>>>27)+r+u+s+n[h]&4294967295;u=c,c=a,a=4294967295&(o<<30|o>>>2),o=i,i=t}this.chain_[0]=this.chain_[0]+i&4294967295,this.chain_[1]=this.chain_[1]+o&4294967295,this.chain_[2]=this.chain_[2]+a&4294967295,this.chain_[3]=this.chain_[3]+c&4294967295,this.chain_[4]=this.chain_[4]+u&4294967295}update(t,e){if(null==t)return;void 0===e&&(e=t.length);const n=e-this.blockSize;let r=0;const s=this.buf_;let i=this.inbuf_;for(;r<e;){if(0===i)for(;r<=n;)this.compress_(t,r),r+=this.blockSize;if("string"==typeof t){for(;r<e;)if(s[i]=t.charCodeAt(r),++i,++r,i===this.blockSize){this.compress_(s),i=0;break}}else for(;r<e;)if(s[i]=t[r],++i,++r,i===this.blockSize){this.compress_(s),i=0;break}}this.inbuf_=i,this.total_+=e}digest(){const t=[];let e=8*this.total_;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let r=this.blockSize-1;r>=56;r--)this.buf_[r]=255&e,e/=256;this.compress_(this.buf_);let n=0;for(let r=0;r<5;r++)for(let e=24;e>=0;e-=8)t[n]=this.chain_[r]>>e&255,++n;return t}});class P{constructor(t,e){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=e,this.task.then(()=>{t(this)}).catch(t=>{this.error(t)})}next(t){this.forEachObserver(e=>{e.next(t)})}error(t){this.forEachObserver(e=>{e.error(t)}),this.close(t)}complete(){this.forEachObserver(t=>{t.complete()}),this.close()}subscribe(t,e,n){let r;if(void 0===t&&void 0===e&&void 0===n)throw new Error("Missing Observer.");r=function(t,e){if("object"!=typeof t||null===t)return!1;for(const n of e)if(n in t&&"function"==typeof t[n])return!0;return!1}(t,["next","error","complete"])?t:{next:t,error:e,complete:n},void 0===r.next&&(r.next=V),void 0===r.error&&(r.error=V),void 0===r.complete&&(r.complete=V);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch(t){}}),this.observers.push(r),s}unsubscribeOne(t){void 0!==this.observers&&void 0!==this.observers[t]&&(delete this.observers[t],this.observerCount-=1,0===this.observerCount&&void 0!==this.onNoObservers&&this.onNoObservers(this))}forEachObserver(t){if(!this.finalized)for(let e=0;e<this.observers.length;e++)this.sendOne(e,t)}sendOne(t,e){this.task.then(()=>{if(void 0!==this.observers&&void 0!==this.observers[t])try{e(this.observers[t])}catch(n){"undefined"!=typeof console&&console.error&&console.error(n)}})}close(t){this.finalized||(this.finalized=!0,void 0!==t&&(this.finalError=t),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function V(){}
/**
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
             */
function F(t){return t&&t._delegate?t._delegate:t}t("N",function(t){const e=[];let n=0;for(let s=0;s<t.length;s++){let i=t.charCodeAt(s);if(i>=55296&&i<=56319){const e=i-55296;s++,r(s<t.length,"Surrogate pair missing trail surrogate."),i=65536+(e<<10)+(t.charCodeAt(s)-56320)}i<128?e[n++]=i:i<2048?(e[n++]=i>>6|192,e[n++]=63&i|128):i<65536?(e[n++]=i>>12|224,e[n++]=i>>6&63|128,e[n++]=63&i|128):(e[n++]=i>>18|240,e[n++]=i>>12&63|128,e[n++]=i>>6&63|128,e[n++]=63&i|128)}return e}),t("X",function(t){let e=0;for(let n=0;n<t.length;n++){const r=t.charCodeAt(n);r<128?e++:r<2048?e+=2:r>=55296&&r<=56319?(e+=4,n++):e+=3}return e});class U{constructor(t,e,n){this.name=t,this.instanceFactory=e,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}t("C",U);
/**
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
             */
const j="[DEFAULT]";
/**
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
             */class B{constructor(t,e){this.name=t,this.container=e,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const e=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(e)){const t=new v;if(this.instancesDeferred.set(e,t),this.isInitialized(e)||this.shouldAutoInitialize())try{const n=this.getOrInitializeService({instanceIdentifier:e});n&&t.resolve(n)}catch(n){}}return this.instancesDeferred.get(e).promise}getImmediate(t){var e;const n=this.normalizeInstanceIdentifier(null==t?void 0:t.identifier),r=null!==(e=null==t?void 0:t.optional)&&void 0!==e&&e;if(!this.isInitialized(n)&&!this.shouldAutoInitialize()){if(r)return null;throw Error(`Service ${this.name} is not available`)}try{return this.getOrInitializeService({instanceIdentifier:n})}catch(s){if(r)return null;throw s}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,this.shouldAutoInitialize()){if(function(t){return"EAGER"===t.instantiationMode}
/**
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
             */(t))try{this.getOrInitializeService({instanceIdentifier:j})}catch(e){}for(const[t,n]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const t=this.getOrInitializeService({instanceIdentifier:r});n.resolve(t)}catch(e){}}}}clearInstance(t=j){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...t.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return null!=this.component}isInitialized(t=j){return this.instances.has(t)}getOptions(t=j){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:e={}}=t,n=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:n,options:e});for(const[s,i]of this.instancesDeferred.entries())n===this.normalizeInstanceIdentifier(s)&&i.resolve(r);return r}onInit(t,e){var n;const r=this.normalizeInstanceIdentifier(e),s=null!==(n=this.onInitCallbacks.get(r))&&void 0!==n?n:new Set;s.add(t),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&t(i,r),()=>{s.delete(t)}}invokeOnInitCallbacks(t,e){const n=this.onInitCallbacks.get(e);if(n)for(const s of n)try{s(t,e)}catch(r){}}getOrInitializeService({instanceIdentifier:t,options:e={}}){let n=this.instances.get(t);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:(r=t,r===j?void 0:r),options:e}),this.instances.set(t,n),this.instancesOptions.set(t,e),this.invokeOnInitCallbacks(n,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,n)}catch(s){}var r;return n||null}normalizeInstanceIdentifier(t=j){return this.component?this.component.multipleInstances?t:j:t}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}class q{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const e=this.getProvider(t.name);if(e.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);e.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const e=new B(t,this);return this.providers.set(t,e),e}getProviders(){return Array.from(this.providers.values())}}
/**
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
             */var $;t("m",$),function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"}($||t("m",$={}));const z={debug:$.DEBUG,verbose:$.VERBOSE,info:$.INFO,warn:$.WARN,error:$.ERROR,silent:$.SILENT},G=$.INFO,H={[$.DEBUG]:"log",[$.VERBOSE]:"log",[$.INFO]:"info",[$.WARN]:"warn",[$.ERROR]:"error"},K=(t,e,...n)=>{if(e<t.logLevel)return;const r=(new Date).toISOString(),s=H[e];if(!s)throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);console[s](`[${r}]  ${t.name}:`,...n)};class Q{constructor(t){this.name=t,this._logLevel=G,this._logHandler=K,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in $))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel="string"==typeof t?z[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if("function"!=typeof t)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,$.DEBUG,...t),this._logHandler(this,$.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,$.VERBOSE,...t),this._logHandler(this,$.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,$.INFO,...t),this._logHandler(this,$.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,$.WARN,...t),this._logHandler(this,$.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,$.ERROR,...t),this._logHandler(this,$.ERROR,...t)}}t("L",Q);const W=(t,e)=>e.some(e=>t instanceof e);let X,J;const Y=new WeakMap,Z=new WeakMap,tt=new WeakMap,et=new WeakMap,nt=new WeakMap;let rt={get(t,e,n){if(t instanceof IDBTransaction){if("done"===e)return Z.get(t);if("objectStoreNames"===e)return t.objectStoreNames||tt.get(t);if("store"===e)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return ot(t[e])},set:(t,e,n)=>(t[e]=n,!0),has:(t,e)=>t instanceof IDBTransaction&&("done"===e||"store"===e)||e in t};function st(t){return t!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(J||(J=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(t)?function(...e){return t.apply(at(this),e),ot(Y.get(this))}:function(...e){return ot(t.apply(at(this),e))}:function(e,...n){const r=t.call(at(this),e,...n);return tt.set(r,e.sort?e.sort():[e]),ot(r)}}function it(t){return"function"==typeof t?st(t):(t instanceof IDBTransaction&&function(t){if(Z.has(t))return;const e=new Promise((e,n)=>{const r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{e(),r()},i=()=>{n(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});Z.set(t,e)}(t),W(t,X||(X=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction]))?new Proxy(t,rt):t)}function ot(t){if(t instanceof IDBRequest)return function(t){const e=new Promise((e,n)=>{const r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{e(ot(t.result)),r()},i=()=>{n(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(e=>{e instanceof IDBCursor&&Y.set(e,t)}).catch(()=>{}),nt.set(e,t),e}(t);if(et.has(t))return et.get(t);const e=it(t);return e!==t&&(et.set(t,e),nt.set(e,t)),e}const at=t=>nt.get(t);function ct(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(t,e),a=ot(o);return r&&o.addEventListener("upgradeneeded",t=>{r(ot(o.result),t.oldVersion,t.newVersion,ot(o.transaction),t)}),n&&o.addEventListener("blocked",t=>n(t.oldVersion,t.newVersion,t)),a.then(t=>{i&&t.addEventListener("close",()=>i()),s&&t.addEventListener("versionchange",t=>s(t.oldVersion,t.newVersion,t))}).catch(()=>{}),a}const ut=["get","getKey","getAll","getAllKeys","count"],ht=["put","add","delete","clear"],lt=new Map;function dt(t,e){if(!(t instanceof IDBDatabase)||e in t||"string"!=typeof e)return;if(lt.get(e))return lt.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=ht.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!s&&!ut.includes(n))return;const i=async function(t,...e){const i=this.transaction(t,s?"readwrite":"readonly");let o=i.store;return r&&(o=o.index(e.shift())),(await Promise.all([o[n](...e),s&&i.done]))[0]};return lt.set(e,i),i}var ft;ft=rt,rt={...ft,get:(t,e,n)=>dt(t,e)||ft.get(t,e,n),has:(t,e)=>!!dt(t,e)||ft.has(t,e)};
/**
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
             */
class pt{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(function(t){const e=t.getComponent();return"VERSION"===(null==e?void 0:e.type)}(t)){const e=t.getImmediate();return`${e.library}/${e.version}`}return null}).filter(t=>t).join(" ")}}const gt="@firebase/app",mt="0.13.2",yt=new Q("@firebase/app"),vt="@firebase/app-compat",wt="@firebase/analytics-compat",bt="@firebase/analytics",_t="@firebase/app-check-compat",Et="@firebase/app-check",Tt="@firebase/auth",It="@firebase/auth-compat",St="@firebase/database",Ct="@firebase/data-connect",At="@firebase/database-compat",Dt="@firebase/functions",Nt="@firebase/functions-compat",kt="@firebase/installations",Rt="@firebase/installations-compat",Ot="@firebase/messaging",xt="@firebase/messaging-compat",Lt="@firebase/performance",Mt="@firebase/performance-compat",Pt="@firebase/remote-config",Vt="@firebase/remote-config-compat",Ft="@firebase/storage",Ut="@firebase/storage-compat",jt="@firebase/firestore",Bt="@firebase/ai",qt="@firebase/firestore-compat",$t="firebase",zt="[DEFAULT]",Gt={[gt]:"fire-core",[vt]:"fire-core-compat",[bt]:"fire-analytics",[wt]:"fire-analytics-compat",[Et]:"fire-app-check",[_t]:"fire-app-check-compat",[Tt]:"fire-auth",[It]:"fire-auth-compat",[St]:"fire-rtdb",[Ct]:"fire-data-connect",[At]:"fire-rtdb-compat",[Dt]:"fire-fn",[Nt]:"fire-fn-compat",[kt]:"fire-iid",[Rt]:"fire-iid-compat",[Ot]:"fire-fcm",[xt]:"fire-fcm-compat",[Lt]:"fire-perf",[Mt]:"fire-perf-compat",[Pt]:"fire-rc",[Vt]:"fire-rc-compat",[Ft]:"fire-gcs",[Ut]:"fire-gcs-compat",[jt]:"fire-fst",[qt]:"fire-fst-compat",[Bt]:"fire-vertex","fire-js":"fire-js",[$t]:"fire-js-all"},Ht=new Map,Kt=new Map,Qt=new Map;function Wt(t,e){try{t.container.addComponent(e)}catch(n){yt.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Xt(t){const e=t.name;if(Qt.has(e))return yt.debug(`There were multiple attempts to register component ${e}.`),!1;Qt.set(e,t);for(const n of Ht.values())Wt(n,t);for(const n of Kt.values())Wt(n,t);return!0}function Jt(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Yt(t){return null!=t&&void 0!==t.settings}
/**
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
             */const Zt=new k("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."});
/**
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
             */
class te{constructor(t,e,n){this._isDeleted=!1,this._options=Object.assign({},t),this._config=Object.assign({},e),this._name=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new U("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw Zt.create("app-deleted",{appName:this._name})}}
/**
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
             */const ee=t("S","11.10.0");function ne(t,e={}){let n=t;"object"!=typeof e&&(e={name:e});const r=Object.assign({name:zt,automaticDataCollectionEnabled:!0},e),s=r.name;if("string"!=typeof s||!s)throw Zt.create("bad-app-name",{appName:String(s)});if(n||(n=y()),!n)throw Zt.create("no-options");const i=Ht.get(s);if(i){if(L(n,i.options)&&L(r,i.config))return i;throw Zt.create("duplicate-app",{appName:s})}const o=new q(s);for(const c of Qt.values())o.addComponent(c);const a=new te(n,r,o);return Ht.set(s,a),a}function re(t=zt){const e=Ht.get(t);if(!e&&t===zt&&y())return ne();if(!e)throw Zt.create("no-app",{appName:t});return e}function se(t,e,n){var r;let s=null!==(r=Gt[t])&&void 0!==r?r:t;n&&(s+=`-${n}`);const i=s.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const t=[`Unable to register library "${s}" with version "${e}":`];return i&&t.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&t.push("and"),o&&t.push(`version name "${e}" contains illegal characters (whitespace or "/")`),void yt.warn(t.join(" "))}Xt(new U(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}
/**
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
             */const ie="firebase-heartbeat-store";let oe=null;function ae(){return oe||(oe=ct("firebase-heartbeat-database",1,{upgrade:(t,e)=>{if(0===e)try{t.createObjectStore(ie)}catch(n){console.warn(n)}}}).catch(t=>{throw Zt.create("idb-open",{originalErrorMessage:t.message})})),oe}async function ce(t,e){try{const n=(await ae()).transaction(ie,"readwrite"),r=n.objectStore(ie);await r.put(e,ue(t)),await n.done}catch(n){if(n instanceof N)yt.warn(n.message);else{const t=Zt.create("idb-set",{originalErrorMessage:null==n?void 0:n.message});yt.warn(t.message)}}}function ue(t){return`${t.name}!${t.options.appId}`}
/**
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
             */class he{constructor(t){this.container=t,this._heartbeatsCache=null;const e=this.container.getProvider("app").getImmediate();this._storage=new de(e),this._heartbeatsCachePromise=this._storage.read().then(t=>(this._heartbeatsCache=t,t))}async triggerHeartbeat(){var t,e;try{const n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=le();if(null==(null===(t=this._heartbeatsCache)||void 0===t?void 0:t.heartbeats)&&(this._heartbeatsCache=await this._heartbeatsCachePromise,null==(null===(e=this._heartbeatsCache)||void 0===e?void 0:e.heartbeats)))return;if(this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(t=>t.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:n}),this._heartbeatsCache.heartbeats.length>30){const t=function(t){if(0===t.length)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}
/**
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
             */(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(t,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){yt.warn(n)}}async getHeartbeatsHeader(){var t;try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,null==(null===(t=this._heartbeatsCache)||void 0===t?void 0:t.heartbeats)||0===this._heartbeatsCache.heartbeats.length)return"";const e=le(),{heartbeatsToSend:n,unsentEntries:r}=function(t,e=1024){const n=[];let r=t.slice();for(const s of t){const t=n.find(t=>t.agent===s.agent);if(t){if(t.dates.push(s.date),fe(n)>e){t.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),fe(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}(this._heartbeatsCache.heartbeats),s=u(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(e){return yt.warn(e),""}}}function le(){return(new Date).toISOString().substring(0,10)}class de{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!A()&&D().then(()=>!0).catch(()=>!1)}async read(){if(await this._canUseIndexedDBPromise){const t=await async function(t){try{const e=(await ae()).transaction(ie),n=await e.objectStore(ie).get(ue(t));return await e.done,n}catch(e){if(e instanceof N)yt.warn(e.message);else{const t=Zt.create("idb-get",{originalErrorMessage:null==e?void 0:e.message});yt.warn(t.message)}}}(this.app);return(null==t?void 0:t.heartbeats)?t:{heartbeats:[]}}return{heartbeats:[]}}async overwrite(t){var e;if(await this._canUseIndexedDBPromise){const n=await this.read();return ce(this.app,{lastSentHeartbeatDate:null!==(e=t.lastSentHeartbeatDate)&&void 0!==e?e:n.lastSentHeartbeatDate,heartbeats:t.heartbeats})}}async add(t){var e;if(await this._canUseIndexedDBPromise){const n=await this.read();return ce(this.app,{lastSentHeartbeatDate:null!==(e=t.lastSentHeartbeatDate)&&void 0!==e?e:n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...t.heartbeats]})}}}function fe(t){return u(JSON.stringify({version:2,heartbeats:t})).length}var pe;pe="",Xt(new U("platform-logger",t=>new pt(t),"PRIVATE")),Xt(new U("heartbeat",t=>new he(t),"PRIVATE")),se(gt,mt,pe),se(gt,mt,"esm2017"),se("fire-js",""),
/**
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
             */
se("firebase","11.10.0","app");var ge,me,ye="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
            Copyright The Closure Library Authors.
            SPDX-License-Identifier: Apache-2.0
            */(function(){var t;
/** @license

             Copyright The Closure Library Authors.
             SPDX-License-Identifier: Apache-2.0
            */function e(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}function n(t,e,n){n||(n=0);var r=Array(16);if("string"==typeof e)for(var s=0;16>s;++s)r[s]=e.charCodeAt(n++)|e.charCodeAt(n++)<<8|e.charCodeAt(n++)<<16|e.charCodeAt(n++)<<24;else for(s=0;16>s;++s)r[s]=e[n++]|e[n++]<<8|e[n++]<<16|e[n++]<<24;e=t.g[0],n=t.g[1],s=t.g[2];var i=t.g[3],o=e+(i^n&(s^i))+r[0]+3614090360&4294967295;o=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=(n=(s=(i=(e=n+(o<<7&4294967295|o>>>25))+((o=i+(s^e&(n^s))+r[1]+3905402710&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^i&(e^n))+r[2]+606105819&4294967295)<<17&4294967295|o>>>15))+((o=n+(e^s&(i^e))+r[3]+3250441966&4294967295)<<22&4294967295|o>>>10))+((o=e+(i^n&(s^i))+r[4]+4118548399&4294967295)<<7&4294967295|o>>>25))+((o=i+(s^e&(n^s))+r[5]+1200080426&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^i&(e^n))+r[6]+2821735955&4294967295)<<17&4294967295|o>>>15))+((o=n+(e^s&(i^e))+r[7]+4249261313&4294967295)<<22&4294967295|o>>>10))+((o=e+(i^n&(s^i))+r[8]+1770035416&4294967295)<<7&4294967295|o>>>25))+((o=i+(s^e&(n^s))+r[9]+2336552879&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^i&(e^n))+r[10]+4294925233&4294967295)<<17&4294967295|o>>>15))+((o=n+(e^s&(i^e))+r[11]+2304563134&4294967295)<<22&4294967295|o>>>10))+((o=e+(i^n&(s^i))+r[12]+1804603682&4294967295)<<7&4294967295|o>>>25))+((o=i+(s^e&(n^s))+r[13]+4254626195&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^i&(e^n))+r[14]+2792965006&4294967295)<<17&4294967295|o>>>15))+((o=n+(e^s&(i^e))+r[15]+1236535329&4294967295)<<22&4294967295|o>>>10))+((o=e+(s^i&(n^s))+r[1]+4129170786&4294967295)<<5&4294967295|o>>>27))+((o=i+(n^s&(e^n))+r[6]+3225465664&4294967295)<<9&4294967295|o>>>23))+((o=s+(e^n&(i^e))+r[11]+643717713&4294967295)<<14&4294967295|o>>>18))+((o=n+(i^e&(s^i))+r[0]+3921069994&4294967295)<<20&4294967295|o>>>12))+((o=e+(s^i&(n^s))+r[5]+3593408605&4294967295)<<5&4294967295|o>>>27))+((o=i+(n^s&(e^n))+r[10]+38016083&4294967295)<<9&4294967295|o>>>23))+((o=s+(e^n&(i^e))+r[15]+3634488961&4294967295)<<14&4294967295|o>>>18))+((o=n+(i^e&(s^i))+r[4]+3889429448&4294967295)<<20&4294967295|o>>>12))+((o=e+(s^i&(n^s))+r[9]+568446438&4294967295)<<5&4294967295|o>>>27))+((o=i+(n^s&(e^n))+r[14]+3275163606&4294967295)<<9&4294967295|o>>>23))+((o=s+(e^n&(i^e))+r[3]+4107603335&4294967295)<<14&4294967295|o>>>18))+((o=n+(i^e&(s^i))+r[8]+1163531501&4294967295)<<20&4294967295|o>>>12))+((o=e+(s^i&(n^s))+r[13]+2850285829&4294967295)<<5&4294967295|o>>>27))+((o=i+(n^s&(e^n))+r[2]+4243563512&4294967295)<<9&4294967295|o>>>23))+((o=s+(e^n&(i^e))+r[7]+1735328473&4294967295)<<14&4294967295|o>>>18))+((o=n+(i^e&(s^i))+r[12]+2368359562&4294967295)<<20&4294967295|o>>>12))+((o=e+(n^s^i)+r[5]+4294588738&4294967295)<<4&4294967295|o>>>28))+((o=i+(e^n^s)+r[8]+2272392833&4294967295)<<11&4294967295|o>>>21))+((o=s+(i^e^n)+r[11]+1839030562&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^i^e)+r[14]+4259657740&4294967295)<<23&4294967295|o>>>9))+((o=e+(n^s^i)+r[1]+2763975236&4294967295)<<4&4294967295|o>>>28))+((o=i+(e^n^s)+r[4]+1272893353&4294967295)<<11&4294967295|o>>>21))+((o=s+(i^e^n)+r[7]+4139469664&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^i^e)+r[10]+3200236656&4294967295)<<23&4294967295|o>>>9))+((o=e+(n^s^i)+r[13]+681279174&4294967295)<<4&4294967295|o>>>28))+((o=i+(e^n^s)+r[0]+3936430074&4294967295)<<11&4294967295|o>>>21))+((o=s+(i^e^n)+r[3]+3572445317&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^i^e)+r[6]+76029189&4294967295)<<23&4294967295|o>>>9))+((o=e+(n^s^i)+r[9]+3654602809&4294967295)<<4&4294967295|o>>>28))+((o=i+(e^n^s)+r[12]+3873151461&4294967295)<<11&4294967295|o>>>21))+((o=s+(i^e^n)+r[15]+530742520&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^i^e)+r[2]+3299628645&4294967295)<<23&4294967295|o>>>9))+((o=e+(s^(n|~i))+r[0]+4096336452&4294967295)<<6&4294967295|o>>>26))+((o=i+(n^(e|~s))+r[7]+1126891415&4294967295)<<10&4294967295|o>>>22))+((o=s+(e^(i|~n))+r[14]+2878612391&4294967295)<<15&4294967295|o>>>17))+((o=n+(i^(s|~e))+r[5]+4237533241&4294967295)<<21&4294967295|o>>>11))+((o=e+(s^(n|~i))+r[12]+1700485571&4294967295)<<6&4294967295|o>>>26))+((o=i+(n^(e|~s))+r[3]+2399980690&4294967295)<<10&4294967295|o>>>22))+((o=s+(e^(i|~n))+r[10]+4293915773&4294967295)<<15&4294967295|o>>>17))+((o=n+(i^(s|~e))+r[1]+2240044497&4294967295)<<21&4294967295|o>>>11))+((o=e+(s^(n|~i))+r[8]+1873313359&4294967295)<<6&4294967295|o>>>26))+((o=i+(n^(e|~s))+r[15]+4264355552&4294967295)<<10&4294967295|o>>>22))+((o=s+(e^(i|~n))+r[6]+2734768916&4294967295)<<15&4294967295|o>>>17))+((o=n+(i^(s|~e))+r[13]+1309151649&4294967295)<<21&4294967295|o>>>11))+((i=(e=n+((o=e+(s^(n|~i))+r[4]+4149444226&4294967295)<<6&4294967295|o>>>26))+((o=i+(n^(e|~s))+r[11]+3174756917&4294967295)<<10&4294967295|o>>>22))^((s=i+((o=s+(e^(i|~n))+r[2]+718787259&4294967295)<<15&4294967295|o>>>17))|~e))+r[9]+3951481745&4294967295,t.g[0]=t.g[0]+e&4294967295,t.g[1]=t.g[1]+(s+(o<<21&4294967295|o>>>11))&4294967295,t.g[2]=t.g[2]+s&4294967295,t.g[3]=t.g[3]+i&4294967295}function r(t,e){this.h=e;for(var n=[],r=!0,s=t.length-1;0<=s;s--){var i=0|t[s];r&&i==e||(n[s]=i,r=!1)}this.g=n}!function(t,e){function n(){}n.prototype=e.prototype,t.D=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.C=function(t,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return e.prototype[n].apply(t,s)}}(e,function(){this.blockSize=-1}),e.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0},e.prototype.u=function(t,e){void 0===e&&(e=t.length);for(var r=e-this.blockSize,s=this.B,i=this.h,o=0;o<e;){if(0==i)for(;o<=r;)n(this,t,o),o+=this.blockSize;if("string"==typeof t){for(;o<e;)if(s[i++]=t.charCodeAt(o++),i==this.blockSize){n(this,s),i=0;break}}else for(;o<e;)if(s[i++]=t[o++],i==this.blockSize){n(this,s),i=0;break}}this.h=i,this.o+=e},e.prototype.v=function(){var t=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);t[0]=128;for(var e=1;e<t.length-8;++e)t[e]=0;var n=8*this.o;for(e=t.length-8;e<t.length;++e)t[e]=255&n,n/=256;for(this.u(t),t=Array(16),e=n=0;4>e;++e)for(var r=0;32>r;r+=8)t[n++]=this.g[e]>>>r&255;return t};var s={};function i(t){return-128<=t&&128>t?function(t,e){var n=s;return Object.prototype.hasOwnProperty.call(n,t)?n[t]:n[t]=e(t)}(t,function(t){return new r([0|t],0>t?-1:0)}):new r([0|t],0>t?-1:0)}function o(t){if(isNaN(t)||!isFinite(t))return a;if(0>t)return d(o(-t));for(var e=[],n=1,s=0;t>=n;s++)e[s]=t/n|0,n*=4294967296;return new r(e,0)}var a=i(0),c=i(1),u=i(16777216);function h(t){if(0!=t.h)return!1;for(var e=0;e<t.g.length;e++)if(0!=t.g[e])return!1;return!0}function l(t){return-1==t.h}function d(t){for(var e=t.g.length,n=[],s=0;s<e;s++)n[s]=~t.g[s];return new r(n,~t.h).add(c)}function f(t,e){return t.add(d(e))}function p(t,e){for(;(65535&t[e])!=t[e];)t[e+1]+=t[e]>>>16,t[e]&=65535,e++}function g(t,e){this.g=t,this.h=e}function m(t,e){if(h(e))throw Error("division by zero");if(h(t))return new g(a,a);if(l(t))return e=m(d(t),e),new g(d(e.g),d(e.h));if(l(e))return e=m(t,d(e)),new g(d(e.g),e.h);if(30<t.g.length){if(l(t)||l(e))throw Error("slowDivide_ only works with positive integers.");for(var n=c,r=e;0>=r.l(t);)n=y(n),r=y(r);var s=v(n,1),i=v(r,1);for(r=v(r,2),n=v(n,2);!h(r);){var u=i.add(r);0>=u.l(t)&&(s=s.add(n),i=u),r=v(r,1),n=v(n,1)}return e=f(t,s.j(e)),new g(s,e)}for(s=a;0<=t.l(e);){for(n=Math.max(1,Math.floor(t.m()/e.m())),r=48>=(r=Math.ceil(Math.log(n)/Math.LN2))?1:Math.pow(2,r-48),u=(i=o(n)).j(e);l(u)||0<u.l(t);)u=(i=o(n-=r)).j(e);h(i)&&(i=c),s=s.add(i),t=f(t,u)}return new g(s,t)}function y(t){for(var e=t.g.length+1,n=[],s=0;s<e;s++)n[s]=t.i(s)<<1|t.i(s-1)>>>31;return new r(n,t.h)}function v(t,e){var n=e>>5;e%=32;for(var s=t.g.length-n,i=[],o=0;o<s;o++)i[o]=0<e?t.i(o+n)>>>e|t.i(o+n+1)<<32-e:t.i(o+n);return new r(i,t.h)}(t=r.prototype).m=function(){if(l(this))return-d(this).m();for(var t=0,e=1,n=0;n<this.g.length;n++){var r=this.i(n);t+=(0<=r?r:4294967296+r)*e,e*=4294967296}return t},t.toString=function(t){if(2>(t=t||10)||36<t)throw Error("radix out of range: "+t);if(h(this))return"0";if(l(this))return"-"+d(this).toString(t);for(var e=o(Math.pow(t,6)),n=this,r="";;){var s=m(n,e).g,i=((0<(n=f(n,s.j(e))).g.length?n.g[0]:n.h)>>>0).toString(t);if(h(n=s))return i+r;for(;6>i.length;)i="0"+i;r=i+r}},t.i=function(t){return 0>t?0:t<this.g.length?this.g[t]:this.h},t.l=function(t){return l(t=f(this,t))?-1:h(t)?0:1},t.abs=function(){return l(this)?d(this):this},t.add=function(t){for(var e=Math.max(this.g.length,t.g.length),n=[],s=0,i=0;i<=e;i++){var o=s+(65535&this.i(i))+(65535&t.i(i)),a=(o>>>16)+(this.i(i)>>>16)+(t.i(i)>>>16);s=a>>>16,o&=65535,a&=65535,n[i]=a<<16|o}return new r(n,-2147483648&n[n.length-1]?-1:0)},t.j=function(t){if(h(this)||h(t))return a;if(l(this))return l(t)?d(this).j(d(t)):d(d(this).j(t));if(l(t))return d(this.j(d(t)));if(0>this.l(u)&&0>t.l(u))return o(this.m()*t.m());for(var e=this.g.length+t.g.length,n=[],s=0;s<2*e;s++)n[s]=0;for(s=0;s<this.g.length;s++)for(var i=0;i<t.g.length;i++){var c=this.i(s)>>>16,f=65535&this.i(s),g=t.i(i)>>>16,m=65535&t.i(i);n[2*s+2*i]+=f*m,p(n,2*s+2*i),n[2*s+2*i+1]+=c*m,p(n,2*s+2*i+1),n[2*s+2*i+1]+=f*g,p(n,2*s+2*i+1),n[2*s+2*i+2]+=c*g,p(n,2*s+2*i+2)}for(s=0;s<e;s++)n[s]=n[2*s+1]<<16|n[2*s];for(s=e;s<2*e;s++)n[s]=0;return new r(n,0)},t.A=function(t){return m(this,t).h},t.and=function(t){for(var e=Math.max(this.g.length,t.g.length),n=[],s=0;s<e;s++)n[s]=this.i(s)&t.i(s);return new r(n,this.h&t.h)},t.or=function(t){for(var e=Math.max(this.g.length,t.g.length),n=[],s=0;s<e;s++)n[s]=this.i(s)|t.i(s);return new r(n,this.h|t.h)},t.xor=function(t){for(var e=Math.max(this.g.length,t.g.length),n=[],s=0;s<e;s++)n[s]=this.i(s)^t.i(s);return new r(n,this.h^t.h)},e.prototype.digest=e.prototype.v,e.prototype.reset=e.prototype.s,e.prototype.update=e.prototype.u,me=e,r.prototype.add=r.prototype.add,r.prototype.multiply=r.prototype.j,r.prototype.modulo=r.prototype.A,r.prototype.compare=r.prototype.l,r.prototype.toNumber=r.prototype.m,r.prototype.toString=r.prototype.toString,r.prototype.getBits=r.prototype.i,r.fromNumber=o,r.fromString=function t(e,n){if(0==e.length)throw Error("number format error: empty string");if(2>(n=n||10)||36<n)throw Error("radix out of range: "+n);if("-"==e.charAt(0))return d(t(e.substring(1),n));if(0<=e.indexOf("-"))throw Error('number format error: interior "-" character');for(var r=o(Math.pow(n,8)),s=a,i=0;i<e.length;i+=8){var c=Math.min(8,e.length-i),u=parseInt(e.substring(i,i+c),n);8>c?(c=o(Math.pow(n,c)),s=s.j(c).add(o(u))):s=(s=s.j(r)).add(o(u))}return s},ge=r}).apply(void 0!==ye?ye:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});var ve,we,be,_e,Ee,Te,Ie,Se,Ce="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
            Copyright The Closure Library Authors.
            SPDX-License-Identifier: Apache-2.0
            */(function(){var t,e="function"==typeof Object.defineProperties?Object.defineProperty:function(t,e,n){return t==Array.prototype||t==Object.prototype||(t[e]=n.value),t},n=function(t){t=["object"==typeof globalThis&&globalThis,t,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof Ce&&Ce];for(var e=0;e<t.length;++e){var n=t[e];if(n&&n.Math==Math)return n}throw Error("Cannot find global object")}(this);!function(t,r){if(r)t:{var s=n;t=t.split(".");for(var i=0;i<t.length-1;i++){var o=t[i];if(!(o in s))break t;s=s[o]}(r=r(i=s[t=t[t.length-1]]))!=i&&null!=r&&e(s,t,{configurable:!0,writable:!0,value:r})}}("Array.prototype.values",function(t){return t||function(){return function(t,e){t instanceof String&&(t+="");var n=0,r=!1,s={next:function(){if(!r&&n<t.length){var s=n++;return{value:e(s,t[s]),done:!1}}return r=!0,{done:!0,value:void 0}}};return s[Symbol.iterator]=function(){return s},s}(this,function(t,e){return e})}});
/** @license

             Copyright The Closure Library Authors.
             SPDX-License-Identifier: Apache-2.0
            */
var r=r||{},s=this||self;function i(t){var e=typeof t;return"array"==(e="object"!=e?e:t?Array.isArray(t)?"array":e:"null")||"object"==e&&"number"==typeof t.length}function o(t){var e=typeof t;return"object"==e&&null!=t||"function"==e}function a(t,e,n){return t.call.apply(t.bind,arguments)}function c(t,e,n){if(!t)throw Error();if(2<arguments.length){var r=Array.prototype.slice.call(arguments,2);return function(){var n=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(n,r),t.apply(e,n)}}return function(){return t.apply(e,arguments)}}function u(t,e,n){return(u=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?a:c).apply(null,arguments)}function h(t,e){var n=Array.prototype.slice.call(arguments,1);return function(){var e=n.slice();return e.push.apply(e,arguments),t.apply(this,e)}}function l(t,e){function n(){}n.prototype=e.prototype,t.aa=e.prototype,t.prototype=new n,t.prototype.constructor=t,t.Qb=function(t,n,r){for(var s=Array(arguments.length-2),i=2;i<arguments.length;i++)s[i-2]=arguments[i];return e.prototype[n].apply(t,s)}}function d(t){const e=t.length;if(0<e){const n=Array(e);for(let r=0;r<e;r++)n[r]=t[r];return n}return[]}function f(t,e){for(let n=1;n<arguments.length;n++){const e=arguments[n];if(i(e)){const n=t.length||0,r=e.length||0;t.length=n+r;for(let s=0;s<r;s++)t[n+s]=e[s]}else t.push(e)}}function p(t){return/^[\s\xa0]*$/.test(t)}function g(){var t=s.navigator;return t&&(t=t.userAgent)?t:""}function m(t){return m[" "](t),t}m[" "]=function(){};var y=!(-1==g().indexOf("Gecko")||-1!=g().toLowerCase().indexOf("webkit")&&-1==g().indexOf("Edge")||-1!=g().indexOf("Trident")||-1!=g().indexOf("MSIE")||-1!=g().indexOf("Edge"));function v(t,e,n){for(const r in t)e.call(n,t[r],r,t)}function w(t){const e={};for(const n in t)e[n]=t[n];return e}const b="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function _(t,e){let n,r;for(let s=1;s<arguments.length;s++){for(n in r=arguments[s],r)t[n]=r[n];for(let e=0;e<b.length;e++)n=b[e],Object.prototype.hasOwnProperty.call(r,n)&&(t[n]=r[n])}}function E(t){var e=1;t=t.split(":");const n=[];for(;0<e&&t.length;)n.push(t.shift()),e--;return t.length&&n.push(t.join(":")),n}function T(t){s.setTimeout(()=>{throw t},0)}function I(){var t=N;let e=null;return t.g&&(e=t.g,t.g=t.g.next,t.g||(t.h=null),e.next=null),e}var S=new class{constructor(t,e){this.i=t,this.j=e,this.h=0,this.g=null}get(){let t;return 0<this.h?(this.h--,t=this.g,this.g=t.next,t.next=null):t=this.i(),t}}(()=>new C,t=>t.reset());class C{constructor(){this.next=this.g=this.h=null}set(t,e){this.h=t,this.g=e,this.next=null}reset(){this.next=this.g=this.h=null}}let A,D=!1,N=new class{constructor(){this.h=this.g=null}add(t,e){const n=S.get();n.set(t,e),this.h?this.h.next=n:this.g=n,this.h=n}},k=()=>{const t=s.Promise.resolve(void 0);A=()=>{t.then(R)}};var R=()=>{for(var t;t=I();){try{t.h.call(t.g)}catch(n){T(n)}var e=S;e.j(t),100>e.h&&(e.h++,t.next=e.g,e.g=t)}D=!1};function O(){this.s=this.s,this.C=this.C}function x(t,e){this.type=t,this.g=this.target=e,this.defaultPrevented=!1}O.prototype.s=!1,O.prototype.ma=function(){this.s||(this.s=!0,this.N())},O.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()},x.prototype.h=function(){this.defaultPrevented=!0};var L=function(){if(!s.addEventListener||!Object.defineProperty)return!1;var t=!1,e=Object.defineProperty({},"passive",{get:function(){t=!0}});try{const t=()=>{};s.addEventListener("test",t,e),s.removeEventListener("test",t,e)}catch(n){}return t}();function M(t,e){if(x.call(this,t?t.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,t){var n=this.type=t.type,r=t.changedTouches&&t.changedTouches.length?t.changedTouches[0]:null;if(this.target=t.target||t.srcElement,this.g=e,e=t.relatedTarget){if(y){t:{try{m(e.nodeName);var s=!0;break t}catch(i){}s=!1}s||(e=null)}}else"mouseover"==n?e=t.fromElement:"mouseout"==n&&(e=t.toElement);this.relatedTarget=e,r?(this.clientX=void 0!==r.clientX?r.clientX:r.pageX,this.clientY=void 0!==r.clientY?r.clientY:r.pageY,this.screenX=r.screenX||0,this.screenY=r.screenY||0):(this.clientX=void 0!==t.clientX?t.clientX:t.pageX,this.clientY=void 0!==t.clientY?t.clientY:t.pageY,this.screenX=t.screenX||0,this.screenY=t.screenY||0),this.button=t.button,this.key=t.key||"",this.ctrlKey=t.ctrlKey,this.altKey=t.altKey,this.shiftKey=t.shiftKey,this.metaKey=t.metaKey,this.pointerId=t.pointerId||0,this.pointerType="string"==typeof t.pointerType?t.pointerType:P[t.pointerType]||"",this.state=t.state,this.i=t,t.defaultPrevented&&M.aa.h.call(this)}}l(M,x);var P={2:"touch",3:"pen",4:"mouse"};M.prototype.h=function(){M.aa.h.call(this);var t=this.i;t.preventDefault?t.preventDefault():t.returnValue=!1};var V="closure_listenable_"+(1e6*Math.random()|0),F=0;function U(t,e,n,r,s){this.listener=t,this.proxy=null,this.src=e,this.type=n,this.capture=!!r,this.ha=s,this.key=++F,this.da=this.fa=!1}function j(t){t.da=!0,t.listener=null,t.proxy=null,t.src=null,t.ha=null}function B(t){this.src=t,this.g={},this.h=0}function q(t,e){var n=e.type;if(n in t.g){var r,s=t.g[n],i=Array.prototype.indexOf.call(s,e,void 0);(r=0<=i)&&Array.prototype.splice.call(s,i,1),r&&(j(e),0==t.g[n].length&&(delete t.g[n],t.h--))}}function $(t,e,n,r){for(var s=0;s<t.length;++s){var i=t[s];if(!i.da&&i.listener==e&&i.capture==!!n&&i.ha==r)return s}return-1}B.prototype.add=function(t,e,n,r,s){var i=t.toString();(t=this.g[i])||(t=this.g[i]=[],this.h++);var o=$(t,e,r,s);return-1<o?(e=t[o],n||(e.fa=!1)):((e=new U(e,this.src,i,!!r,s)).fa=n,t.push(e)),e};var z="closure_lm_"+(1e6*Math.random()|0),G={};function H(t,e,n,r,s){if(Array.isArray(e)){for(var i=0;i<e.length;i++)H(t,e[i],n,r,s);return null}return n=Z(n),t&&t[V]?t.K(e,n,!!o(r)&&!!r.capture,s):function(t,e,n,r,s,i){if(!e)throw Error("Invalid event type");var a=o(s)?!!s.capture:!!s,c=J(t);if(c||(t[z]=c=new B(t)),(n=c.add(e,n,r,a,i)).proxy)return n;if(r=function(){function t(n){return e.call(t.src,t.listener,n)}const e=X;return t}(),n.proxy=r,r.src=t,r.listener=n,t.addEventListener)L||(s=a),void 0===s&&(s=!1),t.addEventListener(e.toString(),r,s);else if(t.attachEvent)t.attachEvent(W(e.toString()),r);else{if(!t.addListener||!t.removeListener)throw Error("addEventListener and attachEvent are unavailable.");t.addListener(r)}return n}(t,e,n,!1,r,s)}function K(t,e,n,r,s){if(Array.isArray(e))for(var i=0;i<e.length;i++)K(t,e[i],n,r,s);else r=o(r)?!!r.capture:!!r,n=Z(n),t&&t[V]?(t=t.i,(e=String(e).toString())in t.g&&-1<(n=$(i=t.g[e],n,r,s))&&(j(i[n]),Array.prototype.splice.call(i,n,1),0==i.length&&(delete t.g[e],t.h--))):t&&(t=J(t))&&(e=t.g[e.toString()],t=-1,e&&(t=$(e,n,r,s)),(n=-1<t?e[t]:null)&&Q(n))}function Q(t){if("number"!=typeof t&&t&&!t.da){var e=t.src;if(e&&e[V])q(e.i,t);else{var n=t.type,r=t.proxy;e.removeEventListener?e.removeEventListener(n,r,t.capture):e.detachEvent?e.detachEvent(W(n),r):e.addListener&&e.removeListener&&e.removeListener(r),(n=J(e))?(q(n,t),0==n.h&&(n.src=null,e[z]=null)):j(t)}}}function W(t){return t in G?G[t]:G[t]="on"+t}function X(t,e){if(t.da)t=!0;else{e=new M(e,this);var n=t.listener,r=t.ha||t.src;t.fa&&Q(t),t=n.call(r,e)}return t}function J(t){return(t=t[z])instanceof B?t:null}var Y="__closure_events_fn_"+(1e9*Math.random()>>>0);function Z(t){return"function"==typeof t?t:(t[Y]||(t[Y]=function(e){return t.handleEvent(e)}),t[Y])}function tt(){O.call(this),this.i=new B(this),this.M=this,this.F=null}function et(t,e){var n,r=t.F;if(r)for(n=[];r;r=r.F)n.push(r);if(t=t.M,r=e.type||e,"string"==typeof e)e=new x(e,t);else if(e instanceof x)e.target=e.target||t;else{var s=e;_(e=new x(r,t),s)}if(s=!0,n)for(var i=n.length-1;0<=i;i--){var o=e.g=n[i];s=nt(o,r,!0,e)&&s}if(s=nt(o=e.g=t,r,!0,e)&&s,s=nt(o,r,!1,e)&&s,n)for(i=0;i<n.length;i++)s=nt(o=e.g=n[i],r,!1,e)&&s}function nt(t,e,n,r){if(!(e=t.i.g[String(e)]))return!0;e=e.concat();for(var s=!0,i=0;i<e.length;++i){var o=e[i];if(o&&!o.da&&o.capture==n){var a=o.listener,c=o.ha||o.src;o.fa&&q(t.i,o),s=!1!==a.call(c,r)&&s}}return s&&!r.defaultPrevented}function rt(t,e,n){if("function"==typeof t)n&&(t=u(t,n));else{if(!t||"function"!=typeof t.handleEvent)throw Error("Invalid listener argument");t=u(t.handleEvent,t)}return 2147483647<Number(e)?-1:s.setTimeout(t,e||0)}function st(t){t.g=rt(()=>{t.g=null,t.i&&(t.i=!1,st(t))},t.l);const e=t.h;t.h=null,t.m.apply(null,e)}l(tt,O),tt.prototype[V]=!0,tt.prototype.removeEventListener=function(t,e,n,r){K(this,t,e,n,r)},tt.prototype.N=function(){if(tt.aa.N.call(this),this.i){var t,e=this.i;for(t in e.g){for(var n=e.g[t],r=0;r<n.length;r++)j(n[r]);delete e.g[t],e.h--}}this.F=null},tt.prototype.K=function(t,e,n,r){return this.i.add(String(t),e,!1,n,r)},tt.prototype.L=function(t,e,n,r){return this.i.add(String(t),e,!0,n,r)};class it extends O{constructor(t,e){super(),this.m=t,this.l=e,this.h=null,this.i=!1,this.g=null}j(t){this.h=arguments,this.g?this.i=!0:st(this)}N(){super.N(),this.g&&(s.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ot(t){O.call(this),this.h=t,this.g={}}l(ot,O);var at=[];function ct(t){v(t.g,function(t,e){this.g.hasOwnProperty(e)&&Q(t)},t),t.g={}}ot.prototype.N=function(){ot.aa.N.call(this),ct(this)},ot.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ut=s.JSON.stringify,ht=s.JSON.parse,lt=class{stringify(t){return s.JSON.stringify(t,void 0)}parse(t){return s.JSON.parse(t,void 0)}};function dt(){}function ft(t){return t.h||(t.h=t.i())}function pt(){}dt.prototype.h=null;var gt={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function mt(){x.call(this,"d")}function yt(){x.call(this,"c")}l(mt,x),l(yt,x);var vt={},wt=null;function bt(){return wt=wt||new tt}function _t(t){x.call(this,vt.La,t)}function Et(t){const e=bt();et(e,new _t(e))}function Tt(t,e){x.call(this,vt.STAT_EVENT,t),this.stat=e}function It(t){const e=bt();et(e,new Tt(e,t))}function St(t,e){x.call(this,vt.Ma,t),this.size=e}function Ct(t,e){if("function"!=typeof t)throw Error("Fn must not be null and must be a function");return s.setTimeout(function(){t()},e)}function At(){this.g=!0}function Dt(t,e,n,r){t.info(function(){return"XMLHTTP TEXT ("+e+"): "+function(t,e){if(!t.g)return e;if(!e)return null;try{var n=JSON.parse(e);if(n)for(t=0;t<n.length;t++)if(Array.isArray(n[t])){var r=n[t];if(!(2>r.length)){var s=r[1];if(Array.isArray(s)&&!(1>s.length)){var i=s[0];if("noop"!=i&&"stop"!=i&&"close"!=i)for(var o=1;o<s.length;o++)s[o]=""}}}return ut(n)}catch(a){return e}}(t,n)+(r?" "+r:"")})}vt.La="serverreachability",l(_t,x),vt.STAT_EVENT="statevent",l(Tt,x),vt.Ma="timingevent",l(St,x),At.prototype.xa=function(){this.g=!1},At.prototype.info=function(){};var Nt,kt={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Rt={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"};function Ot(){}function xt(t,e,n,r){this.j=t,this.i=e,this.l=n,this.R=r||1,this.U=new ot(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Lt}function Lt(){this.i=null,this.g="",this.h=!1}l(Ot,dt),Ot.prototype.g=function(){return new XMLHttpRequest},Ot.prototype.i=function(){return{}},Nt=new Ot;var Mt={},Pt={};function Vt(t,e,n){t.L=1,t.v=ue(se(e)),t.m=n,t.P=!0,Ft(t,null)}function Ft(t,e){t.F=Date.now(),Bt(t),t.A=se(t.v);var n=t.A,r=t.R;Array.isArray(r)||(r=[String(r)]),Oe(n.i,"t",r),t.C=0,n=t.j.J,t.h=new Lt,t.g=bn(t.j,n?e:null,!t.m),0<t.O&&(t.M=new it(u(t.Y,t,t.g),t.O)),e=t.U,n=t.g,r=t.ca;var s="readystatechange";Array.isArray(s)||(s&&(at[0]=s.toString()),s=at);for(var i=0;i<s.length;i++){var o=H(n,s[i],r||e.handleEvent,!1,e.h||e);if(!o)break;e.g[o.key]=o}e=t.H?w(t.H):{},t.m?(t.u||(t.u="POST"),e["Content-Type"]="application/x-www-form-urlencoded",t.g.ea(t.A,t.u,t.m,e)):(t.u="GET",t.g.ea(t.A,t.u,null,e)),Et(),function(t,e,n,r,s,i){t.info(function(){if(t.g)if(i)for(var o="",a=i.split("&"),c=0;c<a.length;c++){var u=a[c].split("=");if(1<u.length){var h=u[0];u=u[1];var l=h.split("_");o=2<=l.length&&"type"==l[1]?o+(h+"=")+u+"&":o+(h+"=redacted&")}}else o=null;else o=i;return"XMLHTTP REQ ("+r+") [attempt "+s+"]: "+e+"\n"+n+"\n"+o})}(t.i,t.u,t.A,t.l,t.R,t.m)}function Ut(t){return!!t.g&&"GET"==t.u&&2!=t.L&&t.j.Ca}function jt(t,e){var n=t.C,r=e.indexOf("\n",n);return-1==r?Pt:(n=Number(e.substring(n,r)),isNaN(n)?Mt:(r+=1)+n>e.length?Pt:(e=e.slice(r,r+n),t.C=r+n,e))}function Bt(t){t.S=Date.now()+t.I,qt(t,t.I)}function qt(t,e){if(null!=t.B)throw Error("WatchDog timer not null");t.B=Ct(u(t.ba,t),e)}function $t(t){t.B&&(s.clearTimeout(t.B),t.B=null)}function zt(t){0==t.j.G||t.J||gn(t.j,t)}function Gt(t){$t(t);var e=t.M;e&&"function"==typeof e.ma&&e.ma(),t.M=null,ct(t.U),t.g&&(e=t.g,t.g=null,e.abort(),e.ma())}function Ht(t,e){try{var n=t.j;if(0!=n.G&&(n.g==t||Jt(n.h,t)))if(!t.K&&Jt(n.h,t)&&3==n.G){try{var r=n.Da.g.parse(e)}catch(h){r=null}if(Array.isArray(r)&&3==r.length){var s=r;if(0==s[0]){t:if(!n.u){if(n.g){if(!(n.g.F+3e3<t.F))break t;pn(n),rn(n)}ln(n),It(18)}}else n.za=s[1],0<n.za-n.T&&37500>s[2]&&n.F&&0==n.v&&!n.C&&(n.C=Ct(u(n.Za,n),6e3));if(1>=Xt(n.h)&&n.ca){try{n.ca()}catch(h){}n.ca=void 0}}else yn(n,11)}else if((t.K||n.g==t)&&pn(n),!p(e))for(s=n.Da.g.parse(e),e=0;e<s.length;e++){let u=s[e];if(n.T=u[0],u=u[1],2==n.G)if("c"==u[0]){n.K=u[1],n.ia=u[2];const e=u[3];null!=e&&(n.la=e,n.j.info("VER="+n.la));const s=u[4];null!=s&&(n.Aa=s,n.j.info("SVER="+n.Aa));const h=u[5];null!=h&&"number"==typeof h&&0<h&&(r=1.5*h,n.L=r,n.j.info("backChannelRequestTimeoutMs_="+r)),r=n;const l=t.g;if(l){const t=l.g?l.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(t){var i=r.h;i.g||-1==t.indexOf("spdy")&&-1==t.indexOf("quic")&&-1==t.indexOf("h2")||(i.j=i.l,i.g=new Set,i.h&&(Yt(i,i.h),i.h=null))}if(r.D){const t=l.g?l.g.getResponseHeader("X-HTTP-Session-Id"):null;t&&(r.ya=t,ce(r.I,r.D,t))}}n.G=3,n.l&&n.l.ua(),n.ba&&(n.R=Date.now()-t.F,n.j.info("Handshake RTT: "+n.R+"ms"));var o=t;if((r=n).qa=wn(r,r.J?r.ia:null,r.W),o.K){Zt(r.h,o);var a=o,c=r.L;c&&(a.I=c),a.B&&($t(a),Bt(a)),r.g=o}else hn(r);0<n.i.length&&on(n)}else"stop"!=u[0]&&"close"!=u[0]||yn(n,7);else 3==n.G&&("stop"==u[0]||"close"==u[0]?"stop"==u[0]?yn(n,7):nn(n):"noop"!=u[0]&&n.l&&n.l.ta(u),n.v=0)}Et()}catch(h){}}xt.prototype.ca=function(t){t=t.target;const e=this.M;e&&3==Ye(t)?e.j():this.Y(t)},xt.prototype.Y=function(t){try{if(t==this.g)t:{const d=Ye(this.g);var e=this.g.Ba();if(this.g.Z(),!(3>d)&&(3!=d||this.g&&(this.h.h||this.g.oa()||Ze(this.g)))){this.J||4!=d||7==e||Et(),$t(this);var n=this.g.Z();this.X=n;e:if(Ut(this)){var r=Ze(this.g);t="";var i=r.length,o=4==Ye(this.g);if(!this.h.i){if("undefined"==typeof TextDecoder){Gt(this),zt(this);var a="";break e}this.h.i=new s.TextDecoder}for(e=0;e<i;e++)this.h.h=!0,t+=this.h.i.decode(r[e],{stream:!(o&&e==i-1)});r.length=0,this.h.g+=t,this.C=0,a=this.h.g}else a=this.g.oa();if(this.o=200==n,function(t,e,n,r,s,i,o){t.info(function(){return"XMLHTTP RESP ("+r+") [ attempt "+s+"]: "+e+"\n"+n+"\n"+i+" "+o})}(this.i,this.u,this.A,this.l,this.R,d,n),this.o){if(this.T&&!this.K){e:{if(this.g){var c,u=this.g;if((c=u.g?u.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!p(c)){var h=c;break e}}h=null}if(!(n=h)){this.o=!1,this.s=3,It(12),Gt(this),zt(this);break t}Dt(this.i,this.l,n,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Ht(this,n)}if(this.P){let t;for(n=!0;!this.J&&this.C<a.length;){if(t=jt(this,a),t==Pt){4==d&&(this.s=4,It(14),n=!1),Dt(this.i,this.l,null,"[Incomplete Response]");break}if(t==Mt){this.s=4,It(15),Dt(this.i,this.l,a,"[Invalid Chunk]"),n=!1;break}Dt(this.i,this.l,t,null),Ht(this,t)}if(Ut(this)&&0!=this.C&&(this.h.g=this.h.g.slice(this.C),this.C=0),4!=d||0!=a.length||this.h.h||(this.s=1,It(16),n=!1),this.o=this.o&&n,n){if(0<a.length&&!this.W){this.W=!0;var l=this.j;l.g==this&&l.ba&&!l.M&&(l.j.info("Great, no buffering proxy detected. Bytes received: "+a.length),dn(l),l.M=!0,It(11))}}else Dt(this.i,this.l,a,"[Invalid Chunked Response]"),Gt(this),zt(this)}else Dt(this.i,this.l,a,null),Ht(this,a);4==d&&Gt(this),this.o&&!this.J&&(4==d?gn(this.j,this):(this.o=!1,Bt(this)))}else(function(t){const e={};t=(t.g&&2<=Ye(t)&&t.g.getAllResponseHeaders()||"").split("\r\n");for(let r=0;r<t.length;r++){if(p(t[r]))continue;var n=E(t[r]);const s=n[0];if("string"!=typeof(n=n[1]))continue;n=n.trim();const i=e[s]||[];e[s]=i,i.push(n)}!function(t,e){for(const n in t)e.call(void 0,t[n],n,t)}(e,function(t){return t.join(", ")})})(this.g),400==n&&0<a.indexOf("Unknown SID")?(this.s=3,It(12)):(this.s=0,It(13)),Gt(this),zt(this)}}}catch(d){}},xt.prototype.cancel=function(){this.J=!0,Gt(this)},xt.prototype.ba=function(){this.B=null;const t=Date.now();0<=t-this.S?(function(t,e){t.info(function(){return"TIMEOUT: "+e})}(this.i,this.A),2!=this.L&&(Et(),It(17)),Gt(this),this.s=2,zt(this)):qt(this,this.S-t)};var Kt=class{constructor(t,e){this.g=t,this.map=e}};function Qt(t){this.l=t||10,t=s.PerformanceNavigationTiming?0<(t=s.performance.getEntriesByType("navigation")).length&&("hq"==t[0].nextHopProtocol||"h2"==t[0].nextHopProtocol):!!(s.chrome&&s.chrome.loadTimes&&s.chrome.loadTimes()&&s.chrome.loadTimes().wasFetchedViaSpdy),this.j=t?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Wt(t){return!!t.h||!!t.g&&t.g.size>=t.j}function Xt(t){return t.h?1:t.g?t.g.size:0}function Jt(t,e){return t.h?t.h==e:!!t.g&&t.g.has(e)}function Yt(t,e){t.g?t.g.add(e):t.h=e}function Zt(t,e){t.h&&t.h==e?t.h=null:t.g&&t.g.has(e)&&t.g.delete(e)}function te(t){if(null!=t.h)return t.i.concat(t.h.D);if(null!=t.g&&0!==t.g.size){let e=t.i;for(const n of t.g.values())e=e.concat(n.D);return e}return d(t.i)}function ee(t,e){if(t.forEach&&"function"==typeof t.forEach)t.forEach(e,void 0);else if(i(t)||"string"==typeof t)Array.prototype.forEach.call(t,e,void 0);else for(var n=function(t){if(t.na&&"function"==typeof t.na)return t.na();if(!t.V||"function"!=typeof t.V){if("undefined"!=typeof Map&&t instanceof Map)return Array.from(t.keys());if(!("undefined"!=typeof Set&&t instanceof Set)){if(i(t)||"string"==typeof t){var e=[];t=t.length;for(var n=0;n<t;n++)e.push(n);return e}e=[],n=0;for(const r in t)e[n++]=r;return e}}}(t),r=function(t){if(t.V&&"function"==typeof t.V)return t.V();if("undefined"!=typeof Map&&t instanceof Map||"undefined"!=typeof Set&&t instanceof Set)return Array.from(t.values());if("string"==typeof t)return t.split("");if(i(t)){for(var e=[],n=t.length,r=0;r<n;r++)e.push(t[r]);return e}for(r in e=[],n=0,t)e[n++]=t[r];return e}(t),s=r.length,o=0;o<s;o++)e.call(void 0,r[o],n&&n[o],t)}Qt.prototype.cancel=function(){if(this.i=te(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const t of this.g.values())t.cancel();this.g.clear()}};var ne=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function re(t){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,t instanceof re){this.h=t.h,ie(this,t.j),this.o=t.o,this.g=t.g,oe(this,t.s),this.l=t.l;var e=t.i,n=new De;n.i=e.i,e.g&&(n.g=new Map(e.g),n.h=e.h),ae(this,n),this.m=t.m}else t&&(e=String(t).match(ne))?(this.h=!1,ie(this,e[1]||"",!0),this.o=he(e[2]||""),this.g=he(e[3]||"",!0),oe(this,e[4]),this.l=he(e[5]||"",!0),ae(this,e[6]||"",!0),this.m=he(e[7]||"")):(this.h=!1,this.i=new De(null,this.h))}function se(t){return new re(t)}function ie(t,e,n){t.j=n?he(e,!0):e,t.j&&(t.j=t.j.replace(/:$/,""))}function oe(t,e){if(e){if(e=Number(e),isNaN(e)||0>e)throw Error("Bad port number "+e);t.s=e}else t.s=null}function ae(t,e,n){e instanceof De?(t.i=e,function(t,e){e&&!t.j&&(Ne(t),t.i=null,t.g.forEach(function(t,e){var n=e.toLowerCase();e!=n&&(ke(this,e),Oe(this,n,t))},t)),t.j=e}(t.i,t.h)):(n||(e=le(e,ye)),t.i=new De(e,t.h))}function ce(t,e,n){t.i.set(e,n)}function ue(t){return ce(t,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),t}function he(t,e){return t?e?decodeURI(t.replace(/%25/g,"%2525")):decodeURIComponent(t):""}function le(t,e,n){return"string"==typeof t?(t=encodeURI(t).replace(e,de),n&&(t=t.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),t):null}function de(t){return"%"+((t=t.charCodeAt(0))>>4&15).toString(16)+(15&t).toString(16)}re.prototype.toString=function(){var t=[],e=this.j;e&&t.push(le(e,pe,!0),":");var n=this.g;return(n||"file"==e)&&(t.push("//"),(e=this.o)&&t.push(le(e,pe,!0),"@"),t.push(encodeURIComponent(String(n)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),null!=(n=this.s)&&t.push(":",String(n))),(n=this.l)&&(this.g&&"/"!=n.charAt(0)&&t.push("/"),t.push(le(n,"/"==n.charAt(0)?me:ge,!0))),(n=this.i.toString())&&t.push("?",n),(n=this.m)&&t.push("#",le(n,Ae)),t.join("")};var fe,pe=/[#\/\?@]/g,ge=/[#\?:]/g,me=/[#\?]/g,ye=/[#\?@]/g,Ae=/#/g;function De(t,e){this.h=this.g=null,this.i=t||null,this.j=!!e}function Ne(t){t.g||(t.g=new Map,t.h=0,t.i&&function(t,e){if(t){t=t.split("&");for(var n=0;n<t.length;n++){var r=t[n].indexOf("="),s=null;if(0<=r){var i=t[n].substring(0,r);s=t[n].substring(r+1)}else i=t[n];e(i,s?decodeURIComponent(s.replace(/\+/g," ")):"")}}}(t.i,function(e,n){t.add(decodeURIComponent(e.replace(/\+/g," ")),n)}))}function ke(t,e){Ne(t),e=xe(t,e),t.g.has(e)&&(t.i=null,t.h-=t.g.get(e).length,t.g.delete(e))}function Re(t,e){return Ne(t),e=xe(t,e),t.g.has(e)}function Oe(t,e,n){ke(t,e),0<n.length&&(t.i=null,t.g.set(xe(t,e),d(n)),t.h+=n.length)}function xe(t,e){return e=String(e),t.j&&(e=e.toLowerCase()),e}function Le(t,e,n,r,s){try{s&&(s.onload=null,s.onerror=null,s.onabort=null,s.ontimeout=null),r(n)}catch(i){}}function Me(){this.g=new lt}function Pe(t,e,n){const r=n||"";try{ee(t,function(t,n){let s=t;o(t)&&(s=ut(t)),e.push(r+n+"="+encodeURIComponent(s))})}catch(s){throw e.push(r+"type="+encodeURIComponent("_badmap")),s}}function Ve(t){this.l=t.Ub||null,this.j=t.eb||!1}function Fe(t,e){tt.call(this),this.D=t,this.o=e,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}function Ue(t){t.j.read().then(t.Pa.bind(t)).catch(t.ga.bind(t))}function je(t){t.readyState=4,t.l=null,t.j=null,t.v=null,Be(t)}function Be(t){t.onreadystatechange&&t.onreadystatechange.call(t)}function qe(t){let e="";return v(t,function(t,n){e+=n,e+=":",e+=t,e+="\r\n"}),e}function $e(t,e,n){t:{for(r in n){var r=!1;break t}r=!0}r||(n=qe(n),"string"==typeof t?null!=n&&encodeURIComponent(String(n)):ce(t,e,n))}function ze(t){tt.call(this),this.headers=new Map,this.o=t||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}(t=De.prototype).add=function(t,e){Ne(this),this.i=null,t=xe(this,t);var n=this.g.get(t);return n||this.g.set(t,n=[]),n.push(e),this.h+=1,this},t.forEach=function(t,e){Ne(this),this.g.forEach(function(n,r){n.forEach(function(n){t.call(e,n,r,this)},this)},this)},t.na=function(){Ne(this);const t=Array.from(this.g.values()),e=Array.from(this.g.keys()),n=[];for(let r=0;r<e.length;r++){const s=t[r];for(let t=0;t<s.length;t++)n.push(e[r])}return n},t.V=function(t){Ne(this);let e=[];if("string"==typeof t)Re(this,t)&&(e=e.concat(this.g.get(xe(this,t))));else{t=Array.from(this.g.values());for(let n=0;n<t.length;n++)e=e.concat(t[n])}return e},t.set=function(t,e){return Ne(this),this.i=null,Re(this,t=xe(this,t))&&(this.h-=this.g.get(t).length),this.g.set(t,[e]),this.h+=1,this},t.get=function(t,e){return t&&0<(t=this.V(t)).length?String(t[0]):e},t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const t=[],e=Array.from(this.g.keys());for(var n=0;n<e.length;n++){var r=e[n];const i=encodeURIComponent(String(r)),o=this.V(r);for(r=0;r<o.length;r++){var s=i;""!==o[r]&&(s+="="+encodeURIComponent(String(o[r]))),t.push(s)}}return this.i=t.join("&")},l(Ve,dt),Ve.prototype.g=function(){return new Fe(this.l,this.j)},Ve.prototype.i=(fe={},function(){return fe}),l(Fe,tt),(t=Fe.prototype).open=function(t,e){if(0!=this.readyState)throw this.abort(),Error("Error reopening a connection");this.B=t,this.A=e,this.readyState=1,Be(this)},t.send=function(t){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.g=!0;const e={headers:this.u,method:this.B,credentials:this.m,cache:void 0};t&&(e.body=t),(this.D||s).fetch(new Request(this.A,e)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&4!=this.readyState&&(this.g=!1,je(this)),this.readyState=0},t.Sa=function(t){if(this.g&&(this.l=t,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=t.headers,this.readyState=2,Be(this)),this.g&&(this.readyState=3,Be(this),this.g)))if("arraybuffer"===this.responseType)t.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(void 0!==s.ReadableStream&&"body"in t){if(this.j=t.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Ue(this)}else t.text().then(this.Ra.bind(this),this.ga.bind(this))},t.Pa=function(t){if(this.g){if(this.o&&t.value)this.response.push(t.value);else if(!this.o){var e=t.value?t.value:new Uint8Array(0);(e=this.v.decode(e,{stream:!t.done}))&&(this.response=this.responseText+=e)}t.done?je(this):Be(this),3==this.readyState&&Ue(this)}},t.Ra=function(t){this.g&&(this.response=this.responseText=t,je(this))},t.Qa=function(t){this.g&&(this.response=t,je(this))},t.ga=function(){this.g&&je(this)},t.setRequestHeader=function(t,e){this.u.append(t,e)},t.getResponseHeader=function(t){return this.h&&this.h.get(t.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const t=[],e=this.h.entries();for(var n=e.next();!n.done;)n=n.value,t.push(n[0]+": "+n[1]),n=e.next();return t.join("\r\n")},Object.defineProperty(Fe.prototype,"withCredentials",{get:function(){return"include"===this.m},set:function(t){this.m=t?"include":"same-origin"}}),l(ze,tt);var Ge=/^https?$/i,He=["POST","PUT"];function Ke(t,e){t.h=!1,t.g&&(t.j=!0,t.g.abort(),t.j=!1),t.l=e,t.m=5,Qe(t),Xe(t)}function Qe(t){t.A||(t.A=!0,et(t,"complete"),et(t,"error"))}function We(t){if(t.h&&void 0!==r&&(!t.v[1]||4!=Ye(t)||2!=t.Z()))if(t.u&&4==Ye(t))rt(t.Ea,0,t);else if(et(t,"readystatechange"),4==Ye(t)){t.h=!1;try{const r=t.Z();t:switch(r){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var e=!0;break t;default:e=!1}var n;if(!(n=e)){var i;if(i=0===r){var o=String(t.D).match(ne)[1]||null;!o&&s.self&&s.self.location&&(o=s.self.location.protocol.slice(0,-1)),i=!Ge.test(o?o.toLowerCase():"")}n=i}if(n)et(t,"complete"),et(t,"success");else{t.m=6;try{var a=2<Ye(t)?t.g.statusText:""}catch(c){a=""}t.l=a+" ["+t.Z()+"]",Qe(t)}}finally{Xe(t)}}}function Xe(t,e){if(t.g){Je(t);const r=t.g,s=t.v[0]?()=>{}:null;t.g=null,t.v=null,e||et(t,"ready");try{r.onreadystatechange=s}catch(n){}}}function Je(t){t.I&&(s.clearTimeout(t.I),t.I=null)}function Ye(t){return t.g?t.g.readyState:0}function Ze(t){try{if(!t.g)return null;if("response"in t.g)return t.g.response;switch(t.H){case"":case"text":return t.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in t.g)return t.g.mozResponseArrayBuffer}return null}catch(e){return null}}function tn(t,e,n){return n&&n.internalChannelParams&&n.internalChannelParams[t]||e}function en(t){this.Aa=0,this.i=[],this.j=new At,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=tn("failFast",!1,t),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=tn("baseRetryDelayMs",5e3,t),this.cb=tn("retryDelaySeedMs",1e4,t),this.Wa=tn("forwardChannelMaxRetries",2,t),this.wa=tn("forwardChannelRequestTimeoutMs",2e4,t),this.pa=t&&t.xmlHttpFactory||void 0,this.Xa=t&&t.Tb||void 0,this.Ca=t&&t.useFetchStreams||!1,this.L=void 0,this.J=t&&t.supportsCrossDomainXhr||!1,this.K="",this.h=new Qt(t&&t.concurrentRequestLimit),this.Da=new Me,this.P=t&&t.fastHandshake||!1,this.O=t&&t.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=t&&t.Rb||!1,t&&t.xa&&this.j.xa(),t&&t.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&t&&t.detectBufferingProxy||!1,this.ja=void 0,t&&t.longPollingTimeout&&0<t.longPollingTimeout&&(this.ja=t.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}function nn(t){if(sn(t),3==t.G){var e=t.U++,n=se(t.I);if(ce(n,"SID",t.K),ce(n,"RID",e),ce(n,"TYPE","terminate"),cn(t,n),(e=new xt(t,t.j,e)).L=2,e.v=ue(se(n)),n=!1,s.navigator&&s.navigator.sendBeacon)try{n=s.navigator.sendBeacon(e.v.toString(),"")}catch(r){}!n&&s.Image&&((new Image).src=e.v,n=!0),n||(e.g=bn(e.j,null),e.g.ea(e.v)),e.F=Date.now(),Bt(e)}vn(t)}function rn(t){t.g&&(dn(t),t.g.cancel(),t.g=null)}function sn(t){rn(t),t.u&&(s.clearTimeout(t.u),t.u=null),pn(t),t.h.cancel(),t.s&&("number"==typeof t.s&&s.clearTimeout(t.s),t.s=null)}function on(t){if(!Wt(t.h)&&!t.s){t.s=!0;var e=t.Ga;A||k(),D||(A(),D=!0),N.add(e,t),t.B=0}}function an(t,e){var n;n=e?e.l:t.U++;const r=se(t.I);ce(r,"SID",t.K),ce(r,"RID",n),ce(r,"AID",t.T),cn(t,r),t.m&&t.o&&$e(r,t.m,t.o),n=new xt(t,t.j,n,t.B+1),null===t.m&&(n.H=t.o),e&&(t.i=e.D.concat(t.i)),e=un(t,n,1e3),n.I=Math.round(.5*t.wa)+Math.round(.5*t.wa*Math.random()),Yt(t.h,n),Vt(n,r,e)}function cn(t,e){t.H&&v(t.H,function(t,n){ce(e,n,t)}),t.l&&ee({},function(t,n){ce(e,n,t)})}function un(t,e,n){n=Math.min(t.i.length,n);var r=t.l?u(t.l.Na,t.l,t):null;t:{var s=t.i;let e=-1;for(;;){const t=["count="+n];-1==e?0<n?(e=s[0].g,t.push("ofs="+e)):e=0:t.push("ofs="+e);let o=!0;for(let a=0;a<n;a++){let n=s[a].g;const c=s[a].map;if(n-=e,0>n)e=Math.max(0,s[a].g-100),o=!1;else try{Pe(c,t,"req"+n+"_")}catch(i){r&&r(c)}}if(o){r=t.join("&");break t}}}return t=t.i.splice(0,n),e.D=t,r}function hn(t){if(!t.g&&!t.u){t.Y=1;var e=t.Fa;A||k(),D||(A(),D=!0),N.add(e,t),t.v=0}}function ln(t){return!(t.g||t.u||3<=t.v||(t.Y++,t.u=Ct(u(t.Fa,t),mn(t,t.v)),t.v++,0))}function dn(t){null!=t.A&&(s.clearTimeout(t.A),t.A=null)}function fn(t){t.g=new xt(t,t.j,"rpc",t.Y),null===t.m&&(t.g.H=t.o),t.g.O=0;var e=se(t.qa);ce(e,"RID","rpc"),ce(e,"SID",t.K),ce(e,"AID",t.T),ce(e,"CI",t.F?"0":"1"),!t.F&&t.ja&&ce(e,"TO",t.ja),ce(e,"TYPE","xmlhttp"),cn(t,e),t.m&&t.o&&$e(e,t.m,t.o),t.L&&(t.g.I=t.L);var n=t.g;t=t.ia,n.L=1,n.v=ue(se(e)),n.m=null,n.P=!0,Ft(n,t)}function pn(t){null!=t.C&&(s.clearTimeout(t.C),t.C=null)}function gn(t,e){var n=null;if(t.g==e){pn(t),dn(t),t.g=null;var r=2}else{if(!Jt(t.h,e))return;n=e.D,Zt(t.h,e),r=1}if(0!=t.G)if(e.o)if(1==r){n=e.m?e.m.length:0,e=Date.now()-e.F;var s=t.B;et(r=bt(),new St(r,n)),on(t)}else hn(t);else if(3==(s=e.s)||0==s&&0<e.X||!(1==r&&function(t,e){return!(Xt(t.h)>=t.h.j-(t.s?1:0)||(t.s?(t.i=e.D.concat(t.i),0):1==t.G||2==t.G||t.B>=(t.Va?0:t.Wa)||(t.s=Ct(u(t.Ga,t,e),mn(t,t.B)),t.B++,0)))}(t,e)||2==r&&ln(t)))switch(n&&0<n.length&&(e=t.h,e.i=e.i.concat(n)),s){case 1:yn(t,5);break;case 4:yn(t,10);break;case 3:yn(t,6);break;default:yn(t,2)}}function mn(t,e){let n=t.Ta+Math.floor(Math.random()*t.cb);return t.isActive()||(n*=2),n*e}function yn(t,e){if(t.j.info("Error code "+e),2==e){var n=u(t.fb,t),r=t.Xa;const e=!r;r=new re(r||"//www.google.com/images/cleardot.gif"),s.location&&"http"==s.location.protocol||ie(r,"https"),ue(r),e?function(t,e){const n=new At;if(s.Image){const r=new Image;r.onload=h(Le,n,"TestLoadImage: loaded",!0,e,r),r.onerror=h(Le,n,"TestLoadImage: error",!1,e,r),r.onabort=h(Le,n,"TestLoadImage: abort",!1,e,r),r.ontimeout=h(Le,n,"TestLoadImage: timeout",!1,e,r),s.setTimeout(function(){r.ontimeout&&r.ontimeout()},1e4),r.src=t}else e(!1)}(r.toString(),n):function(t,e){new At;const n=new AbortController,r=setTimeout(()=>{n.abort(),Le(0,0,!1,e)},1e4);fetch(t,{signal:n.signal}).then(t=>{clearTimeout(r),t.ok?Le(0,0,!0,e):Le(0,0,!1,e)}).catch(()=>{clearTimeout(r),Le(0,0,!1,e)})}(r.toString(),n)}else It(2);t.G=0,t.l&&t.l.sa(e),vn(t),sn(t)}function vn(t){if(t.G=0,t.ka=[],t.l){const e=te(t.h);0==e.length&&0==t.i.length||(f(t.ka,e),f(t.ka,t.i),t.h.i.length=0,d(t.i),t.i.length=0),t.l.ra()}}function wn(t,e,n){var r=n instanceof re?se(n):new re(n);if(""!=r.g)e&&(r.g=e+"."+r.g),oe(r,r.s);else{var i=s.location;r=i.protocol,e=e?e+"."+i.hostname:i.hostname,i=+i.port;var o=new re(null);r&&ie(o,r),e&&(o.g=e),i&&oe(o,i),n&&(o.l=n),r=o}return n=t.D,e=t.ya,n&&e&&ce(r,n,e),ce(r,"VER",t.la),cn(t,r),r}function bn(t,e,n){if(e&&!t.J)throw Error("Can't create secondary domain capable XhrIo object.");return(e=t.Ca&&!t.pa?new ze(new Ve({eb:n})):new ze(t.pa)).Ha(t.J),e}function _n(){}function En(){}function Tn(t,e){tt.call(this),this.g=new en(e),this.l=t,this.h=e&&e.messageUrlParams||null,t=e&&e.messageHeaders||null,e&&e.clientProtocolHeaderRequired&&(t?t["X-Client-Protocol"]="webchannel":t={"X-Client-Protocol":"webchannel"}),this.g.o=t,t=e&&e.initMessageHeaders||null,e&&e.messageContentType&&(t?t["X-WebChannel-Content-Type"]=e.messageContentType:t={"X-WebChannel-Content-Type":e.messageContentType}),e&&e.va&&(t?t["X-WebChannel-Client-Profile"]=e.va:t={"X-WebChannel-Client-Profile":e.va}),this.g.S=t,(t=e&&e.Sb)&&!p(t)&&(this.g.m=t),this.v=e&&e.supportsCrossDomainXhr||!1,this.u=e&&e.sendRawJson||!1,(e=e&&e.httpSessionIdParam)&&!p(e)&&(this.g.D=e,null!==(t=this.h)&&e in t&&e in(t=this.h)&&delete t[e]),this.j=new Cn(this)}function In(t){mt.call(this),t.__headers__&&(this.headers=t.__headers__,this.statusCode=t.__status__,delete t.__headers__,delete t.__status__);var e=t.__sm__;if(e){t:{for(const n in e){t=n;break t}t=void 0}(this.i=t)&&(t=this.i,e=null!==e&&t in e?e[t]:void 0),this.data=e}else this.data=t}function Sn(){yt.call(this),this.status=1}function Cn(t){this.g=t}(t=ze.prototype).Ha=function(t){this.J=t},t.ea=function(t,e,n,r){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+t);e=e?e.toUpperCase():"GET",this.D=t,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Nt.g(),this.v=this.o?ft(this.o):ft(Nt),this.g.onreadystatechange=u(this.Ea,this);try{this.B=!0,this.g.open(e,String(t),!0),this.B=!1}catch(o){return void Ke(this,o)}if(t=n||"",n=new Map(this.headers),r)if(Object.getPrototypeOf(r)===Object.prototype)for(var i in r)n.set(i,r[i]);else{if("function"!=typeof r.keys||"function"!=typeof r.get)throw Error("Unknown input type for opt_headers: "+String(r));for(const t of r.keys())n.set(t,r.get(t))}r=Array.from(n.keys()).find(t=>"content-type"==t.toLowerCase()),i=s.FormData&&t instanceof s.FormData,!(0<=Array.prototype.indexOf.call(He,e,void 0))||r||i||n.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[s,a]of n)this.g.setRequestHeader(s,a);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Je(this),this.u=!0,this.g.send(t),this.u=!1}catch(o){Ke(this,o)}},t.abort=function(t){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=t||7,et(this,"complete"),et(this,"abort"),Xe(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Xe(this,!0)),ze.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?We(this):this.bb())},t.bb=function(){We(this)},t.isActive=function(){return!!this.g},t.Z=function(){try{return 2<Ye(this)?this.g.status:-1}catch(fe){return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch(fe){return""}},t.Oa=function(t){if(this.g){var e=this.g.responseText;return t&&0==e.indexOf(t)&&(e=e.substring(t.length)),ht(e)}},t.Ba=function(){return this.m},t.Ka=function(){return"string"==typeof this.l?this.l:String(this.l)},(t=en.prototype).la=8,t.G=1,t.connect=function(t,e,n,r){It(0),this.W=t,this.H=e||{},n&&void 0!==r&&(this.H.OSID=n,this.H.OAID=r),this.F=this.X,this.I=wn(this,null,this.W),on(this)},t.Ga=function(t){if(this.s)if(this.s=null,1==this.G){if(!t){this.U=Math.floor(1e5*Math.random()),t=this.U++;const s=new xt(this,this.j,t);let i=this.o;if(this.S&&(i?(i=w(i),_(i,this.S)):i=this.S),null!==this.m||this.O||(s.H=i,i=null),this.P)t:{for(var e=0,n=0;n<this.i.length;n++){var r=this.i[n];if(void 0===(r="__data__"in r.map&&"string"==typeof(r=r.map.__data__)?r.length:void 0))break;if(4096<(e+=r)){e=n;break t}if(4096===e||n===this.i.length-1){e=n+1;break t}}e=1e3}else e=1e3;e=un(this,s,e),ce(n=se(this.I),"RID",t),ce(n,"CVER",22),this.D&&ce(n,"X-HTTP-Session-Id",this.D),cn(this,n),i&&(this.O?e="headers="+encodeURIComponent(String(qe(i)))+"&"+e:this.m&&$e(n,this.m,i)),Yt(this.h,s),this.Ua&&ce(n,"TYPE","init"),this.P?(ce(n,"$req",e),ce(n,"SID","null"),s.T=!0,Vt(s,n,null)):Vt(s,n,e),this.G=2}}else 3==this.G&&(t?an(this,t):0==this.i.length||Wt(this.h)||an(this))},t.Fa=function(){if(this.u=null,fn(this),this.ba&&!(this.M||null==this.g||0>=this.R)){var t=2*this.R;this.j.info("BP detection timer enabled: "+t),this.A=Ct(u(this.ab,this),t)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,It(10),rn(this),fn(this))},t.Za=function(){null!=this.C&&(this.C=null,rn(this),ln(this),It(19))},t.fb=function(t){t?(this.j.info("Successfully pinged google.com"),It(2)):(this.j.info("Failed to ping google.com"),It(1))},t.isActive=function(){return!!this.l&&this.l.isActive(this)},(t=_n.prototype).ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){},En.prototype.g=function(t,e){return new Tn(t,e)},l(Tn,tt),Tn.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Tn.prototype.close=function(){nn(this.g)},Tn.prototype.o=function(t){var e=this.g;if("string"==typeof t){var n={};n.__data__=t,t=n}else this.u&&((n={}).__data__=ut(t),t=n);e.i.push(new Kt(e.Ya++,t)),3==e.G&&on(e)},Tn.prototype.N=function(){this.g.l=null,delete this.j,nn(this.g),delete this.g,Tn.aa.N.call(this)},l(In,mt),l(Sn,yt),l(Cn,_n),Cn.prototype.ua=function(){et(this.g,"a")},Cn.prototype.ta=function(t){et(this.g,new In(t))},Cn.prototype.sa=function(t){et(this.g,new Sn)},Cn.prototype.ra=function(){et(this.g,"b")},En.prototype.createWebChannel=En.prototype.g,Tn.prototype.send=Tn.prototype.o,Tn.prototype.open=Tn.prototype.m,Tn.prototype.close=Tn.prototype.close,Se=function(){return new En},Ie=function(){return bt()},Te=vt,Ee={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},kt.NO_ERROR=0,kt.TIMEOUT=8,kt.HTTP_ERROR=6,_e=kt,Rt.COMPLETE="complete",be=Rt,pt.EventType=gt,gt.OPEN="a",gt.CLOSE="b",gt.ERROR="c",gt.MESSAGE="d",tt.prototype.listen=tt.prototype.K,we=pt,ze.prototype.listenOnce=ze.prototype.L,ze.prototype.getLastError=ze.prototype.Ka,ze.prototype.getLastErrorCode=ze.prototype.Ba,ze.prototype.getStatus=ze.prototype.Z,ze.prototype.getResponseJson=ze.prototype.Oa,ze.prototype.getResponseText=ze.prototype.oa,ze.prototype.send=ze.prototype.ea,ze.prototype.setWithCredentials=ze.prototype.Ha,ve=ze}).apply(void 0!==Ce?Ce:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});const Ae="@firebase/firestore",De="4.8.0";
/**
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
             */class Ne{constructor(t){this.uid=t}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}Ne.UNAUTHENTICATED=new Ne(null),Ne.GOOGLE_CREDENTIALS=new Ne("google-credentials-uid"),Ne.FIRST_PARTY=new Ne("first-party-uid"),Ne.MOCK_USER=new Ne("mock-user");
/**
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
             */
let ke="11.10.0";
/**
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
             */const Re=new Q("@firebase/firestore");function Oe(){return Re.logLevel}function xe(t,...e){if(Re.logLevel<=$.DEBUG){const n=e.map(Pe);Re.debug(`Firestore (${ke}): ${t}`,...n)}}function Le(t,...e){if(Re.logLevel<=$.ERROR){const n=e.map(Pe);Re.error(`Firestore (${ke}): ${t}`,...n)}}function Me(t,...e){if(Re.logLevel<=$.WARN){const n=e.map(Pe);Re.warn(`Firestore (${ke}): ${t}`,...n)}}function Pe(t){if("string"==typeof t)return t;try{
/**
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
             */return function(t){return JSON.stringify(t)}(t)}catch(e){return t}}
/**
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
             */function Ve(t,e,n){let r="Unexpected state";"string"==typeof e?r=e:n=e,Fe(t,r,n)}function Fe(t,e,n){let r=`FIRESTORE (${ke}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(void 0!==n)try{r+=" CONTEXT: "+JSON.stringify(n)}catch(t){r+=" CONTEXT: "+n}throw Le(r),new Error(r)}function Ue(t,e,n,r){let s="Unexpected state";"string"==typeof n?s=n:r=n,t||Fe(e,s,r)}function je(t,e){return t}
/**
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
             */const Be={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class qe extends N{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
/**
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
             */class $e{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}
/**
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
             */class ze{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class Ge{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(Ne.UNAUTHENTICATED))}shutdown(){}}class He{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable(()=>e(this.token.user))}shutdown(){this.changeListener=null}}class Ke{constructor(t){this.t=t,this.currentUser=Ne.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){Ue(void 0===this.o,42304);let n=this.i;const r=t=>this.i!==n?(n=this.i,e(t)):Promise.resolve();let s=new $e;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new $e,t.enqueueRetryable(()=>r(this.currentUser))};const i=()=>{const e=s;t.enqueueRetryable(async()=>{await e.promise,await r(this.currentUser)})},o=t=>{xe("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=t,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(t=>o(t)),setTimeout(()=>{if(!this.auth){const t=this.t.getImmediate({optional:!0});t?o(t):(xe("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new $e)}},0),i()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then(e=>this.i!==t?(xe("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):e?(Ue("string"==typeof e.accessToken,31837,{l:e}),new ze(e.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return Ue(null===t||"string"==typeof t,2055,{h:t}),new Ne(t)}}class Qe{constructor(t,e,n){this.P=t,this.T=e,this.I=n,this.type="FirstParty",this.user=Ne.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const t=this.R();return t&&this.A.set("Authorization",t),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class We{constructor(t,e,n){this.P=t,this.T=e,this.I=n}getToken(){return Promise.resolve(new Qe(this.P,this.T,this.I))}start(t,e){t.enqueueRetryable(()=>e(Ne.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Xe{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Je{constructor(t,e){this.V=e,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Yt(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,e){Ue(void 0===this.o,3512);const n=t=>{null!=t.error&&xe("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${t.error.message}`);const n=t.token!==this.m;return this.m=t.token,xe("FirebaseAppCheckTokenProvider",`Received ${n?"new":"existing"} token.`),n?e(t.token):Promise.resolve()};this.o=e=>{t.enqueueRetryable(()=>n(e))};const r=t=>{xe("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=t,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(t=>r(t)),setTimeout(()=>{if(!this.appCheck){const t=this.V.getImmediate({optional:!0});t?r(t):xe("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Xe(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(t=>t?(Ue("string"==typeof t.token,44558,{tokenResult:t}),this.m=t.token,new Xe(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}
/**
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
             */function Ye(t){const e="undefined"!=typeof self&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&"function"==typeof e.getRandomValues)e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}
/**
             * @license
             * Copyright 2023 Google LLC
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
             */function Ze(){return new TextEncoder}
/**
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
             */class tn{static newId(){const t=62*Math.floor(256/62);let e="";for(;e.length<20;){const n=Ye(40);for(let r=0;r<n.length;++r)e.length<20&&n[r]<t&&(e+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(n[r]%62))}return e}}function en(t,e){return t<e?-1:t>e?1:0}function nn(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=t.codePointAt(n),s=e.codePointAt(n);if(r!==s){if(r<128&&s<128)return en(r,s);{const i=Ze(),o=sn(i.encode(rn(t,n)),i.encode(rn(e,n)));return 0!==o?o:en(r,s)}}n+=r>65535?2:1}return en(t.length,e.length)}function rn(t,e){return t.codePointAt(e)>65535?t.substring(e,e+2):t.substring(e,e+1)}function sn(t,e){for(let n=0;n<t.length&&n<e.length;++n)if(t[n]!==e[n])return en(t[n],e[n]);return en(t.length,e.length)}function on(t,e,n){return t.length===e.length&&t.every((t,r)=>n(t,e[r]))}
/**
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
             */const an="__name__";class cn{constructor(t,e,n){void 0===e?e=0:e>t.length&&Ve(637,{offset:e,range:t.length}),void 0===n?n=t.length-e:n>t.length-e&&Ve(1746,{length:n,range:t.length-e}),this.segments=t,this.offset=e,this.len=n}get length(){return this.len}isEqual(t){return 0===cn.comparator(this,t)}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof cn?t.forEach(t=>{e.push(t)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=void 0===t?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return 0===this.length}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,n=this.limit();e<n;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const n=Math.min(t.length,e.length);for(let r=0;r<n;r++){const n=cn.compareSegments(t.get(r),e.get(r));if(0!==n)return n}return en(t.length,e.length)}static compareSegments(t,e){const n=cn.isNumericId(t),r=cn.isNumericId(e);return n&&!r?-1:!n&&r?1:n&&r?cn.extractNumericId(t).compare(cn.extractNumericId(e)):nn(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return ge.fromString(t.substring(4,t.length-2))}}class un extends cn{construct(t,e,n){return new un(t,e,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const n of t){if(n.indexOf("//")>=0)throw new qe(Be.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);e.push(...n.split("/").filter(t=>t.length>0))}return new un(e)}static emptyPath(){return new un([])}}const hn=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ln extends cn{construct(t,e,n){return new ln(t,e,n)}static isValidIdentifier(t){return hn.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ln.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&this.get(0)===an}static keyField(){return new ln([an])}static fromServerFormat(t){const e=[];let n="",r=0;const s=()=>{if(0===n.length)throw new qe(Be.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(n),n=""};let i=!1;for(;r<t.length;){const e=t[r];if("\\"===e){if(r+1===t.length)throw new qe(Be.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const e=t[r+1];if("\\"!==e&&"."!==e&&"`"!==e)throw new qe(Be.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);n+=e,r+=2}else"`"===e?(i=!i,r++):"."!==e||i?(n+=e,r++):(s(),r++)}if(s(),i)throw new qe(Be.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new ln(e)}static emptyPath(){return new ln([])}}
/**
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
             */class dn{constructor(t){this.path=t}static fromPath(t){return new dn(un.fromString(t))}static fromName(t){return new dn(un.fromString(t).popFirst(5))}static empty(){return new dn(un.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return null!==t&&0===un.comparator(this.path,t.path)}toString(){return this.path.toString()}static comparator(t,e){return un.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new dn(new un(t.slice()))}}
/**
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
             */function fn(t,e,n){if(!n)throw new qe(Be.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function pn(t){if(!dn.isDocumentKey(t))throw new qe(Be.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function gn(t){if(dn.isDocumentKey(t))throw new qe(Be.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function mn(t){return"object"==typeof t&&null!==t&&(Object.getPrototypeOf(t)===Object.prototype||null===Object.getPrototypeOf(t))}function yn(t){if(void 0===t)return"undefined";if(null===t)return"null";if("string"==typeof t)return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if("number"==typeof t||"boolean"==typeof t)return""+t;if("object"==typeof t){if(t instanceof Array)return"an array";{const e=function(t){return t.constructor?t.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return"function"==typeof t?"a function":Ve(12329,{type:typeof t})}function vn(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new qe(Be.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=yn(t);throw new qe(Be.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function wn(t,e){const n={typeString:t};return e&&(n.value=e),n}function bn(t,e){if(!mn(t))throw new qe(Be.INVALID_ARGUMENT,"JSON must be an object");let n;for(const r in e)if(e[r]){const s=e[r].typeString,i="value"in e[r]?{value:e[r].value}:void 0;if(!(r in t)){n=`JSON missing required field: '${r}'`;break}const o=t[r];if(s&&typeof o!==s){n=`JSON field '${r}' must be a ${s}.`;break}if(void 0!==i&&o!==i.value){n=`Expected '${r}' field to equal '${i.value}'`;break}}if(n)throw new qe(Be.INVALID_ARGUMENT,n);return!0}
/**
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
             */const _n=-62135596800,En=1e6;class Tn{static now(){return Tn.fromMillis(Date.now())}static fromDate(t){return Tn.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),n=Math.floor((t-1e3*e)*En);return new Tn(e,n)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new qe(Be.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new qe(Be.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<_n)throw new qe(Be.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new qe(Be.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/En}_compareTo(t){return this.seconds===t.seconds?en(this.nanoseconds,t.nanoseconds):en(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:Tn._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(bn(t,Tn._jsonSchema))return new Tn(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-_n;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}t("af",Tn),Tn._jsonSchemaVersion="firestore/timestamp/1.0",Tn._jsonSchema={type:wn("string",Tn._jsonSchemaVersion),seconds:wn("number"),nanoseconds:wn("number")};
/**
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
             */
class In{static fromTimestamp(t){return new In(t)}static min(){return new In(new Tn(0,0))}static max(){return new In(new Tn(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
/**
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
             */function Sn(t){return new Cn(t.readTime,t.key,-1)}class Cn{constructor(t,e,n){this.readTime=t,this.documentKey=e,this.largestBatchId=n}static min(){return new Cn(In.min(),dn.empty(),-1)}static max(){return new Cn(In.max(),dn.empty(),-1)}}function An(t,e){let n=t.readTime.compareTo(e.readTime);return 0!==n?n:(n=dn.comparator(t.documentKey,e.documentKey),0!==n?n:en(t.largestBatchId,e.largestBatchId)
/**
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
             */)}const Dn="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Nn{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(t=>t())}}
/**
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
             */async function kn(t){if(t.code!==Be.FAILED_PRECONDITION||t.message!==Dn)throw t;xe("LocalStore","Unexpectedly lost primary lease")}
/**
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
             */class Rn{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&Ve(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new Rn((n,r)=>{this.nextCallback=e=>{this.wrapSuccess(t,e).next(n,r)},this.catchCallback=t=>{this.wrapFailure(e,t).next(n,r)}})}toPromise(){return new Promise((t,e)=>{this.next(t,e)})}wrapUserFunction(t){try{const e=t();return e instanceof Rn?e:Rn.resolve(e)}catch(t){return Rn.reject(t)}}wrapSuccess(t,e){return t?this.wrapUserFunction(()=>t(e)):Rn.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction(()=>t(e)):Rn.reject(e)}static resolve(t){return new Rn((e,n)=>{e(t)})}static reject(t){return new Rn((e,n)=>{n(t)})}static waitFor(t){return new Rn((e,n)=>{let r=0,s=0,i=!1;t.forEach(t=>{++r,t.next(()=>{++s,i&&s===r&&e()},t=>n(t))}),i=!0,s===r&&e()})}static or(t){let e=Rn.resolve(!1);for(const n of t)e=e.next(t=>t?Rn.resolve(t):n());return e}static forEach(t,e){const n=[];return t.forEach((t,r)=>{n.push(e.call(this,t,r))}),this.waitFor(n)}static mapArray(t,e){return new Rn((n,r)=>{const s=t.length,i=new Array(s);let o=0;for(let a=0;a<s;a++){const c=a;e(t[c]).next(t=>{i[c]=t,++o,o===s&&n(i)},t=>r(t))}})}static doWhile(t,e){return new Rn((n,r)=>{const s=()=>{!0===t()?e().next(()=>{s()},r):n()};s()})}}function On(t){return"IndexedDbTransactionError"===t.name}
/**
             * @license
             * Copyright 2018 Google LLC
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
             */class xn{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=t=>this._e(t),this.ae=t=>e.writeSequenceNumber(t))}_e(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.ae&&this.ae(t),t}}xn.ue=-1;
/**
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
             */const Ln=-1;function Mn(t){return null==t}function Pn(t){return 0===t&&1/t==-1/0}function Vn(t,e){let n=e;const r=t.length;for(let s=0;s<r;s++){const e=t.charAt(s);switch(e){case"\0":n+="";break;case"":n+="";break;default:n+=e}}return n}function Fn(t){return t+""}
/**
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
             */function Un(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function jn(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function Bn(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}
/**
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
             */class qn{constructor(t,e){this.comparator=t,this.root=e||zn.EMPTY}insert(t,e){return new qn(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,zn.BLACK,null,null))}remove(t){return new qn(this.comparator,this.root.remove(t,this.comparator).copy(null,null,zn.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const n=this.comparator(t,e.key);if(0===n)return e.value;n<0?e=e.left:n>0&&(e=e.right)}return null}indexOf(t){let e=0,n=this.root;for(;!n.isEmpty();){const r=this.comparator(t,n.key);if(0===r)return e+n.left.size;r<0?n=n.left:(e+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,n)=>(t(e,n),!1))}toString(){const t=[];return this.inorderTraversal((e,n)=>(t.push(`${e}:${n}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new $n(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new $n(this.root,t,this.comparator,!1)}getReverseIterator(){return new $n(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new $n(this.root,t,this.comparator,!0)}}class $n{constructor(t,e,n,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!t.isEmpty();)if(s=e?n(t.key,e):1,e&&r&&(s*=-1),s<0)t=this.isReverse?t.left:t.right;else{if(0===s){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class zn{constructor(t,e,n,r,s){this.key=t,this.value=e,this.color=null!=n?n:zn.RED,this.left=null!=r?r:zn.EMPTY,this.right=null!=s?s:zn.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,n,r,s){return new zn(null!=t?t:this.key,null!=e?e:this.value,null!=n?n:this.color,null!=r?r:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,n){let r=this;const s=n(t,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(t,e,n),null):0===s?r.copy(null,e,null,null,null):r.copy(null,null,null,null,r.right.insert(t,e,n)),r.fixUp()}removeMin(){if(this.left.isEmpty())return zn.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let n,r=this;if(e(t,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(t,e),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),0===e(t,r.key)){if(r.right.isEmpty())return zn.EMPTY;n=r.right.min(),r=r.copy(n.key,n.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(t,e))}return r.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,zn.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,zn.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw Ve(43730,{key:this.key,value:this.value});if(this.right.isRed())throw Ve(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw Ve(27949);return t+(this.isRed()?0:1)}}zn.EMPTY=null,zn.RED=!0,zn.BLACK=!1,zn.EMPTY=new class{constructor(){this.size=0}get key(){throw Ve(57766)}get value(){throw Ve(16141)}get color(){throw Ve(16727)}get left(){throw Ve(29726)}get right(){throw Ve(36894)}copy(t,e,n,r,s){return this}insert(t,e,n){return new zn(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};
/**
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
             */
class Gn{constructor(t){this.comparator=t,this.data=new qn(this.comparator)}has(t){return null!==this.data.get(t)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,n)=>(t(e),!1))}forEachInRange(t,e){const n=this.data.getIteratorFrom(t[0]);for(;n.hasNext();){const r=n.getNext();if(this.comparator(r.key,t[1])>=0)return;e(r.key)}}forEachWhile(t,e){let n;for(n=void 0!==e?this.data.getIteratorFrom(e):this.data.getIterator();n.hasNext();)if(!t(n.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new Hn(this.data.getIterator())}getIteratorFrom(t){return new Hn(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(t=>{e=e.add(t)}),e}isEqual(t){if(!(t instanceof Gn))return!1;if(this.size!==t.size)return!1;const e=this.data.getIterator(),n=t.data.getIterator();for(;e.hasNext();){const t=e.getNext().key,r=n.getNext().key;if(0!==this.comparator(t,r))return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new Gn(this.comparator);return e.data=t,e}}class Hn{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}
/**
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
             */class Kn{constructor(t){this.fields=t,t.sort(ln.comparator)}static empty(){return new Kn([])}unionWith(t){let e=new Gn(ln.comparator);for(const n of this.fields)e=e.add(n);for(const n of t)e=e.add(n);return new Kn(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return on(this.fields,t.fields,(t,e)=>t.isEqual(e))}}
/**
             * @license
             * Copyright 2023 Google LLC
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
             */class Qn extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}
/**
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
             */class Wn{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(t){try{return atob(t)}catch(t){throw"undefined"!=typeof DOMException&&t instanceof DOMException?new Qn("Invalid base64 string: "+t):t}}(t);return new Wn(e)}static fromUint8Array(t){const e=function(t){let e="";for(let n=0;n<t.length;++n)e+=String.fromCharCode(t[n]);return e}(t);return new Wn(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return t=this.binaryString,btoa(t);var t}toUint8Array(){return function(t){const e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e}
/**
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
             */(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return en(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}Wn.EMPTY_BYTE_STRING=new Wn("");const Xn=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Jn(t){if(Ue(!!t,39018),"string"==typeof t){let e=0;const n=Xn.exec(t);if(Ue(!!n,46558,{timestamp:t}),n[1]){let t=n[1];t=(t+"000000000").substr(0,9),e=Number(t)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Yn(t.seconds),nanos:Yn(t.nanos)}}function Yn(t){return"number"==typeof t?t:"string"==typeof t?Number(t):0}function Zn(t){return"string"==typeof t?Wn.fromBase64String(t):Wn.fromUint8Array(t)}
/**
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
             */const tr="server_timestamp",er="__type__",nr="__previous_value__",rr="__local_write_time__";function sr(t){var e,n;return(null===(n=((null===(e=null==t?void 0:t.mapValue)||void 0===e?void 0:e.fields)||{})[er])||void 0===n?void 0:n.stringValue)===tr}function ir(t){const e=t.mapValue.fields[nr];return sr(e)?ir(e):e}function or(t){const e=Jn(t.mapValue.fields[rr].timestampValue);return new Tn(e.seconds,e.nanos)}
/**
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
             */class ar{constructor(t,e,n,r,s,i,o,a,c,u){this.databaseId=t,this.appId=e,this.persistenceKey=n,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=o,this.longPollingOptions=a,this.useFetchStreams=c,this.isUsingEmulator=u}}const cr="(default)";class ur{constructor(t,e){this.projectId=t,this.database=e||cr}static empty(){return new ur("","")}get isDefaultDatabase(){return this.database===cr}isEqual(t){return t instanceof ur&&t.projectId===this.projectId&&t.database===this.database}}
/**
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
             */const hr="__type__",lr="__max__",dr={},fr="__vector__",pr="value";function gr(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?sr(t)?4:function(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===lr}
/**
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
             */(t)?9007199254740991:function(t){var e,n;return(null===(n=((null===(e=null==t?void 0:t.mapValue)||void 0===e?void 0:e.fields)||{})[hr])||void 0===n?void 0:n.stringValue)===fr}(t)?10:11:Ve(28295,{value:t})}function mr(t,e){if(t===e)return!0;const n=gr(t);if(n!==gr(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return or(t).isEqual(or(e));case 3:return function(t,e){if("string"==typeof t.timestampValue&&"string"==typeof e.timestampValue&&t.timestampValue.length===e.timestampValue.length)return t.timestampValue===e.timestampValue;const n=Jn(t.timestampValue),r=Jn(e.timestampValue);return n.seconds===r.seconds&&n.nanos===r.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(t,e){return Zn(t.bytesValue).isEqual(Zn(e.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(t,e){return Yn(t.geoPointValue.latitude)===Yn(e.geoPointValue.latitude)&&Yn(t.geoPointValue.longitude)===Yn(e.geoPointValue.longitude)}(t,e);case 2:return function(t,e){if("integerValue"in t&&"integerValue"in e)return Yn(t.integerValue)===Yn(e.integerValue);if("doubleValue"in t&&"doubleValue"in e){const n=Yn(t.doubleValue),r=Yn(e.doubleValue);return n===r?Pn(n)===Pn(r):isNaN(n)&&isNaN(r)}return!1}(t,e);case 9:return on(t.arrayValue.values||[],e.arrayValue.values||[],mr);case 10:case 11:return function(t,e){const n=t.mapValue.fields||{},r=e.mapValue.fields||{};if(Un(n)!==Un(r))return!1;for(const s in n)if(n.hasOwnProperty(s)&&(void 0===r[s]||!mr(n[s],r[s])))return!1;return!0}(t,e);default:return Ve(52216,{left:t})}}function yr(t,e){return void 0!==(t.values||[]).find(t=>mr(t,e))}function vr(t,e){if(t===e)return 0;const n=gr(t),r=gr(e);if(n!==r)return en(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return en(t.booleanValue,e.booleanValue);case 2:return function(t,e){const n=Yn(t.integerValue||t.doubleValue),r=Yn(e.integerValue||e.doubleValue);return n<r?-1:n>r?1:n===r?0:isNaN(n)?isNaN(r)?0:-1:1}(t,e);case 3:return wr(t.timestampValue,e.timestampValue);case 4:return wr(or(t),or(e));case 5:return nn(t.stringValue,e.stringValue);case 6:return function(t,e){const n=Zn(t),r=Zn(e);return n.compareTo(r)}(t.bytesValue,e.bytesValue);case 7:return function(t,e){const n=t.split("/"),r=e.split("/");for(let s=0;s<n.length&&s<r.length;s++){const t=en(n[s],r[s]);if(0!==t)return t}return en(n.length,r.length)}(t.referenceValue,e.referenceValue);case 8:return function(t,e){const n=en(Yn(t.latitude),Yn(e.latitude));return 0!==n?n:en(Yn(t.longitude),Yn(e.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return br(t.arrayValue,e.arrayValue);case 10:return function(t,e){var n,r,s,i;const o=t.fields||{},a=e.fields||{},c=null===(n=o[pr])||void 0===n?void 0:n.arrayValue,u=null===(r=a[pr])||void 0===r?void 0:r.arrayValue,h=en((null===(s=null==c?void 0:c.values)||void 0===s?void 0:s.length)||0,(null===(i=null==u?void 0:u.values)||void 0===i?void 0:i.length)||0);return 0!==h?h:br(c,u)}(t.mapValue,e.mapValue);case 11:return function(t,e){if(t===dr&&e===dr)return 0;if(t===dr)return 1;if(e===dr)return-1;const n=t.fields||{},r=Object.keys(n),s=e.fields||{},i=Object.keys(s);r.sort(),i.sort();for(let o=0;o<r.length&&o<i.length;++o){const t=nn(r[o],i[o]);if(0!==t)return t;const e=vr(n[r[o]],s[i[o]]);if(0!==e)return e}return en(r.length,i.length)}(t.mapValue,e.mapValue);default:throw Ve(23264,{le:n})}}function wr(t,e){if("string"==typeof t&&"string"==typeof e&&t.length===e.length)return en(t,e);const n=Jn(t),r=Jn(e),s=en(n.seconds,r.seconds);return 0!==s?s:en(n.nanos,r.nanos)}function br(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const t=vr(n[s],r[s]);if(t)return t}return en(n.length,r.length)}function _r(t){return Er(t)}function Er(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(t){const e=Jn(t);return`time(${e.seconds},${e.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(t){return Zn(t).toBase64()}(t.bytesValue):"referenceValue"in t?function(t){return dn.fromName(t).toString()}(t.referenceValue):"geoPointValue"in t?function(t){return`geo(${t.latitude},${t.longitude})`}(t.geoPointValue):"arrayValue"in t?function(t){let e="[",n=!0;for(const r of t.values||[])n?n=!1:e+=",",e+=Er(r);return e+"]"}(t.arrayValue):"mapValue"in t?function(t){const e=Object.keys(t.fields||{}).sort();let n="{",r=!0;for(const s of e)r?r=!1:n+=",",n+=`${s}:${Er(t.fields[s])}`;return n+"}"}(t.mapValue):Ve(61005,{value:t})}function Tr(t){switch(gr(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=ir(t);return e?16+Tr(e):16;case 5:return 2*t.stringValue.length;case 6:return Zn(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(t){return(t.values||[]).reduce((t,e)=>t+Tr(e),0)}(t.arrayValue);case 10:case 11:return function(t){let e=0;return jn(t.fields,(t,n)=>{e+=t.length+Tr(n)}),e}(t.mapValue);default:throw Ve(13486,{value:t})}}function Ir(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function Sr(t){return!!t&&"integerValue"in t}function Cr(t){return!!t&&"arrayValue"in t}function Ar(t){return!!t&&"nullValue"in t}function Dr(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function Nr(t){return!!t&&"mapValue"in t}function kr(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&"object"==typeof t.timestampValue)return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return jn(t.mapValue.fields,(t,n)=>e.mapValue.fields[t]=kr(n)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=kr(t.arrayValue.values[n]);return e}return Object.assign({},t)}class Rr{constructor(t){this.value=t}static empty(){return new Rr({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let n=0;n<t.length-1;++n)if(e=(e.mapValue.fields||{})[t.get(n)],!Nr(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=kr(e)}setAll(t){let e=ln.emptyPath(),n={},r=[];t.forEach((t,s)=>{if(!e.isImmediateParentOf(s)){const t=this.getFieldsMap(e);this.applyChanges(t,n,r),n={},r=[],e=s.popLast()}t?n[s.lastSegment()]=kr(t):r.push(s.lastSegment())});const s=this.getFieldsMap(e);this.applyChanges(s,n,r)}delete(t){const e=this.field(t.popLast());Nr(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return mr(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let n=0;n<t.length;++n){let r=e.mapValue.fields[t.get(n)];Nr(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},e.mapValue.fields[t.get(n)]=r),e=r}return e.mapValue.fields}applyChanges(t,e,n){jn(e,(e,n)=>t[e]=n);for(const r of n)delete t[r]}clone(){return new Rr(kr(this.value))}}function Or(t){const e=[];return jn(t.fields,(t,n)=>{const r=new ln([t]);if(Nr(n)){const t=Or(n.mapValue).fields;if(0===t.length)e.push(r);else for(const n of t)e.push(r.child(n))}else e.push(r)}),new Kn(e)
/**
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
             */}class xr{constructor(t,e,n,r,s,i,o){this.key=t,this.documentType=e,this.version=n,this.readTime=r,this.createTime=s,this.data=i,this.documentState=o}static newInvalidDocument(t){return new xr(t,0,In.min(),In.min(),In.min(),Rr.empty(),0)}static newFoundDocument(t,e,n,r){return new xr(t,1,e,In.min(),n,r,0)}static newNoDocument(t,e){return new xr(t,2,e,In.min(),In.min(),Rr.empty(),0)}static newUnknownDocument(t,e){return new xr(t,3,e,In.min(),In.min(),Rr.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(In.min())||2!==this.documentType&&0!==this.documentType||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=Rr.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=Rr.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=In.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(t){return t instanceof xr&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new xr(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
/**
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
             */class Lr{constructor(t,e){this.position=t,this.inclusive=e}}function Mr(t,e,n){let r=0;for(let s=0;s<t.position.length;s++){const i=e[s],o=t.position[s];if(r=i.field.isKeyField()?dn.comparator(dn.fromName(o.referenceValue),n.key):vr(o,n.data.field(i.field)),"desc"===i.dir&&(r*=-1),0!==r)break}return r}function Pr(t,e){if(null===t)return null===e;if(null===e)return!1;if(t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!mr(t.position[n],e.position[n]))return!1;return!0}
/**
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
             */class Vr{constructor(t,e="asc"){this.field=t,this.dir=e}}function Fr(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}
/**
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
             */class Ur{}class jr extends Ur{constructor(t,e,n){super(),this.field=t,this.op=e,this.value=n}static create(t,e,n){return t.isKeyField()?"in"===e||"not-in"===e?this.createKeyFieldInFilter(t,e,n):new Kr(t,e,n):"array-contains"===e?new Jr(t,n):"in"===e?new Yr(t,n):"not-in"===e?new Zr(t,n):"array-contains-any"===e?new ts(t,n):new jr(t,e,n)}static createKeyFieldInFilter(t,e,n){return"in"===e?new Qr(t,n):new Wr(t,n)}matches(t){const e=t.data.field(this.field);return"!="===this.op?null!==e&&void 0===e.nullValue&&this.matchesComparison(vr(e,this.value)):null!==e&&gr(this.value)===gr(e)&&this.matchesComparison(vr(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return 0===t;case"!=":return 0!==t;case">":return t>0;case">=":return t>=0;default:return Ve(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Br extends Ur{constructor(t,e){super(),this.filters=t,this.op=e,this.he=null}static create(t,e){return new Br(t,e)}matches(t){return qr(this)?void 0===this.filters.find(e=>!e.matches(t)):void 0!==this.filters.find(e=>e.matches(t))}getFlattenedFilters(){return null!==this.he||(this.he=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function qr(t){return"and"===t.op}function $r(t){return function(t){for(const e of t.filters)if(e instanceof Br)return!1;return!0}(t)&&qr(t)}function zr(t){if(t instanceof jr)return t.field.canonicalString()+t.op.toString()+_r(t.value);if($r(t))return t.filters.map(t=>zr(t)).join(",");{const e=t.filters.map(t=>zr(t)).join(",");return`${t.op}(${e})`}}function Gr(t,e){return t instanceof jr?function(t,e){return e instanceof jr&&t.op===e.op&&t.field.isEqual(e.field)&&mr(t.value,e.value)}(t,e):t instanceof Br?function(t,e){return e instanceof Br&&t.op===e.op&&t.filters.length===e.filters.length&&t.filters.reduce((t,n,r)=>t&&Gr(n,e.filters[r]),!0)}(t,e):void Ve(19439)}function Hr(t){return t instanceof jr?function(t){return`${t.field.canonicalString()} ${t.op} ${_r(t.value)}`}(t):t instanceof Br?function(t){return t.op.toString()+" {"+t.getFilters().map(Hr).join(" ,")+"}"}(t):"Filter"}class Kr extends jr{constructor(t,e,n){super(t,e,n),this.key=dn.fromName(n.referenceValue)}matches(t){const e=dn.comparator(t.key,this.key);return this.matchesComparison(e)}}class Qr extends jr{constructor(t,e){super(t,"in",e),this.keys=Xr(0,e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Wr extends jr{constructor(t,e){super(t,"not-in",e),this.keys=Xr(0,e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function Xr(t,e){var n;return((null===(n=e.arrayValue)||void 0===n?void 0:n.values)||[]).map(t=>dn.fromName(t.referenceValue))}class Jr extends jr{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return Cr(e)&&yr(e.arrayValue,this.value)}}class Yr extends jr{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return null!==e&&yr(this.value.arrayValue,e)}}class Zr extends jr{constructor(t,e){super(t,"not-in",e)}matches(t){if(yr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return null!==e&&void 0===e.nullValue&&!yr(this.value.arrayValue,e)}}class ts extends jr{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!Cr(e)||!e.arrayValue.values)&&e.arrayValue.values.some(t=>yr(this.value.arrayValue,t))}}
/**
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
             */class es{constructor(t,e=null,n=[],r=[],s=null,i=null,o=null){this.path=t,this.collectionGroup=e,this.orderBy=n,this.filters=r,this.limit=s,this.startAt=i,this.endAt=o,this.Pe=null}}function ns(t,e=null,n=[],r=[],s=null,i=null,o=null){return new es(t,e,n,r,s,i,o)}function rs(t){const e=je(t);if(null===e.Pe){let t=e.path.canonicalString();null!==e.collectionGroup&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(t=>zr(t)).join(","),t+="|ob:",t+=e.orderBy.map(t=>function(t){return t.field.canonicalString()+t.dir}(t)).join(","),Mn(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(t=>_r(t)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(t=>_r(t)).join(",")),e.Pe=t}return e.Pe}function ss(t,e){if(t.limit!==e.limit)return!1;if(t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!Fr(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!Gr(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!Pr(t.startAt,e.startAt)&&Pr(t.endAt,e.endAt)}function is(t){return dn.isDocumentKey(t.path)&&null===t.collectionGroup&&0===t.filters.length}
/**
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
             */class os{constructor(t,e=null,n=[],r=[],s=null,i="F",o=null,a=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=n,this.filters=r,this.limit=s,this.limitType=i,this.startAt=o,this.endAt=a,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function as(t){return new os(t)}function cs(t){return 0===t.filters.length&&null===t.limit&&null==t.startAt&&null==t.endAt&&(0===t.explicitOrderBy.length||1===t.explicitOrderBy.length&&t.explicitOrderBy[0].field.isKeyField())}function us(t){return null!==t.collectionGroup}function hs(t){const e=je(t);if(null===e.Te){e.Te=[];const t=new Set;for(const s of e.explicitOrderBy)e.Te.push(s),t.add(s.field.canonicalString());const n=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc",r=function(t){let e=new Gn(ln.comparator);return t.filters.forEach(t=>{t.getFlattenedFilters().forEach(t=>{t.isInequality()&&(e=e.add(t.field))})}),e}(e);r.forEach(r=>{t.has(r.canonicalString())||r.isKeyField()||e.Te.push(new Vr(r,n))}),t.has(ln.keyField().canonicalString())||e.Te.push(new Vr(ln.keyField(),n))}return e.Te}function ls(t){const e=je(t);return e.Ie||(e.Ie=ds(e,hs(t))),e.Ie}function ds(t,e){if("F"===t.limitType)return ns(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(t=>{const e="desc"===t.dir?"asc":"desc";return new Vr(t.field,e)});const n=t.endAt?new Lr(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new Lr(t.startAt.position,t.startAt.inclusive):null;return ns(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function fs(t,e){const n=t.filters.concat([e]);return new os(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function ps(t,e,n){return new os(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function gs(t,e){return ss(ls(t),ls(e))&&t.limitType===e.limitType}function ms(t){return`${rs(ls(t))}|lt:${t.limitType}`}function ys(t){return`Query(target=${function(t){let e=t.path.canonicalString();return null!==t.collectionGroup&&(e+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(e+=`, filters: [${t.filters.map(t=>Hr(t)).join(", ")}]`),Mn(t.limit)||(e+=", limit: "+t.limit),t.orderBy.length>0&&(e+=`, orderBy: [${t.orderBy.map(t=>function(t){return`${t.field.canonicalString()} (${t.dir})`}(t)).join(", ")}]`),t.startAt&&(e+=", startAt: ",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(t=>_r(t)).join(",")),t.endAt&&(e+=", endAt: ",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(t=>_r(t)).join(",")),`Target(${e})`}(ls(t))}; limitType=${t.limitType})`}function vs(t,e){return e.isFoundDocument()&&function(t,e){const n=e.key.path;return null!==t.collectionGroup?e.key.hasCollectionId(t.collectionGroup)&&t.path.isPrefixOf(n):dn.isDocumentKey(t.path)?t.path.isEqual(n):t.path.isImmediateParentOf(n)}(t,e)&&function(t,e){for(const n of hs(t))if(!n.field.isKeyField()&&null===e.data.field(n.field))return!1;return!0}(t,e)&&function(t,e){for(const n of t.filters)if(!n.matches(e))return!1;return!0}(t,e)&&function(t,e){return!(t.startAt&&!function(t,e,n){const r=Mr(t,e,n);return t.inclusive?r<=0:r<0}(t.startAt,hs(t),e)||t.endAt&&!function(t,e,n){const r=Mr(t,e,n);return t.inclusive?r>=0:r>0}(t.endAt,hs(t),e))}(t,e)}function ws(t){return(e,n)=>{let r=!1;for(const s of hs(t)){const t=bs(s,e,n);if(0!==t)return t;r=r||s.field.isKeyField()}return 0}}function bs(t,e,n){const r=t.field.isKeyField()?dn.comparator(e.key,n.key):function(t,e,n){const r=e.data.field(t),s=n.data.field(t);return null!==r&&null!==s?vr(r,s):Ve(42886)}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return Ve(19790,{direction:t.dir})}}
/**
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
             */class _s{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),n=this.inner[e];if(void 0!==n)for(const[r,s]of n)if(this.equalsFn(r,t))return s}has(t){return void 0!==this.get(t)}set(t,e){const n=this.mapKeyFn(t),r=this.inner[n];if(void 0===r)return this.inner[n]=[[t,e]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],t))return void(r[s]=[t,e]);r.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),n=this.inner[e];if(void 0===n)return!1;for(let r=0;r<n.length;r++)if(this.equalsFn(n[r][0],t))return 1===n.length?delete this.inner[e]:n.splice(r,1),this.innerSize--,!0;return!1}forEach(t){jn(this.inner,(e,n)=>{for(const[r,s]of n)t(r,s)})}isEmpty(){return Bn(this.inner)}size(){return this.innerSize}}
/**
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
             */const Es=new qn(dn.comparator);function Ts(){return Es}const Is=new qn(dn.comparator);function Ss(...t){let e=Is;for(const n of t)e=e.insert(n.key,n);return e}function Cs(t){let e=Is;return t.forEach((t,n)=>e=e.insert(t,n.overlayedDocument)),e}function As(){return Ns()}function Ds(){return Ns()}function Ns(){return new _s(t=>t.toString(),(t,e)=>t.isEqual(e))}const ks=new qn(dn.comparator),Rs=new Gn(dn.comparator);function Os(...t){let e=Rs;for(const n of t)e=e.add(n);return e}const xs=new Gn(en);
/**
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
             */
function Ls(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Pn(e)?"-0":e}}function Ms(t){return{integerValue:""+t}}function Ps(t,e){return function(t){return"number"==typeof t&&Number.isInteger(t)&&!Pn(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}
/**
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
             */(e)?Ms(e):Ls(t,e)}
/**
             * @license
             * Copyright 2018 Google LLC
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
             */class Vs{constructor(){this._=void 0}}function Fs(t,e,n){return t instanceof Bs?function(t,e){const n={fields:{[er]:{stringValue:tr},[rr]:{timestampValue:{seconds:t.seconds,nanos:t.nanoseconds}}}};return e&&sr(e)&&(e=ir(e)),e&&(n.fields[nr]=e),{mapValue:n}}(n,e):t instanceof qs?$s(t,e):t instanceof zs?Gs(t,e):function(t,e){const n=js(t,e),r=Ks(n)+Ks(t.Ee);return Sr(n)&&Sr(t.Ee)?Ms(r):Ls(t.serializer,r)}(t,e)}function Us(t,e,n){return t instanceof qs?$s(t,e):t instanceof zs?Gs(t,e):n}function js(t,e){return t instanceof Hs?function(t){return Sr(t)||function(t){return!!t&&"doubleValue"in t}(t)}(e)?e:{integerValue:0}:null}class Bs extends Vs{}class qs extends Vs{constructor(t){super(),this.elements=t}}function $s(t,e){const n=Qs(e);for(const r of t.elements)n.some(t=>mr(t,r))||n.push(r);return{arrayValue:{values:n}}}class zs extends Vs{constructor(t){super(),this.elements=t}}function Gs(t,e){let n=Qs(e);for(const r of t.elements)n=n.filter(t=>!mr(t,r));return{arrayValue:{values:n}}}class Hs extends Vs{constructor(t,e){super(),this.serializer=t,this.Ee=e}}function Ks(t){return Yn(t.integerValue||t.doubleValue)}function Qs(t){return Cr(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}
/**
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
             */class Ws{constructor(t,e){this.field=t,this.transform=e}}class Xs{constructor(t,e){this.version=t,this.transformResults=e}}class Js{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new Js}static exists(t){return new Js(void 0,t)}static updateTime(t){return new Js(t)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function Ys(t,e){return void 0!==t.updateTime?e.isFoundDocument()&&e.version.isEqual(t.updateTime):void 0===t.exists||t.exists===e.isFoundDocument()}class Zs{}function ti(t,e){if(!t.hasLocalMutations||e&&0===e.fields.length)return null;if(null===e)return t.isNoDocument()?new hi(t.key,Js.none()):new ii(t.key,t.data,Js.none());{const n=t.data,r=Rr.empty();let s=new Gn(ln.comparator);for(let t of e.fields)if(!s.has(t)){let e=n.field(t);null===e&&t.length>1&&(t=t.popLast(),e=n.field(t)),null===e?r.delete(t):r.set(t,e),s=s.add(t)}return new oi(t.key,r,new Kn(s.toArray()),Js.none())}}function ei(t,e,n){t instanceof ii?function(t,e,n){const r=t.value.clone(),s=ci(t.fieldTransforms,e,n.transformResults);r.setAll(s),e.convertToFoundDocument(n.version,r).setHasCommittedMutations()}(t,e,n):t instanceof oi?function(t,e,n){if(!Ys(t.precondition,e))return void e.convertToUnknownDocument(n.version);const r=ci(t.fieldTransforms,e,n.transformResults),s=e.data;s.setAll(ai(t)),s.setAll(r),e.convertToFoundDocument(n.version,s).setHasCommittedMutations()}(t,e,n):function(t,e,n){e.convertToNoDocument(n.version).setHasCommittedMutations()}(0,e,n)}function ni(t,e,n,r){return t instanceof ii?function(t,e,n,r){if(!Ys(t.precondition,e))return n;const s=t.value.clone(),i=ui(t.fieldTransforms,r,e);return s.setAll(i),e.convertToFoundDocument(e.version,s).setHasLocalMutations(),null}(t,e,n,r):t instanceof oi?function(t,e,n,r){if(!Ys(t.precondition,e))return n;const s=ui(t.fieldTransforms,r,e),i=e.data;return i.setAll(ai(t)),i.setAll(s),e.convertToFoundDocument(e.version,i).setHasLocalMutations(),null===n?null:n.unionWith(t.fieldMask.fields).unionWith(t.fieldTransforms.map(t=>t.field))}(t,e,n,r):function(t,e,n){return Ys(t.precondition,e)?(e.convertToNoDocument(e.version).setHasLocalMutations(),null):n}(t,e,n)}function ri(t,e){let n=null;for(const r of t.fieldTransforms){const t=e.data.field(r.field),s=js(r.transform,t||null);null!=s&&(null===n&&(n=Rr.empty()),n.set(r.field,s))}return n||null}function si(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(t,e){return void 0===t&&void 0===e||!(!t||!e)&&on(t,e,(t,e)=>function(t,e){return t.field.isEqual(e.field)&&function(t,e){return t instanceof qs&&e instanceof qs||t instanceof zs&&e instanceof zs?on(t.elements,e.elements,mr):t instanceof Hs&&e instanceof Hs?mr(t.Ee,e.Ee):t instanceof Bs&&e instanceof Bs}(t.transform,e.transform)}(t,e))}(t.fieldTransforms,e.fieldTransforms)&&(0===t.type?t.value.isEqual(e.value):1!==t.type||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class ii extends Zs{constructor(t,e,n,r=[]){super(),this.key=t,this.value=e,this.precondition=n,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class oi extends Zs{constructor(t,e,n,r,s=[]){super(),this.key=t,this.data=e,this.fieldMask=n,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function ai(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function ci(t,e,n){const r=new Map;Ue(t.length===n.length,32656,{Ae:n.length,Re:t.length});for(let s=0;s<n.length;s++){const i=t[s],o=i.transform,a=e.data.field(i.field);r.set(i.field,Us(o,a,n[s]))}return r}function ui(t,e,n){const r=new Map;for(const s of t){const t=s.transform,i=n.data.field(s.field);r.set(s.field,Fs(t,i,e))}return r}class hi extends Zs{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class li extends Zs{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}
/**
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
             */class di{constructor(t,e,n,r){this.batchId=t,this.localWriteTime=e,this.baseMutations=n,this.mutations=r}applyToRemoteDocument(t,e){const n=e.mutationResults;for(let r=0;r<this.mutations.length;r++){const e=this.mutations[r];e.key.isEqual(t.key)&&ei(e,t,n[r])}}applyToLocalView(t,e){for(const n of this.baseMutations)n.key.isEqual(t.key)&&(e=ni(n,t,e,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(t.key)&&(e=ni(n,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const n=Ds();return this.mutations.forEach(r=>{const s=t.get(r.key),i=s.overlayedDocument;let o=this.applyToLocalView(i,s.mutatedFields);o=e.has(r.key)?null:o;const a=ti(i,o);null!==a&&n.set(r.key,a),i.isValidDocument()||i.convertToNoDocument(In.min())}),n}keys(){return this.mutations.reduce((t,e)=>t.add(e.key),Os())}isEqual(t){return this.batchId===t.batchId&&on(this.mutations,t.mutations,(t,e)=>si(t,e))&&on(this.baseMutations,t.baseMutations,(t,e)=>si(t,e))}}class fi{constructor(t,e,n,r){this.batch=t,this.commitVersion=e,this.mutationResults=n,this.docVersions=r}static from(t,e,n){Ue(t.mutations.length===n.length,58842,{Ve:t.mutations.length,me:n.length});let r=ks;const s=t.mutations;for(let i=0;i<s.length;i++)r=r.insert(s[i].key,n[i].version);return new fi(t,e,n,r)}}
/**
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
             */class pi{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return null!==t&&this.mutation===t.mutation}toString(){return`Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`}}
/**
             * @license
             * Copyright 2023 Google LLC
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
             */class gi{constructor(t,e,n){this.alias=t,this.aggregateType=e,this.fieldPath=n}}
/**
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
             */class mi{constructor(t,e){this.count=t,this.unchangedNames=e}}
/**
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
             */var yi,vi;function wi(t){if(void 0===t)return Le("GRPC error has no .code"),Be.UNKNOWN;switch(t){case yi.OK:return Be.OK;case yi.CANCELLED:return Be.CANCELLED;case yi.UNKNOWN:return Be.UNKNOWN;case yi.DEADLINE_EXCEEDED:return Be.DEADLINE_EXCEEDED;case yi.RESOURCE_EXHAUSTED:return Be.RESOURCE_EXHAUSTED;case yi.INTERNAL:return Be.INTERNAL;case yi.UNAVAILABLE:return Be.UNAVAILABLE;case yi.UNAUTHENTICATED:return Be.UNAUTHENTICATED;case yi.INVALID_ARGUMENT:return Be.INVALID_ARGUMENT;case yi.NOT_FOUND:return Be.NOT_FOUND;case yi.ALREADY_EXISTS:return Be.ALREADY_EXISTS;case yi.PERMISSION_DENIED:return Be.PERMISSION_DENIED;case yi.FAILED_PRECONDITION:return Be.FAILED_PRECONDITION;case yi.ABORTED:return Be.ABORTED;case yi.OUT_OF_RANGE:return Be.OUT_OF_RANGE;case yi.UNIMPLEMENTED:return Be.UNIMPLEMENTED;case yi.DATA_LOSS:return Be.DATA_LOSS;default:return Ve(39323,{code:t})}}(vi=yi||(yi={}))[vi.OK=0]="OK",vi[vi.CANCELLED=1]="CANCELLED",vi[vi.UNKNOWN=2]="UNKNOWN",vi[vi.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",vi[vi.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",vi[vi.NOT_FOUND=5]="NOT_FOUND",vi[vi.ALREADY_EXISTS=6]="ALREADY_EXISTS",vi[vi.PERMISSION_DENIED=7]="PERMISSION_DENIED",vi[vi.UNAUTHENTICATED=16]="UNAUTHENTICATED",vi[vi.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",vi[vi.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",vi[vi.ABORTED=10]="ABORTED",vi[vi.OUT_OF_RANGE=11]="OUT_OF_RANGE",vi[vi.UNIMPLEMENTED=12]="UNIMPLEMENTED",vi[vi.INTERNAL=13]="INTERNAL",vi[vi.UNAVAILABLE=14]="UNAVAILABLE",vi[vi.DATA_LOSS=15]="DATA_LOSS";
/**
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
             */
const bi=new ge([4294967295,4294967295],0);function _i(t){const e=Ze().encode(t),n=new me;return n.update(e),new Uint8Array(n.digest())}function Ei(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new ge([n,r],0),new ge([s,i],0)]}class Ti{constructor(t,e,n){if(this.bitmap=t,this.padding=e,this.hashCount=n,e<0||e>=8)throw new Ii(`Invalid padding: ${e}`);if(n<0)throw new Ii(`Invalid hash count: ${n}`);if(t.length>0&&0===this.hashCount)throw new Ii(`Invalid hash count: ${n}`);if(0===t.length&&0!==e)throw new Ii(`Invalid padding when bitmap length is 0: ${e}`);this.fe=8*t.length-e,this.ge=ge.fromNumber(this.fe)}pe(t,e,n){let r=t.add(e.multiply(ge.fromNumber(n)));return 1===r.compare(bi)&&(r=new ge([r.getBits(0),r.getBits(1)],0)),r.modulo(this.ge).toNumber()}ye(t){return!!(this.bitmap[Math.floor(t/8)]&1<<t%8)}mightContain(t){if(0===this.fe)return!1;const e=_i(t),[n,r]=Ei(e);for(let s=0;s<this.hashCount;s++){const t=this.pe(n,r,s);if(!this.ye(t))return!1}return!0}static create(t,e,n){const r=t%8==0?0:8-t%8,s=new Uint8Array(Math.ceil(t/8)),i=new Ti(s,r,e);return n.forEach(t=>i.insert(t)),i}insert(t){if(0===this.fe)return;const e=_i(t),[n,r]=Ei(e);for(let s=0;s<this.hashCount;s++){const t=this.pe(n,r,s);this.we(t)}}we(t){const e=Math.floor(t/8),n=t%8;this.bitmap[e]|=1<<n}}class Ii extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}
/**
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
             */class Si{constructor(t,e,n,r,s){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=n,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(t,e,n){const r=new Map;return r.set(t,Ci.createSynthesizedTargetChangeForCurrentChange(t,e,n)),new Si(In.min(),r,new qn(en),Ts(),Os())}}class Ci{constructor(t,e,n,r,s){this.resumeToken=t,this.current=e,this.addedDocuments=n,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(t,e,n){return new Ci(n,e,Os(),Os(),Os())}}
/**
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
             */class Ai{constructor(t,e,n,r){this.Se=t,this.removedTargetIds=e,this.key=n,this.be=r}}class Di{constructor(t,e){this.targetId=t,this.De=e}}class Ni{constructor(t,e,n=Wn.EMPTY_BYTE_STRING,r=null){this.state=t,this.targetIds=e,this.resumeToken=n,this.cause=r}}class ki{constructor(){this.ve=0,this.Ce=xi(),this.Fe=Wn.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return 0!==this.ve}get Ne(){return this.xe}Be(t){t.approximateByteSize()>0&&(this.xe=!0,this.Fe=t)}Le(){let t=Os(),e=Os(),n=Os();return this.Ce.forEach((r,s)=>{switch(s){case 0:t=t.add(r);break;case 2:e=e.add(r);break;case 1:n=n.add(r);break;default:Ve(38017,{changeType:s})}}),new Ci(this.Fe,this.Me,t,e,n)}ke(){this.xe=!1,this.Ce=xi()}qe(t,e){this.xe=!0,this.Ce=this.Ce.insert(t,e)}Qe(t){this.xe=!0,this.Ce=this.Ce.remove(t)}$e(){this.ve+=1}Ue(){this.ve-=1,Ue(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class Ri{constructor(t){this.We=t,this.Ge=new Map,this.ze=Ts(),this.je=Oi(),this.Je=Oi(),this.He=new qn(en)}Ye(t){for(const e of t.Se)t.be&&t.be.isFoundDocument()?this.Ze(e,t.be):this.Xe(e,t.key,t.be);for(const e of t.removedTargetIds)this.Xe(e,t.key,t.be)}et(t){this.forEachTarget(t,e=>{const n=this.tt(e);switch(t.state){case 0:this.nt(e)&&n.Be(t.resumeToken);break;case 1:n.Ue(),n.Oe||n.ke(),n.Be(t.resumeToken);break;case 2:n.Ue(),n.Oe||this.removeTarget(e);break;case 3:this.nt(e)&&(n.Ke(),n.Be(t.resumeToken));break;case 4:this.nt(e)&&(this.rt(e),n.Be(t.resumeToken));break;default:Ve(56790,{state:t.state})}})}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.Ge.forEach((t,n)=>{this.nt(n)&&e(n)})}it(t){const e=t.targetId,n=t.De.count,r=this.st(e);if(r){const s=r.target;if(is(s))if(0===n){const t=new dn(s.path);this.Xe(e,t,xr.newNoDocument(t,In.min()))}else Ue(1===n,20013,{expectedCount:n});else{const r=this.ot(e);if(r!==n){const n=this._t(t),s=n?this.ut(n,t,r):1;if(0!==s){this.rt(e);const t=2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(e,t)}}}}}_t(t){const e=t.De.unchangedNames;if(!e||!e.bits)return null;const{bits:{bitmap:n="",padding:r=0},hashCount:s=0}=e;let i,o;try{i=Zn(n).toUint8Array()}catch(t){if(t instanceof Qn)return Me("Decoding the base64 bloom filter in existence filter failed ("+t.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw t}try{o=new Ti(i,r,s)}catch(t){return Me(t instanceof Ii?"BloomFilter error: ":"Applying bloom filter failed: ",t),null}return 0===o.fe?null:o}ut(t,e,n){return e.De.count===n-this.ht(t,e.targetId)?0:2}ht(t,e){const n=this.We.getRemoteKeysForTarget(e);let r=0;return n.forEach(n=>{const s=this.We.lt(),i=`projects/${s.projectId}/databases/${s.database}/documents/${n.path.canonicalString()}`;t.mightContain(i)||(this.Xe(e,n,null),r++)}),r}Pt(t){const e=new Map;this.Ge.forEach((n,r)=>{const s=this.st(r);if(s){if(n.current&&is(s.target)){const e=new dn(s.target.path);this.Tt(e).has(r)||this.It(r,e)||this.Xe(r,e,xr.newNoDocument(e,t))}n.Ne&&(e.set(r,n.Le()),n.ke())}});let n=Os();this.Je.forEach((t,e)=>{let r=!0;e.forEachWhile(t=>{const e=this.st(t);return!e||"TargetPurposeLimboResolution"===e.purpose||(r=!1,!1)}),r&&(n=n.add(t))}),this.ze.forEach((e,n)=>n.setReadTime(t));const r=new Si(t,e,this.He,this.ze,n);return this.ze=Ts(),this.je=Oi(),this.Je=Oi(),this.He=new qn(en),r}Ze(t,e){if(!this.nt(t))return;const n=this.It(t,e.key)?2:0;this.tt(t).qe(e.key,n),this.ze=this.ze.insert(e.key,e),this.je=this.je.insert(e.key,this.Tt(e.key).add(t)),this.Je=this.Je.insert(e.key,this.dt(e.key).add(t))}Xe(t,e,n){if(!this.nt(t))return;const r=this.tt(t);this.It(t,e)?r.qe(e,1):r.Qe(e),this.Je=this.Je.insert(e,this.dt(e).delete(t)),this.Je=this.Je.insert(e,this.dt(e).add(t)),n&&(this.ze=this.ze.insert(e,n))}removeTarget(t){this.Ge.delete(t)}ot(t){const e=this.tt(t).Le();return this.We.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}$e(t){this.tt(t).$e()}tt(t){let e=this.Ge.get(t);return e||(e=new ki,this.Ge.set(t,e)),e}dt(t){let e=this.Je.get(t);return e||(e=new Gn(en),this.Je=this.Je.insert(t,e)),e}Tt(t){let e=this.je.get(t);return e||(e=new Gn(en),this.je=this.je.insert(t,e)),e}nt(t){const e=null!==this.st(t);return e||xe("WatchChangeAggregator","Detected inactive target",t),e}st(t){const e=this.Ge.get(t);return e&&e.Oe?null:this.We.Et(t)}rt(t){this.Ge.set(t,new ki),this.We.getRemoteKeysForTarget(t).forEach(e=>{this.Xe(t,e,null)})}It(t,e){return this.We.getRemoteKeysForTarget(t).has(e)}}function Oi(){return new qn(dn.comparator)}function xi(){return new qn(dn.comparator)}const Li={asc:"ASCENDING",desc:"DESCENDING"},Mi={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Pi={and:"AND",or:"OR"};class Vi{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function Fi(t,e){return t.useProto3Json||Mn(e)?e:{value:e}}function Ui(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function ji(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function Bi(t,e){return Ui(t,e.toTimestamp())}function qi(t){return Ue(!!t,49232),In.fromTimestamp(function(t){const e=Jn(t);return new Tn(e.seconds,e.nanos)}(t))}function $i(t,e){return zi(t,e).canonicalString()}function zi(t,e){const n=function(t){return new un(["projects",t.projectId,"databases",t.database])}(t).child("documents");return void 0===e?n:n.child(e)}function Gi(t){const e=un.fromString(t);return Ue(uo(e),10190,{key:e.toString()}),e}function Hi(t,e){return $i(t.databaseId,e.path)}function Ki(t,e){const n=Gi(e);if(n.get(1)!==t.databaseId.projectId)throw new qe(Be.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new qe(Be.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new dn(Xi(n))}function Qi(t,e){return $i(t.databaseId,e)}function Wi(t){return new un(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function Xi(t){return Ue(t.length>4&&"documents"===t.get(4),29091,{key:t.toString()}),t.popFirst(5)}function Ji(t,e,n){return{name:Hi(t,e),fields:n.value.mapValue.fields}}function Yi(t,e){return{documents:[Qi(t,e.path)]}}function Zi(t,e){const n={structuredQuery:{}},r=e.path;let s;null!==e.collectionGroup?(s=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Qi(t,s);const i=function(t){if(0!==t.length)return ao(Br.create(t,"and"))}(e.filters);i&&(n.structuredQuery.where=i);const o=function(t){if(0!==t.length)return t.map(t=>function(t){return{field:io(t.field),direction:no(t.dir)}}(t))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const a=Fi(t,e.limit);return null!==a&&(n.structuredQuery.limit=a),e.startAt&&(n.structuredQuery.startAt=function(t){return{before:t.inclusive,values:t.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(t){return{before:!t.inclusive,values:t.position}}(e.endAt)),{Vt:n,parent:s}}function to(t){let e=function(t){const e=Gi(t);return 4===e.length?un.emptyPath():Xi(e)}(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){Ue(1===r,65062);const t=n.from[0];t.allDescendants?s=t.collectionId:e=e.child(t.collectionId)}let i=[];n.where&&(i=function(t){const e=eo(t);return e instanceof Br&&$r(e)?e.getFilters():[e]}(n.where));let o=[];n.orderBy&&(o=function(t){return t.map(t=>function(t){return new Vr(oo(t.field),function(t){switch(t){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(t.direction))}(t))}(n.orderBy));let a=null;n.limit&&(a=function(t){let e;return e="object"==typeof t?t.value:t,Mn(e)?null:e}(n.limit));let c=null;n.startAt&&(c=function(t){const e=!!t.before,n=t.values||[];return new Lr(n,e)}(n.startAt));let u=null;return n.endAt&&(u=function(t){const e=!t.before,n=t.values||[];return new Lr(n,e)}(n.endAt)),function(t,e,n,r,s,i,o,a){return new os(t,e,n,r,s,i,o,a)}(e,s,o,i,a,"F",c,u)}function eo(t){return void 0!==t.unaryFilter?function(t){switch(t.unaryFilter.op){case"IS_NAN":const e=oo(t.unaryFilter.field);return jr.create(e,"==",{doubleValue:NaN});case"IS_NULL":const n=oo(t.unaryFilter.field);return jr.create(n,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const r=oo(t.unaryFilter.field);return jr.create(r,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const s=oo(t.unaryFilter.field);return jr.create(s,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return Ve(61313);default:return Ve(60726)}}(t):void 0!==t.fieldFilter?function(t){return jr.create(oo(t.fieldFilter.field),function(t){switch(t){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return Ve(58110);default:return Ve(50506)}}(t.fieldFilter.op),t.fieldFilter.value)}(t):void 0!==t.compositeFilter?function(t){return Br.create(t.compositeFilter.filters.map(t=>eo(t)),function(t){switch(t){case"AND":return"and";case"OR":return"or";default:return Ve(1026)}}(t.compositeFilter.op))}(t):Ve(30097,{filter:t})}function no(t){return Li[t]}function ro(t){return Mi[t]}function so(t){return Pi[t]}function io(t){return{fieldPath:t.canonicalString()}}function oo(t){return ln.fromServerFormat(t.fieldPath)}function ao(t){return t instanceof jr?function(t){if("=="===t.op){if(Dr(t.value))return{unaryFilter:{field:io(t.field),op:"IS_NAN"}};if(Ar(t.value))return{unaryFilter:{field:io(t.field),op:"IS_NULL"}}}else if("!="===t.op){if(Dr(t.value))return{unaryFilter:{field:io(t.field),op:"IS_NOT_NAN"}};if(Ar(t.value))return{unaryFilter:{field:io(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:io(t.field),op:ro(t.op),value:t.value}}}(t):t instanceof Br?function(t){const e=t.getFilters().map(t=>ao(t));return 1===e.length?e[0]:{compositeFilter:{op:so(t.op),filters:e}}}(t):Ve(54877,{filter:t})}function co(t){const e=[];return t.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function uo(t){return t.length>=4&&"projects"===t.get(0)&&"databases"===t.get(2)}
/**
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
             */class ho{constructor(t,e,n,r,s=In.min(),i=In.min(),o=Wn.EMPTY_BYTE_STRING,a=null){this.target=t,this.targetId=e,this.purpose=n,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=o,this.expectedCount=a}withSequenceNumber(t){return new ho(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(t,e){return new ho(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t,null)}withExpectedCount(t){return new ho(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,t)}withLastLimboFreeSnapshotVersion(t){return new ho(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken,this.expectedCount)}}
/**
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
             */class lo{constructor(t){this.gt=t}}function fo(t){const e=to({parent:t.parent,structuredQuery:t.structuredQuery});return"LAST"===t.limitType?ps(e,e.limit,"L"):e}
/**
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
             */class po{constructor(){this.Dn=new go}addToCollectionParentIndex(t,e){return this.Dn.add(e),Rn.resolve()}getCollectionParents(t,e){return Rn.resolve(this.Dn.getEntries(e))}addFieldIndex(t,e){return Rn.resolve()}deleteFieldIndex(t,e){return Rn.resolve()}deleteAllFieldIndexes(t){return Rn.resolve()}createTargetIndexes(t,e){return Rn.resolve()}getDocumentsMatchingTarget(t,e){return Rn.resolve(null)}getIndexType(t,e){return Rn.resolve(0)}getFieldIndexes(t,e){return Rn.resolve([])}getNextCollectionGroupToUpdate(t){return Rn.resolve(null)}getMinOffset(t,e){return Rn.resolve(Cn.min())}getMinOffsetFromCollectionGroup(t,e){return Rn.resolve(Cn.min())}updateCollectionGroup(t,e,n){return Rn.resolve()}updateIndexEntries(t,e){return Rn.resolve()}}class go{constructor(){this.index={}}add(t){const e=t.lastSegment(),n=t.popLast(),r=this.index[e]||new Gn(un.comparator),s=!r.has(n);return this.index[e]=r.add(n),s}has(t){const e=t.lastSegment(),n=t.popLast(),r=this.index[e];return r&&r.has(n)}getEntries(t){return(this.index[t]||new Gn(un.comparator)).toArray()}}
/**
             * @license
             * Copyright 2018 Google LLC
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
             */const mo={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},yo=41943040;class vo{static withCacheSize(t){return new vo(t,vo.DEFAULT_COLLECTION_PERCENTILE,vo.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(t,e,n){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=n}}
/**
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
             */vo.DEFAULT_COLLECTION_PERCENTILE=10,vo.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,vo.DEFAULT=new vo(yo,vo.DEFAULT_COLLECTION_PERCENTILE,vo.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),vo.DISABLED=new vo(-1,0,0);
/**
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
             */
class wo{constructor(t){this._r=t}next(){return this._r+=2,this._r}static ar(){return new wo(0)}static ur(){return new wo(-1)}}
/**
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
             */const bo="LruGarbageCollector";function _o([t,e],[n,r]){const s=en(t,n);return 0===s?en(e,r):s}class Eo{constructor(t){this.Tr=t,this.buffer=new Gn(_o),this.Ir=0}dr(){return++this.Ir}Er(t){const e=[t,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(e);else{const t=this.buffer.last();_o(e,t)<0&&(this.buffer=this.buffer.delete(t).add(e))}}get maxValue(){return this.buffer.last()[0]}}class To{constructor(t,e,n){this.garbageCollector=t,this.asyncQueue=e,this.localStore=n,this.Ar=null}start(){-1!==this.garbageCollector.params.cacheSizeCollectionThreshold&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return null!==this.Ar}Rr(t){xe(bo,`Garbage collection scheduled in ${t}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){On(t)?xe(bo,"Ignoring IndexedDB error during garbage collection: ",t):await kn(t)}await this.Rr(3e5)})}}class Io{constructor(t,e){this.Vr=t,this.params=e}calculateTargetCount(t,e){return this.Vr.mr(t).next(t=>Math.floor(e/100*t))}nthSequenceNumber(t,e){if(0===e)return Rn.resolve(xn.ue);const n=new Eo(e);return this.Vr.forEachTarget(t,t=>n.Er(t.sequenceNumber)).next(()=>this.Vr.gr(t,t=>n.Er(t))).next(()=>n.maxValue)}removeTargets(t,e,n){return this.Vr.removeTargets(t,e,n)}removeOrphanedDocuments(t,e){return this.Vr.removeOrphanedDocuments(t,e)}collect(t,e){return-1===this.params.cacheSizeCollectionThreshold?(xe("LruGarbageCollector","Garbage collection skipped; disabled"),Rn.resolve(mo)):this.getCacheSize(t).next(n=>n<this.params.cacheSizeCollectionThreshold?(xe("LruGarbageCollector",`Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),mo):this.pr(t,e))}getCacheSize(t){return this.Vr.getCacheSize(t)}pr(t,e){let n,r,s,i,o,a,c;const u=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next(e=>(e>this.params.maximumSequenceNumbersToCollect?(xe("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${e}`),r=this.params.maximumSequenceNumbersToCollect):r=e,i=Date.now(),this.nthSequenceNumber(t,r))).next(r=>(n=r,o=Date.now(),this.removeTargets(t,n,e))).next(e=>(s=e,a=Date.now(),this.removeOrphanedDocuments(t,n))).next(t=>(c=Date.now(),Oe()<=$.DEBUG&&xe("LruGarbageCollector",`LRU Garbage Collection\n\tCounted targets in ${i-u}ms\n\tDetermined least recently used ${r} in `+(o-i)+"ms\n"+`\tRemoved ${s} targets in `+(a-o)+"ms\n"+`\tRemoved ${t} documents in `+(c-a)+"ms\n"+`Total Duration: ${c-u}ms`),Rn.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:t})))}}
/**
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
             */
class So{constructor(){this.changes=new _s(t=>t.toString(),(t,e)=>t.isEqual(e)),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,xr.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const n=this.changes.get(e);return void 0!==n?Rn.resolve(n):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}
/**
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
             */
/**
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
             */class Co{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}
/**
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
             */class Ao{constructor(t,e,n,r){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=n,this.indexManager=r}getDocument(t,e){let n=null;return this.documentOverlayCache.getOverlay(t,e).next(r=>(n=r,this.remoteDocumentCache.getEntry(t,e))).next(t=>(null!==n&&ni(n.mutation,t,Kn.empty(),Tn.now()),t))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next(e=>this.getLocalViewOfDocuments(t,e,Os()).next(()=>e))}getLocalViewOfDocuments(t,e,n=Os()){const r=As();return this.populateOverlays(t,r,e).next(()=>this.computeViews(t,e,r,n).next(t=>{let e=Ss();return t.forEach((t,n)=>{e=e.insert(t,n.overlayedDocument)}),e}))}getOverlayedDocuments(t,e){const n=As();return this.populateOverlays(t,n,e).next(()=>this.computeViews(t,e,n,Os()))}populateOverlays(t,e,n){const r=[];return n.forEach(t=>{e.has(t)||r.push(t)}),this.documentOverlayCache.getOverlays(t,r).next(t=>{t.forEach((t,n)=>{e.set(t,n)})})}computeViews(t,e,n,r){let s=Ts();const i=Ns(),o=Ns();return e.forEach((t,e)=>{const o=n.get(e.key);r.has(e.key)&&(void 0===o||o.mutation instanceof oi)?s=s.insert(e.key,e):void 0!==o?(i.set(e.key,o.mutation.getFieldMask()),ni(o.mutation,e,o.mutation.getFieldMask(),Tn.now())):i.set(e.key,Kn.empty())}),this.recalculateAndSaveOverlays(t,s).next(t=>(t.forEach((t,e)=>i.set(t,e)),e.forEach((t,e)=>{var n;return o.set(t,new Co(e,null!==(n=i.get(t))&&void 0!==n?n:null))}),o))}recalculateAndSaveOverlays(t,e){const n=Ns();let r=new qn((t,e)=>t-e),s=Os();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next(t=>{for(const s of t)s.keys().forEach(t=>{const i=e.get(t);if(null===i)return;let o=n.get(t)||Kn.empty();o=s.applyToLocalView(i,o),n.set(t,o);const a=(r.get(s.batchId)||Os()).add(t);r=r.insert(s.batchId,a)})}).next(()=>{const i=[],o=r.getReverseIterator();for(;o.hasNext();){const r=o.getNext(),a=r.key,c=r.value,u=Ds();c.forEach(t=>{if(!s.has(t)){const r=ti(e.get(t),n.get(t));null!==r&&u.set(t,r),s=s.add(t)}}),i.push(this.documentOverlayCache.saveOverlays(t,a,u))}return Rn.waitFor(i)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next(e=>this.recalculateAndSaveOverlays(t,e))}getDocumentsMatchingQuery(t,e,n,r){return function(t){return dn.isDocumentKey(t.path)&&null===t.collectionGroup&&0===t.filters.length}(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):us(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,n,r):this.getDocumentsMatchingCollectionQuery(t,e,n,r)}getNextDocuments(t,e,n,r){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,n,r).next(s=>{const i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,n.largestBatchId,r-s.size):Rn.resolve(As());let o=-1,a=s;return i.next(e=>Rn.forEach(e,(e,n)=>(o<n.largestBatchId&&(o=n.largestBatchId),s.get(e)?Rn.resolve():this.remoteDocumentCache.getEntry(t,e).next(t=>{a=a.insert(e,t)}))).next(()=>this.populateOverlays(t,e,s)).next(()=>this.computeViews(t,a,e,Os())).next(t=>({batchId:o,changes:Cs(t)})))})}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new dn(e)).next(t=>{let e=Ss();return t.isFoundDocument()&&(e=e.insert(t.key,t)),e})}getDocumentsMatchingCollectionGroupQuery(t,e,n,r){const s=e.collectionGroup;let i=Ss();return this.indexManager.getCollectionParents(t,s).next(o=>Rn.forEach(o,o=>{const a=function(t,e){return new os(e,null,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}(e,o.child(s));return this.getDocumentsMatchingCollectionQuery(t,a,n,r).next(t=>{t.forEach((t,e)=>{i=i.insert(t,e)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(t,e,n,r){let s;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,n.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,n,s,r))).next(t=>{s.forEach((e,n)=>{const r=n.getKey();null===t.get(r)&&(t=t.insert(r,xr.newInvalidDocument(r)))});let n=Ss();return t.forEach((t,r)=>{const i=s.get(t);void 0!==i&&ni(i.mutation,r,Kn.empty(),Tn.now()),vs(e,r)&&(n=n.insert(t,r))}),n})}}
/**
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
             */class Do{constructor(t){this.serializer=t,this.Br=new Map,this.Lr=new Map}getBundleMetadata(t,e){return Rn.resolve(this.Br.get(e))}saveBundleMetadata(t,e){return this.Br.set(e.id,function(t){return{id:t.id,version:t.version,createTime:qi(t.createTime)}}(e)),Rn.resolve()}getNamedQuery(t,e){return Rn.resolve(this.Lr.get(e))}saveNamedQuery(t,e){return this.Lr.set(e.name,function(t){return{name:t.name,query:fo(t.bundledQuery),readTime:qi(t.readTime)}}(e)),Rn.resolve()}}
/**
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
             */class No{constructor(){this.overlays=new qn(dn.comparator),this.kr=new Map}getOverlay(t,e){return Rn.resolve(this.overlays.get(e))}getOverlays(t,e){const n=As();return Rn.forEach(e,e=>this.getOverlay(t,e).next(t=>{null!==t&&n.set(e,t)})).next(()=>n)}saveOverlays(t,e,n){return n.forEach((n,r)=>{this.wt(t,e,r)}),Rn.resolve()}removeOverlaysForBatchId(t,e,n){const r=this.kr.get(n);return void 0!==r&&(r.forEach(t=>this.overlays=this.overlays.remove(t)),this.kr.delete(n)),Rn.resolve()}getOverlaysForCollection(t,e,n){const r=As(),s=e.length+1,i=new dn(e.child("")),o=this.overlays.getIteratorFrom(i);for(;o.hasNext();){const t=o.getNext().value,i=t.getKey();if(!e.isPrefixOf(i.path))break;i.path.length===s&&t.largestBatchId>n&&r.set(t.getKey(),t)}return Rn.resolve(r)}getOverlaysForCollectionGroup(t,e,n,r){let s=new qn((t,e)=>t-e);const i=this.overlays.getIterator();for(;i.hasNext();){const t=i.getNext().value;if(t.getKey().getCollectionGroup()===e&&t.largestBatchId>n){let e=s.get(t.largestBatchId);null===e&&(e=As(),s=s.insert(t.largestBatchId,e)),e.set(t.getKey(),t)}}const o=As(),a=s.getIterator();for(;a.hasNext()&&(a.getNext().value.forEach((t,e)=>o.set(t,e)),!(o.size()>=r)););return Rn.resolve(o)}wt(t,e,n){const r=this.overlays.get(n.key);if(null!==r){const t=this.kr.get(r.largestBatchId).delete(n.key);this.kr.set(r.largestBatchId,t)}this.overlays=this.overlays.insert(n.key,new pi(e,n));let s=this.kr.get(e);void 0===s&&(s=Os(),this.kr.set(e,s)),this.kr.set(e,s.add(n.key))}}
/**
             * @license
             * Copyright 2024 Google LLC
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
             */class ko{constructor(){this.sessionToken=Wn.EMPTY_BYTE_STRING}getSessionToken(t){return Rn.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,Rn.resolve()}}
/**
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
             */class Ro{constructor(){this.qr=new Gn(Oo.Qr),this.$r=new Gn(Oo.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(t,e){const n=new Oo(t,e);this.qr=this.qr.add(n),this.$r=this.$r.add(n)}Kr(t,e){t.forEach(t=>this.addReference(t,e))}removeReference(t,e){this.Wr(new Oo(t,e))}Gr(t,e){t.forEach(t=>this.removeReference(t,e))}zr(t){const e=new dn(new un([])),n=new Oo(e,t),r=new Oo(e,t+1),s=[];return this.$r.forEachInRange([n,r],t=>{this.Wr(t),s.push(t.key)}),s}jr(){this.qr.forEach(t=>this.Wr(t))}Wr(t){this.qr=this.qr.delete(t),this.$r=this.$r.delete(t)}Jr(t){const e=new dn(new un([])),n=new Oo(e,t),r=new Oo(e,t+1);let s=Os();return this.$r.forEachInRange([n,r],t=>{s=s.add(t.key)}),s}containsKey(t){const e=new Oo(t,0),n=this.qr.firstAfterOrEqual(e);return null!==n&&t.isEqual(n.key)}}class Oo{constructor(t,e){this.key=t,this.Hr=e}static Qr(t,e){return dn.comparator(t.key,e.key)||en(t.Hr,e.Hr)}static Ur(t,e){return en(t.Hr,e.Hr)||dn.comparator(t.key,e.key)}}
/**
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
             */class xo{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.er=1,this.Yr=new Gn(Oo.Qr)}checkEmpty(t){return Rn.resolve(0===this.mutationQueue.length)}addMutationBatch(t,e,n,r){const s=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const i=new di(s,e,n,r);this.mutationQueue.push(i);for(const o of r)this.Yr=this.Yr.add(new Oo(o.key,s)),this.indexManager.addToCollectionParentIndex(t,o.key.path.popLast());return Rn.resolve(i)}lookupMutationBatch(t,e){return Rn.resolve(this.Zr(e))}getNextMutationBatchAfterBatchId(t,e){const n=e+1,r=this.Xr(n),s=r<0?0:r;return Rn.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return Rn.resolve(0===this.mutationQueue.length?Ln:this.er-1)}getAllMutationBatches(t){return Rn.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const n=new Oo(e,0),r=new Oo(e,Number.POSITIVE_INFINITY),s=[];return this.Yr.forEachInRange([n,r],t=>{const e=this.Zr(t.Hr);s.push(e)}),Rn.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(t,e){let n=new Gn(en);return e.forEach(t=>{const e=new Oo(t,0),r=new Oo(t,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([e,r],t=>{n=n.add(t.Hr)})}),Rn.resolve(this.ei(n))}getAllMutationBatchesAffectingQuery(t,e){const n=e.path,r=n.length+1;let s=n;dn.isDocumentKey(s)||(s=s.child(""));const i=new Oo(new dn(s),0);let o=new Gn(en);return this.Yr.forEachWhile(t=>{const e=t.key.path;return!!n.isPrefixOf(e)&&(e.length===r&&(o=o.add(t.Hr)),!0)},i),Rn.resolve(this.ei(o))}ei(t){const e=[];return t.forEach(t=>{const n=this.Zr(t);null!==n&&e.push(n)}),e}removeMutationBatch(t,e){Ue(0===this.ti(e.batchId,"removed"),55003),this.mutationQueue.shift();let n=this.Yr;return Rn.forEach(e.mutations,r=>{const s=new Oo(r.key,e.batchId);return n=n.delete(s),this.referenceDelegate.markPotentiallyOrphaned(t,r.key)}).next(()=>{this.Yr=n})}rr(t){}containsKey(t,e){const n=new Oo(e,0),r=this.Yr.firstAfterOrEqual(n);return Rn.resolve(e.isEqual(r&&r.key))}performConsistencyCheck(t){return this.mutationQueue.length,Rn.resolve()}ti(t,e){return this.Xr(t)}Xr(t){return 0===this.mutationQueue.length?0:t-this.mutationQueue[0].batchId}Zr(t){const e=this.Xr(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}
/**
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
             */class Lo{constructor(t){this.ni=t,this.docs=new qn(dn.comparator),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const n=e.key,r=this.docs.get(n),s=r?r.size:0,i=this.ni(e);return this.docs=this.docs.insert(n,{document:e.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(t,n.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const n=this.docs.get(e);return Rn.resolve(n?n.document.mutableCopy():xr.newInvalidDocument(e))}getEntries(t,e){let n=Ts();return e.forEach(t=>{const e=this.docs.get(t);n=n.insert(t,e?e.document.mutableCopy():xr.newInvalidDocument(t))}),Rn.resolve(n)}getDocumentsMatchingQuery(t,e,n,r){let s=Ts();const i=e.path,o=new dn(i.child("__id-9223372036854775808__")),a=this.docs.getIteratorFrom(o);for(;a.hasNext();){const{key:t,value:{document:o}}=a.getNext();if(!i.isPrefixOf(t.path))break;t.path.length>i.length+1||An(Sn(o),n)<=0||(r.has(o.key)||vs(e,o))&&(s=s.insert(o.key,o.mutableCopy()))}return Rn.resolve(s)}getAllFromCollectionGroup(t,e,n,r){Ve(9500)}ri(t,e){return Rn.forEach(this.docs,t=>e(t))}newChangeBuffer(t){return new Mo(this)}getSize(t){return Rn.resolve(this.size)}}class Mo extends So{constructor(t){super(),this.Or=t}applyChanges(t){const e=[];return this.changes.forEach((n,r)=>{r.isValidDocument()?e.push(this.Or.addEntry(t,r)):this.Or.removeEntry(n)}),Rn.waitFor(e)}getFromCache(t,e){return this.Or.getEntry(t,e)}getAllFromCache(t,e){return this.Or.getEntries(t,e)}}
/**
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
             */class Po{constructor(t){this.persistence=t,this.ii=new _s(t=>rs(t),ss),this.lastRemoteSnapshotVersion=In.min(),this.highestTargetId=0,this.si=0,this.oi=new Ro,this.targetCount=0,this._i=wo.ar()}forEachTarget(t,e){return this.ii.forEach((t,n)=>e(n)),Rn.resolve()}getLastRemoteSnapshotVersion(t){return Rn.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return Rn.resolve(this.si)}allocateTargetId(t){return this.highestTargetId=this._i.next(),Rn.resolve(this.highestTargetId)}setTargetsMetadata(t,e,n){return n&&(this.lastRemoteSnapshotVersion=n),e>this.si&&(this.si=e),Rn.resolve()}hr(t){this.ii.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this._i=new wo(e),this.highestTargetId=e),t.sequenceNumber>this.si&&(this.si=t.sequenceNumber)}addTargetData(t,e){return this.hr(e),this.targetCount+=1,Rn.resolve()}updateTargetData(t,e){return this.hr(e),Rn.resolve()}removeTargetData(t,e){return this.ii.delete(e.target),this.oi.zr(e.targetId),this.targetCount-=1,Rn.resolve()}removeTargets(t,e,n){let r=0;const s=[];return this.ii.forEach((i,o)=>{o.sequenceNumber<=e&&null===n.get(o.targetId)&&(this.ii.delete(i),s.push(this.removeMatchingKeysForTargetId(t,o.targetId)),r++)}),Rn.waitFor(s).next(()=>r)}getTargetCount(t){return Rn.resolve(this.targetCount)}getTargetData(t,e){const n=this.ii.get(e)||null;return Rn.resolve(n)}addMatchingKeys(t,e,n){return this.oi.Kr(e,n),Rn.resolve()}removeMatchingKeys(t,e,n){this.oi.Gr(e,n);const r=this.persistence.referenceDelegate,s=[];return r&&e.forEach(e=>{s.push(r.markPotentiallyOrphaned(t,e))}),Rn.waitFor(s)}removeMatchingKeysForTargetId(t,e){return this.oi.zr(e),Rn.resolve()}getMatchingKeysForTargetId(t,e){const n=this.oi.Jr(e);return Rn.resolve(n)}containsKey(t,e){return Rn.resolve(this.oi.containsKey(e))}}
/**
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
             */class Vo{constructor(t,e){this.ai={},this.overlays={},this.ui=new xn(0),this.ci=!1,this.ci=!0,this.li=new ko,this.referenceDelegate=t(this),this.hi=new Po(this),this.indexManager=new po,this.remoteDocumentCache=function(t){return new Lo(t)}(t=>this.referenceDelegate.Pi(t)),this.serializer=new lo(e),this.Ti=new Do(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new No,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let n=this.ai[t.toKey()];return n||(n=new xo(e,this.referenceDelegate),this.ai[t.toKey()]=n),n}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(t,e,n){xe("MemoryPersistence","Starting transaction:",t);const r=new Fo(this.ui.next());return this.referenceDelegate.Ii(),n(r).next(t=>this.referenceDelegate.di(r).next(()=>t)).toPromise().then(t=>(r.raiseOnCommittedEvent(),t))}Ei(t,e){return Rn.or(Object.values(this.ai).map(n=>()=>n.containsKey(t,e)))}}class Fo extends Nn{constructor(t){super(),this.currentSequenceNumber=t}}class Uo{constructor(t){this.persistence=t,this.Ai=new Ro,this.Ri=null}static Vi(t){return new Uo(t)}get mi(){if(this.Ri)return this.Ri;throw Ve(60996)}addReference(t,e,n){return this.Ai.addReference(n,e),this.mi.delete(n.toString()),Rn.resolve()}removeReference(t,e,n){return this.Ai.removeReference(n,e),this.mi.add(n.toString()),Rn.resolve()}markPotentiallyOrphaned(t,e){return this.mi.add(e.toString()),Rn.resolve()}removeTarget(t,e){this.Ai.zr(e.targetId).forEach(t=>this.mi.add(t.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(t,e.targetId).next(t=>{t.forEach(t=>this.mi.add(t.toString()))}).next(()=>n.removeTargetData(t,e))}Ii(){this.Ri=new Set}di(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return Rn.forEach(this.mi,n=>{const r=dn.fromPath(n);return this.fi(t,r).next(t=>{t||e.removeEntry(r,In.min())})}).next(()=>(this.Ri=null,e.apply(t)))}updateLimboDocument(t,e){return this.fi(t,e).next(t=>{t?this.mi.delete(e.toString()):this.mi.add(e.toString())})}Pi(t){return 0}fi(t,e){return Rn.or([()=>Rn.resolve(this.Ai.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Ei(t,e)])}}class jo{constructor(t,e){this.persistence=t,this.gi=new _s(t=>function(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=Fn(e)),e=Vn(t.get(n),e);return Fn(e)}(t.path),(t,e)=>t.isEqual(e)),this.garbageCollector=function(t,e){return new Io(t,e)}(this,e)}static Vi(t,e){return new jo(t,e)}Ii(){}di(t){return Rn.resolve()}forEachTarget(t,e){return this.persistence.getTargetCache().forEachTarget(t,e)}mr(t){const e=this.yr(t);return this.persistence.getTargetCache().getTargetCount(t).next(t=>e.next(e=>t+e))}yr(t){let e=0;return this.gr(t,t=>{e++}).next(()=>e)}gr(t,e){return Rn.forEach(this.gi,(n,r)=>this.Sr(t,n,r).next(t=>t?Rn.resolve():e(r)))}removeTargets(t,e,n){return this.persistence.getTargetCache().removeTargets(t,e,n)}removeOrphanedDocuments(t,e){let n=0;const r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ri(t,r=>this.Sr(t,r,e).next(t=>{t||(n++,s.removeEntry(r,In.min()))})).next(()=>s.apply(t)).next(()=>n)}markPotentiallyOrphaned(t,e){return this.gi.set(e,t.currentSequenceNumber),Rn.resolve()}removeTarget(t,e){const n=e.withSequenceNumber(t.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(t,n)}addReference(t,e,n){return this.gi.set(n,t.currentSequenceNumber),Rn.resolve()}removeReference(t,e,n){return this.gi.set(n,t.currentSequenceNumber),Rn.resolve()}updateLimboDocument(t,e){return this.gi.set(e,t.currentSequenceNumber),Rn.resolve()}Pi(t){let e=t.key.toString().length;return t.isFoundDocument()&&(e+=Tr(t.data.value)),e}Sr(t,e,n){return Rn.or([()=>this.persistence.Ei(t,e),()=>this.persistence.getTargetCache().containsKey(t,e),()=>{const t=this.gi.get(e);return Rn.resolve(void 0!==t&&t>n)}])}getCacheSize(t){return this.persistence.getRemoteDocumentCache().getSize(t)}}
/**
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
             */class Bo{constructor(t,e,n,r){this.targetId=t,this.fromCache=e,this.Is=n,this.ds=r}static Es(t,e){let n=Os(),r=Os();for(const s of e.docChanges)switch(s.type){case 0:n=n.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new Bo(t,e.fromCache,n,r)}}
/**
             * @license
             * Copyright 2023 Google LLC
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
             */class qo{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}
/**
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
             */class $o{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=C()?8:function(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}(S())>0?6:4}initialize(t,e){this.gs=t,this.indexManager=e,this.As=!0}getDocumentsMatchingQuery(t,e,n,r){const s={result:null};return this.ps(t,e).next(t=>{s.result=t}).next(()=>{if(!s.result)return this.ys(t,e,r,n).next(t=>{s.result=t})}).next(()=>{if(s.result)return;const n=new qo;return this.ws(t,e,n).next(r=>{if(s.result=r,this.Rs)return this.Ss(t,e,n,r.size)})}).next(()=>s.result)}Ss(t,e,n,r){return n.documentReadCount<this.Vs?(Oe()<=$.DEBUG&&xe("QueryEngine","SDK will not create cache indexes for query:",ys(e),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),Rn.resolve()):(Oe()<=$.DEBUG&&xe("QueryEngine","Query:",ys(e),"scans",n.documentReadCount,"local documents and returns",r,"documents as results."),n.documentReadCount>this.fs*r?(Oe()<=$.DEBUG&&xe("QueryEngine","The SDK decides to create cache indexes for query:",ys(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,ls(e))):Rn.resolve())}ps(t,e){if(cs(e))return Rn.resolve(null);let n=ls(e);return this.indexManager.getIndexType(t,n).next(r=>0===r?null:(null!==e.limit&&1===r&&(e=ps(e,null,"F"),n=ls(e)),this.indexManager.getDocumentsMatchingTarget(t,n).next(r=>{const s=Os(...r);return this.gs.getDocuments(t,s).next(r=>this.indexManager.getMinOffset(t,n).next(n=>{const i=this.bs(e,r);return this.Ds(e,i,s,n.readTime)?this.ps(t,ps(e,null,"F")):this.vs(t,i,e,n)}))})))}ys(t,e,n,r){return cs(e)||r.isEqual(In.min())?Rn.resolve(null):this.gs.getDocuments(t,n).next(s=>{const i=this.bs(e,s);return this.Ds(e,i,n,r)?Rn.resolve(null):(Oe()<=$.DEBUG&&xe("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),ys(e)),this.vs(t,i,e,function(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,s=In.fromTimestamp(1e9===r?new Tn(n+1,0):new Tn(n,r));return new Cn(s,dn.empty(),e)}(r,-1)).next(t=>t))})}bs(t,e){let n=new Gn(ws(t));return e.forEach((e,r)=>{vs(t,r)&&(n=n.add(r))}),n}Ds(t,e,n,r){if(null===t.limit)return!1;if(n.size!==e.size)return!0;const s="F"===t.limitType?e.last():e.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}ws(t,e,n){return Oe()<=$.DEBUG&&xe("QueryEngine","Using full collection scan to execute query:",ys(e)),this.gs.getDocumentsMatchingQuery(t,e,Cn.min(),n)}vs(t,e,n,r){return this.gs.getDocumentsMatchingQuery(t,n,r).next(t=>(e.forEach(e=>{t=t.insert(e.key,e)}),t))}}
/**
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
             */const zo="LocalStore",Go=3e8;class Ho{constructor(t,e,n,r){this.persistence=t,this.Cs=e,this.serializer=r,this.Fs=new qn(en),this.Ms=new _s(t=>rs(t),ss),this.xs=new Map,this.Os=t.getRemoteDocumentCache(),this.hi=t.getTargetCache(),this.Ti=t.getBundleCache(),this.Ns(n)}Ns(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new Ao(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",e=>t.collect(e,this.Fs))}}async function Ko(t,e){const n=je(t);return await n.persistence.runTransaction("Handle user change","readonly",t=>{let r;return n.mutationQueue.getAllMutationBatches(t).next(s=>(r=s,n.Ns(e),n.mutationQueue.getAllMutationBatches(t))).next(e=>{const s=[],i=[];let o=Os();for(const t of r){s.push(t.batchId);for(const e of t.mutations)o=o.add(e.key)}for(const t of e){i.push(t.batchId);for(const e of t.mutations)o=o.add(e.key)}return n.localDocuments.getDocuments(t,o).next(t=>({Bs:t,removedBatchIds:s,addedBatchIds:i}))})})}function Qo(t){const e=je(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.hi.getLastRemoteSnapshotVersion(t))}function Wo(t,e){const n=je(t),r=e.snapshotVersion;let s=n.Fs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",t=>{const i=n.Os.newChangeBuffer({trackRemovals:!0});s=n.Fs;const o=[];e.targetChanges.forEach((i,a)=>{const c=s.get(a);if(!c)return;o.push(n.hi.removeMatchingKeys(t,i.removedDocuments,a).next(()=>n.hi.addMatchingKeys(t,i.addedDocuments,a)));let u=c.withSequenceNumber(t.currentSequenceNumber);null!==e.targetMismatches.get(a)?u=u.withResumeToken(Wn.EMPTY_BYTE_STRING,In.min()).withLastLimboFreeSnapshotVersion(In.min()):i.resumeToken.approximateByteSize()>0&&(u=u.withResumeToken(i.resumeToken,r)),s=s.insert(a,u),function(t,e,n){return 0===t.resumeToken.approximateByteSize()||(e.snapshotVersion.toMicroseconds()-t.snapshotVersion.toMicroseconds()>=Go||n.addedDocuments.size+n.modifiedDocuments.size+n.removedDocuments.size>0)}(c,u,i)&&o.push(n.hi.updateTargetData(t,u))});let a=Ts(),c=Os();if(e.documentUpdates.forEach(r=>{e.resolvedLimboDocuments.has(r)&&o.push(n.persistence.referenceDelegate.updateLimboDocument(t,r))}),o.push(function(t,e,n){let r=Os(),s=Os();return n.forEach(t=>r=r.add(t)),e.getEntries(t,r).next(t=>{let r=Ts();return n.forEach((n,i)=>{const o=t.get(n);i.isFoundDocument()!==o.isFoundDocument()&&(s=s.add(n)),i.isNoDocument()&&i.version.isEqual(In.min())?(e.removeEntry(n,i.readTime),r=r.insert(n,i)):!o.isValidDocument()||i.version.compareTo(o.version)>0||0===i.version.compareTo(o.version)&&o.hasPendingWrites?(e.addEntry(i),r=r.insert(n,i)):xe(zo,"Ignoring outdated watch update for ",n,". Current version:",o.version," Watch version:",i.version)}),{Ls:r,ks:s}})}(t,i,e.documentUpdates).next(t=>{a=t.Ls,c=t.ks})),!r.isEqual(In.min())){const e=n.hi.getLastRemoteSnapshotVersion(t).next(e=>n.hi.setTargetsMetadata(t,t.currentSequenceNumber,r));o.push(e)}return Rn.waitFor(o).next(()=>i.apply(t)).next(()=>n.localDocuments.getLocalViewOfDocuments(t,a,c)).next(()=>a)}).then(t=>(n.Fs=s,t))}function Xo(t,e){const n=je(t);return n.persistence.runTransaction("Get next mutation batch","readonly",t=>(void 0===e&&(e=Ln),n.mutationQueue.getNextMutationBatchAfterBatchId(t,e)))}async function Jo(t,e,n){const r=je(t),s=r.Fs.get(e),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,t=>r.persistence.referenceDelegate.removeTarget(t,s))}catch(t){if(!On(t))throw t;xe(zo,`Failed to update sequence numbers for target ${e}: ${t}`)}r.Fs=r.Fs.remove(e),r.Ms.delete(s.target)}function Yo(t,e,n){const r=je(t);let s=In.min(),i=Os();return r.persistence.runTransaction("Execute query","readwrite",t=>function(t,e,n){const r=je(t),s=r.Ms.get(n);return void 0!==s?Rn.resolve(r.Fs.get(s)):r.hi.getTargetData(e,n)}(r,t,ls(e)).next(e=>{if(e)return s=e.lastLimboFreeSnapshotVersion,r.hi.getMatchingKeysForTargetId(t,e.targetId).next(t=>{i=t})}).next(()=>r.Cs.getDocumentsMatchingQuery(t,e,n?s:In.min(),n?i:Os())).next(t=>(function(t,e,n){let r=t.xs.get(e)||In.min();n.forEach((t,e)=>{e.readTime.compareTo(r)>0&&(r=e.readTime)}),t.xs.set(e,r)}(r,function(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}(e),t),{documents:t,qs:i})))}class Zo{constructor(){this.activeTargetIds=xs}Gs(t){this.activeTargetIds=this.activeTargetIds.add(t)}zs(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Ws(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class ta{constructor(){this.Fo=new Zo,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,n){}addLocalQueryTarget(t,e=!0){return e&&this.Fo.Gs(t),this.Mo[t]||"not-current"}updateQueryState(t,e,n){this.Mo[t]=e}removeLocalQueryTarget(t){this.Fo.zs(t)}isLocalQueryTarget(t){return this.Fo.activeTargetIds.has(t)}clearQueryState(t){delete this.Mo[t]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(t){return this.Fo.activeTargetIds.has(t)}start(){return this.Fo=new Zo,Promise.resolve()}handleUserChange(t,e,n){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}
/**
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
             */class ea{xo(t){}shutdown(){}}
/**
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
             */const na="ConnectivityMonitor";class ra{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(t){this.ko.push(t)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){xe(na,"Network connectivity changed: AVAILABLE");for(const t of this.ko)t(0)}Lo(){xe(na,"Network connectivity changed: UNAVAILABLE");for(const t of this.ko)t(1)}static C(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}
/**
             * @license
             * Copyright 2023 Google LLC
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
             */let sa=null;function ia(){return null===sa?sa=268435456+Math.round(2147483648*Math.random()):sa++,"0x"+sa.toString(16)
/**
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
             */}const oa="RestConnection",aa={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class ca{get Qo(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.$o=e+"://"+t.host,this.Uo=`projects/${n}/databases/${r}`,this.Ko=this.databaseId.database===cr?`project_id=${n}`:`project_id=${n}&database_id=${r}`}Wo(t,e,n,r,s){const i=ia(),o=this.Go(t,e.toUriEncodedString());xe(oa,`Sending RPC '${t}' ${i}:`,o,n);const a={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(a,r,s);const{host:c}=new URL(o),u=w(c);return this.jo(t,o,a,n,u).then(e=>(xe(oa,`Received RPC '${t}' ${i}: `,e),e),e=>{throw Me(oa,`RPC '${t}' ${i} failed with error: `,e,"url: ",o,"request:",n),e})}Jo(t,e,n,r,s,i){return this.Wo(t,e,n,r,s)}zo(t,e,n){t["X-Goog-Api-Client"]="gl-js/ fire/"+ke,t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach((e,n)=>t[n]=e),n&&n.headers.forEach((e,n)=>t[n]=e)}Go(t,e){const n=aa[t];return`${this.$o}/v1/${e}:${n}`}terminate(){}}
/**
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
             */class ua{constructor(t){this.Ho=t.Ho,this.Yo=t.Yo}Zo(t){this.Xo=t}e_(t){this.t_=t}n_(t){this.r_=t}onMessage(t){this.i_=t}close(){this.Yo()}send(t){this.Ho(t)}s_(){this.Xo()}o_(){this.t_()}__(t){this.r_(t)}a_(t){this.i_(t)}}
/**
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
             */const ha="WebChannelConnection";class la extends ca{constructor(t){super(t),this.u_=[],this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}jo(t,e,n,r,s){const i=ia();return new Promise((s,o)=>{const a=new ve;a.setWithCredentials(!0),a.listenOnce(be.COMPLETE,()=>{try{switch(a.getLastErrorCode()){case _e.NO_ERROR:const e=a.getResponseJson();xe(ha,`XHR for RPC '${t}' ${i} received:`,JSON.stringify(e)),s(e);break;case _e.TIMEOUT:xe(ha,`RPC '${t}' ${i} timed out`),o(new qe(Be.DEADLINE_EXCEEDED,"Request time out"));break;case _e.HTTP_ERROR:const n=a.getStatus();if(xe(ha,`RPC '${t}' ${i} failed with status:`,n,"response text:",a.getResponseText()),n>0){let t=a.getResponseJson();Array.isArray(t)&&(t=t[0]);const e=null==t?void 0:t.error;if(e&&e.status&&e.message){const t=function(t){const e=t.toLowerCase().replace(/_/g,"-");return Object.values(Be).indexOf(e)>=0?e:Be.UNKNOWN}(e.status);o(new qe(t,e.message))}else o(new qe(Be.UNKNOWN,"Server responded with status "+a.getStatus()))}else o(new qe(Be.UNAVAILABLE,"Connection failed."));break;default:Ve(9055,{c_:t,streamId:i,l_:a.getLastErrorCode(),h_:a.getLastError()})}}finally{xe(ha,`RPC '${t}' ${i} completed.`)}});const c=JSON.stringify(r);xe(ha,`RPC '${t}' ${i} sending request:`,r),a.send(e,"POST",c,n,15)})}P_(t,e,n){const r=ia(),s=[this.$o,"/","google.firestore.v1.Firestore","/",t,"/channel"],i=Se(),o=Ie(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;void 0!==c&&(a.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(a.useFetchStreams=!0),this.zo(a.initMessageHeaders,e,n),a.encodeInitMessageHeaders=!0;const u=s.join("");xe(ha,`Creating RPC '${t}' stream ${r}: ${u}`,a);const h=i.createWebChannel(u,a);this.T_(h);let l=!1,d=!1;const f=new ua({Ho:e=>{d?xe(ha,`Not sending because RPC '${t}' stream ${r} is closed:`,e):(l||(xe(ha,`Opening RPC '${t}' stream ${r} transport.`),h.open(),l=!0),xe(ha,`RPC '${t}' stream ${r} sending:`,e),h.send(e))},Yo:()=>h.close()}),p=(t,e,n)=>{t.listen(e,t=>{try{n(t)}catch(t){setTimeout(()=>{throw t},0)}})};return p(h,we.EventType.OPEN,()=>{d||(xe(ha,`RPC '${t}' stream ${r} transport opened.`),f.s_())}),p(h,we.EventType.CLOSE,()=>{d||(d=!0,xe(ha,`RPC '${t}' stream ${r} transport closed`),f.__(),this.I_(h))}),p(h,we.EventType.ERROR,e=>{d||(d=!0,Me(ha,`RPC '${t}' stream ${r} transport errored. Name:`,e.name,"Message:",e.message),f.__(new qe(Be.UNAVAILABLE,"The operation could not be completed")))}),p(h,we.EventType.MESSAGE,e=>{var n;if(!d){const s=e.data[0];Ue(!!s,16349);const i=s,o=(null==i?void 0:i.error)||(null===(n=i[0])||void 0===n?void 0:n.error);if(o){xe(ha,`RPC '${t}' stream ${r} received error:`,o);const e=o.status;let n=function(t){const e=yi[t];if(void 0!==e)return wi(e)}(e),s=o.message;void 0===n&&(n=Be.INTERNAL,s="Unknown error status: "+e+" with message "+o.message),d=!0,f.__(new qe(n,s)),h.close()}else xe(ha,`RPC '${t}' stream ${r} received:`,s),f.a_(s)}}),p(o,Te.STAT_EVENT,e=>{e.stat===Ee.PROXY?xe(ha,`RPC '${t}' stream ${r} detected buffering proxy`):e.stat===Ee.NOPROXY&&xe(ha,`RPC '${t}' stream ${r} detected no buffering proxy`)}),setTimeout(()=>{f.o_()},0),f}terminate(){this.u_.forEach(t=>t.close()),this.u_=[]}T_(t){this.u_.push(t)}I_(t){this.u_=this.u_.filter(e=>e===t)}}function da(){return"undefined"!=typeof document?document:null}
/**
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
             */function fa(t){return new Vi(t,!0)}
/**
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
             */class pa{constructor(t,e,n=1e3,r=1.5,s=6e4){this.Fi=t,this.timerId=e,this.d_=n,this.E_=r,this.A_=s,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(t){this.cancel();const e=Math.floor(this.R_+this.p_()),n=Math.max(0,Date.now()-this.m_),r=Math.max(0,e-n);r>0&&xe("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.R_} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,r,()=>(this.m_=Date.now(),t())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){null!==this.V_&&(this.V_.skipDelay(),this.V_=null)}cancel(){null!==this.V_&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}
/**
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
             */const ga="PersistentStream";class ma{constructor(t,e,n,r,s,i,o,a){this.Fi=t,this.w_=n,this.S_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=o,this.listener=a,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new pa(t,e)}M_(){return 1===this.state||5===this.state||this.x_()}x_(){return 2===this.state||3===this.state}start(){this.C_=0,4!==this.state?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&null===this.D_&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,()=>this.L_()))}k_(t){this.q_(),this.stream.send(t)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(t,e){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,4!==t?this.F_.reset():e&&e.code===Be.RESOURCE_EXHAUSTED?(Le(e.toString()),Le("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):e&&e.code===Be.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.U_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.n_(e)}U_(){}auth(){this.state=1;const t=this.K_(this.b_),e=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([t,n])=>{this.b_===e&&this.W_(t,n)},e=>{t(()=>{const t=new qe(Be.UNKNOWN,"Fetching auth token failed: "+e.message);return this.G_(t)})})}W_(t,e){const n=this.K_(this.b_);this.stream=this.z_(t,e),this.stream.Zo(()=>{n(()=>this.listener.Zo())}),this.stream.e_(()=>{n(()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,()=>(this.x_()&&(this.state=3),Promise.resolve())),this.listener.e_()))}),this.stream.n_(t=>{n(()=>this.G_(t))}),this.stream.onMessage(t=>{n(()=>1==++this.C_?this.j_(t):this.onNext(t))})}O_(){this.state=5,this.F_.g_(async()=>{this.state=0,this.start()})}G_(t){return xe(ga,`close with error: ${t}`),this.stream=null,this.close(4,t)}K_(t){return e=>{this.Fi.enqueueAndForget(()=>this.b_===t?e():(xe(ga,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class ya extends ma{constructor(t,e,n,r,s,i){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,n,r,i),this.serializer=s}z_(t,e){return this.connection.P_("Listen",t,e)}j_(t){return this.onNext(t)}onNext(t){this.F_.reset();const e=function(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(t){return"NO_CHANGE"===t?0:"ADD"===t?1:"REMOVE"===t?2:"CURRENT"===t?3:"RESET"===t?4:Ve(39313,{state:t})}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(t,e){return t.useProto3Json?(Ue(void 0===e||"string"==typeof e,58123),Wn.fromBase64String(e||"")):(Ue(void 0===e||e instanceof Buffer||e instanceof Uint8Array,16193),Wn.fromUint8Array(e||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&function(t){const e=void 0===t.code?Be.UNKNOWN:wi(t.code);return new qe(e,t.message||"")}(o);n=new Ni(r,s,i,a||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Ki(t,r.document.name),i=qi(r.document.updateTime),o=r.document.createTime?qi(r.document.createTime):In.min(),a=new Rr({mapValue:{fields:r.document.fields}}),c=xr.newFoundDocument(s,i,o,a),u=r.targetIds||[],h=r.removedTargetIds||[];n=new Ai(u,h,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Ki(t,r.document),i=r.readTime?qi(r.readTime):In.min(),o=xr.newNoDocument(s,i),a=r.removedTargetIds||[];n=new Ai([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Ki(t,r.document),i=r.removedTargetIds||[];n=new Ai([],i,s,null)}else{if(!("filter"in e))return Ve(11601,{At:e});{e.filter;const t=e.filter;t.targetId;const{count:r=0,unchangedNames:s}=t,i=new mi(r,s),o=t.targetId;n=new Di(o,i)}}return n}(this.serializer,t),n=function(t){if(!("targetChange"in t))return In.min();const e=t.targetChange;return e.targetIds&&e.targetIds.length?In.min():e.readTime?qi(e.readTime):In.min()}(t);return this.listener.J_(e,n)}H_(t){const e={};e.database=Wi(this.serializer),e.addTarget=function(t,e){let n;const r=e.target;if(n=is(r)?{documents:Yi(t,r)}:{query:Zi(t,r).Vt},n.targetId=e.targetId,e.resumeToken.approximateByteSize()>0){n.resumeToken=ji(t,e.resumeToken);const r=Fi(t,e.expectedCount);null!==r&&(n.expectedCount=r)}else if(e.snapshotVersion.compareTo(In.min())>0){n.readTime=Ui(t,e.snapshotVersion.toTimestamp());const r=Fi(t,e.expectedCount);null!==r&&(n.expectedCount=r)}return n}(this.serializer,t);const n=function(t,e){const n=function(t){switch(t){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return Ve(28987,{purpose:t})}}(e.purpose);return null==n?null:{"goog-listen-tags":n}}(this.serializer,t);n&&(e.labels=n),this.k_(e)}Y_(t){const e={};e.database=Wi(this.serializer),e.removeTarget=t,this.k_(e)}}class va extends ma{constructor(t,e,n,r,s,i){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,n,r,i),this.serializer=s}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(t,e){return this.connection.P_("Write",t,e)}j_(t){return Ue(!!t.streamToken,31322),this.lastStreamToken=t.streamToken,Ue(!t.writeResults||0===t.writeResults.length,55816),this.listener.ea()}onNext(t){Ue(!!t.streamToken,12678),this.lastStreamToken=t.streamToken,this.F_.reset();const e=function(t,e){return t&&t.length>0?(Ue(void 0!==e,14353),t.map(t=>function(t,e){let n=t.updateTime?qi(t.updateTime):qi(e);return n.isEqual(In.min())&&(n=qi(e)),new Xs(n,t.transformResults||[])}(t,e))):[]}(t.writeResults,t.commitTime),n=qi(t.commitTime);return this.listener.ta(n,e)}na(){const t={};t.database=Wi(this.serializer),this.k_(t)}X_(t){const e={streamToken:this.lastStreamToken,writes:t.map(t=>function(t,e){let n;if(e instanceof ii)n={update:Ji(t,e.key,e.value)};else if(e instanceof hi)n={delete:Hi(t,e.key)};else if(e instanceof oi)n={update:Ji(t,e.key,e.data),updateMask:co(e.fieldMask)};else{if(!(e instanceof li))return Ve(16599,{Rt:e.type});n={verify:Hi(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(t=>function(t,e){const n=e.transform;if(n instanceof Bs)return{fieldPath:e.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(n instanceof qs)return{fieldPath:e.field.canonicalString(),appendMissingElements:{values:n.elements}};if(n instanceof zs)return{fieldPath:e.field.canonicalString(),removeAllFromArray:{values:n.elements}};if(n instanceof Hs)return{fieldPath:e.field.canonicalString(),increment:n.Ee};throw Ve(20930,{transform:e.transform})}(0,t))),e.precondition.isNone||(n.currentDocument=function(t,e){return void 0!==e.updateTime?{updateTime:Bi(t,e.updateTime)}:void 0!==e.exists?{exists:e.exists}:Ve(27497)}(t,e.precondition)),n}(this.serializer,t))};this.k_(e)}}
/**
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
             */class wa{}class ba extends wa{constructor(t,e,n,r){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=n,this.serializer=r,this.ra=!1}ia(){if(this.ra)throw new qe(Be.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(t,e,n,r){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Wo(t,zi(e,n),r,s,i)).catch(t=>{throw"FirebaseError"===t.name?(t.code===Be.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),t):new qe(Be.UNKNOWN,t.toString())})}Jo(t,e,n,r,s){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Jo(t,zi(e,n),r,i,o,s)).catch(t=>{throw"FirebaseError"===t.name?(t.code===Be.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),t):new qe(Be.UNKNOWN,t.toString())})}terminate(){this.ra=!0,this.connection.terminate()}}class _a{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){0===this.sa&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve())))}la(t){"Online"===this.state?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.ua("Offline")))}set(t){this.ha(),this.sa=0,"Online"===t&&(this._a=!1),this.ua(t)}ua(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}ca(t){const e=`Could not reach Cloud Firestore backend. ${t}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(Le(e),this._a=!1):xe("OnlineStateTracker",e)}ha(){null!==this.oa&&(this.oa.cancel(),this.oa=null)}}
/**
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
             */const Ea="RemoteStore";class Ta{constructor(t,e,n,r,s){this.localStore=t,this.datastore=e,this.asyncQueue=n,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=s,this.Ea.xo(t=>{n.enqueueAndForget(async()=>{Oa(this)&&(xe(Ea,"Restarting streams for network reachability change."),await async function(t){const e=je(t);e.Ia.add(4),await Sa(e),e.Aa.set("Unknown"),e.Ia.delete(4),await Ia(e)}(this))})}),this.Aa=new _a(n,r)}}async function Ia(t){if(Oa(t))for(const e of t.da)await e(!0)}async function Sa(t){for(const e of t.da)await e(!1)}function Ca(t,e){const n=je(t);n.Ta.has(e.targetId)||(n.Ta.set(e.targetId,e),Ra(n)?ka(n):Xa(n).x_()&&Da(n,e))}function Aa(t,e){const n=je(t),r=Xa(n);n.Ta.delete(e),r.x_()&&Na(n,e),0===n.Ta.size&&(r.x_()?r.B_():Oa(n)&&n.Aa.set("Unknown"))}function Da(t,e){if(t.Ra.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(In.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}Xa(t).H_(e)}function Na(t,e){t.Ra.$e(e),Xa(t).Y_(e)}function ka(t){t.Ra=new Ri({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>t.Ta.get(e)||null,lt:()=>t.datastore.serializer.databaseId}),Xa(t).start(),t.Aa.aa()}function Ra(t){return Oa(t)&&!Xa(t).M_()&&t.Ta.size>0}function Oa(t){return 0===je(t).Ia.size}function xa(t){t.Ra=void 0}async function La(t){t.Aa.set("Online")}async function Ma(t){t.Ta.forEach((e,n)=>{Da(t,e)})}async function Pa(t,e){xa(t),Ra(t)?(t.Aa.la(e),ka(t)):t.Aa.set("Unknown")}async function Va(t,e,n){if(t.Aa.set("Online"),e instanceof Ni&&2===e.state&&e.cause)try{await async function(t,e){const n=e.cause;for(const r of e.targetIds)t.Ta.has(r)&&(await t.remoteSyncer.rejectListen(r,n),t.Ta.delete(r),t.Ra.removeTarget(r))}(t,e)}catch(n){xe(Ea,"Failed to remove targets %s: %s ",e.targetIds.join(","),n),await Fa(t,n)}else if(e instanceof Ai?t.Ra.Ye(e):e instanceof Di?t.Ra.it(e):t.Ra.et(e),!n.isEqual(In.min()))try{const e=await Qo(t.localStore);n.compareTo(e)>=0&&await function(t,e){const n=t.Ra.Pt(e);return n.targetChanges.forEach((n,r)=>{if(n.resumeToken.approximateByteSize()>0){const s=t.Ta.get(r);s&&t.Ta.set(r,s.withResumeToken(n.resumeToken,e))}}),n.targetMismatches.forEach((e,n)=>{const r=t.Ta.get(e);if(!r)return;t.Ta.set(e,r.withResumeToken(Wn.EMPTY_BYTE_STRING,r.snapshotVersion)),Na(t,e);const s=new ho(r.target,e,n,r.sequenceNumber);Da(t,s)}),t.remoteSyncer.applyRemoteEvent(n)}(t,n)}catch(e){xe(Ea,"Failed to raise snapshot:",e),await Fa(t,e)}}async function Fa(t,e,n){if(!On(e))throw e;t.Ia.add(1),await Sa(t),t.Aa.set("Offline"),n||(n=()=>Qo(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{xe(Ea,"Retrying IndexedDB access"),await n(),t.Ia.delete(1),await Ia(t)})}function Ua(t,e){return e().catch(n=>Fa(t,n,e))}async function ja(t){const e=je(t),n=Ja(e);let r=e.Pa.length>0?e.Pa[e.Pa.length-1].batchId:Ln;for(;Ba(e);)try{const t=await Xo(e.localStore,r);if(null===t){0===e.Pa.length&&n.B_();break}r=t.batchId,qa(e,t)}catch(t){await Fa(e,t)}$a(e)&&za(e)}function Ba(t){return Oa(t)&&t.Pa.length<10}function qa(t,e){t.Pa.push(e);const n=Ja(t);n.x_()&&n.Z_&&n.X_(e.mutations)}function $a(t){return Oa(t)&&!Ja(t).M_()&&t.Pa.length>0}function za(t){Ja(t).start()}async function Ga(t){Ja(t).na()}async function Ha(t){const e=Ja(t);for(const n of t.Pa)e.X_(n.mutations)}async function Ka(t,e,n){const r=t.Pa.shift(),s=fi.from(r,e,n);await Ua(t,()=>t.remoteSyncer.applySuccessfulWrite(s)),await ja(t)}async function Qa(t,e){e&&Ja(t).Z_&&await async function(t,e){if(function(t){return function(t){switch(t){case Be.OK:return Ve(64938);case Be.CANCELLED:case Be.UNKNOWN:case Be.DEADLINE_EXCEEDED:case Be.RESOURCE_EXHAUSTED:case Be.INTERNAL:case Be.UNAVAILABLE:case Be.UNAUTHENTICATED:return!1;case Be.INVALID_ARGUMENT:case Be.NOT_FOUND:case Be.ALREADY_EXISTS:case Be.PERMISSION_DENIED:case Be.FAILED_PRECONDITION:case Be.ABORTED:case Be.OUT_OF_RANGE:case Be.UNIMPLEMENTED:case Be.DATA_LOSS:return!0;default:return Ve(15467,{code:t})}}(t)&&t!==Be.ABORTED}(e.code)){const n=t.Pa.shift();Ja(t).N_(),await Ua(t,()=>t.remoteSyncer.rejectFailedWrite(n.batchId,e)),await ja(t)}}(t,e),$a(t)&&za(t)}async function Wa(t,e){const n=je(t);n.asyncQueue.verifyOperationInProgress(),xe(Ea,"RemoteStore received new credentials");const r=Oa(n);n.Ia.add(3),await Sa(n),r&&n.Aa.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ia.delete(3),await Ia(n)}function Xa(t){return t.Va||(t.Va=function(t,e,n){const r=je(t);return r.ia(),new ya(e,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)
/**
             * @license
             * Copyright 2018 Google LLC
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
             */}(t.datastore,t.asyncQueue,{Zo:La.bind(null,t),e_:Ma.bind(null,t),n_:Pa.bind(null,t),J_:Va.bind(null,t)}),t.da.push(async e=>{e?(t.Va.N_(),Ra(t)?ka(t):t.Aa.set("Unknown")):(await t.Va.stop(),xa(t))})),t.Va}function Ja(t){return t.ma||(t.ma=function(t,e,n){const r=je(t);return r.ia(),new va(e,r.connection,r.authCredentials,r.appCheckCredentials,r.serializer,n)}(t.datastore,t.asyncQueue,{Zo:()=>Promise.resolve(),e_:Ga.bind(null,t),n_:Qa.bind(null,t),ea:Ha.bind(null,t),ta:Ka.bind(null,t)}),t.da.push(async e=>{e?(t.ma.N_(),await ja(t)):(await t.ma.stop(),t.Pa.length>0&&(xe(Ea,`Stopping write stream with ${t.Pa.length} pending writes`),t.Pa=[]))})),t.ma
/**
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
             */}class Ya{constructor(t,e,n,r,s){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=n,this.op=r,this.removalCallback=s,this.deferred=new $e,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(t=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,n,r,s){const i=Date.now()+n,o=new Ya(t,e,i,r,s);return o.start(n),o}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new qe(Be.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Za(t,e){if(Le("AsyncQueue",`${e}: ${t}`),On(t))return new qe(Be.UNAVAILABLE,`${e}: ${t}`);throw t}
/**
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
             */class tc{static emptySet(t){return new tc(t.comparator)}constructor(t){this.comparator=t?(e,n)=>t(e,n)||dn.comparator(e.key,n.key):(t,e)=>dn.comparator(t.key,e.key),this.keyedMap=Ss(),this.sortedSet=new qn(this.comparator)}has(t){return null!=this.keyedMap.get(t)}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal((e,n)=>(t(e),!1))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof tc))return!1;if(this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),n=t.sortedSet.getIterator();for(;e.hasNext();){const t=e.getNext().key,r=n.getNext().key;if(!t.isEqual(r))return!1}return!0}toString(){const t=[];return this.forEach(e=>{t.push(e.toString())}),0===t.length?"DocumentSet ()":"DocumentSet (\n  "+t.join("  \n")+"\n)"}copy(t,e){const n=new tc;return n.comparator=this.comparator,n.keyedMap=t,n.sortedSet=e,n}}
/**
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
             */class ec{constructor(){this.fa=new qn(dn.comparator)}track(t){const e=t.doc.key,n=this.fa.get(e);n?0!==t.type&&3===n.type?this.fa=this.fa.insert(e,t):3===t.type&&1!==n.type?this.fa=this.fa.insert(e,{type:n.type,doc:t.doc}):2===t.type&&2===n.type?this.fa=this.fa.insert(e,{type:2,doc:t.doc}):2===t.type&&0===n.type?this.fa=this.fa.insert(e,{type:0,doc:t.doc}):1===t.type&&0===n.type?this.fa=this.fa.remove(e):1===t.type&&2===n.type?this.fa=this.fa.insert(e,{type:1,doc:n.doc}):0===t.type&&1===n.type?this.fa=this.fa.insert(e,{type:2,doc:t.doc}):Ve(63341,{At:t,ga:n}):this.fa=this.fa.insert(e,t)}pa(){const t=[];return this.fa.inorderTraversal((e,n)=>{t.push(n)}),t}}class nc{constructor(t,e,n,r,s,i,o,a,c){this.query=t,this.docs=e,this.oldDocs=n,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=o,this.excludesMetadataChanges=a,this.hasCachedResults=c}static fromInitialDocuments(t,e,n,r,s){const i=[];return e.forEach(t=>{i.push({type:0,doc:t})}),new nc(t,e,tc.emptySet(e),i,n,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.hasCachedResults===t.hasCachedResults&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&gs(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,n=t.docChanges;if(e.length!==n.length)return!1;for(let r=0;r<e.length;r++)if(e[r].type!==n[r].type||!e[r].doc.isEqual(n[r].doc))return!1;return!0}}
/**
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
             */class rc{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some(t=>t.ba())}}class sc{constructor(){this.queries=ic(),this.onlineState="Unknown",this.Da=new Set}terminate(){!function(t,e){const n=je(t),r=n.queries;n.queries=ic(),r.forEach((t,n)=>{for(const r of n.wa)r.onError(e)})}(this,new qe(Be.ABORTED,"Firestore shutting down"))}}function ic(){return new _s(t=>ms(t),gs)}async function oc(t,e){const n=je(t);let r=3;const s=e.query;let i=n.queries.get(s);i?!i.Sa()&&e.ba()&&(r=2):(i=new rc,r=e.ba()?0:1);try{switch(r){case 0:i.ya=await n.onListen(s,!0);break;case 1:i.ya=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(t){const n=Za(t,`Initialization of query '${ys(e.query)}' failed`);return void e.onError(n)}n.queries.set(s,i),i.wa.push(e),e.va(n.onlineState),i.ya&&e.Ca(i.ya)&&hc(n)}async function ac(t,e){const n=je(t),r=e.query;let s=3;const i=n.queries.get(r);if(i){const t=i.wa.indexOf(e);t>=0&&(i.wa.splice(t,1),0===i.wa.length?s=e.ba()?0:1:!i.Sa()&&e.ba()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function cc(t,e){const n=je(t);let r=!1;for(const s of e){const t=s.query,e=n.queries.get(t);if(e){for(const t of e.wa)t.Ca(s)&&(r=!0);e.ya=s}}r&&hc(n)}function uc(t,e,n){const r=je(t),s=r.queries.get(e);if(s)for(const i of s.wa)i.onError(n);r.queries.delete(e)}function hc(t){t.Da.forEach(t=>{t.next()})}var lc,dc;(dc=lc||(lc={})).Fa="default",dc.Cache="cache";class fc{constructor(t,e,n){this.query=t,this.Ma=e,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=n||{}}Ca(t){if(!this.options.includeMetadataChanges){const e=[];for(const n of t.docChanges)3!==n.type&&e.push(n);t=new nc(t.query,t.docs,t.oldDocs,e,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0,t.hasCachedResults)}let e=!1;return this.xa?this.Na(t)&&(this.Ma.next(t),e=!0):this.Ba(t,this.onlineState)&&(this.La(t),e=!0),this.Oa=t,e}onError(t){this.Ma.error(t)}va(t){this.onlineState=t;let e=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,t)&&(this.La(this.Oa),e=!0),e}Ba(t,e){if(!t.fromCache)return!0;if(!this.ba())return!0;const n="Offline"!==e;return(!this.options.ka||!n)&&(!t.docs.isEmpty()||t.hasCachedResults||"Offline"===e)}Na(t){if(t.docChanges.length>0)return!0;const e=this.Oa&&this.Oa.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&!0===this.options.includeMetadataChanges}La(t){t=nc.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache,t.hasCachedResults),this.xa=!0,this.Ma.next(t)}ba(){return this.options.source!==lc.Cache}}
/**
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
             */class pc{constructor(t){this.key=t}}class gc{constructor(t){this.key=t}}class mc{constructor(t,e){this.query=t,this.Ha=e,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=Os(),this.mutatedKeys=Os(),this.Xa=ws(t),this.eu=new tc(this.Xa)}get tu(){return this.Ha}nu(t,e){const n=e?e.ru:new ec,r=e?e.eu:this.eu;let s=e?e.mutatedKeys:this.mutatedKeys,i=r,o=!1;const a="F"===this.query.limitType&&r.size===this.query.limit?r.last():null,c="L"===this.query.limitType&&r.size===this.query.limit?r.first():null;if(t.inorderTraversal((t,e)=>{const u=r.get(t),h=vs(this.query,e)?e:null,l=!!u&&this.mutatedKeys.has(u.key),d=!!h&&(h.hasLocalMutations||this.mutatedKeys.has(h.key)&&h.hasCommittedMutations);let f=!1;u&&h?u.data.isEqual(h.data)?l!==d&&(n.track({type:3,doc:h}),f=!0):this.iu(u,h)||(n.track({type:2,doc:h}),f=!0,(a&&this.Xa(h,a)>0||c&&this.Xa(h,c)<0)&&(o=!0)):!u&&h?(n.track({type:0,doc:h}),f=!0):u&&!h&&(n.track({type:1,doc:u}),f=!0,(a||c)&&(o=!0)),f&&(h?(i=i.add(h),s=d?s.add(t):s.delete(t)):(i=i.delete(t),s=s.delete(t)))}),null!==this.query.limit)for(;i.size>this.query.limit;){const t="F"===this.query.limitType?i.last():i.first();i=i.delete(t.key),s=s.delete(t.key),n.track({type:1,doc:t})}return{eu:i,ru:n,Ds:o,mutatedKeys:s}}iu(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,n,r){const s=this.eu;this.eu=t.eu,this.mutatedKeys=t.mutatedKeys;const i=t.ru.pa();i.sort((t,e)=>function(t,e){const n=t=>{switch(t){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return Ve(20277,{At:t})}};return n(t)-n(e)}
/**
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
             */(t.type,e.type)||this.Xa(t.doc,e.doc)),this.su(n),r=null!=r&&r;const o=e&&!r?this.ou():[],a=0===this.Za.size&&this.current&&!r?1:0,c=a!==this.Ya;return this.Ya=a,0!==i.length||c?{snapshot:new nc(this.query,t.eu,s,i,t.mutatedKeys,0===a,c,!1,!!n&&n.resumeToken.approximateByteSize()>0),_u:o}:{_u:o}}va(t){return this.current&&"Offline"===t?(this.current=!1,this.applyChanges({eu:this.eu,ru:new ec,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(t){return!this.Ha.has(t)&&!!this.eu.has(t)&&!this.eu.get(t).hasLocalMutations}su(t){t&&(t.addedDocuments.forEach(t=>this.Ha=this.Ha.add(t)),t.modifiedDocuments.forEach(t=>{}),t.removedDocuments.forEach(t=>this.Ha=this.Ha.delete(t)),this.current=t.current)}ou(){if(!this.current)return[];const t=this.Za;this.Za=Os(),this.eu.forEach(t=>{this.au(t.key)&&(this.Za=this.Za.add(t.key))});const e=[];return t.forEach(t=>{this.Za.has(t)||e.push(new gc(t))}),this.Za.forEach(n=>{t.has(n)||e.push(new pc(n))}),e}uu(t){this.Ha=t.qs,this.Za=Os();const e=this.nu(t.documents);return this.applyChanges(e,!0)}cu(){return nc.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,0===this.Ya,this.hasCachedResults)}}const yc="SyncEngine";class vc{constructor(t,e,n){this.query=t,this.targetId=e,this.view=n}}class wc{constructor(t){this.key=t,this.lu=!1}}class bc{constructor(t,e,n,r,s,i){this.localStore=t,this.remoteStore=e,this.eventManager=n,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.hu={},this.Pu=new _s(t=>ms(t),gs),this.Tu=new Map,this.Iu=new Set,this.du=new qn(dn.comparator),this.Eu=new Map,this.Au=new Ro,this.Ru={},this.Vu=new Map,this.mu=wo.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return!0===this.fu}}async function _c(t,e,n=!0){const r=qc(t);let s;const i=r.Pu.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.cu()):s=await Tc(r,e,n,!0),s}async function Ec(t,e){const n=qc(t);await Tc(n,e,!0,!1)}async function Tc(t,e,n,r){const s=await function(t,e){const n=je(t);return n.persistence.runTransaction("Allocate target","readwrite",t=>{let r;return n.hi.getTargetData(t,e).next(s=>s?(r=s,Rn.resolve(r)):n.hi.allocateTargetId(t).next(s=>(r=new ho(e,s,"TargetPurposeListen",t.currentSequenceNumber),n.hi.addTargetData(t,r).next(()=>r))))}).then(t=>{const r=n.Fs.get(t.targetId);return(null===r||t.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.Fs=n.Fs.insert(t.targetId,t),n.Ms.set(e,t.targetId)),t})}(t.localStore,ls(e)),i=s.targetId,o=t.sharedClientState.addLocalQueryTarget(i,n);let a;return r&&(a=await async function(t,e,n,r,s){t.gu=(e,n,r)=>async function(t,e,n,r){let s=e.view.nu(n);s.Ds&&(s=await Yo(t.localStore,e.query,!1).then(({documents:t})=>e.view.nu(t,s)));const i=r&&r.targetChanges.get(e.targetId),o=r&&null!=r.targetMismatches.get(e.targetId),a=e.view.applyChanges(s,t.isPrimaryClient,i,o);return Pc(t,e.targetId,a._u),a.snapshot}(t,e,n,r);const i=await Yo(t.localStore,e,!0),o=new mc(e,i.qs),a=o.nu(i.documents),c=Ci.createSynthesizedTargetChangeForCurrentChange(n,r&&"Offline"!==t.onlineState,s),u=o.applyChanges(a,t.isPrimaryClient,c);Pc(t,n,u._u);const h=new vc(e,n,o);return t.Pu.set(e,h),t.Tu.has(n)?t.Tu.get(n).push(e):t.Tu.set(n,[e]),u.snapshot}(t,e,i,"current"===o,s.resumeToken)),t.isPrimaryClient&&n&&Ca(t.remoteStore,s),a}async function Ic(t,e,n){const r=je(t),s=r.Pu.get(e),i=r.Tu.get(s.targetId);if(i.length>1)return r.Tu.set(s.targetId,i.filter(t=>!gs(t,e))),void r.Pu.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Jo(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&Aa(r.remoteStore,s.targetId),Lc(r,s.targetId)}).catch(kn)):(Lc(r,s.targetId),await Jo(r.localStore,s.targetId,!0))}async function Sc(t,e){const n=je(t),r=n.Pu.get(e),s=n.Tu.get(r.targetId);n.isPrimaryClient&&1===s.length&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),Aa(n.remoteStore,r.targetId))}async function Cc(t,e,n){const r=function(t){const e=je(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=kc.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Rc.bind(null,e),e}(t);try{const t=await function(t,e){const n=je(t),r=Tn.now(),s=e.reduce((t,e)=>t.add(e.key),Os());let i,o;return n.persistence.runTransaction("Locally write mutations","readwrite",t=>{let a=Ts(),c=Os();return n.Os.getEntries(t,s).next(t=>{a=t,a.forEach((t,e)=>{e.isValidDocument()||(c=c.add(t))})}).next(()=>n.localDocuments.getOverlayedDocuments(t,a)).next(s=>{i=s;const o=[];for(const t of e){const e=ri(t,i.get(t.key).overlayedDocument);null!=e&&o.push(new oi(t.key,e,Or(e.value.mapValue),Js.exists(!0)))}return n.mutationQueue.addMutationBatch(t,r,o,e)}).next(e=>{o=e;const r=e.applyToLocalDocumentSet(i,c);return n.documentOverlayCache.saveOverlays(t,e.batchId,r)})}).then(()=>({batchId:o.batchId,changes:Cs(i)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(t.batchId),function(t,e,n){let r=t.Ru[t.currentUser.toKey()];r||(r=new qn(en)),r=r.insert(e,n),t.Ru[t.currentUser.toKey()]=r}(r,t.batchId,n),await Uc(r,t.changes),await ja(r.remoteStore)}catch(t){const e=Za(t,"Failed to persist write");n.reject(e)}}async function Ac(t,e){const n=je(t);try{const t=await Wo(n.localStore,e);e.targetChanges.forEach((t,e)=>{const r=n.Eu.get(e);r&&(Ue(t.addedDocuments.size+t.modifiedDocuments.size+t.removedDocuments.size<=1,22616),t.addedDocuments.size>0?r.lu=!0:t.modifiedDocuments.size>0?Ue(r.lu,14607):t.removedDocuments.size>0&&(Ue(r.lu,42227),r.lu=!1))}),await Uc(n,t,e)}catch(t){await kn(t)}}function Dc(t,e,n){const r=je(t);if(r.isPrimaryClient&&0===n||!r.isPrimaryClient&&1===n){const t=[];r.Pu.forEach((n,r)=>{const s=r.view.va(e);s.snapshot&&t.push(s.snapshot)}),function(t,e){const n=je(t);n.onlineState=e;let r=!1;n.queries.forEach((t,n)=>{for(const s of n.wa)s.va(e)&&(r=!0)}),r&&hc(n)}(r.eventManager,e),t.length&&r.hu.J_(t),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function Nc(t,e,n){const r=je(t);r.sharedClientState.updateQueryState(e,"rejected",n);const s=r.Eu.get(e),i=s&&s.key;if(i){let t=new qn(dn.comparator);t=t.insert(i,xr.newNoDocument(i,In.min()));const n=Os().add(i),s=new Si(In.min(),new Map,new qn(en),t,n);await Ac(r,s),r.du=r.du.remove(i),r.Eu.delete(e),Fc(r)}else await Jo(r.localStore,e,!1).then(()=>Lc(r,e,n)).catch(kn)}async function kc(t,e){const n=je(t),r=e.batch.batchId;try{const t=await function(t,e){const n=je(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",t=>{const r=e.batch.keys(),s=n.Os.newChangeBuffer({trackRemovals:!0});return function(t,e,n,r){const s=n.batch,i=s.keys();let o=Rn.resolve();return i.forEach(t=>{o=o.next(()=>r.getEntry(e,t)).next(e=>{const i=n.docVersions.get(t);Ue(null!==i,48541),e.version.compareTo(i)<0&&(s.applyToRemoteDocument(e,n),e.isValidDocument()&&(e.setReadTime(n.commitVersion),r.addEntry(e)))})}),o.next(()=>t.mutationQueue.removeMutationBatch(e,s))}(n,t,e,s).next(()=>s.apply(t)).next(()=>n.mutationQueue.performConsistencyCheck(t)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(t,r,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t,function(t){let e=Os();for(let n=0;n<t.mutationResults.length;++n)t.mutationResults[n].transformResults.length>0&&(e=e.add(t.batch.mutations[n].key));return e}(e))).next(()=>n.localDocuments.getDocuments(t,r))})}(n.localStore,e);xc(n,r,null),Oc(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await Uc(n,t)}catch(t){await kn(t)}}async function Rc(t,e,n){const r=je(t);try{const t=await function(t,e){const n=je(t);return n.persistence.runTransaction("Reject batch","readwrite-primary",t=>{let r;return n.mutationQueue.lookupMutationBatch(t,e).next(e=>(Ue(null!==e,37113),r=e.keys(),n.mutationQueue.removeMutationBatch(t,e))).next(()=>n.mutationQueue.performConsistencyCheck(t)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(t,r,e)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(t,r)).next(()=>n.localDocuments.getDocuments(t,r))})}(r.localStore,e);xc(r,e,n),Oc(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await Uc(r,t)}catch(n){await kn(n)}}function Oc(t,e){(t.Vu.get(e)||[]).forEach(t=>{t.resolve()}),t.Vu.delete(e)}function xc(t,e,n){const r=je(t);let s=r.Ru[r.currentUser.toKey()];if(s){const t=s.get(e);t&&(n?t.reject(n):t.resolve(),s=s.remove(e)),r.Ru[r.currentUser.toKey()]=s}}function Lc(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Tu.get(e))t.Pu.delete(r),n&&t.hu.pu(r,n);t.Tu.delete(e),t.isPrimaryClient&&t.Au.zr(e).forEach(e=>{t.Au.containsKey(e)||Mc(t,e)})}function Mc(t,e){t.Iu.delete(e.path.canonicalString());const n=t.du.get(e);null!==n&&(Aa(t.remoteStore,n),t.du=t.du.remove(e),t.Eu.delete(n),Fc(t))}function Pc(t,e,n){for(const r of n)r instanceof pc?(t.Au.addReference(r.key,e),Vc(t,r)):r instanceof gc?(xe(yc,"Document no longer in limbo: "+r.key),t.Au.removeReference(r.key,e),t.Au.containsKey(r.key)||Mc(t,r.key)):Ve(19791,{yu:r})}function Vc(t,e){const n=e.key,r=n.path.canonicalString();t.du.get(n)||t.Iu.has(r)||(xe(yc,"New document in limbo: "+n),t.Iu.add(r),Fc(t))}function Fc(t){for(;t.Iu.size>0&&t.du.size<t.maxConcurrentLimboResolutions;){const e=t.Iu.values().next().value;t.Iu.delete(e);const n=new dn(un.fromString(e)),r=t.mu.next();t.Eu.set(r,new wc(n)),t.du=t.du.insert(n,r),Ca(t.remoteStore,new ho(ls(as(n.path)),r,"TargetPurposeLimboResolution",xn.ue))}}async function Uc(t,e,n){const r=je(t),s=[],i=[],o=[];r.Pu.isEmpty()||(r.Pu.forEach((t,a)=>{o.push(r.gu(a,e,n).then(t=>{var e;if((t||n)&&r.isPrimaryClient){const s=t?!t.fromCache:null===(e=null==n?void 0:n.targetChanges.get(a.targetId))||void 0===e?void 0:e.current;r.sharedClientState.updateQueryState(a.targetId,s?"current":"not-current")}if(t){s.push(t);const e=Bo.Es(a.targetId,t);i.push(e)}}))}),await Promise.all(o),r.hu.J_(s),await async function(t,e){const n=je(t);try{await n.persistence.runTransaction("notifyLocalViewChanges","readwrite",t=>Rn.forEach(e,e=>Rn.forEach(e.Is,r=>n.persistence.referenceDelegate.addReference(t,e.targetId,r)).next(()=>Rn.forEach(e.ds,r=>n.persistence.referenceDelegate.removeReference(t,e.targetId,r)))))}catch(t){if(!On(t))throw t;xe(zo,"Failed to update sequence numbers: "+t)}for(const r of e){const t=r.targetId;if(!r.fromCache){const e=n.Fs.get(t),r=e.snapshotVersion,s=e.withLastLimboFreeSnapshotVersion(r);n.Fs=n.Fs.insert(t,s)}}}(r.localStore,i))}async function jc(t,e){const n=je(t);if(!n.currentUser.isEqual(e)){xe(yc,"User change. New user:",e.toKey());const t=await Ko(n.localStore,e);n.currentUser=e,function(t,e){t.Vu.forEach(t=>{t.forEach(t=>{t.reject(new qe(Be.CANCELLED,e))})}),t.Vu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,t.removedBatchIds,t.addedBatchIds),await Uc(n,t.Bs)}}function Bc(t,e){const n=je(t),r=n.Eu.get(e);if(r&&r.lu)return Os().add(r.key);{let t=Os();const r=n.Tu.get(e);if(!r)return t;for(const e of r){const r=n.Pu.get(e);t=t.unionWith(r.view.tu)}return t}}function qc(t){const e=je(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=Ac.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Bc.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Nc.bind(null,e),e.hu.J_=cc.bind(null,e.eventManager),e.hu.pu=uc.bind(null,e.eventManager),e}class $c{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=fa(t.databaseInfo.databaseId),this.sharedClientState=this.bu(t),this.persistence=this.Du(t),await this.persistence.start(),this.localStore=this.vu(t),this.gcScheduler=this.Cu(t,this.localStore),this.indexBackfillerScheduler=this.Fu(t,this.localStore)}Cu(t,e){return null}Fu(t,e){return null}vu(t){return function(t,e,n,r){return new Ho(t,e,n,r)}(this.persistence,new $o,t.initialUser,this.serializer)}Du(t){return new Vo(Uo.Vi,this.serializer)}bu(t){return new ta}async terminate(){var t,e;null===(t=this.gcScheduler)||void 0===t||t.stop(),null===(e=this.indexBackfillerScheduler)||void 0===e||e.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}$c.provider={build:()=>new $c};class zc extends $c{constructor(t){super(),this.cacheSizeBytes=t}Cu(t,e){Ue(this.persistence.referenceDelegate instanceof jo,46915);const n=this.persistence.referenceDelegate.garbageCollector;return new To(n,t.asyncQueue,e)}Du(t){const e=void 0!==this.cacheSizeBytes?vo.withCacheSize(this.cacheSizeBytes):vo.DEFAULT;return new Vo(t=>jo.Vi(t,e),this.serializer)}}class Gc{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=t=>Dc(this.syncEngine,t,1),this.remoteStore.remoteSyncer.handleCredentialChange=jc.bind(null,this.syncEngine),await async function(t,e){const n=je(t);e?(n.Ia.delete(2),await Ia(n)):e||(n.Ia.add(2),await Sa(n),n.Aa.set("Unknown"))}(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return new sc}createDatastore(t){const e=fa(t.databaseInfo.databaseId),n=function(t){return new la(t)}(t.databaseInfo);return function(t,e,n,r){return new ba(t,e,n,r)}(t.authCredentials,t.appCheckCredentials,n,e)}createRemoteStore(t){return function(t,e,n,r,s){return new Ta(t,e,n,r,s)}(this.localStore,this.datastore,t.asyncQueue,t=>Dc(this.syncEngine,t,0),ra.C()?new ra:new ea)}createSyncEngine(t,e){return function(t,e,n,r,s,i,o){const a=new bc(t,e,n,r,s,i);return o&&(a.fu=!0),a}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){var t,e;await async function(t){const e=je(t);xe(Ea,"RemoteStore shutting down."),e.Ia.add(5),await Sa(e),e.Ea.shutdown(),e.Aa.set("Unknown")}(this.remoteStore),null===(t=this.datastore)||void 0===t||t.terminate(),null===(e=this.eventManager)||void 0===e||e.terminate()}}Gc.provider={build:()=>new Gc};
/**
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
             */
/**
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
             */
class Hc{constructor(t){this.observer=t,this.muted=!1}next(t){this.muted||this.observer.next&&this.xu(this.observer.next,t)}error(t){this.muted||(this.observer.error?this.xu(this.observer.error,t):Le("Uncaught Error in snapshot listener:",t.toString()))}Ou(){this.muted=!0}xu(t,e){setTimeout(()=>{this.muted||t(e)},0)}}
/**
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
             */const Kc="FirestoreClient";class Qc{constructor(t,e,n,r,s){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=n,this.databaseInfo=r,this.user=Ne.UNAUTHENTICATED,this.clientId=tn.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(n,async t=>{xe(Kc,"Received user=",t.uid),await this.authCredentialListener(t),this.user=t}),this.appCheckCredentials.start(n,t=>(xe(Kc,"Received new app check token=",t),this.appCheckCredentialListener(t,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new $e;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const n=Za(e,"Failed to shutdown persistence");t.reject(n)}}),t.promise}}async function Wc(t,e){t.asyncQueue.verifyOperationInProgress(),xe(Kc,"Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async t=>{r.isEqual(t)||(await Ko(e.localStore,t),r=t)}),e.persistence.setDatabaseDeletedListener(()=>{Me("Terminating Firestore due to IndexedDb database deletion"),t.terminate().then(()=>{xe("Terminating Firestore due to IndexedDb database deletion completed successfully")}).catch(t=>{Me("Terminating Firestore due to IndexedDb database deletion failed",t)})}),t._offlineComponents=e}async function Xc(t,e){t.asyncQueue.verifyOperationInProgress();const n=await async function(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){xe(Kc,"Using user provided OfflineComponentProvider");try{await Wc(t,t._uninitializedComponentsProvider._offline)}catch(e){const r=e;if(!function(t){return"FirebaseError"===t.name?t.code===Be.FAILED_PRECONDITION||t.code===Be.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&t instanceof DOMException)||22===t.code||20===t.code||11===t.code}(r))throw r;Me("Error using user provided cache. Falling back to memory cache: "+r),await Wc(t,new $c)}}else xe(Kc,"Using default OfflineComponentProvider"),await Wc(t,new zc(void 0));return t._offlineComponents}(t);xe(Kc,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(t=>Wa(e.remoteStore,t)),t.setAppCheckTokenChangeListener((t,n)=>Wa(e.remoteStore,n)),t._onlineComponents=e}async function Jc(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(xe(Kc,"Using user provided OnlineComponentProvider"),await Xc(t,t._uninitializedComponentsProvider._online)):(xe(Kc,"Using default OnlineComponentProvider"),await Xc(t,new Gc))),t._onlineComponents}async function Yc(t){const e=await Jc(t),n=e.eventManager;return n.onListen=_c.bind(null,e.syncEngine),n.onUnlisten=Ic.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=Ec.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=Sc.bind(null,e.syncEngine),n}function Zc(t){const e={};return void 0!==t.timeoutSeconds&&(e.timeoutSeconds=t.timeoutSeconds),e
/**
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
             */}const tu=new Map,eu="firestore.googleapis.com",nu=!0;
/**
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
             */class ru{constructor(t){var e,n;if(void 0===t.host){if(void 0!==t.ssl)throw new qe(Be.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=eu,this.ssl=nu}else this.host=t.host,this.ssl=null!==(e=t.ssl)&&void 0!==e?e:nu;if(this.isUsingEmulator=void 0!==t.emulatorOptions,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,void 0===t.cacheSizeBytes)this.cacheSizeBytes=yo;else{if(-1!==t.cacheSizeBytes&&t.cacheSizeBytes<1048576)throw new qe(Be.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}(function(t,e,n,r){if(!0===e&&!0===r)throw new qe(Be.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)})("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===t.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Zc(null!==(n=t.experimentalLongPollingOptions)&&void 0!==n?n:{}),function(t){if(void 0!==t.timeoutSeconds){if(isNaN(t.timeoutSeconds))throw new qe(Be.INVALID_ARGUMENT,`invalid long polling timeout: ${t.timeoutSeconds} (must not be NaN)`);if(t.timeoutSeconds<5)throw new qe(Be.INVALID_ARGUMENT,`invalid long polling timeout: ${t.timeoutSeconds} (minimum allowed value is 5)`);if(t.timeoutSeconds>30)throw new qe(Be.INVALID_ARGUMENT,`invalid long polling timeout: ${t.timeoutSeconds} (maximum allowed value is 30)`)}}
/**
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
             */(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(t,e){return t.timeoutSeconds===e.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class su{constructor(t,e,n,r){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=n,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ru({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new qe(Be.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(t){if(this._settingsFrozen)throw new qe(Be.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ru(t),this._emulatorOptions=t.emulatorOptions||{},void 0!==t.credentials&&(this._authCredentials=function(t){if(!t)return new Ge;switch(t.type){case"firstParty":return new We(t.sessionIndex||"0",t.iamToken||null,t.authTokenFactory||null);case"provider":return t.client;default:throw new qe(Be.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const e=tu.get(t);e&&(xe("ComponentProvider","Removing Datastore"),tu.delete(t),e.terminate())}(this),Promise.resolve()}}class iu{constructor(t,e,n){this.converter=e,this._query=n,this.type="query",this.firestore=t}withConverter(t){return new iu(this.firestore,t,this._query)}}class ou{constructor(t,e,n){this.converter=e,this._key=n,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new au(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new ou(this.firestore,t,this._key)}toJSON(){return{type:ou._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,n){if(bn(e,ou._jsonSchema))return new ou(t,n||null,new dn(un.fromString(e.referencePath)))}}ou._jsonSchemaVersion="firestore/documentReference/1.0",ou._jsonSchema={type:wn("string",ou._jsonSchemaVersion),referencePath:wn("string")};class au extends iu{constructor(t,e,n){super(t,e,as(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new ou(this.firestore,null,new dn(t))}withConverter(t){return new au(this.firestore,t,this._path)}}function cu(t,e,...n){if(t=F(t),1===arguments.length&&(e=tn.newId()),fn("doc","path",e),t instanceof su){const r=un.fromString(e,...n);return pn(r),new ou(t,null,new dn(r))}{if(!(t instanceof ou||t instanceof au))throw new qe(Be.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(un.fromString(e,...n));return pn(r),new ou(t.firestore,t instanceof au?t.converter:null,new dn(r))}}
/**
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
             */const uu="AsyncQueue";class hu{constructor(t=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new pa(this,"async_queue_retry"),this.oc=()=>{const t=da();t&&xe(uu,"Visibility state changed to "+t.visibilityState),this.F_.y_()},this._c=t;const e=da();e&&"function"==typeof e.addEventListener&&e.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.ac(),this.uc(t)}enterRestrictedMode(t){if(!this.Xu){this.Xu=!0,this.rc=t||!1;const e=da();e&&"function"==typeof e.removeEventListener&&e.removeEventListener("visibilitychange",this.oc)}}enqueue(t){if(this.ac(),this.Xu)return new Promise(()=>{});const e=new $e;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Zu.push(t),this.cc()))}async cc(){if(0!==this.Zu.length){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(t){if(!On(t))throw t;xe(uu,"Operation failed with retryable error: "+t)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(t){const e=this._c.then(()=>(this.nc=!0,t().catch(t=>{throw this.tc=t,this.nc=!1,Le("INTERNAL UNHANDLED ERROR: ",lu(t)),t}).then(t=>(this.nc=!1,t))));return this._c=e,e}enqueueAfterDelay(t,e,n){this.ac(),this.sc.indexOf(t)>-1&&(e=0);const r=Ya.createAndSchedule(this,t,e,n,t=>this.lc(t));return this.ec.push(r),r}ac(){this.tc&&Ve(47125,{hc:lu(this.tc)})}verifyOperationInProgress(){}async Pc(){let t;do{t=this._c,await t}while(t!==this._c)}Tc(t){for(const e of this.ec)if(e.timerId===t)return!0;return!1}Ic(t){return this.Pc().then(()=>{this.ec.sort((t,e)=>t.targetTimeMs-e.targetTimeMs);for(const e of this.ec)if(e.skipDelay(),"all"!==t&&e.timerId===t)break;return this.Pc()})}dc(t){this.sc.push(t)}lc(t){const e=this.ec.indexOf(t);this.ec.splice(e,1)}}function lu(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+"\n"+t.stack),e
/**
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
             */}function du(t){return function(t,e){if("object"!=typeof t||null===t)return!1;const n=t;for(const r of e)if(r in n&&"function"==typeof n[r])return!0;return!1}
/**
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
             */(t,["next","error","complete"])}class fu extends su{constructor(t,e,n,r){super(t,e,n,r),this.type="firestore",this._queue=new hu,this._persistenceKey=(null==r?void 0:r.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new hu(t),this._firestoreClient=void 0,await t}}}function pu(t){if(t._terminated)throw new qe(Be.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||function(t){var e,n,r;const s=t._freezeSettings(),i=function(t,e,n,r){return new ar(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,Zc(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator)}(t._databaseId,(null===(e=t._app)||void 0===e?void 0:e.options.appId)||"",t._persistenceKey,s);t._componentsProvider||(null===(n=s.localCache)||void 0===n?void 0:n._offlineComponentProvider)&&(null===(r=s.localCache)||void 0===r?void 0:r._onlineComponentProvider)&&(t._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),t._firestoreClient=new Qc(t._authCredentials,t._appCheckCredentials,t._queue,i,t._componentsProvider&&function(t){const e=null==t?void 0:t._online.build();return{_offline:null==t?void 0:t._offline.build(e),_online:e}}(t._componentsProvider))}
/**
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
             */
/**
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
             */(t),t._firestoreClient}class gu{constructor(t="count",e){this._internalFieldPath=e,this.type="AggregateField",this.aggregateType=t}}class mu{constructor(t,e,n){this._userDataWriter=e,this._data=n,this.type="AggregateQuerySnapshot",this.query=t}data(){return this._userDataWriter.convertObjectMap(this._data)}}
/**
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
             */class yu{constructor(t){this._byteString=t}static fromBase64String(t){try{return new yu(Wn.fromBase64String(t))}catch(t){throw new qe(Be.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(t){return new yu(Wn.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:yu._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(bn(t,yu._jsonSchema))return yu.fromBase64String(t.bytes)}}yu._jsonSchemaVersion="firestore/bytes/1.0",yu._jsonSchema={type:wn("string",yu._jsonSchemaVersion),bytes:wn("string")};
/**
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
             */
class vu{constructor(...t){for(let e=0;e<t.length;++e)if(0===t[e].length)throw new qe(Be.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ln(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}
/**
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
             */class wu{constructor(t){this._methodName=t}}
/**
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
             */class bu{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new qe(Be.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new qe(Be.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return en(this._lat,t._lat)||en(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:bu._jsonSchemaVersion}}static fromJSON(t){if(bn(t,bu._jsonSchema))return new bu(t.latitude,t.longitude)}}bu._jsonSchemaVersion="firestore/geoPoint/1.0",bu._jsonSchema={type:wn("string",bu._jsonSchemaVersion),latitude:wn("number"),longitude:wn("number")};
/**
             * @license
             * Copyright 2024 Google LLC
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
             */
class _u{constructor(t){this._values=(t||[]).map(t=>t)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(t,e){if(t.length!==e.length)return!1;for(let n=0;n<t.length;++n)if(t[n]!==e[n])return!1;return!0}(this._values,t._values)}toJSON(){return{type:_u._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(bn(t,_u._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(t=>"number"==typeof t))return new _u(t.vectorValues);throw new qe(Be.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}_u._jsonSchemaVersion="firestore/vectorValue/1.0",_u._jsonSchema={type:wn("string",_u._jsonSchemaVersion),vectorValues:wn("object")};
/**
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
             */
const Eu=/^__.*__$/;class Tu{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return null!==this.fieldMask?new oi(t,this.data,this.fieldMask,e,this.fieldTransforms):new ii(t,this.data,e,this.fieldTransforms)}}class Iu{constructor(t,e,n){this.data=t,this.fieldMask=e,this.fieldTransforms=n}toMutation(t,e){return new oi(t,this.data,this.fieldMask,e,this.fieldTransforms)}}function Su(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw Ve(40011,{Ec:t})}}class Cu{constructor(t,e,n,r,s,i){this.settings=t,this.databaseId=e,this.serializer=n,this.ignoreUndefinedProperties=r,void 0===s&&this.Ac(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(t){return new Cu(Object.assign(Object.assign({},this.settings),t),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(t){var e;const n=null===(e=this.path)||void 0===e?void 0:e.child(t),r=this.Rc({path:n,mc:!1});return r.fc(t),r}gc(t){var e;const n=null===(e=this.path)||void 0===e?void 0:e.child(t),r=this.Rc({path:n,mc:!1});return r.Ac(),r}yc(t){return this.Rc({path:void 0,mc:!0})}wc(t){return Bu(t,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(t){return void 0!==this.fieldMask.find(e=>t.isPrefixOf(e))||void 0!==this.fieldTransforms.find(e=>t.isPrefixOf(e.field))}Ac(){if(this.path)for(let t=0;t<this.path.length;t++)this.fc(this.path.get(t))}fc(t){if(0===t.length)throw this.wc("Document fields must not be empty");if(Su(this.Ec)&&Eu.test(t))throw this.wc('Document fields cannot begin and end with "__"')}}class Au{constructor(t,e,n){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=n||fa(t)}Dc(t,e,n,r=!1){return new Cu({Ec:t,methodName:e,bc:n,path:ln.emptyPath(),mc:!1,Sc:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Du(t){const e=t._freezeSettings(),n=fa(t._databaseId);return new Au(t._databaseId,!!e.ignoreUndefinedProperties,n)}function Nu(t,e,n,r,s,i={}){const o=t.Dc(i.merge||i.mergeFields?2:0,e,n,s);Vu("Data must be an object, but it was:",o,r);const a=Mu(r,o);let c,u;if(i.merge)c=new Kn(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const t=[];for(const r of i.mergeFields){const s=Fu(e,r,n);if(!o.contains(s))throw new qe(Be.INVALID_ARGUMENT,`Field '${s}' is specified in your field mask but missing from your input data.`);qu(t,s)||t.push(s)}c=new Kn(t),u=o.fieldTransforms.filter(t=>c.covers(t.field))}else c=null,u=o.fieldTransforms;return new Tu(new Rr(a),c,u)}class ku extends wu{_toFieldTransform(t){if(2!==t.Ec)throw 1===t.Ec?t.wc(`${this._methodName}() can only appear at the top level of your update data`):t.wc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return t.fieldMask.push(t.path),null}isEqual(t){return t instanceof ku}}class Ru extends wu{_toFieldTransform(t){return new Ws(t.path,new Bs)}isEqual(t){return t instanceof Ru}}function Ou(t,e,n,r){const s=t.Dc(1,e,n);Vu("Data must be an object, but it was:",s,r);const i=[],o=Rr.empty();jn(r,(t,r)=>{const a=ju(e,t,n);r=F(r);const c=s.gc(a);if(r instanceof ku)i.push(a);else{const t=Lu(r,c);null!=t&&(i.push(a),o.set(a,t))}});const a=new Kn(i);return new Iu(o,a,s.fieldTransforms)}function xu(t,e,n,r,s,i){const o=t.Dc(1,e,n),a=[Fu(e,r,n)],c=[s];if(i.length%2!=0)throw new qe(Be.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let d=0;d<i.length;d+=2)a.push(Fu(e,i[d])),c.push(i[d+1]);const u=[],h=Rr.empty();for(let d=a.length-1;d>=0;--d)if(!qu(u,a[d])){const t=a[d];let e=c[d];e=F(e);const n=o.gc(t);if(e instanceof ku)u.push(t);else{const r=Lu(e,n);null!=r&&(u.push(t),h.set(t,r))}}const l=new Kn(u);return new Iu(h,l,o.fieldTransforms)}function Lu(t,e){if(Pu(t=F(t)))return Vu("Unsupported field value:",e,t),Mu(t,e);if(t instanceof wu)return function(t,e){if(!Su(e.Ec))throw e.wc(`${t._methodName}() can only be used with update() and set()`);if(!e.path)throw e.wc(`${t._methodName}() is not currently supported inside arrays`);const n=t._toFieldTransform(e);n&&e.fieldTransforms.push(n)}(t,e),null;if(void 0===t&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.mc&&4!==e.Ec)throw e.wc("Nested arrays are not supported");return function(t,e){const n=[];let r=0;for(const s of t){let t=Lu(s,e.yc(r));null==t&&(t={nullValue:"NULL_VALUE"}),n.push(t),r++}return{arrayValue:{values:n}}}(t,e)}return function(t,e){if(null===(t=F(t)))return{nullValue:"NULL_VALUE"};if("number"==typeof t)return Ps(e.serializer,t);if("boolean"==typeof t)return{booleanValue:t};if("string"==typeof t)return{stringValue:t};if(t instanceof Date){const n=Tn.fromDate(t);return{timestampValue:Ui(e.serializer,n)}}if(t instanceof Tn){const n=new Tn(t.seconds,1e3*Math.floor(t.nanoseconds/1e3));return{timestampValue:Ui(e.serializer,n)}}if(t instanceof bu)return{geoPointValue:{latitude:t.latitude,longitude:t.longitude}};if(t instanceof yu)return{bytesValue:ji(e.serializer,t._byteString)};if(t instanceof ou){const n=e.databaseId,r=t.firestore._databaseId;if(!r.isEqual(n))throw e.wc(`Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`);return{referenceValue:$i(t.firestore._databaseId||e.databaseId,t._key.path)}}if(t instanceof _u)return function(t,e){return{mapValue:{fields:{[hr]:{stringValue:fr},[pr]:{arrayValue:{values:t.toArray().map(t=>{if("number"!=typeof t)throw e.wc("VectorValues must only contain numeric values.");return Ls(e.serializer,t)})}}}}}}(t,e);throw e.wc(`Unsupported field value: ${yn(t)}`)}(t,e)}function Mu(t,e){const n={};return Bn(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):jn(t,(t,r)=>{const s=Lu(r,e.Vc(t));null!=s&&(n[t]=s)}),{mapValue:{fields:n}}}function Pu(t){return!("object"!=typeof t||null===t||t instanceof Array||t instanceof Date||t instanceof Tn||t instanceof bu||t instanceof yu||t instanceof ou||t instanceof wu||t instanceof _u)}function Vu(t,e,n){if(!Pu(n)||!mn(n)){const r=yn(n);throw"an object"===r?e.wc(t+" a custom object"):e.wc(t+" "+r)}}function Fu(t,e,n){if((e=F(e))instanceof vu)return e._internalPath;if("string"==typeof e)return ju(t,e);throw Bu("Field path arguments must be of type string or ",t,!1,void 0,n)}const Uu=new RegExp("[~\\*/\\[\\]]");function ju(t,e,n){if(e.search(Uu)>=0)throw Bu(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new vu(...e.split("."))._internalPath}catch(r){throw Bu(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Bu(t,e,n,r,s){const i=r&&!r.isEmpty(),o=void 0!==s;let a=`Function ${e}() called with invalid data`;n&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${r}`),o&&(c+=` in document ${s}`),c+=")"),new qe(Be.INVALID_ARGUMENT,a+t+c)}function qu(t,e){return t.some(t=>t.isEqual(e))}
/**
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
             */class $u{constructor(t,e,n,r,s){this._firestore=t,this._userDataWriter=e,this._key=n,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new ou(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const t=new zu(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(Gu("DocumentSnapshot.get",t));if(null!==e)return this._userDataWriter.convertValue(e)}}}class zu extends $u{data(){return super.data()}}function Gu(t,e){return"string"==typeof e?ju(t,e):e instanceof vu?e._internalPath:e._delegate._internalPath}
/**
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
             */function Hu(t){if("L"===t.limitType&&0===t.explicitOrderBy.length)throw new qe(Be.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Ku{}class Qu extends Ku{}class Wu extends Qu{constructor(t,e,n){super(),this._field=t,this._op=e,this._value=n,this.type="where"}static _create(t,e,n){return new Wu(t,e,n)}_apply(t){const e=this._parse(t);return eh(t._query,e),new iu(t.firestore,t.converter,fs(t._query,e))}_parse(t){const e=Du(t.firestore),n=function(t,e,n,r,s,i,o){let a;if(s.isKeyField()){if("array-contains"===i||"array-contains-any"===i)throw new qe(Be.INVALID_ARGUMENT,`Invalid Query. You can't perform '${i}' queries on documentId().`);if("in"===i||"not-in"===i){th(o,i);const e=[];for(const n of o)e.push(Zu(r,t,n));a={arrayValue:{values:e}}}else a=Zu(r,t,o)}else"in"!==i&&"not-in"!==i&&"array-contains-any"!==i||th(o,i),a=function(t,e,n,r=!1){return Lu(n,t.Dc(r?4:3,e))}(n,e,o,"in"===i||"not-in"===i);return jr.create(s,i,a)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value);return n}}class Xu extends Ku{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new Xu(t,e)}_parse(t){const e=this._queryConstraints.map(e=>e._parse(t)).filter(t=>t.getFilters().length>0);return 1===e.length?e[0]:Br.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return 0===e.getFilters().length?t:(function(t,e){let n=t;const r=e.getFlattenedFilters();for(const s of r)eh(n,s),n=fs(n,s)}(t._query,e),new iu(t.firestore,t.converter,fs(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return"and"===this.type?"and":"or"}}class Ju extends Qu{constructor(t,e){super(),this._field=t,this._direction=e,this.type="orderBy"}static _create(t,e){return new Ju(t,e)}_apply(t){const e=function(t,e,n){if(null!==t.startAt)throw new qe(Be.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(null!==t.endAt)throw new qe(Be.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Vr(e,n)}(t._query,this._field,this._direction);return new iu(t.firestore,t.converter,function(t,e){const n=t.explicitOrderBy.concat([e]);return new os(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}(t._query,e))}}class Yu extends Qu{constructor(t,e,n){super(),this.type=t,this._limit=e,this._limitType=n}static _create(t,e,n){return new Yu(t,e,n)}_apply(t){return new iu(t.firestore,t.converter,ps(t._query,this._limit,this._limitType))}}function Zu(t,e,n){if("string"==typeof(n=F(n))){if(""===n)throw new qe(Be.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!us(e)&&-1!==n.indexOf("/"))throw new qe(Be.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(un.fromString(n));if(!dn.isDocumentKey(r))throw new qe(Be.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Ir(t,new dn(r))}if(n instanceof ou)return Ir(t,n._key);throw new qe(Be.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${yn(n)}.`)}function th(t,e){if(!Array.isArray(t)||0===t.length)throw new qe(Be.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function eh(t,e){const n=function(t,e){for(const n of t)for(const t of n.getFlattenedFilters())if(e.indexOf(t.op)>=0)return t.op;return null}(t.filters,function(t){switch(t){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(null!==n)throw n===e.op?new qe(Be.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new qe(Be.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class nh{convertValue(t,e="none"){switch(gr(t)){case 0:return null;case 1:return t.booleanValue;case 2:return Yn(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(Zn(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw Ve(62114,{value:t})}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const n={};return jn(t,(t,r)=>{n[t]=this.convertValue(r,e)}),n}convertVectorValue(t){var e,n,r;const s=null===(r=null===(n=null===(e=t.fields)||void 0===e?void 0:e[pr].arrayValue)||void 0===n?void 0:n.values)||void 0===r?void 0:r.map(t=>Yn(t.doubleValue));return new _u(s)}convertGeoPoint(t){return new bu(Yn(t.latitude),Yn(t.longitude))}convertArray(t,e){return(t.values||[]).map(t=>this.convertValue(t,e))}convertServerTimestamp(t,e){switch(e){case"previous":const n=ir(t);return null==n?null:this.convertValue(n,e);case"estimate":return this.convertTimestamp(or(t));default:return null}}convertTimestamp(t){const e=Jn(t);return new Tn(e.seconds,e.nanos)}convertDocumentKey(t,e){const n=un.fromString(t);Ue(uo(n),9688,{name:t});const r=new ur(n.get(1),n.get(3)),s=new dn(n.popFirst(5));return r.isEqual(e)||Le(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),s}}
/**
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
             */function rh(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}class sh{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class ih extends $u{constructor(t,e,n,r,s,i){super(t,e,n,r,i),this._firestore=t,this._firestoreImpl=t,this.metadata=s}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new oh(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const n=this._document.data.field(Gu("DocumentSnapshot.get",t));if(null!==n)return this._userDataWriter.convertValue(n,e.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new qe(Be.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,e={};return e.type=ih._jsonSchemaVersion,e.bundle="",e.bundleSource="DocumentSnapshot",e.bundleName=this._key.toString(),t&&t.isValidDocument()&&t.isFoundDocument()?(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),e.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),e):e}}ih._jsonSchemaVersion="firestore/documentSnapshot/1.0",ih._jsonSchema={type:wn("string",ih._jsonSchemaVersion),bundleSource:wn("string","DocumentSnapshot"),bundleName:wn("string"),bundle:wn("string")};class oh extends ih{data(t={}){return super.data(t)}}class ah{constructor(t,e,n,r){this._firestore=t,this._userDataWriter=e,this._snapshot=r,this.metadata=new sh(r.hasPendingWrites,r.fromCache),this.query=n}get docs(){const t=[];return this.forEach(e=>t.push(e)),t}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(t,e){this._snapshot.docs.forEach(n=>{t.call(e,new oh(this._firestore,this._userDataWriter,n.key,n,new sh(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new qe(Be.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(t,e){if(t._snapshot.oldDocs.isEmpty()){let e=0;return t._snapshot.docChanges.map(n=>{const r=new oh(t._firestore,t._userDataWriter,n.doc.key,n.doc,new sh(t._snapshot.mutatedKeys.has(n.doc.key),t._snapshot.fromCache),t.query.converter);return n.doc,{type:"added",doc:r,oldIndex:-1,newIndex:e++}})}{let n=t._snapshot.oldDocs;return t._snapshot.docChanges.filter(t=>e||3!==t.type).map(e=>{const r=new oh(t._firestore,t._userDataWriter,e.doc.key,e.doc,new sh(t._snapshot.mutatedKeys.has(e.doc.key),t._snapshot.fromCache),t.query.converter);let s=-1,i=-1;return 0!==e.type&&(s=n.indexOf(e.doc.key),n=n.delete(e.doc.key)),1!==e.type&&(n=n.add(e.doc),i=n.indexOf(e.doc.key)),{type:ch(e.type),doc:r,oldIndex:s,newIndex:i}})}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new qe(Be.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=ah._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=tn.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const e=[],n=[],r=[];return this.docs.forEach(t=>{null!==t._document&&(e.push(t._document),n.push(this._userDataWriter.convertObjectMap(t._document.data.value.mapValue.fields,"previous")),r.push(t.ref.path))}),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function ch(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Ve(61501,{type:t})}}ah._jsonSchemaVersion="firestore/querySnapshot/1.0",ah._jsonSchema={type:wn("string",ah._jsonSchemaVersion),bundleSource:wn("string","QuerySnapshot"),bundleName:wn("string"),bundle:wn("string")};class uh extends nh{constructor(t){super(),this.firestore=t}convertBytes(t){return new yu(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new ou(this.firestore,null,e)}}function hh(t,e){return function(t,e){const n=new $e;return t.asyncQueue.enqueueAndForget(async()=>Cc(await function(t){return Jc(t).then(t=>t.syncEngine)}(t),e,n)),n.promise}(pu(t),e)}function lh(t,e,n){const r=n.docs.get(e._key),s=new uh(t);return new ih(t,s,e._key,r,new sh(n.hasPendingWrites,n.fromCache),e.converter)}class dh{constructor(t,e){this._firestore=t,this._commitHandler=e,this._mutations=[],this._committed=!1,this._dataReader=Du(t)}set(t,e,n){this._verifyNotCommitted();const r=fh(t,this._firestore),s=rh(r.converter,e,n),i=Nu(this._dataReader,"WriteBatch.set",r._key,s,null!==r.converter,n);return this._mutations.push(i.toMutation(r._key,Js.none())),this}update(t,e,n,...r){this._verifyNotCommitted();const s=fh(t,this._firestore);let i;return i="string"==typeof(e=F(e))||e instanceof vu?xu(this._dataReader,"WriteBatch.update",s._key,e,n,r):Ou(this._dataReader,"WriteBatch.update",s._key,e),this._mutations.push(i.toMutation(s._key,Js.exists(!0))),this}delete(t){this._verifyNotCommitted();const e=fh(t,this._firestore);return this._mutations=this._mutations.concat(new hi(e._key,Js.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new qe(Be.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function fh(t,e){if((t=F(t)).firestore!==e)throw new qe(Be.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}!function(t,e=!0){!function(t){ke=t}(ee),Xt(new U("firestore",(t,{instanceIdentifier:n,options:r})=>{const s=t.getProvider("app").getImmediate(),i=new fu(new Ke(t.getProvider("auth-internal")),new Je(s,t.getProvider("app-check-internal")),function(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new qe(Be.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new ur(t.options.projectId,e)}(s,n),s);return r=Object.assign({useFetchStreams:e},r),i._setSettings(r),i},"PUBLIC").setMultipleInstances(!0)),se(Ae,De,t),se(Ae,De,"esm2017")}()}}});

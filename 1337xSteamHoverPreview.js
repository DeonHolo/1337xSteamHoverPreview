// ==UserScript==
// @name         1337x - Steam Hover Preview 
// @namespace    https://greasyfork.org/en/users/1340389-deonholo
// @version      5.03
// @description  Actual Steam tags first, validated base-game matching, reviews, screenshots, trailers, and quick site actions
// @icon         https://greasyfork.s3.us-east-2.amazonaws.com/x432yc9hx5t6o2gbe9ccr7k5l6u8
// @author       DeonHolo
// @license      MIT
// @match        *://*.1337x.to/*
// @match        *://*.1337x.ws/*
// @match        *://*.1337x.is/*
// @match        *://*.1337x.gd/*
// @match        *://*.x1337x.cc/*
// @match        *://*.1337x.st/*
// @match        *://*.x1337x.ws/*
// @match        *://*.1337x.eu/*
// @match        *://*.1337x.se/*
// @match        *://*.x1337x.eu/*
// @match        *://*.x1337x.se/*
// @match        http://l337xdarkkaqfwzntnfk5bmoaroivtl6xsbatabvlb52umg6v3ch44yd.onion/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_addValueChangeListener
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// @grant        GM.registerMenuCommand
// @grant        GM.addValueChangeListener
// @connect      api.steampowered.com
// @connect      store.steampowered.com
// @connect      steamcdn-a.akamaihd.net
// @run-at       document-idle
// ==/UserScript==

// Generated from source; edit src/ and rebuild. Shared core 1.0.9.
// Build SHA-256: 75d425a59da72148dfec561fd42e282eb02750d316d3f9cfdf0169983ca2ba30
(() => {
'use strict';

// Source: vendor/steam-hover-core/src/assets/fuse.basic.min.mjs
const SteamTextFuse = (() => {
/*
Fuse.js 7.5.0: unmodified upstream basic ESM with the full upstream license prepended.
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "{}"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright 2017 Kirollos Risk

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/
/**
 * Fuse.js v7.5.0 - Lightweight fuzzy-search (http://fusejs.io)
 *
 * Copyright (c) 2026 Kiro Risk (http://kiro.me)
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
function e(e){return Array.isArray?Array.isArray(e):u(e)===`[object Array]`}function t(e){if(typeof e==`string`)return e;if(typeof e==`bigint`)return e.toString();let t=e+``;return t==`0`&&1/e==-1/0?`-0`:t}function n(e){return e==null?``:t(e)}function r(e){return typeof e==`string`}function i(e){return typeof e==`number`}function a(e){return e===!0||e===!1||s(e)&&u(e)==`[object Boolean]`}function o(e){return typeof e==`object`}function s(e){return o(e)&&e!==null}function c(e){return e!=null}function l(e){return!e.trim().length}function u(e){return e==null?e===void 0?`[object Undefined]`:`[object Null]`:Object.prototype.toString.call(e)}const d=`Invalid doc index: must be a non-negative integer within the bounds of the docs array`,f=e=>`Pattern length exceeds max of ${e}.`,p=e=>`Missing ${e} property in key`,m=e=>`Property 'weight' in key '${e}' must be a positive integer`,h=Object.prototype.hasOwnProperty;var g=class{constructor(e){this._keys=[],this._keyMap={};let t=0;e.forEach(e=>{let n=_(e);this._keys.push(n),this._keyMap[n.id]=n,t+=n.weight}),this._keys.forEach(e=>{e.weight/=t})}get(e){return this._keyMap[e]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}};function _(t){let n=null,i=null,a=null,o=1,s=null;if(r(t)||e(t))a=t,n=v(t),i=y(t);else{if(!h.call(t,`name`))throw Error(p(`name`));let e=t.name;if(a=e,h.call(t,`weight`)&&t.weight!==void 0&&(o=t.weight,o<=0))throw Error(m(y(e)));n=v(e),i=y(e),s=t.getFn??null}return{path:n,id:i,weight:o,src:a,getFn:s}}function v(t){return e(t)?t:t.split(`.`)}function y(t){return e(t)?t.join(`.`):t}function b(t,o){let s=[],l=!1,u=(t,o,d,f)=>{if(c(t))if(!o[d])s.push(f===void 0?t:{v:t,i:f});else{let p=t[o[d]];if(!c(p))return;if(d===o.length-1&&(r(p)||i(p)||a(p)||typeof p==`bigint`))s.push(f===void 0?n(p):{v:n(p),i:f});else if(e(p)){l=!0;for(let e=0,t=p.length;e<t;e+=1)u(p[e],o,d+1,e)}else o.length&&u(p,o,d+1,f)}};return u(t,r(o)?o.split(`.`):o,0),l?s:s[0]}const x={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},S={isCaseSensitive:!1,ignoreDiacritics:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(e,t)=>e.score===t.score?e.idx<t.idx?-1:1:e.score<t.score?-1:1},C={location:0,threshold:.6,distance:100},w={useExtendedSearch:!1,useTokenSearch:!1,tokenize:void 0,tokenMatch:`any`,getFn:b,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1},T=Object.freeze({...S,...x,...C,...w});function E(e){return e>=9&&e<=13||e===32||e===160}function D(e=1,t=3){let n=new Map,r=10**t;return{get(t){let i=0,a=!1;for(let e=0;e<t.length;e++)E(t.charCodeAt(e))?a=!1:a||(i++,a=!0);if(i===0&&(i=1),n.has(i))return n.get(i);let o=Math.round(r/i**(.5*e))/r;return n.set(i,o),o},clear(){n.clear()}}}var O=class{constructor({getFn:e=T.getFn,fieldNormWeight:t=T.fieldNormWeight}={}){this.norm=D(t,3),this.getFn=e,this.isCreated=!1,this.docs=[],this.keys=[],this._keysMap={},this.setIndexRecords()}setSources(e=[]){this.docs=e}setIndexRecords(e=[]){this.records=e}setKeys(e=[]){this.keys=e,this._keysMap={},e.forEach((e,t)=>{this._keysMap[e.id]=t})}create(){if(this.isCreated||!this.docs.length)return;this.isCreated=!0;let e=this.docs.length;this.records=Array(e);let t=0;if(r(this.docs[0]))for(let n=0;n<e;n++){let e=this._createStringRecord(this.docs[n],n);e&&(this.records[t++]=e)}else for(let n=0;n<e;n++)this.records[t++]=this._createObjectRecord(this.docs[n],n);this.records.length=t,this.norm.clear()}add(e,t){if(!Number.isInteger(t)||t<0)throw Error(d);if(r(e)){let n=this._createStringRecord(e,t);return n&&this.records.push(n),n}let n=this._createObjectRecord(e,t);return this.records.push(n),n}removeAt(e){if(!Number.isInteger(e)||e<0)throw Error(d);for(let t=0,n=this.records.length;t<n;t+=1)if(this.records[t].i===e){this.records.splice(t,1);break}for(let t=0,n=this.records.length;t<n;t+=1)this.records[t].i>e&&--this.records[t].i}removeAll(e){let t=new Set;for(let n of e)Number.isInteger(n)&&n>=0&&t.add(n);if(t.size===0)return;this.records=this.records.filter(e=>!t.has(e.i));let n=Array.from(t).sort((e,t)=>e-t);for(let e of this.records){let t=0,r=n.length;for(;t<r;){let i=t+r>>>1;n[i]<e.i?t=i+1:r=i}e.i-=t}}getValueForItemAtKeyId(e,t){return e[this._keysMap[t]]}size(){return this.records.length}_createStringRecord(e,t){return!c(e)||l(e)?null:{v:e,i:t,n:this.norm.get(e)}}_createObjectRecord(t,i){let a={i,$:{}};for(let i=0,o=this.keys.length;i<o;i++){let o=this.keys[i],s=o.getFn?o.getFn(t):this.getFn(t,o.path);if(c(s)){if(e(s)){let e=[];for(let t=0,i=s.length;t<i;t+=1){let i=s[t];if(c(i)){if(r(i)){if(!l(i)){let n={v:i,i:t,n:this.norm.get(i)};e.push(n)}}else if(c(i.v)){let t=r(i.v)?i.v:n(i.v);if(!l(t)){let n={v:t,i:i.i,n:this.norm.get(t)};e.push(n)}}}}a.$[i]=e}else if(r(s)&&!l(s)){let e={v:s,n:this.norm.get(s)};a.$[i]=e}}}return a}toJSON(){return{keys:this.keys.map(({getFn:e,...t})=>t),records:this.records}}};function k(e,t,{getFn:n=T.getFn,fieldNormWeight:r=T.fieldNormWeight}={}){let i=new O({getFn:n,fieldNormWeight:r});return i.setKeys(e.map(_)),i.setSources(t),i.create(),i}function A(e,{getFn:t=T.getFn,fieldNormWeight:n=T.fieldNormWeight}={}){let{keys:r,records:i}=e,a=new O({getFn:t,fieldNormWeight:n});return a.setKeys(r),a.setIndexRecords(i),a}function j(e=[],t=T.minMatchCharLength){let n=[],r=-1,i=-1,a=0;for(let o=e.length;a<o;a+=1){let o=e[a];o&&r===-1?r=a:!o&&r!==-1&&(i=a-1,i-r+1>=t&&n.push([r,i]),r=-1)}return e[a-1]&&a-r>=t&&n.push([r,a-1]),n}function M(e,t,n,{location:r=T.location,distance:i=T.distance,threshold:a=T.threshold,findAllMatches:o=T.findAllMatches,minMatchCharLength:s=T.minMatchCharLength,includeMatches:c=T.includeMatches,ignoreLocation:l=T.ignoreLocation}={}){if(t.length>32)throw Error(f(32));let u=t.length,d=e.length,p=Math.max(0,Math.min(r,d)),m=a,h=p,g=(e,t)=>{let n=e/u;if(l)return n;let r=Math.abs(p-t);return i?n+r/i:r?1:n},_=s>1||c,v=_?Array(d):[],y;for(;(y=e.indexOf(t,h))>-1;){let e=g(0,y);if(m=Math.min(e,m),h=y+u,_){let e=0;for(;e<u;)v[y+e]=1,e+=1}}h=-1;let b=[],x=1,S=0,C=u+d,w=1<<u-1;for(let t=0;t<u;t+=1){let r=0,i=C;for(;r<i;)g(t,p+i)<=m?r=i:C=i,i=Math.floor((C-r)/2+r);C=i;let a=Math.max(1,p-i+1),s=o?d:Math.min(p+i,d)+u,c=Array(s+2);c[s+1]=(1<<t)-1;for(let r=s;r>=a;--r){let i=r-1,o=n[e[i]];if(c[r]=(c[r+1]<<1|1)&o,t&&(c[r]|=(b[r+1]|b[r])<<1|1|b[r+1]),c[r]&w&&(x=g(t,i),x<=m)){if(m=x,h=i,S=t,h<=p)break;a=Math.max(1,2*p-h)}}if(g(t+1,p)>m)break;b=c}if(_&&h>=0){let t=Math.min(d-1,h+u-1+S);for(let r=h;r<=t;r+=1)n[e[r]]&&(v[r]=1)}let E={isMatch:h>=0,score:Math.max(.001,x)};if(_){let e=j(v,s);e.length?c&&(E.indices=e):E.isMatch=!1}return E}function N(e){let t={};for(let n=0,r=e.length;n<r;n+=1){let i=e.charAt(n);t[i]=(t[i]||0)|1<<r-n-1}return t}function P(e){if(e.length<=1)return e;e.sort((e,t)=>e[0]-t[0]||e[1]-t[1]);let t=[e[0]];for(let n=1,r=e.length;n<r;n+=1){let r=t[t.length-1],i=e[n];i[0]<=r[1]+1?r[1]=Math.max(r[1],i[1]):t.push(i)}return t}const F={ł:`l`,Ł:`L`,đ:`d`,Đ:`D`,ø:`o`,Ø:`O`,ħ:`h`,Ħ:`H`,ŧ:`t`,Ŧ:`T`,ı:`i`,ß:`ss`},I=RegExp(`[`+Object.keys(F).join(``)+`]`,`g`),L=typeof String.prototype.normalize==`function`?e=>e.normalize(`NFD`).replace(/[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D3-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C04\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA8FF\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/g,``).replace(I,e=>F[e]):e=>e;var R=class{constructor(e,{location:t=T.location,threshold:n=T.threshold,distance:r=T.distance,includeMatches:i=T.includeMatches,findAllMatches:a=T.findAllMatches,minMatchCharLength:o=T.minMatchCharLength,isCaseSensitive:s=T.isCaseSensitive,ignoreDiacritics:c=T.ignoreDiacritics,ignoreLocation:l=T.ignoreLocation}={}){if(this.options={location:t,threshold:n,distance:r,includeMatches:i,findAllMatches:a,minMatchCharLength:o,isCaseSensitive:s,ignoreDiacritics:c,ignoreLocation:l},e=s?e:e.toLowerCase(),e=c?L(e):e,this.pattern=e,this.chunks=[],!this.pattern.length)return;let u=(e,t)=>{this.chunks.push({pattern:e,alphabet:N(e),startIndex:t})},d=this.pattern.length;if(d>32){let e=0,t=d%32,n=d-t;for(;e<n;)u(this.pattern.substr(e,32),e),e+=32;if(t){let e=d-32;u(this.pattern.substr(e),e)}}else u(this.pattern,0)}searchIn(e){let{isCaseSensitive:t,ignoreDiacritics:n,includeMatches:r}=this.options;if(e=t?e:e.toLowerCase(),e=n?L(e):e,this.pattern===e){if(e.length<this.options.minMatchCharLength)return{isMatch:!1,score:1};let t={isMatch:!0,score:0};return r&&(t.indices=[[0,e.length-1]]),t}let{location:i,distance:a,threshold:o,findAllMatches:s,minMatchCharLength:c,ignoreLocation:l}=this.options,u=[],d=0,f=!1;this.chunks.forEach(({pattern:t,alphabet:n,startIndex:p})=>{let{isMatch:m,score:h,indices:g}=M(e,t,n,{location:i+p,distance:a,threshold:o,findAllMatches:s,minMatchCharLength:c,includeMatches:r,ignoreLocation:l});m&&(f=!0),d+=h,m&&g&&u.push(...g)});let p={isMatch:f,score:f?d/this.chunks.length:1};return f&&r&&(p.indices=P(u)),p}};const z=[];function B(...e){z.push(...e)}function V(e,t){for(let n=0,r=z.length;n<r;n+=1){let r=z[n];if(r.condition(e,t))return new r(e,t)}return new R(e,t)}function H(e,{ignoreFieldNorm:t=T.ignoreFieldNorm}){let n=1;return e.forEach(({key:e,norm:r,score:i})=>{let a=e?e.weight:null;n*=(i===0&&a?2**-52:i)**+((a||1)*(t?1:r))}),n}function U(e,{ignoreFieldNorm:t=T.ignoreFieldNorm}){e.forEach(e=>{e.score=H(e.matches,{ignoreFieldNorm:t})})}var W=class{constructor(e,t){this.limit=e,this.heap=[],this.comparator=t}get size(){return this.heap.length}insert(e){this.size<this.limit?(this.heap.push(e),this._bubbleUp(this.size-1)):this.comparator(e,this.heap[0])<0&&(this.heap[0]=e,this._sinkDown(0))}extractSorted(){return this.heap.sort(this.comparator)}_bubbleUp(e){let t=this.heap;for(;e>0;){let n=e-1>>1;if(this.comparator(t[e],t[n])<=0)break;let r=t[e];t[e]=t[n],t[n]=r,e=n}}_sinkDown(e){let t=this.heap,n=t.length,r=e;do{e=r;let i=2*e+1,a=2*e+2;if(i<n&&this.comparator(t[i],t[r])>0&&(r=i),a<n&&this.comparator(t[a],t[r])>0&&(r=a),r!==e){let n=t[e];t[e]=t[r],t[r]=n}}while(r!==e)}};function G(e){let t=[];return e.matches.forEach(e=>{if(!c(e.indices)||!e.indices.length)return;let n={indices:e.indices,value:e.value};e.key&&(n.key=e.key.id),e.idx>-1&&(n.refIndex=e.idx),t.push(n)}),t}function K(e,t,{includeMatches:n=T.includeMatches,includeScore:r=T.includeScore}={}){return e.map(e=>{let{idx:i}=e,a={item:t[i],refIndex:i};return n&&(a.matches=G(e)),r&&(a.score=e.score),a})}const q=/[\p{L}\p{M}\p{N}_]+/gu;function J(e){return typeof e==`function`?t=>e(t):e instanceof RegExp?(e.global,t=>t.match(e)||[]):e=>e.match(q)||[]}function Y({isCaseSensitive:e=!1,ignoreDiacritics:t=!1,tokenize:n}={}){let r=J(n);return{tokenize(n){return e||(n=n.toLowerCase()),t&&(n=L(n)),r(n)}}}function X(e,t,n,r){let i=r.tokenize(t);if(!i.length)return;e.fieldCount++,e.docFieldCount.set(n,(e.docFieldCount.get(n)||0)+1);let a=new Set(i),o=e.docTermFieldHits.get(n);o||(o=new Map,e.docTermFieldHits.set(n,o));for(let t of a)o.set(t,(o.get(t)||0)+1),e.df.set(t,(e.df.get(t)||0)+1)}function Z(e,t,n,r){let{i,v:a,$:o}=t;if(a!==void 0){X(e,a,i,r);return}if(o)for(let t=0;t<n;t++){let n=o[t];if(n)if(Array.isArray(n))for(let t of n)X(e,t.v,i,r);else X(e,n.v,i,r)}}function ee(e,t,n){let r={fieldCount:0,df:new Map,docFieldCount:new Map,docTermFieldHits:new Map};for(let i of e)Z(r,i,t,n);return r}function te(e,t,n,r){Z(e,t,n,r)}function ne(e,t){let n=e.docFieldCount.get(t);if(n===void 0)return;e.fieldCount-=n,e.docFieldCount.delete(t);let r=e.docTermFieldHits.get(t);if(r){for(let[t,n]of r){let r=(e.df.get(t)||0)-n;r<=0?e.df.delete(t):e.df.set(t,r)}e.docTermFieldHits.delete(t)}}function Q(e,t){if(t.length===0)return;let n=Array.from(new Set(t)).sort((e,t)=>e-t);for(let t of n)ne(e,t);let r=e=>{let t=0,r=n.length;for(;t<r;){let i=t+r>>>1;n[i]<e?t=i+1:r=i}return e-t},i=n[0],a=new Map;for(let[t,n]of e.docFieldCount)a.set(t>i?r(t):t,n);e.docFieldCount=a;let o=new Map;for(let[t,n]of e.docTermFieldHits)o.set(t>i?r(t):t,n);e.docTermFieldHits=o}var $=class{constructor(e,t,n){if(this.options={...T,...t},this.options.useExtendedSearch)throw Error(`Extended search is not available`);if(this.options.useTokenSearch)throw Error(`Token search is not available`);this._keyStore=new g(this.options.keys),this._docs=e,this._myIndex=null,this._invertedIndex=null,this.setCollection(e,n),this._lastQuery=null,this._lastSearcher=null}_getSearcher(e){if(this._lastQuery===e)return this._lastSearcher;let t=V(e,this._invertedIndex?{...this.options,_invertedIndex:this._invertedIndex}:this.options);return this._lastQuery=e,this._lastSearcher=t,t}setCollection(e,t){if(this._docs=e,t&&!(t instanceof O))throw Error(`Incorrect 'index' type`);if(this._myIndex=t||k(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight}),this.options.useTokenSearch){let e=Y({isCaseSensitive:this.options.isCaseSensitive,ignoreDiacritics:this.options.ignoreDiacritics,tokenize:this.options.tokenize});this._invertedIndex=ee(this._myIndex.records,this._myIndex.keys.length,e)}this._invalidateSearcherCache()}add(e){if(!c(e))return;this._docs.push(e);let t=this._myIndex.add(e,this._docs.length-1);if(this._invertedIndex&&t){let e=Y({isCaseSensitive:this.options.isCaseSensitive,ignoreDiacritics:this.options.ignoreDiacritics,tokenize:this.options.tokenize});te(this._invertedIndex,t,this._myIndex.keys.length,e)}this._invalidateSearcherCache()}remove(e=()=>!1){let t=[],n=[];for(let r=0,i=this._docs.length;r<i;r+=1)e(this._docs[r],r)&&(t.push(this._docs[r]),n.push(r));if(n.length){this._invertedIndex&&Q(this._invertedIndex,n);let e=new Set(n);this._docs=this._docs.filter((t,n)=>!e.has(n)),this._myIndex.removeAll(n),this._invalidateSearcherCache()}return t}removeAt(e){if(!Number.isInteger(e)||e<0||e>=this._docs.length)throw Error(d);this._invertedIndex&&Q(this._invertedIndex,[e]);let t=this._docs.splice(e,1)[0];return this._myIndex.removeAt(e),this._invalidateSearcherCache(),t}_invalidateSearcherCache(){this._lastQuery=null,this._lastSearcher=null}getIndex(){return this._myIndex}_normalizedKeys(){return this._myIndex.keys.map(e=>this._keyStore.get(e.id)||e)}search(e,t){let{limit:n=-1}=t||{},{includeMatches:a,includeScore:o,shouldSort:s,sortFn:c,ignoreFieldNorm:l}=this.options;if(r(e)&&!e.trim()){let e=this._docs.map((e,t)=>({item:e,refIndex:t}));return i(n)&&n>-1&&(e=e.slice(0,n)),e}let u=s&&i(n)&&n>0&&r(e),d=c,f=(e,t)=>d(e,t)||e.idx-t.idx,p;if(u){let t=new W(n,f);r(this._docs[0])?this._searchStringList(e,{heap:t,ignoreFieldNorm:l}):this._searchObjectList(e,{heap:t,ignoreFieldNorm:l}),p=t.extractSorted()}else p=r(e)?r(this._docs[0])?this._searchStringList(e):this._searchObjectList(e):this._searchLogical(e),U(p,{ignoreFieldNorm:l}),s&&p.sort(r(e)?f:d),i(n)&&n>-1&&(p=p.slice(0,n));return K(p,this._docs,{includeMatches:a,includeScore:o})}_searchStringList(e,{heap:t,ignoreFieldNorm:n}={}){let r=this._getSearcher(e),i=this.options.useTokenSearch&&this.options.tokenMatch===`all`,{records:a}=this._myIndex,o=t?null:[];return a.forEach(({v:e,i:a,n:s})=>{if(!c(e))return;let l=r.searchIn(e);if(l.isMatch){let r={score:l.score,value:e,norm:s,indices:l.indices};i&&(r.matchedMask=l.matchedMask,r.matchedTerms=l.matchedTerms,r.termCount=l.termCount);let c=[r];if(!i||this._coversAllTokens(c)){let r={item:e,idx:a,matches:c};t?(r.score=H(r.matches,{ignoreFieldNorm:n}),t.insert(r)):o.push(r)}}}),o}_searchLogical(e){throw Error(`Logical search is not available`)}_searchObjectList(e,{heap:t,ignoreFieldNorm:n}={}){let r=this._getSearcher(e),i=this.options.useTokenSearch&&this.options.tokenMatch===`all`,{records:a}=this._myIndex,o=this._normalizedKeys(),s=t?null:[];return a.forEach(({$:e,i:a})=>{if(!c(e))return;let l=[],u=!1,d=!1;if(o.forEach((t,n)=>{let i=this._findMatches({key:t,value:e[n],searcher:r});i.length?(l.push(...i),i[0].hasInverse&&(d=!0)):u=!0}),!(d&&u)&&l.length&&(!i||this._coversAllTokens(l))){let r={idx:a,item:e,matches:l};t?(r.score=H(r.matches,{ignoreFieldNorm:n}),t.insert(r)):s.push(r)}}),s}_findMatches({key:t,value:n,searcher:r}){if(!c(n))return[];let i=[];if(e(n))n.forEach(({v:e,i:n,n:a})=>{if(!c(e))return;let o=r.searchIn(e);if(o.isMatch){let r={score:o.score,key:t,value:e,idx:n,norm:a,indices:o.indices,hasInverse:o.hasInverse};o.termCount!==void 0&&(r.matchedMask=o.matchedMask,r.matchedTerms=o.matchedTerms,r.termCount=o.termCount),i.push(r)}});else{let{v:e,n:a}=n,o=r.searchIn(e);if(o.isMatch){let n={score:o.score,key:t,value:e,norm:a,indices:o.indices,hasInverse:o.hasInverse};o.termCount!==void 0&&(n.matchedMask=o.matchedMask,n.matchedTerms=o.matchedTerms,n.termCount=o.termCount),i.push(n)}}return i}_coversAllTokens(e){let t=e.length?e[0].termCount:void 0;if(t===void 0)return!0;if(t<=31){let n=0;for(let t=0;t<e.length;t++)n|=e[t].matchedMask||0;return n===2**t-1}let n=new Set;for(let t=0;t<e.length;t++){let r=e[t].matchedTerms;if(r)for(let e of r)n.add(e)}return n.size===t}};$.version=`7.5.0`,$.createIndex=k,$.parseIndex=A,$.config=T,$.match=function(e,t,n){if(n&&n.useTokenSearch)throw Error(`Fuse.match does not support useTokenSearch: token search requires corpus-level statistics (df, fieldCount) that a one-off string comparison does not have. Use new Fuse(...).search(...) instead.`);return V(e,{...T,...n}).searchIn(t)},$.use=function(...e){e.forEach(e=>B(e))};var re=$;
return re;
})();

// Source: vendor/steam-hover-core/src/core/steam-client.mjs
/** Shared Steam providers, matching, request scheduling and field-level cache. No runtime dependencies. */
const CORE_VERSION = '1.0.9';

const STEAM_SCHEMA = 3;
const STEAM_RESOLVER = 9;
const STEAM_PROVIDER = 2;
const STEAM_DAY = 86400000;
const STEAM_LANGUAGE = 'english';
const STEAM_COUNTRY = 'us';
const STEAM_DEFAULT_SETTINGS = Object.freeze({ preload: 'nearby', theme: 'site', debug: false, reviewPurchaseType: 1 });

function steamError(code, message, extra = {}) {
    return Object.assign(new Error(message), { code, candidates: [], ...extra });
}

function steamAbortError() {
    return steamError('ABORTED', 'The preview request was cancelled.', { name: 'AbortError' });
}

function steamAppId(value) {
    const text = String(value ?? '').trim();
    return /^[1-9]\d{0,9}$/.test(text) && Number(text) <= 4294967295 ? String(Number(text)) : null;
}

function steamParseAppInput(value) {
    const direct = steamAppId(value);
    if (direct) return direct;
    try {
        const url = new URL(String(value).trim());
        if (!['https:', 'http:'].includes(url.protocol) || url.hostname !== 'store.steampowered.com') return null;
        return steamAppId(url.pathname.match(/^\/app\/(\d+)(?:\/|$)/)?.[1]);
    } catch {
        return null;
    }
}

function normalizeForMatch(value) {
    return String(value ?? '')
        .replace(/[®™©℠]/g, '')
        .normalize('NFKD')
        .replace(/\p{M}+/gu, '')
        .toLocaleLowerCase('en')
        .replace(/\bs[. ]t[. ]a[. ]l[. ]k[. ]e[. ]r\b/g, 'stalker')
        .replace(/\bf[. ]e[. ]a[. ]r\b/g, 'fear')
        .replace(/&/g, ' and ')
        .replace(/[®™©]/g, '')
        .replace(/[’'`]/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function steamStripCommercialEdition(value) {
    const title = String(value).trim();
    const standard = title
        .replace(
            /\s*[:\-–—]?\s+(?:(?:digital\s+)?deluxe|ultimate|gold|premium|complete|collector['’]?s|game\s+of\s+the\s+year|goty)\s+edition(?:\s*[:\-].*)?$/i,
            ''
        )
        .trim();
    if (standard !== title) return standard;
    // Named commercial editions, e.g. ": Apex Predator Edition", still belong to the base game.
    // Preserve standalone remakes/remasters/definitive editions rather than dropping their identity.
    const named = title.match(/^(.+?)\s*[:–—]\s*([^:]{1,80})\s+edition$/i);
    return named &&
        !/\b(?:remake|remaster(?:ed)?|redux|vr|intergrade|definitive|enhanced|special|anniversary)\b/i.test(named[2])
        ? named[1].trim()
        : title;
}

function steamTitleQueries(value) {
    const title = String(value).trim();
    const primary = steamStripCommercialEdition(title);
    const variants = [];
    if (/\benhanced\s+remaster\b/i.test(primary) && /\b4k\s*[/ ]\s*hd\s+edition\b/i.test(primary)) {
        variants.push(
            primary
                .replace(/\b4k\s*[/ ]\s*hd\s+edition\b\s*[-:–—]?\s*/i, '')
                .replace(/\s+/g, ' ')
                .trim()
        );
    }
    variants.push(primary, title);
    const presentation = steamPresentationTitle(primary);
    if (presentation.kind) variants.push(presentation.title);
    return [...new Set(variants.filter(Boolean))];
}

/** Search syntax is separate from game identity: compare the complete title even after a broader lookup. */
function steamSearchQueries(value) {
    const queries = [];
    const broader = [];
    for (const title of steamTitleQueries(value)) {
        const neutral = title
            .replace(/[®™©℠]/g, '')
            .replace(/[’‘]/g, "'")
            .replace(/&/g, ' and ')
            // Query punctuation is broader than subtitle separators: !, ?, /, quotes, Unicode marks, etc.
            // Preserve apostrophes and meaningful +/# symbols; the original title remains an available fallback.
            .replace(/[^\p{L}\p{N}\s'+#]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const spaced = steamComparisonText(neutral);
        queries.push(neutral, title);
        if (spaced !== neutral) broader.push(spaced);
        // Only an explicit subtitle boundary supplies a fallback. Never remove arbitrary trailing words.
        const prefix = title.split(/\s+[-‐‑‒–—―]\s+|\s*[:–—]\s*/)[0].trim();
        const words = normalizeForMatch(prefix).split(' ');
        if (prefix !== title && (words.length >= 2 || words[0].length >= 6)) queries.push(prefix);
        // Broaden retrieval only, after full queries. Complete identity is still scored below.
        // Keep every protected number/edition marker in each fallback search.
        const terms = spaced.split(/\s+/);
        const protectedWords = steamIdentity(title).important;
        if (terms.length >= 3 && prefix === title) {
            for (const count of [terms.length - 1, 2]) {
                const fallback = terms.slice(0, count).join(' ');
                const identity = steamIdentity(fallback);
                const substantial = identity.tokens.filter((word) => !STEAM_STOP_WORDS.has(word));
                if (substantial.length >= 2 && [...protectedWords].every((word) => identity.important.has(word)))
                    broader.push(fallback);
            }
        }
        const meaningful = terms.filter((word) => !STEAM_STOP_WORDS.has(word.toLowerCase()));
        if (prefix === title && !protectedWords.size && meaningful.length >= 2) {
            for (const word of [meaningful[0], meaningful.at(-1)]) {
                if (word.length >= 5 && !STEAM_GENERIC_WORDS.has(word.toLowerCase())) broader.push(word);
            }
        }
    }
    return [...new Set([...queries, ...broader].filter(Boolean))].slice(0, 6);
}

function steamCleanCommonTitle(value) {
    return String(value ?? '')
        .replace(/\u00a0/g, ' ')
        .replace(/\bS\.T\.A\.L\.K\.E\.R\.?/gi, 'STALKER')
        .replace(/\bF\.E\.A\.R\.?/gi, 'FEAR')
        .replace(/[._]+/g, ' ')
        .replace(/\s+(?:update|hotfix|patch)\b(?=\s+(?:v(?:ersion)?\s*)?\d).*$/i, '')
        .replace(/\s*-\s*b\d{5,}\b.*$/i, '')
        .replace(/\s+(?:incl\.?|including)\s+(?:all\s+)?(?:dlcs?|updates?|bonus|extras?)\b.*$/i, '')
        .replace(/\s+(?:v(?:ersion)?\s*\d+(?:[. -]\d+)*|build\s*[#:]?\s*\d+)\b.*$/i, '')
        .replace(/\s*\((?:v\d|build\s*\d|multi\d|\d{4}[-/]\d{2}[-/]\d{2})[^)]*\)\s*/gi, ' ')
        .replace(/\s+(?:x64|x86|64[- ]?bit|32[- ]?bit|multi\d+)\b/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/** Release metadata belongs to the adapter. Proper-title substrings such as Ghost, Lost and Demonologist survive. */
function cleanTorrentTitle(raw) {
    if (typeof raw !== 'string') return null;
    let title = raw.replace(/^\s*(?:\[(?:fitgirl|dodi|elamigos|repack|bober\s*bros|gog)[^\]]*\]\s*)+/i, '');
    title = title.replace(
        /\[[^\]]*\b(?:repack|fitgirl|dodi|elamigos|gog|multi\d*|p2p|iso|linux|windows|x64|x86)\b[^\]]*\]/gi,
        ' '
    );
    title = steamCleanCommonTitle(title);
    title = title.replace(
        /\s*[- ]\s*(?:codex|cpy|skidrow|plaza|hoodlum|flt|doge|darksiders|empress|rune|tenoke|tinyiso|elamigos|fitgirl|dodi|razor1911|reloaded|prophet|fairlight|gog|p2p|steam|steamworks|3dm|ali213|anomaly|kaos|revolt|simplex|iso|bober\s*bros)\s*$/i,
        ''
    );
    title = title
        .replace(/\s+(?:repack|portable|linux|macos|windows)\s*$/i, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    if (/^(?:soundtrack|artbook|trainer|multiplayer\s+crack)\s*(?:for\b|[:\-])/i.test(title)) return null;
    return title.length >= 2 ? title : null;
}

/** Administrative-thread eligibility is structural in the forum adapter, not a word blacklist. */
function cleanForumTitle(raw) {
    if (typeof raw !== 'string') return null;
    let title = raw.replace(
        /^\s*(?:\[(?:info|request|steam|gog|epic|cracked|not\s+cracked|hypervisor|early\s+access|pre[- ]release|playable|build|update|linux|mac|windows|goldberg|rune|tenoke|flt|skidrow|codex)[^\]]*\]\s*)+/i,
        ''
    );
    title = title.replace(
        /\[(?:info|request|steam|gog|epic|cracked|not\s+cracked|hypervisor|early\s+access|pre[- ]release|playable|build|update|linux|mac|windows|goldberg|rune|tenoke|flt|skidrow|codex)[^\]]*\]/gi,
        ' '
    );
    title = title.replace(
        /\((?:request\s+and\s+share|(?:not\s+)?cracked|hypervisor|multi\d+|build\s*\d+|v\d[^)]*|windows|linux|mac)(?:[^)]*)\)/gi,
        ' '
    );
    title = title.replace(/\s+MOD\s+TOPIC\b.*$/i, '');
    title = steamCleanCommonTitle(title)
        .replace(/\s{2,}/g, ' ')
        .trim();
    return title.length >= 2 ? title : null;
}

const STEAM_ROMAN = Object.freeze({
    ii: '2',
    iii: '3',
    iv: '4',
    v: '5',
    vi: '6',
    vii: '7',
    viii: '8',
    ix: '9',
    x: '10',
    xi: '11',
    xii: '12',
    xiii: '13',
    xiv: '14',
    xv: '15',
    xvi: '16'
});
const STEAM_STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'of', 'for', 'to', 'in', 'on', 'with', 'by']);
const STEAM_EDITION_WORDS = new Set([
    'remake',
    'remastered',
    'remaster',
    'redux',
    'vr',
    'intergrade',
    'definitive',
    'enhanced',
    'special',
    'anniversary'
]);

// Product roles are identity-bearing even when Steam declares a prologue as a "game".
const STEAM_PRODUCT_WORDS = new Set([
    'demo',
    'prologue',
    'playtest',
    'soundtrack',
    'artbook',
    'artbooklet',
    'benchmark',
    'sdk',
    'dedicated',
    'server'
]);
const STEAM_GENERIC_WORDS = new Set([
    'game',
    'games',
    'simulator',
    'simulation',
    'adventure',
    'adventures',
    'quest',
    'story',
    'stories',
    'edition',
    'online'
]);

// Comparison formatting never changes source fingerprints or saved correction keys.
function steamComparisonText(value) {
    return String(value)
        .replace(/\b(?:[a-z][. ]+){2,}[a-z]\b/gi, (word) => word.replace(/[. ]+/g, ''))
        .replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2');
}

// A naming grammar used for every title, without an AppID/title exception table.
// Cut labels are weaker than an exact full title; conflicting cuts remain distinct.
function steamPresentationTitle(value) {
    const text = String(value).trim();
    const match = text.match(/^(.*?)\s+(?:[-:–—]\s*)?(?:the\s+)?(director['’]?s?|final|extended|uncut)\s+cut$/i);
    if (!match || normalizeForMatch(match[1]).length < 4) return { title: text, kind: null };
    return {
        title: match[1].replace(/\s*[-:–—]\s*$/, '').trim(),
        kind: /^director/i.test(match[2]) ? 'directors' : match[2].toLowerCase()
    };
}

function steamIdentity(value) {
    const title = steamComparisonText(steamStripCommercialEdition(value));
    const normalized = normalizeForMatch(title).replace(/\s+dlc$/i, '');
    const tokens = normalized
        .split(' ')
        .filter(Boolean)
        .map((token) => STEAM_ROMAN[token] || (token === 'remastered' ? 'remaster' : token));
    const important = new Set(
        tokens.flatMap((token) => [
            ...(token.match(/\d+/g) || []),
            ...(/^s\d+(?:e\d+)?$/.test(token) || STEAM_EDITION_WORDS.has(token) || STEAM_PRODUCT_WORDS.has(token)
                ? [token]
                : [])
        ])
    );
    const presentation = steamPresentationTitle(title);
    const coreTokens = normalizeForMatch(presentation.title)
        .split(' ')
        .filter(Boolean)
        .map((token) => STEAM_ROMAN[token] || (token === 'remastered' ? 'remaster' : token));
    return { normalized, tokens, important, presentation: presentation.kind, coreTokens };
}

function steamFuseDistance(pattern, text, threshold = 0.25) {
    const result = new SteamTextFuse([text], {
        includeScore: true,
        ignoreLocation: true,
        ignoreFieldNorm: true,
        isCaseSensitive: true,
        threshold,
        minMatchCharLength: 3
    }).search(pattern, { limit: 1 })[0];
    return result?.score ?? 1;
}

function steamWordDistance(a, b, limit) {
    const left = Array.from(a),
        right = Array.from(b);
    if (Math.abs(left.length - right.length) > limit || Math.max(left.length, right.length) > 64) return Infinity;
    let before = null,
        previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let i = 1; i <= left.length; i++) {
        const row = [i];
        for (let j = 1; j <= right.length; j++) {
            row[j] = Math.min(
                previous[j] + 1,
                row[j - 1] + 1,
                previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
            );
            if (i > 1 && j > 1 && left[i - 1] === right[j - 2] && left[i - 2] === right[j - 1])
                row[j] = Math.min(row[j], before[j - 2] + 1);
        }
        if (Math.min(...row) > limit) return Infinity;
        before = previous;
        previous = row;
    }
    return previous[right.length];
}

function steamFuzzyTitleScore(left, right) {
    const l = left.tokens.filter((token) => !STEAM_STOP_WORDS.has(token));
    const r = right.tokens.filter((token) => !STEAM_STOP_WORDS.has(token));
    if (l.length !== r.length) return 0;
    const changed = l.map((word, index) => (word === r[index] ? null : [word, r[index]])).filter(Boolean);
    if (!changed.length || changed.length > 2) return 0;
    const anchorChars = l.reduce(
        (sum, word, index) => sum + (word === r[index] && !STEAM_GENERIC_WORDS.has(word) ? word.length : 0),
        0
    );
    if (l.length > 1 && anchorChars < 4) return 0;
    if (changed.length > 1 && (l.length < 3 || anchorChars < 7)) return 0;
    let edits = 0;
    for (const [a, b] of changed) {
        const length = Math.min(a.length, b.length);
        if (length < 4) return 0;
        if (l.length === 1 && (length < 7 || (a[0] !== b[0] && length < 10))) return 0;
        // Four-letter words need a transposition or substantial unchanged context.
        // This accepts "Wras" -> "Wars" without treating "Dawn" -> "Down" as a typo.
        if (
            length < 5 &&
            anchorChars < 10 &&
            (a.length !== b.length || [...a].sort().join('') !== [...b].sort().join(''))
        )
            return 0;
        edits += steamWordDistance(a, b, length >= 9 ? 2 : 1);
        if (edits > 2) return 0;
    }
    const aTitle = left.tokens.join(' '),
        bTitle = right.tokens.join(' ');
    const distance = Math.max(steamFuseDistance(aTitle, bTitle), steamFuseDistance(bTitle, aTitle));
    const editScore = 100 * (1 - edits / Math.max(aTitle.length, bTitle.length));
    // Bounded edit checks handle transpositions; Fuse supplies an additional whole-title ranking signal.
    return Math.min(94, Math.round(Math.max(editScore, 100 * (1 - distance))));
}

/** A ranking heuristic, not a probability. Protected sequel/edition mismatches are rejected. */
function scoreCandidate(query, candidate) {
    const left = steamIdentity(query);
    const right = steamIdentity(typeof candidate === 'string' ? candidate : candidate?.name);
    if (!left.tokens.length || !right.tokens.length) return 0;
    if (
        [...left.important].some((token) => !right.important.has(token)) ||
        [...right.important].some((token) => !left.important.has(token))
    )
        return -Infinity;
    const leftCanonical = left.tokens.join(' ');
    const rightCanonical = right.tokens.join(' ');
    if (leftCanonical === rightCanonical) return 100;
    if (leftCanonical.replace(/ /g, '') === rightCanonical.replace(/ /g, '')) return 98;
    const meaningful = (tokens) => tokens.filter((word) => !STEAM_STOP_WORDS.has(word)).join(' ');
    if (meaningful(left.tokens) === meaningful(right.tokens)) return 98;
    if (left.presentation && right.presentation && left.presentation !== right.presentation) return -Infinity;
    if (left.presentation || right.presentation) {
        if (meaningful(left.coreTokens) === meaningful(right.coreTokens)) return 94;
        const fuzzy = steamFuzzyTitleScore({ tokens: left.coreTokens }, { tokens: right.coreTokens });
        if (fuzzy >= 85) return Math.min(90, fuzzy);
    }
    const l = new Set(left.tokens);
    const r = new Set(right.tokens);
    const weight = (token) => (STEAM_STOP_WORDS.has(token) ? 0.25 : 1);
    const intersection = [...l].reduce((sum, token) => sum + (r.has(token) ? weight(token) : 0), 0);
    const lWeight = [...l].reduce((sum, token) => sum + weight(token), 0);
    const rWeight = [...r].reduce((sum, token) => sum + weight(token), 0);
    const precision = intersection / rWeight;
    const recall = intersection / lWeight;
    const tokenScore = precision + recall ? Math.round((100 * (2 * precision * recall)) / (precision + recall)) : 0;
    // Overlap alone cannot authorize dropping meaningful subtitle words or reordering a title.
    return Math.max(Math.min(tokenScore, 84), steamFuzzyTitleScore(left, right));
}

/** Steam's website search can find localized aliases missing from the small storesearch API index. */
function parseSteamSearchResults(body, DOMParserClass) {
    if (
        !body ||
        ![1, true].includes(body.success) ||
        typeof body.results_html !== 'string' ||
        !Number.isInteger(body.total_count) ||
        body.total_count < 0 ||
        body.results_html.length > 300000
    )
        throw steamError('SCHEMA', 'Steam returned invalid website search results.');
    if (body.total_count === 0) return [];
    if (typeof DOMParserClass !== 'function')
        throw steamError('SCHEMA', 'This browser cannot parse Steam search results.');
    const doc = new DOMParserClass().parseFromString(body.results_html, 'text/html');
    const rows = [...doc.querySelectorAll('a.search_result_row')];
    if (!rows.length) throw steamError('SCHEMA', 'Steam website search markup was not recognized.');
    const items = [];
    const seen = new Set();
    for (const row of rows) {
        let href;
        try {
            href = new URL(row.getAttribute('href'), 'https://store.steampowered.com').href;
        } catch {
            continue;
        }
        const appId = steamParseAppInput(href);
        const declared = row.getAttribute('data-ds-appid');
        if (!appId || seen.has(appId) || (declared && steamAppId(declared) !== appId)) continue;
        const name = String(row.querySelector('.title')?.textContent || '')
            .trim()
            .slice(0, 400);
        if (!name) continue;
        seen.add(appId);
        items.push({ appId: Number(appId), name });
        if (items.length >= 10) break;
    }
    return items;
}

/** Manual suggestions are deliberately permissive; automatic identity scoring remains separate. */
function rankSteamSuggestions(query, candidates) {
    const normalize = (value) =>
        normalizeForMatch(value)
            .split(' ')
            .map((token) => STEAM_ROMAN[token] || token)
            .join(' ');
    const pattern = normalize(query);
    const seen = new Set();
    return candidates
        .flatMap((candidate) => {
            const appId = steamAppId(candidate?.appId);
            const name = String(candidate?.name || '')
                .trim()
                .slice(0, 400);
            if (!appId || !name || seen.has(appId)) return [];
            seen.add(appId);
            const title = normalize(name);
            const nameScore =
                pattern && title
                    ? pattern === title
                        ? 100
                        : Math.max(
                              0,
                              Math.round(
                                  100 *
                                      (1 -
                                          Math.max(
                                              steamFuseDistance(pattern, title, 1),
                                              steamFuseDistance(title, pattern, 1)
                                          ))
                              )
                          )
                    : 0;
            return [
                {
                    appId: Number(appId),
                    name,
                    score: Number.isFinite(candidate.score) ? candidate.score : null,
                    nameScore
                }
            ];
        })
        .sort((a, b) => b.nameScore - a.nameScore)
        .slice(0, 8);
}

function steamPriority(priority) {
    if (typeof priority === 'number') return priority;
    return priority === 'hover' ? 0 : priority === 'nearby' ? 10 : 30;
}

/** One bounded worker pool. Identical resources share a job while each consumer can cancel independently. */
function createRequestScheduler(options = {}) {
    const now = options.now || Date.now;
    const random = options.random || Math.random;
    const scheduleTimer = options.setTimeout || globalThis.setTimeout.bind(globalThis);
    const clearTimer = options.clearTimeout || globalThis.clearTimeout.bind(globalThis);
    const isHidden = options.isHidden || (() => false);
    const concurrency = Math.max(1, options.concurrency ?? 3);
    const hiddenConcurrency = Math.min(concurrency, Math.max(1, options.hiddenConcurrency ?? 1));
    const minInterval = Math.max(0, options.minInterval ?? 100);
    const maxRetries = options.maxRetries ?? 1;
    const maxCooldownWait = options.maxCooldownWait ?? 2000;
    const jobs = new Map();
    const cooldowns = new Map();
    let active = 0;
    let serial = 0;
    let lastStart = -Infinity;
    let timer = null;
    let disposed = false;
    const counters = { started: 0, shared: 0, cancelled: 0, retried: 0, peakActive: 0 };

    function settle(job, error, value) {
        if (jobs.get(job.key) === job) jobs.delete(job.key);
        job.state = 'done';
        for (const consumer of job.consumers.values()) {
            consumer.cleanup?.();
            if (error) consumer.reject(error);
            else consumer.resolve(value);
        }
        job.consumers.clear();
    }

    function wake(delay = 0) {
        if (disposed) return;
        if (timer !== null) clearTimer(timer);
        timer = scheduleTimer(
            () => {
                timer = null;
                pump();
            },
            Math.max(0, delay)
        );
    }

    function pump() {
        if (disposed) return;
        if (timer !== null) {
            clearTimer(timer);
            timer = null;
        }
        const cap = isHidden() ? hiddenConcurrency : concurrency;
        while (active < cap) {
            const queued = [...jobs.values()]
                .filter((job) => job.state === 'queued' && job.consumers.size)
                .sort((a, b) => a.priority - b.priority || a.order - b.order);
            if (!queued.length) return;
            const time = now();
            let nextWake = Infinity;
            let job = null;
            for (const item of queued) {
                const cooldownRemaining = (cooldowns.get(item.host) || 0) - time;
                if (cooldownRemaining > maxCooldownWait) {
                    settle(
                        item,
                        steamError('HTTP', 'Steam is temporarily rate limited. Try again shortly.', {
                            status: 429,
                            retryable: true,
                            retryAfter: cooldownRemaining
                        })
                    );
                    continue;
                }
                const readyAt = Math.max(item.readyAt, cooldowns.get(item.host) || 0, lastStart + minInterval);
                if (readyAt <= time) {
                    job = item;
                    break;
                }
                nextWake = Math.min(nextWake, readyAt - time);
            }
            if (!job) {
                if (Number.isFinite(nextWake)) wake(nextWake);
                return;
            }
            job.state = 'active';
            active++;
            lastStart = now();
            counters.started++;
            counters.peakActive = Math.max(counters.peakActive, active);
            Promise.resolve()
                .then(() =>
                    job.task({
                        setAbort(fn) {
                            job.abort = typeof fn === 'function' ? fn : null;
                            if (!job.consumers.size) job.abort?.();
                        }
                    })
                )
                .then(
                    (value) => settle(job, null, value),
                    (error) => {
                        const retryAfter = Number(error?.retryAfter) || 0;
                        if (error?.status === 429) cooldowns.set(job.host, now() + Math.max(1000, retryAfter || 30000));
                        const cooldownWait = error?.status === 429 ? Math.max(1000, retryAfter || 30000) : retryAfter;
                        if (
                            job.consumers.size &&
                            error?.retryable &&
                            cooldownWait <= maxCooldownWait &&
                            job.attempt < maxRetries &&
                            !disposed
                        ) {
                            job.attempt++;
                            counters.retried++;
                            job.abort = null;
                            job.state = 'queued';
                            job.readyAt =
                                now() + Math.max(retryAfter, 500 * 2 ** (job.attempt - 1) + Math.round(random() * 200));
                        } else settle(job, error);
                    }
                )
                .finally(() => {
                    active--;
                    wake();
                });
        }
    }

    function run(key, task, { priority = 'background', signal, host = '' } = {}) {
        if (disposed || signal?.aborted) return Promise.reject(steamAbortError());
        let job = jobs.get(key);
        if (!job) {
            job = {
                key,
                task,
                host,
                priority: steamPriority(priority),
                order: serial++,
                readyAt: now(),
                state: 'queued',
                attempt: 0,
                abort: null,
                consumers: new Map()
            };
            jobs.set(key, job);
        } else {
            counters.shared++;
            job.priority = Math.min(job.priority, steamPriority(priority));
        }
        const id = serial++;
        const promise = new Promise((resolve, reject) => {
            const consumer = { resolve, reject, cleanup: null };
            const cancel = () => {
                if (!job.consumers.delete(id)) return;
                consumer.cleanup?.();
                counters.cancelled++;
                reject(steamAbortError());
                if (!job.consumers.size) {
                    if (job.state === 'queued') {
                        job.state = 'done';
                        jobs.delete(key);
                    } else if (job.state === 'active') job.abort?.();
                }
                wake();
            };
            if (signal) {
                signal.addEventListener('abort', cancel, { once: true });
                consumer.cleanup = () => signal.removeEventListener('abort', cancel);
            }
            job.consumers.set(id, consumer);
        });
        wake();
        return promise;
    }

    function cancelAll() {
        if (timer !== null) {
            clearTimer(timer);
            timer = null;
        }
        for (const job of [...jobs.values()]) {
            job.abort?.();
            settle(job, steamAbortError());
        }
    }

    return {
        run,
        promote(key, priority = 'hover') {
            const job = jobs.get(key);
            if (job) job.priority = Math.min(job.priority, steamPriority(priority));
            wake();
        },
        cancelAll,
        onVisibilityChange: () => wake(),
        stats: () => ({
            ...counters,
            active,
            queued: [...jobs.values()].filter((job) => job.state === 'queued').length
        }),
        dispose() {
            cancelAll();
            disposed = true;
            if (timer !== null) clearTimer(timer);
        }
    };
}

function steamSettings(input) {
    return {
        preload: ['nearby', 'all', 'hover'].includes(input?.preload) ? input.preload : 'nearby',
        theme: ['site', 'light', 'dark'].includes(input?.theme) ? input.theme : 'site',
        debug: input?.debug === true,
        reviewPurchaseType: input?.reviewPurchaseType === 0 ? 0 : 1
    };
}

function steamDecodeStored(value) {
    try {
        return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
        return null;
    }
}

function steamHttpUrl(value) {
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
}

function steamDetailsRecord(raw, expectedId) {
    const id = steamAppId(raw?.steam_appid);
    if (
        !raw ||
        !id ||
        !expectedId ||
        id !== expectedId ||
        typeof raw.name !== 'string' ||
        !raw.name.trim() ||
        typeof raw.type !== 'string'
    )
        throw steamError('SCHEMA', 'Steam returned incomplete app details.');
    const movies = Array.isArray(raw.movies)
        ? raw.movies.slice(0, 12).map((movie) => {
              const result = { name: String(movie.name || '').slice(0, 200), thumbnail: steamHttpUrl(movie.thumbnail) };
              for (const key of [
                  'mp4',
                  'webm',
                  'video_url',
                  'hls_h264',
                  'hlsManifest',
                  'hls',
                  'dash_h264',
                  'dash_av1'
              ]) {
                  if (typeof movie[key] === 'string') result[key] = steamHttpUrl(movie[key]);
                  else if (movie[key] && typeof movie[key] === 'object')
                      result[key] = Object.fromEntries(
                          Object.entries(movie[key])
                              .slice(0, 8)
                              .map(([label, url]) => [label, steamHttpUrl(url)])
                              .filter(([, url]) => url)
                      );
              }
              return result;
          })
        : [];
    return {
        steam_appid: Number(id),
        type: raw.type.toLowerCase(),
        name: raw.name.trim().slice(0, 400),
        short_description: String(raw.short_description || '').slice(0, 3000),
        header_image: steamHttpUrl(raw.header_image),
        release_date: {
            coming_soon: raw.release_date?.coming_soon === true,
            date: String(raw.release_date?.date || '').slice(0, 120)
        },
        screenshots: Array.isArray(raw.screenshots)
            ? raw.screenshots
                  .slice(0, 40)
                  .map((item) => ({
                      path_full: steamHttpUrl(item.path_full),
                      path_thumbnail: steamHttpUrl(item.path_thumbnail)
                  }))
                  .filter((item) => item.path_full || item.path_thumbnail)
            : [],
        movies,
        ...(steamAppId(raw.fullgame?.appid)
            ? {
                  fullgame: {
                      appid: steamAppId(raw.fullgame.appid),
                      name: String(raw.fullgame.name || '').slice(0, 400)
                  }
              }
            : {})
    };
}

function parseReviewSummary(body) {
    const summary = body?.response?.query_summary;
    if (
        !summary ||
        !Number.isInteger(summary.total_reviews) ||
        summary.total_reviews < 0 ||
        !Number.isInteger(summary.total_positive) ||
        summary.total_positive < 0 ||
        !Number.isInteger(summary.total_negative) ||
        summary.total_negative < 0 ||
        summary.total_positive + summary.total_negative !== summary.total_reviews
    ) {
        throw steamError('SCHEMA', 'Steam returned an incomplete review summary.');
    }
    return {
        desc: String(
            summary.review_score_desc || (summary.total_reviews ? 'User reviews' : 'No user reviews yet')
        ).slice(0, 120),
        percent: summary.total_reviews ? Math.round((100 * summary.total_positive) / summary.total_reviews) : null,
        total: summary.total_reviews,
        positive: summary.total_positive,
        negative: summary.total_negative
    };
}

function createSteamClient(env = {}) {
    if (typeof env.gmRequest !== 'function') throw new TypeError('createSteamClient requires a GM request transport.');
    const now = env.now || Date.now;
    const scheduleTimer = env.setTimeout || globalThis.setTimeout.bind(globalThis);
    const clearTimer = env.clearTimeout || globalThis.clearTimeout.bind(globalThis);
    const scheduler = createRequestScheduler({
        now,
        random: env.random,
        setTimeout: scheduleTimer,
        clearTimeout: clearTimer,
        isHidden: env.isHidden,
        concurrency: env.concurrency ?? 3,
        hiddenConcurrency: env.hiddenConcurrency ?? 1,
        minInterval: env.minInterval ?? 100,
        maxRetries: env.maxRetries ?? 1
    });
    const storageKey = env.storageKey || 'steamHoverCore_v3';
    const settingsKey = env.settingsKey || `${storageKey}_settings`;
    const listeners = new Set();
    const tables = Object.fromEntries(
        ['details', 'tags', 'reviews', 'mappings', 'corrections', 'negative'].map((name) => [name, new Map()])
    );
    const searchCache = new Map();
    const refreshingDetails = new Map();
    const reviewing = new Map();
    const matches = new Map();
    let settings = { ...STEAM_DEFAULT_SETTINGS };
    let epoch = 0;
    let generation = 0;
    let saveTimer = null;
    let disposed = false;
    let initialized = false;
    let removeStorageListener = null;
    const measurements = {
        requests: 0,
        bytes: 0,
        previews: 0,
        tagCacheHits: 0,
        previewCacheHits: 0,
        tagReadyMs: [],
        errors: []
    };
    const limits = { details: 180, tags: 240, reviews: 240, mappings: 500, corrections: 250, negative: 120 };
    const stamp = () => Math.max(now(), epoch);

    function emit(kind, appId = null) {
        if (disposed) return;
        const event = { kind, appId: appId ? Number(appId) : null, data: appId ? getPreviewData(appId) : undefined };
        if (settings.debug) console.debug('[Steam Hover]', { kind, appId: event.appId });
        for (const listener of listeners) {
            try {
                listener(event);
            } catch {
                /* One consumer cannot break another. */
            }
        }
    }

    function noteError(error, resource) {
        if (error?.code === 'ABORTED') return;
        measurements.errors.push({
            at: now(),
            resource: resource.split(':').slice(0, 2).join(':'),
            code: error?.code || 'UNKNOWN',
            status: error?.status || null
        });
        measurements.errors = measurements.errors.slice(-30);
    }

    function checkGeneration(token, signal) {
        if (disposed || token !== generation || signal?.aborted) throw steamAbortError();
    }

    function touch(table, key) {
        const item = tables[table].get(String(key));
        if (item) item.used = now();
        return item || null;
    }

    function setRecord(table, key, item) {
        if (table === 'corrections')
            item = { ...item, ts: Math.max(item.ts, (tables.corrections.get(String(key))?.ts || 0) + 1) };
        tables[table].set(String(key), { ...item, used: now() });
        prune();
        saveSoon();
    }

    function prune() {
        for (const [name, table] of Object.entries(tables)) {
            if (table.size <= limits[name]) continue;
            const oldest = [...table].sort((a, b) => (a[1].used || a[1].ts) - (b[1].used || b[1].ts));
            for (const [key] of oldest.slice(0, table.size - limits[name])) table.delete(key);
        }
    }

    function snapshot() {
        prune();
        const value = {
            schema: STEAM_SCHEMA,
            provider: STEAM_PROVIDER,
            resolver: STEAM_RESOLVER,
            epoch,
            savedAt: stamp(),
            ...Object.fromEntries(Object.entries(tables).map(([name, table]) => [name, Object.fromEntries(table)]))
        };
        let text = JSON.stringify(value);
        // Bound stored text as well as counts. Corrections are intentionally retained longest.
        while (text.length > (env.maxStorageChars || 650000)) {
            const records = ['details', 'reviews', 'tags', 'mappings', 'negative'].flatMap((name) =>
                [...tables[name]].map(([key, item]) => ({ name, key, used: item.used || item.ts }))
            );
            if (!records.length) break;
            records.sort((a, b) => a.used - b.used);
            const oldest = records[0];
            tables[oldest.name].delete(oldest.key);
            value[oldest.name] = Object.fromEntries(tables[oldest.name]);
            text = JSON.stringify(value);
        }
        return text;
    }

    function saveNow() {
        if (saveTimer !== null) {
            clearTimer(saveTimer);
            saveTimer = null;
        }
        try {
            return Promise.resolve(env.setValue?.(storageKey, snapshot())).catch(() => {});
        } catch {
            return Promise.resolve();
        }
    }

    function saveSoon() {
        if (disposed || saveTimer !== null) return;
        saveTimer = scheduleTimer(() => {
            saveTimer = null;
            saveNow();
        }, env.persistDelay ?? 250);
    }

    function validIncoming(name, key, item, incomingEpoch) {
        if (
            !item ||
            typeof item !== 'object' ||
            !Number.isFinite(item.ts) ||
            item.ts < incomingEpoch ||
            item.ts > now() + STEAM_DAY ||
            String(key).length > 800
        )
            return false;
        if (name === 'details') {
            try {
                item.data = steamDetailsRecord(item.data, steamAppId(key));
            } catch {
                return false;
            }
        } else if (name === 'tags') {
            if (
                !steamAppId(key) ||
                !['ready', 'empty', 'error'].includes(item.state) ||
                !Array.isArray(item.tags) ||
                item.tags.some((tag) => typeof tag !== 'string' || tag.length > 100) ||
                item.tags.length > 20
            )
                return false;
        } else if (name === 'reviews') {
            if (
                !/^\d+:[01]$/.test(key) ||
                !steamAppId(key.split(':')[0]) ||
                !['ready', 'empty', 'error'].includes(item.state)
            )
                return false;
            if (
                item.info &&
                (!Number.isInteger(item.info.total) ||
                    item.info.total < 0 ||
                    !Number.isInteger(item.info.positive) ||
                    !Number.isInteger(item.info.negative) ||
                    item.info.positive + item.info.negative !== item.info.total)
            )
                return false;
        } else if (name === 'mappings' || name === 'corrections') {
            if (
                (!(name === 'corrections' && item.deleted === true) && !steamAppId(item.appId)) ||
                typeof item.fingerprint !== 'string' ||
                item.fingerprint.length > 600
            )
                return false;
        } else if (name === 'negative' && !['NO_MATCH', 'AMBIGUOUS_MATCH'].includes(item.code)) return false;
        return true;
    }

    function mergeStored(input, remote = false) {
        const value = steamDecodeStored(input);
        if (
            !value ||
            value.schema !== STEAM_SCHEMA ||
            value.provider !== STEAM_PROVIDER ||
            !Number.isFinite(value.epoch) ||
            value.epoch < epoch
        )
            return;
        let preservedCorrections = null;
        const changedApps = new Set();
        if (value.epoch > epoch) {
            preservedCorrections = new Map(tables.corrections);
            epoch = value.epoch;
            generation++;
            scheduler.cancelAll();
            for (const table of Object.values(tables)) table.clear();
            searchCache.clear();
            matches.clear();
            if (remote) emit('clear');
        }
        for (const name of Object.keys(tables)) {
            if (value.resolver !== STEAM_RESOLVER && (name === 'mappings' || name === 'negative')) continue;
            if (!value[name] || typeof value[name] !== 'object' || Array.isArray(value[name])) continue;
            for (const [key, raw] of Object.entries(value[name]).slice(0, limits[name] * 2)) {
                const item = { ...raw };
                if (!validIncoming(name, key, item, value.epoch)) continue;
                const current = tables[name].get(key);
                if (!current || current.ts < item.ts) {
                    tables[name].set(key, item);
                    if (['details', 'tags', 'reviews'].includes(name)) changedApps.add(key.split(':')[0]);
                } else if (current.ts === item.ts) current.used = Math.max(current.used || 0, item.used || 0);
            }
        }
        if (preservedCorrections) {
            for (const [key, item] of preservedCorrections)
                if (!tables.corrections.has(key)) tables.corrections.set(key, { ...item, ts: stamp() });
            if (remote && preservedCorrections.size) saveSoon();
        }
        prune();
        if (remote) {
            emit('cache');
            for (const appId of changedApps) emit('tags', appId);
        }
    }

    const ready = Promise.all([
        Promise.resolve()
            .then(() => env.getValue?.(storageKey, null))
            .then((value) => mergeStored(value))
            .catch(() => {}),
        Promise.resolve()
            .then(() => env.getValue?.(settingsKey, STEAM_DEFAULT_SETTINGS))
            .then((value) => {
                settings = steamSettings(steamDecodeStored(value));
            })
            .catch(() => {})
    ]).then(() => {
        initialized = true;
        if (typeof env.addValueChangeListener === 'function') {
            try {
                removeStorageListener = env.addValueChangeListener(storageKey, (_key, _old, value, remote) => {
                    if (remote !== false) mergeStored(value, true);
                });
            } catch {
                /* Optional userscript API. */
            }
        }
        emit('settings');
    });

    function retryAfter(headers) {
        const match = String(headers || '').match(/^retry-after:\s*(.+)$/im);
        if (!match) return 0;
        const seconds = Number(match[1]);
        return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(match[1]) - now()) || 0;
    }

    async function request(resource, url, { priority, signal, text = false, token = generation } = {}) {
        checkGeneration(token, signal);
        const host = new URL(url).hostname;
        try {
            const value = await scheduler.run(
                resource,
                ({ setAbort }) =>
                    new Promise((resolve, reject) => {
                        let settled = false;
                        const finish = (error, data) => {
                            if (settled) return;
                            settled = true;
                            if (error) reject(error);
                            else resolve(data);
                        };
                        const headers = { 'Accept-Language': 'en-US,en;q=0.9' };
                        if (text && host === 'store.steampowered.com')
                            headers.Cookie =
                                'birthtime=631152000; mature_content=1; wants_mature_content=1; lastagecheckage=1-0-1990';
                        measurements.requests++;
                        let handle;
                        try {
                            handle = env.gmRequest({
                                method: 'GET',
                                url,
                                responseType: text ? 'text' : 'json',
                                timeout: env.timeout ?? 8000,
                                headers,
                                onload(response) {
                                    const bodyText =
                                        typeof response.responseText === 'string'
                                            ? response.responseText
                                            : typeof response.response === 'string'
                                              ? response.response
                                              : '';
                                    measurements.bytes += bodyText.length;
                                    const status = Number(response.status);
                                    if (status < 200 || status >= 300)
                                        return finish(
                                            steamError('HTTP', `Steam returned HTTP ${status}.`, {
                                                status,
                                                retryable: status === 429 || status >= 500,
                                                retryAfter: retryAfter(response.responseHeaders)
                                            })
                                        );
                                    if (text) {
                                        const finalUrl = response.finalUrl || response.responseURL || url;
                                        let finalPage;
                                        try {
                                            finalPage = new URL(finalUrl);
                                        } catch {
                                            /* Handled by schema error. */
                                        }
                                        const expectedId = new URL(url).pathname.match(/^\/app\/(\d+)\//)?.[1];
                                        if (
                                            !finalPage ||
                                            finalPage.hostname !== 'store.steampowered.com' ||
                                            finalPage.pathname.match(/^\/app\/(\d+)\//)?.[1] !== expectedId
                                        )
                                            return finish(
                                                steamError(
                                                    'SCHEMA',
                                                    'Steam redirected away from the requested game page.'
                                                )
                                            );
                                        return finish(null, bodyText);
                                    }
                                    let body = response.response;
                                    if (!body || typeof body !== 'object') {
                                        try {
                                            body = JSON.parse(bodyText);
                                        } catch {
                                            return finish(steamError('SCHEMA', 'Steam returned HTML or invalid JSON.'));
                                        }
                                    }
                                    finish(null, body);
                                },
                                onerror: () =>
                                    finish(steamError('NETWORK', 'Steam could not be reached.', { retryable: true })),
                                ontimeout: () =>
                                    finish(
                                        steamError('NETWORK', 'Steam did not respond in time.', { retryable: true })
                                    ),
                                onabort: () => finish(steamAbortError())
                            });
                        } catch {
                            finish(
                                steamError('NETWORK', 'The userscript manager could not start a Steam request.', {
                                    retryable: false
                                })
                            );
                        }
                        setAbort(() => {
                            try {
                                handle?.abort?.();
                            } finally {
                                finish(steamAbortError());
                            }
                        });
                    }),
                { priority, signal, host }
            );
            checkGeneration(token, signal);
            return value;
        } catch (error) {
            noteError(error, resource);
            throw error;
        }
    }

    async function details(appId, context, force = false) {
        const id = steamAppId(appId);
        if (!id) throw steamError('NO_MATCH', 'The Steam AppID is invalid.');
        const cached = touch('details', id);
        if (cached && !force && now() - cached.ts < STEAM_DAY) return cached.data;
        const body = await request(
            `details:${id}`,
            `https://store.steampowered.com/api/appdetails?appids=${id}&cc=${STEAM_COUNTRY}&l=en`,
            context
        );
        if (body?.[id]?.success !== true) throw steamError('NO_MATCH', 'This Steam app is unavailable.');
        const data = steamDetailsRecord(body[id].data, id);
        checkGeneration(context.token, context.signal);
        setRecord('details', id, { data, ts: stamp() });
        emit('details', id);
        return data;
    }

    async function baseGame(appId, context) {
        let id = steamAppId(appId);
        const originalAppId = id;
        const parentChain = [];
        const visited = new Set();
        for (let depth = 0; depth < 5; depth++) {
            if (!id || visited.has(id)) throw steamError('NO_MATCH', 'Steam supplied a missing or cyclic DLC parent.');
            visited.add(id);
            const app = await details(id, context);
            if (app.type === 'game')
                return {
                    app,
                    match: {
                        kind: parentChain.length ? 'dlc-parent' : 'search',
                        originalAppId: Number(originalAppId),
                        parentChain
                    }
                };
            if (app.type !== 'dlc')
                throw steamError('NO_MATCH', 'This Steam result is not a base game or a DLC with a verified parent.');
            const parent = steamAppId(app.fullgame?.appid);
            if (!parent) throw steamError('NO_MATCH', 'This DLC does not identify a base game.');
            parentChain.push({ appId: Number(id), name: app.name, parentAppId: Number(parent) });
            id = parent;
        }
        throw steamError('NO_MATCH', 'The Steam DLC parent chain is too deep.');
    }

    function sourceIdentity(source) {
        const title = String(source?.title || '')
            .trim()
            .slice(0, 400);
        const fingerprint = normalizeForMatch(title).slice(0, 600);
        if (!title || !fingerprint) throw steamError('NO_MATCH', 'The listing has no searchable game title.');
        const key = String(source?.key || `title:${fingerprint}`).slice(0, 700);
        return { title, fingerprint, key, queryKey: `query:${fingerprint}` };
    }

    function mapIdentity(identity, resolution, queryAlias = true) {
        const mapping = {
            appId: String(resolution.app.steam_appid),
            fingerprint: identity.fingerprint,
            match: resolution.match,
            ts: Math.max(stamp(), (touch('corrections', identity.key)?.ts || 0) + 1)
        };
        setRecord('mappings', identity.key, mapping);
        if (queryAlias) setRecord('mappings', identity.queryKey, mapping);
        tables.negative.delete(identity.key);
        matches.set(mapping.appId, resolution.match);
    }

    async function search(query, context, force = false, storefront = false) {
        // Steam distinguishes punctuation variants, including their empty results.
        const cacheKey =
            (storefront ? 'storefront:' : 'api:') + String(query).trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
        const hit = searchCache.get(cacheKey);
        if (!force && hit && now() - hit.ts < 10 * 60000) return hit.items;
        const body = await request(
            `search:${cacheKey}`,
            storefront
                ? `https://store.steampowered.com/search/results/?cc=${STEAM_COUNTRY}&l=${STEAM_LANGUAGE}&term=${encodeURIComponent(query)}&start=0&count=10&infinite=1`
                : `https://store.steampowered.com/api/storesearch/?cc=${STEAM_COUNTRY}&l=en&term=${encodeURIComponent(query)}`,
            context
        );
        if (storefront) {
            const items = parseSteamSearchResults(body, env.DOMParser);
            searchCache.set(cacheKey, { ts: now(), items });
            if (searchCache.size > 150) searchCache.delete(searchCache.keys().next().value);
            return items;
        }
        if (!body || !Array.isArray(body.items))
            throw steamError('SCHEMA', 'Steam returned an invalid search response.');
        const seen = new Set();
        const items = body.items
            .filter((item) => {
                const id = steamAppId(item?.id);
                if (!id || seen.has(id) || (item.type && item.type !== 'app') || typeof item.name !== 'string')
                    return false;
                seen.add(id);
                return true;
            })
            .slice(0, 10)
            .map((item) => ({ appId: Number(item.id), name: item.name.slice(0, 400) }));
        searchCache.set(cacheKey, { ts: now(), items });
        if (searchCache.size > 150) searchCache.delete(searchCache.keys().next().value);
        return items;
    }

    /** Explicit chooser searches return names only; they neither assign a match nor fetch app metadata. */
    async function searchGames(input, options = {}) {
        await ready;
        const query = String(input ?? '')
            .trim()
            .slice(0, 200);
        const context = { priority: 'hover', signal: options.signal, token: generation };
        checkGeneration(context.token, context.signal);
        if (!query) throw steamError('INVALID_QUERY', 'Enter a game title to search.');
        const terms = steamSearchQueries(query).slice(0, 2);
        const candidates = new Map();
        let problem = null;
        const add = (items) => {
            for (const item of items) candidates.set(item.appId, item);
        };
        const exact = () =>
            rankSteamSuggestions(query, [...candidates.values()]).some((item) => item.nameScore === 100);
        for (const term of terms) {
            try {
                add(await search(term, context, options.force === true));
            } catch (error) {
                if (error?.code === 'ABORTED') throw error;
                problem = error;
                break;
            }
            if (exact()) break;
        }
        if (!exact()) {
            try {
                add(await search(terms[0], context, options.force === true, true));
            } catch (error) {
                if (error?.code === 'ABORTED') throw error;
                problem ||= error;
            }
        }
        checkGeneration(context.token, context.signal);
        if (!candidates.size && problem) throw problem;
        return { query, candidates: rankSteamSuggestions(query, [...candidates.values()]), partial: Boolean(problem) };
    }

    async function resolveSource(source, context, force = false) {
        const identity = sourceIdentity(source);
        const correctionRecord = touch('corrections', identity.key);
        const correction = correctionRecord?.deleted ? null : correctionRecord;
        const resetMarker =
            correctionRecord?.deleted && correctionRecord.fingerprint === identity.fingerprint
                ? correctionRecord
                : null;
        const explicitId =
            correction?.fingerprint === identity.fingerprint
                ? steamAppId(correction.appId)
                : steamAppId(source.explicitAppId);
        if (explicitId) {
            const resolved = await baseGame(explicitId, context);
            resolved.match = {
                ...resolved.match,
                kind: resolved.match.kind === 'dlc-parent' ? 'dlc-parent' : correction ? 'correction' : 'source-link',
                reason: correction ? 'Saved match correction' : 'Steam link from the source listing'
            };
            mapIdentity(identity, resolved, false);
            return resolved;
        }
        const candidateMapping = touch('mappings', identity.key) || touch('mappings', identity.queryKey);
        const mapping = resetMarker && candidateMapping?.ts <= resetMarker.ts ? null : candidateMapping;
        if (!force && mapping?.fingerprint === identity.fingerprint && now() - mapping.ts < 30 * STEAM_DAY) {
            const cachedApp = touch('details', mapping.appId);
            if (cachedApp?.data?.type === 'game') {
                const resolved = { app: cachedApp.data, match: mapping.match || { kind: 'cache' } };
                matches.set(String(mapping.appId), resolved.match);
                return resolved;
            }
            const resolved = await baseGame(mapping.appId, context);
            mapIdentity(identity, resolved);
            return resolved;
        }
        const negative = touch('negative', identity.key);
        if (!force && negative?.fingerprint === identity.fingerprint && now() - negative.ts < 5 * 60000)
            throw steamError(negative.code, negative.message, { candidates: negative.candidates || [] });
        const primary = steamTitleQueries(identity.title)[0];
        const queries = steamSearchQueries(identity.title);
        const considered = new Map();
        let lastFailure = null;
        let sourceChecked = false;
        const sourceEvidence = async () => {
            checkGeneration(context.token, context.signal);
            if (sourceChecked || typeof env.findSourceAppIds !== 'function') return null;
            sourceChecked = true;
            let timer, aborted;
            let found;
            try {
                // A slow/inaccessible source must not hold a failed preview indefinitely.
                // Its existing shared fetch can finish in the background, but late results cannot map a title.
                found = await Promise.race([
                    Promise.resolve().then(() => env.findSourceAppIds(source)),
                    new Promise((resolve, reject) => {
                        timer = setTimeout(() => resolve([]), env.sourceLookupTimeout ?? 1500);
                        aborted = () => reject(steamAbortError());
                        context.signal?.addEventListener('abort', aborted, { once: true });
                    })
                ]);
            } catch (error) {
                if (error?.code === 'ABORTED') throw error;
                return null;
            } finally {
                clearTimeout(timer);
                context.signal?.removeEventListener('abort', aborted);
            }
            checkGeneration(context.token, context.signal);
            if (!Array.isArray(found)) return null;
            const ids = [
                ...new Map(
                    found.filter((item) => steamAppId(item?.appId)).map((item) => [steamAppId(item.appId), item])
                ).values()
            ];
            if (!ids.length) return null;
            if (ids.length > 1)
                throw steamError(
                    'AMBIGUOUS_MATCH',
                    'The source contains multiple Steam games. Choose the correct game.',
                    {
                        candidates: rankSteamSuggestions(
                            identity.title,
                            ids.map((item) => considered.get(Number(item.appId)) || item)
                        )
                    }
                );
            try {
                const resolved = await baseGame(ids[0].appId, context);
                resolved.match = {
                    ...resolved.match,
                    kind: resolved.match.parentChain.length ? 'dlc-parent' : 'source-link',
                    reason: 'Steam link from the source content'
                };
                mapIdentity(identity, resolved, false);
                return resolved;
            } catch (error) {
                if (error?.code !== 'NO_MATCH') throw error;
                return null;
            }
        };
        const lookups = queries.map((query) => ({ query, storefront: false }));
        // One compact website fallback after API variants fail; do not add a request to successful API matches.
        lookups.push({ query: queries[0], storefront: true });
        for (const lookup of lookups) {
            const items = await search(lookup.query, context, force, lookup.storefront);
            for (const item of items) {
                const score = scoreCandidate(primary, item);
                if (!considered.has(item.appId)) considered.set(item.appId, { ...item, score });
            }
            const ranked = [...considered.values()]
                .filter((item) => Number.isFinite(item.score) && item.score >= 50)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
            const valid = [];
            const validateCandidate = async (candidate) => {
                try {
                    const resolved = await baseGame(candidate.appId, context);
                    const original = touch('details', candidate.appId)?.data;
                    const originalScore = scoreCandidate(primary, original || candidate);
                    const parentScore = scoreCandidate(primary, resolved.app);
                    const score = resolved.match.parentChain.length
                        ? Math.max(originalScore, parentScore)
                        : parentScore;
                    if (!Number.isFinite(score) || score < 85) return;
                    if (!valid.some((item) => item.app.steam_appid === resolved.app.steam_appid))
                        valid.push({ ...resolved, score });
                } catch (error) {
                    if (!['NO_MATCH'].includes(error?.code)) throw error;
                    lastFailure = error;
                }
            };
            // Strong exact results require one detail lookup. Ambiguous alternatives share the bounded worker pool.
            if (ranked.length) await validateCandidate(ranked[0]);
            if (!(valid.length === 1 && valid[0].score === 100 && (ranked[1]?.score ?? -Infinity) < 92)) {
                await Promise.all(ranked.slice(1).map(validateCandidate));
            }
            valid.sort((a, b) => b.score - a.score);
            if (
                valid.length &&
                (valid.length === 1 ||
                    (valid[0].score === 100 && valid[1].score < 100) ||
                    valid[0].score - valid[1].score >= 8)
            ) {
                const winner = valid[0];
                winner.match = {
                    ...winner.match,
                    score: winner.score,
                    reason: winner.match.parentChain.length
                        ? 'Verified DLC parent'
                        : winner.score === 100
                          ? 'Validated full title'
                          : 'Validated title variant',
                    candidates: rankSteamSuggestions(identity.title, [...considered.values()])
                };
                mapIdentity(identity, winner);
                return winner;
            }
            if (valid.length > 1) {
                const linked = await sourceEvidence();
                if (linked) return linked;
                const error = steamError(
                    'AMBIGUOUS_MATCH',
                    'More than one Steam game matches this title. Choose the correct game.',
                    {
                        candidates: rankSteamSuggestions(
                            identity.title,
                            valid.map((item) => ({
                                appId: item.app.steam_appid,
                                name: item.app.name,
                                score: item.score
                            }))
                        )
                    }
                );
                setRecord('negative', identity.key, {
                    fingerprint: identity.fingerprint,
                    code: error.code,
                    message: error.message,
                    candidates: error.candidates,
                    ts: stamp()
                });
                throw error;
            }
        }
        const linked = await sourceEvidence();
        if (linked) return linked;
        const candidates = rankSteamSuggestions(identity.title, [...considered.values()]);
        const error = steamError(
            'NO_MATCH',
            lastFailure?.message || 'A confident base-game match was not found. Choose a Steam game or try its AppID.',
            { candidates }
        );
        setRecord('negative', identity.key, {
            fingerprint: identity.fingerprint,
            code: error.code,
            message: error.message,
            candidates,
            ts: stamp()
        });
        throw error;
    }

    function parseTags(html) {
        if (typeof env.DOMParser !== 'function')
            throw steamError('SCHEMA', 'This browser cannot parse the Steam tag page.');
        const doc = new env.DOMParser().parseFromString(html, 'text/html');
        const tags = [...doc.querySelectorAll('a.app_tag')]
            .map((element) => String(element.textContent || '').trim())
            .filter((tag) => tag && tag !== '+')
            .slice(0, 10);
        if (tags.length) return [...new Set(tags)].slice(0, 5);
        if (
            doc.querySelector('#agegate_box, .agegate_birthday_selector') ||
            /access\s+denied|verify\s+you\s+are\s+human|captcha/i.test(doc.title || '')
        )
            throw steamError('SCHEMA', 'Steam tags are blocked or require a store-page check.');
        if (!doc.querySelector('.apphub_AppName, .game_area_purchase, #game_area_description'))
            throw steamError('SCHEMA', 'Steam returned a page without the expected game information.');
        return [];
    }

    function tagUsable(record) {
        return (
            record &&
            (record.state === 'ready'
                ? record.tags.length > 0 && now() - record.ts < 7 * STEAM_DAY
                : now() - record.ts < (record.state === 'empty' ? 15 * 60000 : 30000))
        );
    }

    async function ensureTags(appId, context, force = false) {
        const id = steamAppId(appId);
        const cached = touch('tags', id);
        if (
            !force &&
            tagUsable(cached) &&
            (cached.state !== 'ready' ||
                now() - cached.ts < STEAM_DAY ||
                (cached.attemptTs && now() - cached.attemptTs < 30000))
        ) {
            measurements.tagCacheHits++;
            return cached;
        }
        try {
            const html = await request(
                `tags:${id}`,
                `https://store.steampowered.com/app/${id}/?l=${STEAM_LANGUAGE}&cc=${STEAM_COUNTRY}`,
                { ...context, priority: steamPriority(context.priority) - 2, text: true }
            );
            const tags = parseTags(html);
            checkGeneration(context.token, context.signal);
            const record = { tags, state: tags.length ? 'ready' : 'empty', ts: stamp() };
            setRecord('tags', id, record);
            emit('tags', id);
            return record;
        } catch (error) {
            if (error?.code === 'ABORTED') throw error;
            checkGeneration(context.token, context.signal);
            const record = cached?.tags?.length
                ? { ...cached, attemptTs: stamp(), error: error.message }
                : { tags: [], state: 'error', error: error.message, ts: stamp() };
            setRecord('tags', id, record);
            emit('tags', id);
            return record;
        }
    }

    function reviewKey(appId) {
        return `${steamAppId(appId)}:${settings.reviewPurchaseType}`;
    }

    function reviewTtl(appId) {
        const app = tables.details.get(String(appId))?.data;
        const date = Date.parse(app?.release_date?.date || '');
        return app?.release_date?.coming_soon || !Number.isFinite(date) || now() - date < 14 * STEAM_DAY
            ? 15 * 60000
            : 3 * 3600000;
    }

    async function ensureReviews(appId, context, force = false) {
        const id = steamAppId(appId);
        const key = reviewKey(id);
        const existing = touch('reviews', key);
        if (
            !force &&
            existing &&
            (now() - existing.ts < (existing.state === 'error' ? 30000 : reviewTtl(id)) ||
                (existing.attemptTs && now() - existing.attemptTs < 30000))
        )
            return existing;
        if (reviewing.has(key)) {
            scheduler.promote(`reviews:${key}`, steamPriority(context.priority) + 15);
            return reviewing.get(key);
        }
        const purchaseType = settings.reviewPurchaseType;
        const input = {
            appid: Number(id),
            filter: 0,
            languages: ['all'],
            review_type: 0,
            purchase_type: purchaseType,
            num_per_page: 1,
            cursor: '*',
            day_range: 0
        };
        const run = (async () => {
            try {
                const body = await request(
                    `reviews:${key}`,
                    `https://api.steampowered.com/IUserReviewsService/GetAppReviews/v1/?input_json=${encodeURIComponent(JSON.stringify(input))}`,
                    { ...context, signal: undefined, priority: steamPriority(context.priority) + 15 }
                );
                const info = parseReviewSummary(body);
                checkGeneration(context.token);
                const record = { info, state: info.total ? 'ready' : 'empty', ts: stamp() };
                setRecord('reviews', key, record);
                emit('reviews', id);
                return record;
            } catch (error) {
                if (error?.code === 'ABORTED' || context.token !== generation || disposed) return null;
                const record = existing?.info
                    ? { ...existing, attemptTs: stamp(), error: error.message }
                    : { info: null, state: 'error', error: error.message, ts: stamp() };
                setRecord('reviews', key, record);
                emit('reviews', id);
                return record;
            } finally {
                if (reviewing.get(key) === run) reviewing.delete(key);
            }
        })();
        reviewing.set(key, run);
        return run;
    }

    function getPreviewData(appId) {
        const id = steamAppId(appId);
        const app = id && touch('details', id)?.data;
        if (!app || app.type !== 'game') return null;
        const tag = touch('tags', id);
        const review = touch('reviews', reviewKey(id));
        return {
            ...app,
            appId: Number(id),
            releaseDate: app.release_date.date || null,
            comingSoon: app.release_date.coming_soon,
            tags: tag?.tags || [],
            tagsSource: 'steam',
            tagState: tag?.state || 'loading',
            tagError: tag?.error || null,
            reviewInfo: review?.info || null,
            reviewState: review?.state || 'loading',
            reviewError: review?.error || null,
            reviewPurchaseType: settings.reviewPurchaseType,
            storeUrl: `https://store.steampowered.com/app/${id}/`,
            match: matches.get(id) || { kind: 'cache' }
        };
    }

    function mappingForSource(source) {
        const identity = sourceIdentity(source);
        const overrideRecord = touch('corrections', identity.key);
        const override = overrideRecord?.deleted ? null : overrideRecord;
        const resetMarker =
            overrideRecord?.deleted && overrideRecord.fingerprint === identity.fingerprint ? overrideRecord : null;
        const record =
            override?.fingerprint === identity.fingerprint
                ? override
                : touch('mappings', identity.key) || touch('mappings', identity.queryKey);
        if (
            !record ||
            (resetMarker && record.ts <= resetMarker.ts) ||
            record.fingerprint !== identity.fingerprint ||
            (record !== override && now() - record.ts >= 30 * STEAM_DAY)
        )
            return null;
        return record;
    }

    function peekPreview(source) {
        if (!initialized || disposed) return null;
        let mapping;
        try {
            mapping = mappingForSource(source);
        } catch {
            return null;
        }
        if (!mapping || !tagUsable(touch('tags', mapping.appId))) return null;
        const data = getPreviewData(mapping.appId);
        if (!data) return null;
        measurements.previewCacheHits++;
        return { ...data, match: mapping.match || data.match };
    }

    async function loadPreview(source, options = {}) {
        await ready;
        const started = now();
        const context = { priority: options.priority || 'hover', signal: options.signal, token: generation };
        checkGeneration(context.token, context.signal);
        measurements.previews++;
        const resolved = await resolveSource(source, context, options.force === true);
        const id = String(resolved.app.steam_appid);
        const cachedTags = touch('tags', id);
        const usableTags = tagUsable(cachedTags) && cachedTags.state === 'ready';
        const tagPromise = ensureTags(id, context, options.force === true);
        // The tag request is enqueued first. Reviews use spare capacity and never delay the tags-ready promise.
        ensureReviews(id, { ...context, signal: undefined }).catch(() => {});
        if (usableTags && !options.force) tagPromise.catch(() => {});
        else await tagPromise;
        checkGeneration(context.token, context.signal);
        const data = getPreviewData(id);
        if (!data) throw steamError('NO_MATCH', 'The verified game details are no longer available.');
        measurements.tagReadyMs.push(Math.max(0, now() - started));
        measurements.tagReadyMs = measurements.tagReadyMs.slice(-100);
        const cachedDetails = touch('details', id);
        if (cachedDetails && now() - cachedDetails.ts >= STEAM_DAY && !refreshingDetails.has(id)) {
            const refresh = details(
                id,
                { ...context, signal: undefined, priority: steamPriority(context.priority) + 20 },
                true
            )
                .catch(() => {})
                .finally(() => refreshingDetails.delete(id));
            refreshingDetails.set(id, refresh);
        }
        return { ...data, match: resolved.match };
    }

    async function correctMatch(source, value) {
        await ready;
        const id = steamParseAppInput(value);
        if (!id) throw steamError('NO_MATCH', 'Enter a numeric Steam AppID or a store.steampowered.com/app/ URL.');
        const context = { priority: 'hover', token: generation };
        const identity = sourceIdentity(source);
        const resolved = await baseGame(id, context);
        resolved.match = {
            ...resolved.match,
            kind: resolved.match.parentChain.length ? 'dlc-parent' : 'correction',
            reason: 'Saved match correction'
        };
        setRecord('corrections', identity.key, {
            appId: String(resolved.app.steam_appid),
            fingerprint: identity.fingerprint,
            title: identity.title.slice(0, 400),
            match: resolved.match,
            ts: stamp()
        });
        mapIdentity(identity, resolved, false);
        return loadPreview(source, { priority: 'hover' });
    }

    async function forgetMatch(source) {
        await ready;
        const identity = sourceIdentity(source);
        setRecord('corrections', identity.key, {
            deleted: true,
            fingerprint: identity.fingerprint,
            title: identity.title,
            ts: Math.max(stamp(), (touch('mappings', identity.key)?.ts || 0) + 1)
        });
        tables.mappings.delete(identity.key);
        tables.mappings.delete(identity.queryKey);
        tables.negative.delete(identity.key);
        saveSoon();
    }

    function exportCorrections() {
        return {
            schema: 1,
            exportedAt: new Date(now()).toISOString(),
            corrections: [...tables.corrections]
                .filter(([, item]) => !item.deleted)
                .map(([key, item]) => ({
                    key,
                    appId: Number(item.appId),
                    fingerprint: item.fingerprint,
                    title: item.title || ''
                }))
        };
    }

    async function importCorrections(input) {
        await ready;
        const data = steamDecodeStored(input);
        if (
            !data ||
            data.schema !== 1 ||
            !Array.isArray(data.corrections) ||
            data.corrections.length > limits.corrections
        )
            throw steamError('SCHEMA', 'The match-corrections file is invalid.');
        const entries = data.corrections.map((item) => {
            if (
                !item ||
                typeof item.key !== 'string' ||
                !item.key ||
                item.key.length > 700 ||
                !steamAppId(item.appId) ||
                typeof item.fingerprint !== 'string' ||
                !item.fingerprint ||
                item.fingerprint.length > 600 ||
                normalizeForMatch(item.title || '').slice(0, 600) !== item.fingerprint
            )
                throw steamError('SCHEMA', 'The match-corrections file contains an invalid entry.');
            return [
                item.key,
                {
                    appId: steamAppId(item.appId),
                    fingerprint: item.fingerprint,
                    title: String(item.title).slice(0, 400),
                    ts: stamp()
                }
            ];
        });
        for (const [key, item] of entries) setRecord('corrections', key, item);
        tables.negative.clear();
        await saveNow();
        return entries.length;
    }

    async function clear() {
        await ready;
        generation++;
        epoch = Math.max(now(), epoch + 1);
        scheduler.cancelAll();
        for (const [name, table] of Object.entries(tables)) if (name !== 'corrections') table.clear();
        // Preserve user-authored overrides across a data-cache clear, advancing their merge timestamp.
        for (const item of tables.corrections.values()) item.ts = stamp();
        searchCache.clear();
        matches.clear();
        reviewing.clear();
        refreshingDetails.clear();
        await saveNow();
        emit('clear');
    }

    function updateSettings(partial) {
        const oldPurchaseType = settings.reviewPurchaseType;
        settings = steamSettings({ ...settings, ...partial });
        try {
            Promise.resolve(env.setValue?.(settingsKey, JSON.stringify(settings))).catch(() => {});
        } catch {
            /* Remains usable in memory. */
        }
        emit('settings');
        if (oldPurchaseType !== settings.reviewPurchaseType)
            for (const id of tables.details.keys()) emit('reviews', id);
        return { ...settings };
    }

    function getDebugReport() {
        return {
            coreVersion: CORE_VERSION,
            textMatcher: 'Fuse.js 7.5.0 basic, local conservative fallback',
            schema: STEAM_SCHEMA,
            resolver: STEAM_RESOLVER,
            provider: STEAM_PROVIDER,
            capturedAt: new Date(now()).toISOString(),
            settings: { ...settings },
            cache: Object.fromEntries(Object.entries(tables).map(([name, table]) => [name, table.size])),
            scheduler: scheduler.stats(),
            measurements: {
                ...measurements,
                tagReadyMs: [...measurements.tagReadyMs],
                errors: [...measurements.errors]
            },
            // Identifiers and match reasons suffice; source URLs, session parameters and magnet URIs are excluded.
            matches: [...matches].slice(-30).map(([appId, match]) => ({
                appId: Number(appId),
                kind: match.kind,
                reason: match.reason || '',
                score: match.score ?? null,
                parentChain: match.parentChain || [],
                candidates: match.candidates || []
            })),
            fieldAges: [...tables.details].slice(-30).map(([appId, detail]) => ({
                appId: Number(appId),
                detailsAgeMs: Math.max(0, now() - detail.ts),
                tagsAgeMs: tables.tags.has(appId) ? Math.max(0, now() - tables.tags.get(appId).ts) : null,
                reviewsAgeMs: tables.reviews.has(reviewKey(appId))
                    ? Math.max(0, now() - tables.reviews.get(reviewKey(appId)).ts)
                    : null
            }))
        };
    }

    return {
        ready,
        loadPreview,
        searchGames,
        peekPreview,
        getPreviewData,
        correctMatch,
        forgetMatch,
        exportCorrections,
        importCorrections,
        clear,
        retryTags: async (appId) => {
            await ready;
            const id = steamAppId(appId);
            if (!id || !tables.details.has(id)) throw steamError('NO_MATCH', 'Load a game before retrying its tags.');
            await ensureTags(id, { priority: 'hover', token: generation }, true);
            return getPreviewData(id);
        },
        retryReviews: async (appId) => {
            await ready;
            const id = steamAppId(appId);
            if (!id || !tables.details.has(id))
                throw steamError('NO_MATCH', 'Load a game before retrying its reviews.');
            await ensureReviews(id, { priority: 'hover', token: generation }, true);
            return getPreviewData(id);
        },
        subscribe(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
        getSettings: () => ({ ...settings }),
        updateSettings,
        getDebugReport,
        onVisibilityChange: () => scheduler.onVisibilityChange(),
        flush: saveNow,
        dispose() {
            if (disposed) return;
            saveNow();
            disposed = true;
            generation++;
            scheduler.dispose();
            if (typeof removeStorageListener === 'function') removeStorageListener();
            listeners.clear();
        }
    };
}

// Source: vendor/steam-hover-core/src/core/site-utils.mjs
/** Same-origin source pages are fetched by site actions or bounded recovery after failed name matching. */
function createSourcePageTools({ window: win, document: doc, timeout = 8000 }) {
    const pending = new Map();
    const completed = new Map();
    function safeUrl(value) {
        const url = new URL(value, win.location.href);
        if (url.origin !== win.location.origin || !/^https?:$/.test(url.protocol)) {
            throw new Error('This action requires a page on the current site.');
        }
        url.hash = '';
        return url;
    }
    function fetchDocument(value) {
        const url = safeUrl(value).href;
        if (completed.has(url)) return Promise.resolve(completed.get(url));
        if (pending.has(url)) return pending.get(url);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const request = win
            .fetch(url, {
                credentials: 'same-origin',
                signal: controller.signal,
                headers: { Accept: 'text/html' }
            })
            .then(async (response) => {
                if (!response.ok) throw new Error(`Source page returned HTTP ${response.status}.`);
                const contentType = response.headers?.get('content-type') || '';
                if (contentType && !contentType.includes('text/html'))
                    throw new Error('Source page did not return HTML.');
                const finalUrl = safeUrl(response.url || url);
                if (finalUrl.pathname !== new URL(url).pathname)
                    throw new Error('Source page redirected. Open it to check access.');
                const topic = new URL(url).searchParams.get('t');
                if (topic && finalUrl.searchParams.get('t') && finalUrl.searchParams.get('t') !== topic)
                    throw new Error('Source page redirected to a different topic.');
                const html = await response.text();
                if (html.length > 2000000)
                    throw new Error('Source page is too large to inspect safely. Open it to check the Steam link.');
                const parsed = new win.DOMParser().parseFromString(html, 'text/html');
                completed.set(url, parsed);
                while (completed.size > 20) completed.delete(completed.keys().next().value);
                return parsed;
            })
            .catch((error) => {
                if (error.name === 'AbortError') throw new Error('Source page timed out. Try again.');
                throw error;
            })
            .finally(() => {
                clearTimeout(timer);
                pending.delete(url);
            });
        pending.set(url, request);
        return request;
    }
    return {
        safeUrl,
        fetchDocument,
        getSteamLinks: (root) => extractSteamAppLinks(root || doc),
        invalidate: (value) => completed.delete(safeUrl(value).href)
    };
}

/** Only consider links in a caller-selected content region, never unrelated sidebar links. */
function extractSteamAppLinks(root) {
    if (!root?.querySelectorAll) return [];
    const apps = new Map();
    for (const anchor of root.querySelectorAll('a[href]')) {
        try {
            const url = new URL(anchor.getAttribute('href'));
            if (url.protocol !== 'https:' && url.protocol !== 'http:') continue;
            if (url.hostname !== 'store.steampowered.com') continue;
            const appId = url.pathname.match(/^\/app\/(\d+)(?:\/|$)/)?.[1];
            if (!appId || !/^[1-9]\d{0,9}$/.test(appId) || Number(appId) > 4294967295) continue;
            apps.set(appId, {
                appId: Number(appId),
                name: anchor.textContent.trim().slice(0, 160) || `Steam App ${appId}`
            });
        } catch {
            /* Relative/forum redirect links are not explicit Steam identity evidence. */
        }
    }
    return [...apps.values()];
}

function threadTagColor(tag, theme = 'dark') {
    let hash = 0;
    for (const ch of String(tag).toLowerCase()) hash = (ch.charCodeAt(0) + ((hash << 5) - hash)) | 0;
    // Generic theme-aware palette; the CS.RIN adapter preserves Enhanced colours separately.
    const hue = ((hash % 360) + 360) % 360;
    const dark = theme !== 'light';
    let light = dark ? 72 : 28;
    for (let attempt = 0; attempt < 8; attempt++) {
        const rgb = tagHslToRgb(hue / 360, 0.65, light / 100);
        const luminance = tagRelativeLuminance(rgb);
        const background = dark ? tagRelativeLuminance([28, 28, 28]) : tagRelativeLuminance([240, 240, 240]);
        const contrast = (Math.max(luminance, background) + 0.05) / (Math.min(luminance, background) + 0.05);
        if (contrast >= 4.5) return '#' + rgb.map((value) => value.toString(16).padStart(2, '0')).join('');
        light += dark ? 3 : -3;
    }
    return dark ? '#eeeeee' : '#171717';
}

function tagRelativeLuminance(rgb) {
    const linear = rgb.map((value) => {
        const c = value / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function tagHslToRgb(h, s, l) {
    const a = s * Math.min(l, 1 - l);
    return [0, 8, 4].map((n) => {
        const k = (n + h * 12) % 12;
        return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
    });
}

// Source: vendor/steam-hover-core/src/core/preview.mjs
/** Shared, dependency-free preview UI. Built into both installable userscripts. */
// Steam symbol: Font Awesome Free 6.7.2, Fonticons, Inc., CC BY 4.0.
// https://github.com/FortAwesome/Font-Awesome/blob/6.x/svgs/brands/steam-symbol.svg
const PREVIEW_STEAM_PATH =
    'M395.5 177.5c0 33.8-27.5 61-61 61-33.8 0-61-27.3-61-61s27.3-61 61-61c33.5 0 61 27.2 61 61zm52.5.2c0 63-51 113.8-113.7 113.8L225 371.3c-4 43-40.5 76.8-84.5 76.8-40.5 0-74.7-28.8-83-67L0 358V250.7L97.2 290c15.1-9.2 32.2-13.3 52-11.5l71-101.7c.5-62.3 51.5-112.8 114-112.8C397 64 448 115 448 177.7zM203 363c0-34.7-27.8-62.5-62.5-62.5-4.5 0-9 .5-13.5 1.5l26 10.5c25.5 10.2 38 39 27.7 64.5-10.2 25.5-39.2 38-64.7 27.5-10.2-4-20.5-8.3-30.7-12.2 10.5 19.7 31.2 33.2 55.2 33.2 34.7 0 62.5-27.8 62.5-62.5zm207.5-185.3c0-42-34.3-76.2-76.2-76.2-42.3 0-76.5 34.2-76.5 76.2 0 42.2 34.3 76.2 76.5 76.2 41.9.1 76.2-33.9 76.2-76.2z';

// SteamDB logo: Simple Icons, CC0-1.0. Bundled, unmodified path.
// https://raw.githubusercontent.com/simple-icons/simple-icons/521c96fd04b0ea93034db8715eda5a4de27a58bb/icons/steamdb.svg
const PREVIEW_STEAMDB_PATH =
    'M11.981 0C5.72 0 .581 2.231.02 5.081l6.675 1.257c.544-.17 1.162-.244 1.8-.244l3.131-1.875c-.037-.469.244-.956.881-1.35.9-.581 2.307-.9 3.732-.9a8.582 8.582 0 012.812.412c2.1.713 2.569 2.082 1.069 3.057-.956.618-2.494.937-4.013.9l-4.125 1.48c-.037.3-.243.582-.637.845-1.106.712-3.263.88-4.8.356-.675-.225-1.125-.563-1.313-.9L.47 7.2c.431.675 1.125 1.294 2.025 1.838C.938 9.938 0 11.062 0 12.28c0 1.2.9 2.307 2.419 3.206C.9 16.37 0 17.476 0 18.675 0 21.619 5.363 24 12 24c6.619 0 12-2.381 12-5.325 0-1.2-.9-2.306-2.419-3.188C23.1 14.588 24 13.482 24 12.282c0-1.219-.938-2.362-2.512-3.262 1.556-.956 2.493-2.138 2.493-3.413 0-3.093-5.381-5.606-12-5.606zm4.275 2.663c-.975.018-1.912.225-2.512.618-1.031.675-.713 1.594.712 2.082 1.425.487 3.394.337 4.425-.338 1.032-.675.713-1.594-.712-2.062a6.376 6.376 0 00-1.913-.282zm.057.318c1.387 0 2.493.525 2.493 1.163 0 .637-1.106 1.162-2.493 1.162-1.388 0-2.494-.525-2.494-1.162 0-.638 1.106-1.163 2.494-1.163zM8.493 6.45c-.3.019-.58.038-.862.075l1.707.319a2.03.94 0 11-1.52 1.744l-1.668-.32c.188.17.45.32.806.45 1.2.413 2.888.282 3.75-.28.863-.563.6-1.35-.6-1.744-.487-.169-1.068-.244-1.612-.244zm11.944 3.113v1.743c0 2.063-3.787 3.732-8.437 3.732-4.669 0-8.437-1.67-8.437-3.732V9.581c2.156.994 5.137 1.613 8.418 1.613 3.3 0 6.3-.619 8.475-1.631zm0 6.487v1.65c0 2.063-3.787 3.731-8.437 3.731-4.669 0-8.437-1.668-8.437-3.731v-1.65c2.175.956 5.137 1.538 8.437 1.538s6.281-.582 8.438-1.538z';

function escapePreviewHtml(value) {
    return String(value ?? '').replace(
        /[&<>"']/g,
        (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]
    );
}

function safePreviewUrl(value) {
    try {
        const url = new URL(value);
        if (!['https:', 'http:'].includes(url.protocol)) return '';
        if (url.protocol === 'http:' && /(^|\.)(steamstatic\.com|akamaihd\.net)$/.test(url.hostname))
            url.protocol = 'https:';
        return url.href;
    } catch {
        return '';
    }
}

function previewIcon(name) {
    if (name === 'steam')
        return `<svg class="steamActionIcon" viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="${PREVIEW_STEAM_PATH}"/></svg>`;
    if (name === 'steamdb')
        return `<svg class="steamActionIcon steamDbIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="${PREVIEW_STEAMDB_PATH}"/></svg>`;
    if (name === 'magnet')
        return '<svg class="steamActionIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 4v9a7 7 0 0 0 14 0V4h-5v9a2 2 0 0 1-4 0V4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 8h5m4 0h5" stroke="currentColor" stroke-width="1.8"/></svg>';
    return '<svg class="steamActionIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 4h6v6m0-6L10 14m0-9H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function selectPreviewVideoSources(movie) {
    const sources = [];
    const seen = new Set();
    for (const [format, source] of [
        ['mp4', movie?.mp4],
        ['webm', movie?.webm],
        ['mp4', movie?.video_url]
    ]) {
        const entries = typeof source === 'string' ? [['', source]] : Object.entries(source || {});
        for (const [quality, value] of entries) {
            const url = safePreviewUrl(value);
            if (!url || seen.has(url)) continue;
            seen.add(url);
            const pixels = /^(max|hd)$/i.test(quality) ? 1080 : parseInt(String(quality).replace(/\D/g, ''), 10) || 0;
            // Prefer 720p in a hover/theatre player; larger files remain fallbacks.
            const distance = pixels === 720 ? 0 : pixels > 0 && pixels < 720 ? 720 - pixels : 1000 + pixels;
            sources.push({ url, format, quality: pixels, distance });
        }
    }
    return sources.sort((a, b) => a.distance - b.distance || (a.format === 'mp4' ? -1 : 1));
}

function normalizePreviewMedia(data) {
    const media = [];
    const seen = new Set();
    const title = data?.name || 'Steam media';
    const add = (item) => {
        const key = item.url || item.videoUrl || item.posterUrl;
        if (!key || seen.has(key)) return;
        seen.add(key);
        media.push(item);
    };
    const header = safePreviewUrl(data?.header_image);
    if (header) add({ type: 'image', source: 'header', url: header, alt: `${title} Steam header image` });
    for (const [index, movie] of (Array.isArray(data?.movies) ? data.movies : []).entries()) {
        if (!movie || typeof movie !== 'object') continue;
        const posterUrl = safePreviewUrl(movie.thumbnail);
        const videoSources = selectPreviewVideoSources(movie);
        const hlsUrl = safePreviewUrl(movie.hls_h264 || movie.hlsManifest || movie.hls);
        if (posterUrl && (videoSources.length || hlsUrl))
            add({
                type: 'video',
                source: 'movie',
                posterUrl,
                videoUrl: videoSources[0]?.url || '',
                videoSources,
                hlsUrl,
                alt: movie.name || `${title} video ${index + 1}`
            });
    }
    for (const [index, screenshot] of (Array.isArray(data?.screenshots) ? data.screenshots : []).entries()) {
        if (!screenshot || typeof screenshot !== 'object') continue;
        const url = safePreviewUrl(screenshot.path_full || screenshot.path_thumbnail);
        const thumbUrl = safePreviewUrl(screenshot.path_thumbnail) || url;
        if (url) add({ type: 'image', source: 'screenshot', url, thumbUrl, alt: `${title} screenshot ${index + 1}` });
    }
    return media;
}

function previewReleaseText(data) {
    const date = data?.releaseDate || data?.release_date?.date || '';
    const upcoming = data?.comingSoon || data?.release_date?.coming_soon;
    return upcoming ? (date ? `Planned release: ${date}` : 'Coming soon') : date ? `Released: ${date}` : '';
}

function previewTagsMarkup(data) {
    const tags = Array.isArray(data?.tags)
        ? data.tags.filter((tag) => typeof tag === 'string' && tag.trim()).slice(0, 5)
        : [];
    if (tags.length && data.tagsSource !== 'genres')
        return `<strong>Tags:</strong> ${tags.map(escapePreviewHtml).join(' • ')}`;
    if (data?.tagState === 'loading') return '<span>Loading Steam tags…</span>';
    return '<span>Steam tags unavailable</span> <button type="button" class="steamMetadataRetry" data-retry="tags">Retry tags</button>';
}

function previewReviewsMarkup(data) {
    const review = data?.reviewInfo;
    if (data?.reviewState === 'error')
        return '<span>Reviews unavailable</span> <button type="button" class="steamMetadataRetry" data-retry="reviews">Retry reviews</button>';
    if (data?.reviewState === 'loading' || (!review && data?.reviewState !== 'empty'))
        return '<span>Loading reviews…</span>';
    if (!review || Number(review.total) === 0) return '<span>No user reviews yet</span>';
    const total = Number(review.total);
    if (!Number.isFinite(total) || total < 0)
        return '<span>Reviews unavailable</span> <button type="button" class="steamMetadataRetry" data-retry="reviews">Retry reviews</button>';
    const count = total.toLocaleString('en-US');
    const percent = review.percent == null ? NaN : Number(review.percent);
    let stars = '';
    if (Number.isFinite(percent) && percent >= 0 && percent <= 100) {
        const filled =
            percent >= 95 ? 5 : percent >= 80 ? 4 : percent >= 70 ? 3 : percent >= 40 ? 2 : percent >= 20 ? 1 : 0;
        stars =
            '<span class="ratingStars" aria-label="' +
            Math.round(percent) +
            '% positive">' +
            '★'.repeat(filled) +
            '☆'.repeat(5 - filled) +
            '</span>';
    }
    const desc =
        review.desc && !['N/A', 'No Reviews'].includes(review.desc) ? escapePreviewHtml(review.desc) + '  |  ' : '';
    return (
        '<strong>Rating:</strong> ' +
        stars +
        '<span class="ratingText">' +
        desc +
        count +
        ' ' +
        (total === 1 ? 'review' : 'reviews') +
        '</span>'
    );
}

function mountSteamHoverPreview({
    client,
    adapter,
    addStyle,
    document: doc = globalThis.document,
    window: win = globalThis.window
}) {
    const document = doc;
    const window = win;
    const escapeHtml = escapePreviewHtml;
    const getUsableMediaUrl = safePreviewUrl;
    const isUsableUrl = (value) => Boolean(safePreviewUrl(value));
    const normalizeSteamMedia = normalizePreviewMedia;
    const orderSteamMediaItems = (media) => media;
    const FADE_DURATION = 150;
    const HIDE_DELAY = 160;
    const timers = new Set();
    const cleanups = [];
    const schedule = (fn, ms) => {
        const id = window.setTimeout(() => {
            timers.delete(id);
            fn();
        }, ms);
        timers.add(id);
        return id;
    };
    const cancel = (id) => {
        if (id != null) {
            window.clearTimeout(id);
            timers.delete(id);
        }
    };
    const listen = (target, name, handler, options) => {
        target.addEventListener(name, handler, options);
        cleanups.push(() => target.removeEventListener(name, handler, options));
    };
    const focus = (element) => {
        try {
            element?.focus({ preventScroll: true });
        } catch {
            element?.focus();
        }
    };
    const idPrefix = `steam-preview-${String(adapter.id).replace(/[^a-z0-9-]/gi, '')}`;
    const theatreTitleId = `${idPrefix}-theatre-title`;
    const tip = document.createElement('div');
    tip.className = `steamHoverPreview ${adapter.id === '1337x' ? 'steamHoverTip' : 'csrinruSteamHoverTip'}`;
    tip.id = `${idPrefix}-card`;
    tip.tabIndex = -1;
    tip.setAttribute('role', 'dialog');
    tip.setAttribute('aria-modal', 'false');
    tip.setAttribute('aria-label', 'Steam game preview');
    tip.setAttribute('aria-hidden', 'true');
    tip.dataset.previewState = 'hidden';
    const theatre = document.createElement('div');
    theatre.className = 'steamPreviewTheatre';
    theatre.tabIndex = -1;
    theatre.setAttribute('role', 'dialog');
    theatre.setAttribute('aria-modal', 'true');
    theatre.setAttribute('aria-labelledby', theatreTitleId);
    theatre.setAttribute('aria-hidden', 'true');
    const status = document.createElement('div');
    status.className = 'steamPreviewAnnouncer';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const style = document.createElement('style');
    style.dataset.steamPreviewStyle = adapter.id;
    style.textContent = `
        .steamHoverPreview {
            position: absolute;
            display: none;
            opacity: 0;
            max-width: 420px;
            padding: 8px;
            background: rgb(28, 28, 28);
            border: 1px solid #5c5c5c;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
            color: #c1cccc;
            font-size: 12px;
            line-height: 1.45;
            white-space: normal !important;
            overflow-wrap: break-word;
            z-index: 2147483647;
            pointer-events: none;
            transition: opacity ${FADE_DURATION}ms ease-in-out;
        }
        .steamHoverPreview p {
            margin: 0 0 5px 0;
            padding: 0;
        }
        .steamHoverPreview p:last-child {
            margin-bottom: 0;
        }
        .steamHoverPreview img {
            display: block;
            width: 100%;
            margin-bottom: 8px;
            border-radius: 2px;
        }
        .steamHoverPreview .steamMediaShell {
            margin-bottom: 8px;
        }
        .steamHoverPreview .steamMediaFrame {
            position: relative;
            width: 100%;
            aspect-ratio: 460 / 215;
            overflow: hidden;
            background: #111;
            border-radius: 2px;
        }
        .steamHoverPreview .steamMediaViewport {
            width: 100%;
            height: 100%;
            background: #111;
        }
        .steamHoverPreview .steamMediaImage,
        .steamHoverPreview .steamMediaPoster,
        .steamHoverPreview .steamMediaVideo {
            display: block;
            width: 100%;
            height: 100%;
            margin: 0;
            border-radius: 0;
            object-fit: cover;
        }
        .steamHoverPreview .steamMediaVideo {
            background: #000;
        }
        .steamHoverPreview .steamMediaError {
            display: grid;
            place-items: center;
            gap: 6px;
            width: 100%;
            height: 100%;
            padding: 12px;
            background: #151515;
            color: #d6e8ee;
            font-size: 12px;
            text-align: center;
            box-sizing: border-box;
        }
        .steamHoverPreview .steamMediaError a,
        .steamPreviewTheatreError a {
            color: #99d2f7 !important;
            font-weight: bold;
            text-decoration: underline;
        }
        .steamHoverPreview .steamMediaNavBtn {
            position: absolute;
            top: 50%;
            display: grid;
            place-items: center;
            width: 26px;
            height: 36px;
            margin: 0;
            padding: 0;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: rgba(0, 0, 0, 0.58);
            color: #f2f2f2;
            font: bold 19px/1 Arial, sans-serif;
            cursor: pointer;
            opacity: 0.82;
            touch-action: manipulation;
            transform: translateY(-50%);
        }
        .steamHoverPreview .steamMediaNavBtn:hover,
        .steamHoverPreview .steamMediaNavBtn:focus {
            opacity: 1;
            background: rgba(0, 0, 0, 0.74);
            outline: 1px solid #99d2f7;
        }
        .steamHoverPreview .steamMediaPrevBtn {
            left: 5px;
        }
        .steamHoverPreview .steamMediaNextBtn {
            right: 5px;
        }
        .steamHoverPreview .steamMediaCounter {
            position: absolute;
            top: 6px;
            right: 6px;
            padding: 1px 5px;
            background: rgba(0, 0, 0, 0.68);
            border-radius: 3px;
            color: #d6e8ee;
            font-size: 10px;
            line-height: 1.35;
        }
        .steamHoverPreview .steamMediaPlayBtn {
            position: relative;
            display: block;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            border: 0;
            background: #111;
            cursor: pointer;
            touch-action: manipulation;
        }
        .steamHoverPreview .steamMediaPlayBtn:hover .steamMediaPlayIcon,
        .steamHoverPreview .steamMediaPlayBtn:focus .steamMediaPlayIcon {
            background: rgba(0, 0, 0, 0.78);
            outline: 1px solid #99d2f7;
        }
        .steamHoverPreview .steamMediaPlayIcon {
            position: absolute;
            top: 50%;
            left: 50%;
            display: grid;
            place-items: center;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.62);
            color: #f2f2f2;
            font-size: 24px;
            line-height: 1;
            transform: translate(-50%, -50%);
        }
        .steamHoverPreview .steamMediaThumbStrip {
            display: flex;
            gap: 3px;
            margin-top: 4px;
            overflow-x: auto;
            scrollbar-width: thin;
            scrollbar-color: #40566a #151515;
        }
        .steamHoverPreview .steamMediaThumbStrip::-webkit-scrollbar {
            height: 6px;
        }
        .steamHoverPreview .steamMediaThumbStrip::-webkit-scrollbar-track {
            background: #151515;
        }
        .steamHoverPreview .steamMediaThumbStrip::-webkit-scrollbar-thumb {
            background: #40566a;
            border-radius: 999px;
        }
        .steamHoverPreview .steamMediaThumbBtn {
            position: relative;
            flex: 0 0 52px;
            width: 52px;
            height: 32px;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #111;
            border: 1px solid #333;
            border-radius: 2px;
            cursor: pointer;
            opacity: 0.74;
            touch-action: manipulation;
        }
        .steamHoverPreview .steamMediaThumbStripFit {
            overflow-x: hidden;
        }
        .steamHoverPreview .steamMediaThumbStripFit .steamMediaThumbBtn {
            flex: 1 1 0;
            width: auto;
            min-width: 0;
        }
        .steamHoverPreview .steamMediaThumbBtn:hover,
        .steamHoverPreview .steamMediaThumbBtn:focus {
            opacity: 1;
            border-color: #99d2f7;
            outline: 1px solid rgba(153, 210, 247, 0.62);
        }
        .steamHoverPreview .steamMediaThumbActive {
            opacity: 1;
            border-color: #99d2f7;
            box-shadow: 0 0 0 1px rgba(153, 210, 247, 0.45);
        }
        .steamHoverPreview .steamMediaThumbImage {
            display: block;
            width: 100%;
            height: 100%;
            margin: 0;
            border-radius: 0;
            object-fit: cover;
        }
        .steamHoverPreview .steamMediaThumbPlayIcon {
            position: absolute;
            right: 3px;
            bottom: 3px;
            display: grid;
            place-items: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.72);
            color: #f2f2f2;
            font-size: 10px;
            line-height: 1;
        }
        .steamHoverPreview strong {
            color: #f2f2f2;
        }
        .steamHoverPreview a,
        .steamHoverPreview a:visited {
            color: #99d2f7 !important;
            text-decoration: underline;
            cursor: pointer;
        }
        .steamHoverPreview a:hover,
        .steamHoverPreview a:visited:hover {
            color: #c7ebff !important;
        }
        .steamHoverPreview .steamRating,
        .steamHoverPreview .steamTags,
        .steamHoverPreview .steamMetaRow,
        .steamHoverPreview .steamReleaseDate {
            margin-top: 8px;
            font-size: 12px;
            color: #c1cccc;
        }
        .steamHoverPreview .steamReleaseDate,
        .steamHoverPreview .steamMetaRow {
            margin-top: 2px;
            font-size: 11px;
            color: #a8b4b8;
        }
        .steamHoverPreview .steamMetaRow {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex-wrap: nowrap;
            gap: 3px 10px;
        }
        .steamHoverPreview .steamAppIdControl {
            display: inline-flex;
            align-items: baseline;
            gap: 4px;
            flex-shrink: 0;
        }
        .steamHoverPreview .copyAppIdBtn {
            display: inline;
            margin: 0;
            padding: 0;
            border: 0;
            background: transparent;
            color: #99d2f7;
            font: inherit;
            text-decoration: underline;
            cursor: pointer;
        }
        .steamHoverPreview .copyAppIdBtn:hover {
            color: #c7ebff;
        }
        .steamHoverPreview .steamDbLink,
        .steamHoverPreview .steamDbLink:visited {
            display: inline-block;
            padding: 0 2px;
            color: #99d2f7 !important;
            font-weight: bold;
            line-height: 1;
            text-decoration: none;
        }
        .steamHoverPreview .steamDbLink:hover,
        .steamHoverPreview .steamDbLink:visited:hover {
            color: #c7ebff !important;
            text-decoration: underline;
        }
        .steamHoverPreview .threadTagList {
            display: flex;
            justify-content: flex-end;
            flex-wrap: nowrap;
            flex: 1 1 auto;
            gap: 0 4px;
            margin-left: auto;
            min-width: 0;
            overflow: hidden;
        }
        .steamHoverPreview .steamMetaRowTagsOnly .threadTagList {
            justify-content: flex-start;
            margin-left: 0;
        }
        .steamHoverPreview .threadTag {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 0 1 auto;
            font-weight: bold;
            min-width: 0;
            max-width: 100%;
        }
        .steamHoverPreview .threadTagText {
            font-size: 1em;
        }
        .steamHoverPreview .ratingStars {
            color: #f5c518;
            margin-right: 6px;
            letter-spacing: 1px;
            font-size: 14px;
            display: inline-block;
            vertical-align: middle;
        }
        .steamHoverPreview .ratingText {
            vertical-align: middle;
        }
        .steamHoverPreview .loadingContainer {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .steamHoverPreview .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid #3a3a3a;
            border-top-color: #99d2f7;
            border-radius: 50%;
            animation: steamPreviewSpinner 0.8s linear infinite;
            flex-shrink: 0;
        }
        @keyframes steamPreviewSpinner {
            to { transform: rotate(360deg); }
        }
        .steamHoverPreview .tipActions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 14px;
            margin-top: 8px;
            padding-top: 2px;
            border-top: none;
        }
        .steamHoverPreview .steamMediaExpandBtn {
            position: absolute;
            top: 6px;
            left: 6px;
            display: grid;
            place-items: center;
            width: 24px;
            height: 24px;
            margin: 0;
            padding: 0;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: rgba(0, 0, 0, 0.58);
            color: #f2f2f2;
            font: bold 16px/1 Arial, sans-serif;
            cursor: pointer;
            opacity: 0.82;
            touch-action: manipulation;
        }
        .steamHoverPreview .steamMediaExpandBtn:hover,
        .steamHoverPreview .steamMediaExpandBtn:focus {
            opacity: 1;
            background: rgba(0, 0, 0, 0.74);
            outline: 1px solid #99d2f7;
        }
        .steamHoverPreview .steamTheatreIcon,
        .steamPreviewTheatre .steamTheatreIcon {
            position: relative;
            display: block;
            width: 17px;
            height: 11px;
            border: 2px solid currentColor;
            border-radius: 1px;
            box-sizing: border-box;
        }
        .steamHoverPreview .steamTheatreIcon::after,
        .steamPreviewTheatre .steamTheatreIcon::after {
            content: '';
            position: absolute;
            left: 4px;
            right: 4px;
            bottom: -5px;
            height: 2px;
            background: currentColor;
            opacity: 0.72;
        }
        .steamHoverPreview .steamMediaExpandHidden {
            display: none;
        }
        .steamPreviewTheatre {
            position: fixed;
            inset: 0;
            display: none;
            place-items: center;
            padding: 48px;
            background: rgba(0, 0, 0, 0.78);
            color: #c7d5e0;
            font: 12px/1.45 Arial, Helvetica, sans-serif;
            z-index: 2147483647;
            box-sizing: border-box;
        }
        .steamPreviewTheatreOpen {
            display: grid;
        }
        .steamPreviewTheatreShell {
            display: grid;
            grid-template-rows: 34px minmax(0, 1fr) auto;
            width: min(1416px, calc(100vw - 96px));
            height: min(866px, calc(100vh - 96px));
            overflow: hidden;
            background: #050505;
            box-shadow: 0 8px 36px rgba(0, 0, 0, 0.72);
        }
        .steamPreviewTheatreVideoMode .steamPreviewTheatreShell {
            grid-template-rows: 34px minmax(0, 1fr) auto 33px;
        }
        .steamPreviewTheatre:fullscreen {
            padding: 0;
            background: #000;
        }
        .steamPreviewTheatre:fullscreen .steamPreviewTheatreShell {
            width: 100vw;
            height: 100vh;
        }
        .steamPreviewTheatreHeader {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
            padding: 0 96px;
            background: #20262e;
            box-sizing: border-box;
        }
        .steamPreviewTheatreTitle {
            overflow: hidden;
            color: #b8c6d4;
            font-size: 13px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .steamPreviewTheatreHeaderControls {
            position: absolute;
            top: 5px;
            right: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .steamPreviewTheatreBtn,
        .steamPreviewTheatreNavBtn {
            margin: 0;
            border: 0;
            color: #f2f2f2;
            cursor: pointer;
            touch-action: manipulation;
        }
        .steamPreviewTheatreBtn {
            display: grid;
            place-items: center;
            width: 24px;
            height: 24px;
            padding: 0;
            background: transparent;
            font: bold 21px/1 Arial, sans-serif;
            opacity: 0.82;
        }
        .steamPreviewTheatreBtn:hover,
        .steamPreviewTheatreBtn:focus {
            opacity: 1;
            outline: 1px solid #99d2f7;
        }
        .steamPreviewTheatreStage {
            position: relative;
            min-width: 0;
            min-height: 0;
            overflow: hidden;
            background: #050505;
        }
        .steamPreviewTheatreViewport {
            display: grid;
            place-items: center;
            width: 100%;
            height: 100%;
        }
        .steamPreviewTheatreImage,
        .steamPreviewTheatrePoster,
        .steamPreviewTheatreVideo {
            display: block;
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            margin: 0;
            object-fit: contain;
            background: #000;
        }
        .steamPreviewTheatreVideoWrap {
            position: relative;
            width: 100%;
            height: 100%;
            background: #000;
        }
        .steamPreviewTheatreVideoWrap:fullscreen {
            width: 100vw;
            height: 100vh;
        }
        .steamPreviewTheatreVideoControls {
            display: grid;
            gap: 6px;
            align-content: end;
            min-height: 72px;
            padding: 18px 20px 12px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.76) 0%, rgba(0, 0, 0, 0.54) 48%, rgba(0, 0, 0, 0.16) 82%, rgba(0, 0, 0, 0) 100%);
            color: #f2f2f2;
            box-sizing: border-box;
        }
        .steamPreviewTheatreVideoControlsFullscreen {
            display: none;
        }
        .steamPreviewTheatreVideoWrap:fullscreen .steamPreviewTheatreVideoControlsFullscreen {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            display: grid;
            min-height: 96px;
            padding: 34px 20px max(16px, env(safe-area-inset-bottom));
            z-index: 3;
        }
        .steamPreviewTheatre:fullscreen .steamPreviewTheatreVideoControls {
            min-height: 72px;
            padding: 18px 20px 12px;
        }
        .steamPreviewTheatreVideoSeek {
            width: 100%;
            height: 10px;
            margin: 0;
            accent-color: #1a9fff;
            cursor: pointer;
        }
        .steamPreviewTheatreVideoControlRow {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
        }
        .steamPreviewTheatreVideoControlSpacer {
            flex: 1 1 auto;
        }
        .steamPreviewTheatreVideoControlBtn {
            display: grid;
            place-items: center;
            width: 28px;
            height: 24px;
            margin: 0;
            padding: 0;
            background: transparent;
            border: 0;
            color: #f2f2f2;
            font: bold 18px/1 Arial, Helvetica, sans-serif;
            cursor: pointer;
            opacity: 0.86;
            touch-action: manipulation;
        }
        .steamPreviewTheatreVideoControlBtn:hover,
        .steamPreviewTheatreVideoControlBtn:focus {
            opacity: 1;
            outline: 1px solid #99d2f7;
        }
        .steamPreviewTheatreVideoTime {
            flex: 0 0 auto;
            color: #d6e8ee;
            font-size: 13px;
            white-space: nowrap;
        }
        .steamPreviewTheatreNavBtn {
            position: absolute;
            top: 50%;
            display: grid;
            place-items: center;
            width: 48px;
            height: 72px;
            padding: 0;
            background: rgba(0, 0, 0, 0.26);
            font: bold 52px/1 Arial, sans-serif;
            opacity: 0.62;
            transform: translateY(-50%);
        }
        .steamPreviewTheatreNavBtn:hover,
        .steamPreviewTheatreNavBtn:focus {
            opacity: 1;
            background: rgba(0, 0, 0, 0.42);
            outline: 1px solid #99d2f7;
        }
        .steamPreviewTheatrePrevBtn {
            left: 0;
        }
        .steamPreviewTheatreNextBtn {
            right: 0;
        }
        .steamPreviewTheatreFooter {
            position: relative;
            display: grid;
            place-items: center;
            min-height: 33px;
            padding: 7px 72px 8px;
            background: #20262e;
            box-sizing: border-box;
        }
        .steamPreviewTheatreVideoMode .steamPreviewTheatreFooter {
            padding: 7px 72px 8px;
        }
        .steamPreviewTheatreFooterActions {
            position: absolute;
            top: 50%;
            left: 18px;
            display: flex;
            align-items: center;
            gap: 14px;
            max-width: calc(50% - 72px);
            min-width: 0;
            overflow: hidden;
            transform: translateY(-50%);
        }
        .steamPreviewTheatreFooterActions a {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            min-width: 0;
            overflow: hidden;
            color: #99d2f7 !important;
            font: 12px/1.35 Arial, Helvetica, sans-serif;
            text-decoration: underline;
            text-overflow: ellipsis;
            white-space: nowrap;
            opacity: 0.92;
            touch-action: manipulation;
        }
        .steamPreviewTheatreFooterActions a:hover,
        .steamPreviewTheatreFooterActions a:focus {
            color: #c7ebff !important;
            opacity: 1;
            outline: none;
        }
        .steamPreviewTheatreCounter {
            color: #9fb0bf;
            font-size: 12px;
            text-align: center;
        }
        .steamPreviewTheatreFooterControlsHost {
            position: absolute;
            top: 50%;
            right: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
            transform: translateY(-50%);
        }
        .steamPreviewTheatreError {
            display: grid;
            place-items: center;
            gap: 8px;
            width: 100%;
            height: 100%;
            padding: 24px;
            color: #d6e8ee;
            text-align: center;
            box-sizing: border-box;
        }

        .steamHoverPreview { box-sizing: content-box; width: auto; max-width: 420px; max-inline-size: min(420px, calc(100vw - 38px)); max-block-size: calc(100vh - 38px); overflow: auto; overscroll-behavior: contain; background: var(--steam-preview-bg); color: var(--steam-preview-fg); border-color: var(--steam-preview-border); font-family: inherit; }
        .steamHoverPreview[data-theme="dark"] { --steam-preview-bg:#1c1c1c; --steam-preview-fg:#c1cccc; --steam-preview-muted:#a8b4b8; --steam-preview-link:#99d2f7; --steam-preview-strong:#f2f2f2; --steam-preview-border:#5c5c5c; color-scheme:dark; }
        .steamHoverPreview[data-theme="light"] { --steam-preview-bg:#f0f0f0; --steam-preview-fg:#111; --steam-preview-muted:#555; --steam-preview-link:#0645ad; --steam-preview-strong:#111; --steam-preview-border:#555; color-scheme:light; }
        .steamHoverPreview p, .steamHoverPreview .steamTags, .steamHoverPreview .steamRating { color:var(--steam-preview-fg); }
        .steamHoverPreview strong { color:var(--steam-preview-strong); }
        .steamHoverPreview a, .steamHoverPreview a:visited, .steamHoverPreview .copyAppIdBtn, .steamHoverPreview .steamDbLink { color:var(--steam-preview-link) !important; }
        .steamHoverPreview .steamMetaRow, .steamHoverPreview .steamReleaseDate, .steamHoverPreview .steamMatchNote { color:var(--steam-preview-muted); }
        .steamHoverPreview button, .steamHoverPreview input { font-family:inherit; }
        .steamHoverPreview button:focus-visible, .steamHoverPreview a:focus-visible, .steamHoverPreview input:focus-visible, .steamPreviewTheatre :focus-visible { outline:2px solid #58a6ff; outline-offset:2px; }
        .steamHoverPreview .steamMetadataRetry, .steamHoverPreview .steamCorrectToggle, .steamHoverPreview .steamSourceAction { border:0; padding:0; background:none; color:var(--steam-preview-link); text-decoration:underline; cursor:pointer; font:inherit; }
        .steamHoverPreview .tipActions { flex-wrap:wrap; gap:6px 16px; }
        .steamHoverPreview .steamSourceAction, .steamPreviewTheatreFooterActions button { display:inline-flex; align-items:center; gap:4px; border:0; background:transparent; color:inherit; font:inherit; padding:0; cursor:pointer; text-decoration:underline; }
        .steamHoverTip { box-shadow:0 2px 8px rgba(0,0,0,0.25); }
        .steamHoverTip .tipActions { gap:0; padding-top:6px; border-top:1px solid rgba(255,255,255,0.1); }
        .steamHoverPreview[data-preview-state="error"] .tipActions { gap:8px 20px; margin-bottom:8px; }
        .steamHoverPreview[data-preview-state="error"] .steamInlineStatus:not(:empty) { display:block; margin-top:6px; }
        .steamHoverPreview .steamSourceAction { color:var(--steam-preview-link) !important; }
        .steamHoverPreview .steamSourceAction:hover { color:#c7ebff !important; }
        .steamHoverPreview[data-theme="light"] .steamSourceAction:hover { color:#043b91 !important; }
        .steamPreviewTheatreFooterActions button { color:#66c0f4 !important; }
        .steamHoverPreview .steamAction, .steamPreviewTheatre .steamAction { display:inline-flex; align-items:center; gap:4px; }
        .steamHoverPreview .steamActionIcon, .steamPreviewTheatre .steamActionIcon { display:inline-block; flex:0 0 15px; width:15px !important; height:15px !important; margin:0 !important; vertical-align:-2px; }
        .steamHoverPreview .steamCorrection { margin-top:8px; padding-top:7px; border-top:1px solid var(--steam-preview-border); }
        .steamHoverPreview .steamCorrection[hidden] { display:none; }
        .steamHoverPreview .steamCorrection input { width:100%; box-sizing:border-box; margin:5px 0; padding:5px; border:1px solid var(--steam-preview-border); background:var(--steam-preview-bg); color:var(--steam-preview-fg); }
        .steamHoverPreview .steamCorrectionButtons { display:flex; flex-wrap:wrap; gap:6px; }
        .steamHoverPreview .steamCandidateList { display:grid; gap:3px; margin:5px 0; max-height:150px; overflow:auto; }
        .steamHoverPreview .steamCandidateList button { text-align:left; }
        .steamHoverPreview .steamCardUtility { display:flex; align-items:center; gap:10px; margin-top:7px; font-size:11px; }
        .steamHoverPreview .steamCardUtility:empty { display:none; }
        .steamHoverPreview .steamGameTitle { display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
        .steamHoverPreview .steamGameTitle strong { flex:1 1 auto; min-width:0; overflow-wrap:anywhere; }
        .steamHoverPreview .steamGameTitle .steamCorrectToggle { flex:0 0 auto; font-size:11px; white-space:nowrap; }
        .steamHoverPreview .steamMatchNote { font-size:11px; margin-top:3px; }
        .steamHoverPreview .threadTagList { flex-wrap:wrap; }
        .steamHoverPreview .threadTag { overflow-wrap:anywhere; }
        .steamHoverPreview .steamMediaImage { object-fit:contain; }
        .steamImageUnavailable { display:grid; place-items:center; width:100%; height:100%; min-height:36px; color:#c7d5e0; background:#151515; font:12px/1.4 Arial,sans-serif; }
        .steamPreviewAnnouncer { position:fixed; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
        .steamPreviewTheatre { padding:clamp(8px,4vw,48px); }
        .steamPreviewTheatreShell { width:min(1416px,calc(100vw - 16px)); height:min(866px,calc(100vh - 16px)); }
        .steamPreviewTheatreFooterActions { max-width:none; flex-wrap:wrap; gap:8px; }
        @media (max-width:600px) { .steamPreviewTheatreHeader { padding:0 40px 0 8px; } .steamPreviewTheatreFooter { gap:6px; min-height:40px; height:auto; flex-wrap:wrap; } .steamPreviewTheatreFooterActions { font-size:11px; } }
        @media (prefers-reduced-motion:reduce) { .steamHoverPreview { transition:none; } .steamHoverPreview .spinner { animation:none; } }
    `;
    let injectedStyle = null;
    if (typeof addStyle === 'function') {
        try {
            injectedStyle = addStyle(style.textContent);
        } catch {
            (document.head || document.documentElement).appendChild(style);
        }
    } else (document.head || document.documentElement).appendChild(style);
    document.body.append(tip, theatre, status);

    let disposed = false;
    let suppressFocusPreview = false;
    let currentSource = null;
    let currentHoveredLink = null;
    let currentData = null;
    let currentError = null;
    let hoverId = 0;
    let requestAbort = null;
    let nameSearchAbort = null;
    let nameSearchTimer = null;
    let nameSearchId = 0;
    let showTimeout = null;
    let hideTimeout = null;
    let trackingMove = false;
    let lastMoveEvent = null;
    let positionFrame = null;
    let currentMedia = [];
    let currentMediaIndex = 0;
    let currentMediaTitle = '';
    let currentStoreUrl = '';
    let theatreMedia = [];
    let theatreMediaIndex = 0;
    let theatreMediaTitle = '';
    let theatreMode = 'screenshots';
    let theatreAllMedia = [];
    let previousDocumentOverflow = '';
    let theatreTrigger = null;
    let inertElements = [];
    const announce = (text) => {
        status.textContent = text;
    };

    function disableForOperation(button) {
        if (!button) return false;
        const hadFocus = document.activeElement === button;
        button.disabled = true;
        // Disabling a focused button otherwise blurs to the page and closes the
        // hover card while its requested retry/correction is still in flight.
        if (hadFocus) focus(theatre.contains(button) ? theatre : tip);
        return hadFocus;
    }

    function restoreOperationFocus(button, hadFocus) {
        if (hadFocus && button?.isConnected && (document.activeElement === tip || document.activeElement === theatre))
            focus(button);
    }

    function refreshSettings() {
        const settings = client.getSettings?.() || {};
        tip.dataset.theme =
            settings.theme && settings.theme !== 'site' ? settings.theme : adapter.defaultTheme || 'dark';
        if (currentSource && currentHoveredLink?.isConnected) {
            const source = adapter.getSource(currentHoveredLink);
            if (source?.key === currentSource.key) currentSource = source;
            const meta = tip.querySelector('[data-meta-host]');
            if (meta) meta.innerHTML = renderMeta(currentData);
        }
        if (tip.style.display === 'block') requestPosition();
    }

    function sourceActions(data = currentData) {
        const actions = [];
        if (data?.storeUrl) actions.push({ id: 'steam', label: 'Open on Steam', icon: 'steam', href: data.storeUrl });
        else if (currentSource)
            actions.push({
                id: 'steam',
                label: 'Search on Steam',
                icon: 'steam',
                href: `https://store.steampowered.com/search/?term=${encodeURIComponent(currentSource.title)}`
            });
        return actions.concat(adapter.getActions?.(currentSource, data) || []);
    }

    function renderActions(data = currentData) {
        return sourceActions(data)
            .map((action) => {
                const icon = previewIcon(action.icon);
                const label = escapeHtml(action.label);
                const href = safePreviewUrl(action.href);
                return href
                    ? `<a class="steamAction" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${icon}${label}</a>`
                    : `<button type="button" class="steamAction steamSourceAction" data-source-action="${escapeHtml(action.id)}">${icon}${label}</button>`;
            })
            .join('');
    }

    function renderMeta(data) {
        const rawId = Number(data?.appId || data?.steam_appid);
        const appId = Number.isSafeInteger(rawId) && rawId > 0 ? String(rawId) : '';
        const app =
            adapter.showAppId && appId
                ? `<span class="steamAppIdControl"><strong>AppID:</strong> <button type="button" class="copyAppIdBtn" data-app-id="${appId}" aria-label="Copy Steam AppID" title="Copy Steam AppID">${appId}</button><a class="steamDbLink" href="https://steamdb.info/app/${appId}/" target="_blank" rel="noopener noreferrer" title="Open SteamDB" aria-label="Open SteamDB">${previewIcon('steamdb')}</a></span>`
                : '';
        const tags = (currentSource?.threadTags || [])
            .map((tag) => {
                const text = typeof tag === 'string' ? tag : tag.text;
                const color = /^#[0-9a-f]{6}$/i.test(tag.color || '') ? ` style="color:${tag.color}"` : '';
                return `<span class="threadTag"${color} title="${escapeHtml(text)}">${escapeHtml(text)}</span>`;
            })
            .join(' ');
        return app || tags
            ? `<div class="steamMetaRow${app ? '' : ' steamMetaRowTagsOnly'}">${app}${tags ? `<span class="threadTagList" aria-label="Thread tags">${tags}</span>` : ''}</div>`
            : '';
    }

    function renderLoading() {
        cancelNameSearch();
        stopActiveVideo();
        tip.dataset.previewState = 'loading';
        tip.setAttribute('aria-busy', 'true');
        tip.removeAttribute('aria-labelledby');
        delete tip.dataset.previewAppId;
        tip.innerHTML = `<div class="loadingContainer" role="status"><div class="spinner" aria-hidden="true"></div><span>Loading Steam tags for <strong>${escapeHtml(currentSource.title)}</strong>…</span></div>`;
        makeVisible();
    }

    function renderCard(data) {
        cancelNameSearch();
        trackingMove = false;
        currentData = data;
        currentError = null;
        stopActiveVideo();
        currentMedia = getRenderMedia(data);
        currentMediaIndex = 0;
        currentMediaTitle = data.name || currentSource.title;
        currentStoreUrl = data.storeUrl || '';
        const release = previewReleaseText(data);
        const releaseHtml = escapeHtml(release).replace(/^(Released:|Planned release:)/, '<strong>$1</strong>');
        const parent =
            data.match?.kind === 'parent' || data.match?.parentChain?.length
                ? '<p class="steamMatchNote">Showing the base game</p>'
                : '';
        tip.dataset.previewState = 'ready';
        tip.setAttribute('aria-busy', 'false');
        tip.setAttribute('aria-labelledby', `${idPrefix}-title`);
        tip.dataset.previewAppId = String(data.appId || data.steam_appid || '');
        tip.innerHTML = `${renderMediaCarousel(currentMedia, currentMediaTitle)}<p class="steamGameTitle"><strong id="${idPrefix}-title">${escapeHtml(currentMediaTitle)}</strong><button type="button" class="steamCorrectToggle" aria-expanded="false">Wrong game?</button></p>${release ? `<p class="steamReleaseDate">${releaseHtml}</p>` : ''}<div data-meta-host>${renderMeta(data)}</div>${parent}<p>${escapeHtml(data.short_description || 'No description available.')}</p><p class="steamRating" aria-live="polite">${previewReviewsMarkup(data)}</p><p class="steamTags" aria-live="polite">${previewTagsMarkup(data)}</p><div class="tipActions">${renderActions(data)}</div>${utilityMarkup()}`;
        makeVisible();
    }

    function utilityMarkup() {
        return '<div class="steamCardUtility steamInlineStatus" role="status"></div><div class="steamCorrection" hidden></div>';
    }

    function renderFailure(error) {
        cancelNameSearch();
        trackingMove = false;
        currentData = null;
        currentError = error;
        stopActiveVideo();
        currentMedia = [];
        currentStoreUrl = '';
        tip.dataset.previewState = 'error';
        tip.setAttribute('aria-busy', 'false');
        tip.removeAttribute('aria-labelledby');
        delete tip.dataset.previewAppId;
        const ambiguous = error?.code === 'AMBIGUOUS_MATCH';
        const label = ambiguous
            ? 'Choose the correct Steam game'
            : error?.code === 'NO_MATCH'
              ? 'No confident Steam match found'
              : 'Steam information unavailable';
        tip.innerHTML = `<p><strong>${escapeHtml(currentSource.title)}</strong></p><p>${label}.</p><div data-meta-host>${renderMeta(null)}</div><div class="tipActions">${renderActions(null)}</div><button type="button" class="steamCorrectToggle" aria-expanded="false">Choose Steam game…</button><span class="steamInlineStatus" role="status"></span><div class="steamCorrection" hidden></div>`;
        makeVisible();
        if (ambiguous) openCorrection(false);
    }

    function patchMetadata(data) {
        if (
            !currentData ||
            String(data?.appId || data?.steam_appid) !== String(currentData.appId || currentData.steam_appid)
        )
            return;
        currentData = data;
        const tags = tip.querySelector('.steamTags');
        const reviews = tip.querySelector('.steamRating');
        // Each field owns its small subtree; media DOM and controls are never replaced here.
        if (tags && tags.innerHTML !== previewTagsMarkup(data)) tags.innerHTML = previewTagsMarkup(data);
        if (reviews && reviews.innerHTML !== previewReviewsMarkup(data)) reviews.innerHTML = previewReviewsMarkup(data);
        requestPosition();
    }

    async function show(source, link = source?.link, event = null, options = {}) {
        if (disposed || !source) return;
        cancelNameSearch();
        cancel(showTimeout);
        cancel(hideTimeout);
        if (isTheatreOpen()) closeTheatre(false);
        requestAbort?.abort();
        requestAbort = new (window.AbortController || globalThis.AbortController)();
        const signal = requestAbort.signal;
        const thisId = ++hoverId;
        currentHoveredLink?.removeAttribute('aria-controls');
        currentSource = source;
        currentHoveredLink = link;
        currentData = null;
        currentError = null;
        lastMoveEvent = event;
        trackingMove = Boolean(event?.pageX != null);
        const cached = client.peekPreview(source);
        if (cached) renderCard(cached);
        else renderLoading();
        try {
            const data = await client.loadPreview(source, { priority: 'hover', signal, force: options.force === true });
            if (disposed || signal.aborted || thisId !== hoverId || currentSource?.key !== source.key) return;
            if (cached && String(cached.appId) === String(data.appId)) patchMetadata(data);
            else renderCard(data);
            trackingMove = false;
        } catch (error) {
            if (
                disposed ||
                signal.aborted ||
                thisId !== hoverId ||
                error?.code === 'ABORTED' ||
                error?.name === 'AbortError'
            )
                return;
            trackingMove = false;
            if (!cached) renderFailure(error);
        }
    }

    function queueShow(link, event) {
        const source = adapter.getSource(link);
        if (!source) return;
        cancel(hideTimeout);
        if (currentSource?.key === source.key && tip.style.display === 'block') return;
        cancel(showTimeout);
        if (client.peekPreview(source)) void show(source, link, event);
        else
            showTimeout = schedule(() => {
                void show(source, link, event);
            }, 120);
    }

    function focusPreviewCard() {
        const controls = [...tip.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')];
        const firstVisible = controls.find(
            (element) => element.getClientRects().length && window.getComputedStyle(element).visibility !== 'hidden'
        );
        focus(firstVisible || tip);
    }

    function makeVisible() {
        tip.style.display = 'block';
        tip.style.opacity = '1';
        tip.style.pointerEvents = 'auto';
        tip.setAttribute('aria-hidden', 'false');
        currentHoveredLink?.setAttribute('aria-controls', tip.id);
        positionTip();
    }

    function hide({ restoreFocus = false } = {}) {
        cancelNameSearch();
        if (isTheatreOpen()) closeTheatre(false);
        cancel(showTimeout);
        cancel(hideTimeout);
        ++hoverId;
        requestAbort?.abort();
        requestAbort = null;
        stopActiveVideo();
        tip.style.display = 'none';
        tip.style.opacity = '0';
        tip.style.pointerEvents = 'none';
        tip.setAttribute('aria-hidden', 'true');
        tip.setAttribute('aria-busy', 'false');
        tip.dataset.previewState = 'hidden';
        delete tip.dataset.previewAppId;
        const previousLink = currentHoveredLink;
        currentHoveredLink?.removeAttribute('aria-controls');
        currentSource = null;
        currentHoveredLink = null;
        currentData = null;
        currentError = null;
        trackingMove = false;
        currentMedia = [];
        if (restoreFocus) {
            suppressFocusPreview = true;
            focus(previousLink);
            suppressFocusPreview = false;
        }
    }

    function scheduleHide() {
        cancel(showTimeout);
        cancel(hideTimeout);
        hideTimeout = schedule(() => {
            if (
                isTheatreOpen() ||
                tip.matches(':hover') ||
                currentHoveredLink?.matches(':hover') ||
                tip.contains(document.activeElement) ||
                document.activeElement === currentHoveredLink
            )
                return;
            hide();
        }, HIDE_DELAY);
    }

    function positionTip() {
        if (disposed || tip.style.display !== 'block') return;
        const anchor = currentHoveredLink?.getBoundingClientRect?.();
        const scrollX = window.scrollX || 0;
        const scrollY = window.scrollY || 0;
        const width = tip.offsetWidth;
        const height = tip.offsetHeight;
        const pointX = lastMoveEvent?.pageX ?? (anchor?.right ?? 0) + scrollX;
        const pointY = lastMoveEvent?.pageY ?? (anchor?.top ?? 0) + scrollY;
        let x = pointX + 15;
        let y = pointY + 15;
        if (x + width > scrollX + window.innerWidth - 10) x = pointX - width - 15;
        if (y + height > scrollY + window.innerHeight - 10) y = pointY - height - 15;
        tip.style.left = `${Math.max(scrollX + 10, Math.min(x, scrollX + window.innerWidth - width - 10))}px`;
        tip.style.top = `${Math.max(scrollY + 10, Math.min(y, scrollY + window.innerHeight - height - 10))}px`;
    }

    function requestPosition() {
        if (positionFrame != null || disposed) return;
        positionFrame = window.requestAnimationFrame(() => {
            positionFrame = null;
            positionTip();
        });
    }

    function cancelNameSearch() {
        ++nameSearchId;
        cancel(nameSearchTimer);
        nameSearchTimer = null;
        nameSearchAbort?.abort();
        nameSearchAbort = null;
        const button = tip.querySelector('.steamNameSearchForm button[type="submit"]');
        if (button) button.disabled = false;
    }

    function updateSuggestions(
        panel,
        candidates,
        emptyText = 'No suggestions found. Try a shorter title or enter a Steam AppID or URL.'
    ) {
        const list = panel.querySelector('.steamCandidateList');
        const empty = panel.querySelector('.steamCandidateEmpty');
        if (list) list.innerHTML = candidateMarkup(candidates);
        if (empty) {
            empty.hidden = candidates.length > 0;
            empty.textContent = emptyText;
        }
        requestPosition();
    }

    function openCorrection(focusInput = true) {
        const panel = tip.querySelector('.steamCorrection');
        if (!panel || !currentSource) return;
        cancelNameSearch();
        const candidates = currentError?.candidates || currentData?.match?.candidates || [];
        panel.hidden = false;
        panel.setAttribute('role', 'group');
        panel.setAttribute('aria-label', 'Choose a Steam game');
        panel.innerHTML = `<form class="steamNameSearchForm"><label for="${idPrefix}-search-name">Search by name</label><input id="${idPrefix}-search-name" name="steamGameTitle" type="search" maxlength="200" autocomplete="off" value="${escapeHtml(currentSource.title.slice(0, 200))}" required><button type="submit">Search</button><p class="steamNameSearchStatus" role="status" aria-live="polite"></p></form><p>Closest names:</p><div class="steamCandidateList"></div><p class="steamCandidateEmpty"></p><form class="steamCorrectionForm"><label for="${idPrefix}-match">Steam AppID or store URL</label><input id="${idPrefix}-match" name="steamAppId" autocomplete="off" inputmode="url" required><div class="steamCorrectionButtons"><button type="submit">Use this game</button><button type="button" data-correction-reset>Reset match</button>${adapter.findAppIds ? '<button type="button" data-find-source>Find Steam link in source</button>' : ''}<button type="button" data-correction-close>Cancel</button></div><p class="steamCorrectionStatus" role="status"></p></form>`;
        updateSuggestions(panel, candidates);
        tip.querySelector('.steamCorrectToggle')?.setAttribute('aria-expanded', 'true');
        if (focusInput) focus(panel.querySelector('[name="steamGameTitle"]'));
        requestPosition();
    }

    async function searchCorrectionNames(force = false) {
        const panel = tip.querySelector('.steamCorrection');
        const source = currentSource;
        if (!panel || panel.hidden || !source) return;
        cancelNameSearch();
        const input = panel.querySelector('[name="steamGameTitle"]');
        const query = input.value.trim();
        const message = panel.querySelector('.steamNameSearchStatus');
        if (!query) {
            updateSuggestions(panel, [], 'Enter a title to search, or use a Steam AppID or URL.');
            message.textContent = '';
            return;
        }
        const operation = nameSearchId;
        const abort = new (window.AbortController || globalThis.AbortController)();
        nameSearchAbort = abort;
        const button = panel.querySelector('.steamNameSearchForm button[type="submit"]');
        const hadFocus = disableForOperation(button);
        updateSuggestions(panel, [], '');
        message.textContent = 'Searching Steam…';
        const current = () =>
            !disposed &&
            !abort.signal.aborted &&
            operation === nameSearchId &&
            source.key === currentSource?.key &&
            panel.isConnected &&
            !panel.hidden &&
            panel.querySelector('[name="steamGameTitle"]') === input;
        try {
            const result = await client.searchGames(query, { signal: abort.signal, force });
            if (!current()) return;
            updateSuggestions(panel, result.candidates);
            message.textContent = result.partial
                ? 'Some results could not load. Showing available suggestions.'
                : result.candidates.length
                  ? 'Select a game from the suggestions.'
                  : '';
        } catch (error) {
            if (!current() || error?.code === 'ABORTED') return;
            updateSuggestions(panel, [], 'Try another title or enter a Steam AppID or URL.');
            message.textContent = 'Search could not load. Press Search to try again.';
        } finally {
            if (operation === nameSearchId) {
                nameSearchAbort = null;
                if (button.isConnected) button.disabled = false;
                restoreOperationFocus(button, hadFocus);
                requestPosition();
            }
        }
    }

    function scheduleNameSearch(input) {
        cancelNameSearch();
        const panel = input.closest('.steamCorrection');
        if (!panel || panel.hidden) return;
        updateSuggestions(panel, [], '');
        panel.querySelector('.steamNameSearchStatus').textContent = input.value.trim()
            ? 'Searching Steam…'
            : 'Enter a title to search.';
        if (input.value.trim().length < 2) {
            panel.querySelector('.steamNameSearchStatus').textContent = input.value.trim()
                ? 'Press Search to search this title.'
                : 'Enter a title to search.';
            return;
        }
        nameSearchTimer = schedule(() => {
            nameSearchTimer = null;
            void searchCorrectionNames();
        }, 350);
    }

    function candidateMarkup(candidates) {
        return candidates
            .slice(0, 8)
            .map(
                (candidate) =>
                    `<button type="button" data-candidate-app-id="${escapeHtml(candidate.appId)}">${escapeHtml(candidate.name || `Steam AppID ${candidate.appId}`)}</button>`
            )
            .join('');
    }

    function closeCorrection() {
        cancelNameSearch();
        const panel = tip.querySelector('.steamCorrection');
        if (panel) panel.hidden = true;
        const toggle = tip.querySelector('.steamCorrectToggle');
        toggle?.setAttribute('aria-expanded', 'false');
        focus(toggle);
        requestPosition();
    }

    async function applyCorrection(value, button) {
        cancelNameSearch();
        const source = currentSource;
        const generation = hoverId;
        const panel = tip.querySelector('.steamCorrection');
        const message = panel?.querySelector('.steamCorrectionStatus');
        if (!source) return;
        const hadFocus = disableForOperation(button);
        if (message) message.textContent = 'Checking Steam game and tags…';
        try {
            const data = await client.correctMatch(source, value);
            if (generation !== hoverId || source.key !== currentSource?.key) return;
            renderCard(data);
            announce('Steam match saved.');
            focus(tip.querySelector('.steamCorrectToggle'));
        } catch (error) {
            if (generation === hoverId && message?.isConnected)
                message.textContent = error?.message || 'Unable to validate this Steam game.';
        } finally {
            if (button?.isConnected) button.disabled = false;
            restoreOperationFocus(button, hadFocus);
        }
    }

    async function copyAppId(button) {
        const value = button.dataset.appId;
        let copied = false;
        try {
            if (window.navigator.clipboard?.writeText) {
                await window.navigator.clipboard.writeText(value);
                copied = true;
            }
        } catch {
            /* use selectable fallback */
        }
        if (!copied) {
            const input = document.createElement('textarea');
            input.value = value;
            input.style.cssText = 'position:fixed;left:-9999px;top:0';
            tip.appendChild(input);
            input.select();
            try {
                copied = document.execCommand('copy');
            } catch {
                /* manual copy below */
            }
            input.remove();
        }
        if (copied) {
            announce(`Steam AppID ${value} copied.`);
            const message = tip.querySelector('.steamInlineStatus');
            if (message) message.textContent = 'AppID copied';
            focus(button);
        } else {
            const message = tip.querySelector('.steamInlineStatus');
            if (message) {
                message.innerHTML = `<label>Copy AppID: <input readonly value="${escapeHtml(value)}" aria-label="Steam AppID to copy"></label>`;
                const input = message.querySelector('input');
                focus(input);
                input.select();
            }
            announce('Clipboard unavailable. The AppID is selected for manual copying.');
        }
    }

    async function runSourceAction(button) {
        if (button.disabled || !currentSource) return;
        const source = currentSource;
        const label = button.innerHTML;
        const hadFocus = disableForOperation(button);
        button.textContent = 'Opening…';
        try {
            await adapter.runAction(button.dataset.sourceAction, source, button);
            announce('Action opened.');
        } catch (error) {
            announce(error?.message || 'Action unavailable.');
            let host = tip.querySelector('.steamInlineStatus');
            const footer = button.closest('.steamPreviewTheatreFooterActions');
            if (footer) {
                host = footer.querySelector('.steamActionStatus');
                if (!host) {
                    host = document.createElement('span');
                    host.className = 'steamActionStatus';
                    host.setAttribute('role', 'status');
                    footer.appendChild(host);
                }
            }
            if (host && currentSource?.key === source.key) {
                host.textContent = `${error?.message || 'Action unavailable'}. `;
                const retry = document.createElement('button');
                retry.type = 'button';
                retry.className = 'steamMetadataRetry';
                retry.textContent = 'Retry';
                retry.addEventListener('click', () => {
                    void runSourceAction(button);
                });
                host.appendChild(retry);
                const href = safePreviewUrl(source.url);
                if (href) {
                    const link = document.createElement('a');
                    link.href = href;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = adapter.id === '1337x' ? ' Open torrent page' : ' Open source page';
                    host.appendChild(link);
                }
            }
        } finally {
            if (button.isConnected) {
                button.disabled = false;
                button.innerHTML = label;
            }
            restoreOperationFocus(button, hadFocus);
        }
    }

    function imageFailure(event) {
        const image = event.target;
        if (image?.tagName !== 'IMG') return;
        image.style.display = 'none';
        if (image.closest('.steamMediaThumbBtn')) return;
        const host = image.closest('.steamMediaViewport, .steamPreviewTheatreViewport');
        if (!host || host.querySelector('.steamImageUnavailable')) return;
        const placeholder = document.createElement('span');
        placeholder.className = 'steamImageUnavailable';
        placeholder.textContent = 'Image unavailable';
        host.appendChild(placeholder);
    }

    function getRenderMedia(data) {
        return normalizeSteamMedia(data);
    }

    function renderMediaItem(item, index, title) {
        if (!item) return '';
        const label = escapeHtml(item.alt || title || 'Steam media');
        if (item.type === 'video')
            return `<button type="button" class="steamMediaPlayBtn" data-media-index="${index}" aria-label="Play ${label}" title="Play video"><img class="steamMediaPoster" src="${escapeHtml(item.posterUrl)}" alt="${label}" loading="eager" decoding="async"><span class="steamMediaPlayIcon" aria-hidden="true">&#9658;</span></button>`;
        const url = item.source === 'screenshot' ? item.thumbUrl || item.url : item.url;
        return `<img class="steamMediaImage" src="${escapeHtml(url)}" alt="${label}" loading="eager" decoding="async">`;
    }

    function getCurrentSteamUrl() {
        return (
            safePreviewUrl(currentStoreUrl) ||
            `https://store.steampowered.com/search/?term=${encodeURIComponent(currentMediaTitle || theatreMediaTitle || 'Steam')}`
        );
    }

    function renderTheatreFooterActions() {
        return `<div class="steamPreviewTheatreFooterActions">${renderActions()}</div>`;
    }

    function openTheatre(index) {
        const selection = getTheatreSelection(index);
        if (!selection || isTheatreOpen()) return;
        theatreTrigger =
            document.activeElement && tip.contains(document.activeElement)
                ? document.activeElement
                : tip.querySelector('.steamMediaExpandBtn');
        theatreMode = selection.mode;
        theatreMedia = selection.items;
        theatreAllMedia = selection.allItems;
        theatreMediaIndex = selection.selectedIndex;
        theatreMediaTitle = currentMediaTitle || 'Steam media';
        stopActiveVideo();
        cancel(showTimeout);
        cancel(hideTimeout);
        theatre.classList.toggle('steamPreviewTheatreVideoMode', theatreMode === 'video');
        renderTheatre();
        previousDocumentOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        theatre.classList.add('steamPreviewTheatreOpen');
        theatre.setAttribute('aria-hidden', 'false');
        tip.style.display = 'none';
        tip.setAttribute('aria-hidden', 'true');
        inertElements = [...document.body.children]
            .filter((element) => element !== theatre && element !== status)
            .map((element) => [element, element.inert]);
        inertElements.forEach(([element]) => {
            element.inert = true;
        });
        trackingMove = false;
        focus(theatre.querySelector('.steamPreviewTheatreCloseBtn'));
        if (theatreMode === 'video') void playTheatreVideo();
    }

    function closeTheatre(restore = true) {
        if (!isTheatreOpen()) return;
        const fullscreen = document.fullscreenElement;
        if (fullscreen && (fullscreen === theatre || theatre.contains(fullscreen)))
            Promise.resolve(document.exitFullscreen?.()).catch(() => {});
        stopTheatreVideo();
        theatre.classList.remove('steamPreviewTheatreOpen', 'steamPreviewTheatreVideoMode');
        theatre.setAttribute('aria-hidden', 'true');
        theatre.innerHTML = '';
        document.documentElement.style.overflow = previousDocumentOverflow;
        inertElements.forEach(([element, inert]) => {
            element.inert = inert;
        });
        inertElements = [];
        theatreMedia = [];
        theatreAllMedia = [];
        theatreMediaIndex = 0;
        theatreMediaTitle = '';
        theatreMode = 'screenshots';
        if (currentSource && restore) {
            makeVisible();
            focus(theatreTrigger?.isConnected ? theatreTrigger : currentHoveredLink);
        }
        theatreTrigger = null;
    }

    function setActiveMedia(index) {
        if (!currentMedia.length) return;
        stopActiveVideo();
        currentMediaIndex = (index + currentMedia.length) % currentMedia.length;
        const viewport = tip.querySelector('.steamMediaViewport');
        if (viewport)
            viewport.innerHTML = renderMediaItem(currentMedia[currentMediaIndex], currentMediaIndex, currentMediaTitle);
        const counter = tip.querySelector('.steamMediaCounter');
        if (counter) counter.textContent = `${currentMediaIndex + 1} / ${currentMedia.length}`;
        tip.querySelector('.steamMediaExpandBtn')?.classList.toggle(
            'steamMediaExpandHidden',
            !canOpenMediaTheatre(currentMedia[currentMediaIndex])
        );
        tip.querySelectorAll('.steamMediaThumbBtn').forEach((button) => {
            const active = Number(button.dataset.mediaIndex) === currentMediaIndex;
            button.classList.toggle('steamMediaThumbActive', active);
            button.setAttribute('aria-current', String(active));
        });
        const active = tip.querySelector('.steamMediaThumbActive');
        const strip = active?.closest('.steamMediaThumbStrip');
        if (strip && active) {
            const outer = strip.getBoundingClientRect();
            const inner = active.getBoundingClientRect();
            if (inner.left < outer.left) strip.scrollLeft -= outer.left - inner.left;
            else if (inner.right > outer.right) strip.scrollLeft += inner.right - outer.right;
        }
        const adjacent = currentMedia[(currentMediaIndex + 1) % currentMedia.length];
        if (adjacent?.type === 'image' && typeof window.Image === 'function') {
            const image = new window.Image();
            image.src = adjacent.thumbUrl || adjacent.url;
        }
    }

    function stopActiveVideo() {
        tip.querySelectorAll('.steamMediaVideo').forEach((video) => {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch (_) {
                // Ignore cleanup failures from browser media internals.
            }
        });
    }

    function stopTheatreVideo() {
        theatre.querySelectorAll('.steamPreviewTheatreVideo').forEach((video) => {
            try {
                video.pause();
                video.removeAttribute('src');
                video.load();
            } catch (_) {
                // Ignore cleanup failures from browser media internals.
            }
        });
    }

    function renderVideoPlaybackFallback(className) {
        const steamUrl = escapeHtml(getCurrentSteamUrl());
        return `
            <div class="${className}">
                <span>Trailer format cannot play on this page.</span>
                <a href="${steamUrl}" target="_blank" rel="noopener noreferrer">Open on Steam</a>
            </div>
        `;
    }

    function bindVideoPlaybackFallback(video, viewport, className, root) {
        if (!video || !viewport) return;

        video.addEventListener(
            'error',
            () => {
                if (root?.contains(video)) {
                    viewport.innerHTML = renderVideoPlaybackFallback(className);
                }
            },
            { once: true }
        );
    }

    function getMediaThumbUrl(item) {
        if (!item) return '';
        return item.type === 'video' ? item.posterUrl : item.thumbUrl || item.url;
    }

    function isScreenshotMedia(item) {
        return item?.type === 'image' && item?.source === 'screenshot';
    }

    function isVideoMedia(item) {
        return item?.type === 'video';
    }

    function canOpenMediaTheatre(item) {
        return isScreenshotMedia(item) || isVideoMedia(item);
    }

    function getTheatreCounterText() {
        const item = theatreMedia[theatreMediaIndex];
        const ordinal = theatreAllMedia.indexOf(item);
        const count = theatreAllMedia.length || theatreMedia.length;
        const position = ordinal >= 0 ? ordinal + 1 : theatreMediaIndex + 1;
        return `${position} of ${count}`;
    }

    function renderMediaThumbs(media, activeIndex, title) {
        if (!media?.length || media.length <= 1) return '';

        const thumbsHtml = media
            .map((item, index) => {
                const thumbUrl = getMediaThumbUrl(item);
                if (!isUsableUrl(thumbUrl)) return '';

                const label = escapeHtml(item.alt || title || `Steam media ${index + 1}`);
                const activeClass = index === activeIndex ? ' steamMediaThumbActive' : '';
                const current = index === activeIndex ? 'true' : 'false';
                const videoIcon =
                    item.type === 'video'
                        ? '<span class="steamMediaThumbPlayIcon" aria-hidden="true">&#9658;</span>'
                        : '';

                return `
                <button type="button" class="steamMediaThumbBtn${activeClass}" data-media-index="${index}" aria-label="Show ${label}" aria-current="${current}" title="${label}">
                    <img class="steamMediaThumbImage" src="${escapeHtml(thumbUrl)}" alt="" loading="lazy" decoding="async">
                    ${videoIcon}
                </button>
            `;
            })
            .join('');

        const fitClass = media.length <= 7 ? ' steamMediaThumbStripFit' : '';
        return `<div class="steamMediaThumbStrip${fitClass}" aria-label="Steam media thumbnails">${thumbsHtml}</div>`;
    }

    function renderMediaCarousel(media, title) {
        if (!media?.length) return '';

        const hasMultiple = media.length > 1;
        const controlsHtml = hasMultiple
            ? `
            <button type="button" class="steamMediaNavBtn steamMediaPrevBtn" aria-label="Previous Steam media" title="Previous media">&#8249;</button>
            <button type="button" class="steamMediaNavBtn steamMediaNextBtn" aria-label="Next Steam media" title="Next media">&#8250;</button>
            <span class="steamMediaCounter" aria-live="polite">1 / ${escapeHtml(media.length)}</span>
        `
            : '';
        const expandClass = canOpenMediaTheatre(media[0]) ? '' : ' steamMediaExpandHidden';

        return `
            <div class="steamMediaShell">
                <div class="steamMediaFrame" aria-label="Steam media preview">
                    <div class="steamMediaViewport">${renderMediaItem(media[0], 0, title)}</div>
                    <button type="button" class="steamMediaExpandBtn${expandClass}" aria-label="Open media theatre" title="Open theatre mode"><span class="steamTheatreIcon" aria-hidden="true"></span></button>
                    ${controlsHtml}
                </div>
                ${renderMediaThumbs(media, 0, title)}
            </div>
        `;
    }

    function renderTheatreMediaItem(item, index, title) {
        if (!item) return '';

        const label = escapeHtml(item.alt || title || 'Steam media');
        if (item.type === 'video') {
            return `
                <div class="steamPreviewTheatreVideoWrap">
                    <video class="steamPreviewTheatreVideo" data-theatre-media-index="${index}" autoplay playsinline tabindex="0" aria-label="${label}"></video>
                    ${renderTheatreVideoControls('steamPreviewTheatreVideoControlsFullscreen')}
                </div>
            `;
        }

        return `<img class="steamPreviewTheatreImage" src="${escapeHtml(item.url)}" alt="${label}" loading="eager" decoding="async">`;
    }

    function renderTheatreVideoControls(extraClass = '') {
        const className = `steamPreviewTheatreVideoControls${extraClass ? ` ${extraClass}` : ''}`;
        return `
            <div class="${className}" aria-label="Video controls">
                <input class="steamPreviewTheatreVideoSeek" type="range" min="0" max="0" step="0.1" value="0" aria-label="Seek video">
                <div class="steamPreviewTheatreVideoControlRow">
                    <button type="button" class="steamPreviewTheatreVideoControlBtn steamPreviewTheatreVideoPlayToggle" aria-label="Play video" title="Play">&#9658;</button>
                    <button type="button" class="steamPreviewTheatreVideoControlBtn steamPreviewTheatreVideoMuteToggle" aria-label="Mute video" title="Mute">&#128266;</button>
                    <span class="steamPreviewTheatreVideoTime">0:00 / 0:00</span>
                    <span class="steamPreviewTheatreVideoControlSpacer"></span>
                    <button type="button" class="steamPreviewTheatreVideoControlBtn steamPreviewTheatreVideoFullscreenBtn" aria-label="Toggle video fullscreen" title="Video fullscreen">&#9974;</button>
                </div>
            </div>
        `;
    }

    function renderTheatreFooterControls() {
        if (!isScreenshotMedia(theatreMedia[theatreMediaIndex])) return '';

        const fullscreenLabel = document.fullscreenElement === theatre ? 'Exit fullscreen' : 'Enter fullscreen';
        return `
            <button type="button" class="steamPreviewTheatreVideoControlBtn steamPreviewTheatreFullscreenBtn" aria-label="${fullscreenLabel}" title="${fullscreenLabel}">&#9974;</button>
        `;
    }

    function renderTheatre() {
        if (!theatreMedia.length) return;

        const focusedClass = [
            'steamPreviewTheatreNextBtn',
            'steamPreviewTheatrePrevBtn',
            'steamPreviewTheatreCloseBtn',
            'steamPreviewTheatreFullscreenBtn'
        ].find((name) => document.activeElement?.classList?.contains(name));

        const hasMultiple = theatreMedia.length > 1;
        const navHtml = hasMultiple
            ? `
            <button type="button" class="steamPreviewTheatreNavBtn steamPreviewTheatrePrevBtn" aria-label="Previous Steam media" title="Previous media">&#8249;</button>
            <button type="button" class="steamPreviewTheatreNavBtn steamPreviewTheatreNextBtn" aria-label="Next Steam media" title="Next media">&#8250;</button>
        `
            : '';
        const videoControlsHtml = isVideoMedia(theatreMedia[theatreMediaIndex]) ? renderTheatreVideoControls() : '';
        const footerControlsHtml = renderTheatreFooterControls();
        const footerActionsHtml = renderTheatreFooterActions();

        theatre.innerHTML = `
            <div class="steamPreviewTheatreShell">
                <div class="steamPreviewTheatreHeader">
                    <div class="steamPreviewTheatreTitle" id="${theatreTitleId}">${escapeHtml(theatreMediaTitle)} - Trailers &amp; Screenshots</div>
                    <div class="steamPreviewTheatreHeaderControls">
                        <button type="button" class="steamPreviewTheatreBtn steamPreviewTheatreCloseBtn" aria-label="Close theatre" title="Close">&times;</button>
                    </div>
                </div>
                <div class="steamPreviewTheatreStage">
                    <div class="steamPreviewTheatreViewport">${renderTheatreMediaItem(theatreMedia[theatreMediaIndex], theatreMediaIndex, theatreMediaTitle)}</div>
                    ${navHtml}
                </div>
                ${videoControlsHtml}
                <div class="steamPreviewTheatreFooter">
                    ${footerActionsHtml}
                    <div class="steamPreviewTheatreCounter" aria-live="polite">${getTheatreCounterText()}</div>
                    <div class="steamPreviewTheatreFooterControlsHost">${footerControlsHtml}</div>
                </div>
            </div>
        `;
        if (focusedClass)
            focus(theatre.querySelector(`.${focusedClass}`) || theatre.querySelector('.steamPreviewTheatreCloseBtn'));
    }

    function setTheatreMedia(index) {
        if (!theatreMedia.length) return;

        const nextIndex = (index + theatreMedia.length) % theatreMedia.length;
        const nextItem = theatreMedia[nextIndex];

        stopTheatreVideo();

        if (theatreMode === 'video' && isScreenshotMedia(nextItem)) {
            const screenshots = currentMedia.filter(isScreenshotMedia);
            const screenshotIndex = screenshots.indexOf(nextItem);
            if (screenshotIndex >= 0) {
                theatreMode = 'screenshots';
                theatreMedia = screenshots;
                theatreMediaIndex = screenshotIndex;
                theatre.classList.remove('steamPreviewTheatreVideoMode');
                renderTheatre();
                return;
            }
        }

        theatreMediaIndex = nextIndex;

        const viewport = theatre.querySelector('.steamPreviewTheatreViewport');
        if (viewport) {
            viewport.innerHTML = renderTheatreMediaItem(
                theatreMedia[theatreMediaIndex],
                theatreMediaIndex,
                theatreMediaTitle
            );
        }

        const counter = theatre.querySelector('.steamPreviewTheatreCounter');
        if (counter) {
            counter.textContent = getTheatreCounterText();
        }

        const footerControls = theatre.querySelector('.steamPreviewTheatreFooterControlsHost');
        if (footerControls) {
            footerControls.innerHTML = renderTheatreFooterControls();
        }

        if (theatreMode === 'video') {
            playTheatreVideo();
        }
    }

    function formatVideoTime(value) {
        if (!isFinite(value) || value < 0) return '0:00';

        const total = Math.floor(value);
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');

        return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}` : `${minutes}:${paddedSeconds}`;
    }

    function updateTheatreVideoControls(video) {
        if (!video) return;

        const playButtons = theatre.querySelectorAll('.steamPreviewTheatreVideoPlayToggle');
        const muteButtons = theatre.querySelectorAll('.steamPreviewTheatreVideoMuteToggle');
        const seekInputs = theatre.querySelectorAll('.steamPreviewTheatreVideoSeek');
        const timeLabels = theatre.querySelectorAll('.steamPreviewTheatreVideoTime');
        const duration = isFinite(video.duration) ? video.duration : 0;
        const currentTime = isFinite(video.currentTime) ? video.currentTime : 0;

        playButtons.forEach((playButton) => {
            playButton.innerHTML = video.paused ? '&#9658;' : '&#10074;&#10074;';
            playButton.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
            playButton.setAttribute('title', video.paused ? 'Play' : 'Pause');
        });

        muteButtons.forEach((muteButton) => {
            muteButton.innerHTML = video.muted || video.volume === 0 ? '&#128263;' : '&#128266;';
            muteButton.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
            muteButton.setAttribute('title', video.muted ? 'Unmute' : 'Mute');
        });

        seekInputs.forEach((seek) => {
            seek.max = String(duration || 0);
            seek.value = String(Math.min(currentTime, duration || currentTime));
        });

        timeLabels.forEach((timeLabel) => {
            timeLabel.textContent = `${formatVideoTime(currentTime)} / ${formatVideoTime(duration)}`;
        });
    }

    function bindTheatreVideoEvents(video) {
        if (!video || video.dataset.controlsBound === 'true') return;

        video.dataset.controlsBound = 'true';
        ['timeupdate', 'durationchange', 'play', 'pause', 'volumechange', 'loadedmetadata'].forEach((eventName) => {
            video.addEventListener(eventName, () => updateTheatreVideoControls(video));
        });
        updateTheatreVideoControls(video);
    }

    function loadTheatreVideoSource(video, sourceUrl, preserveState = false) {
        const playableUrl = getUsableMediaUrl(sourceUrl);
        if (!video || !playableUrl) return;

        const previousTime = preserveState && isFinite(video.currentTime) ? video.currentTime : 0;
        const shouldResume = preserveState ? !video.paused : true;

        video.src = playableUrl;
        video.load();
        video.addEventListener(
            'loadedmetadata',
            () => {
                if (previousTime && isFinite(video.duration)) {
                    video.currentTime = Math.min(previousTime, Math.max(0, video.duration - 0.25));
                }

                if (shouldResume) {
                    video.play().catch(() => null);
                }
                updateTheatreVideoControls(video);
            },
            { once: true }
        );

        if (shouldResume) {
            video.play().catch(() => null);
        }
    }

    async function playTheatreVideo() {
        const item = theatreMedia[theatreMediaIndex];
        if (!item || item.type !== 'video' || (!isUsableUrl(item.videoUrl) && !isUsableUrl(item.hlsUrl))) return;

        const label = escapeHtml(item.alt || theatreMediaTitle || 'Steam video');
        const viewport = theatre.querySelector('.steamPreviewTheatreViewport');
        if (!viewport) return;

        stopTheatreVideo();
        const directSrc = isUsableUrl(item.videoUrl) ? ` src="${escapeHtml(item.videoUrl)}"` : '';
        let video = viewport.querySelector('.steamPreviewTheatreVideo');
        if (!video) {
            viewport.innerHTML = `<video class="steamPreviewTheatreVideo"${directSrc} autoplay playsinline tabindex="0" aria-label="${label}"></video>`;
            video = viewport.querySelector('.steamPreviewTheatreVideo');
        }

        if (!video) return;
        video.setAttribute('aria-label', label);
        bindVideoPlaybackFallback(video, viewport, 'steamPreviewTheatreError', theatre);
        bindTheatreVideoEvents(video);

        if (isUsableUrl(item.videoUrl)) {
            loadTheatreVideoSource(video, item.videoUrl);
            return;
        }

        if (isUsableUrl(item.hlsUrl) && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = item.hlsUrl;
            video.play().catch(() => null);
            return;
        }

        viewport.innerHTML = renderVideoPlaybackFallback('steamPreviewTheatreError');
    }

    function isTheatreOpen() {
        return theatre.classList.contains('steamPreviewTheatreOpen');
    }

    function getTheatreSelection(index) {
        const selectedItem = currentMedia[index];
        if (!canOpenMediaTheatre(selectedItem)) return null;

        const mode = isVideoMedia(selectedItem) ? 'video' : 'screenshots';
        const screenshots = currentMedia.filter(isScreenshotMedia);
        const allItems = currentMedia.filter(canOpenMediaTheatre);
        const items = mode === 'video' ? [selectedItem, ...screenshots] : screenshots;
        const selectedIndex = items.indexOf(selectedItem);
        if (!items.length || selectedIndex < 0) return null;

        return { mode, items, selectedIndex, allItems };
    }

    async function toggleTheatreFullscreen() {
        if (!isTheatreOpen()) return;

        try {
            if (document.fullscreenElement === theatre) {
                await document.exitFullscreen();
            } else if (!document.fullscreenElement && theatre.requestFullscreen) {
                await theatre.requestFullscreen();
            }
        } catch (_) {
            // Ignore browser fullscreen denials.
        }

        updateTheatreFullscreenButton();
    }

    function updateTheatreFullscreenButton() {
        const theatreFullscreenButtons = theatre.querySelectorAll('.steamPreviewTheatreFullscreenBtn');
        const videoFullscreenButton = theatre.querySelector('.steamPreviewTheatreVideoFullscreenBtn');
        const videoWrap = theatre.querySelector('.steamPreviewTheatreVideoWrap');

        const label = document.fullscreenElement === theatre ? 'Exit fullscreen' : 'Enter fullscreen';
        theatreFullscreenButtons.forEach((button) => {
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
        });

        if (videoFullscreenButton) {
            const videoLabel =
                document.fullscreenElement === videoWrap ? 'Exit video fullscreen' : 'Enter video fullscreen';
            videoFullscreenButton.setAttribute('aria-label', videoLabel);
            videoFullscreenButton.setAttribute('title', videoLabel);
        }
    }

    function getTheatreVideoElement() {
        return theatre.querySelector('.steamPreviewTheatreVideo');
    }

    function toggleTheatreVideoPlayback() {
        const video = getTheatreVideoElement();
        if (!video) return;

        if (video.paused) {
            video.play().catch(() => null);
        } else {
            video.pause();
        }
        updateTheatreVideoControls(video);
    }

    function toggleTheatreVideoMute() {
        const video = getTheatreVideoElement();
        if (!video) return;

        video.muted = !video.muted;
        updateTheatreVideoControls(video);
    }

    function seekTheatreVideo(deltaSeconds) {
        const video = getTheatreVideoElement();
        if (!video) return false;

        const duration = isFinite(video.duration) ? video.duration : 0;
        const currentTime = isFinite(video.currentTime) ? video.currentTime : 0;
        const nextTime = duration
            ? Math.max(0, Math.min(duration, currentTime + deltaSeconds))
            : Math.max(0, currentTime + deltaSeconds);
        video.currentTime = nextTime;
        updateTheatreVideoControls(video);
        return true;
    }

    async function toggleTheatreVideoFullscreen() {
        const videoWrap = theatre.querySelector('.steamPreviewTheatreVideoWrap');
        if (!videoWrap) return;

        try {
            if (document.fullscreenElement === videoWrap) {
                await document.exitFullscreen();
            } else if (!document.fullscreenElement && videoWrap.requestFullscreen) {
                await videoWrap.requestFullscreen();
            }
        } catch (_) {
            // Ignore browser fullscreen denials.
        }
    }

    async function playActiveVideo() {
        const item = currentMedia[currentMediaIndex];
        if (!item || item.type !== 'video' || (!isUsableUrl(item.videoUrl) && !isUsableUrl(item.hlsUrl))) return;

        const label = escapeHtml(item.alt || currentMediaTitle || 'Steam video');
        const poster = isUsableUrl(item.posterUrl) ? ` poster="${escapeHtml(item.posterUrl)}"` : '';
        const viewport = tip.querySelector('.steamMediaViewport');
        if (!viewport) return;

        stopActiveVideo();
        const directSrc = isUsableUrl(item.videoUrl) ? ` src="${escapeHtml(item.videoUrl)}"` : '';
        viewport.innerHTML = `<video class="steamMediaVideo"${directSrc}${poster} controls autoplay playsinline aria-label="${label}"></video>`;

        const video = viewport.querySelector('.steamMediaVideo');
        if (!video) return;
        bindVideoPlaybackFallback(video, viewport, 'steamMediaError', tip);

        if (isUsableUrl(item.videoUrl)) {
            video.play().catch(() => null);
            return;
        }

        if (isUsableUrl(item.hlsUrl) && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = item.hlsUrl;
            video.play().catch(() => null);
            return;
        }

        viewport.innerHTML = renderVideoPlaybackFallback('steamMediaError');
    }

    listen(tip, 'mouseenter', () => {
        cancel(hideTimeout);
        trackingMove = false;
    });
    listen(tip, 'mouseleave', scheduleHide);
    listen(tip, 'focusin', () => cancel(hideTimeout));
    listen(tip, 'focusout', (event) => {
        if (!tip.contains(event.relatedTarget) && event.relatedTarget !== currentHoveredLink) scheduleHide();
    });
    listen(tip, 'error', imageFailure, true);
    listen(theatre, 'error', imageFailure, true);
    listen(tip, 'submit', (event) => {
        if (event.target.matches('.steamNameSearchForm')) {
            event.preventDefault();
            void searchCorrectionNames(true);
            return;
        }
        if (!event.target.matches('.steamCorrectionForm')) return;
        event.preventDefault();
        void applyCorrection(
            event.target.querySelector('[name="steamAppId"]').value,
            event.target.querySelector('button[type="submit"]')
        );
    });
    listen(tip, 'input', (event) => {
        if (!event.target.matches('[name="steamGameTitle"]')) return;
        if (event.isComposing) {
            cancelNameSearch();
            return;
        }
        scheduleNameSearch(event.target);
    });
    listen(tip, 'compositionend', (event) => {
        if (event.target.matches('[name="steamGameTitle"]')) scheduleNameSearch(event.target);
    });
    listen(tip, 'click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        if (target.type === 'submit') return;
        event.preventDefault();
        event.stopPropagation();
        if (target.matches('.steamMediaExpandBtn')) return openTheatre(currentMediaIndex);
        if (target.matches('.steamMediaPrevBtn')) return setActiveMedia(currentMediaIndex - 1);
        if (target.matches('.steamMediaNextBtn')) return setActiveMedia(currentMediaIndex + 1);
        if (target.matches('.steamMediaThumbBtn')) return setActiveMedia(Number(target.dataset.mediaIndex));
        if (target.matches('.steamMediaPlayBtn')) {
            setActiveMedia(Number(target.dataset.mediaIndex));
            return void playActiveVideo();
        }
        if (target.matches('.copyAppIdBtn')) return void copyAppId(target);
        if (target.matches('.steamCorrectToggle'))
            return tip.querySelector('.steamCorrection')?.hidden ? openCorrection() : closeCorrection();
        if (target.hasAttribute('data-correction-close')) return closeCorrection();
        if (target.hasAttribute('data-candidate-app-id'))
            return void applyCorrection(target.dataset.candidateAppId, target);
        if (target.hasAttribute('data-source-action')) return void runSourceAction(target);
        if (target.hasAttribute('data-correction-reset')) {
            const source = currentSource;
            try {
                await client.forgetMatch(source);
                if (currentSource?.key === source.key) await show(source, currentHoveredLink, lastMoveEvent);
            } catch (error) {
                announce(error.message);
            }
            return;
        }
        if (target.hasAttribute('data-find-source')) {
            cancelNameSearch();
            const operation = nameSearchId;
            const panel = tip.querySelector('.steamCorrection');
            const source = currentSource;
            const message = tip.querySelector('.steamCorrectionStatus');
            const hadFocus = disableForOperation(target);
            if (message) message.textContent = 'Checking source page…';
            try {
                const found = await adapter.findAppIds(source);
                if (
                    currentSource?.key !== source.key ||
                    operation !== nameSearchId ||
                    !panel?.isConnected ||
                    panel.hidden
                )
                    return;
                updateSuggestions(panel, found);
                if (message)
                    message.textContent = found.length
                        ? 'Choose a Steam game below.'
                        : 'No unambiguous Steam link found in the source content.';
            } catch (error) {
                if (message?.isConnected) message.textContent = error.message || 'Source page unavailable.';
            } finally {
                if (target.isConnected) target.disabled = false;
                restoreOperationFocus(target, hadFocus);
            }
            return;
        }
        if (target.dataset.retry === 'all')
            return void show(currentSource, currentHoveredLink, lastMoveEvent, { force: true });
        if (target.dataset.retry && currentData) {
            const appId = currentData.appId;
            const field = target.dataset.retry;
            const hadFocus = disableForOperation(target);
            try {
                await (field === 'tags' ? client.retryTags(appId) : client.retryReviews(appId));
                const data = client.getPreviewData(appId);
                if (data) patchMetadata(data);
            } catch (error) {
                announce(error.message || 'Retry failed.');
            } finally {
                if (target.isConnected) target.disabled = false;
                if (hadFocus && String(currentData?.appId) === String(appId) && document.activeElement === tip) {
                    const row = tip.querySelector(field === 'tags' ? '.steamTags' : '.steamRating');
                    if (row) {
                        row.tabIndex = -1;
                        focus(row.querySelector('a,button') || row);
                    }
                } else restoreOperationFocus(target, hadFocus);
            }
        }
    });
    listen(theatre, 'click', async (event) => {
        if (event.target === theatre) return closeTheatre();
        const button = event.target.closest('button');
        if (button) {
            event.preventDefault();
            event.stopPropagation();
            if (button.matches('.steamPreviewTheatreCloseBtn')) return closeTheatre();
            if (button.matches('.steamPreviewTheatreVideoPlayToggle')) return toggleTheatreVideoPlayback();
            if (button.matches('.steamPreviewTheatreVideoMuteToggle')) return toggleTheatreVideoMute();
            if (button.matches('.steamPreviewTheatreFullscreenBtn')) return void toggleTheatreFullscreen();
            if (button.matches('.steamPreviewTheatreVideoFullscreenBtn')) return void toggleTheatreVideoFullscreen();
            if (button.matches('.steamPreviewTheatrePrevBtn')) return setTheatreMedia(theatreMediaIndex - 1);
            if (button.matches('.steamPreviewTheatreNextBtn')) return setTheatreMedia(theatreMediaIndex + 1);
            if (button.hasAttribute('data-source-action')) return void runSourceAction(button);
        }
        if (event.target.matches('.steamPreviewTheatreVideo')) {
            focus(event.target);
            toggleTheatreVideoPlayback();
        }
    });
    listen(theatre, 'input', (event) => {
        if (!event.target.matches('.steamPreviewTheatreVideoSeek')) return;
        const video = getTheatreVideoElement();
        if (video) {
            video.currentTime = Number(event.target.value);
            updateTheatreVideoControls(video);
        }
    });
    listen(
        document,
        'mouseover',
        (event) => {
            if (isTheatreOpen() || tip.contains(event.target)) return;
            const link = event.target.closest?.(adapter.selector);
            if (link) queueShow(link, event);
        },
        true
    );
    listen(
        document,
        'mouseout',
        (event) => {
            const link = event.target.closest?.(adapter.selector);
            if (link && link !== event.relatedTarget?.closest?.(adapter.selector) && !tip.contains(event.relatedTarget))
                scheduleHide();
        },
        true
    );
    listen(
        document,
        'focusin',
        (event) => {
            if (suppressFocusPreview || isTheatreOpen() || tip.contains(event.target)) return;
            const link = event.target.closest?.(adapter.selector);
            if (link) queueShow(link, null);
        },
        true
    );
    listen(
        document,
        'focusout',
        (event) => {
            if (event.target.closest?.(adapter.selector) && !tip.contains(event.relatedTarget)) scheduleHide();
        },
        true
    );
    listen(
        document,
        'pointermove',
        (event) => {
            if (trackingMove && tip.style.display === 'block') {
                lastMoveEvent = event;
                requestPosition();
            }
        },
        { passive: true }
    );
    listen(
        document,
        'keydown',
        (event) => {
            if (isTheatreOpen()) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    closeTheatre();
                    return;
                }
                if (event.key === 'Tab') {
                    const elements = [
                        ...theatre.querySelectorAll(
                            'a[href],button:not([disabled]),input:not([disabled]),video[tabindex]'
                        )
                    ].filter((element) => element.getClientRects().length);
                    const first = elements[0],
                        last = elements[elements.length - 1];
                    if (
                        event.shiftKey &&
                        (document.activeElement === theatre ||
                            document.activeElement === first ||
                            !theatre.contains(document.activeElement))
                    ) {
                        event.preventDefault();
                        focus(last);
                    } else if (
                        !event.shiftKey &&
                        (document.activeElement === theatre ||
                            document.activeElement === last ||
                            !theatre.contains(document.activeElement))
                    ) {
                        event.preventDefault();
                        focus(first);
                    }
                    return;
                }
                if (
                    event.target.closest?.('.steamPreviewTheatreVideoControls') ||
                    event.target.matches?.('input,textarea,select')
                )
                    return;
                if (theatreMode === 'video' && isVideoMedia(theatreMedia[theatreMediaIndex])) {
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                        event.preventDefault();
                        seekTheatreVideo(event.key === 'ArrowLeft' ? -5 : 5);
                        return;
                    }
                    if (event.key === ' ' && !event.target.closest?.('button,a')) {
                        event.preventDefault();
                        toggleTheatreVideoPlayback();
                        return;
                    }
                }
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    setTheatreMedia(theatreMediaIndex + (event.key === 'ArrowLeft' ? -1 : 1));
                }
                return;
            }
            if (event.key === 'Escape' && tip.style.display === 'block') {
                event.preventDefault();
                if (tip.querySelector('.steamCorrection:not([hidden])')) closeCorrection();
                else hide({ restoreFocus: tip.contains(document.activeElement) });
            }
            if (event.altKey && event.key === 'ArrowDown') {
                const link = event.target.closest?.(adapter.selector);
                if (link) {
                    const source = adapter.getSource(link);
                    if (source) {
                        event.preventDefault();
                        if (currentSource?.key === source.key && tip.style.display === 'block') {
                            cancel(hideTimeout);
                            trackingMove = false;
                            focusPreviewCard();
                        } else
                            void show(source, link).then(() => {
                                if (currentSource?.key === source.key && tip.style.display === 'block')
                                    focusPreviewCard();
                            });
                    }
                }
            }
        },
        true
    );
    listen(document, 'fullscreenchange', updateTheatreFullscreenButton);
    listen(window, 'resize', requestPosition, { passive: true });
    listen(
        window,
        'scroll',
        () => {
            if (tip.style.display === 'block') {
                lastMoveEvent = null;
                requestPosition();
            }
        },
        { passive: true }
    );
    if (window.ResizeObserver) {
        const observer = new window.ResizeObserver(requestPosition);
        observer.observe(tip);
        cleanups.push(() => observer.disconnect());
    }
    const unsubscribe = client.subscribe((event) => {
        if (disposed) return;
        if (event.kind === 'clear') {
            closeTheatre(false);
            hide();
            return;
        }
        if (!currentData || String(event.appId) !== String(currentData.appId || currentData.steam_appid)) return;
        const data = event.data || client.getPreviewData(event.appId);
        if (data) patchMetadata(data);
    });
    cleanups.push(unsubscribe);
    refreshSettings();
    return {
        show,
        hide,
        refreshSettings,
        getState: () => ({
            sourceKey: currentSource?.key || null,
            appId: currentData?.appId || null,
            state: tip.dataset.previewState || 'hidden',
            mediaIndex: currentMediaIndex,
            theatre: isTheatreOpen()
        }),
        dispose() {
            if (disposed) return;
            closeTheatre(false);
            hide();
            disposed = true;
            if (positionFrame != null) window.cancelAnimationFrame(positionFrame);
            timers.forEach((id) => window.clearTimeout(id));
            cleanups.splice(0).forEach((cleanup) => cleanup?.());
            tip.remove();
            theatre.remove();
            status.remove();
            style.remove();
            injectedStyle?.remove?.();
        }
    };
}

// Source: vendor/steam-hover-core/src/core/runtime.mjs
/** Browser wiring shared by both standalone releases. */
function startSteamHover({
    createClient,
    mountPreview,
    createAdapter,
    cleanTitle,
    sourceToolFactory,
    colorTag,
    window: win = window,
    document: doc = document
}) {
    const id = createAdapter.siteId;
    const sourceTools = sourceToolFactory({ window: win, document: doc });
    const modern = typeof GM === 'object' ? GM : {};
    const storage = {
        getValue: typeof GM_getValue === 'function' ? GM_getValue : modern.getValue?.bind(modern),
        setValue: typeof GM_setValue === 'function' ? GM_setValue : modern.setValue?.bind(modern),
        addValueChangeListener:
            typeof GM_addValueChangeListener === 'function'
                ? GM_addValueChangeListener
                : modern.addValueChangeListener?.bind(modern)
    };
    const gmRequest = (options) => {
        if (typeof GM_xmlhttpRequest === 'function') return GM_xmlhttpRequest(options);
        if (!modern.xmlHttpRequest)
            throw new Error('A userscript manager with cross-origin request support is required.');
        let settled = false;
        const opts = { ...options };
        for (const event of ['onload', 'onerror', 'ontimeout', 'onabort']) {
            opts[event] = (result) => {
                if (settled) return;
                settled = true;
                options[event]?.(result);
            };
        }
        const request = modern.xmlHttpRequest(opts);
        request?.then?.(opts.onload, opts.onerror);
        return { abort: () => request?.abort?.() };
    };
    if (!storage.getValue || !storage.setValue) throw new Error('Userscript storage is unavailable.');
    let adapter;
    const client = createClient({
        ...storage,
        gmRequest,
        DOMParser: win.DOMParser,
        isHidden: () => doc.hidden,
        storageKey: `${id}SteamHoverData_v3`,
        settingsKey: `${id}SteamHoverSettings_v1`,
        findSourceAppIds: (source) => adapter?.findAppIds?.(source)
    });
    const theme = () => {
        const chosen = client.getSettings().theme;
        return chosen === 'light' || chosen === 'dark' ? chosen : id === '1337x' ? 'light' : 'dark';
    };
    adapter = createAdapter({ window: win, document: doc, cleanTitle, sourceTools, colorTag, getTheme: theme });
    const view = mountPreview({
        client,
        adapter,
        window: win,
        document: doc,
        addStyle: typeof GM_addStyle === 'function' ? GM_addStyle : undefined
    });
    let disposed = false;
    let initialized = false;
    let workGeneration = 0;
    let scanTimer = null;
    let pumpTimer = null;
    let observer = null;
    const queue = new Map();
    const active = new Map();
    const done = new Set();
    const observed = new WeakSet();

    function enqueue(link, priority = 'nearby') {
        if (disposed || client.getSettings().preload === 'hover') return;
        const source = adapter.getSource(link);
        if (!source || done.has(source.key) || active.has(source.key)) return;
        const old = queue.get(source.key);
        if (!old || priority === 'nearby') queue.set(source.key, { source, priority });
        schedulePump();
    }
    function schedulePump(delay = 0) {
        if (disposed || pumpTimer !== null) return;
        pumpTimer = win.setTimeout(() => {
            pumpTimer = null;
            pump();
        }, delay);
    }
    function pump() {
        if (disposed || client.getSettings().preload === 'hover') return;
        // Leave transport capacity available for an active hover. Hidden tabs warm serially.
        const limit = doc.hidden ? 1 : 2;
        const sorted = [...queue.entries()].sort(
            (a, b) => Number(b[1].priority === 'nearby') - Number(a[1].priority === 'nearby')
        );
        while (active.size < limit && sorted.length) {
            const [key, job] = sorted.shift();
            queue.delete(key);
            const controller = new AbortController();
            const generation = workGeneration;
            active.set(key, controller);
            client
                .loadPreview(job.source, { priority: job.priority, signal: controller.signal })
                .then(() => {
                    if (generation === workGeneration) done.add(key);
                })
                .catch((error) => {
                    if (generation === workGeneration && error.code !== 'ABORTED') done.add(key);
                })
                .finally(() => {
                    if (active.get(key) === controller) active.delete(key);
                    if (generation === workGeneration) schedulePump(doc.hidden ? 350 : 40);
                });
        }
    }
    function scan() {
        scanTimer = null;
        if (disposed || client.getSettings().preload === 'hover') return;
        const all = client.getSettings().preload === 'all';
        for (const link of adapter.getLinks()) {
            if (observer && !observed.has(link)) {
                observer.observe(link);
                observed.add(link);
            }
            const rect = link.getBoundingClientRect();
            const nearby = rect.bottom >= -600 && rect.top <= win.innerHeight + 600;
            if (nearby || all) enqueue(link, nearby ? 'nearby' : 'background');
        }
    }
    function scheduleScan() {
        if (disposed || scanTimer !== null) return;
        scanTimer = win.setTimeout(scan, 100);
    }
    function resetPreloads() {
        workGeneration++;
        for (const controller of active.values()) controller.abort();
        active.clear();
        queue.clear();
        done.clear();
        scheduleScan();
    }
    const unsubscribe = client.subscribe((event) => {
        if (event.kind === 'clear') {
            view.hide();
            resetPreloads();
        }
        if (event.kind === 'settings') {
            view.refreshSettings();
            resetPreloads();
        }
    });
    const visibility = () => {
        client.onVisibilityChange?.();
        scheduleScan();
        schedulePump();
    };
    function initialize() {
        if (initialized || disposed) return;
        initialized = true;
        if (typeof win.IntersectionObserver === 'function') {
            observer = new win.IntersectionObserver(
                (entries) => {
                    for (const entry of entries) if (entry.isIntersecting) enqueue(entry.target, 'nearby');
                },
                { rootMargin: '600px 0px' }
            );
        }
        scan();
        doc.addEventListener('visibilitychange', visibility);
        win.addEventListener('scroll', scheduleScan, { passive: true });
        win.addEventListener('resize', scheduleScan, { passive: true });
        mutations.observe(doc.body, { childList: true, subtree: true });
    }
    const mutations = new win.MutationObserver((records) => {
        if (
            records.some((record) =>
                [...record.addedNodes, ...record.removedNodes].some(
                    (node) =>
                        node.nodeType === 1 &&
                        (node.matches?.(adapter.selector) || node.querySelector?.(adapter.selector))
                )
            )
        )
            scheduleScan();
    });
    Promise.resolve(client.ready)
        .then(() => {
            if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', initialize, { once: true });
            else if (typeof win.requestIdleCallback === 'function')
                win.requestIdleCallback(initialize, { timeout: 1000 });
            else win.setTimeout(initialize, 0);
        })
        .catch((error) => {
            if (client.getSettings().debug) console.error('[Steam Hover] Initialization failed:', error.message);
        });

    const register =
        typeof GM_registerMenuCommand === 'function'
            ? GM_registerMenuCommand
            : modern.registerMenuCommand?.bind(modern);
    const clearCache = async () => {
        await client.clear();
        view.hide();
        resetPreloads();
    };
    if (id === '1337x') win.clearSteamHoverCache = clearCache;
    else win.clearCsrinruSteamHoverCache = clearCache;
    register?.(`${adapter.name}: Settings`, () => openPanel('settings'));
    register?.('Clear cached Steam data', clearCache);
    register?.('Export match corrections', () => openPanel('export'));
    register?.('Import match corrections', () => openPanel('import'));
    register?.('Steam Hover diagnostics', () => openPanel('debug'));
    let panel = null;
    let panelTrigger = null;
    function openPanel(mode) {
        view.hide();
        if (panel) panel.close();
        panelTrigger = doc.activeElement;
        panel = doc.createElement('dialog');
        panel.className = 'steamHoverSettingsDialog';
        panel.setAttribute('aria-labelledby', 'steamHoverSettingsTitle');
        panel.style.cssText = `background:${theme() === 'dark' ? '#1c1c1c' : '#f0f0f0'};color:${theme() === 'dark' ? '#eee' : '#111'};border:1px solid #777;border-radius:8px;padding:20px;max-width:min(480px,90vw);max-height:85vh;overflow:auto;font:14px/1.5 system-ui;`;
        const title = doc.createElement('h2');
        title.id = 'steamHoverSettingsTitle';
        title.style.cssText = 'font-size:18px;margin:0 0 12px';
        title.textContent =
            mode === 'settings'
                ? 'Steam Hover settings'
                : mode === 'debug'
                  ? 'Steam Hover diagnostics'
                  : mode === 'import'
                    ? 'Import match corrections'
                    : 'Export match corrections';
        panel.appendChild(title);
        const status = doc.createElement('p');
        status.setAttribute('role', 'status');
        status.style.cssText = 'overflow-wrap:anywhere';
        const close = doc.createElement('button');
        close.type = 'button';
        close.textContent = 'Close';
        close.style.cssText = 'margin:12px 8px 0 0';
        close.addEventListener('click', () => panel?.close());
        if (mode === 'settings') {
            const values = client.getSettings();
            const fields = {};
            for (const [name, label, options] of [
                [
                    'preload',
                    'Preload',
                    [
                        ['nearby', 'Nearby rows'],
                        ['all', 'Entire page'],
                        ['hover', 'On hover only']
                    ]
                ],
                [
                    'theme',
                    'Theme',
                    [
                        ['site', 'Site default'],
                        ['light', 'Light'],
                        ['dark', 'Dark']
                    ]
                ],
                [
                    'reviewPurchaseType',
                    'Review purchases',
                    [
                        ['1', 'All purchases'],
                        ['0', 'Steam purchases']
                    ]
                ]
            ]) {
                const wrapper = doc.createElement('label');
                wrapper.style.cssText = 'display:block;margin:12px 0';
                wrapper.append(doc.createTextNode(`${label} `));
                const select = doc.createElement('select');
                select.name = name;
                select.setAttribute('aria-label', label);
                for (const [value, text] of options) {
                    const option = doc.createElement('option');
                    option.value = value;
                    option.textContent = text;
                    select.appendChild(option);
                }
                select.value = String(values[name]);
                wrapper.appendChild(select);
                panel.appendChild(wrapper);
                fields[name] = select;
            }
            const debugLabel = doc.createElement('label');
            debugLabel.style.display = 'block';
            const debug = doc.createElement('input');
            debug.type = 'checkbox';
            debug.checked = Boolean(values.debug);
            debugLabel.append(debug, doc.createTextNode(' Enable diagnostic logging'));
            panel.appendChild(debugLabel);
            const explanation = doc.createElement('p');
            explanation.textContent =
                'Nearby rows and Entire page also warm real Steam tags while the tab is hidden, at a slower bounded rate. Browser suspension can pause work. On hover only disables automatic warming.';
            panel.appendChild(explanation);
            const save = doc.createElement('button');
            save.type = 'button';
            save.textContent = 'Save settings';
            save.style.marginRight = '8px';
            save.addEventListener('click', async () => {
                await client.updateSettings({
                    preload: fields.preload.value,
                    theme: fields.theme.value,
                    debug: debug.checked,
                    reviewPurchaseType: Number(fields.reviewPurchaseType.value)
                });
                view.refreshSettings();
                resetPreloads();
                panel?.close();
            });
            panel.appendChild(save);
        } else {
            const area = doc.createElement('textarea');
            area.setAttribute(
                'aria-label',
                mode === 'import'
                    ? 'Match corrections JSON'
                    : mode === 'export'
                      ? 'Exported match corrections JSON'
                      : 'Diagnostic report JSON'
            );
            area.style.cssText =
                'display:block;width:100%;box-sizing:border-box;min-height:220px;font:12px/1.4 monospace;';
            area.readOnly = mode !== 'import';
            if (mode === 'export') area.value = JSON.stringify(client.exportCorrections(), null, 2);
            if (mode === 'debug')
                area.value = JSON.stringify(
                    {
                        ...client.getDebugReport(),
                        preload: { hidden: doc.hidden, active: active.size, queued: queue.size, warmed: done.size }
                    },
                    null,
                    2
                );
            panel.appendChild(area);
            if (mode === 'import') {
                const submit = doc.createElement('button');
                submit.type = 'button';
                submit.textContent = 'Import corrections';
                submit.addEventListener('click', async () => {
                    try {
                        await client.importCorrections(JSON.parse(area.value));
                        resetPreloads();
                        status.textContent = 'Corrections imported. They are validated against Steam when used.';
                    } catch (error) {
                        status.textContent = `Import failed: ${error.message}`;
                    }
                });
                panel.appendChild(submit);
            } else {
                const download = doc.createElement('button');
                download.type = 'button';
                download.textContent = 'Download JSON';
                download.addEventListener('click', () => {
                    const url = win.URL.createObjectURL(new win.Blob([area.value], { type: 'application/json' }));
                    const anchor = doc.createElement('a');
                    anchor.href = url;
                    anchor.download = `${id}-steam-hover-${mode}.json`;
                    doc.body.appendChild(anchor);
                    anchor.click();
                    anchor.remove();
                    win.setTimeout(() => win.URL.revokeObjectURL(url), 1000);
                });
                panel.appendChild(download);
            }
        }
        panel.append(status, close);
        const ownPanel = panel;
        panel.addEventListener('close', () => {
            ownPanel.remove();
            if (panel === ownPanel) panel = null;
            if (panelTrigger?.isConnected) panelTrigger.focus({ preventScroll: true });
        });
        doc.body.appendChild(panel);
        if (typeof panel.showModal === 'function') panel.showModal();
        else {
            panel.setAttribute('open', '');
            panel.setAttribute('role', 'dialog');
        }
    }

    return {
        client,
        adapter,
        view,
        scan,
        dispose() {
            disposed = true;
            workGeneration++;
            for (const controller of active.values()) controller.abort();
            active.clear();
            queue.clear();
            if (scanTimer !== null) win.clearTimeout(scanTimer);
            if (pumpTimer !== null) win.clearTimeout(pumpTimer);
            observer?.disconnect();
            mutations.disconnect();
            unsubscribe();
            view.dispose();
            client.dispose?.();
            doc.removeEventListener('visibilitychange', visibility);
            doc.removeEventListener('DOMContentLoaded', initialize);
            win.removeEventListener('scroll', scheduleScan);
            win.removeEventListener('resize', scheduleScan);
            panel?.close();
        }
    };
}

// Source: src/adapters/1337x.mjs
function create1337xAdapter({ window: win, document: doc, cleanTitle, sourceTools }) {
    const selector =
        'table.torrent-list td.name a[href*="/torrent/"], table.torrents td.name a[href*="/torrent/"], table.table-list td.name a[href*="/torrent/"]';
    const rows = new WeakMap();
    const magnets = new Map();
    const uploaderPattern =
        /(?:^|[^a-z0-9])(?:fitgirl|dodi|elamigos|kaoskrew|kaos|johncena141|masquerade|gnarly|flt|codex|plaza|skidrow|razor1911|prophet|reloaded|hoodlum|darksiders|empress|tenoke|tinyiso|igggames(?:com)?|ovagames|xatab|gamedrive|emadmoner)(?:$|[^a-z0-9])/i;
    const gamePage =
        /\/(?:games|category-search\/[^/]+\/games)(?:\/|$)/i.test(win.location.pathname) ||
        /\/cat\/(?:games)(?:\/|$)/i.test(win.location.pathname);

    function getSource(link) {
        if (!link?.matches?.(selector)) return null;
        let url;
        try {
            url = sourceTools.safeUrl(link.getAttribute('href'));
        } catch {
            return null;
        }
        const id = url.pathname.match(/^\/torrent\/(\d+)(?:\/|$)/)?.[1];
        if (!id) return null;
        const row = link.closest('tr');
        if (!row) return null;
        const rawTitle = link.textContent.replace(/\s+/g, ' ').trim();
        const categories = [...row.querySelectorAll('a[href*="/cat/"], a[href*="/sub/"], [data-category]')]
            .map((a) => `${a.textContent} ${a.getAttribute('data-category') || ''}`)
            .join(' ')
            .trim();
        const uploader = row.querySelector('a[href*="/user/"]')?.textContent.trim() || '';
        const fingerprint = `${rawTitle}|${url.href}|${categories}|${uploader}|${row.className}|${row.querySelector('i')?.className || ''}`;
        const previous = rows.get(row);
        if (previous?.fingerprint === fingerprint && previous.link === link) return previous.source;
        const explicitGame =
            gamePage ||
            /\b(?:games?|windows|pc(?: games?)?)\b/i.test(categories) ||
            row.matches('[data-category="Games"], [data-category="games"]') ||
            Boolean(
                row.querySelector(
                    'i.flaticon-games, i.flaticon-apps, i.flaticon-windows, i.fa-windows, [data-category="Games"], [data-category="games"], [data-category="Windows"]'
                )
            );
        const explicitOther = /\b(?:applications?|software|movies|television|tv|music|anime)\b/i.test(categories);
        const titleHint = /\b(?:fitgirl|dodi|elamigos|repack|tenoke|skidrow|codex|gog)\b/i.test(rawTitle);
        const eligible = explicitGame || (!explicitOther && (uploaderPattern.test(uploader) || titleHint));
        const title = eligible ? cleanTitle(rawTitle) : null;
        const explicit = sourceTools.getSteamLinks(row);
        const titleAppId = rawTitle.match(/\b(?:steam[ _-]*)?app[ _-]*id\s*[:=]\s*([1-9]\d{1,9})\b/i)?.[1];
        const source = title
            ? {
                  key: `1337x:${id}`,
                  title,
                  rawTitle,
                  url: url.href,
                  link,
                  explicitAppId:
                      explicit.length === 1 ? explicit[0].appId : titleAppId ? Number(titleAppId) : undefined,
                  detectionReason: explicitGame
                      ? 'game-category'
                      : uploaderPattern.test(uploader)
                        ? 'game-uploader'
                        : 'release-marker'
              }
            : null;
        rows.set(row, { fingerprint, link, source });
        return source;
    }

    async function getMagnet(source) {
        if (magnets.has(source.url)) return magnets.get(source.url);
        const request = sourceTools
            .fetchDocument(source.url)
            .then((parsed) => {
                const value = parsed.querySelector('a[href^="magnet:"]')?.getAttribute('href');
                if (!isValidMagnet(value))
                    throw new Error('No valid magnet link was found. Open the torrent page to check it.');
                return value;
            })
            .catch((error) => {
                magnets.delete(source.url);
                sourceTools.invalidate?.(source.url);
                throw error;
            });
        magnets.set(source.url, request);
        return request;
    }

    return {
        id: '1337x',
        name: '1337x Steam Hover Preview',
        selector,
        defaultTheme: 'light',
        showAppId: false,
        getLinks: (root = doc) => [...root.querySelectorAll(selector)],
        getSource,
        getActions: () => [{ id: 'magnet', label: 'Magnet Download', icon: 'magnet' }],
        async runAction(id, source) {
            if (id !== 'magnet') return;
            try {
                const magnet = await getMagnet(source);
                win.location.href = magnet;
                return { message: 'Opening magnet…' };
            } catch (error) {
                error.sourceUrl = source.url;
                error.retryable = true;
                throw error;
            }
        },
        async findAppIds(source) {
            const parsed = await sourceTools.fetchDocument(source.url);
            const content = parsed.querySelector(
                '#description, .torrent-description, .torrent-detail-description, article'
            );
            if (!content) throw new Error('No description region was found. Paste the correct Steam URL or AppID.');
            return sourceTools.getSteamLinks(content);
        }
    };
}

function isValidMagnet(value) {
    if (typeof value !== 'string' || value.length > 32768) return false;
    try {
        const url = new URL(value);
        return (
            url.protocol === 'magnet:' &&
            url.searchParams
                .getAll('xt')
                .some(
                    (xt) =>
                        /^urn:btih:(?:[a-f0-9]{40}|[a-z2-7]{32})$/i.test(xt) || /^urn:btmh:1220[a-f0-9]{64}$/i.test(xt)
                )
        );
    } catch {
        return false;
    }
}

create1337xAdapter.siteId = "1337x";
startSteamHover({ createClient: createSteamClient, mountPreview: mountSteamHoverPreview, createAdapter: create1337xAdapter, cleanTitle: cleanTorrentTitle, sourceToolFactory: createSourcePageTools, colorTag: threadTagColor });
})();

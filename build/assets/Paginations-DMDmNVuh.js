import{r as b,_ as f,R as m,b as u,c as v,P as t,j as e}from"./index-DKHLUbY7.js";import{a as N,b as l}from"./DefaultLayout-Cvi-UyMU.js";import{C as P}from"./index.esm-DjCr1j3I.js";import{C,a as o}from"./CRow-DatHjOqF.js";import{C as h,a as x}from"./CCardBody-BonBoaB8.js";import{C as j}from"./CCardHeader-DtQZn5_B.js";import"./cil-user-Dlmw-Gem.js";var i=b.forwardRef(function(a,p){var n,d=a.children,g=a.align,r=a.className,c=a.size,y=f(a,["children","align","className","size"]);return m.createElement("nav",u({ref:p},y),m.createElement("ul",{className:v("pagination",(n={},n["justify-content-".concat(g)]=g,n["pagination-".concat(c)]=c,n),r)},d))});i.propTypes={align:t.oneOf(["start","center","end"]),children:t.node,className:t.string,size:t.oneOf(["sm","lg"])};i.displayName="CPagination";var s=b.forwardRef(function(a,p){var n=a.children,d=a.as,g=a.className,r=f(a,["children","as","className"]),c=d??(r.active?"span":"a");return m.createElement("li",u({className:v("page-item",{active:r.active,disabled:r.disabled},g)},r.active&&{"aria-current":"page"}),c==="a"?m.createElement(P,u({className:"page-link",as:c},r,{ref:p}),n):m.createElement(c,{className:"page-link",ref:p},n))});s.propTypes={as:t.elementType,children:t.node,className:t.string};s.displayName="CPaginationItem";const A=()=>e.jsxs(C,{children:[e.jsxs(o,{xs:12,children:[e.jsx(N,{href:"components/pagination/"}),e.jsxs(h,{className:"mb-4",children:[e.jsx(j,{children:e.jsx("strong",{children:"React Pagination"})}),e.jsxs(x,{children:[e.jsxs("p",{className:"text-body-secondary small",children:["We use a large block of connected links for our pagination, making links hard to miss and easily scalable—all while providing large hit areas. Pagination is built with list HTML elements so screen readers can announce the number of available links. Use a wrapping ",e.jsx("code",{children:"<nav>"})," element to identify it as a navigation section to screen readers and other assistive technologies."]}),e.jsxs("p",{className:"text-body-secondary small",children:["In addition, as pages likely have more than one such navigation section, it's advisable to provide a descriptive ",e.jsx("code",{children:"aria-label"})," for the"," ",e.jsx("code",{children:"<nav>"})," to reflect its purpose. For example, if the pagination component is used to navigate between a set of search results, an appropriate label could be ",e.jsx("code",{children:'aria-label="Search results pages"'}),"."]}),e.jsx(l,{href:"components/pagination",children:e.jsxs(i,{"aria-label":"Page navigation example",children:[e.jsx(s,{children:"Previous"}),e.jsx(s,{children:"1"}),e.jsx(s,{children:"2"}),e.jsx(s,{children:"3"}),e.jsx(s,{children:"Next"})]})})]})]})]}),e.jsx(o,{xs:12,children:e.jsxs(h,{className:"mb-4",children:[e.jsxs(j,{children:[e.jsx("strong",{children:"React Pagination"})," ",e.jsx("small",{children:"Working with icons"})]}),e.jsxs(x,{children:[e.jsxs("p",{className:"text-body-secondary small",children:["Looking to use an icon or symbol in place of text for some pagination links? Be sure to provide proper screen reader support with ",e.jsx("code",{children:"aria"})," attributes."]}),e.jsx(l,{href:"components/pagination#working-with-icons",children:e.jsxs(i,{"aria-label":"Page navigation example",children:[e.jsx(s,{"aria-label":"Previous",children:e.jsx("span",{"aria-hidden":"true",children:"«"})}),e.jsx(s,{children:"1"}),e.jsx(s,{children:"2"}),e.jsx(s,{children:"3"}),e.jsx(s,{"aria-label":"Next",children:e.jsx("span",{"aria-hidden":"true",children:"»"})})]})})]})]})}),e.jsx(o,{xs:12,children:e.jsxs(h,{className:"mb-4",children:[e.jsxs(j,{children:[e.jsx("strong",{children:"React Pagination"})," ",e.jsx("small",{children:"Disabled and active states"})]}),e.jsxs(x,{children:[e.jsxs("p",{className:"text-body-secondary small",children:["Pagination links are customizable for different circumstances. Use"," ",e.jsx("code",{children:"disabled"})," for links that appear un-clickable and ",e.jsx("code",{children:".active"})," to indicate the current page."]}),e.jsxs("p",{className:"text-body-secondary small",children:["While the ",e.jsx("code",{children:"disabled"})," prop uses ",e.jsx("code",{children:"pointer-events: none"})," to"," ",e.jsx("em",{children:"try"})," to disable the link functionality of ",e.jsx("code",{children:"<a>"}),"s, that CSS property is not yet standardized and doesn'taccount for keyboard navigation. As such, we always add ",e.jsx("code",{children:'tabindex="-1"'})," on disabled links and use custom JavaScript to fully disable their functionality."]}),e.jsx(l,{href:"components/pagination#disabled-and-active-states",children:e.jsxs(i,{"aria-label":"Page navigation example",children:[e.jsx(s,{"aria-label":"Previous",disabled:!0,children:e.jsx("span",{"aria-hidden":"true",children:"«"})}),e.jsx(s,{active:!0,children:"1"}),e.jsx(s,{children:"2"}),e.jsx(s,{children:"3"}),e.jsx(s,{"aria-label":"Next",children:e.jsx("span",{"aria-hidden":"true",children:"»"})})]})})]})]})}),e.jsx(o,{xs:12,children:e.jsxs(h,{className:"mb-4",children:[e.jsxs(j,{children:[e.jsx("strong",{children:"React Pagination"})," ",e.jsx("small",{children:"Sizing"})]}),e.jsxs(x,{children:[e.jsxs("p",{className:"text-body-secondary small",children:["Fancy larger or smaller pagination? Add ",e.jsx("code",{children:'size="lg"'})," or"," ",e.jsx("code",{children:'size="sm"'})," for additional sizes."]}),e.jsx(l,{href:"components/pagination#sizing",children:e.jsxs(i,{size:"lg","aria-label":"Page navigation example",children:[e.jsx(s,{children:"Previous"}),e.jsx(s,{children:"1"}),e.jsx(s,{children:"2"}),e.jsx(s,{children:"3"}),e.jsx(s,{children:"Next"})]})}),e.jsx(l,{href:"components/pagination#sizing",children:e.jsxs(i,{size:"sm","aria-label":"Page navigation example",children:[e.jsx(s,{children:"Previous"}),e.jsx(s,{children:"1"}),e.jsx(s,{children:"2"}),e.jsx(s,{children:"3"}),e.jsx(s,{children:"Next"})]})})]})]})}),e.jsx(o,{xs:12,children:e.jsxs(h,{className:"mb-4",children:[e.jsxs(j,{children:[e.jsx("strong",{children:"React Pagination"})," ",e.jsx("small",{children:"Alignment"})]}),e.jsxs(x,{children:[e.jsxs("p",{className:"text-body-secondary small",children:["Change the alignment of pagination components with"," ",e.jsx("a",{href:"https://coreui.io/docs/utilities/flex/",children:"flexbox utilities"}),"."]}),e.jsx(l,{href:"components/pagination#aligment",children:e.jsxs(i,{className:"justify-content-center","aria-label":"Page navigation example",children:[e.jsx(s,{disabled:!0,children:"Previous"}),e.jsx(s,{children:"1"}),e.jsx(s,{children:"2"}),e.jsx(s,{children:"3"}),e.jsx(s,{children:"Next"})]})}),e.jsx(l,{href:"components/pagination#aligment",children:e.jsxs(i,{className:"justify-content-end","aria-label":"Page navigation example",children:[e.jsx(s,{disabled:!0,children:"Previous"}),e.jsx(s,{children:"1"}),e.jsx(s,{children:"2"}),e.jsx(s,{children:"3"}),e.jsx(s,{children:"Next"})]})})]})]})})]});export{A as default};

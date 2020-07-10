// https://observablehq.com/@mbostock/toc@52
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# TOC

This notebook can generate a table of contents automatically for your notebook.

\`\`\`js
import {toc} from "@mbostock/toc"
\`\`\`

Here’s an example:`
)});
  main.variable(observer()).define(["toc"], function(toc){return(
toc()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Implementation`
)});
  main.variable(observer("toc")).define("toc", ["Generators","html","DOM","MutationObserver"], function(Generators,html,DOM,MutationObserver){return(
function toc(selector = "h1,h2,h3", heading = "<b>Table of Contents</b>") {
  return Generators.observe(notify => {
    let headings = [];

    function observed() {
      const h = Array.from(document.querySelectorAll(selector));
      if (h.length !== headings.length || h.some((h, i) => headings[i] !== h)) {
        notify(html`${heading}<ul>${Array.from(headings = h, h => {
          return Object.assign(
            html`<li><a href=#${h.id}>${DOM.text(h.textContent)}`,
            {onclick: e => (e.preventDefault(), h.scrollIntoView())}
          );
        })}`);
      }
    }

    const observer = new MutationObserver(observed);
    observer.observe(document.body, {childList: true, subtree: true});
    observed();
    return () => observer.disconnect();
  });
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Hooray

It worked!`
)});
  return main;
}

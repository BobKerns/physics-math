// https://observablehq.com/@bobkerns/testing-physics-math@954
import define1 from "./e93997d5089d7165@2264.js";
import define2 from "./10ca265cf0ddc43e@1074.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Testing Physics-Math

This page is a testing page for the Physics Math package I am developing. (Part of a bigger project,
Newton's Spherical Cow).

Repo: https://github.com/BobKerns/physics-math.git \ 
NPM: https://www.npmjs.com/package/@rwk/physics-math \ 
Issues: https://github.com/BobKerns/physics-math/issues \ 
Documentation: [on GitHub](https://bobkerns.github.io/physics-math/docs/v0.1.16/api/index.html) *

  * Documentation before v0.1.16 requires checking out the repo and running a local server.

The current version of this page probably corresponds to work not yet released, so expect errors when running against release versions.
`
)});
  main.variable(observer("viewof VERSION_NAME")).define("viewof VERSION_NAME", ["releases_by_name","select","release_names"], async function(releases_by_name,select,release_names)
{
  const rel = window.location.search;
  const match = /^\?release=([^&]*)/.exec(rel);
  const tag = match && match[1];
  const release = tag && (await releases_by_name[tag]);
  return select({
    value: release ? release.name : release_names[1],
    options: release_names,
    description: "Which release to load, or from localhost?"
  });
}
);
  main.variable(observer("VERSION_NAME")).define("VERSION_NAME", ["Generators", "viewof VERSION_NAME"], (G, _) => G.input(_));
  main.variable(observer("viewof check_release")).define("viewof check_release", ["button"], function(button){return(
button({ value: "Check for new releases" })
)});
  main.variable(observer("check_release")).define("check_release", ["Generators", "viewof check_release"], (G, _) => G.input(_));
  main.variable(observer("viewof reload")).define("viewof reload", ["VERSION","button","md","VERSION_NAME"], function(VERSION,button,md,VERSION_NAME){return(
VERSION === 'localhost'
  ? button({ value: "Reload from Localhost" })
  : ((v = md``) => ((v.value = VERSION_NAME), v))()
)});
  main.variable(observer("reload")).define("reload", ["Generators", "viewof reload"], (G, _) => G.input(_));
  main.variable(observer()).define(["md","VERSION_NAME","LOAD_TIME","LIBRARY_URL","VERSION","PM","releases_by_name","tex"], function(md,VERSION_NAME,LOAD_TIME,LIBRARY_URL,VERSION,PM,releases_by_name,tex){return(
md`## ${VERSION_NAME}

Loaded at ${LOAD_TIME} via:
~~~
  PM = require('${LIBRARY_URL}')
~~~
${
  VERSION.match(/localhost/i)
    ? `${
        typeof PM === 'string'
          ? `<span style='color: red;'>${PM}</span>
`
          : ''
      }
To serve up locally from source:
\`\`\`bash
  git clone https://github.com/BobKerns/physics-math.git
  cd physics-math
  npm install
  npm run serve
\`\`\`
in the top level of the project directory.`
    : releases_by_name[VERSION_NAME].body
        .split(/\s(\$[`‘]?[^$]+[`‘]?\$)\s/)
        .map((k, i) =>
          i % 2 == 1 ? tex`\ ${k.replace(/^\$`?|\`?\$$/g, '')}\ ` : k
        )
}`
)});
  main.variable(observer("viewof TIME")).define("viewof TIME", ["slider","PM","Units"], function(slider,PM,Units){return(
slider({
  min: 0,
  max: 10,
  step: 0.001,
  format: v => PM.constant(v, Units.time).html,
  description: "Time"
})
)});
  main.variable(observer("TIME")).define("TIME", ["Generators", "viewof TIME"], (G, _) => G.input(_));
  main.variable(observer("viewof numberFormat")).define("viewof numberFormat", ["select","STYLES"], function(select,STYLES){return(
select({
  options: [...Object.keys(STYLES).filter(k => k.length > 1)],
  description: `Number format`
})
)});
  main.variable(observer("numberFormat")).define("numberFormat", ["Generators", "viewof numberFormat"], (G, _) => G.input(_));
  main.variable(observer()).define(["PM"], function(PM){return(
PM
)});
  main.variable(observer("Units")).define("Units", ["PM"], function(PM){return(
PM.Units
)});
  main.variable(observer("UNIT_NAMES")).define("UNIT_NAMES", ["Units"], function(Units){return(
Object.keys(Units).map(k => Units[k].symbol || Units[k].name)
)});
  main.variable(observer("WORLD")).define("WORLD", ["PM"], function(PM){return(
new PM.World()
)});
  main.variable(observer("FRAME")).define("FRAME", ["WORLD"], function(WORLD){return(
WORLD.createInertialFrame()
)});
  main.variable(observer()).define(["PM","Units"], function(PM,Units){return(
PM.constant(3, Units.mass).html
)});
  main.variable(observer("viewof G")).define("viewof G", ["PM","Units"], function(PM,Units){return(
new PM.GFunction(t => t, Units.velocity).setName_('f').html
)});
  main.variable(observer("G")).define("G", ["Generators", "viewof G"], (G, _) => G.input(_));
  main.variable(observer()).define(["PM","G","TIME"], function(PM,G,TIME){return(
PM.constant(G.f(TIME), G.unit).html
)});
  main.variable(observer("viewof GPRIME")).define("viewof GPRIME", ["G"], function(G){return(
G.derivative().html
)});
  main.variable(observer("GPRIME")).define("GPRIME", ["Generators", "viewof GPRIME"], (G, _) => G.input(_));
  main.variable(observer("viewof GPRIMEPRIME")).define("viewof GPRIMEPRIME", ["GPRIME"], function(GPRIME){return(
GPRIME.derivative().html
)});
  main.variable(observer("GPRIMEPRIME")).define("GPRIMEPRIME", ["Generators", "viewof GPRIMEPRIME"], (G, _) => G.input(_));
  main.variable(observer("viewof G2")).define("viewof G2", ["G"], function(G){return(
G.integral().html
)});
  main.variable(observer("G2")).define("G2", ["Generators", "viewof G2"], (G, _) => G.input(_));
  main.variable(observer("viewof P1")).define("viewof P1", ["PM","Units"], function(PM,Units){return(
new PM.Poly(Units.power, 0, Math.PI, 1).html
)});
  main.variable(observer("P1")).define("P1", ["Generators", "viewof P1"], (G, _) => G.input(_));
  main.variable(observer("viewof P2")).define("viewof P2", ["PM","Units"], function(PM,Units){return(
new PM.Poly(Units.power, 0.5, Math.PI / 2, 1, 1).html
)});
  main.variable(observer("P2")).define("P2", ["Generators", "viewof P2"], (G, _) => G.input(_));
  main.variable(observer("viewof F")).define("viewof F", ["PM","P1","P2"], function(PM,P1,P2){return(
PM.add(P1, P2).html
)});
  main.variable(observer("F")).define("F", ["Generators", "viewof F"], (G, _) => G.input(_));
  main.variable(observer("viewof Fprime")).define("viewof Fprime", ["F"], function(F){return(
F.derivative().html
)});
  main.variable(observer("Fprime")).define("Fprime", ["Generators", "viewof Fprime"], (G, _) => G.input(_));
  main.variable(observer("viewof F2")).define("viewof F2", ["F"], function(F){return(
F.integral().html
)});
  main.variable(observer("F2")).define("F2", ["Generators", "viewof F2"], (G, _) => G.input(_));
  main.variable(observer("viewof F3")).define("viewof F3", ["F2"], function(F2){return(
F2.integral().html
)});
  main.variable(observer("F3")).define("F3", ["Generators", "viewof F3"], (G, _) => G.input(_));
  main.variable(observer("viewof XF3")).define("viewof XF3", ["F3"], function(F3){return(
F3.from(1 / 2).html
)});
  main.variable(observer("XF3")).define("XF3", ["Generators", "viewof XF3"], (G, _) => G.input(_));
  main.variable(observer()).define(["XF3"], function(XF3){return(
XF3
)});
  main.variable(observer()).define(["PM"], function(PM){return(
PM.INITIAL_STYLE.numberSpecials.get(1.5)
)});
  main.variable(observer()).define(["PM"], function(PM){return(
PM.DEFAULT_STYLE
)});
  main.variable(observer()).define(["Fprime"], function(Fprime){return(
Fprime.tex
)});
  main.variable(observer()).define(["PM","Units"], function(PM,Units){return(
new PM.Poly(Units.length, Math.sqrt(2)).html
)});
  main.variable(observer("viewof PW")).define("viewof PW", ["PM","Units"], function(PM,Units)
{
  const PW = new PM.Piecewise(Units.length, PM.TYPE.SCALAR);
  PW.initial(0);
  PW.at(1, 3, 2, (5 * Math.PI) / 2, 3, 0);
  return PW.html;
}
);
  main.variable(observer("PW")).define("PW", ["Generators", "viewof PW"], (G, _) => G.input(_));
  main.variable(observer()).define(["PW"], function(PW){return(
PW.tex
)});
  main.variable(observer()).define(["tex"], function(tex){return(
tex`{{\left.\begin{cases}0  &\text{\ if\ } &-\infty&<t\le&1\\3.000  &\text{\ if\ } &1&<t\le&2&\\5.000  &\text{\ if\ } &2&<t\le&3&\\0  &\text{\ if\ } &3&<t\le&\infty&\end{cases}\right\}} \Leftarrow {\textcolor{ff0000}{\text{m}}}}`
)});
  main.variable(observer()).define(["PW"], function(PW){return(
PW.derivative().html
)});
  main.variable(observer()).define(["PW"], function(PW){return(
PW.integral().html
)});
  main.variable(observer()).define(["PW"], function(PW){return(
PW.integral()
  .from(0)
  .f(2)
)});
  main.variable(observer()).define(["PM","Units"], function(PM,Units){return(
PM.INITIAL_STYLE.context.unit(Units.velocity)
)});
  main.variable(observer()).define(["tex"], function(tex){return(
tex`{{\left.\begin{cases}0 &{ t  \le 1}\\3.000 &{1 <  t }\end{cases}\right\}} \Rightarrow {\textcolor{ff0000}{\text{m}}}}`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Random trials of stuff`
)});
  main.variable(observer("PX")).define("PX", ["PM","Units"], function(PM,Units){return(
new PM.Piecewise(Units.length, PM.TYPE.SCALAR)
  .add(-100, 3)
  .add(0, 4)
  .add(100, 5)
)});
  main.variable(observer()).define(["PX"], function(PX){return(
PX.functions
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Appendix`
)});
  main.variable(observer("releases")).define("releases", ["check_release"], async function(check_release){return(
(check_release,
await (await fetch(
  'https://api.github.com/repos/BobKerns/physics-math/releases'
)).json())
  .filter(e => e.published_at > '2020-05-19T12:39:22Z')
  .map(r =>
    Object.defineProperty(r, Symbol.toStringTag, {
      get: () => `Release_${r.tag_name}`
    })
  )
)});
  main.variable(observer("releases_by_name")).define("releases_by_name", ["releases"], function(releases){return(
((t = {}) => (
  releases.forEach(k => (t[k.name] = t[k.tag_name] = k)), t
))()
)});
  main.variable(observer("release_names")).define("release_names", ["releases"], function(releases){return(
['localhost', ...releases.map(e => e.name)]
)});
  main.variable(observer("VERSION")).define("VERSION", ["VERSION_NAME","releases_by_name"], function(VERSION_NAME,releases_by_name){return(
VERSION_NAME.match(/localhost/i)
  ? 'localhost'
  : releases_by_name[VERSION_NAME].tag_name.replace(/^v/, '')
)});
  main.variable(observer("LIBRARY_URL")).define("LIBRARY_URL", ["reload","VERSION"], function(reload,VERSION){return(
reload,
VERSION === 'localhost'
  ? `http://localhost:5000/lib/umd/index.js?${Date.now()}`
  : `@rwk/physics-math@${VERSION}/lib/umd/index.js`
)});
  main.variable(observer("LOAD_TIME")).define("LOAD_TIME", ["LIBRARY_URL"], function(LIBRARY_URL){return(
LIBRARY_URL, new Date()
)});
  main.variable(observer("PM")).define("PM", ["glMatrix","reload","require","LIBRARY_URL","tex","VERSION"], async function(glMatrix,reload,require,LIBRARY_URL,tex,VERSION)
{
  glMatrix; // Import it first.
  reload;
  try {
    const PM = await require(LIBRARY_URL);
    PM.URL = LIBRARY_URL;
    PM.setFormatter(tex);
    return PM;
  } catch (e) {
    if (VERSION === 'localhost') {
      try {
        await fetch(LIBRARY_URL, { method: 'HEAD', mode: 'no-cors' });
        return `URL exists but the require encountered an error: ${e.message}`;
      } catch (e) {
        return `The localhost server does not appear to have been started: ${e.message}`;
      }
    }
  }
}
);
  main.variable(observer("glMatrix")).define("glMatrix", async function(){return(
await import('https://unpkg.com/gl-matrix@3.3.0/esm/index.js?module')
)});
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  main.import("select", child1);
  main.import("button", child1);
  const child2 = runtime.module(define2);
  main.import("callSite", child2);
  main.variable(observer("NumberFormats")).define("NumberFormats", ["PM"], function(PM){return(
Object.keys(PM.NumberFormat).filter(v => v.length > 1)
)});
  main.variable(observer("STYLES")).define("STYLES", ["PM"], function(PM)
{
  const obj = {};
  Object.keys(PM.NumberFormat).forEach(
    f => f.length > 1 && (obj[f] = PM.INITIAL_STYLE.set({ numberFormat: f }))
  );
  obj.scientificLoose = PM.INITIAL_STYLE.set({
    numberFormat: 'scientific',
    numberTrimTrailingZero: true
  });
  return obj;
}
);
  main.variable(observer("OSTYLE")).define("OSTYLE", ["PM","STYLES","numberFormat"], function(PM,STYLES,numberFormat){return(
PM.setStyle(STYLES[numberFormat])
)});
  main.variable(observer()).define(["STYLES","numberFormat"], function(STYLES,numberFormat){return(
STYLES[numberFormat]
)});
  main.variable(observer()).define(["OSTYLE","PM"], function(OSTYLE,PM){return(
OSTYLE, new PM.Poly(PM.Units.length, 3783.99).html
)});
  main.variable(observer()).define(["PM"], function(PM){return(
PM.INITIAL_STYLE.context.number(3783.99)
)});
  main.variable(observer()).define(["PM"], function(PM){return(
PM.INITIAL_STYLE.context.exponentStyle
)});
  return main;
}

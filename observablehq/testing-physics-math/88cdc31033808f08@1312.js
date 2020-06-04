// https://observablehq.com/@bobkerns/testing-physics-math@1312
import define1 from "./e93997d5089d7165@2264.js";
import define2 from "./10ca265cf0ddc43e@1074.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md","TAG"], function(md,TAG){return(
md`# Testing Physics-Math

This page is a testing page for the Physics Math package I am developing. (Part of a bigger project,
Newton's Spherical Cow).

Repo: https://github.com/BobKerns/physics-math.git \ 
${TAG} tree: https://github.com/BobKerns/physics-math.git/tree/${TAG}/ \ 
NPM: https://www.npmjs.com/package/@rwk/physics-math \ 
Issues: https://github.com/BobKerns/physics-math/issues \ 
Documentation: [on GitHub](https://bobkerns.github.io/physics-math/docs/${TAG}api/index.html) \ 
ObservableHQ: [Home for this page](https://observablehq.com/@bobkerns/testing-physics-math). [Captured version](https://jsdelivr.com/package/npm/rwk/physics-math@{VERSION}/observablehq/testing-physics-math/) \ 
Local Doc: https://localhost:5000/docs/local/ \ 
Local ObservableHQ: [Read-only copy](http://localhost:5000/observablehq/testing-physics-math/index.html)

The current version of this page probably corresponds to work not yet released, so expect errors when running against release versions. This can be worked around via:
~~~javascript
  isVersion(semverRange)
~~~
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
  main.variable(observer("viewof TIME")).define("viewof TIME", ["slider","constant","Units"], function(slider,constant,Units){return(
slider({
  min: 0,
  max: 10,
  step: 0.001,
  format: v => constant(v, Units.time).html,
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
  main.variable(observer()).define(["md"], function(md){return(
md`### The full module can be inspected here.`
)});
  main.variable(observer()).define(["PM"], function(PM){return(
PM
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### The defined units`
)});
  main.variable(observer("Units")).define("Units", ["PM"], function(PM){return(
PM.Units
)});
  main.variable(observer("viewof sel_unit")).define("viewof sel_unit", ["select","UNIT_NAMES"], function(select,UNIT_NAMES){return(
select({
  options: UNIT_NAMES,
  description: "Select a unit to show below."
})
)});
  main.variable(observer("sel_unit")).define("sel_unit", ["Generators", "viewof sel_unit"], (G, _) => G.input(_));
  main.variable(observer()).define(["getUnit","sel_unit","md","constant"], function(getUnit,sel_unit,md,constant)
{
  const sel = getUnit(sel_unit);
  return md`
* Selected unit name: ${sel.attributes.name || sel.name || sel_unit}
* Selected unit symbol: ${sel.symbol || sel.attributes.symbol || '(none)'}
* Typical variable name: ${sel.varName || sel.attributes.varName || '(none)'}

${
  sel.attributes.si_base
    ? md`* This is a fundamental unit.`
    : md`This is a derived unit = ${constant(...sel.toSI(1)).html}`
}
`;
}
);
  main.variable(observer()).define(["constant","getUnit","sel_unit"], function(constant,getUnit,sel_unit){return(
constant(...getUnit(sel_unit).toSI(1)).html
)});
  main.variable(observer()).define(["getUnit","sel_unit"], function(getUnit,sel_unit){return(
getUnit(sel_unit)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`We can use SI prefixes and do conversions.`
)});
  main.variable(observer()).define(["constant","getUnit"], function(constant,getUnit){return(
constant(...getUnit('mile').toSI(1)).html
)});
  main.variable(observer()).define(["constant","getUnit"], function(constant,getUnit){return(
constant(...getUnit('kilometer').fromSI(...getUnit('mile').toSI(1))).html
)});
  main.variable(observer()).define(["constant","getUnit"], function(constant,getUnit){return(
constant(...getUnit('mile').fromSI(1, getUnit('cm'))).html
)});
  main.variable(observer()).define(["constant"], function(constant){return(
constant.toString()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### The defined unit symbols and names (preferring symbols to names).`
)});
  main.variable(observer("UNIT_NAMES")).define("UNIT_NAMES", ["Units"], function(Units){return(
Object.keys(
  Object.keys(Units).reduce((acc, k) => {
    Units[k].names.forEach(n => (acc[n] = 1));
    return acc;
  }, {})
)
  .filter(k => !!k)
  .sort()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### We will need a World, and at least one InertialFrame within that world.
Note: the World.parentFrame is purely internal—a common point of reference to allow
simpler creation of different frames and simplify transformations between them.

It is not intended to be visible to the user. There is no privileged frame. Any other intertial frame could take its place.`
)});
  main.variable(observer("WORLD")).define("WORLD", ["World"], function(World){return(
new World()
)});
  main.variable(observer("FRAME")).define("FRAME", ["WORLD"], function(WORLD){return(
WORLD.createInertialFrame()
)});
  main.variable(observer()).define(["constant","Units"], function(constant,Units){return(
constant(3, Units.mass).html
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Calculus
Currently, all derivatives and integrations are with respect to time. This will change,
but will probably always be the default.`
)});
  main.variable(observer("viewof G")).define("viewof G", ["isVersion","gFunction","Units","PM"], function(isVersion,gFunction,Units,PM){return(
isVersion('>=0.1.27')
  ? gFunction(Units.velocity, 'f', t => t).html
  : new PM.GFunction(t => t, Units.velocity).setName_('f').htm
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
  main.variable(observer("viewof P1")).define("viewof P1", ["poly","Units"], function(poly,Units){return(
poly(Units.power, 0, Math.PI, 1).html
)});
  main.variable(observer("P1")).define("P1", ["Generators", "viewof P1"], (G, _) => G.input(_));
  main.variable(observer("viewof P2")).define("viewof P2", ["poly","Units"], function(poly,Units){return(
poly(Units.power, 0.5, Math.PI / 2, 1, 1).html
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
  main.variable(observer()).define(["INITIAL_STYLE"], function(INITIAL_STYLE){return(
INITIAL_STYLE.numberSpecials.get(1.5)
)});
  main.variable(observer()).define(["Fprime"], function(Fprime){return(
Fprime.tex
)});
  main.variable(observer()).define(["poly","Units"], function(poly,Units){return(
poly(Units.length, Math.sqrt(2)).html
)});
  main.variable(observer("viewof PW")).define("viewof PW", ["Piecewise","Units","TYPE","isVersion"], function(Piecewise,Units,TYPE,isVersion)
{
  const PW = new Piecewise(Units.length, TYPE.SCALAR);
  PW.initial(0);
  if (isVersion("<0.1.26")) {
    PW.at(1, 3, 2, (5 * Math.PI) / 2, 3, 0);
  } else {
    PW.at([1, 3], [2, (5 * Math.PI) / 2], [3, 0]);
  }
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
[-0.5, 0.5, 1.5, 2.5, 3.5].map(PW.derivative().f)
)});
  main.variable(observer()).define(["PW"], function(PW){return(
PW.integral().html
)});
  main.variable(observer()).define(["PW"], function(PW){return(
[
  PW.integral()
    .from(0)
    .f(2),
  PW.integral()
    .from(0)
    .f(3)
]
)});
  main.variable(observer()).define(["INITIAL_STYLE","Units"], function(INITIAL_STYLE,Units){return(
INITIAL_STYLE.context.unit(Units.velocity)
)});
  main.variable(observer()).define(["tex"], function(tex){return(
tex`{{\left.\begin{cases}0 &{ t  \le 1}\\3.000 &{1 <  t }\end{cases}\right\}} \Rightarrow {\textcolor{ff0000}{\text{m}}}}`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Random trials of stuff`
)});
  main.variable(observer("PX")).define("PX", ["Piecewise","Units","TYPE"], function(Piecewise,Units,TYPE){return(
new Piecewise(Units.length, TYPE.SCALAR)
  .add(-100, 3)
  .add(0, 4)
  .add(100, 5)
)});
  main.variable(observer()).define(["PX"], function(PX){return(
PX.functions
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Appendix

Identify what releases are available, and once one is selected, load it.`
)});
  main.variable(observer("releases")).define("releases", ["check_release"], async function(check_release){return(
(check_release,
await (await fetch(
  'https://api.github.com/repos/BobKerns/physics-math/releases'
)).json())
  .filter(e => e.published_at >= '2020-05-29T18:25:38Z')
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
  main.variable(observer("TAG")).define("TAG", ["VERSION_NAME","releases_by_name"], function(VERSION_NAME,releases_by_name){return(
VERSION_NAME === 'localhost'
  ? undefined
  : releases_by_name[VERSION_NAME].tag_name
)});
  main.variable(observer("VERSION")).define("VERSION", ["TAG"], function(TAG){return(
TAG && TAG.replace(/^v/, '')
)});
  main.variable(observer()).define(["md"], function(md){return(
md`As of 0.1.26, no extra path info is needed beyond "@rwk/physics-math@<version>", e.g.
~~~javascript
    P = require('@rwk/physics-math@0.1.26'); // Or later version
~~~
> (I can't seem to convince the module-require-debugger of that, though!)`
)});
  main.variable(observer("LIBRARY_URL")).define("LIBRARY_URL", ["reload","VERSION","isVersion"], function(reload,VERSION,isVersion){return(
reload,
VERSION === 'localhost'
  ? `http://localhost:5000/lib/umd/index.js?${Date.now()}`
  : isVersion(">=0.1.26")
  ? `@rwk/physics-math@${VERSION}`
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
  main.variable(observer()).define(["md"], function(md){return(
md`### Import the individual items from the module.`
)});
  main.variable(observer("poly")).define("poly", ["isVersion","PM"], function(isVersion,PM){return(
isVersion('>=0.1.27')
  ? PM.poly
  : (units, ...coefficients) => new PM.poly(units, ...coefficients)
)});
  main.variable(observer("gFunction")).define("gFunction", ["isVersion","PM"], function(isVersion,PM){return(
isVersion('>=0.1.27')
  ? PM.gFunction
  : (unit, fn) => new PM.GFunction(unit, fn)
)});
  main.variable(observer("getUnit")).define("getUnit", ["PM"], function(PM){return(
PM.getUnit
)});
  main.variable(observer("constant")).define("constant", ["PM"], function(PM){return(
PM.constant
)});
  main.variable(observer("vector")).define("vector", ["PM"], function(PM){return(
PM.vector
)});
  main.variable(observer("point")).define("point", ["PM"], function(PM){return(
PM.point
)});
  main.variable(observer("rotation")).define("rotation", ["PM"], function(PM){return(
PM.rotation
)});
  main.variable(observer("orientation")).define("orientation", ["PM"], function(PM){return(
PM.orientation
)});
  main.variable(observer("Piecewise")).define("Piecewise", ["PM"], function(PM){return(
PM.Piecewise
)});
  main.variable(observer("add")).define("add", ["PM"], function(PM){return(
PM.add
)});
  main.variable(observer("sub")).define("sub", ["PM"], function(PM){return(
PM.sub
)});
  main.variable(observer("mul")).define("mul", ["PM"], function(PM){return(
PM.mul
)});
  main.variable(observer("equal")).define("equal", ["PM"], function(PM){return(
PM.equal
)});
  main.variable(observer("near")).define("near", ["PM"], function(PM){return(
PM.near
)});
  main.variable(observer("TYPE")).define("TYPE", ["PM"], function(PM){return(
PM.TYPE
)});
  main.variable(observer("datatype")).define("datatype", ["PM"], function(PM){return(
PM.datatype
)});
  main.variable(observer("World")).define("World", ["PM"], function(PM){return(
PM.World
)});
  main.variable(observer("INITIAL_STYLE")).define("INITIAL_STYLE", ["PM"], function(PM){return(
PM.INITIAL_STYLE
)});
  main.variable(observer("NumberFormat")).define("NumberFormat", ["PM"], function(PM){return(
PM.NumberFormat
)});
  main.variable(observer("setStyle")).define("setStyle", ["PM"], function(PM){return(
PM.setStyle
)});
  main.variable(observer("setFormatter")).define("setFormatter", ["PM"], function(PM){return(
PM.setFormatter
)});
  main.variable(observer("colorStyler")).define("colorStyler", ["PM"], function(PM){return(
PM.colorStyler
)});
  main.variable(observer("isUnit")).define("isUnit", ["PM"], function(PM){return(
PM.isUnit
)});
  main.variable(observer("isVector")).define("isVector", ["PM"], function(PM){return(
PM.isVector
)});
  main.variable(observer("isPoint")).define("isPoint", ["PM"], function(PM){return(
PM.isPoint
)});
  main.variable(observer("isRotation")).define("isRotation", ["PM"], function(PM){return(
PM.isRotation
)});
  main.variable(observer("isOrientation")).define("isOrientation", ["PM"], function(PM){return(
PM.isOrientation
)});
  main.variable(observer("isRelative")).define("isRelative", ["PM"], function(PM){return(
PM.isRelative
)});
  main.variable(observer("isScalar")).define("isScalar", ["PM"], function(PM){return(
PM.isScalar
)});
  main.variable(observer("isScalarValue")).define("isScalarValue", ["PM"], function(PM){return(
PM.isScalarValue
)});
  main.variable(observer("isPFunction")).define("isPFunction", ["PM"], function(PM){return(
PM.isPFunction
)});
  main.variable(observer("isPCompiled")).define("isPCompiled", ["PM"], function(PM){return(
PM.isPCompiled
)});
  main.variable(observer("romberg")).define("romberg", ["PM"], function(PM){return(
PM.romberg
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Library imports.`
)});
  main.variable(observer("glMatrix")).define("glMatrix", async function(){return(
await import('https://unpkg.com/gl-matrix@3.3.0/esm/index.js?module')
)});
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  main.import("select", child1);
  main.import("button", child1);
  const child2 = runtime.module(define2);
  main.import("callSite", child2);
  main.variable(observer("semver")).define("semver", ["require"], function(require){return(
require('https://bundle.run/semver@7.3.2')
)});
  main.variable(observer()).define(["md","isVersion"], function(md,isVersion){return(
md`### Predicate to conditionalize on the VERSION.
~~~javascript
isVersion(">=0.1.26"); // => ${isVersion(">=0.1.26")}
isVersion(">=0.1.16"); // => ${isVersion(">=0.1.16")}
isVersion(">=0.2.26"); // => ${isVersion(">=0.2.26")}
~~~`
)});
  main.variable(observer("isVersion")).define("isVersion", ["semver","VERSION"], function(semver,VERSION){return(
range => semver.satisfies(semver.coerce(VERSION), range)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Selectable number formats for our configuration menu.`
)});
  main.variable(observer("NumberFormats")).define("NumberFormats", ["NumberFormat"], function(NumberFormat){return(
Object.keys(NumberFormat).filter(v => v.length > 1)
)});
  main.variable(observer("STYLES")).define("STYLES", ["NumberFormat","INITIAL_STYLE"], function(NumberFormat,INITIAL_STYLE)
{
  const obj = {};
  Object.keys(NumberFormat).forEach(
    f => f.length > 1 && (obj[f] = INITIAL_STYLE.set({ numberFormat: f }))
  );
  obj.scientificLoose = INITIAL_STYLE.set({
    numberFormat: 'scientific',
    numberTrimTrailingZero: true
  });
  return obj;
}
);
  main.variable(observer("STYLE")).define("STYLE", ["STYLES","numberFormat"], function(STYLES,numberFormat){return(
STYLES[numberFormat]
)});
  main.variable(observer("OSTYLE")).define("OSTYLE", ["setStyle","STYLE"], function(setStyle,STYLE){return(
setStyle(STYLE)
)});
  main.variable(observer()).define(["OSTYLE","poly","Units"], function(OSTYLE,poly,Units){return(
OSTYLE, poly(Units.length, 3783.99).html
)});
  main.variable(observer()).define(["INITIAL_STYLE"], function(INITIAL_STYLE){return(
INITIAL_STYLE.context.number(3783.99)
)});
  main.variable(observer()).define(["INITIAL_STYLE"], function(INITIAL_STYLE){return(
INITIAL_STYLE.context.exponentStyle.number(3783.99)
)});
  main.variable(observer()).define(["md"], async function(md){return(
md`### Release Documentation Links
${(await (await fetch(
  'https://api.github.com/repos/BobKerns/physics-math/releases'
)).json())
  .filter(e => e.published_at >= '2020-05-29T18:25:38Z')
  .map(
    r =>
      `* [${r.name}](https://bobkerns.github.io/physics-math/docs/${
        r.tag_name
      }/index.html) ${r.prerelease ? ' (prerelease)' : ''}`
  )
  .join('\n')}`
)});
  return main;
}

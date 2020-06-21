// https://observablehq.com/@anwarhahjjeffersongeorge/code-block-style-picker@139
import define1 from "./37f2e57e1832e1d6@243.js";
import define2 from "./e93997d5089d7165@2264.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md","filelokas"], function(md,filelokas){return(
md`# Code Block Style Picker   

ObservableHQ [dark mode is gone](https://talk.observablehq.com/t/feature-unannouncement-dark-mode/1440), but that doesn't mean one can't use themeing on code blocks.  

This notebook grabs one of the official themes from the [observablehq fork of the highlightjs repo](https://github.com/observablehq/highlight.js/tree/master/src/styles) as of Tue Feb 18 2020 03:17:58 GMT-0800 (Pacific Standard Time). The \`codestyler\` cell (click to expand the \`style\` tag below the picker) then applies the chosen style.  

Pick a style from the chooser below to see how they look on the code that follows. To see what it looks like normally, pick the option ${filelokas.nostylestring}

To apply one of these styles in your own notebook, do

~~~ javascript
import {applyHljsStyle} from '@anwarhahjjeffersongeorge/code-block-style-picker'
~~~

and 

~~~ javascript
applyHljsStyle("a filename without .css") // only works with supported styles
~~~

`
)});
  main.variable(observer("viewof styleselected")).define("viewof styleselected", ["filelokas","select","superofficialhljsstylelist"], function(filelokas,select,superofficialhljsstylelist)
{
  const {nostylesymbol, nostylestring} = filelokas
  
  return select({
    description: "Pick a supported HLJS style",
    options: superofficialhljsstylelist.map(s => s === nostylesymbol ? nostylestring : s),
    value: 'ir-black'
  })
}
);
  main.variable(observer("styleselected")).define("styleselected", ["Generators", "viewof styleselected"], (G, _) => G.input(_));
  main.variable(observer("codestyler")).define("codestyler", ["html","styleselected","filelokas"], async function(html,styleselected,filelokas)
{
  return html`<style>${
    (styleselected === filelokas.nostylestring) 
    ? '/* no highlightjs style selected*/ blah'
    : await fetch(filelokas.format(styleselected))
      .then(r => r.text())
  }</style>`
}
);
  main.variable(observer()).define(["md","makeCodeBlockFromURL"], async function(md,makeCodeBlockFromURL){return(
md`${await makeCodeBlockFromURL('https://gist.githubusercontent.com/anwarhahjjeffersongeorge/e80c52c1d5e105af32bb16d55a12c404/raw/fa987cddb4f08bf7a8297d4cb4397e3a4ae3670c/testtimesleep.py')}`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Which Styles Are Valid?

Clone the \`highlightjs\` repo. Then, go into the repo folder from a command line, and type the following command  to list the .css files in comma-separated format, remove the directory name and file extension, and surround each item in quotes:

~~~ bash
ls -m src/styles/*.css | sed -E s/'(src\/styles\/|.css)'/\'/g
~~~

This command was for BSD. Note that you might need to replace the \`-E\` option with an \`-r\` (or something) in GNU to get extended regular expression format.

After that, just-copy paste the \`superofficialhljsstlelist\` below in the internal \`res\` variable...This method means that if the highlightjs team decides to remove support for certain styles in the future, those styles won't work, so it's important to include some filtering to be sure the notebook doesn't try to [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) style files that don't exist.
 `
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# What If I Want to Use a Style in My Notebook?

  Just import the \`applyHljsStyle\` function. It accepts one parameter, which should be the name of the  official highlightjs stylesheet in question without the '.css' extension. It will only work with the ones in the \`superofficialhljsstlelist\` contained in this notebook.
`
)});
  main.variable(observer("applyHljsStyle")).define("applyHljsStyle", ["html","superofficialhljsstylelist","filelokas"], function(html,superofficialhljsstylelist,filelokas){return(
async function applyHljsStyle (stylename) {
 return html`<style>${ 
    (!superofficialhljsstylelist.includes(stylename)) 
    ? '/* no highlightjs style selected (chosen stylesheet wasn\'t valid\')*/'
    : await fetch(filelokas.format(stylename))
      .then(r => r.text())
  }</style>`
}
)});
  main.variable(observer("superofficialhljsstylelist")).define("superofficialhljsstylelist", ["filelokas","XMLHttpRequest"], function(filelokas,XMLHttpRequest)
{
  const {format, nostylesymbol} = filelokas
  const res = [
    nostylesymbol, // it's to know whether no style is selected without running into same-name problems
    ...[
      'a11y-dark', 'a11y-light', 'agate', 
      'an-old-hope', 'androidstudio', 
      'arduino-light', 'arta', 'ascetic', 
      'atelier-cave-dark', 'atelier-cave-light', 
      'atelier-dune-dark', 'atelier-dune-light', 
      'atelier-estuary-dark', 'atelier-estuary-light', 
      'atelier-forest-dark', 'atelier-forest-light', 
      'atelier-heath-dark', 'atelier-heath-light', 
      'atelier-lakeside-dark', 'atelier-lakeside-light', 
      'atelier-plateau-dark', 'atelier-plateau-light', 
      'atelier-savanna-dark', 'atelier-savanna-light', 
      'atelier-seaside-dark', 'atelier-seaside-light', 
      'atelier-sulphurpool-dark', 
      'atelier-sulphurpool-light', 
      'atom-one-dark-reasonable', 'atom-one-dark', 
      'atom-one-light', 'brown-paper', 
      'codepen-embed', 'color-brewer', 
      'darcula', 'dark', 'default', 
      'docco', 'dracula', 'far', 
      'foundation', 'github-gist', 'github', 
      'gml', 'googlecode', 'gradient-dark', 
      'grayscale', 'gruvbox-dark', 
      'gruvbox-light', 'hopscotch', 'hybrid', 
      'idea', 'ir-black', 'isbl-editor-dark', 
      'isbl-editor-light', 'kimbie.dark', 
      'kimbie.light', 'lightfair', 'magula', 
      'mono-blue', 'monokai-sublime', 
      'monokai', 'night-owl', 'nord', 
      'obsidian', 'ocean', 'paraiso-dark', 
      'paraiso-light', 'pojoaque', 
      'purebasic', 'qtcreator_dark', 
      'qtcreator_light', 'railscasts', 
      'rainbow', 'routeros', 'school-book', 
      'shades-of-purple', 'solarized-dark', 
      'solarized-light', 'sunburst', 
      'tomorrow-night-blue', 'tomorrow-night-bright', 
      'tomorrow-night-eighties', 'tomorrow-night', 
      'tomorrow', 'vs', 'vs2015', 
      'xcode', 'xt256', 'zenburn'
    ]
    .filter(async function filecheck (n) {
      // using XMLHttpRequest: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
      // check that the file exists in the specified location
      // console.log(format(n))
      const xhr = new XMLHttpRequest()
      xhr.open('HEAD', format(n), true)
      await xhr.send()
      return xhr.status === 200
    })]
  return res
}
);
  main.variable(observer("filelokas")).define("filelokas", function()
{
  const prefix = 'https://raw.githubusercontent.com/observablehq/highlight.js/master/src/styles/'
  const suffix = '.css'
  const nostylesymbol = Symbol('nostyle')
  const nostylestring = `APPLY NO STYLE, FIEND!`
  return {
    prefix, suffix, nostylesymbol, nostylestring,
    format: (n) => `${prefix}${n}${suffix}`
  }
}
);
  const child1 = runtime.module(define1);
  main.import("makeCodeBlockFromURL", child1);
  const child2 = runtime.module(define2);
  main.import("select", child2);
  return main;
}

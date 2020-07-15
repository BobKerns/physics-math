// https://observablehq.com/@anwarhahjjeffersongeorge/makecodeblockfromurl@243
import define1 from "./4e8bebdde0debc65@139.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# \`makeCodeBlockFromURL\`  

Hey, you want to include some example code in an Observable notebook without typing it all? You already did all of that typing before, so why do it again?

The function \`makeCodeBlockFromURL\` can
- Fetch some code from a place like GitHub or other given URL,
- Try to tell what kind of file it is for displaying the code with syntax highlighting, but only for a few languages right now...if you can tell me where Observable gets its list of syntax highlighting styles from, then I can add more,
- Output a Markdown-formatted code block for displaying in an Observable notebook, 
- Display an optional header of level H1 - H6, and
- Accept a custom title text.


This is a convenience for displaying some code from someurl in Observable with the one-line syntax:

\`\`\`javascript
\$\{await makeCodeBlockFromURL(someurl, 4, 'Myspecialtitle')\}
\`\`\`

### Here are some test urls to try it out with:
`
)});
  main.variable(observer("testurls")).define("testurls", function()
{
  return {
    javascript: 'https://raw.githubusercontent.com/anwarhahjjeffersongeorge/mygeojson/master/getGeoJSON.mjs',
    python: 'https://gist.githubusercontent.com/anwarhahjjeffersongeorge/e80c52c1d5e105af32bb16d55a12c404/raw/e936a3b942bfb3bd742295f06f276ebdb41c7d2a/testtimesleep.py',
    bash: 'https://gist.githubusercontent.com/anwarhahjjeffersongeorge/5c5f9b8c9ed240c7f421df92fb583097/raw/a96a8c6b14421ee84efc8773102e984bd0a2f2d2/pwmaudio.sh'
  }
}
);
  main.variable(observer()).define(["md","makeCodeBlockFromURL","testurls"], async function(md,makeCodeBlockFromURL,testurls){return(
md` ## Here's how those test urls look when rendered  

### A Javascript file  
${await makeCodeBlockFromURL(testurls.javascript, 4)}
--------------

### A Python file
${await makeCodeBlockFromURL(testurls.python, 4)}

--------------
### A bash script
${await makeCodeBlockFromURL(testurls.bash, 4, 'This title has been overriden')}
`
)});
  main.variable(observer("makeCodeBlockFromURL")).define("makeCodeBlockFromURL", ["analyzeCodeFromURL","formatAnalyzedCode"], function(analyzeCodeFromURL,formatAnalyzedCode){return(
async function makeCodeBlockFromURL(url, titleLevel=0, titleText=url) {
  return analyzeCodeFromURL(url)
    .then(analysis => formatAnalyzedCode(analysis, {
      titleLevel, titleText, url
    }))
    .then(({codeAsMD}) => codeAsMD )
  
  //const arr = somecode.split('\n')
  //return arr.map((v, i) => v.padStart(padding))
}
)});
  main.variable(observer("formatAnalyzedCode")).define("formatAnalyzedCode", ["codeformatting"], function(codeformatting){return(
async function formatAnalyzedCode(analysis, formattinginfo) {
  let { titleLevel, titleText, url } = formattinginfo
  titleLevel = titleLevel || 0
  titleText = titleText || url
  const {codedelimiter, mdlineterminator, codeexts, maxheadinglevel, headingchar} = codeformatting

  return new Promise((resolve, reject) => {
    // console.log(codedelimiter)
    analysis.textarr.push(`${codedelimiter}`)
    analysis.textarr.unshift(`${codedelimiter}${analysis.codetypename}`) 
    if( titleLevel > 0){
      if (titleLevel > maxheadinglevel) {
        titleLevel = maxheadinglevel
      }
      let title = [
        `${Array(titleLevel).fill(headingchar).join('')} `,
        `[${titleText}](${url})`,
        mdlineterminator
      ].join('')

      analysis.textarr.unshift(title)
    }
    resolve({
      ...analysis,
      codeAsMD: analysis.textarr.join(mdlineterminator)
    })
  })  
}
)});
  main.variable(observer("analyzeCodeFromURL")).define("analyzeCodeFromURL", ["codeformatting"], function(codeformatting){return(
async function analyzeCodeFromURL(url) {
   const { codeexts } = codeformatting
  // console.log(codedelimiter)
  const ext = url.split('.').pop()
  let codetypename = '' 
  for (let key in codeexts) {
    if (codeexts[key].includes(ext) ) {
      codetypename = key
      break
    }
  }
  
  return fetch(url)
    .then(res => res.text())
    .then(text => {
      const textarr = text.split(/\r\n|\r|\n/) 
      
      return {
        codetypename,
        textarr
      }
    })
}
)});
  main.variable(observer()).define(["applyHljsStyle"], function(applyHljsStyle){return(
applyHljsStyle('gml')
)});
  const child1 = runtime.module(define1);
  main.import("applyHljsStyle", child1);
  main.variable(observer("codeformatting")).define("codeformatting", function()
{
  return {
    mdlineterminator: '  \n', // TWO (2) spaces and newlinecinematmnt
    codedelimiter: "\`\`\`",
    codeexts: { // this is for syntax highlighting but idk if it will work
      javascript: ['mjs', 'ejs', 'js', 'jscad'],
      typescript: ['ts'],
      openscad: ['scad'],
      processing: ['pde'],
      arduino: ['ino'],
      c: ['c', 'h'],
      cpp: ['cpp', 'hpp', 'cxx', 'hxx'],
      bash: ['sh'],
      python: ['py'],
    },
    headingchar: "#",
    maxheadinglevel: 6
  }
}
);
  return main;
}

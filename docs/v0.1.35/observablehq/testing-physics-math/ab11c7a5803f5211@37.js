// https://observablehq.com/@bobkerns/ramda-aux@37
import define1 from "./b137f8744e597a90@743.js";
import define2 from "./85d26fc84cb319f4@5783.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Ramda-Aux
Additional utilities around Ramda. See [@bobkerns/ramda-0-25](@bobkerns/ramda-0-25)`
)});
  main.variable(observer("viewof mergeAllDeepRight")).define("viewof mergeAllDeepRight", ["def","unapply","reduce","mergeDeepRight"], function(def,unapply,reduce,mergeDeepRight){return(
def`function mergeAllDeepRight(...Objects):
Merge all of the arguments from the right.`(unapply(reduce(mergeDeepRight, {})))
)});
  main.variable(observer("mergeAllDeepRight")).define("mergeAllDeepRight", ["Generators", "viewof mergeAllDeepRight"], (G, _) => G.input(_));
  main.variable(observer("viewof mergeAllWith")).define("viewof mergeAllWith", ["def","unapply","reduce","mergeWith"], function(def,unapply,reduce,mergeWith){return(
def`function mergeAllWith(withFn)(...objects):
Merge all of the objects using the supplied merge function \`withFn\`.`(
  withFn => unapply(reduce(mergeWith(withFn), {}))
)
)});
  main.variable(observer("mergeAllWith")).define("mergeAllWith", ["Generators", "viewof mergeAllWith"], (G, _) => G.input(_));
  main.variable(observer("viewof log")).define("viewof log", ["def"], function(def){return(
def`function log(tag)(arg, ...args) => arg:
* \`tag\`: A string to tag log entries for this logger
* \`arg\`: The first value to be logged. This will also be the return value.
* \`args\`: Additional values to be logged.
`(tag => (arg, ...args) => (console.log(tag, arg, ...args), arg))
)});
  main.variable(observer("log")).define("log", ["Generators", "viewof log"], (G, _) => G.input(_));
  main.variable(observer("viewof nonNil")).define("viewof nonNil", ["def","compose","not","isNil"], function(def,compose,not,isNil){return(
def`function nonNil(val):
return true if the value is not \`null\` or \`undefined\`.
`(
  compose(
    not,
    isNil
  )
)
)});
  main.variable(observer("nonNil")).define("nonNil", ["Generators", "viewof nonNil"], (G, _) => G.input(_));
  const child1 = runtime.module(define1);
  main.import("compose", child1);
  main.import("isNil", child1);
  main.import("mergeDeepRight", child1);
  main.import("mergeWith", child1);
  main.import("not", child1);
  main.import("reduce", child1);
  main.import("unapply", child1);
  const child2 = runtime.module(define2);
  main.import("def", child2);
  return main;
}

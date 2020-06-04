// https://observablehq.com/@bobkerns/ramda-0-25@743
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Ramda 0.25
Ramda 0.26 and 0.26.1 can't be loaded because of a conflict with thennables, and even if it could be, it's a pain to import specific functions if you want to avoid \`R.\` all over the place. This gives you the option of importing via
>\`\`\`javascript
import {negate, curry, filter} from '@bobkerns/ramda-0-25';
\`\`\`
`
)});
  main.variable(observer("R")).define("R", ["require"], function(require){return(
require('ramda@0.25')
)});
  main.variable(observer("__")).define("__", ["R"], function(R){return(
R.__
)});
  main.variable(observer("add")).define("add", ["R"], function(R){return(
R.add
)});
  main.variable(observer("addIndex")).define("addIndex", ["R"], function(R){return(
R.addIndex
)});
  main.variable(observer("adjust")).define("adjust", ["R"], function(R){return(
R.adjust
)});
  main.variable(observer("all")).define("all", ["R"], function(R){return(
R.all
)});
  main.variable(observer("allPass")).define("allPass", ["R"], function(R){return(
R.allPass
)});
  main.variable(observer("always")).define("always", ["R"], function(R){return(
R.always
)});
  main.variable(observer("and")).define("and", ["R"], function(R){return(
R.and
)});
  main.variable(observer("any")).define("any", ["R"], function(R){return(
R.any
)});
  main.variable(observer("anyPass")).define("anyPass", ["R"], function(R){return(
R.anyPass
)});
  main.variable(observer("ap")).define("ap", ["R"], function(R){return(
R.ap
)});
  main.variable(observer("aperture")).define("aperture", ["R"], function(R){return(
R.aperture
)});
  main.variable(observer("append")).define("append", ["R"], function(R){return(
R.append
)});
  main.variable(observer("apply")).define("apply", ["R"], function(R){return(
R.apply
)});
  main.variable(observer("applySpec")).define("applySpec", ["R"], function(R){return(
R.applySpec
)});
  main.variable(observer("assoc")).define("assoc", ["R"], function(R){return(
R.assoc
)});
  main.variable(observer("assocPath")).define("assocPath", ["R"], function(R){return(
R.assocPath
)});
  main.variable(observer("binary")).define("binary", ["R"], function(R){return(
R.binary
)});
  main.variable(observer("bind")).define("bind", ["R"], function(R){return(
R.bind
)});
  main.variable(observer("both")).define("both", ["R"], function(R){return(
R.both
)});
  main.variable(observer("call")).define("call", ["R"], function(R){return(
R.call
)});
  main.variable(observer("chain")).define("chain", ["R"], function(R){return(
R.chain
)});
  main.variable(observer("clamp")).define("clamp", ["R"], function(R){return(
R.clamp
)});
  main.variable(observer("clone")).define("clone", ["R"], function(R){return(
R.clone
)});
  main.variable(observer("comparator")).define("comparator", ["R"], function(R){return(
R.comparator
)});
  main.variable(observer("complement")).define("complement", ["R"], function(R){return(
R.complement
)});
  main.variable(observer("compose")).define("compose", ["R"], function(R){return(
R.compose
)});
  main.variable(observer("composeK")).define("composeK", ["R"], function(R){return(
R.composeK
)});
  main.variable(observer("composeP")).define("composeP", ["R"], function(R){return(
R.composeP
)});
  main.variable(observer("concat")).define("concat", ["R"], function(R){return(
R.concat
)});
  main.variable(observer("cond")).define("cond", ["R"], function(R){return(
R.cond
)});
  main.variable(observer("construct")).define("construct", ["R"], function(R){return(
R.construct
)});
  main.variable(observer("constructN")).define("constructN", ["R"], function(R){return(
R.constructN
)});
  main.variable(observer("contains")).define("contains", ["R"], function(R){return(
R.contains
)});
  main.variable(observer("converge")).define("converge", ["R"], function(R){return(
R.converge
)});
  main.variable(observer("countBy")).define("countBy", ["R"], function(R){return(
R.countBy
)});
  main.variable(observer("curry")).define("curry", ["R"], function(R){return(
R.curry
)});
  main.variable(observer("curryN")).define("curryN", ["R"], function(R){return(
R.curryN
)});
  main.variable(observer("dec")).define("dec", ["R"], function(R){return(
R.dec
)});
  main.variable(observer("defaultTo")).define("defaultTo", ["R"], function(R){return(
R.defaultTo
)});
  main.variable(observer("difference")).define("difference", ["R"], function(R){return(
R.difference
)});
  main.variable(observer("differenceWith")).define("differenceWith", ["R"], function(R){return(
R.differenceWith
)});
  main.variable(observer("dissoc")).define("dissoc", ["R"], function(R){return(
R.dissoc
)});
  main.variable(observer("dissocPath")).define("dissocPath", ["R"], function(R){return(
R.dissocPath
)});
  main.variable(observer("divide")).define("divide", ["R"], function(R){return(
R.divide
)});
  main.variable(observer("drop")).define("drop", ["R"], function(R){return(
R.drop
)});
  main.variable(observer("dropLast")).define("dropLast", ["R"], function(R){return(
R.dropLast
)});
  main.variable(observer("dropLastWhile")).define("dropLastWhile", ["R"], function(R){return(
R.dropLastWhile
)});
  main.variable(observer("dropRepeats")).define("dropRepeats", ["R"], function(R){return(
R.dropRepeats
)});
  main.variable(observer("dropRepeatsWith")).define("dropRepeatsWith", ["R"], function(R){return(
R.dropRepeatsWith
)});
  main.variable(observer("dropWhile")).define("dropWhile", ["R"], function(R){return(
R.dropWhile
)});
  main.variable(observer("either")).define("either", ["R"], function(R){return(
R.either
)});
  main.variable(observer("empty")).define("empty", ["R"], function(R){return(
R.empty
)});
  main.variable(observer("eqBy")).define("eqBy", ["R"], function(R){return(
R.eqBy
)});
  main.variable(observer("eqProps")).define("eqProps", ["R"], function(R){return(
R.eqProps
)});
  main.variable(observer("equals")).define("equals", ["R"], function(R){return(
R.equals
)});
  main.variable(observer("evolve")).define("evolve", ["R"], function(R){return(
R.evolve
)});
  main.variable(observer("F")).define("F", ["R"], function(R){return(
R.F
)});
  main.variable(observer("filter")).define("filter", ["R"], function(R){return(
R.filter
)});
  main.variable(observer("find")).define("find", ["R"], function(R){return(
R.find
)});
  main.variable(observer("findIndex")).define("findIndex", ["R"], function(R){return(
R.findIndex
)});
  main.variable(observer("findLast")).define("findLast", ["R"], function(R){return(
R.findLast
)});
  main.variable(observer("findLastIndex")).define("findLastIndex", ["R"], function(R){return(
R.findLastIndex
)});
  main.variable(observer("flatten")).define("flatten", ["R"], function(R){return(
R.flatten
)});
  main.variable(observer("flip")).define("flip", ["R"], function(R){return(
R.flip
)});
  main.variable(observer("forEach")).define("forEach", ["R"], function(R){return(
R.forEach
)});
  main.variable(observer("fromPairs")).define("fromPairs", ["R"], function(R){return(
R.fromPairs
)});
  main.variable(observer("groupBy")).define("groupBy", ["R"], function(R){return(
R.groupBy
)});
  main.variable(observer("groupWith")).define("groupWith", ["R"], function(R){return(
R.groupWith
)});
  main.variable(observer("gt")).define("gt", ["R"], function(R){return(
R.gt
)});
  main.variable(observer("gte")).define("gte", ["R"], function(R){return(
R.gte
)});
  main.variable(observer("has")).define("has", ["R"], function(R){return(
R.has
)});
  main.variable(observer("hasIn")).define("hasIn", ["R"], function(R){return(
R.hasIn
)});
  main.variable(observer("head")).define("head", ["R"], function(R){return(
R.head
)});
  main.variable(observer("identical")).define("identical", ["R"], function(R){return(
R.identical
)});
  main.variable(observer("identity")).define("identity", ["R"], function(R){return(
R.identity
)});
  main.variable(observer("ifElse")).define("ifElse", ["R"], function(R){return(
R.ifElse
)});
  main.variable(observer("inc")).define("inc", ["R"], function(R){return(
R.inc
)});
  main.variable(observer("indexBy")).define("indexBy", ["R"], function(R){return(
R.indexBy
)});
  main.variable(observer("indexOf")).define("indexOf", ["R"], function(R){return(
R.indexOf
)});
  main.variable(observer("init")).define("init", ["R"], function(R){return(
R.init
)});
  main.variable(observer("insert")).define("insert", ["R"], function(R){return(
R.insert
)});
  main.variable(observer("insertAll")).define("insertAll", ["R"], function(R){return(
R.insertAll
)});
  main.variable(observer("intersection")).define("intersection", ["R"], function(R){return(
R.intersection
)});
  main.variable(observer("intersperse")).define("intersperse", ["R"], function(R){return(
R.intersperse
)});
  main.variable(observer("into")).define("into", ["R"], function(R){return(
R.into
)});
  main.variable(observer("invert")).define("invert", ["R"], function(R){return(
R.invert
)});
  main.variable(observer("invertObj")).define("invertObj", ["R"], function(R){return(
R.invertObj
)});
  main.variable(observer("invoker")).define("invoker", ["R"], function(R){return(
R.invoker
)});
  main.variable(observer("is")).define("is", ["R"], function(R){return(
R.is
)});
  main.variable(observer("isEmpty")).define("isEmpty", ["R"], function(R){return(
R.isEmpty
)});
  main.variable(observer("isNil")).define("isNil", ["R"], function(R){return(
R.isNil
)});
  main.variable(observer("join")).define("join", ["R"], function(R){return(
R.join
)});
  main.variable(observer("juxt")).define("juxt", ["R"], function(R){return(
R.juxt
)});
  main.variable(observer("keys")).define("keys", ["R"], function(R){return(
R.keys
)});
  main.variable(observer("keysIn")).define("keysIn", ["R"], function(R){return(
R.keysIn
)});
  main.variable(observer("last")).define("last", ["R"], function(R){return(
R.last
)});
  main.variable(observer("lastIndexOf")).define("lastIndexOf", ["R"], function(R){return(
R.lastIndexOf
)});
  main.variable(observer("length")).define("length", ["R"], function(R){return(
R.length
)});
  main.variable(observer("lens")).define("lens", ["R"], function(R){return(
R.lens
)});
  main.variable(observer("lensIndex")).define("lensIndex", ["R"], function(R){return(
R.lensIndex
)});
  main.variable(observer("lensPath")).define("lensPath", ["R"], function(R){return(
R.lensPath
)});
  main.variable(observer("lensProp")).define("lensProp", ["R"], function(R){return(
R.lensProp
)});
  main.variable(observer("lift")).define("lift", ["R"], function(R){return(
R.lift
)});
  main.variable(observer("liftN")).define("liftN", ["R"], function(R){return(
R.liftN
)});
  main.variable(observer("lt")).define("lt", ["R"], function(R){return(
R.lt
)});
  main.variable(observer("lte")).define("lte", ["R"], function(R){return(
R.lte
)});
  main.variable(observer("map")).define("map", ["R"], function(R){return(
R.map
)});
  main.variable(observer("mapAccum")).define("mapAccum", ["R"], function(R){return(
R.mapAccum
)});
  main.variable(observer("mapAccumRight")).define("mapAccumRight", ["R"], function(R){return(
R.mapAccumRight
)});
  main.variable(observer("mapObjIndexed")).define("mapObjIndexed", ["R"], function(R){return(
R.mapObjIndexed
)});
  main.variable(observer("match")).define("match", ["R"], function(R){return(
R.match
)});
  main.variable(observer("mathMod")).define("mathMod", ["R"], function(R){return(
R.mathMod
)});
  main.variable(observer("max")).define("max", ["R"], function(R){return(
R.max
)});
  main.variable(observer("maxBy")).define("maxBy", ["R"], function(R){return(
R.maxBy
)});
  main.variable(observer("mean")).define("mean", ["R"], function(R){return(
R.mean
)});
  main.variable(observer("median")).define("median", ["R"], function(R){return(
R.median
)});
  main.variable(observer("memoize")).define("memoize", ["R"], function(R){return(
R.memoize
)});
  main.variable(observer("merge")).define("merge", ["R"], function(R){return(
R.merge
)});
  main.variable(observer("mergeAll")).define("mergeAll", ["R"], function(R){return(
R.mergeAll
)});
  main.variable(observer("mergeDeepLeft")).define("mergeDeepLeft", ["R"], function(R){return(
R.mergeDeepLeft
)});
  main.variable(observer("mergeDeepRight")).define("mergeDeepRight", ["R"], function(R){return(
R.mergeDeepRight
)});
  main.variable(observer("mergeDeepWith")).define("mergeDeepWith", ["R"], function(R){return(
R.mergeDeepWith
)});
  main.variable(observer("mergeDeepWithKey")).define("mergeDeepWithKey", ["R"], function(R){return(
R.mergeDeepWithKey
)});
  main.variable(observer("mergeWith")).define("mergeWith", ["R"], function(R){return(
R.mergeWith
)});
  main.variable(observer("mergeWithKey")).define("mergeWithKey", ["R"], function(R){return(
R.mergeWithKey
)});
  main.variable(observer("min")).define("min", ["R"], function(R){return(
R.min
)});
  main.variable(observer("minBy")).define("minBy", ["R"], function(R){return(
R.minBy
)});
  main.variable(observer("modulo")).define("modulo", ["R"], function(R){return(
R.modulo
)});
  main.variable(observer("multiply")).define("multiply", ["R"], function(R){return(
R.multiply
)});
  main.variable(observer("nAry")).define("nAry", ["R"], function(R){return(
R.nAry
)});
  main.variable(observer("negate")).define("negate", ["R"], function(R){return(
R.negate
)});
  main.variable(observer("none")).define("none", ["R"], function(R){return(
R.none
)});
  main.variable(observer("not")).define("not", ["R"], function(R){return(
R.not
)});
  main.variable(observer("nth")).define("nth", ["R"], function(R){return(
R.nth
)});
  main.variable(observer("nthArg")).define("nthArg", ["R"], function(R){return(
R.nthArg
)});
  main.variable(observer("objOf")).define("objOf", ["R"], function(R){return(
R.objOf
)});
  main.variable(observer("of")).define("of", ["R"], function(R){return(
R.of
)});
  main.variable(observer("omit")).define("omit", ["R"], function(R){return(
R.omit
)});
  main.variable(observer("once")).define("once", ["R"], function(R){return(
R.once
)});
  main.variable(observer("or")).define("or", ["R"], function(R){return(
R.or
)});
  main.variable(observer("over")).define("over", ["R"], function(R){return(
R.over
)});
  main.variable(observer("pair")).define("pair", ["R"], function(R){return(
R.pair
)});
  main.variable(observer("partial")).define("partial", ["R"], function(R){return(
R.partial
)});
  main.variable(observer("partialRight")).define("partialRight", ["R"], function(R){return(
R.partialRight
)});
  main.variable(observer("partition")).define("partition", ["R"], function(R){return(
R.partition
)});
  main.variable(observer("path")).define("path", ["R"], function(R){return(
R.path
)});
  main.variable(observer("pathEq")).define("pathEq", ["R"], function(R){return(
R.pathEq
)});
  main.variable(observer("pathOr")).define("pathOr", ["R"], function(R){return(
R.pathOr
)});
  main.variable(observer("pathSatisfies")).define("pathSatisfies", ["R"], function(R){return(
R.pathSatisfies
)});
  main.variable(observer("pick")).define("pick", ["R"], function(R){return(
R.pick
)});
  main.variable(observer("pickAll")).define("pickAll", ["R"], function(R){return(
R.pickAll
)});
  main.variable(observer("pickBy")).define("pickBy", ["R"], function(R){return(
R.pickBy
)});
  main.variable(observer("pipe")).define("pipe", ["R"], function(R){return(
R.pipe
)});
  main.variable(observer("pipeK")).define("pipeK", ["R"], function(R){return(
R.pipeK
)});
  main.variable(observer("pipeP")).define("pipeP", ["R"], function(R){return(
R.pipeP
)});
  main.variable(observer("pluck")).define("pluck", ["R"], function(R){return(
R.pluck
)});
  main.variable(observer("prepend")).define("prepend", ["R"], function(R){return(
R.prepend
)});
  main.variable(observer("product")).define("product", ["R"], function(R){return(
R.product
)});
  main.variable(observer("project")).define("project", ["R"], function(R){return(
R.project
)});
  main.variable(observer("prop")).define("prop", ["R"], function(R){return(
R.prop
)});
  main.variable(observer("propEq")).define("propEq", ["R"], function(R){return(
R.propEq
)});
  main.variable(observer("propIs")).define("propIs", ["R"], function(R){return(
R.propIs
)});
  main.variable(observer("propOr")).define("propOr", ["R"], function(R){return(
R.propOr
)});
  main.variable(observer("props")).define("props", ["R"], function(R){return(
R.props
)});
  main.variable(observer("propSatisfies")).define("propSatisfies", ["R"], function(R){return(
R.propSatisfies
)});
  main.variable(observer("range")).define("range", ["R"], function(R){return(
R.range
)});
  main.variable(observer("reduce")).define("reduce", ["R"], function(R){return(
R.reduce
)});
  main.variable(observer("reduceBy")).define("reduceBy", ["R"], function(R){return(
R.reduceBy
)});
  main.variable(observer("reduced")).define("reduced", ["R"], function(R){return(
R.reduced
)});
  main.variable(observer("reduceRight")).define("reduceRight", ["R"], function(R){return(
R.reduceRight
)});
  main.variable(observer("reject")).define("reject", ["R"], function(R){return(
R.reject
)});
  main.variable(observer("remove")).define("remove", ["R"], function(R){return(
R.remove
)});
  main.variable(observer("repeat")).define("repeat", ["R"], function(R){return(
R.repeat
)});
  main.variable(observer("replace")).define("replace", ["R"], function(R){return(
R.replace
)});
  main.variable(observer("reverse")).define("reverse", ["R"], function(R){return(
R.reverse
)});
  main.variable(observer("scan")).define("scan", ["R"], function(R){return(
R.scan
)});
  main.variable(observer("sequence")).define("sequence", ["R"], function(R){return(
R.sequence
)});
  main.variable(observer("set")).define("set", ["R"], function(R){return(
R.set
)});
  main.variable(observer("slice")).define("slice", ["R"], function(R){return(
R.slice
)});
  main.variable(observer("sort")).define("sort", ["R"], function(R){return(
R.sort
)});
  main.variable(observer("sortBy")).define("sortBy", ["R"], function(R){return(
R.sortBy
)});
  main.variable(observer("split")).define("split", ["R"], function(R){return(
R.split
)});
  main.variable(observer("splitAt")).define("splitAt", ["R"], function(R){return(
R.splitAt
)});
  main.variable(observer("splitEvery")).define("splitEvery", ["R"], function(R){return(
R.splitEvery
)});
  main.variable(observer("splitWhen")).define("splitWhen", ["R"], function(R){return(
R.splitWhen
)});
  main.variable(observer("subtract")).define("subtract", ["R"], function(R){return(
R.subtract
)});
  main.variable(observer("sum")).define("sum", ["R"], function(R){return(
R.sum
)});
  main.variable(observer("symmetricDifference")).define("symmetricDifference", ["R"], function(R){return(
R.symmetricDifference
)});
  main.variable(observer("symmetricDifferenceWith")).define("symmetricDifferenceWith", ["R"], function(R){return(
R.symmetricDifferenceWith
)});
  main.variable(observer("T")).define("T", ["R"], function(R){return(
R.T
)});
  main.variable(observer("tail")).define("tail", ["R"], function(R){return(
R.tail
)});
  main.variable(observer("take")).define("take", ["R"], function(R){return(
R.take
)});
  main.variable(observer("takeLast")).define("takeLast", ["R"], function(R){return(
R.takeLast
)});
  main.variable(observer("takeLastWhile")).define("takeLastWhile", ["R"], function(R){return(
R.takeLastWhile
)});
  main.variable(observer("takeWhile")).define("takeWhile", ["R"], function(R){return(
R.takeWhile
)});
  main.variable(observer("tap")).define("tap", ["R"], function(R){return(
R.tap
)});
  main.variable(observer("test")).define("test", ["R"], function(R){return(
R.test
)});
  main.variable(observer("times")).define("times", ["R"], function(R){return(
R.times
)});
  main.variable(observer("toLower")).define("toLower", ["R"], function(R){return(
R.toLower
)});
  main.variable(observer("toPairs")).define("toPairs", ["R"], function(R){return(
R.toPairs
)});
  main.variable(observer("toPairsIn")).define("toPairsIn", ["R"], function(R){return(
R.toPairsIn
)});
  main.variable(observer("toString")).define("toString", ["R"], function(R){return(
R.toString
)});
  main.variable(observer("toUpper")).define("toUpper", ["R"], function(R){return(
R.toUpper
)});
  main.variable(observer("transduce")).define("transduce", ["R"], function(R){return(
R.transduce
)});
  main.variable(observer("transpose")).define("transpose", ["R"], function(R){return(
R.transpose
)});
  main.variable(observer("traverse")).define("traverse", ["R"], function(R){return(
R.traverse
)});
  main.variable(observer("trim")).define("trim", ["R"], function(R){return(
R.trim
)});
  main.variable(observer("tryCatch")).define("tryCatch", ["R"], function(R){return(
R.tryCatch
)});
  main.variable(observer("type")).define("type", ["R"], function(R){return(
R.type
)});
  main.variable(observer("unapply")).define("unapply", ["R"], function(R){return(
R.unapply
)});
  main.variable(observer("unary")).define("unary", ["R"], function(R){return(
R.unary
)});
  main.variable(observer("uncurryN")).define("uncurryN", ["R"], function(R){return(
R.uncurryN
)});
  main.variable(observer("unfold")).define("unfold", ["R"], function(R){return(
R.unfold
)});
  main.variable(observer("union")).define("union", ["R"], function(R){return(
R.union
)});
  main.variable(observer("unionWith")).define("unionWith", ["R"], function(R){return(
R.unionWith
)});
  main.variable(observer("uniq")).define("uniq", ["R"], function(R){return(
R.uniq
)});
  main.variable(observer("uniqBy")).define("uniqBy", ["R"], function(R){return(
R.uniqBy
)});
  main.variable(observer("uniqWith")).define("uniqWith", ["R"], function(R){return(
R.uniqWith
)});
  main.variable(observer("unless")).define("unless", ["R"], function(R){return(
R.unless
)});
  main.variable(observer("unnest")).define("unnest", ["R"], function(R){return(
R.unnest
)});
  main.variable(observer("until")).define("until", ["R"], function(R){return(
R.until
)});
  main.variable(observer("update")).define("update", ["R"], function(R){return(
R.update
)});
  main.variable(observer("useWith")).define("useWith", ["R"], function(R){return(
R.useWith
)});
  main.variable(observer("values")).define("values", ["R"], function(R){return(
R.values
)});
  main.variable(observer("valuesIn")).define("valuesIn", ["R"], function(R){return(
R.valuesIn
)});
  main.variable(observer("view")).define("view", ["R"], function(R){return(
R.view
)});
  main.variable(observer("when")).define("when", ["R"], function(R){return(
R.when
)});
  main.variable(observer("where")).define("where", ["R"], function(R){return(
R.where
)});
  main.variable(observer("whereEq")).define("whereEq", ["R"], function(R){return(
R.whereEq
)});
  main.variable(observer("without")).define("without", ["R"], function(R){return(
R.without
)});
  main.variable(observer("xprod")).define("xprod", ["R"], function(R){return(
R.xprod
)});
  main.variable(observer("zip")).define("zip", ["R"], function(R){return(
R.zip
)});
  main.variable(observer("zipObj")).define("zipObj", ["R"], function(R){return(
R.zipObj
)});
  main.variable(observer("zipWith")).define("zipWith", ["R"], function(R){return(
R.zipWith
)});
  return main;
}

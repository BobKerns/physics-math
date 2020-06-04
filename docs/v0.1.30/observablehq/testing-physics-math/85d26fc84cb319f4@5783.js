// https://observablehq.com/@bobkerns/def@5783
import define1 from "./10ca265cf0ddc43e@1074.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Def`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Usage`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
This library supplies a framework for displaying
definitions, and various functional programming pieces
(maybe to be split out later).
`
)});
  main.variable(observer()).define(["md","tag","def","TAG_PREFIX"], function(md,tag,def,TAG_PREFIX){return(
md(
  ...tag('def')`template literal **def**_\\\`text\\\`_(_value_):

>The backtick template **def** returns a function of one argument,
the [view](https://observablehq.com/@observablehq/introduction-to-views) value.
Use it with **viewof** to display suitable documentation
in the same cell as the definition.

>e.g.:
>\`\`\`md
viewof square = def\`function square(x):
> Define a function and display this documentation.\`(
  x => x * x
)
\`\`\`

>which will define **square** but display as:
>> ${def`function **square**(_x_):
> Define a function and display this documentation.`(x => x * x)}

>or
>>\`\`\`md
viewof data = def\`data = VALUE // The answer!\`(42)
\`\`\`

>which will define **data** but display as:
>> ${def`data = VALUE // The answer!`(42)}

>The word \`VALUE\` is special; it turns into a substitution for the value
being defined.

>The formatting is controlled by entries in the table [**DEF_FORMATS**](#def_DEF_FORMATS).

>Defined formats include:
* [_async_] [_generator_] function _name_: _description_
* [_async_] [_generator_] function _name_(_arglist_): _description_
* _variable_ = _description_
* _variable_ = VALUE // _description
* template literal _name_:

>(The **generator** keyword is in accordance to a pending proposal to allow
generator arrow functions.)

Most formats will define an anchor tag of the form **${TAG_PREFIX}**_name_ that can be referred to in links.
`
)
)});
  main.variable(observer("def")).define("def", ["pipe","toInterpolation","applyFormats","texInterpolate","valueInterpolate","toInterpolator","md"], function(pipe,toInterpolation,applyFormats,texInterpolate,valueInterpolate,toInterpolator,md){return(
(...args) => value => {
  const p = pipe(
    toInterpolation,
    ([s, r, d]) => [s.map(v => applyFormats(v)), r, d],
    texInterpolate,
    valueInterpolate(value),
    toInterpolator(md)
  );
  let r = p(...args);
  r.value = value;
  return r;
}
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('view')`function view (_disolayed_)(_value_):
> Displays a human-friendly value or documentation, while setting a program value.

> If _value_ is an \`Error\` object, a message will be substituted and the value not set.

> For example:

>>\`\`\`javascript
viewof answers = view(md\`The answers\`, {the: 42}):
\`\`\`
-----
>>\`\`\`md
foo = 42
\`\`\`

>>\`\`\`javascript
foo = answers.the
\`\`\`
`
)
)});
  main.variable(observer("view")).define("view", ["md"], function(md){return(
s => v => {
  if (v instanceof Error) {
    return md`${v.constructor.name}: ${v.message}`;
  }
  const r = s(v);
  r.value = v;
  return r;
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Temporary version of Maybe until I validate the full module.`
)});
  main.variable(observer("Maybe")).define("Maybe", function(){return(
class Maybe extends Function {
  constructor(v, fn, e) {
    super('...args', 'return this.__self__.call(undefined, ...args)');
    var self = this.bind(this);
    this.__self__ = self;
    if (e) {
      this._error = e;
      if (fn) {
        self._where = fn;
      }
    } else if (v !== undefined) {
      self._value = v;
    } else if (fn) {
      self._where = fn;
    }
    return self;
  }
  static just(v, fn) {
    if (v instanceof Maybe) {
      return v;
    }
    return new Maybe(v, fn);
  }
  static fail(e, fn) {
    return new Maybe(null, fn, e);
  }

  static try(fn, from) {
    return (...args) => {
      try {
        return Maybe.just(fn(...args), from || fn);
      } catch (e) {
        return Maybe.fail(e, fn);
      }
    };
  }

  get error() {
    if (this._error) {
      const c = this._error.constructor;
      const ne = new c(
        `${c.name}: ${this._error.message} [in ${this.fn.name || 'anon fn'}]}`
      );
      const stk = this._error.stack;
      if (stk) {
        ne.stack = `${ne.message}
at ${this.error.stack
          .split(/\n\s*at /gsu)
          .slice(1)
          .join('\nat ')}`;
      }
      ne.orignal = this._error;
    }
  }

  get value() {
    if (this._error) {
      throw this.error();
    }
    return this._value;
  }

  try(fn) {
    if (this._error || this._value === undefined) {
      return () => this;
    }
    return Maybe.try((...args) => fn(this._value, ...args), fn);
  }

  toString() {
    const from = this._where ? this._where.name || 'anon fn' : 'nowhere';
    if (this._error) {
      return `ERROR: ${this._error} [from ${from}]`;
    } else if (this._value) {
      return `VALUE: ${this._value}`;
    } else {
      return `NOTHING [from ${from}]`;
    }
  }

  apply(self, ...args) {
    throw new Error("apply");
    if (this._error || this._value === undefined) {
      return this;
    }
    return this.try(() => this._value.apply(self, ...args), this._value);
  }

  call(self, ...args) {
    if (this._error || this._value === undefined) {
      return this;
    }
    const invoke = (...args) => this._value.call(self, ...args);
    return Maybe.try(invoke, this._value)().value;
  }
}
)});
  main.variable(observer()).define(["md","tag","mdquote","TAG_PREFIX"], function(md,tag,mdquote,TAG_PREFIX){return(
md(
  ...tag('TAG_PREFIX')`**TAG\_PREFIX** = ${mdquote(TAG_PREFIX)}:
> The prefix to use before tags generated with **tag**.
`
)
)});
  main.variable(observer("TAG_PREFIX")).define("TAG_PREFIX", function(){return(
'def-'
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('mdquote')`function **mdquote**(_s_):
> Quote the string _s_ so special characters will not be processed by md\`...\`.
`
)
)});
  main.variable(observer("mdquote")).define("mdquote", function(){return(
s => s.replace(/[_\\\`\[\>\n\*\]]/g, c => `\\${c}`)
)});
  main.variable(observer()).define(["md","tag","TAG_PREFIX"], function(md,tag,TAG_PREFIX){return(
md(
  ...tag('tag')`template literal **tag**:
> Template tag to wrap an markdown string in an link anchor tag. The name provided will be used to create an id
attribute with the value ${TAG_PREFIX}_myName_.
> Usage:
>>\`\`\`javascript
md(...tag('myName')\`Documentation markdown string\`)
\`\`\`
`
)
)});
  main.variable(observer("tag")).define("tag", ["TAG_PREFIX"], function(TAG_PREFIX){return(
n => (pieces, ...values) => {
  const rpieces = [`<a id='${TAG_PREFIX}${n}'>`, ...pieces, `</a>`];
  rpieces.raw = [`<a id='${TAG_PREFIX}${n}'>`, ...pieces.raw, `</a>`];
  return [rpieces, "", ...values, ""];
}
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('DEF_FORMATS')`const **DEF_FORMATS**:
>Array of formats to apply to the text fragments supplied to
_def${'\\`'}text${'\\`'}(...)_.' The fragments result from splitting at interpolations,
i.e. \${_expression_}.

>* _pattern_: A regex to test if this pattern applies. Groups will be
supplied as arguments to the _replace_ function.
* _test_: An optional predicate. If supplied, takes the regex match object.
* _replace_: Takes one argument for each group in the match, and returns the
md-style formatted string. Undefined groups are replaced with _""_ to simplify
substitution and avoid the need for \`\`(val || '')\`\`.

>Typically, these will only affect the fragment up to the first \${...} substitution,
but all of the fragments are processed.

>The 
\`VALUE\` keyword is interpolated in the same way as \${_expression_}, but the
splitting on \`VALUE\` does not happen until after the reformatting, so VALUE can
be used in the pattern and replacement function, and VALUE will be interpolated
in the same manner as for \${_expression_}.
`
)
)});
  main.variable(observer("DEF_FORMATS")).define("DEF_FORMATS", ["STD_DEF_FORMATS"], function(STD_DEF_FORMATS){return(
STD_DEF_FORMATS
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag(
    'STD_DEF_FORMATS'
  )`const **STD_DEF_FORMATS**</a>: // The initial value for **DEF_FORMATS**.`
)
)});
  main.variable(observer("STD_DEF_FORMATS")).define("STD_DEF_FORMATS", ["tag"], function(tag)
{
  const id = n => (...s) => (
    console.log('TAG', tag(n)(...s)), String.raw(...tag(n)(...s))
  );
  // const id = n => String.raw;
  return [
    {
      pattern: /^\s*(async\s)?\s*(generator\s)?\s*function\s+([\p{Letter}_$][\p{Letter}\p{Number}_$]*)\s*((?:\([^)]*\))*)\s*(?:[=]>\s*([\p{Letter}_$][\p{Letter}\p{Number}_$]*))?\s*:?\s*(.*)$/su,
      replace: (as, g, f, a, rv, r) => {
        const args = a ? a.replace(/\(/g, '(_').replace(/\)/g, '_)') : '';
        return id(f)`${as}${g}function **${f}**${args}:${
          rv ? ` \`=>\` _${rv}_ ` : ' '
        }
>${r}`;
      }
    },
    {
      pattern: /^\s*class\s+([\p{Letter}_$][\p{Letter}\p{Number}_$]*)\s*:?\s*(.*)$/su,
      replace: (f, r) => {
        return id(f)`class **${f}**: 
>${r}`;
      }
    },
    {
      pattern: /^\s*([\p{Letter}_$][\p{Letter}\p{Number}_$]*)\s*=\s*VALUE\s*\/\/\s*(.*)$/su,
      replace: (v, d) => {
        return id(v)`**${v}** = VALUE // ${d}`;
      }
    },
    {
      pattern: /^\s*([\p{Letter}_$][\p{Letter}\p{Number}_$]*)\s*=\s*([^\n:]*?)\s*(?:\/\/\s*([^\n]*))?\n\s*(.*)$/su,
      replace: (v, val, c, d) => {
        return id(v)`**${v}** = ${val} ${c ? `// ${c}` : ''}
>${d}`;
      }
    },
    {
      pattern: /^\s*template\s+literal\s*([\p{Letter}_$][\p{Letter}\p{Number}_$]*)\s*:\s*(.*)$/su,
      replace: (t, d) => {
        return id(t)`template literal **${t}**:  
>${d}`;
      }
    },
    {
      pattern: /^\s*var\s+([\p{Letter}_$][\p{Letter}\p{Number}_$]*)\s*(.*)$/su,
      replace: (v, d) => {
        return id(v)`var **${v}**:
>${d}`;
      }
    }
  ];
}
);
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('subst')`function **subst**(_d, m_):
>Substitute _d_ for _m_.
The default is to substitute _""_ for **undefined**.
`
)
)});
  main.variable(observer("subst")).define("subst", function(){return(
(d = '', m) => v => (v === m ? d : v)
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('firstDefined')`function **firstDefined**(_f, seq_):
>Call _f_ on each value in _seq_ in order,
until one returns a value other than **undefined** or **null**. This value is theen
returned. Returns **undefined** if no values match.
`
)
)});
  main.variable(observer("firstDefined")).define("firstDefined", function(){return(
function firstDefined(f, seq) {
  const m = s => v => {
    for (const i of s) {
      const p = f(i);
      if (p) {
        const r = p(v);
        if (r !== undefined && r !== null) {
          return r;
        }
      }
    }
    return undefined;
  };
  return seq ? m(seq) : m;
}
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('pipe')`function **pipe**(_f, ...fns_):
> Returns a function that first calls _f_
on any number of arguments, then calls each of _fns_ on the preceding result.
The result is \`(...args) => fns[n-1](fn[n-2](\` ... \`fns[0](f(...args))))\`.
`
)
)});
  main.variable(observer("pipe")).define("pipe", function(){return(
function pipe(fn, ...fns) {
  if (fn === undefined) {
    return () => undefined;
  }
  let debug = pipe.debug;
  const pipeid = () => (pipe.pipeid ? (pipe.pipid = 0) : pipe.pipeid++);
  let n = 0;
  const prefix = debug && `pipe-${pipeid()}`;
  const nextId = debug && (() => `${prefix}-${n++}`);
  return (...args) => {
    const run = (f, ...a) => {
      let id = debug && nextId();
      try {
        let r = f(...a);
        debug && console.log(id, a, '=>', r);
        return r;
      } catch (e) {
        debug && console.error(id, a, e.message);
        throw e;
      }
    };
    let r = run(fn, ...args);
    for (const f of fns) {
      if (r === undefined || r === null) {
        return r;
      }
      r = run(f, r);
    }
    return r;
  };
}
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('pipeApply')`function **pipeApply**(_f, ...fns_):
> Returns a function that first calls _f_
on any number of arguments, then applies each of _fns_ on the preceding result, spread
The result is \`(...args) => fns[n-1](...fn[n-2](\` ... \`...fns[0](f(...args))))\`.
`
)
)});
  main.variable(observer("pipeApply")).define("pipeApply", function(){return(
function pipeApply(fn, ...fns) {
  if (fn === undefined) {
    return () => undefined;
  }
  return (...args) => {
    let r = fn(...args);
    for (const f of fns) {
      if (r === undefined || r === null) {
        return r;
      }
      r = f(...r);
    }
    return r;
  };
}
)});
  main.variable(observer()).define(["md","tag","location"], function(md,tag,location){return(
md(
  ...tag('matchPattern')`function **matchPattern**(_p_):</a>
>Takes a pattern spec as for [DEF_FORMATS](${location.origin}${location.pathname}#def_DEF_FORMATS),
and if it matches, returns a function that when applied to the value,
returns the defined replacement value.`
)
)});
  main.variable(observer("matchPattern")).define("matchPattern", ["pipe","subst"], function(pipe,subst){return(
p =>
  pipe(
    s => p.pattern && p.pattern.exec(s),
    m => (!p.test || p.test(m)) && m,
    m => m.slice(1).map(subst()),
    m => p.replace(...m)
  )
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('substitute')`function **substitute**(_...fns_):
>Like **pipe**, but instead of the
combined function returning **undefined**, returns the first argument
to the combined function.

>Example:
>\`\`\`javascript
  substitute(() => undefined)(42)
\`\`\`
will return **42** where **pipe** would return **undefined**.
`
)
)});
  main.variable(observer("substitute")).define("substitute", ["pipe"], function(pipe){return(
(...fns) => (a, ...args) => pipe(...fns)(a, ...args) || a
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('applyFormats')`function **applyFormats**(_s, fmt=_**DEF_FORMATS**):
>Format the string _s_ according to the format specs in _fmt_.

>If _s_ is not supplied, returns a curried function that can subsequently be
applied to a string to perform the formatting.
`
)
)});
  main.variable(observer("applyFormats")).define("applyFormats", ["DEF_FORMATS","substitute","matchPattern"], function(DEF_FORMATS,substitute,matchPattern){return(
(s, fmts = DEF_FORMATS) => {
  const fn = (v, f = fmts) =>
    substitute(...f.map(p => substitute(matchPattern(p))))(v);
  return s !== undefined ? fn(s) : fn;
}
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag('aThenB')`generator function **aThenB**(_a, b_):
>A generator that initially returns _a_,
but subsequently always returns _b_.
`)
)});
  main.variable(observer("aThenB")).define("aThenB", function(){return(
function*(a, b) {
  yield a;
  while (true) {
    yield b;
  }
}
)});
  main.variable(observer("viewof M")).define("viewof M", ["def","pipe","toInterpolation","texInterpolate","md","callSite"], function(def,pipe,toInterpolation,texInterpolate,md,callSite){return(
def`template literal M:
>Like \`md\` but expands ${'`'}${'%'}{\\LaTeX%}\` into %{\LaTeX %} without extra syntax, and won't break
formatting if it appears in the middle of a pattern for \`def\`.
`((specs, ...args) =>
  pipe(
    toInterpolation,
    texInterpolate,
    ([a, e]) => md(callSite(a), ...e)
  )(specs, ...args)
)
)});
  main.variable(observer("M")).define("M", ["Generators", "viewof M"], (G, _) => G.input(_));
  main.variable(observer()).define(["md","tag","zip"], function(md,tag,zip){return(
md(
  ...tag(zip)`function **zip**(_seq, ...seqs_):
> Returns a sequence of the length of the first argument.
Each element in the result contains one element from each o the supplied
sequences.`
)
)});
  main.variable(observer("zip")).define("zip", function(){return(
(a, ...b) => a.map((e, i) => [e, ...b.map(v => v[i])])
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag(
    'interpolate'
  )`function **interpolate**(_pattern_)(_evaluator_)(_[fragments, raw, values]_) => _[fragments, raw, values]_
> Extend backtick interpolation with an additional layer of interpolation.
>* _pattern_: A regex that defines the expression to interpolate. This should have two groups: one for the entire expression being removed including delimiters, and the inner one to be processed by the _evaluator_.
* _evaluator_: a function that receeives the expression in parsed and raw form (along with the raw expression) and produces the value to interpolate.
* _fragments_: an array of strings to be interpolated, as received e/g. from backtick.
* _raw_: an array of strings to be interpolated, raw (i.e. without backquote processing).
* _values_: an array of values already supplied to be interpolated betweeen fragments.
`
)
)});
  main.variable(observer("interpolate")).define("interpolate", ["Maybe","pipe","zip"], function(Maybe,pipe,zip){return(
pattern => evaluator => data => {
  const split = s => {
    const r = s.split(pattern);
    // Will fail to detect when there is a mutiple of 3 occurrences, but
    // this will help spot bugs early.
    if (r.length % 3 !== 1) {
      throw new Error(`Pattern ${pattern} did not return 3 groups.`);
    }
    return r;
  };
  const evaluate = Maybe.try(evaluator);
  return pipe(
    ([fragments, raw, values]) =>
      // Phase1: Process each of the fragments in parallel with their raw
      // counterparts
      // Prepend undefined to values so they're all the same length
      // We will remove it at thee end with values.splice(1).
      // With this, values represents the value to insert before each
      // fragment.
      zip(fragments, raw, [undefined, ...(values || [])])
        // Interleave value and fragment pairs, with the pairs split
        // into <frag> <delimited-expr> <expr> .... <final frag>
        .flatMap(([s, r, v]) => [[[], [v]], [zip(split(s), split(r)), []]])
        // group the frags, tags, and exprs, first by placing them in
        // ordered buckets.
        .map(([sr, v]) => [
          // We're done with our sr pairing, so we drop it from our result.
          v,
          // cooked fragments
          sr.flatMap(([sElt, rElt], j) => (j % 3 === 0 ? [sElt] : [])),
          // raw fragments
          sr.flatMap(([sElt, rElt], j) => (j % 3 === 0 ? [rElt] : [])),
          // delimited-expr
          sr.flatMap(([sElt, rElt], j) => (j % 3 === 1 ? [rElt] : [])),
          // cooked-expr
          sr.flatMap(([sElt, rElt], j) => (j % 3 === 2 ? [sElt] : [])),
          // raw-expr
          sr.flatMap(([sElt, rElt], j) => (j % 3 === 2 ? [rElt] : []))
        ])
        // Collect parameters for the evaluator
        .map(([v, s, r, d, ce, re]) => [v, s, r, zip(ce, re, d)])
        // Evaluate all the expressions.
        // Our inter-fragment values are already evaluated.
        .map(([v, s, r, c]) => [v, s, r, c.map(a => evaluate(...a).value)]),

    // Phase 2: Zip up our per-fragment results
    r => [
      r.flatMap(([v, s, r, e]) => s),
      r.flatMap(([v, s, r, e]) => r),
      r.flatMap(([v, s, r, e]) => [...v, ...e])
    ],
    // Remove our dummy undefined at the beginning of values
    ([s, r, v]) => [s, r, v.slice(1)]
  )(data);
}
)});
  main.variable(observer()).define(["md","tag","tex"], function(md,tag,tex){return(
md(
  ...tag('texInterpolate')`template literal **texInterpolate**:
>Expands %{\\LaTeX%} into ${tex`\LaTeX`}.`
)
)});
  main.variable(observer("texInterpolate")).define("texInterpolate", ["tex","callSite","interpolate"], function(tex,callSite,interpolate){return(
data => {
  const texConvert = (s, r) => {
    const [texFun, tArg] = r[0] === '^' ? [tex.block, r.slice(1)] : [tex, r];
    const ts = callSite([tArg]);
    return texFun(ts);
  };
  return interpolate(/(%\{(.*?)%\})/gs)(texConvert)(data);
}
)});
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag(
    'valueInterpolate'
  )`function **valueInterpolate**(_value_)(_[fragments, raw, values]_) => _[fragments, raw, values]_
> Interpolate _value_ for _VALUE_
`
)
)});
  main.variable(observer("valueInterpolate")).define("valueInterpolate", ["interpolate"], function(interpolate){return(
value => interpolate(/((\bVALUE\b))/)(() => value)
)});
  main.variable(observer("viewof I")).define("viewof I", ["def","toInterpolation"], function(def,toInterpolation){return(
def`template literal I:
>Returns the temperate literal data without modifying it other than to put it into our standard \`[fragments, raw, values]\` form.`(
  toInterpolation
)
)});
  main.variable(observer("I")).define("I", ["Generators", "viewof I"], (G, _) => G.input(_));
  main.define("initial toInterpolation", function(){return(
(fragments, ...values) => [
  fragments,
  fragments.raw,
  values
]
)});
  main.variable(observer("mutable toInterpolation")).define("mutable toInterpolation", ["Mutable", "initial toInterpolation"], (M, _) => new M(_));
  main.variable(observer("toInterpolation")).define("toInterpolation", ["mutable toInterpolation"], _ => _.generator);
  main.variable(observer()).define(["md","tag"], function(md,tag){return(
md(
  ...tag(
    'toInterpolator'
  )`function **toInterpolator**(_interpolator_)(_fragments, raw, values_):
> Adaptor to adapt a template literal tag function to accept our interpolator format of data.
`
)
)});
  main.variable(observer("toInterpolator")).define("toInterpolator", function(){return(
interpolator => ([fragments, raw, values]) => {
  fragments.raw = raw;
  return interpolator(fragments, ...(values || []));
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Imported Libraries`
)});
  const child1 = runtime.module(define1);
  main.import("callSite", child1);
  return main;
}

// https://observablehq.com/@bobkerns/utilities@1074
import define1 from "./85d26fc84cb319f4@5783.js";
import define2 from "./f2408fa0859ed114@1066.js";
import define3 from "./b137f8744e597a90@743.js";
import define4 from "./ab11c7a5803f5211@37.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# utilities`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Various common utilities`
)});
  main.variable(observer("viewof range")).define("viewof range", ["def"], function(def){return(
def`function range(_start = 0, end = %{\infty%}, step = 1_):
> Returns a generator producing numbers from _start_ to _end_, incremented by _step_.

>With no arguments, producees the positive integers.
* _start_: The starting value for the sequence. Default = 0.
* _end_: The ending value for the sequence.The generator halts when this value is reached or exceeded, in the direction of _step_. Deaults to +%{\infty%}.
* _step_: How much the numbers increment. May be positive or negative; this controls the interpretation of _end_ as maximum or minimum limit. Zero is forbidden because it would probably not be what was intended.
`(
  //
  function* range(start = 0, end = Number.MAX_SAFE_INTEGER, step = 1) {
    let x = start;
    if (step > 0) {
      while (x < end) {
        yield x;
        x += step;
      }
    } else if (step < 0) {
      while (x > end) {
        yield x;
        x += step;
      }
    } else {
      throw new Error("Step must not be zero.");
    }
  }
)
)});
  main.variable(observer("range")).define("range", ["Generators", "viewof range"], (G, _) => G.input(_));
  main.variable(observer("viewof map")).define("viewof map", ["def"], function(def){return(
def`async generator function map(iter, transform):
Like \`Generators.map\` except works with async generators.`(
  async function* map(iterator, transform) {
    var result,
      index = -1;
    while (!(result = await iterator.next()).done) {
      yield await transform(await result.value, ++index);
    }
  }
)
)});
  main.variable(observer("map")).define("map", ["Generators", "viewof map"], (G, _) => G.input(_));
  main.variable(observer("viewof raceAll")).define("viewof raceAll", ["def","filter","nonNil"], function(def,filter,nonNil){return(
def`async generator function raceAll(promises):
Return an async generator that returns all the results of the promises in the order they resolve.
`(async function* raceAll(promises) {
  console.log('raceAll');
  const candidates = [
    ...promises.map((p, i) => Promise.resolve(p).then(v => [v, i]))
  ];
  let count = candidates.length;
  let next = null;
  const pending = filter(nonNil);
  while (count > 0) {
    const [v, i] = await Promise.race(pending(candidates));
    candidates[i] = null;
    count--;
    yield v;
  }
})
)});
  main.variable(observer("raceAll")).define("raceAll", ["Generators", "viewof raceAll"], (G, _) => G.input(_));
  main.variable(observer("viewof memoize")).define("viewof memoize", ["def"], function(def){return(
def`function memoize(fn, envFn):
Return a memoized function; one that avoids recomputing the same value by caching.
* \`fn\`: The function to be memoized.
* \`envFn\`: An optional function that returns a list of global values \`fn\` may depend on. It receives the arguments to \`fn\` as an argument, and should generally include them or subvalues of them in the result.
`((fn, envFn = args => [...args]) => {
  const cache = new Map();
  const sym = Symbol.for('value');
  const find = (fn, args) =>
    args.reduce(
      (m, a) => (m.has(a) ? m.get(a) : (m.set(a, new Map()), m.get(a))),
      cache
    );
  return (...args) => {
    const end = find(fn, envFn(args));
    if (end.has(sym)) {
      return end.get(sym);
    } else {
      const value = fn(...args);
      end.set(sym, value);
      return value;
    }
  };
})
)});
  main.variable(observer("memoize")).define("memoize", ["Generators", "viewof memoize"], (G, _) => G.input(_));
  main.variable(observer("viewof idGen")).define("viewof idGen", ["def","range"], function(def,range){return(
def`function idGen(prefix = 'gen', sep='-'):
>Generate a sequence of ID's, unique to each prefix.
`(
  //
  function idGen(prefix = 'gen', sep = '-') {
    const seqs = idGen.seqs || (idGen.seqs = {});
    const seq =
      seqs[prefix] || (seqs[prefix] = range(0, Number.MAX_SAFE_INTEGER));
    return `${prefix}${sep}${seq.next().value}`;
  }
)
)});
  main.variable(observer("idGen")).define("idGen", ["Generators", "viewof idGen"], (G, _) => G.input(_));
  main.variable(observer("viewof makeValidId")).define("viewof makeValidId", ["def"], function(def){return(
def`function makeValidId(prefix):
Sanitize a user-supplied ID for use in the class attribute.
* _prefix_: The user-supplied value which may not follow the rules
for class Ids`(prefix =>
  (/^[a-zA-Z-][a-zA-Z0-9_][a-zA-Z0-9_-]*$/.test(prefix)
    ? prefix
    : `T-${prefix}`
  )
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/[-_][-_]+/g, '-')
    .replace(/-$/, '')
)
)});
  main.variable(observer("makeValidId")).define("makeValidId", ["Generators", "viewof makeValidId"], (G, _) => G.input(_));
  main.variable(observer("viewof clsIdGen")).define("viewof clsIdGen", ["def","idGen","makeValidId"], function(def,idGen,makeValidId){return(
def`function clsIdGen(prefix='Test'):
Generate a sequence of ID's, unique to each prefix, sanitized for
use as class ID's in HTML.
* _prefix_: The starting portion of the series' strings.
`((prefix = 'Test') => idGen(makeValidId(prefix)))
)});
  main.variable(observer("clsIdGen")).define("clsIdGen", ["Generators", "viewof clsIdGen"], (G, _) => G.input(_));
  main.variable(observer("viewof ago")).define("viewof ago", ["defaultTimeUnits","agoTimes","Promises","def","liveData"], function(defaultTimeUnits,agoTimes,Promises,def,liveData)
{
  async function* ago(time = Date.now(), units = defaultTimeUnits, sep = ' ') {
    for await (const v of agoTimes(time)) {
      yield v[2] === 'just now' ? 'just now' : `${v[0]}${sep}${v[2]}`;
      await Promises.delay(v[2]);
    }
  }
  const d = def`function ago(time = Date.now):
Generate an infinite series of values of the form:
* just now
* n seconds
* n minutes
* n hours

>> \`ago()\` ==> ${liveData(ago)}

...
The results are available at appropriate intervals.
`;
  return d(ago);
}
);
  main.variable(observer("ago")).define("ago", ["Generators", "viewof ago"], (G, _) => G.input(_));
  main.variable(observer("viewof liveData")).define("viewof liveData", ["def","d3","idGen","MutationObserver"], function(def,d3,idGen,MutationObserver){return(
def`function liveData(genFn, tag=\`<span/\>\`, fn=String)
Return a live data node, automatically updated as the \`genFn\` returns
new values.

* _genFn_: An function that returns an async generator.
* _tag_: the element to make live.
* _fn_: A function to convert from the live data from the generator to content (string or elements).

If the element is removed from the document, the generator is terminated to free up resources. Use a
proxy generator if this is not desirable. If the element is re-added to the document, \`genFn\` is
called again for a new generator.
`((genFn, tag = document.createElement('span'), fn = String) => {
  const t = d3.select(tag);
  const id = t.attr('id', idGen('-liveData')).attr('id');
  let go;
  let ready = new Promise(a => (go = a));
  let gen;
  let observer;
  const observe = node => {
    const ob = new MutationObserver(mutations => {
      // Ignore the mutation record. We just care if our element is in the tree or not,
      // we don't need to look at every damned node. If only there were a way to get an
      // event when a node was added or removed from the document. Oh, wait, there used to be.
      // If only MutationObserver would observe changes to the parenting and document ownership
      // of a node, we could do this a lot more efficiently.
      if (document.getElementById(id) === tag) {
        go((gen = genFn()));
        // Let's find a more narrow scope to observe henceforth!
        // We will assume we don't shuffle elements between cells.
        // So let's find this cell!
        let p = tag.parentElement;
        while (p && !p.classList.contains('observablehq')) {
          p = p.parentElement;
        }
        if (p) {
          observer.disconnect();
          observer = observe(p);
        }
      } else {
        // So cancel that promise
        go(null);
        // and the generator, to free up any resources...
        gen && gen.return(null);
        gen = null;
        // Wait for possible reattachment.
        ready = new Promise(a => (go = a));
      }
    });
    ob.observe(node, {
      subtree: true,
      childList: true
    });
    return (observer = ob);
  };
  observer = observe(document.body);
  return d3
    .select(tag)
    .call(n =>
      n
        .classed('-liveData-ready', false)
        .classed('-liveData-waiting', false)
        .classed('-liveData-active', false)
        .classed('-liveData', true)
        .text('')
        .selectAll('*')
        .remove()
    )
    .call(async n => {
      n.classed('-liveData-waiting', true);
      while (true) {
        const gen = await ready;
        n.classed('-liveData-waiting', false);
        if (gen) {
          n.classed('-liveData-ready', true);
          for await (const v of gen) {
            n.classed('-liveData-active', true).text(fn(v));
          }
        }
      }
    })
    .node();
})
)});
  main.variable(observer("liveData")).define("liveData", ["Generators", "viewof liveData"], (G, _) => G.input(_));
  main.variable(observer("viewof timeUnits")).define("viewof timeUnits", ["def"], function(def){return(
def`timeUnits = _names of time units_
Indexed by _language_._[long|short]_,_unit_[0=_singular_, 1=_plural_]`({
  english: {
    long: {
      second: ['second', 'seconds'],
      minute: ['minute', 'minutes'],
      hour: ['hour', 'hours'],
      day: ['day', 'days'],
      week: ['week', 'weeks'],
      month: ['month', 'months'],
      year: ['year', 'years']
    },
    short: {
      second: ['sec', 'sec'],
      minute: ['min', 'min'],
      hour: ['hr', 'hr'],
      day: ['d', 'd'],
      week: ['wk', 'wk'],
      month: ['mth', 'mth'],
      year: ['yr', 'yr']
    }
  },
  日本語: {
    long: {
      second: ['秒', '秒'],
      minute: ['分', '分'],
      hour: ['時間', '時間'],
      day: ['日', '日'],
      week: ['週間', '週間'],
      month: ['月', '月'],
      year: ['年', '年']
    },
    short: {
      second: ['秒', '秒'],
      minute: ['分', '分'],
      hour: ['時', '時'],
      day: ['日', '日'],
      week: ['週', '週'],
      month: ['月', '月'],
      year: ['年', '年']
    }
  },
  español: {
    long: {
      second: ['segundo', 'segundos'],
      minute: ['minuto', 'minutos'],
      hour: ['hora', 'horas'],
      day: ['día', 'días'],
      week: ['semana', 'semanas'],
      month: ['mes', 'meses'],
      year: ['año', 'años']
    },
    short: {
      second: ['sec', 'sec'],
      minute: ['min', 'mins'],
      hour: ['hr', 'hr'],
      day: ['d', 'd'],
      week: ['sem', 'sems'],
      month: ['mes', 'mes'],
      year: ['año', 'año']
    }
  }
})
)});
  main.variable(observer("timeUnits")).define("timeUnits", ["Generators", "viewof timeUnits"], (G, _) => G.input(_));
  main.variable(observer("viewof defaultTimeUnits")).define("viewof defaultTimeUnits", ["def","timeUnits"], function(def,timeUnits){return(
def`defaultTimeUnits = \`timeUnits.english.short\`
Changing these affects the default for time functions like 'ago'`(
  timeUnits.english.short
)
)});
  main.variable(observer("defaultTimeUnits")).define("defaultTimeUnits", ["Generators", "viewof defaultTimeUnits"], (G, _) => G.input(_));
  main.variable(observer("viewof agoTimes")).define("viewof agoTimes", ["def","defaultTimeUnits","Promises"], function(def,defaultTimeUnits,Promises){return(
def`function agoTimes(time = now, units=defaultTimeUnits):
Generates an infinite series of values of the form _[t, i, u]_, where
* _t_: an integer number of time units
* _u_: The english name for that unit
* _i_: Interval in ms until the next change in _t_ and/or _u_.

See \`ago\` for one usage.
`(async function* ago(time = Date.now(), units = defaultTimeUnits) {
  const SECOND = 1000;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const YEAR = DAY * 365.25;
  const MONTH = YEAR / 12;
  const m = (t, p, n) => {
    const c = Math.floor(t / p);
    const u = units[n][c === 1 ? 0 : 1];
    return c ? [c, p - (t % p), u] : undefined;
  };
  while (true) {
    const n = Date.now();
    const t = n - time;
    const v = m(t, YEAR, 'year') ||
      m(t, MONTH, 'month') ||
      m(t, WEEK, 'week') ||
      m(t, DAY, 'day') ||
      m(t, HOUR, 'hour') ||
      m(t, MINUTE, 'minute') ||
      m(t, SECOND, 'second') || [1, SECOND - t, 'just now'];
    yield v;
    await Promises.when(n + v[1]);
  }
})
)});
  main.variable(observer("agoTimes")).define("agoTimes", ["Generators", "viewof agoTimes"], (G, _) => G.input(_));
  main.variable(observer("viewof eventToGenerator")).define("viewof eventToGenerator", ["def","Denque"], function(def,Denque){return(
def`async generator function eventToGenerator(queue) returns _[generator, controller]_
Create a generator that can be made to return values to be supplied by a callback.
* _queue_: A function that returns the queue to use.
* _generator_: The generator being controlled.
* _controller_: An object with the following:
  * \`send(\`_value_\`)\`: send the next value to generate.
  * \`end()\`: Cause the generator to end
  * \`throw(\`_error_\`)\`: Cause the generator to throw an exception.
  * \`clear()\`: Remove any pending queue items.

\`end\` and \`throw\` are synchronous with queue. That is, they cause the queue to end or throw
when the consumer of the generator has read everything prior to the queue.

_queue_ should return an object that implements \`.length\`, \`.push()\`, \`.shift()\`, and \`.clear()\`.
The default implementation is [Denque](https://github.com/invertase/denque), which is fast for unbounded size.

Other queue functions of interest:
* \`queue1\`: returns a "queue" of maximum length 1. Older entries are discarded.
* \`queueSticky\`: Returns a queue that returns the last value seen, forever (or until cleared).
* \`queueOldest\`_(n)_: Call with _n_ to set the size; when full new values are discarded.
* \`queueNewest\`_(n)_: Call with _n_ to set the size; when full old values are discarded.
* \`queueUnique: Returns a queue that discards duplicate enqueued values.
`((queue = () => new Denque()) => {
  let unblock = () => undefined;
  const endTag = Symbol.for("endTag");
  let waiter = null;
  const q = queue();
  const send = v => (q.push(v), unblock());
  const end = value => send({ [endTag]: 'return', value });
  const error = value => send({ [endTag]: 'throw', value });
  const clear = () => q.clear();
  async function* eventToGenerator_() {
    while (true) {
      while (!q.length) {
        waiter = new Promise(a => (unblock = a));
        await waiter;
        waiter = null;
        unblock = () => undefined;
      }
      const v = q.shift();
      if (v === endTag) return;
      if (v[endTag]) {
        throw v[endTag];
      }
      yield v;
    }
  }
  return [
    eventToGenerator_(),
    {
      send,
      end,
      throw: error,
      clear
    }
  ];
})
)});
  main.variable(observer("eventToGenerator")).define("eventToGenerator", ["Generators", "viewof eventToGenerator"], (G, _) => G.input(_));
  main.variable(observer("viewof queue1")).define("viewof queue1", ["def"], function(def){return(
def`function queue1():
Return queue of maximum length 1, which discards older values.
`(() => {
  let value,
    empty = true;
  const obj = {};
  Reflect.defineProperty(obj, 'length', { get: () => (empty ? 0 : 1) });
  Reflect.defineProperty(obj, 'push', {
    value: v => {
      empty = false;
      value = v;
      return 1;
    }
  });
  Reflect.defineProperty(obj, 'shift', {
    value: () => {
      empty = true;
      const tmp = value;
      value = undefined;
      return tmp;
    }
  });
  Reflect.defineProperty(obj, 'clear', {
    value: () => {
      empty = true;
      value = undefined;
    }
  });
  return obj;
})
)});
  main.variable(observer("queue1")).define("queue1", ["Generators", "viewof queue1"], (G, _) => G.input(_));
  main.variable(observer("viewof queueSticky")).define("viewof queueSticky", ["def"], function(def){return(
def`function queueSticky():
Return queue of maximum length 1, which discards older values, but returns
the last seen forever (until cleared).
`(() => {
  let value,
    empty = true;
  const obj = {};
  Reflect.defineProperty(obj, 'length', { get: () => (empty ? 0 : 1) });
  Reflect.defineProperty(obj, 'push', {
    value: v => {
      empty = false;
      value = v;
      return 1;
    }
  });
  Reflect.defineProperty(obj, 'shift', {
    value: () => {
      return value;
    }
  });
  Reflect.defineProperty(obj, 'clear', {
    value: () => {
      empty = true;
      value = undefined;
    }
  });
  return obj;
})
)});
  main.variable(observer("queueSticky")).define("queueSticky", ["Generators", "viewof queueSticky"], (G, _) => G.input(_));
  main.variable(observer("viewof queueOldest")).define("viewof queueOldest", ["def","Denque"], function(def,Denque){return(
def`function queueOldest(n):
Return queue of maximum length _n_, which discards newer values.
`(n => {
  const fn = n => () => {
    const queue = new Denque();
    const obj = {};
    Reflect.defineProperty(obj, 'length', { get: () => queue.length });
    Reflect.defineProperty(obj, 'push', {
      value: v => {
        if (queue.length >= n) {
        return queue.push(v);
        }
        // Otherwise, we let it drop.
        return queue.length;
      }
    });
    Reflect.defineProperty(obj, 'shift', {
      value: () => queue.shift()
    });
    Reflect.defineProperty(obj, 'clear', {
      value: () => queue.clear()
    });
    return obj;
  };
  if (n === undefined) {
    // Called without specifying a length, just return a size=1 queue.
    return fn(1)();
  }
  // Return a function to construct queues of the specified size.
  return fn(n);
})
)});
  main.variable(observer("queueOldest")).define("queueOldest", ["Generators", "viewof queueOldest"], (G, _) => G.input(_));
  main.variable(observer("viewof queueNewest")).define("viewof queueNewest", ["def","Denque"], function(def,Denque){return(
def`function queueNewest(n):
Return queue of maximum length _n_, which discards older values.
`(n => {
  const fn = n => () => {
    const queue = new Denque();
    const obj = {};
    Reflect.defineProperty(obj, 'length', { get: () => queue.length });
    Reflect.defineProperty(obj, 'push', {
      value: v => {
        while (queue.length >= n) {
          queue.shift();
        }
        return queue.push(v);
      }
    });
    Reflect.defineProperty(obj, 'shift', {
      value: () => queue.shift()
    });
    Reflect.defineProperty(obj, 'clear', {
      value: () => queue.clear()
    });
    return obj;
  };
  if (n === undefined) {
    // Called without specifying a length, just return a size=1 queue.
    return fn(1)();
  }
  // Return a function to construct queues of the specified size.
  return fn(n);
})
)});
  main.variable(observer("queueNewest")).define("queueNewest", ["Generators", "viewof queueNewest"], (G, _) => G.input(_));
  main.variable(observer()).define(["TESTS","queueNewest"], function(TESTS,queueNewest){return(
TESTS.add({
  id: 'queueNewest-1',
  test() {
    const q = queueNewest(2)();
    [8, 7, 48, 3, 7].map(n => q.push(n));
    const s1 = [q.shift(), q.shift(), q.shift()];
    [44, 23, 5, 8].map(n => q.push(n));
    const s2 = [q.shift(), q.shift(), q.shift()];
    console.log('expect', [...s1, ...s2]);
    return [...s1, ...s2];
  },
  expect(expect) {
    expect.toEqual([3, 7, undefined, 5, 8, undefined]);
  }
})
)});
  main.variable(observer("viewof queueUnique")).define("viewof queueUnique", ["def"], function(def){return(
def`function queueUnique({newest, keyFn}): () =>
Return queue, which discards already-enqueued entries. Values can be re-enqueued once
delivered.
* _newest_: if \`false\` (the default), values are dequeued in the order they were first enqueued. Using _newest: true_ deprioritizes more active values so less-busy items can get through. But in a sustained-busy situation, there is no guarantee they will ever be delivered. This can be an advantage or disadvantage, depending on requirements.
* _keyFn_: A function to identify what values count as "equal". The default regards +0 and -0 as the same, NaN's as all the same, and otherwise behaves as \`===\`.
`(spec => {
  const fn = (newest, keyFn) => () => {
    const queue = new Map();
    let iter = null;
    const obj = {};
    Reflect.defineProperty(obj, 'length', { get: () => queue.size });
    Reflect.defineProperty(obj, 'push', {
      value: v => {
        const k = keyFn(v);
        if (newest) {
          // As I read the spec, this should not be needed, but experimentally
          // in Chrome, it is.
          queue.delete(k);
          queue.set(k, v);
        } else if (!queue.has(k)) {
          queue.set(k, v);
        }
        return queue.size;
      }
    });
    Reflect.defineProperty(obj, 'shift', {
      value: () => {
        if (!iter) {
          iter = queue.values();
        }
        const r = iter.next();
        if (r.done) {
          // If values had been added later, they would turn up
          // in the iterator, so we're done.
          iter = null;
          return undefined;
        }
        return r.value;
      }
    });
    Reflect.defineProperty(obj, 'clear', {
      value: () => queue.clear()
    });
    return obj;
  };
  if (spec === undefined) {
    // Called without specifying a length, just return a size=1 queue.
    return fn(false, i => i)();
  }
  // Return a function to construct queues of the specified size.
  return fn(!!spec.newest, spec.keyFn || (i => i));
})
)});
  main.variable(observer("queueUnique")).define("queueUnique", ["Generators", "viewof queueUnique"], (G, _) => G.input(_));
  main.variable(observer()).define(["TESTS","queueUnique"], function(TESTS,queueUnique){return(
TESTS.add([
  {
    id: 'unique-newest',
    test() {
      const q = queueUnique({ newest: true })();
      q.push(3), q.push(7), q.push(3), q.push(3);
      return [q.shift(), q.shift(), q.shift()];
    },
    expect(expect) {
      expect.toEqual([7, 3, undefined]);
    }
  },
  {
    id: 'unique-oldest',
    test() {
      const q = queueUnique({ newest: false })();
      q.push(3), q.push(7), q.push(3), q.push(3);
      return [q.shift(), q.shift(), q.shift()];
    },
    expect(expect) {
      expect.toEqual([3, 7, undefined]);
    }
  }
])
)});
  main.variable(observer("viewof queueUpdateShallow")).define("viewof queueUpdateShallow", ["def"], function(def){return(
def`function queueUpdate(init={}): () => generator
Accepts objects, and returns just the fields that have changed (are no longer \`===\`).

This does not distinguish between deleted keys and keys assigned a value of \`undefined\` in the input.
In the output, a deleted key is represented as present with a value of \`undefined\`.
`(init => {
  const fn = init => () => {
    const state = { ...init };
    let pending = {};
    let hasPending = false;
    const obj = {};
    const clear = () => {
          pending = {};
          hasPending = false;
    }
    Reflect.defineProperty(obj, 'length', { get: () => (hasPending ? 1 : 0) });
    Reflect.defineProperty(obj, 'push', {
      value: v => {
        Object.keys(v).forEach(k => {});
      }
    });
    Reflect.defineProperty(obj, 'shift', {
      value: () => {
        try {
          return pending;
        } finally {
          Object.assign(state, pending);
          clear();
        }
      }
    });
    Reflect.defineProperty(obj, 'clear', {
      value: clear
    });
    return obj;
  };
  if (init === undefined) {
    return fn({})();
  }
  return fn(init);
})
)});
  main.variable(observer("queueUpdateShallow")).define("queueUpdateShallow", ["Generators", "viewof queueUpdateShallow"], (G, _) => G.input(_));
  main.variable(observer("objectDiff3")).define("objectDiff3", function(){return(
(base, mods, nval) => {
  Object.keys(nval).forEach(k => {
    const valk = nval[k];
    if (Reflect.has(mods, k)) {
      mods[k] = valk;
    } else if (base[k] !== valk) {
      mods[k] = valk;
    }
  });
  Object.keys(base).forEach(k => {
    const oldk = base[k];
    if (oldk !== undefined) {
      const valk = nval[k];
      if (valk === undefined) {
        mods[k] = undefined;
      }
    }
  });
  return mods;
}
)});
  main.variable(observer()).define(["TESTS","objectDiff3"], function(TESTS,objectDiff3){return(
TESTS.add([
  {
    id: 'objectDiff3-trivial',
    test() {
      return objectDiff3({}, {}, {});
    },
    expect(v) {
      v.toEqual({});
    }
  },
  {
    id: 'objectDiff3-add',
    test() {
      return objectDiff3({}, {}, { a: 5 });
    },
    expect(v) {
      v.toEqual({ a: 5 });
    }
  },
  {
    id: 'objectDiff3-remove',
    test() {
      return objectDiff3({ a: 7 }, {}, {});
    },
    expect(v) {
      v.toEqual({ a: undefined });
      v.toHaveProperty('a');
    }
  }
])
)});
  main.variable(observer("viewof isFunction")).define("viewof isFunction", ["def"], function(def){return(
def`function isFunction(f):
Return \`true\` if the argument is a function.
`(f => typeof f === 'function')
)});
  main.variable(observer("isFunction")).define("isFunction", ["Generators", "viewof isFunction"], (G, _) => G.input(_));
  main.variable(observer("viewof scrollIntoView")).define("viewof scrollIntoView", ["def"], function(def){return(
def`function scrollIntoView(hash):
* _hash_: Scroll the element ID _hash_ into view. If _hash_ begins with \`'#'\`, it is
  removed first.
`(hash => {
  const nhash = hash.startsWith('#') ? hash.substr(1) : hash;
  const elt = nhash && document.getElementById(nhash);
  if (elt) {
    console.log('scrollIntoView', elt);
    elt.scrollIntoView();
  } else {
    console.log('scrollIntoView', `not found: id=${nhash}`);
  }
})
)});
  main.variable(observer("scrollIntoView")).define("scrollIntoView", ["Generators", "viewof scrollIntoView"], (G, _) => G.input(_));
  main.variable(observer("viewof trackHash")).define("viewof trackHash", ["def","Generators","Promises","scrollIntoView"], function(def,Generators,Promises,scrollIntoView){return(
def`generator function trackHash(autoscroll):
Track the value of the window's URL hash.
* _autoscroll_: If \`true\`, and the hash names the id of an element, scroll it into view automatically
  on page load. If \`always\`, do it whenever it is changed.
* _delay_=\`200\`: Delay for this many ms before scrolling to the element. This allows the DOM
  to settle, if it is being modified. Slow-loading pages may wish to increase this.
`((autoscroll, delay = 200) =>
  Generators.observe(change => {
    const scroll = flag => async () => {
      if (flag) {
        // On load, it might not be added to the DOM yet depending on the dependency graph, etc.
        await Promises.delay(delay);
        scrollIntoView(window.location.hash);
      }
    };
    change(window.location.hash);
    const wscroll = scroll(autoscroll === 'always');
    window.onhashchange = () => (change(window.location.hash), wscroll());
    return scroll(autoscroll);
  })
)
)});
  main.variable(observer("trackHash")).define("trackHash", ["Generators", "viewof trackHash"], (G, _) => G.input(_));
  main.variable(observer("hash")).define("hash", ["trackHash"], function(trackHash){return(
trackHash('always')
)});
  main.variable(observer()).define(["def","callSite"], function(def,callSite){return(
def`function callSite(stringOrArray):
Prepare a string or array for passing to a backtick interpolator.
`(callSite)
)});
  main.variable(observer("callSite")).define("callSite", function(){return(
s => (a => (a.raw = a.raw || a))(s instanceof Array ? s : [s])
)});
  main.variable(observer("viewof base64Encode")).define("viewof base64Encode", ["def"], function(def){return(
def`function base64Encode(buf, fold) => String:
* buf—An \`ArrayBffer\` or \`Uint8Array\`
* fold—if truthy, fold lines on 76-char boundaries

String to base64 encoding.
`((buf, fold) => {
  const uint6ToB64 = nUint6 =>
    nUint6 < 26
      ? nUint6 + 65
      : nUint6 < 52
      ? nUint6 + 71
      : nUint6 < 62
      ? nUint6 - 4
      : nUint6 === 62
      ? 43
      : nUint6 === 63
      ? 47
      : 65;
  const aBytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  var eqLen = (3 - (aBytes.length % 3)) % 3,
    sB64Enc = "";

  for (
    var nMod3, nLen = aBytes.length, nUint24 = 0, nIdx = 0;
    nIdx < nLen;
    nIdx++
  ) {
    nMod3 = nIdx % 3;
    /* Uncomment the following line in order to split the output in lines 76-character long: */
    if (fold) {
      if (nIdx > 0 && ((nIdx * 4) / 3) % 76 === 0) {
        sB64Enc += "\r\n";
      }
    }

    nUint24 |= aBytes[nIdx] << ((16 >>> nMod3) & 24);
    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
      sB64Enc += String.fromCharCode(
        uint6ToB64((nUint24 >>> 18) & 63),
        uint6ToB64((nUint24 >>> 12) & 63),
        uint6ToB64((nUint24 >>> 6) & 63),
        uint6ToB64(nUint24 & 63)
      );
      nUint24 = 0;
    }
  }
  const pad = l => (l === 0 ? '' : l === 1 ? '==' : '=');
  return sB64Enc + pad(aBytes.length % 3);
})
)});
  main.variable(observer("base64Encode")).define("base64Encode", ["Generators", "viewof base64Encode"], (G, _) => G.input(_));
  main.variable(observer("viewof base64Decode")).define("viewof base64Decode", ["def"], function(def){return(
def`function base64Decode(str) => ArrayBuffer:
Decode a base64 string to an ArrayBuffer
`(str => {
  const pad = str.endsWith('==') ? 2 : str.endsWith('=') ? 1 : 0;
  const b64ToUint6 = nChr =>
    nChr > 64 && nChr < 91
      ? nChr - 65
      : nChr > 96 && nChr < 123
      ? nChr - 71
      : nChr > 47 && nChr < 58
      ? nChr + 4
      : nChr === 43
      ? 62
      : nChr === 47
      ? 63
      : 0;

  const sB64Enc = str.replace(/[^A-Za-z0-9\+\/]/g, "");
  const nInLen = sB64Enc.length;
  const nOutLen = Math.floor((nInLen * 3) / 4) - pad;
  const aBytes = new Uint8Array(nOutLen);

  for (
    var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0;
    nInIdx < nInLen;
    nInIdx++
  ) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (18 - 6 * nMod4);
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        aBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
      }
      nUint24 = 0;
    }
  }
  return aBytes.buffer;
})
)});
  main.variable(observer("base64Decode")).define("base64Decode", ["Generators", "viewof base64Decode"], (G, _) => G.input(_));
  main.variable(observer()).define(["TESTS","base64Decode","base64Encode"], function(TESTS,base64Decode,base64Encode){return(
TESTS.add([
  {
    id: 'base64Encode/Decode 6char',
    data: Uint8Array.of(...[...'foobar'].map(c => c.charCodeAt(0))),
    test() {
      return new Uint8Array(base64Decode(base64Encode(this.data)));
    },
    expect(e) {
      e.toEqual(this.data);
    }
  },
  {
    id: 'base64Encode/Decode 7char',
    data: Uint8Array.of(...[...'fooXbar'].map(c => c.charCodeAt(0))),
    test() {
      return new Uint8Array(base64Decode(base64Encode(this.data)));
    },
    expect(e) {
      e.toEqual(this.data);
    }
  },
  {
    id: 'base64Encode/Decode 8char',
    data: Uint8Array.of(...[...'fooXXbar'].map(c => c.charCodeAt(0))),
    test() {
      return new Uint8Array(base64Decode(base64Encode(this.data)));
    },
    expect(e) {
      e.toEqual(this.data);
    }
  }
])
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Test Summary`
)});
  main.variable(observer()).define(["TESTS"], function(TESTS){return(
TESTS.summary()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Appendix`
)});
  const child1 = runtime.module(define1);
  main.import("def", child1);
  main.import("applyFormats", child1);
  const child2 = runtime.module(define2);
  main.import("TESTS", child2);
  main.import("test_styles", child2);
  main.import("expect", child2);
  const child3 = runtime.module(define3);
  main.import("filter", child3);
  const child4 = runtime.module(define4);
  main.import("nonNil", child4);
  main.import("log", child4);
  main.variable(observer()).define(["base64Encode"], function(base64Encode){return(
base64Encode(Uint8Array.of(0, 0, 0))
)});
  main.variable(observer()).define(["md","test_styles"], function(md,test_styles){return(
md`${test_styles}`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  main.variable(observer("Denque")).define("Denque", ["require"], function(require){return(
require('https://bundle.run/denque@1.4.1')
)});
  return main;
}

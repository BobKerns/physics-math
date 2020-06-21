// https://observablehq.com/@bobkerns/literate-tests@1066
import define1 from "./10ca265cf0ddc43e@1074.js";
import define2 from "./85d26fc84cb319f4@5783.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Literate Tests`
)});
  main.variable(observer()).define(["md","T"], function(md,T){return(
md`Not quite feature-complete, but getting there...

The idea is, along with literate programming, we need literate testing, where we can see the results of testing our work with immediate feedback.

Like this, in a cell right next to where we are working. Or even (as here) right in the documentation.

${T.cloneNode(true)}

Needs:
1. Some work on the live display of individual tests.
2. More simplification (and performance gain) from using \`liveData\` elements
3. Documentation!
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Reference`
)});
  main.variable(observer("Test")).define("Test", ["DisplayManager","clsIdGen","TEST_FORMATS","liveData","ago","Promises","expect","d3","STATUS_NAMES"], function(DisplayManager,clsIdGen,TEST_FORMATS,liveData,ago,Promises,expect,d3,STATUS_NAMES){return(
class Test extends DisplayManager {
  constructor({ id, name, ...options }) {
    super();
    this.id = id || clsIdGen(name || 'Test');
    this.name = name || this.id;
    this.options = {};
    Object.assign(this, options);
    this._status = 'initialized';
    this.startTime = this.endTime = Date.now();
  }

  get formats() {
    return TEST_FORMATS;
  }

  get [Symbol.toStringTag]() {
    return "Test";
  }

  get testName() {
    return this.id === this.name ? this.id : `${this.name} (${this.id})`;
  }

  set result(result) {
    this._status = result.status;
    switch (result.status) {
      case 'errored':
      case 'failed':
        this._failMessage = this.makeFailMessage(result);
        break;
      case 'ok':
        this.value = result.value;
      default:
        this._failMessage = '';
    }
    this.endTime = Date.now();
    this.dispatchEvent(new CustomEvent("update", { detail: this.result }));
  }

  get status() {
    return this._status;
  }

  get elapsedSeconds() {
    return ((this.endTime - this.startTime) / 1000).toFixed(3);
  }

  get endTime() {
    return this._endTime;
  }
  set endTime(time) {
    this._endTime = time;
  }

  get failMessage1() {
    return this._failMessage === undefined
      ? undefined
      : this._failMessage.split(/\n/)[0];
  }

  makeFailMessage(result) {
    return (
      result &&
      result.error &&
      result.error.message &&
      result.error.message
        .replace(/https:\/static\.observableusercontent\.com\/worker\//g, '')
        .replace(/worker\.[0-9a-f]{56}/g, '...')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
    );
  }

  get result() {
    return {
      id: this.id,
      name: this.name,
      testName: this.testName,
      status: this.status,
      time: this.elapsedSeconds,
      elapsedTime: this.elapsedSeconds,
      endTime: this.status in ['initialized', 'running'] ? '-' : liveData(ago),
      message: this.message,
      failMessage: this._failMessage,
      failMessage1: this.failMessage1
    };
  }

  async run() {
    await Promises.delay(2000);
    this.result = { status: 'running' };
    this.startTime = Date.now();
    try {
      let val = await this.test(this.options);
      this.endTime = Date.now();
      try {
        await this.expect(expect(val), val);
        this.endTime = Date.now();
        this.result = { status: 'ok', value: val }; // OK, we passed.
      } catch (e) {
        this.result = { status: 'failed', error: e };
      }
    } catch (e) {
      try {
        await this.expectError(
          expect(() => {
            throw e;
          }),
          e
        );
        this.result = { status: 'ok', value: e };
      } catch (e2) {
        this.result = { status: 'errored', error: e2 };
      }
    }
    this.endTime = Date.now();
    this.dispatchEvent(new CustomEvent("update", { detail: this.result }));
    return this.formatResult();
  }

  // Unless overridden.
  async expect(expect, val) {
    expect.toThrow();
  }

  // Unless overridden.
  async expectError(expect, e) {
    expect.not.toThrow();
  }

  fillFormat(fmt) {
    const elt = this.formats[fmt];
    if (!elt) {
      throw new Error(`No format named ${fmt}`);
    }
    const result = elt.cloneNode(true);
    const time = ((this.endTime - this.startTime) / 1000).toFixed(3) + " s";
    d3.select(result)
      .classed(this.id, true)
      .call(e => STATUS_NAMES.forEach(s => e.classed(s, false)))
      .classed(this.status, true)
      .call(e => e.selectAll(".fill.testName").text(this.name))
      .call(e => e.selectAll(".fill.status").text(this.status))
      .call(e =>
        e
          .selectAll(".fail .fill.failMessage")
          .text(this.status in ['failed', 'errored'] ? this.failMessage : '')
      )
      .call(e => e.selectAll(".fill.time").text(time));
    result.value = this;
    return result;
  }

  formatResult() {
    return this.fillFormat('detail');
  }
}
)});
  main.variable(observer("viewof T")).define("viewof T", ["def","TESTS"], async function(def,TESTS){return(
def`T = TESTS.add({}) // A bad test.
VALUE`(await TESTS.add({}))
)});
  main.variable(observer("T")).define("T", ["Generators", "viewof T"], (G, _) => G.input(_));
  main.variable(observer("TestSuite")).define("TestSuite", ["DisplayManager","clsIdGen","d3","Test","html","Element","Generators","STATUS_NAMES","TEST_FORMATS"], function(DisplayManager,clsIdGen,d3,Test,html,Element,Generators,STATUS_NAMES,TEST_FORMATS){return(
class TestSuite extends DisplayManager {
  constructor({ name, id = clsIdGen(name || 'Suite') }) {
    super();
    const updateRows = () =>
      (this.elements[Symbol.for("Suite")] || []).forEach(e =>
        e.dispatchEvent(new CustomEvent("update"))
      );
    this.addEventListener("add", ev => {
      const test = ev.detail;
      this.tests[test.id] = test;
      updateRows();
    });
    this.addEventListener("remove", ev => {
      const test = ev.detail;
      delete this.tests[test.id];
      this.removeTestElements(test.id);
      updateRows();
    });
    this.addEventListener("update", ev => {
      const test = ev.detail;
      this.tests[test.id] = test;
      (this.elements[test.id] || []).forEach(e =>
        e.dispatchEvent(new CustomEvent("update", { detail: test }))
      );
      updateRows();
    });
    this.tests = {};
    this.id = id;
  }

  get [Symbol.toStringTag]() {
    return "TestSuite";
  }

  getTestElements(testId) {
    return (this.elements[testId] = this.elements[testId] || new Set());
  }

  addTestElement(testId, elt) {
    d3.select(elt).classed('registered', true);
    this.getTestElements(testId).add(elt);
    return elt;
  }

  // When an individual element is removed from the DOM
  removeTestElement(testId, elt) {
    this.getTestElements(testId).remove(elt);
  }

  // When a test is deleted.
  removeTestElements(testId) {
    const remove = this.elements[testId];
    this.elements[testId] = [];
    remove.forEach(e => e.remove());
  }

  // This is how a test is normally run: = by passing a test spec to TestSuite.add.
  add(specOrTest) {
    const doAdd = t => {
      if (t instanceof Test) {
        const test = t;
        this.tests[test.id] = test.result;
        const propagate = ev => {
          this.dispatchEvent(new CustomEvent(ev.type, { detail: ev.detail }));
        };
        this.addListener("update", test, propagate);
        this.addListener("remove", test, propagate);
        this.dispatchEvent(new CustomEvent("add", { detail: test.result }));
        if (!test.noRun) {
          return test.run();
        }
        return test;
      } else {
        return this.add(new Test(t));
      }
    };
    if (Array.isArray(specOrTest)) {
      const results = specOrTest.map(doAdd);
      return Promise.all(results).then(results => html`<div>${results}</div>`);
    } else {
      return doAdd(specOrTest);
    }
  }

  updateTest(testId, node) {
    const addItem = val => s => {
      s.selectAll('*').remove();
      s.text();
      val instanceof Element ? s.insert(() => val) : s.text(val);
      return s;
    };
    const test = this.tests[testId];
    this.addTestElement(testId, node);
    const tr = d3
      .select(node)
      .call(s =>
        this.onUpdate(testId, s, (s, t) =>
          s.attr('class', `test ${t.testName} ${t.status}`)
        )
      )
      .call(tr =>
        [
          'testName',
          'status',
          'elapsedTime',
          'endTime',
          'failMessage1'
        ].forEach(k =>
          tr
            .selectAll(`td.${k}`)
            .data([k], k => k)
            .join('td')
            .attr('class', k)
            .call(s =>
              this.onUpdate(testId, s, (s, test) => addItem(test[k])(s)) //
                .call(addItem(test[k]))
            )
        )
      );
  }

  addListener(type, target, action) {
    target.addEventListener(type, action);
    target.disposable = Generators.disposable(target, () => {
      target.removeEventListener(type, action);
    });
  }

  updateTests(node) {
    d3.select(node)
      .select(`tbody`)
      .call(s =>
        this.onUpdate(Symbol.for("Suite"), s, s =>
          s
            .call(s =>
              s
                .selectAll('tr')
                .data(Object.values(this.sortedTests), t => t.id)
                .call(s =>
                  s
                    .join('tr')
                    .each((test, i, g) => this.updateTest(test.id, g[i]))
                )
            )
            .selectAll('tr')
            .data(Object.values(this.sortedTests), t => t.id)
            .sort(this.sortCmp())
        )
      );
  }

  sortCmp() {
    const cmpStatus = (a, b) =>
      a.status === b.status
        ? 0
        : STATUS_NAMES.indexOf(a.status) < STATUS_NAMES.indexOf(b.status)
        ? -1
        : 1;
    const cmpEnd = (a, b) =>
      a.endTime === b.endTime ? 0 : a.endTime < b.endTime ? -1 : 1;
    const cmpName = (a, b) =>
      a.name === b.name ? 0 : a.name < b.name ? -1 : 1;
    return (a, b) =>
      cmpStatus(a, b) == 0
        ? cmpName(a, b) === 0
          ? cmpEnd(a, b)
          : cmpName(a, b)
        : cmpStatus(a, b);
  }

  get sortedTests() {
    return Object.values(this.tests).sort(this.sortCmp());
  }

  summary() {
    const tests = this.sortedTests;
    return d3
      .select(TEST_FORMATS.table)
      .clone(true)
      .attr("id", this.id)
      .call(c => {
        const node = c.node();
        const removals = new Set();
        node.addEventListener("DOMNodeRemovedFromDocument", () =>
          d3
            .select(node)
            .selectAll('.registered')
            .each((d, i, g) => removals.add(g[i]))
            .call(c => this.removeNodes(removals))
        );
      })
      .call(c => this.updateTests(c.node()))
      .node();
  }
}
)});
  main.variable(observer("F")).define("F", ["md","Generators","TESTS","Promises","raceAll"], async function*(md,Generators,TESTS,Promises,raceAll)
{
  const d = async v =>
    md`_\[Launch 10 tests with random results and delays. Edit to see the code.]_
${await v}`;

  const ds = [...Generators.range(0, 10)].map(i =>
    d(
      TESTS.add({
        id: `MyTest ${i}`,
        options: {
          text: 'This is a test.'
        },
        async test(options) {
          await Promises.delay(15000 * Math.random());
          if (Math.random() < 0.3) throw new Error("Too random");
          return Math.random() < 0.5 ? options.text : "wrong trousers";
        },
        expect(ex) {
          ex.toEqual(this.options.text);
        }
      })
    )
  );
  for await (const v of raceAll(ds)) {
    yield v;
  }
}
);
  main.variable(observer()).define(["TESTS"], function(TESTS){return(
TESTS.summary()
)});
  main.variable(observer("viewof test_styles")).define("viewof test_styles", ["def","html"], function(def,html){return(
def`**test_styles** = CSS support for test displays to import and use.
VALUE`(
  html`<style>

@keyframes showrun {
  0%, 50%, 100%  {background-color:rgb(255,255,0); }
  25%  {background-color:rgb(220,255,120); }
  75%  {background-color:rgb(255,220,120); }
}

.test { padding: 10px 6px 0px 6px; border: solid black; }
.test.initialized { background-color: silver; }
.test.errored { background-color: rgb(255,130,150); }
.test.failed { background-color: rgb(240,185,185); }
.test.ok { background-color: lightgreen; }
.test.running {
  background-color: rgb(255,255,0);
  animation: showrun 1s ease 0s infinite;
}
.test.not-run { color: gray }
.status, .id, .testName { font-weight: bold; }
.failMessage { white-space: pre; margin-left: +2em;}
table.test { min-width: 100%; width: 100%; }
table.test thead { background-color: rgb(200,224,255); }
table.test td, table.test th { border: 0.5px solid silver; padding: 0px 5px 0px 5px; }

</style>`
)
)});
  main.variable(observer("test_styles")).define("test_styles", ["Generators", "viewof test_styles"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`## Appendix`
)});
  main.variable(observer("viewof TEST_FORMATS")).define("viewof TEST_FORMATS", ["def","html"], function(def,html){return(
def`TEST_FORMATS = ...
>You could tweak these, but I'd go with altering the CSS instead.
The \`fill\` class marks the fields to be filled in, together with a class to
mark what should go there.
`(
  (() => {
    const nameField = html`<span class='fill testName'></span>`;
    const fail = html`<div class='fill failMessage'></div>`;
    const status = html`<span class='fill status'></span>`;
    const time = html`<span class='fill time'></span>`;
    const use = n => n.cloneNode(true);
    return {
      detail: html`<div class='test'>
Test ${use(nameField)}: ${use(status)}${use(fail)}
</div>`,
      status,
      fail,
      row: html`<tr class='test'>
                    <td class='testName'>${use(nameField)}</td>
                    <td class='status'>${use(status)}</td>
                    <td class='failMessage'>${use(fail)}</td>
                    <td class='elapsedTime'>${use(time)}</td>
                 </tr>`,
      table: html`
<table class="test">
  <thead>
    <tr><th>Test</th><th>Status</th><th>Seconds</th><th>Completed</th><th>Message</th></tr>
  </thead>
  <tbody></tbody>
</table>`
    };
  })()
)
)});
  main.variable(observer("TEST_FORMATS")).define("TEST_FORMATS", ["Generators", "viewof TEST_FORMATS"], (G, _) => G.input(_));
  main.variable(observer("STATUS_NAMES")).define("STATUS_NAMES", function(){return(
['inititialized ', 'running', 'errored', 'failed', 'ok']
)});
  main.variable(observer("DisplayManager")).define("DisplayManager", ["d3"], function(d3){return(
class DisplayManager {
  constructor() {
    const target = document.createTextNode(null);
    this.addEventListener = target.addEventListener.bind(target);
    this.removeEventListener = target.removeEventListener.bind(target);
    this.dispatchEvent = target.dispatchEvent.bind(target);

    this.elements = {};
  }

  removeNodes(removals) {
    Object.keys(this.elements).forEach(k => {
      const nodes = (this.elements[k] || []).filter(n => !removals.has(n));
      this.elements[k] = nodes;
    });
  }

  onUpdate(testId, sel, fn) {
    const node = sel.node();
    return sel
      .on("update", () => fn(d3.select(node), testId && this.tests[testId]))
      .call(s => this.addTestElement(testId, node))
      .call(s => fn(d3.select(node), this.tests[testId]));
  }
}
)});
  main.variable(observer("TESTS")).define("TESTS", ["TestSuite"], function(TestSuite){return(
new TestSuite({ name: "TestTest" })
)});
  main.variable(observer("S")).define("S", ["TESTS"], function(TESTS){return(
new Set(TESTS.elements['Test-5'])
)});
  const child1 = runtime.module(define1);
  main.import("ago", child1);
  main.import("liveData", child1);
  main.import("clsIdGen", child1);
  main.import("raceAll", child1);
  const child2 = runtime.module(define2);
  main.import("def", child2);
  main.variable(observer("expect")).define("expect", ["require"], function(require){return(
['expect', 'jest-extended', 'jest-chain'].map(l => require(l))[0]
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  return main;
}

# ChangeLog

## Version 0.1.32
_date: 2020-06-14_

* Further extend MappableGenerators with the most useful methods from Array:
map, filter, reduce, concat, flat, flatMap, join
* Don't add a suffix to supplied function names.

## Version 0.1.31
_date: 2020-06-12_

* Add basic graphing function
* Fixed a number formatting bug that affected scientific and engineering notation.
* Add routines for primality, xgcd, etc.
* Add units for US Ton, nautical mile, knot.
* Made ranges mappable, filterable, etc.
* Update dependencies
* Fix landing page indentation for local mode.
* Point at the right location for CHANGELOG.html
* Update the ObservableHQ test landing page.
* Now requires Node.JS >= 14.0 (and modern browsers).
  * (for optional chaining).

## Version 0.1.30
_date: 2020-06-04_

* Fixed broken link to CHANGELOG in published README
* Convert README.md in ObservableHQ package.
* Add more links to the release landing page.

## Version 0.1.29
_date: 2020-06-04_

* Publish the ObservableHQ content to the Github Pages.

## Version 0.1.28
_date: 2020-06-03_

* Add unpkg: entry in package.json
* Update ObservableHQ content
* Include ObservableHQ content in the npm package.

## Version 0.1.27
_date: 2020-06-03_

* Use Ramda directly (now that it's fixed). Avoids problems with some loaders.
* Fix missing names for units (like "mass").
* Block some SI prefix abuse (e.g. 'kilom', 'kmeter'). Needs rationalized naming to do better.
* Drastically narrow the set of public exports to make things less confusing.

## Version 0.1.26
_date: 2020-06-02_

* Vector, Point, Rotation, Orientation now satisfy IPFunction directly; only numbers need to be wrapped.
* This means they also now have units, which become required arguments for their construction, so constant(),
  vector(), point(), rotation(), and orientation() now require them.
* Arithmetic requires compatible units.
* The TypeScript typing for units got a bit simpler and a bit more reliable, but still fails on certain key inferences.
* LaTeX generation got a bit more consistent, and the setup git simpler.
* Implement link rewriting for typedoc-generated doc so it can link to non-TSDoc-generated documents.
* Change Piecewise.at to take tuples rather than alternating pairs.
* Fix Piecewise integration bug.
* Update ObservableHQ page for the changes.
* Support loading via `PM = require("@rwk/physics-math@0.1.26"); // no extra path needed.`

## Version 0.1.25
_date: 2020-05-30_

* More documentation tweaks and cleanups.

## Version 0.1.24
_date: 2020-05-30_

* Generate more documentation site glue.

## Version 0.1.17 - 0.1.23
_date: 2020-05-29_

* Rudimentary doc site prep.
* Support LaTeX in generated documentation.

## Version 0.1.9 - Version 0.1.16
_date: 2020-05-29_

Take a stab at auto-deploy of docs.

## Version 0.1.8
_Date: 2020-05-28_

* Fix 'normal' number formatting.
* Fix scientific and engineering number formatting.
* NumberFormat enum is now string-valued to reduce confusion.
* Unit's now get the same .html/.tex protocol as expressions.
  * Data objects like Vectors will get this soon.
* StyleContext now proxies the .set and .wrap methods, allowing easier local control.
* Style keys are now validated. No more freestyle styles.
* Only try to load katex once. If it refuses, move on.
* Add missing 'serve' package dev dependency.
* Update to Typescript 3.9.3.
* Add the ObservableHQ test page for the package.
* Use \Leftarrow to mark function units
  * e.g. \\( \operatorname{f}(t) \Leftarrow {\dfrac{m}{s}} \\)
* Improve various formatting
* Add piecewise functions.
* Try to avoid redundant CI build on release.

## Version 0.1.7
_Date: 2020-05-24_

* Remember the initial value for DEFAULT_STYLE in INITIAL_STYLE
* Export NumberFormat
* Rename QuaternionDerivative to RotationDerivative

## Version 0.1.6
_Date: 2020-05-24_

* Polynomial Arithmetic
* Number formats.
* Improved styling protocol
* Consistent expression of units at the outermost edge.
* Functions display units as \\( \operatorname{f}(t) \Rightarrow {\dfrac{m}{s}} \\)
* Integration/differentiation of polynomials is now correct.
* Indefinite and definite integrals now display.

## Version 0.1.5
_Date: 2020-05-22_

* API documentation modularity.
* Update to typedoc 0.7.17 and remove workarounds.
* LaTeX styling API to manage style separately from semantics.
* Polynomials format correctly.
* Ramda is now a runtime dependency.



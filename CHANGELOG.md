# ChangeLog

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


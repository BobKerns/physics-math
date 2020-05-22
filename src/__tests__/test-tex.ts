/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Tests for generation of LaTeX.
 */

import {constant} from "../scalar";
import {Units} from "../unit-defs";
import {GFunction} from "../general-fns";
import {Poly} from "../poly";

const tex = String.raw;

describe("Primitives", () => {
     test('ScalarConstant',
         () => expect(constant(3, Units.time).tex)
             .toBe(tex`{3} {\textcolor{0000ff}{\text{s}}}`));
    test('GFunction',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').tex)
            .toBe(tex`{{\operatorname{f}(t)} \Rightarrow {\textcolor{0000ff}{\text{kg}}}}`));
    test('GFunction Param',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').toTex('x'))
            .toBe(tex`{{\operatorname{f}(x)} \Rightarrow {\textcolor{0000ff}{\text{kg}}}}`));
    test('Acceleration',
        () => expect(constant(3, Units.acceleration).tex)
            .toBe(tex`{3} {\textcolor{0000ff}{\dfrac{\text{m}}{\text{s}^{2}}}}`));
});

describe("Derivatives", () => {
    test('GFunction',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').derivative().tex)
            .toBe(tex`{{{\dfrac{d}{dt}}{\operatorname{f}(t)}} \Rightarrow {\textcolor{0000ff}{\dfrac{\text{m}}{\text{s}^{2}}}}}`));
    test('GFunction2',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').derivative().derivative().tex)
            .toBe(tex`{{{\dfrac{d^{2}}{dt}}{\operatorname{f}(t)}} \Rightarrow {\textcolor{0000ff}{\dfrac{\text{m}}{\text{s}^{3}}}}}`));
    test('Polynomial', () => expect(new Poly(Units.angularVelocity, 3, 7, 8).tex)
        .toBe(tex`3 + {7 {t}} + {8 {t}^{2}}`));
    test('Polynomial 0-suppress', () => expect(new Poly(Units.angularVelocity, 0, 7, 0, 8).tex)
        .toBe(tex`{7 {t}} + {8 {t}^{3}}`));
    test('Polynomial 0', () => expect(new Poly(Units.angularVelocity, 0, 0, 0, 0).tex)
        .toBe(tex`0`));
});

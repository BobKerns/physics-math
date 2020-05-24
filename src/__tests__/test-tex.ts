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
import {tex} from '../utils';
import {DEFAULT_STYLE} from "../latex";

describe("Primitives", () => {
    test('ScalarConstant',
        () => expect(constant(3, Units.time).toTex())
            .toBe(tex`3`));
    test('ScalarConstant w/ units',
        () => expect(constant(3, Units.time).tex)
            .toBe(tex`{{3}\ {\textcolor{ff0000}{\text{s}}}}`));
    test('GFunction',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').toTex())
            .toBe(tex`\operatorname{f}(t)`));
    test('GFunction w units',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').tex)
            .toBe(tex`{{\operatorname{f}(t)} \Rightarrow {\textcolor{ff0000}{\text{kg}}}}`));
    test('GFunction Param',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').toTex('x'))
            .toBe(tex`\operatorname{f}(x)`));
    test('GFunction Param w/ units',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').toTexWithUnits('x'))
            .toBe(tex`{{\operatorname{f}(x)} \Rightarrow {\textcolor{ff0000}{\text{kg}}}}`));
    test('Acceleration',
        () => expect(constant(3, Units.acceleration).toTex())
            .toBe(tex`3`));
    test('Acceleration w/ units',
        () => expect(constant(3, Units.acceleration).tex)
            .toBe(tex`{{3}\ {\textcolor{ff0000}{\Large{\frac{\text{m}}{\text{s}^{2}}}}}}`));
});

describe("Derivatives", () => {
    test('GFunction',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').derivative().toTex())
            .toBe(tex`{{\dfrac{d}{dt}}{\operatorname{f}(t)}}`));
    test('GFunction w/ units',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').derivative().tex)
            .toBe(tex`{{{{\dfrac{d}{dt}}{\operatorname{f}(t)}}} \Rightarrow {\textcolor{ff0000}{\Large{\frac{\text{m}}{\text{s}^{2}}}}}}`));
    test('GFunction2',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').derivative().derivative().toTex())
            .toBe(tex`{{\dfrac{d^{2}}{dt}}{\operatorname{f}(t)}}`));
    test('GFunction2 w/ units',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').derivative().derivative().tex)
            .toBe(tex`{{{{\dfrac{d^{2}}{dt}}{\operatorname{f}(t)}}} \Rightarrow {\textcolor{ff0000}{\Large{\frac{\text{m}}{\text{s}^{3}}}}}}`));
    test('Polynomial',
        () => expect(new Poly(Units.angularVelocity, 3, 7, 8).toTex())
            .toBe(tex`3 + {7 {t}} + {8 {t}^{2}}`));
    test('Polynomial w/ units',
        () => expect(new Poly(Units.angularVelocity, 3, 7, 8).tex)
            .toBe(tex`{{(3 + {7 {t}} + {8 {t}^{2}})} \Rightarrow {\textcolor{ff0000}{\Large{\frac{\text{rad}}{\text{s}}}}}}`));
    test('Polynomial 0-suppress',
        () => expect(new Poly(Units.angularVelocity, 0, 7, 0, 8).tex)
            .toBe(tex`{{({7 {t}} + {8 {t}^{3}})} \Rightarrow {\textcolor{ff0000}{\Large{\frac{\text{rad}}{\text{s}}}}}}`));
    test('Polynomial 0',
        () => expect(new Poly(Units.angularVelocity, 0, 0, 0, 0).tex)
            .toBe(tex`{{0}\ {\textcolor{ff0000}{\Large{\frac{\text{rad}}{\text{s}}}}}}`));
});

describe('Integrals', () => {
    test('GFunction',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').integral().toTex())
            .toBe(tex`\int{{(\operatorname{f}(t))}\ \mathrm{d}{t}}`));
    test('GFunction with units',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').integral().tex)
            .toBe(tex`{{\int{{(\operatorname{f}(t))}\ \mathrm{d}{t}}} \Rightarrow {\textcolor{ff0000}{\text{m}}}}`));
});

describe('styles', () => {
    describe('numbers', () => {
        test('1/2', () =>
            expect(DEFAULT_STYLE.context.number(1 / 2))
                .toBe(tex`\frac{1}{2}`));
        test('zero [data]', () =>
            expect(DEFAULT_STYLE.numberSpecials.get(0))
                .not.toBeDefined());
        test('zero [data]', () =>
            expect(DEFAULT_STYLE.context.number(0))
                .toBe('0'));
    });
    describe('units', () => {
        test('No symbol', () =>
            expect(DEFAULT_STYLE.context.unit(Units.velocity))
                .toBe(tex`\textcolor{ff0000}{\Large{\frac{\text{m}}{\text{s}}}}`));

    })

});

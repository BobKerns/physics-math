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
import {DEFAULT_STYLE, INITIAL_STYLE, NumberFormat} from "../latex";

describe("Primitives", () => {
    test('ScalarConstant',
        () => expect(constant(3, Units.time).toTex())
            .toBe(tex`3`));
    test('ScalarConstant w/ units',
        () => expect(constant(3, Units.time).tex)
            .toBe(tex`{{3}\ {\textcolor{ff0000}{\text{s}}}}`));
    test('GFunction',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').toTex())
            .toBe(tex`\operatorname{f}({t})`));
    test('GFunction w units',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').tex)
            .toBe(tex`{{\operatorname{f}({t})} \Leftarrow {\textcolor{ff0000}{\text{kg}}}}`));
    test('GFunction Param',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').toTex('x'))
            .toBe(tex`\operatorname{f}({x})`));
    test('GFunction Param w/ units',
        () => expect(new GFunction(() => 3, Units.mass).setName_('f').toTexWithUnits('x'))
            .toBe(tex`{{\operatorname{f}({x})} \Leftarrow {\textcolor{ff0000}{\text{kg}}}}`));
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
            .toBe(tex`{{\dfrac{d}{dt}}{\operatorname{f}({t})}}`));
    test('GFunction w/ units',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').derivative().tex)
            .toBe(tex`{{{{\dfrac{d}{dt}}{\operatorname{f}({t})}}} \Leftarrow {\textcolor{ff0000}{\Large{\frac{\text{m}}{\text{s}^{2}}}}}}`));
    test('GFunction2',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').derivative().derivative().toTex())
            .toBe(tex`{{\dfrac{d^{2}}{dt}}{\operatorname{f}({t})}}`));
    test('GFunction2 w/ units',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').derivative().derivative().tex)
            .toBe(tex`{{{{\dfrac{d^{2}}{dt}}{\operatorname{f}({t})}}} \Leftarrow {\textcolor{ff0000}{\Large{\frac{\text{m}}{\text{s}^{3}}}}}}`));
    test('Polynomial',
        () => expect(new Poly(Units.angularVelocity, 3, 7, 8).toTex())
            .toBe(tex`3 + {7 {t}} + {8 {t}^{2}}`));
    test('Polynomial w/ units',
        () => expect(new Poly(Units.angularVelocity, 3, 7, 8).tex)
            .toBe(tex`{{(3 + {7 {t}} + {8 {t}^{2}})} \Leftarrow {\textcolor{ff0000}{\Large{\frac{\text{rad}}{\text{s}}}}}}`));
    test('Polynomial 0-suppress',
        () => expect(new Poly(Units.angularVelocity, 0, 7, 0, 8).tex)
            .toBe(tex`{{({7 {t}} + {8 {t}^{3}})} \Leftarrow {\textcolor{ff0000}{\Large{\frac{\text{rad}}{\text{s}}}}}}`));
    test('Polynomial 0',
        () => expect(new Poly(Units.angularVelocity, 0, 0, 0, 0).tex)
            .toBe(tex`{{0}\ {\textcolor{ff0000}{\Large{\frac{\text{rad}}{\text{s}}}}}}`));
});

describe('Integrals', () => {
    test('GFunction',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').integral().toTex())
            .toBe(tex`\int{{(\operatorname{f}({t}))}\ \mathrm{d}{t}}`));
    test('GFunction with units',
        () => expect(new GFunction(() => 3, Units.velocity).setName_('f').integral().tex)
            .toBe(tex`{{\int{{(\operatorname{f}({t}))}\ \mathrm{d}{t}}} \Leftarrow {\textcolor{ff0000}{\text{m}}}}`));
});

describe('styles', () => {
    describe('numbers', () => {
        describe('initial', () => {
            test('1/2', () =>
                expect(INITIAL_STYLE.context.number(1 / 2))
                    .toBe(tex`\frac{1}{2}`));
            test('zero [data]', () =>
                expect(INITIAL_STYLE.numberSpecials.get(0))
                    .not.toBeDefined());
            test('zero [data]', () =>
                expect(INITIAL_STYLE.context.number(0))
                    .toBe('0'));
        });
        describe('normal', () => {
            const NORMAL = INITIAL_STYLE.set({numberFormat: NumberFormat.normal, numberPrecision: 4});
            test("Normal set", () => expect(NORMAL.context.numberFormat).toBe(NumberFormat.normal));
            test("Normal numbers big", () => expect(NORMAL.context.number(12345678)).toBe('12345678'));
            test("Normal numbers small", () => expect(NORMAL.context.number(0.000012345678)).toBe('0.00001235'));
        });
        describe('Scientific', () => {
            const SCI = INITIAL_STYLE.set({
                numberFormat: NumberFormat.scientific,
                numberPrecision: 3,
                numberTrimTrailingZero: false
            }).context;
            test('3.00', () =>
                expect(SCI.number(3))
                    .toBe("3.00"));
            test('300', () =>
                expect(SCI.number(300))
                    .toBe(tex`3.00 x 10^{2}`));
            test('3000', () =>
                expect(SCI.number(3000))
                    .toBe(tex`3.00 x 10^{3}`));
            test('0.03', () =>
                expect(SCI.number(0.03))
                    .toBe(tex`3.00 x 10^{-2}`));
            test('0.003', () =>
                expect(SCI.number(0.003))
                    .toBe(tex`3.00 x 10^{-3}`));
            test('3.01', () =>
                expect(SCI.number(3.01))
                    .toBe("3.01"));
            test('301', () =>
                expect(SCI.number(301))
                    .toBe(tex`3.01 x 10^{2}`));
            test('0.00301', () =>
                expect(SCI.number(0.00301))
                    .toBe(tex`3.01 x 10^{-3}`));
        });
        describe('Scientific Loose', () => {
            const SCI = INITIAL_STYLE.set({
                numberFormat: NumberFormat.scientific,
                numberPrecision: 3,
                numberTrimTrailingZero: true
            }).context;
            test('3.00', () =>
                expect(SCI.number(3))
                    .toBe("3"));
            test('300', () =>
                expect(SCI.number(300))
                    .toBe(tex`3 x 10^{2}`));
            test('3000', () =>
                expect(SCI.number(3000))
                    .toBe(tex`3 x 10^{3}`));
            test('0.03', () =>
                expect(SCI.number(0.03))
                    .toBe(tex`3 x 10^{-2}`));
            test('0.003', () =>
                expect(SCI.number(0.003))
                    .toBe(tex`3 x 10^{-3}`));
            test('3.01', () =>
                expect(SCI.number(3.01))
                    .toBe("3.01"));
            test('301', () =>
                expect(SCI.number(301))
                    .toBe(tex`3.01 x 10^{2}`));
            test('0.00301', () =>
                expect(SCI.number(0.00301))
                    .toBe(tex`3.01 x 10^{-3}`));
        });

        describe('Engineering', () => {
            const SCI = INITIAL_STYLE.set({
                numberFormat: NumberFormat.engineering,
                numberPrecision: 3,
                numberTrimTrailingZero: false
            }).context;
            test('3.00', () =>
                expect(SCI.number(3))
                    .toBe("3.00"));
            test('300', () =>
                expect(SCI.number(300))
                    .toBe(tex`300`));
            test('3000', () =>
                expect(SCI.number(3000))
                    .toBe(tex`3.00 x 10^{3}`));
            test('0.03', () =>
                expect(SCI.number(0.03))
                    .toBe(tex`0.0300`));
            test('0.003', () =>
                expect(SCI.number(0.003))
                    .toBe(tex`3.00 x 10^{-3}`));
            test('3.01', () =>
                expect(SCI.number(3.01))
                    .toBe("3.01"));
            test('301', () =>
                expect(SCI.number(301))
                    .toBe(tex`301`));
            test('0.00301', () =>
                expect(SCI.number(0.00301))
                    .toBe(tex`3.01 x 10^{-3}`));
        });
    });
    describe('units', () => {
        test('No symbol', () =>
            expect(DEFAULT_STYLE.context.unit(Units.velocity))
                .toBe(tex`\textcolor{ff0000}{\Large{\frac{\text{m}}{\text{s}}}}`));

    });

});

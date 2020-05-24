/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Test the Units package functionality.
 */

import {IUnitBase, Primitive} from "../primitive-units";
import {
    defineUnit, getUnit, TEST, defineAlias
} from "../units";
import {Units} from "../unit-defs";

import PRIMITIVE_MAP = TEST.PRIMITIVES_MAP_;
import NAMED_UNITS = TEST.NAMED_UNITS_;
import deleteUnit = TEST.deleteUnit_;
import {tex, Throw} from "../utils";
import parsePrefix = TEST.parsePrefix_;
import RE_whitespace = TEST.RE_whitespace_;
import RE_prefix_name_concat = TEST.RE_prefix_name_concat_;
import RE_symbol = TEST.RE_symbol_;

describe("Primitive", () => {
    // If this test fails, the tests need to be revisited for the change in primitives.
    test('# of primitives', () => expect(Object.keys(PRIMITIVE_MAP).length).toBe(10));
    (Object.keys(PRIMITIVE_MAP) as (keyof typeof Primitive)[]).forEach(k => {
        const prim = PRIMITIVE_MAP[k];
        test(`name ${k}`, () => expect(NAMED_UNITS[prim.name].name).toBe(prim.name));
    });
    const expectations: { [k in Primitive]: [string, string, string?] } = {
        time: ['second', 's', 't'],
        mass: ['kilogram', 'kg', 'm'],
        length: ['meter', 'm', 'l'],
        current: ['ampere', 'A', 'A'],
        cycles: ['cycle', 'cycle', 'c'],
        amount: ['mole', 'mol', 'n'],
        temperature: ['kelvin', 'K', 'T'],
        candela: ['candela', 'cd', 'c'],
        angle: ['radian', 'rad', '𝜃'],
        solidAngle: ['steridian', 'sr']
    };
    const keys = Object.keys(expectations) as Primitive[];
    keys.forEach(k => {
        test(`${k} name`, () => expect(PRIMITIVE_MAP[k].name).toBe(expectations[k][0]));
        test(`${k} symbol`, () => expect(PRIMITIVE_MAP[k].symbol).toBe(expectations[k][1]));
        test(`${k} varName`, () => expect(PRIMITIVE_MAP[k].varName).toBe(expectations[k][2]));
    });
    test('toSI', () => expect(Units.mass.toSI(1)).toEqual([1, Units.mass]));
    test('fromSI', () => expect(Units.mass.fromSI(1, Units.mass)).toEqual([1, Units.mass]));
});

describe("Define", () => {
    test("Redefine primitive", () => expect(defineUnit({mass: 1})).toBe(Units.mass));
    test("Define w/ bogus primitive",
        // @ts-expect-error
        () => expect(() => defineUnit({bOgUs: 1}))
            .toThrowError(/.*bOgUs.*/));
    test("Redefine velocity", () =>
        expect(defineUnit({length: 1, time: -1}))
            .toBe(Units.velocity));
    test("Redefine new name", () => {
        const nUnit = defineUnit({length: 1, time: -1}, {}, '_test_name_');
        expect(nUnit).toBe(Units.velocity);
        expect(getUnit('_test_name_')).toBe(Units.velocity);
    });
    test(`Define named`, () => {
        const nUnit = defineUnit({mass: 3}, {name: '_test_bogus_'});
        try {
            expect(nUnit.name).toBe('_test_bogus_');
            expect(getUnit('_test_bogus_')).toBe(nUnit);
        } finally {
            deleteUnit(nUnit);
        }
    });
    test(`Define symbol`, () => {
        const nUnit = defineUnit({mass: 3}, {symbol: '_test_bogus_'});
        try {
            expect(nUnit.symbol).toBe('_test_bogus_');
            expect(getUnit('_test_bogus_')).toBe(nUnit);
        } finally {
            deleteUnit(nUnit);
        }
    });
    test(`Define varName`, () => {
        const nUnit = defineUnit({mass: 3}, {varName: '_test_bogus_'});
        try {
            expect(nUnit.varName).toBe('_test_bogus_');
            expect(() => Throw('_test_bogus_')).toThrowError();
        } finally {
            deleteUnit(nUnit);
        }
    });
    test('No unit', () => expect(defineUnit({})).toBe(Units.unity));
    test('Add options', () => {
        expect(Units.unity.attributes._test_option_).toBeUndefined();
        try {
            expect(defineUnit({}, {_test_option_: 17})).toBe(Units.unity)
            expect(Units.unity.attributes._test_option_).toBe(17);
        } finally {
            delete Units.unity.attributes._test_option_;
        }
    });
    test('Add options no override', () => {
        expect(Units.unity.attributes.si_base).toBe(true);
        try {
            expect(defineUnit({}, {si_base: false})).toBe(Units.unity)
            expect(Units.unity.attributes.si_base).toBe(true);
        } finally {
            Units.unity.attributes.si_base = true;
        }
    });
    test('toSI', () => expect(Units.velocity.toSI(1)).toEqual([1, Units.velocity]));
    test('fromSI', () => expect(Units.velocity.fromSI(1, Units.mass)).toEqual([1, Units.velocity]));
});

describe(`Unit Arithmetic`, () => {
    describe(`Basics`, () => {
        test('add OK', () => expect(Units.area.add(Units.area)).toBe(Units.area));
        // @ts-expect-error
        test('add Bad', () => expect(() => Units.area.add(Units.length)).toThrowError());
        test('multiply', () => expect(getUnit('m').multiply(getUnit('s'))).toBe(defineUnit({length: 1, time: 1})));
        test('divide 2', () => expect(Units.acceleration.multiply(getUnit('s'))).toBe(Units.velocity));
        test('square', () => expect(Units.length.multiply(Units.length)).toBe(Units.area));
        test('divide', () => expect(getUnit('m').divide(getUnit('s'))).toBe(Units.velocity));
        test('divide 2', () => expect(Units.velocity.divide(getUnit('s'))).toBe(Units.acceleration));
        test('divide cancel', () => expect(Units.mass.divide(Units.mass)).toBe(Units.unity));
    });
    describe(`Common Combos`, () => {
        test(`volts x amps`, () => expect(Units.voltage.multiply(Units.current)).toBe(Units.power));
        test(`time x amps`, () => expect(Units.time.multiply(Units.current)).toBe(Units.charge));
        test(`force x length`, () => expect(Units.force.multiply(Units.length)).toBe(Units.energy));
        test(`power x time`, () => expect(Units.power.multiply(Units.time)).toBe(Units.energy));
        test(`force x time`, () => expect(Units.force.multiply(Units.time)).toBe(Units.momentum));
        test(`mass x velocity`, () => expect(Units.mass.multiply(Units.velocity)).toBe(Units.momentum));
        test(`mass x velocity x velocity`, () => expect(Units.mass.multiply(Units.velocity).multiply(Units.velocity)).toBe(Units.energy));
        test(`energy / time`, () => expect(Units.energy.divide(Units.time)).toBe(Units.power));
    });
    describe(`Common Symbols`, () => {
        const doTest = ([sym, name, u]: [string, string, IUnitBase]) => {
            test(`Symbol ${sym}`, () => expect(getUnit(sym)).toBe(u));
            test(`Symbol ${sym}`, () => expect(getUnit(name)).toBe(u));
        };
        const specs: ([string, string, IUnitBase])[] =
            [
                ['J', 'joule', Units.energy],
                ['W', 'watt', Units.power],
                ['N', 'newton', Units.force]
            ];
        specs.forEach(doTest);
    })
});

describe(`Formatting`, () => {
    test(`Simple name`, () =>
        expect(Units.velocity.name).toBe('m/s'));
    test(`Exponent name`, () =>
        expect(Units.acceleration.name).toBe('m/s^2'));
    test(`Primitive TeX`, () =>
        expect(Units.mass.tex).toBe(tex`\text{kg}`));
    test(`Simple TeX`, () =>
        expect(Units.velocity.tex).toBe(tex`\Large{\frac{\text{m}}{\text{s}}}`));
    test(`Exponent TeX`, () =>
        expect(Units.acceleration.tex).toBe(tex`\Large{\frac{\text{m}}{\text{s}^{2}}}`));
});

describe(`Aliases`, () => {
    const [aName, aSymbol, aOther] = ['fR0G', 'f0GGY', 'PrinceOnTheLam'];
    const alias = defineAlias(aName, aSymbol, {bill: 'cat'},
        Units.mass, 3.5, 2,
        aOther);
    afterAll(() => deleteUnit(alias));
    test(`name`, () => expect(alias.name).toBe(aName));
    test(`symbol`, () => expect(alias.symbol).toBe(aSymbol));
    test(`otherName`, () => expect(getUnit(aOther)).toBe(alias));
    test(`getUnit`, () => expect(getUnit(aName)).toBe(alias));
    test('getUnit siOnly', () =>
        expect(() => getUnit(aName, true))
            .toThrowError());
    test(`attribute`, () => expect(alias.attributes.bill).toBe('cat'));
    test('toSI', () => expect(alias.toSI(1)).toEqual([5.5/1000, Units.mass]));
    test('fromSI', () => expect(alias.fromSI(5.5/1000, Units.mass)).toEqual([1, alias]));
});

describe('Parse', () => {
    describe(`Regex`, () => {
        test(`canon1`,
            () => expect('foo   bar'.replace(RE_whitespace, ' '))
                .toBe('foo bar'));
        test(`canon2a`, () =>
            expect(`kilo meter`.replace(RE_prefix_name_concat,
                (x: string, p: string, s: string) => `${p}${s}`))
                .toBe('kilometer'));
        test(`canon2b`, () =>
            expect(`kilo-meter`.replace(RE_prefix_name_concat,
                (x: string, p: string, s: string) => `${p}${s}`))
                .toBe('kilometer'));
        test(`symbol mu`, () =>
            expect(RE_symbol.exec(`μm`)?.map(s => '' + s))
                .toEqual([`μm`, `μ`, `m`]));
    });

    describe(`get`, () => {
        test('parse Mm', () =>
            expect(parsePrefix('Mm')?.toSI(2))
                .toEqual([2000000, Units.length]));
        test('get Mm', () =>
            expect(getUnit('Mm').toSI(2))
                .toEqual([2000000, Units.length]));
        test('get μm', () =>
            expect(getUnit('μm').toSI(2))
                .toEqual([0.000002, Units.length]));
        test('get um', () =>
            expect(getUnit('um').toSI(2))
                .toEqual([0.000002, Units.length]));
        test('get Mg', () =>
            expect(getUnit('Mg').toSI(2))
                .toEqual([2000, Units.mass]));
        test('get mg', () =>
            expect(getUnit('mg').toSI(2))
                .toEqual([0.000002, Units.mass]));
        // noinspection SpellCheckingInspection
        test('kilom', () =>
            expect(() => getUnit('kilom'))
                .toThrowError());
        test('parse kilometer', () =>
            expect(parsePrefix('kilometer')?.toSI(2))
                .toEqual([2000, Units.length]));
        test('kilometer', () =>
            expect(getUnit('kilometer')?.toSI(2))
                .toEqual([2000, Units.length]));
        test('kilo-meter', () =>
            expect(getUnit('kilo-meter')?.toSI(2))
                .toEqual([2000, Units.length]));
        test('kilo meter', () =>
            expect(getUnit('kilo meter')?.toSI(2))
                .toEqual([2000, Units.length]));
    });
});

/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */

/**
 * Test the Units package functionality.
 */

import {
    defineUnit, getUnit, TEST, Primitive, U, Unit
} from "../units";

import PRIMITIVE_MAP = TEST.PRIMITIVES_MAP_;
import NAMED_UNITS = TEST.NAMED_UNITS_;
import deleteUnit = TEST.deleteUnit_;

describe("Primitive", () => {
    // If this test fails, the tests need to be revisited for the change in primitives.
    test('# of primitives', () => expect(Object.keys(PRIMITIVE_MAP).length).toBe(10));
    (Object.keys(PRIMITIVE_MAP) as (keyof typeof Primitive)[]).forEach(k => {
        const prim = PRIMITIVE_MAP[k];
        test(`name ${k}`, () => expect(NAMED_UNITS[prim.name]).toBe(prim));
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
});

describe("Define", () => {
    test("Redefine primitive", () => expect(defineUnit({mass: 1})).toBe(PRIMITIVE_MAP.mass));
    test("Define w/ bogus primitive",
        // @ts-expect-error
        () => expect(() => defineUnit({bOgUs: 1}))
            .toThrowError(/.*bOgUs.*/));
    test("Redefine velocity", () =>
        expect(defineUnit({length: 1, time: -1}))
            .toBe(U.velocity));
    test("Redefine new name", () => {
        const nUnit = defineUnit({length: 1, time: -1}, {}, '_test_name_');
        expect(nUnit).toBe(U.velocity);
        expect(getUnit('_test_name_')).toBe(U.velocity);
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
            expect(() => getUnit('_test_bogus_')).toThrowError();
        } finally {
            deleteUnit(nUnit);
        }
    });
    test('No unit', () => expect(defineUnit({})).toBe(U.unity));
    test('Add options', () => {
        expect(U.unity.attributes._test_option_).toBeUndefined();
        try {
            expect(defineUnit({}, {_test_option_: 17})).toBe(U.unity)
            expect(U.unity.attributes._test_option_).toBe(17);
        } finally {
            delete U.unity.attributes._test_option_;
        }
    });
    test('Add options no override', () => {
        expect(U.unity.attributes.si_base).toBe(true);
        try {
            expect(defineUnit({}, {si_base: false})).toBe(U.unity)
            expect(U.unity.attributes.si_base).toBe(true);
        } finally {
            U.unity.attributes.si_base = true;
        }
    });
});

describe(`Unit Arithmetic`, () => {
    describe(`Basics`, () => {
        test('add OK', () => expect(U.area.add(U.area)).toBe(U.area));
        // @ts-expect-error
        test('add Bad', () => expect(() => U.area.add(U.length)).toThrowError());
        test('multiply', () => expect(getUnit('m').multiply(getUnit('s'))).toBe(defineUnit({length: 1, time: 1})));
        test('divide 2', () => expect(U.acceleration.multiply(getUnit('s'))).toBe(U.velocity));
        test('square', () => expect(U.length.multiply(U.length)).toBe(U.area));
        test('divide', () => expect(getUnit('m').divide(getUnit('s'))).toBe(U.velocity));
        test('divide 2', () => expect(U.velocity.divide(getUnit('s'))).toBe(U.acceleration));
        test('divide cancel', () => expect(U.mass.divide(U.mass)).toBe(U.unity));
    });
    describe(`Common Combos`, () => {
        test(`volts x amps`, () => expect(U.voltage.multiply(U.current)).toBe(U.power));
        test(`time x amps`, () => expect(U.time.multiply(U.current)).toBe(U.charge));
        test(`force x length`, () => expect(U.force.multiply(U.length)).toBe(U.energy));
        test(`power x time`, () => expect(U.power.multiply(U.time)).toBe(U.energy));
        test(`force x time`, () => expect(U.force.multiply(U.time)).toBe(U.momentum));
        test(`mass x velocity`, () => expect(U.mass.multiply(U.velocity)).toBe(U.momentum));
        test(`mass x velocity x velocity`, () => expect(U.mass.multiply(U.velocity).multiply(U.velocity)).toBe(U.energy));
        test(`energy / time`, () => expect(U.energy.divide(U.time)).toBe(U.power));
    });
    describe(`Common Symbols`, () => {
        const doTest = ([sym, name, u]: [string, string, Unit]) => {
            test(`Symbol ${sym}`, () => expect(getUnit(sym)).toBe(u));
            test(`Symbol ${sym}`, () => expect(getUnit(name)).toBe(u));
        };
        const specs: ([string, string, Unit])[] =
            [
                ['J', 'joule', U.energy],
                ['W', 'watt', U.power],
                ['N', 'newton', U.force]
            ];
        specs.forEach(doTest);
    })
})

describe(`Formatting`, () => {
    test(`Simple name`, () =>
        expect(U.velocity.name).toBe('m/s'));
    test(`Exponent name`, () =>
        expect(U.acceleration.name).toBe('m/s^2'));
    test(`Primitive TeX`, () =>
        expect(U.mass.tex).toBe('\\text{kg}'));
    test(`Simple TeX`, () =>
        expect(U.velocity.tex).toBe('\\frac{\\text{m}}{\\text{s}}'));
    test(`Exponent TeX`, () =>
        expect(U.acceleration.tex).toBe('\\frac{\\text{m}}{\\text{s}^{2}}'));
})

/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */

/**
 * Test the Units package functionality.
 */

import {defineUnit, getUnit, TEST, U_acceleration, U_area, U_charge, U_current, U_energy, U_force, U_length, U_mass, U_momentum, U_power, U_time, U_unity, U_velocity, U_voltage, Unit, UNIT} from "../units";

import PRIMITIVES = TEST.PRIMITIVES_;
import NAMED_UNITS = TEST.NAMED_UNITS_;
import deleteUnit = TEST.deleteUnit;

describe("Primitive", () => {
    // If this test fails, the tests need to be revisited for the change in primitives.
    test('# of primitives', () => expect(Object.keys(PRIMITIVES).length).toBe(10));
    (Object.keys(PRIMITIVES) as (keyof typeof UNIT)[]).forEach(k => {
        const prim = PRIMITIVES[k];
        test(`name ${k}`, () => expect(NAMED_UNITS[prim.name]).toBe(prim));
    });
    const expectations: { [k in UNIT]: [string, string, string?] } = {
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
    const keys = Object.keys(expectations) as UNIT[];
    keys.forEach(k => {
        test(`${k} name`, () => expect(PRIMITIVES[k].name).toBe(expectations[k][0]));
        test(`${k} symbol`, () => expect(PRIMITIVES[k].symbol).toBe(expectations[k][1]));
        test(`${k} varName`, () => expect(PRIMITIVES[k].varName).toBe(expectations[k][2]));
    });
});

describe("Define", () => {
    test("Redefine primitive", () => expect(defineUnit({mass: 1})).toBe(PRIMITIVES.mass));
    test("Define w/ bogus primitive",
        // @ts-expect-error
        () => expect(() => defineUnit({bOgUs: 1}))
            .toThrowError(/.*bOgUs.*/));
    test("Redefine velocity", () =>
        expect(defineUnit({length: 1, time: -1}))
            .toBe(U_velocity));
    test("Redefine new name", () => {
        const nUnit = defineUnit({length: 1, time: -1}, {}, '_test_name_');
        expect(nUnit).toBe(U_velocity);
        expect(getUnit('_test_name_')).toBe(U_velocity);
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
    test('No unit', () => expect(defineUnit({})).toBe(U_unity));
    test('Add options', () => {
        expect(U_unity.attributes._test_option_).toBeUndefined();
        try {
            expect(defineUnit({}, {_test_option_: 17})).toBe(U_unity)
            expect(U_unity.attributes._test_option_).toBe(17);
        } finally {
            delete U_unity.attributes._test_option_;
        }
    });
    test('Add options no override', () => {
        expect(U_unity.attributes.si_base).toBe(true);
        try {
            expect(defineUnit({}, {si_base: false})).toBe(U_unity)
            expect(U_unity.attributes.si_base).toBe(true);
        } finally {
            U_unity.attributes.si_base = true;
        }
    });
});

describe(`Unit Arithmetic`, () => {
    describe(`Basics`, () => {
        test('add OK', () => expect(U_area.add(U_area)).toBe(U_area));
        // @ts-expect-error
        test('add Bad', () => expect(() => U_area.add(U_length)).toThrowError());
        test('multiply', () => expect(getUnit('m').multiply(getUnit('s'))).toBe(defineUnit({length: 1, time: 1})));
        test('divide 2', () => expect(U_acceleration.multiply(getUnit('s'))).toBe(U_velocity));
        test('square', () => expect(U_length.multiply(U_length)).toBe(U_area));
        test('divide', () => expect(getUnit('m').divide(getUnit('s'))).toBe(U_velocity));
        test('divide 2', () => expect(U_velocity.divide(getUnit('s'))).toBe(U_acceleration));
        test('divide cancel', () => expect(U_mass.divide(U_mass)).toBe(U_unity));
    });
    describe(`Common Combos`, () => {
        test(`volts x amps`, () => expect(U_voltage.multiply(U_current)).toBe(U_power));
        test(`time x amps`, () => expect(U_time.multiply(U_current)).toBe(U_charge));
        test(`force x length`, () => expect(U_force.multiply(U_length)).toBe(U_energy));
        test(`power x time`, () => expect(U_power.multiply(U_time)).toBe(U_energy));
        test(`force x time`, () => expect(U_force.multiply(U_time)).toBe(U_momentum));
        test(`mass x velocity`, () => expect(U_mass.multiply(U_velocity)).toBe(U_momentum));
        test(`mass x velocity x velocity`, () => expect(U_mass.multiply(U_velocity).multiply(U_velocity)).toBe(U_energy));
        test(`energy / time`, () => expect(U_energy.divide(U_time)).toBe(U_power));
    });
    describe(`Common Symbols`, () => {
        const doTest = ([sym, name, u]: [string, string, Unit]) => {
            test(`Symbol ${sym}`, () => expect(getUnit(sym)).toBe(u));
            test(`Symbol ${sym}`, () => expect(getUnit(name)).toBe(u));
        };
        const specs: ([string, string, Unit])[] =
            [
                ['J', 'joule', U_energy],
                ['W', 'watt', U_power],
                ['N', 'newton', U_force]
            ];
        specs.forEach(doTest);
    })
})

describe(`Formatting`, () => {
    test(`Simple name`, () =>
        expect(U_velocity.name).toBe('m/s'));
    test(`Exponent name`, () =>
        expect(U_acceleration.name).toBe('m/s^2'));
    test(`Primitive TeX`, () =>
        expect(U_mass.tex).toBe('\\text{kg}'));
    test(`Simple TeX`, () =>
        expect(U_velocity.tex).toBe('\\frac{\\text{m}}{\\text{s}}'));
    test(`Exponent TeX`, () =>
        expect(U_acceleration.tex).toBe('\\frac{\\text{m}}{\\text{s}^{2}}'));
})

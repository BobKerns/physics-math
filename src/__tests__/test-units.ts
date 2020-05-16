/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */

/**
 * Test the Units package functionality.
 */

import {defineUnit, getUnit, TEST, U_acceleration, U_area, U_length, U_mass, U_unity, U_velocity, Unit, UNIT} from "../units";

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
    const expectations: {[k in UNIT]: [string, string, string]} = {
        time: ['second', 's', 't'],
        mass: ['kilogram', 'kg', 'm'],
        length: ['meter', 'm', 'l'],
        voltage: ['volt', 'V', 'V'],
        current: ['ampere', 'A', 'A'],
        cycles: ['cycle', 'cycle', 'c'],
        amount: ['mole', 'mol', 'n'],
        temperature: ['kelvin', 'K', 'T'],
        candela: ['candela', 'cd', 'c'],
        angle: ['radian', 'rad', '𝜃']
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
    test('add OK', () => expect(U_area.add(U_area)).toBe(U_area));
    // @ts-expect-error
    test('add Bad', () => expect(() => U_area.add(U_length)).toThrowError());
    test('multiply', () => expect(getUnit('m').multiply(getUnit('s'))).toBe(defineUnit({length: 1, time: 1})));
    test('divide 2', () => expect(U_acceleration.multiply(getUnit('s'))).toBe(U_velocity));
    test('square', () => expect(U_length.multiply(U_length)).toBe(U_area));
    test('divide', () => expect(getUnit('m').divide(getUnit('s'))).toBe(U_velocity));
    test('divide 2', () => expect(U_velocity.divide(getUnit('s'))).toBe(U_acceleration));
    test('divide cancel', () => expect(U_mass.divide(U_mass)).toBe(U_unity));
})

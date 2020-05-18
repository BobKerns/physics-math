/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Test the arithmetic facilities on our types.
 */

import {add, equal, mul, near, sub} from "../arith";
import {isPoint, isRotation, isVector, point, rotation, vector, orientation, isOrientation, Rotation, Orientation} from "../math-types";

describe('scalar', () => {
    test('add', () => expect(add(15, 17)).toBe(32));
    test('sub', () => expect(sub(15, 17)).toBe(-2));
    test('mul', () => expect(mul(3, 5, 7)).toBe(105));
    test("equal", () => expect(equal(5, 5)).toBe(true));
    test("not equal", () => expect(equal(5, 7)).toBe(false));
});

describe('vector', () => {
    const v1 = vector(10, 20, 30);
    const v2 = vector(1, 2, 3);
    test("default", () => expect(vector()).toEqual(vector(0, 0, 0)));
    test('add', () => expect(add(v1, v2)).toEqual(vector(11, 22, 33)));
    test('addType', () => expect(isVector(add(v1, v2))).toBe(true));
    test('sub', () => expect(sub(v1, v2)).toEqual(vector(9, 18, 27)));
    test('subType', () => expect(isVector(sub(v1, v2))).toBe(true));
    test('mul', () => expect(mul(v2, 2, 3)).toEqual(vector(6, 12, 18)));
    test('mulType', () => expect(isVector(mul(v2, 2, 3))).toBe(true));
    test("equal", () => expect(equal(v1, vector(10, 20, 30))).toBe(true));
    test("not equal", () => expect(equal(v1, v2)).toBe(false));
});

describe('point', () => {
    const v1 = point(10, 20, 30);
    const v2 = vector(1, 2, 3);
    test("default", () => expect(point()).toEqual(point(0, 0, 0)));
    test('add', () => expect(add(v1, v2)).toEqual(point(11, 22, 33)));
    test('addType', () => expect(isPoint(add(v1, v2))).toBe(true));
    test('sub', () => expect(sub(v1, v2)).toEqual(point(9, 18, 27)));
    test('subType', () => expect(isPoint(sub(v1, v2))).toBe(true));
    // @ts-expect-error
    test('mul', () => expect(() => mul(v1, 2, 3)).toThrowError());
    test("equal", () => expect(equal(v1, point(10, 20, 30))).toBe(true));
    // @ts-expect-error
    test("not equal", () => expect(equal(v1, v2)).toBe(false));
});

describe('rotation', () => {
    const v1 = Rotation.fromEuler(0, 0, 0);
    const v2 = Rotation.fromEuler(Math.PI/2, 0, 0);
    test("l1", () => expect(v1.magnitudeSqr()).toBe(1));
    test("l2", () => expect(v1.magnitudeSqr()).toBe(1));
    test("default", () => expect(rotation()).toEqual(rotation(0, 0, 0, 1)));
    test('add', () => expect(add(v1, v2)).toEqual(v2));
    test('addType', () => expect(isRotation(add(v1, v2))).toBe(true));
    test('sub', () => expect(near(sub(v1, v2), Rotation.fromEuler(-Math.PI/2, 0, 0))).toBe(true));
    test('subType', () => expect(isRotation(sub(v1, v2))).toBe(true));
    test('mulLen 0', () => expect(mul<Rotation>(v1, 2).magnitudeSqr()).toEqual(1));
    test('mul 0', () => expect(mul(v1, 2)).toEqual(v1));
    test('mulLen', () => expect(mul<Rotation>(v2, 0.5).magnitudeSqr()).toEqual(1));
    test('mul', () => expect(mul(v2, 0.5)).toEqual(Rotation.fromEuler(Math.PI/4, 0, 0)));
    test('mulType', () => expect(isRotation(mul(v2, 2, 3))).toBe(true));
    test("equal 0", () => expect(equal(v1, rotation())).toBe(true));
    test("equal", () => expect(equal(v2, Rotation.fromEuler(Math.PI/2, 0,0))).toBe(true));
    test("not equal", () => expect(equal(v1, v2)).toBe(false));
});

describe('orientation', () => {
    const v1 = Orientation.fromEuler(0, 0, 0);
    const v2 = Rotation.fromEuler(Math.PI/2, 0, 0);
    test("l1", () => expect(v1.magnitudeSqr()).toBe(1));
    test("l2", () => expect(v1.magnitudeSqr()).toBe(1));
    test("default", () => expect(orientation()).toEqual(orientation(0, 0, 0, 1)));
    test('add', () => expect(add(v1, v2)).toEqual(Orientation.coerce(v2)));
    test('addType', () => expect(isOrientation(add(v1, v2))).toBe(true));
    test('sub', () => expect(near(sub(v1, v2), Orientation.fromEuler(-Math.PI/2, 0, 0))).toBe(true));
    test('subType', () => expect(isOrientation(sub(v1, v2))).toBe(true));
    // @ts-expect-error
    test('mul', () => expect(() => mul(v1, 2, 3)).toThrowError());
    test("equal 0", () => expect(equal(v1, orientation())).toBe(true));
    test("coerce", () => expect(Orientation.coerce(v2)).toEqual(Orientation.fromEuler(Math.PI/2, 0, 0)));
    test("coercex", () => expect(Orientation.coerce(Rotation.fromEuler(Math.PI/2, 0, 0))).toEqual(Orientation.fromEuler(Math.PI/2, 0, 0)));
    test("equal", () =>
        expect(equal(Orientation.coerce(v2), Orientation.fromEuler(Math.PI/2, 0,0))).toBe(true));
    // @ts-expect-error
    test("not equal", () => expect(equal(v1, v2)).toBe(false));
});


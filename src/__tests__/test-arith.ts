/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */

/**
 * Test the arithmetic facilities on our types.
 */

import {add} from "ramda";
import {mul, sub} from "../arith";

describe('scalar', () => {
    test('add', () => expect(add(15, 17)).toBe(32));
    test('sub', () => expect(sub(15, 17)).toBe(-2));
    test('mul', () => expect(mul(3, 5, 7)).toBe(105));
});

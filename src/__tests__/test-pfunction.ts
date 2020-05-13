/**
 * @module physics-math
 * Copyright ©  by Bob Kerns. Licensed under MIT license
 */

/**
 * Test the common PFunction functionality.
 */

 import {PFunction} from "../pfunction";
import {GFunction} from "../general-fns";
import {TYPE} from "../math-types";
import {Scalar} from "../scalar";

describe('PFunction', () => {
    test('create',
        () => expect(new GFunction((t: number) => 7)).toBeInstanceOf(PFunction));
    test('invoke',
        () => expect(new GFunction((t: number) => 7 * t).f(6)).toBe(42));
    test('type GFunction',
        () => expect(new GFunction((t: number) => 7 * t).returnType).toBe(TYPE.SCALAR));
    test('type Scalar',
        () => expect(new Scalar(7).returnType).toBe(TYPE.SCALAR));
 });

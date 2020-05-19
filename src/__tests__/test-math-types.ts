/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Tests of the math datatypes.
 */

import {Frame, InertialFrame, Time, Transform} from "../base";
import {
    datatype,
    DataTypeOf,
    IntrinsicOf, isIntrinsic,
    isOrientation,
    isPoint,
    isPositional, isRelative,
    isRotation,
    isRotational, isScalar,
    isScalarValue,
    isVector,
    Orientation,
    orientation,
    Point,
    point,
    RelativeOf,
    Rotation,
    rotation,
    ScalarValue,
    TYPE,
    Vector,
    vector
} from "../math-types";
import {Constructor} from "../utils";

import {NULL_ROTATION, NULL_VECTOR, ORIGIN, ORIGIN_ORIENTATION, Scalar} from "../scalar";


type Constructor4N<R> = Constructor<R, [number, number, number, number]> | Constructor<R, [InertialFrame, number, number, number, number]>;

const checkAny = <T extends Vector|Point|Rotation|Orientation>(type: Constructor4N<T>, p0: number, p1: number, p2: number, p3: number) => (v: T) => {
    expect(v).toBeInstanceOf(type);
    expect(v).toBeInstanceOf(Float64Array);
    expect(v.length).toBe(4);
    expect(v[0]).toBe(p0);
    expect(v[1]).toBe(p1);
    expect(v[2]).toBe(p2);
    expect(v[3]).toBe(p3);
};

const checkType = (v: any, type: TYPE) => expect(datatype(v)).toBe(type);

const testPredicates = (t: any, n: boolean, p: boolean, v: boolean, o: boolean, r: boolean) => {
    describe("predicates", () => {
        describe("values", () => {
            test("isScalarValue", () => expect(isScalarValue(t)).toBe(n));
            test("isPoint", () => expect(isPoint(t)).toBe(p));
            test("isVector", () => expect(isVector(t)).toBe(v));
            test("isPositional", () => expect(isPositional(t)).toBe(p || v))
            test("isOrientation", () => expect(isOrientation(t)).toBe(o));
            test("isRotation", () => expect(isRotation(t)).toBe(r));
            test("isRotational", () => expect(isRotational(t)).toBe(o || r));
            test('isRelative', () => expect(isRelative(t)).toBe(n || v || r));
            test('isIntrinsic', () => expect(isIntrinsic(t)).toBe(p || o));
            test('isScalar', () => expect(isScalar(t)).toBe(n));
        });
    });
};

describe("Scalar", () => {
    testPredicates(1, true, false, false, false, false);
});

class TFrame implements InertialFrame {
    isInertial(t: number | Time): true {
        return true;
    }

    transform(other: Frame): (t: (number | Time)) => Transform {
        throw new Error('Not implemented');
    }

}

const frame = new TFrame();
describe("Vectorish", () => {
    const check = <T extends Vector|Point>(type: Constructor4N<T>, x: number, y: number, z: number, w: 0 | 1) => (v: T) => {
        checkAny(type, x, y, z, w);
        expect(v.x).toBe(x);
        expect(v.y).toBe(y);
        expect(v.z).toBe(z);
        expect(v.w).toBe(w);
    };
     describe("Vector", () => {
         test("null",
             () => check(Vector, 0, 0, 0, 0)(vector()));
         test("explicit",
             () => check(Vector, 10, 20, 30, 0)(vector(10, 20, 30)));
         test("assign", () => {
             const v = vector();
             v.x = 10;
             v.y = 20;
             v.z = 30;
             check(Vector, 10, 20,30, 0)(v);
         });
         test("clone",
             () => check(Vector, 10, 20, 30, 0)(vector(10, 20, 30).clone()));
         test("datatype", () => checkType(vector(), TYPE.VECTOR));
         testPredicates(vector(1, 2, 3), false, false, true, false, false);
     });
     describe("Point", () => {
         test("explicit",
             () => check(Point, 10, 20, 30, 1)(point(frame,10, 20, 30)));
         test("assign", () => {
             const p = point(frame);
             p.x = 10;
             p.y = 20;
             p.z = 30;
             check(Point, 10, 20,30, 1)(p);
         });
         test("clone",
             () => check(Point, 10, 20, 30, 1)(point(frame,10, 20, 30).clone()));
         test("origin",
             () => check(Point, 0, 0, 0, 1)(point(frame)));
         test("datatype", () => checkType(point(frame), TYPE.POINT));
         testPredicates(point(frame,1, 2, 3), false, true, false, false, false);
     });
 });

describe("Rotationish", () => {
    const check = <T extends Rotation|Orientation>(type: Constructor4N<T>, i: number, j: number, k: number, w: number) => (v: T) => {
        checkAny(type, i, j, k, w);
        expect(v.i).toBe(i);
        expect(v.j).toBe(j);
        expect(v.k).toBe(k);
        expect(v.w).toBe(w);
    };
    describe("Rotation", () => {
        test("explicit",
            () => check(Rotation,10, 20, 30, 40)(rotation(10, 20, 30, 40)));
        test("assign", () => {
            const r = rotation();
            r.i = 10;
            r.j = 20;
            r.k = 30;
            r.w = 40;
            check(Rotation, 10, 20,30, 40)(r);
        });
        test("clone",
            () => check(Rotation,10, 20, 30, 40)(rotation(10, 20, 30, 40).clone()));
        test("null",
            () => check(Rotation,0, 0, 0, 1)(rotation()));
        test("datatype", () => checkType(rotation(), TYPE.ROTATION));
        testPredicates(rotation(1, 2, 3), false, false, false, false, true);
    });
    describe("Orientation", () => {
        test("explicit",
            () => check(Orientation, 10, 20, 30, 40)(orientation(frame,10, 20, 30, 40)));
        test("assign", () => {
            const v = orientation(frame);
            v.i = 10;
            v.j = 20;
            v.k = 30;
            v.w = 40;
            check(Orientation, 10, 20,30, 40)(v);
        });
        test("clone",
            () => check(Orientation, 10, 20, 30, 40)(orientation(frame,10, 20, 30, 40).clone()));
        test("null",
            () => check(Orientation, 0, 0, 0, 1)(orientation(frame)));
        test("datatype", () => checkType(orientation(frame), TYPE.ORIENTATION));
        testPredicates(orientation(frame,1, 2, 3), false, false, false, true, false);
    });
});
describe("Types", () => {
    describe("DataTypeOf", () => {
        test("Vector", () => {
            // noinspection JSUnusedLocalSymbols
            const type: DataTypeOf<Vector> = TYPE.VECTOR;
        });
        test("Scalar", () => {
            // noinspection JSUnusedLocalSymbols
            const type: DataTypeOf<number> = TYPE.SCALAR;
        });
        // The ts-expect-error annotations below cause TypeScript to get a compilation error if
        // if the following line does *not* produce a compilation error.
        // This is a new feature in TS 3.9; it allows testing for type mismatches as well as
        // allowing testing runtime checks that TypeScript would ordinarily reject at compile time.
        const mismatch = (type: TYPE, fn: () => void) =>
            test(`Mismatch ${TYPE[type]}`, () => expect(fn()).toBe(type));
        mismatch(TYPE.SCALAR,
            () => {
                // @ts-expect-error
                // noinspection JSUnusedLocalSymbols
                const type2: DataTypeOf<Vector> = TYPE.SCALAR;
                return type2;
            });
        mismatch(TYPE.VECTOR,
            () => {
                // @ts-expect-error
                // noinspection JSUnusedLocalSymbols
                const type2: DataTypeOf<Point> = TYPE.VECTOR;
                return type2;
            });
        mismatch(TYPE.POINT,
            () => {
                // @ts-expect-error
                // noinspection JSUnusedLocalSymbols
                const type2: DataTypeOf<Vector> = TYPE.POINT;
                return type2;
            });
        mismatch(TYPE.ORIENTATION,
            () => {
                // @ts-expect-error
                // noinspection JSUnusedLocalSymbols
                const type2: DataTypeOf<Rotation> = TYPE.ORIENTATION;
                return type2;
            });
        mismatch(TYPE.ROTATION,
            () => {
                // @ts-expect-error
                // noinspection JSUnusedLocalSymbols
                const type2: DataTypeOf<ORIENTATION> = TYPE.ROTATION;
                return type2;
            });
        const relative = (name: string, fn: () => void) =>
            test(`relative ${name}`, () => expect(fn()).toBeUndefined());
        relative('scalar', () => {
            // noinspection JSUnusedLocalSymbols
            const a: RelativeOf<ScalarValue> = 5;
        });
        relative('vector', () => {
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const a: RelativeOf<Vector> = point();
            // noinspection JSUnusedLocalSymbols
            const b: RelativeOf<Vector> = vector();
        });
        relative('point', () => {
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const a: RelativeOf<Point> = point();
            // noinspection JSUnusedLocalSymbols
            const b: RelativeOf<Point> = vector();
        });
        relative('rotation', () => {
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const a: RelativeOf<Rotation> = orientation();
            // noinspection JSUnusedLocalSymbols
            const b: RelativeOf<Rotation> = rotation();
        });
        relative('orientation', () => {
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const a: RelativeOf<Orientation> = orientation();
            // noinspection JSUnusedLocalSymbols
            const b: RelativeOf<Orientation> = rotation();
        });
        const intrinsic = (name: string, fn: () => void) =>
            test(`intrinsic ${name}`, () => expect(fn()).toBeUndefined());
        intrinsic('scalar', () => {
            // noinspection JSUnusedLocalSymbols
            const a: IntrinsicOf<ScalarValue> = 5;
        });
        intrinsic('vector', () => {
            // noinspection JSUnusedLocalSymbols
            const a: IntrinsicOf<Vector> = point(frame);
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const b: IntrinsicOf<Vector> = vector();
        });
        intrinsic('point', () => {
            // noinspection JSUnusedLocalSymbols
            const a: IntrinsicOf<Point> = point(frame);
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const b: IntrinsicOf<Point> = vector();
        });
        intrinsic('rotation', () => {
            // noinspection JSUnusedLocalSymbols
            const a: IntrinsicOf<Rotation> = orientation(frame);
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const b: IntrinsicOf<Rotation> = rotation();
        });
        intrinsic('orientation', () => {
            // noinspection JSUnusedLocalSymbols
            const a: IntrinsicOf<Orientation> = orientation(frame);
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const b: IntrinsicOf<Orientation> = rotation();
        });
    });
});


describe("functional", () => {
    const group = (name: string, value: any, s: boolean, r: boolean, i: boolean) =>
        describe(name, () => {
            test("isScalar", () => expect(isScalar(value)).toBe(s));
            test("isRelative", () => expect(isRelative(value)).toBe(r));
            test("isIntrinsic", () => expect(isIntrinsic(value)).toBe(i));
        });
    group('scalar', new Scalar(3), true, true, false);
    group('vector', NULL_VECTOR, false, true, false);
    group('point', ORIGIN(frame), false, false, true);
    group('rotation', NULL_ROTATION, false, true, false);
    group('orientation', ORIGIN_ORIENTATION(frame), false, false, true);
});

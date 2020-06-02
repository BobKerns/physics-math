/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Tests of the math datatypes.
 */

import {Time, Transform} from "../base";
import {
    datatype,
    DataTypeOf,
    InFrameOf,
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
import {Constructor, Throw} from "../utils";
import {Frame, InertialFrame} from "../frame";
import {isUnit, Unit} from "../units";
import {Units} from "../unit-defs";

type Constructor4N<R, W> = Constructor<R, [Unit, number, number, number, W]> | Constructor<R, [InertialFrame, number, number, number, W]>;

const checkAny = <T extends Vector|Point|Rotation|Orientation,W>(type: Constructor4N<T,W>, p0: number, p1: number, p2: number, p3?: number|0|1) => (v: T) => {
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
            test('isScalar', () => expect(isScalar(t)).toBe(n));
        });
    });
};

describe("Scalar", () => {
    testPredicates(1, true, false, false, false, false);
});

class TFrame implements InertialFrame {
    readonly name = 'foo';
    isInertial(t: number | Time): true {
        return true;
    }

    transform(other: Frame): (t: (number | Time)) => Transform {
        throw new Error('Not implemented');
    }

}

function check<U extends Unit>(type: Constructor4N<Vector<U>,0>, unit: U, x: number, y: number, z: number, w: 0): (v: Vector<U>) => void;
function check(type: Constructor4N<Point,0>, unit: InertialFrame, x: number, y: number, z: number, w: 1): (p: Point) => void;
function check<U extends Unit>(type: Constructor4N<Rotation<U>,0>, unit: U, x: number, y: number, z: number, w: number): (v: Rotation<U>) => void;
function check(type: Constructor4N<Orientation,number>, unit: InertialFrame, x: number, y: number, z: number, w: number): (p: Orientation) => void;
function check<U extends Unit, T extends Vector<U>|Point>(type: any, unitOrFrame: U|InertialFrame, x: number, y: number, z: number, w: number) {
    return (v: T) => {
        checkAny(type, x, y, z, w);
        const unit: Unit = isUnit(unitOrFrame)
            ? unitOrFrame
            : type === Point
                ? Units.length
                : type === Orientation
                    ? Units.angle
                    : Throw(`Unknown type: ${type}`);
        expect(v.unit).toBe(unit);
        expect(v[0]).toBe(x);
        expect(v[1]).toBe(y);
        expect(v[2]).toBe(z);
        expect(v[3]).toBe(w);
    };
}

const frame = new TFrame();
describe("Vectorish", () => {
     describe("Vector", () => {
         test("null",
             () => check(Vector, Units.length, 0, 0, 0, 0)(vector(Units.length)()));
         test("explicit",
             () => check(Vector, Units.length, 10, 20, 30, 0)(vector(Units.length,10, 20, 30)));
         test("assign", () => {
             const v = vector(Units.velocity)();
             v.x = 10;
             v.y = 20;
             v.z = 30;
             check(Vector, Units.velocity, 10, 20,30, 0)(v);
         });
         test("clone",
             () => check(Vector, Units.length, 10, 20, 30, 0)(vector(Units.length,10, 20, 30).clone()));
         test("datatype", () => checkType(vector(Units.length)(), TYPE.VECTOR));
         testPredicates(vector(Units.length, 1, 2, 3), false, false, true, false, false);
     });
     describe("Point", () => {
         test("explicit",
             () => check(Point, frame, 10, 20, 30, 1)(point(frame,10, 20, 30)));
         test("assign", () => {
             const p = point(frame)();
             p.x = 10;
             p.y = 20;
             p.z = 30;
             check(Point, frame, 10, 20,30, 1)(p);
         });
         test("clone",
             () => check(Point, frame, 10, 20, 30, 1)(point(frame,10, 20, 30).clone()));
         test("origin",
             () => check(Point, frame, 0, 0, 0, 1)(point(frame)()));
         test("datatype", () => checkType(point(frame)(), TYPE.POINT));
         testPredicates(point(frame,1, 2, 3), false, true, false, false, false);
     });
 });

describe("Rotationish", () => {
    describe("Rotation", () => {
        test("explicit",
            () => check(Rotation, Units.angle, 10, 20, 30, 40)(rotation(Units.angle, 10, 20, 30, 40)));
        test("assign", () => {
            const r = rotation(Units.angle)();
            r.i = 10;
            r.j = 20;
            r.k = 30;
            r.w = 40;
            check(Rotation, Units.angle, 10, 20,30, 40)(r);
        });
        test("clone",
            () => check(Rotation, Units.angle, 10, 20, 30, 40)(rotation(Units.angle, 10, 20, 30, 40).clone()));
        test("null",
            () => check(Rotation, Units.angle, 0, 0, 0, 1)(rotation(Units.angle)()));
        test("datatype", () => checkType(rotation(Units.angle)(), TYPE.ROTATION));
        testPredicates(rotation(Units.angle, 1, 2, 3), false, false, false, false, true);
    });
    describe("Orientation", () => {
        test("explicit",
            () => check(Orientation, frame, 10, 20, 30, 40)(orientation(frame, 10, 20, 30, 40)));
        test("assign", () => {
            const v = orientation(frame)();
            v.i = 10;
            v.j = 20;
            v.k = 30;
            v.w = 40;
            check(Orientation, frame, 10, 20,30, 40)(v);
        });
        test("clone",
            () => check(Orientation, frame, 10, 20, 30, 40)(orientation(frame, 10, 20, 30, 40).clone()));
        test("null",
            () => check(Orientation, frame, 0, 0, 0, 1)(orientation(frame)()));
        test("datatype", () => checkType(orientation(frame)(), TYPE.ORIENTATION));
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
            const a: RelativeOf<ScalarValue<Unit>> = 5;
        });
        relative('vector', () => {
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const a: RelativeOf<Vector> = point(frame)();
            // noinspection JSUnusedLocalSymbols
            const b: RelativeOf<Vector> = vector(Units.length)();
        });
        relative('point', () => {
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const a: RelativeOf<Point> = point(frame)();
            // noinspection JSUnusedLocalSymbols
            const b: RelativeOf<Point> = vector(Units.length)();
        });
        relative('rotation', () => {
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const a: RelativeOf<Rotation> = orientation(frame)();
            // noinspection JSUnusedLocalSymbols
            const b: RelativeOf<Rotation> = rotation(Units.angle)();
        });
        relative('orientation', () => {
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const a: RelativeOf<Orientation> = orientation(frame)();
            // noinspection JSUnusedLocalSymbols
            const b: RelativeOf<Orientation> = rotation(Units.angle)();
        });
        const intrinsic = (name: string, fn: () => void) =>
            test(`intrinsic ${name}`, () => expect(fn()).toBeUndefined());
        intrinsic('scalar', () => {
            // noinspection JSUnusedLocalSymbols
            const a: InFrameOf<ScalarValue<Unit>> = 5;
        });
        intrinsic('vector', () => {
            // noinspection JSUnusedLocalSymbols
            const a: InFrameOf<Vector> = point(frame)();
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const b: InFrameOf<Vector> = vector(Units.length)();
        });
        intrinsic('point', () => {
            // noinspection JSUnusedLocalSymbols
            const a: InFrameOf<Point> = point(frame)();
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const b: InFrameOf<Point> = vector(Units.length)();
        });
        intrinsic('rotation', () => {
            // noinspection JSUnusedLocalSymbols
            const a: InFrameOf<Rotation> = orientation(frame)();
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const b: InFrameOf<Rotation> = rotation(Units.angle)();
        });
        intrinsic('orientation', () => {
            // noinspection JSUnusedLocalSymbols
            const a: InFrameOf<Orientation> = orientation(frame)();
            // @ts-expect-error
            // noinspection JSUnusedLocalSymbols
            const b: InFrameOf<Orientation> = rotation(Units.angle)();
        });
    });
});


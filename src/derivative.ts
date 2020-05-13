import {BaseValue, Point, Rotation, Vector} from "./math-types";
import {IPFunction, PFunction} from "./pfunction";

const bounds = <R extends BaseValue>(f: IPFunction<R>, t: number): [R, R, number] => {
    const timestep = f.pfunction.timestep;
    const l = f(t - timestep / 2);
    const u = f(t + timestep / 2);
    return [l, u, timestep];
};

/**
 * Calculate the derivative of a function numerically, by examining nearby values on either side of
 * the point. Points that are technically no-differentiable (such as where piecewise-define segments
 * meet) are computed as an average.
 * @param f
 */
const makeDerivative = (f: IPFunction<number>) => (t: number) => {
    const [l, u, timestep] = bounds(f, t);
    return (u - l) / timestep;
}
export class NumericDerivative extends PFunction<number> {
    private readonly from: PFunction<number>;
    constructor(f: PFunction<number>) {
        super(makeDerivative(f.f));
        this.from = f;
        this.setName_(`deriv[${f.name}]`);
    }

    differentiate(): PFunction<number> {
        return new NumericDerivative(this);
    }

    integrate() {
        return this.from;
    }
}

const makeDerivativeV = (f: IPFunction<Point|Vector>) => (t: number) => {
    const [l, u, timestep] = bounds(f, t);
    const dx = (u.x - l.x) / timestep;
    const dy = (u.y - l.y) / timestep;
    const dz = (u.z - l.z) / timestep;
    return new Vector(dx, dy, dz);
}
export class VectorDerivative extends PFunction<Point|Vector> {
    private readonly from: PFunction<Point|Vector>;
    constructor(f: PFunction<Point|Vector>) {
        super(makeDerivativeV(f.f));
        this.from = f;
        this.setName_(`deriv[${f.name}]`);
    }

    differentiate(): PFunction<Point|Vector> {
        return new VectorDerivative(this);
    }

    integrate() {
        return this.from;
    }
}

const makeDerivativeQ = (f: IPFunction<Rotation>) => (t: number) => {
    const [l, u, timestep] = bounds(f, t);
    const di = (u.i - l.i) / timestep;
    const dj = (u.j - l.j) / timestep;
    const dk = (u.k - l.k) / timestep;
    const dw = (u.w - l.w) / timestep;
    return new Rotation(di, dj, dk, dw).normalize();
}
export class QuaternionDerivative extends PFunction<Rotation> {
    private readonly from: PFunction<Rotation>;
    constructor(f: PFunction<Rotation>) {
        super(makeDerivativeQ(f.f));
        this.from = f;
        this.setName_(`deriv[${f.name}]`);
    }

    differentiate(): PFunction<Rotation> {
        return new QuaternionDerivative(this);
    }

    integrate() {
        return this.from;
    }
}

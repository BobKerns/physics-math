import {IPFunction, PFunction} from "./base";

const makeDerivative = (f: IPFunction<number, PFunction<number>>) => (t: number) => {
    const timestep = f.pfunction.timestep;
    const l = f(t - timestep / 2);
    const u = f(t + timestep / 2);
    return (u - l) / timestep;
}
export class NumericDerivative extends PFunction<number> {
    private readonly from: PFunction<number>;
    constructor(f: PFunction<number>) {
        super(makeDerivative(f.f));
        this.from = f;
        this.setName_(`deriv[${f.name}]`);
    }

    protected differentiate(): PFunction<number> {
        return new NumericDerivative(this);
    }

    integrate() {
        return this.from;
    }
}

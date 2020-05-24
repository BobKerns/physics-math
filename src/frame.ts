/*
 * @module physics-math
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Frames—inertial and otherwise.
 * @packageDocumentation
 * @module Frame
 */

import {constant, IConstant} from "./scalar";
import {rotation, Rotation, vector, Vector} from "./math-types";
import {Units} from "./unit-defs";
import {defineTag, NYI} from "./utils";
import {Time, Transform, Velocity} from "./base";

export interface Frame {
    readonly name: string;

    isInertial(t: number | Time): boolean;

    transform(other: Frame): (t: number | Time) => Transform;
}

export interface InertialFrame extends Frame {
    isInertial(t: number | Time): true;
}

abstract class FrameImpl implements Frame {
    parent?: Frame;
    readonly name: string;
    protected offset: IConstant<Vector, Units.length>
    protected rotated: IConstant<Rotation, Units.angle>;

    isInertial(t: number | Time): boolean {
        return false;
    }

    transform(other: Frame): (t: (number | Time)) => Transform {
        return NYI(`Transform`);
    }

    protected constructor(name: string, parent: Frame | undefined,
                          offset: IConstant<Vector, Units.length>,
                          rotated: IConstant<Rotation, Units.angle>) {
        this.name = name;
        this.parent = parent;
        this.offset = offset;
        this.rotated = rotated;
    }
}

export class InertialFrameImpl extends FrameImpl implements InertialFrame {
    isInertial(t: number | Time): true {
        return true;
    }

    constructor(name: string, parent?: Frame,
                offset: IConstant<Vector, Units.length> = constant(vector(), Units.length),
                rotated: IConstant<Rotation, Units.angle> = constant(rotation(), Units.angle)) {
        super(name, parent, offset, rotated);
    }
}

defineTag(FrameImpl, 'Frame');

// noinspection JSUnusedGlobalSymbols
export class World {
    private parentFrame: InertialFrame = new InertialFrameImpl('Initial', undefined);

    // noinspection JSUnusedGlobalSymbols
    createInertialFrame(offset: Vector, velocity: Velocity, angle: Rotation): InertialFrame {
        return new InertialFrameImpl('Initial', this.parentFrame,
            constant(offset || vector(), Units.length), constant(angle || rotation(), Units.angle));
    }
}

defineTag(World, 'World');

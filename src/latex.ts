/*
 * Copyright 2020 by Bob Kerns. Licensed under MIT license.
 *
 * Github: https://github.com/BobKerns/physics-math
 */

/**
 * Support for LaTex formatting of our expressions and data.
 * @packageDocumentation
 * @module LaTeX
 */

import R from "ramda";
import {defineTag, gcd, tex} from "./utils";
import {Unit} from "./units";
import {IUnitBase} from "./primitive-units";


/**
 * A styler takes a LaTeX fragment and transforms it in some way.
 *
 * A [[Styler]] is required to be synchronous; no use of await or promises
 * is allowed.
 *
 */
export type Styler<I = string|number, R extends any[] = any[]> = (continuation: StylerFn<I>, thisStyle: Style) => StylerFn<I, R>;
type StylerFn<I = string|number, R extends any[] = any[]> = (ctx: StyleContext, arg: I, ...rest: R) => string;


type StyleKeyString = 'function' | 'call' | 'variable';
type StyleKeyNumber = 'number';
type StyleKeyOther =  'applyUnits' | 'applyUnitFunction' | 'unit' | 'unitSymbol' | 'unitFraction';
type StyleKeyData = 'numberSpecials' | 'numberPrecision' | 'numberFormat' | 'numberTrimTrailingZero';

/**
 * The valid style keys to be used with [[setStyle]].
 */
export type StyleKey = StyleKeyString | StyleKeyNumber | StyleKeyOther | StyleKeyData;

export enum NumberFormat {
    normal = 'normal',
    scientific = 'scientific',
    engineering = 'engineering'
}

/**
 * A type map of [[StyleKey]] to [[Styler]] (plus the supporting data items).
 */
export type StyleMap = {
    [k in 'unit'|'unitSymbol']: Styler<IUnitBase>;
} & {
    [k in 'unitFraction']: Styler<string,[string]>
} & {
    [k in 'applyUnit'|'applyUnitFunction']: Styler<string|number, [IUnitBase]>;
} & {
    [k in StyleKeyString]: Styler<string>;
} & {
    [j in StyleKeyNumber]: Styler<number>
} & {
    numberSpecials: Map<number,string>;
    numberPrecision: number;
    numberFormat: NumberFormat;
    numberTrimTrailingZero: boolean;
};

type StyleFnFor<K extends keyof StyleMap> =
    K extends 'applyUnit'|'applyUnitFunction'
        ? StylerFn<string|number, [IUnitBase]>
        : K extends 'unit'|'unitSymbol'
        ? StylerFn<IUnitBase>
        : K extends 'unitFraction'
            ? StylerFn<string, [string]>
            : K extends StyleKeyString|StyleKeyNumber
                ? StyleMap[K] extends Styler<infer S>
                    ? StylerFn<S>
                    : never
                : K extends StyleKey
                    ? StyleMap[K]
                    : never;

type StyleFnMap = {
    [k in keyof StyleMap]: StyleFnFor<k>;
}

/**
 * A source of [[StyleContext]] instances. Initially, you obtain a [[StyleContext]] from a [[Style]].
 */
export interface StyleContextHolder<T extends StyleContextHolder<T>> {
    readonly context: StyleContext;

    set(params: StyleMap): T;

    wrap(params: StyleMap): T;
}


export class StyleContext implements StyleContextHolder<StyleContext> {
    readonly style: Style;
    readonly parent?: StyleContext;
    constructor(style: Style, parent?: StyleContext, options: any = {}) {
        this.style = style;
        if (parent) {
            this.parent = parent;
        }
        Object.assign(this, options);
    }

    function(f: string) {
        return this.style.function(this, f);
    }
    call(f: string) {
        return this.style.call(this, f);
    }
    variable(v: string) {
        return this.style.variable(this, v);
    }
    number(n: number) {
        return this.style.number(this, n);
    }
    applyUnit(s: string, unit: IUnitBase) {
        return this.style.applyUnit(this, s, unit);
    }
    applyUnitFunction(s: string, unit: IUnitBase) {
        return this.style.applyUnitFunction(this, s, unit);
    }
    unit(unit: IUnitBase) {
        return this.style.unit(this, unit);
    }
    unitSymbol(unit: IUnitBase) {
        return this.style.unitSymbol(this, unit);
    }
    unitFraction(numer: string, denom: string) {
        return this.style.unitFraction(this, numer, denom);
    }

    get numberSpecials() { return this.style.numberSpecials; }
    get numberPrecision() { return this.style.numberPrecision; }
    get numberFormat() { return this.style.numberFormat; }
    get numberTrimTrailingZero() { return this.style.numberTrimTrailingZero; }

    get context() {
        // For now we deal with a single context, but might have nested contexts in the future.
        return this;
    }

    set(params: StyleMap): StyleContext {
        return this.style.set(params).context;
    }

    wrap(params: StyleMap): StyleContext {
        return this.style.wrap(params).context;
    }
}

defineTag(StyleContext, 'StyleContext');

/**
 * This handles adding style formatting to the syntactic expressions components
 * during LaTeX generation. It consists of a set of [[Styler]] functions, each
 * of which can modify the generated LaTeX, typically by wrapping it with additional
 * directives.
 *
 * The [[Style.set]], [[Style.wrap]], and [[Style.wrapWith]] methods can be chained
 * to provide any combination.
 */
export class Style implements Readonly<StyleFnMap>, StyleContextHolder<Style> {
    readonly call: StylerFn<string>;
    readonly function: StylerFn<string>;
    readonly variable: StylerFn<string>;
    readonly number: StylerFn<number>;
    readonly unit: StylerFn<IUnitBase>;
    readonly unitSymbol: StylerFn<IUnitBase>;
    readonly unitFraction: StylerFn<string, [string]>;
    readonly applyUnit: StylerFn<string|number,[IUnitBase]>;
    readonly applyUnitFunction: StylerFn<string|number,[IUnitBase]>;
    readonly numberFormat: NumberFormat;
    readonly numberPrecision: number;
    readonly numberSpecials: Map<number, string>;
    readonly numberTrimTrailingZero: boolean;

    constructor(init: StyleMap) {
        // The chain bottoms out at the defaults if they pass it off to their continuations.
        this.call = init.call(DEFAULT_STYLE_FNS.call, this);
        this.function = init.function(DEFAULT_STYLE_FNS.function, this);
        this.variable = init.variable(DEFAULT_STYLE_FNS.variable, this);
        this.number = init.number(DEFAULT_STYLE_FNS.number, this);
        this.unit = init.unit(DEFAULT_STYLE_FNS.unit, this);
        this.unitSymbol = init.unitSymbol(DEFAULT_STYLE_FNS.unitSymbol, this);
        this.unitFraction = init.unitFraction(DEFAULT_STYLE_FNS.unitFraction, this);
        this.applyUnit = init.applyUnit(DEFAULT_STYLE_FNS.applyUnit, this);
        this.applyUnitFunction = init.applyUnitFunction(DEFAULT_STYLE_FNS.applyUnitFunction, this);
        this.numberFormat = init.numberFormat;
        this.numberPrecision = init.numberPrecision;
        this.numberSpecials = init.numberSpecials;
        this.numberTrimTrailingZero = init.numberTrimTrailingZero;
    }

    /**
     * Returns a new [[Style]] with each [[Styler][] in `stylers` replacing
     * the one in this one.
     */
    set(stylers: Partial<StyleMap>): Style {
        const nStyle = Object.create(this);
        for (const k of Object.keys(stylers)) {
            const v = (stylers as any)[k];
            if (nStyle[k] === undefined) {
                throw new Error(`Invalid style key: ${k}`);
            }
            if (typeof v === 'function') {
                nStyle[k] = v((DEFAULT_STYLE_FNS as any)[k] as StylerFn, this);
            } else {
                nStyle[k] = v;
            }
        }
        return Object.freeze(nStyle);
    }

    /**
     * Returns a new [[Style]] with each [[Styler]] in `stylers` wrapping
     * the one in this one. Each of the supplied [[Styler]] will receive
     * the result of calling the current styler on the original string
     * and this styler.
     */
    wrap(stylers: Partial<StyleMap>): Style {
        const mergeSpecials = (a: Map<number, string>, b: Map<number, string>) => {
            const result = new Map();
            b.forEach((key, n) => result.set(key, n));
            a.forEach((key, n) => result.set(key, n));
            return Object.freeze(result);
        }
        const merge: (n: Partial<StyleMap>, o: Style) => StyleMap =
            R.mergeWithKey((key: string, a: Styler|Map<any,any>, b: StylerFn|Map<any,any>) => {
                if ((this as any)[key] === undefined) {
                    throw new Error(`Invalid style key: ${key}`);
                }
                return (key === 'numberFormat' || key === 'numberPrecision')
                    ? a
                    : (key === 'numberSpecials')
                    ? mergeSpecials(a as Map<number, string>, b as Map<number, string>)
                    : (<Styler>a)(<StylerFn>b, this);
            });
        return Object.freeze(new Style(merge(stylers, this)));
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns a new [[Style]] with each [[Styler]] in `stylers` wrapping
     * the one in this one. Each of the supplied [[Styler]] will receive
     * the result of calling the current styler on the original string
     * and the new styler.
     */
    wrapWithNewStyle(stylers: Partial<StyleMap>): Style {
        const merge: (n: Partial<StyleMap>, o: Style) => StyleMap =
            R.mergeWith((a: Styler, b: StylerFn) =>
                a(b, this));
        return Object.freeze(new Style(merge(stylers, this)));
    }

    get context() {
        return new StyleContext(this);
    }
}

defineTag(Style, 'Style');

export function* fractions(max = 10, maxDenom = 10) {
    for (let i = 0; i < max; i++) {
        if (i !== 0) {
            yield [i];
            yield [-i];
        }
        for (let j = 2; j < maxDenom; j++) {
            for (let k = 1; k < j; k++) {
                if (gcd(k, j) === 1) {
                    yield [i * j + k, j];
                }
            }
        }
    }
}

const specials: Array<[number, string]> = [
    [Math.PI, tex`\pi`],
    [Math.sqrt(2), tex`\sqrt{2}`],
    [Math.E, tex`\mathrm{e}`]
]

export let SPECIAL_NUMBERS: Map<number, string> =
    ((m = new Map<number, string>()) => {
            for (const [numer, denom] of fractions()) {
                if (denom) {
                    m.set(numer / denom, tex`\frac{${numer}}{${denom}}`);
                }
                for (const [v, sym] of specials) {
                    if (!denom) {
                        // Integer
                        m.set(numer * v, numer === 1 ? sym : tex`${numer}${sym}`);
                    } else {
                        m.set(
                            numer * v / denom,
                            numer === 1
                                ? tex`\frac{${sym}}{${denom}}`
                                : tex`\frac{${numer}${sym}}{${denom}}`
                        );
                    }
                }
            }
            return Object.freeze(m) as Map<number, string>;
        }
    )();

const formatNumber: Styler<number> = (continuation: StylerFn<number>, _style: Style) =>
    (ctx, n) => {
        if (n === 0) {
            return tex`0`;
        }
        switch (ctx.numberFormat) {
            case NumberFormat.normal:
                const digits = Math.ceil(Math.log10(n));
                return n.toFixed(Math.max(ctx.numberPrecision - digits, 0));
            case NumberFormat.scientific:
            case NumberFormat.engineering:
                const exp = Math.log10(n);
                const eng = ctx.numberFormat === NumberFormat.engineering ? 3 : 1;
                const trunc = exp < 0 ? Math.ceil(exp / eng) * eng : Math.floor(exp / eng) * eng;
                const trim = (n: string) =>
                    ctx.numberTrimTrailingZero && n.match(/\./)
                        ? n.replace(/\.?0+$/, '')
                        : n;
                if (trunc === 0) {
                    return trim(n.toPrecision(ctx.numberPrecision))
                }
                const mantissa = n / Math.pow(10, trunc);
                return tex`${trim(mantissa.toPrecision(ctx.numberPrecision))} x 10^{${trunc}}`;
        }
    };


export const specialNumber: Styler<number> = (continuation: StylerFn<number>, _style: Style) =>
    (ctx, n, ...rest) =>
        (ctx.numberSpecials.has(n) && ctx.numberSpecials.get(n))
        || (ctx.numberSpecials.has(-n) && tex`-${ctx.numberSpecials.get(-n)}`)
        || continuation(ctx, n, ...rest);

export const chain = <I>(...stylers: Styler<I>[]): Styler<I> =>
    (continuation: StylerFn<I>, style: Style) =>
        stylers.reduceRight((prev, cur) => cur(prev, style), continuation);

/**
 * Create a [[Styler]] that changes the color.
 * @param color an [[RGB6Color]]
 */
export const colorStyler = (color: RGB6Color): Styler<any> =>
    (continuation: StylerFn<Unit>, _style: Style) => (ctx, texString, ...rest) =>
        tex`\textcolor{${color}}{${continuation(ctx, texString, ...rest)}}`;


/**
 * The stylers. These handle adding style formatting to the syntactic expressions
 * components.
 */
export const DEFAULTS: StyleMap = Object.freeze({
    unit: colorStyler('ff0000'),
    unitFraction: () => (_ctx, numer, denom) => tex`\Large{\frac{${numer}}{${denom}}}`,
    unitSymbol: () => (_ctx, unit) => tex`\text{${unit.symbol}}`,
    function: () => (_ctx, op) => tex`\operatorname{${op}}`,
    call: () => (_ctx, s) => s,
    variable: () => (_ctx, s: string) => tex`{${s}}`,
    applyUnit: () => (ctx, v: string|number, u: IUnitBase) => tex`{{${v}}\ {${ctx.unit(u)}}}`,
    applyUnitFunction: () => (ctx, v: string|number, u: IUnitBase) => tex`{{${v}} \Rightarrow {${ctx.unit(u)}}}`,
    number: chain(specialNumber, formatNumber),
    numberFormat: NumberFormat.scientific,
    numberPrecision: 4,
    numberSpecials: SPECIAL_NUMBERS,
    numberTrimTrailingZero: true
});

const DEFAULT_STYLE_FNS: StyleFnMap = {
    unit: (_ctx, u): string => u.getTex(_ctx),
    unitFraction: (_ctx, numer, denom) => tex`\dfrac{${numer}}{${denom}}`,
    unitSymbol: (_ctx, unit) => tex`\text{${unit.symbol}}`,
    function: (_ctx, s) => s.toString(),
    call: (_ctx, s) => s.toString(),
    variable: (_ctx, s) => s.toString(),
    applyUnit: (ctx, s, u) => `${s}\ ${ctx.unit(u)}`,
    applyUnitFunction: (ctx, s, u) => `${s} \RightArrow ${ctx.unit(u)}`,
    number: (_ctx, s) => s.toString(),
    numberFormat: NumberFormat.scientific,
    numberPrecision: 4,
    numberSpecials: SPECIAL_NUMBERS,
    numberTrimTrailingZero: true
};

/**
 * The initial [[DEFAULT_STYLE]].
 */
export const INITIAL_STYLE = new Style(DEFAULTS);

// noinspection UnnecessaryLocalVariableJS
/**
 * The [[Style]] that items are formatted with by default. May be changed; the
 * initial value is in [[INITIAL_STYLE]].
 *
 * @internal
 */
export let DEFAULT_STYLE = INITIAL_STYLE;

/**
 * Set the default style to be used.
 * @param style
 */
export const setStyle = (style: Style): Style => {
    // noinspection SuspiciousTypeOfGuard
    if (!(style instanceof Style)) {
        throw new Error(`Not a style object: ${style}`);
    }
    const old = DEFAULT_STYLE;
    DEFAULT_STYLE = style;
    return old;
}

// noinspection JSUnusedGlobalSymbols
/**
 * List of the valid style keys for [[setStyle]].
 */
export const LATEX_STYLE_KEYS: StyleKey[] = Object.keys(DEFAULT_STYLE) as StyleKey[];

/**
 * We take our colors in 6 RGB hex digits, e.g. RRGGBB, {RR, GG, BB} ∈ 00..FF.
 */
export type RGB6Color = string;

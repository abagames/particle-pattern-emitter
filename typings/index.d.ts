export declare let options: {
    scaleRatio: number;
    canvas: any;
    isLimitingColors: boolean;
};
export declare function emit(patternName: string, x: number, y: number, angle?: number, emitOptions?: any, pool?: ParticlePool): void;
export declare function update(): void;
export declare function getParticles(): Particle[];
export declare function setSeed(_seed?: number): void;
export declare function reset(): void;
export declare function clear(): void;
export declare function clearPools(): void;
export declare function setOptions(_options: any): void;
export declare class Emitter {
    base: Particle;
    angleDeflection: number;
    speedDeflection: number;
    sizeDeflection: number;
    ticksDeflection: number;
    count: number;
    constructor(patternType: string, emitOptions: any, random: Random);
    emit(x: number, y: number, angle: number, velX: number, velY: number, pool: ParticlePool): void;
}
export declare class Particle {
    pos: Vector;
    vel: Vector;
    size: number;
    color: Color;
    angle: number;
    speed: number;
    slowdownRatio: number;
    targetSize: number;
    middleTicks: number;
    endTicks: number;
    beginColor: Color;
    middleColor: Color;
    endColor: Color;
    ticks: number;
    update(context: CanvasRenderingContext2D): boolean;
}
export declare class ParticlePool {
    canvas: HTMLCanvasElement;
    particles: Particle[];
    context: CanvasRenderingContext2D;
    constructor(canvas?: HTMLCanvasElement);
    update(): void;
    getParticles(): Particle[];
    clear(): void;
}
export declare class Vector {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
}
export declare class Color {
    hue: number;
    saturation: number;
    value: number;
    sparkleRatio: number;
    r: number;
    g: number;
    b: number;
    sparkled: Color;
    lerped: Color;
    constructor(hue?: number, saturation?: number, value?: number, sparkleRatio?: number);
    getStyle(): string;
    getSparkled(): Color;
    getLerped(other: Color, ratio: any): Color;
    limitRgb(): void;
    limitColor(v: any): 1 | 0 | 0.5;
}
declare class Random {
    x: number;
    y: number;
    z: number;
    w: number;
    setSeed(v?: number): this;
    getInt(): number;
    get01(): number;
    getForParam(): number;
    constructor();
}
export {};

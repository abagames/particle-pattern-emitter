export let options: Options = {
  scaleRatio: 1, // scale a size and a speed of particles
  canvas: null, // set a drawing canvas
  isLimitingColors: false // limit a number of using colors
};

let emitters = {};
let seed = 0;
let pools: ParticlePool[] = [];
let defaultPool: ParticlePool;

// emit the particle.
// specify the type with the first character of the patternName
// (e: explosion, m: muzzle, s: spark, t: trail, j: jet)
export function emit(
  patternName: string,
  x: number,
  y: number,
  angle = 0,
  emitOptions: EmitOptions = {},
  pool = defaultPool
) {
  if (pool == null && defaultPool == null) {
    pool = defaultPool = new ParticlePool();
  }
  if (emitters[patternName] == null) {
    const random = new Random();
    random.setSeed(seed + getHashFromString(patternName));
    emitters[patternName] = new Emitter(patternName[0], emitOptions, random);
  }
  const velX = emitOptions.velX == null ? 0 : emitOptions.velX;
  const velY = emitOptions.velY == null ? 0 : emitOptions.velY;
  emitters[patternName].emit(x, y, angle, velX, velY, pool);
}

export function update() {
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    pool.update();
  }
}

export function getParticles() {
  return defaultPool.particles;
}

export function setSeed(_seed: number = 0) {
  seed = _seed;
}

export function reset() {
  emitters = {};
  clear();
}

export function clear() {
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    pool.clear();
  }
}

export function clearPools() {
  pools = [];
  defaultPool = new ParticlePool();
}

export function setOptions(_options: Options) {
  for (let attr in _options) {
    options[attr] = _options[attr];
  }
}

export class Emitter {
  base = new Particle();
  angleDeflection = 0;
  speedDeflection = 0.5;
  sizeDeflection = 0.5;
  ticksDeflection = 0.3;
  count = 1;

  constructor(patternType: string, emitOptions: EmitOptions, random: Random) {
    const hue = emitOptions.hue == null ? random.get() : emitOptions.hue;
    const sizeScale = emitOptions.sizeScale == null ? 1 : emitOptions.sizeScale;
    const countScale =
      emitOptions.countScale == null ? 1 : emitOptions.countScale;
    switch (patternType) {
      case "e":
        this.base.speed = 0.7;
        this.base.slowdownRatio = 0.05;
        this.base.targetSize = 10;
        this.base.beginColor = new Color(hue, 1, 0.5, 0.3);
        this.base.middleColor = new Color(hue, 0.2, 0.9, 0.1);
        this.base.endColor = new Color(hue, 0, 0, 0);
        this.base.middleTicks = 20;
        this.base.endTicks = 30;
        this.angleDeflection = Math.PI * 2;
        this.count = 15;
        break;
      case "m":
      case "s":
        this.base.speed = patternType === "m" ? 1.5 : 0.5;
        this.base.slowdownRatio = 0.025;
        this.base.targetSize = 5;
        this.base.beginColor = new Color(hue, 0.5, 0.5, 0.3);
        this.base.middleColor = new Color(hue, 1, 0.9, 0.3);
        this.base.endColor = new Color(hue, 0.75, 0.75, 0.2);
        this.base.middleTicks = 10;
        this.base.endTicks = 20;
        this.angleDeflection =
          patternType === "m" ? 0.3 * random.getForParam() : Math.PI * 2;
        this.count = 10;
        break;
      case "t":
      case "j":
        this.base.speed = patternType === "t" ? 0.1 : 1;
        this.base.slowdownRatio = 0.03;
        this.base.targetSize = patternType === "t" ? 3 : 7;
        this.base.beginColor = new Color(hue, 0.7, 0.7, 0.4);
        this.base.middleColor = new Color(hue, 1, 0.9, 0.2);
        this.base.endColor = new Color(hue, 0.7, 0.7, 0.1);
        this.base.middleTicks = patternType === "t" ? 30 : 15;
        this.base.endTicks = patternType === "t" ? 40 : 20;
        this.angleDeflection = 0.5 * random.getForParam();
        this.speedDeflection = 0.1;
        this.sizeDeflection = 0.1;
        this.ticksDeflection = 0.1;
        this.count = 0.5;
        break;
    }
    if (emitOptions.speed != null) {
      this.base.speed = emitOptions.speed;
    }
    if (emitOptions.slowdownRatio != null) {
      this.base.slowdownRatio = emitOptions.slowdownRatio;
    }
    this.base.speed *= sizeScale * options.scaleRatio;
    this.base.targetSize *= sizeScale * options.scaleRatio;
    this.count *= countScale;
    this.base.speed *= random.getForParam();
    this.base.slowdownRatio *= random.getForParam();
    this.base.targetSize *= random.getForParam();
    const em = this.base.endTicks - this.base.middleTicks;
    this.base.middleTicks *= random.getForParam();
    this.base.endTicks = this.base.middleTicks + em * random.getForParam();
    this.speedDeflection *= random.getForParam();
    this.sizeDeflection *= random.getForParam();
    this.ticksDeflection *= random.getForParam();
    this.count *= random.getForParam();
  }

  emit(
    x: number,
    y: number,
    angle = 0,
    velX = 0,
    velY = 0,
    pool: ParticlePool
  ) {
    if (this.count < 1 && this.count < Math.random()) {
      return;
    }
    for (let i = 0; i < this.count; i++) {
      const p = new Particle();
      p.pos.x = x;
      p.pos.y = y;
      p.vel.x = velX;
      p.vel.y = velY;
      p.angle = angle + (Math.random() - 0.5) * this.angleDeflection;
      p.speed =
        this.base.speed * ((Math.random() * 2 - 1) * this.speedDeflection + 1);
      p.slowdownRatio = this.base.slowdownRatio;
      p.targetSize =
        this.base.targetSize *
        ((Math.random() * 2 - 1) * this.sizeDeflection + 1);
      p.middleTicks =
        this.base.middleTicks *
        ((Math.random() * 2 - 1) * this.ticksDeflection + 1);
      p.endTicks =
        this.base.endTicks *
        ((Math.random() * 2 - 1) * this.ticksDeflection + 1);
      p.beginColor = this.base.beginColor;
      p.middleColor = this.base.middleColor;
      p.endColor = this.base.endColor;
      pool.particles.push(p);
    }
  }
}

export class Particle {
  pos = new Vector();
  vel = new Vector();
  size = 0;
  color: Color;
  angle = 0;
  speed = 1;
  slowdownRatio = 0.01;
  targetSize = 10;
  middleTicks = 20;
  endTicks = 60;
  beginColor: Color;
  middleColor: Color;
  endColor: Color;
  ticks = 0;
  isAlive = true;

  update(context: CanvasRenderingContext2D) {
    this.pos.x += Math.cos(this.angle) * this.speed + this.vel.x;
    this.pos.y += Math.sin(this.angle) * this.speed + this.vel.y;
    this.speed *= 1 - this.slowdownRatio;
    this.vel.x *= 0.99;
    this.vel.y *= 0.99;
    if (this.ticks >= this.endTicks) {
      this.isAlive = false;
      return false;
    }
    if (this.ticks < this.middleTicks) {
      this.color = this.beginColor.getLerped(
        this.middleColor,
        this.ticks / this.middleTicks
      );
      this.size += (this.targetSize - this.size) * 0.1;
    } else {
      this.color = this.middleColor.getLerped(
        this.endColor,
        (this.ticks - this.middleTicks) / (this.endTicks - this.middleTicks)
      );
      this.size *= 0.95;
    }
    this.color = this.color.getSparkled();
    if (context != null) {
      context.fillStyle = this.color.getStyle();
      context.fillRect(
        this.pos.x - this.size / 2,
        this.pos.y - this.size / 2,
        this.size,
        this.size
      );
    }
    this.ticks++;
  }
}

export class ParticlePool {
  particles: Particle[] = [];
  context: CanvasRenderingContext2D;

  constructor(public canvas: HTMLCanvasElement = options.canvas) {
    pools.push(this);
  }

  update() {
    if (this.context == null && this.canvas != null) {
      this.context = this.canvas.getContext("2d");
    }
    for (let i = 0; i < this.particles.length; ) {
      if (this.particles[i].update(this.context) === false) {
        this.particles.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  getParticles() {
    return this.particles;
  }

  clear() {
    this.particles = [];
  }
}

export class Vector {
  constructor(public x = 0, public y = 0) {}
}

export class Color {
  r = 0;
  g = 0;
  b = 0;
  sparkled: Color;
  lerped: Color;

  constructor(
    public hue = 0,
    public saturation = 1,
    public value = 1,
    public sparkleRatio = 0
  ) {
    this.r = value;
    this.g = value;
    this.b = value;
    const h = hue * 6;
    const i = Math.floor(h);
    const f = h - i;
    switch (i) {
      case 0:
        this.g *= 1 - saturation * (1 - f);
        this.b *= 1 - saturation;
        break;
      case 1:
        this.b *= 1 - saturation;
        this.r *= 1 - saturation * f;
        break;
      case 2:
        this.b *= 1 - saturation * (1 - f);
        this.r *= 1 - saturation;
        break;
      case 3:
        this.r *= 1 - saturation;
        this.g *= 1 - saturation * f;
        break;
      case 4:
        this.r *= 1 - saturation * (1 - f);
        this.g *= 1 - saturation;
        break;
      case 5:
        this.g *= 1 - saturation;
        this.b *= 1 - saturation * f;
        break;
    }
    if (options.isLimitingColors === true) {
      this.limitRgb();
    }
  }

  getStyle() {
    const r = Math.floor(this.r * 255);
    const g = Math.floor(this.g * 255);
    const b = Math.floor(this.b * 255);
    return `rgb(${r},${g},${b})`;
  }

  getSparkled() {
    if (this.sparkled == null) {
      this.sparkled = new Color();
    }
    this.sparkled.r = clamp(
      this.r + this.sparkleRatio * (Math.random() * 2 - 1)
    );
    this.sparkled.g = clamp(
      this.g + this.sparkleRatio * (Math.random() * 2 - 1)
    );
    this.sparkled.b = clamp(
      this.b + this.sparkleRatio * (Math.random() * 2 - 1)
    );
    if (options.isLimitingColors === true) {
      this.sparkled.limitRgb();
    }
    return this.sparkled;
  }

  getLerped(other: Color, ratio) {
    if (this.lerped == null) {
      this.lerped = new Color();
    }
    this.lerped.r = this.r * (1 - ratio) + other.r * ratio;
    this.lerped.g = this.g * (1 - ratio) + other.g * ratio;
    this.lerped.b = this.b * (1 - ratio) + other.b * ratio;
    this.lerped.sparkleRatio =
      this.sparkleRatio * (1 - ratio) + other.sparkleRatio * ratio;
    if (options.isLimitingColors === true) {
      this.lerped.limitRgb();
    }
    return this.lerped;
  }

  limitRgb() {
    this.r = this.limitColor(this.r);
    this.g = this.limitColor(this.g);
    this.b = this.limitColor(this.b);
  }

  limitColor(v) {
    return v < 0.25 ? 0 : v < 0.75 ? 0.5 : 1;
  }
}

function getHashFromString(str: string) {
  let hash = 0;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

function clamp(v: number) {
  if (v <= 0) {
    return 0;
  } else if (v >= 1) {
    return 1;
  } else {
    return v;
  }
}

class Random {
  x: number;
  y: number;
  z: number;
  w: number;

  get(fromOrTo: number = 1, to: number = null) {
    if (to == null) {
      to = fromOrTo;
      fromOrTo = 0;
    }
    return (this.getToMaxInt() / 0xffffffff) * (to - fromOrTo) + fromOrTo;
  }

  getInt(fromOrTo: number, to: number = null) {
    if (to == null) {
      to = fromOrTo;
      fromOrTo = 0;
    }
    return (this.getToMaxInt() % (to - fromOrTo)) + fromOrTo;
  }

  getPm() {
    return this.getInt(2) * 2 - 1;
  }

  select(values: any[]) {
    return values[this.getInt(values.length)];
  }

  getForParam() {
    return this.get(0.5, 1.5);
  }

  setSeed(
    w: number = null,
    x = 123456789,
    y = 362436069,
    z = 521288629,
    loopCount = 32
  ) {
    this.w = w != null ? w >>> 0 : Math.floor(Math.random() * 0xffffffff) >>> 0;
    this.x = x >>> 0;
    this.y = y >>> 0;
    this.z = z >>> 0;
    for (let i = 0; i < loopCount; i++) {
      this.getToMaxInt();
    }
    return this;
  }

  getToMaxInt() {
    const t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
    return this.w;
  }

  constructor() {
    this.setSeed();
    this.get = this.get.bind(this);
    this.getToMaxInt = this.getToMaxInt.bind(this);
  }
}

export interface Options {
  scaleRatio?: number;
  canvas?: HTMLCanvasElement;
  isLimitingColors?: boolean;
}

export interface EmitOptions {
  velX?: number; // set a velocity
  velY?: number;
  hue?: number; // set a color hue
  sizeScale?: number; // scale a size n times
  countScale?: number; // scale a count n times
  speed?: number; // override a speed
  slowdownRatio?: number; // override a slowdown ratio
}

export let options = {
  scaleRatio: 1,
  canvas: null
};

let emitters = {};
let seed = 0;
let context: CanvasRenderingContext2D;

// emit the particle.
// specify the type with the first character of the patternName
// (e: explosion, m: muzzle, s: spark, t: trail, j: jet)
export function emit(patternName: string,
  x: number, y: number, angle = 0, sizeScale = 1, countScale = 1, hue: number = null) {
  if (emitters[patternName] == null) {
    const random = new Random();
    random.setSeed(seed + getHashFromString(patternName));
    emitters[patternName] = new Emitter(patternName[0], sizeScale, countScale, hue, random);
  }
  emitters[patternName].emit(x, y, angle);
}

export function update() {
  Particle.update();
}

export function getParticles() {
  return Particle.s;
}

export function setSeed(_seed: number = 0) {
  seed = _seed;
}

export function reset() {
  emitters = {};
  Particle.s = [];
}

export class Emitter {
  base = new Particle();
  angleDeflection = 0;
  speedDeflection = 0.5;
  sizeDeflection = 0.5;
  ticksDeflection = 0.3;
  count = 1;

  constructor(patternType: string, sizeScale = 1, countScale = 1,
    hue: number = null, random: Random) {
    if (hue == null) {
      hue = random.get01();
    }
    switch (patternType) {
      case 'e':
        this.base.speed = 0.7;
        this.base.slowdownRatio = 0.05;
        this.base.targetSize = 10;
        this.base.beginColor = new Color(hue, 1, 0.5, 0.3);
        this.base.middleColor = new Color(hue, 0.2, 1, 0.1);
        this.base.endColor = new Color(hue, 0, 0, 0);
        this.base.middleTicks = 20;
        this.base.endTicks = 30;
        this.angleDeflection = Math.PI * 2;
        this.count = 15;
        break;
      case 'm':
      case 's':
        this.base.speed = patternType === 'm' ? 1.5 : 0.5;
        this.base.slowdownRatio = 0.025;
        this.base.targetSize = 5;
        this.base.beginColor = new Color(hue, 0.5, 0.5, 0.3);
        this.base.middleColor = new Color(hue, 1, 1, 0.3);
        this.base.endColor = new Color(hue, 0.75, 0.75, 0.2);
        this.base.middleTicks = 10;
        this.base.endTicks = 20;
        this.angleDeflection = patternType === 'm' ?
          0.3 * random.getForParam() : Math.PI * 2;
        this.count = 10;
        break;
      case 't':
      case 'j':
        this.base.speed = patternType === 't' ? 0.1 : 1;
        this.base.slowdownRatio = 0.03;
        this.base.targetSize = patternType === 't' ? 3 : 7;
        this.base.beginColor = new Color(hue, 0.7, 0.7, 0.4);
        this.base.middleColor = new Color(hue, 1, 1, 0.2);
        this.base.endColor = new Color(hue, 0.7, 0.7, 0.1);
        this.base.middleTicks = patternType === 't' ? 30 : 15;
        this.base.endTicks = patternType === 't' ? 40 : 20;
        this.angleDeflection = 0.5 * random.getForParam();
        this.speedDeflection = 0.1;
        this.sizeDeflection = 0.1;
        this.ticksDeflection = 0.1;
        this.count = 0.5;
        break;
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

  emit(x: number, y: number, angle = 0) {
    if (this.count < 1 && this.count < Math.random()) {
      return;
    }
    for (let i = 0; i < this.count; i++) {
      const p = new Particle();
      p.pos.x = x;
      p.pos.y = y;
      p.angle = angle + (Math.random() - 0.5) * this.angleDeflection;
      p.speed = this.base.speed *
        ((Math.random() * 2 - 1) * this.speedDeflection + 1);
      p.slowdownRatio = this.base.slowdownRatio;
      p.targetSize = this.base.targetSize *
        ((Math.random() * 2 - 1) * this.sizeDeflection + 1);
      p.middleTicks = this.base.middleTicks *
        ((Math.random() * 2 - 1) * this.ticksDeflection + 1);
      p.endTicks = this.base.endTicks *
        ((Math.random() * 2 - 1) * this.ticksDeflection + 1);
      p.beginColor = this.base.beginColor;
      p.middleColor = this.base.middleColor;
      p.endColor = this.base.endColor;
      Particle.s.push(p);
    }
  }
}

export class Particle {
  pos = new Vector();
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

  update() {
    this.pos.x += Math.cos(this.angle) * this.speed;
    this.pos.y += Math.sin(this.angle) * this.speed;
    this.speed *= (1 - this.slowdownRatio);
    if (this.ticks >= this.endTicks) {
      return false;
    }
    if (this.ticks < this.middleTicks) {
      this.color = this.beginColor.getLerped(this.middleColor,
        this.ticks / this.middleTicks);
      this.size += (this.targetSize - this.size) * 0.1;
    } else {
      this.color = this.middleColor.getLerped(this.endColor,
        (this.ticks - this.middleTicks) / (this.endTicks - this.middleTicks));
      this.size *= 0.95;
    }
    this.color = this.color.getSparkled();
    if (context != null) {
      context.fillStyle = this.color.getStyle();
      context.fillRect
        (this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size);
    }
    this.ticks++;
  }

  static s: Particle[] = [];

  static update() {
    if (context == null && options.canvas != null) {
      context = options.canvas.getContext('2d');
    }
    for (let i = 0; i < Particle.s.length;) {
      if (Particle.s[i].update() === false) {
        Particle.s.splice(i, 1);
      } else {
        i++;
      }
    }
  }
}

export class Vector {
  constructor(public x = 0, public y = 0) { }
}

export class Color {
  r = 0;
  g = 0;
  b = 0;
  sparkled: Color;
  lerped: Color;

  constructor
    (public hue = 0, public saturation = 1, public value = 1, public sparkleRatio = 0) {
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
    this.sparkled.r = clamp(this.r + this.sparkleRatio * (Math.random() * 2 - 1));
    this.sparkled.g = clamp(this.g + this.sparkleRatio * (Math.random() * 2 - 1));
    this.sparkled.b = clamp(this.b + this.sparkleRatio * (Math.random() * 2 - 1));
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
    return this.lerped;
  }
}

function getHashFromString(str: string) {
  let hash = 0;
  const len = str.length;
  for (let i = 0; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
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

  setSeed(v: number = -0x7fffffff) {
    if (v === -0x7fffffff) {
      v = Math.floor(Math.random() * 0x7fffffff);
    }
    this.x = v = 1812433253 * (v ^ (v >> 30))
    this.y = v = 1812433253 * (v ^ (v >> 30)) + 1
    this.z = v = 1812433253 * (v ^ (v >> 30)) + 2
    this.w = v = 1812433253 * (v ^ (v >> 30)) + 3;
    return this;
  }

  getInt() {
    var t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >> 19)) ^ (t ^ (t >> 8));
    return this.w;
  }

  get01() {
    return this.getInt() / 0x7fffffff;
  }

  getForParam() {
    return this.get01() + 0.5;
  }

  constructor() {
    this.setSeed();
    this.get01 = this.get01.bind(this);
  }
}

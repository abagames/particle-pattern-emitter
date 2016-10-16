declare module 'ppe' {
  function emit(patternName: string, x: number, y: number,
    angle?: number, sizeScale?: number, countScale?: number, hue?: number,
    velX?: number, velY?: number);
  function update();
  function getParticles();
  function setSeed(seed?: number);
  function reset();
  let options: PpeOptions;
  interface Particle {
    pos: Vector;
    size: number;
    color: Color;
  }
  interface Vector {
    x: number;
    y: number;
  }
  interface Color {
    r: number;
    g: number;
    b: number;
    getStyle(): string;
  }
  interface PpeOptions {
    scaleRatio?: number,
    canvas?: HTMLCanvasElement
  }
}

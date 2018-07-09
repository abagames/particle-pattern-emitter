# particle-pattern-emitter

Emit particles with a generated pattern.

[demo](https://abagames.github.io/particle-pattern-emitter/index.html?mines)

[![demo screenshot](https://abagames.github.io/particle-pattern-emitter/mines.gif)](https://abagames.github.io/particle-pattern-emitter/index.html?mines)

### How to use

See [the sample code](https://github.com/abagames/particle-pattern-emitter/blob/master/src/samples/mines.ts).

Include [build/index.js](https://github.com/abagames/particle-pattern-emitter/blob/master/build/index.js) script or install from npm.

```
> npm i particle-pattern-emitter
```

Call `update()` in a requestAnimation loop.

```js
/// ppe.update() should be called at each frame
ppe.update();
```

Use `emit()` to emit particles.
Each argument means `emit(patternName, positionX, positionY, direction?, emitOptions?)`.
First character of the patter name means the emitting pattern of particles.
(e: explosion, m: muzzle, s: spark, t: trail, j: jet)

```js
// emit the 'j'et particles
ppe.emit("j1", player.pos.x, player.pos.y, player.angle + Math.PI);
```

```js
// emit the 'e'xplosion particles
ppe.emit("e2", w.pos.x, w.pos.y, 0, { sizeScale: 2, countScale: 2 });
```

These emitOptions are available.

```js
  velX?: number; // set a velocity
  velY?: number;
  hue?: number; // set a color hue
  sizeScale?: number; // scale a size n times
  countScale?: number; // scale a count n times
  speed?: number; // override a speed
  slowdownRatio?: number; // override a slowdown ratio
```

You can use `setOptions()` to set global options.

```js
// set the ppe.options.canvas to specify the canvas to render particles
ppe.setOptions({
  canvas: canvas
});
```

These global options are available.

```js
  scaleRatio: 1, // scale a size and a speed of particles
  canvas: null, // set a drawing canvas
  isLimitingColors: false // limit a number of using colors
```

import * as ppe from "../index";
import * as debug from "./debug";
import * as sss from "sounds-some-sounds";
import * as pag from "pixel-art-gen";

let isInGame = false;
const rotationNum = 16;
let actors = [];
let player: any = null;
let ticks = 0;
let score = 0;
let cursorPos = { x: 0, y: 0 };
let isTouched = false;
let context;
let canvas;
const screenSize = 128;

window.onload = () => {
  debug.enableShowingErrors();
  debug.initSeedUi(onSeedChanged);
  const p = document.createElement("p");
  p.innerText = "[Mouse/Touch Left/Right]: turn";
  document.body.appendChild(p);
  canvas = document.createElement("canvas");
  canvas.width = canvas.height = screenSize;
  document.body.appendChild(canvas);
  context = canvas.getContext("2d");
  // set the ppe.options.canvas to specify the canvas to render particles
  ppe.setOptions({
    canvas: canvas
  });
  pag.setDefaultOptions({
    isMirrorY: true,
    rotationNum,
    scalePattern: 2
  });
  sss.init();
  onSeedChanged(8580576);
  setStars();
  document.addEventListener("mousedown", e => {
    onCursorDown(e.clientX, e.clientY);
  });
  document.addEventListener("touchstart", e => {
    onCursorDown(e.touches[0].clientX, e.touches[0].clientY);
  });
  document.addEventListener("mousemove", e => {
    onCursorMove(e.clientX, e.clientY);
  });
  document.addEventListener(
    "touchmove",
    e => {
      e.preventDefault();
      onCursorMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false }
  );
  document.addEventListener(
    "touchend",
    e => {
      e.preventDefault();
      (e.target as any).click();
    },
    { passive: false }
  );
  update();
};

function onCursorDown(x: number, y: number) {
  sss.playEmpty();
  if (!isInGame && ticks > 0) {
    isInGame = true;
    score = ticks = 0;
    sss.playBgm();
    actors = [];
    setStars();
    setPlayer();
  }
  isTouched = true;
  onCursorMove(x, y);
}

function onCursorMove(x: number, y: number) {
  cursorPos.x =
    ((x - canvas.offsetLeft) / canvas.clientWidth + 0.5) * screenSize;
  cursorPos.y =
    ((y - canvas.offsetTop) / canvas.clientHeight + 0.5) * screenSize;
}

function update() {
  requestAnimationFrame(update);
  context.fillStyle = "black";
  context.fillRect(0, 0, screenSize, screenSize);
  /// ppe.update() should be called at each frame
  ppe.update();
  sss.update();
  actors.sort((a, b) => a.priority - b.priority);
  forEach(actors, a => {
    a.update();
    const padding = 4;
    if (a.pos.x < -padding) {
      a.pos.x += 128 + padding * 2;
    }
    if (a.pos.x > 128 + padding) {
      a.pos.x -= 128 + padding * 2;
    }
    if (a.pos.y < -padding) {
      a.pos.y += 128 + padding * 2;
    }
    if (a.pos.y > 128 + padding) {
      a.pos.y -= 128 + padding * 2;
    }
    drawPixels(a);
  });
  for (let i = 0; i < actors.length; ) {
    if (actors[i].isAlive === false) {
      actors.splice(i, 1);
    } else {
      i++;
    }
  }
  context.fillStyle = "#ace";
  context.font = `9px monospace`;
  context.fillText(`${score}`, 5, 10);
  ticks++;
}

function setPlayer() {
  if (player != null) {
    player.isAlive = false;
  }
  player = {};
  player.pixels = pag.generate([" x", "xxxx"]);
  player.pos = { x: 64, y: 64 };
  player.vel = { x: 0, y: 0 };
  player.angle = -Math.PI / 2;
  player.wallTicks = 0;
  player.fireTicks = 20;
  player.update = function() {
    player.angle += (cursorPos.x / screenSize - 0.5) * 0.2;
    player.pos.x += Math.cos(player.angle);
    player.pos.y += Math.sin(player.angle);
    // emit the 'j'et particles
    ppe.emit("j1", player.pos.x, player.pos.y, player.angle + Math.PI);
    forEach(getActors("wall"), w => {
      if (
        Math.abs(player.pos.x - w.pos.x) < 5 &&
        Math.abs(player.pos.y - w.pos.y) < 5
      ) {
        player.isAlive = false;
        isInGame = false;
        ticks = -60;
        sss.playJingle("u1", true);
        sss.stopBgm();
        // emit the 'e'xplosion particles
        ppe.emit("e2", w.pos.x, w.pos.y, 0, { sizeScale: 2, countScale: 2 });
      }
    });
    if (--player.wallTicks <= 0) {
      setWall(
        player.pos.x - Math.cos(player.angle) * 8,
        player.pos.y - Math.sin(player.angle) * 8
      );
      sss.play("c1");
      player.wallTicks = 80 / Math.sqrt(ticks / 1000 + 1);
    }
    if (--player.fireTicks <= 0) {
      setShot();
      sss.play("s1");
      player.fireTicks = 40 / Math.sqrt(ticks / 2000 + 1);
    }
  };
  player.priority = 0;
  actors.push(player);
}

function setWall(x, y) {
  const wall: any = {};
  wall.pixels = pag.generate(["xx", "xx"], { isMirrorX: true, rotationNum: 1 });
  wall.pos = { x, y };
  wall.angle = 0;
  wall.priority = 1;
  wall.update = function() {};
  wall.name = "wall";
  actors.push(wall);
  // emit the 's'park particles
  ppe.emit("s1", x, y);
}

function setShot() {
  const shot: any = {};
  shot.pixels = pag.generate(["", "xxxx"]);
  shot.pos = { x: player.pos.x, y: player.pos.y };
  shot.angle = player.angle;
  shot.ticks = 0;
  shot.update = function() {
    shot.pos.x += Math.cos(shot.angle) * 2;
    shot.pos.y += Math.sin(shot.angle) * 2;
    forEach(getActors("wall"), w => {
      if (
        Math.abs(shot.pos.x - w.pos.x) < 10 &&
        Math.abs(shot.pos.y - w.pos.y) < 10
      ) {
        shot.isAlive = false;
        w.isAlive = false;
        // emit the 'e'xplosion particles
        ppe.emit("e1", w.pos.x, w.pos.y, 0, {
          velX: Math.cos(shot.angle),
          velY: Math.sin(shot.angle)
        });
        sss.playJingle("e1", true);
        score++;
      }
    });
    // emit the 't'rail particles
    ppe.emit("t1", shot.pos.x, shot.pos.y, shot.angle + Math.PI, {
      countScale: 0.5
    });
    if (shot.ticks > 60) {
      shot.isAlive = false;
    }
    shot.ticks++;
  };
  actors.push(shot);
  // emit the 'm'uzzle particles
  ppe.emit("m1", shot.pos.x, shot.pos.y, shot.angle);
}

function setStars() {
  for (let i = 0; i < 32; i++) {
    const star: any = {};
    star.pixels = pag.generate(["o"], {
      isMirrorY: false,
      hue: Math.random(),
      saturation: 0.4
    });
    star.pos = { x: Math.random() * 148 - 16, y: Math.random() * 148 - 16 };
    star.angle = 0;
    star.update = function() {};
    star.priority = -1;
    actors.push(star);
  }
}

function drawPixels(actor) {
  let a = actor.angle;
  if (a < 0) {
    a = Math.PI * 2 - Math.abs(a % (Math.PI * 2));
  }
  const pxs: pag.Pixel[][] =
    actor.pixels[Math.round(a / ((Math.PI * 2) / rotationNum)) % rotationNum];
  const pw = pxs.length;
  const ph = pxs[0].length;
  const sbx = Math.floor(actor.pos.x - pw / 2);
  const sby = Math.floor(actor.pos.y - ph / 2);
  for (let y = 0, sy = sby; y < ph; y++, sy++) {
    for (let x = 0, sx = sbx; x < pw; x++, sx++) {
      var px = pxs[x][y];
      if (!px.isEmpty) {
        context.fillStyle = px.style;
        context.fillRect(sx, sy, 1, 1);
      }
    }
  }
}

function getActors(name: string) {
  let result = [];
  forEach(actors, a => {
    if (a.name === name) {
      result.push(a);
    }
  });
  return result;
}

function forEach(array: any[], func: Function) {
  for (let i = 0; i < array.length; i++) {
    func(array[i]);
  }
}

function onSeedChanged(seed: number) {
  pag.setSeed(seed);
  sss.reset();
  sss.setSeed(seed);
  ppe.setSeed(seed);
  ppe.reset();
  if (isInGame) {
    sss.playBgm();
  }
}

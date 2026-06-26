import { Vector3 } from "./Yuu API/Basic Types/Vector3";
import { inWorldConsole } from "./Yuu API/Console";
import { registerStart } from "./Yuu API/RegisterStart";
import { spawnPrimitive } from "./Yuu API/SpawnPrimitive";
import { Quaternion } from "./Yuu API/Basic Types/Quaternion";
import { Color } from "./Yuu API/Basic Types/Color";
import { Events } from "./Yuu API/Events";

registerStart(start);
function start() {
  inWorldConsole.visible(true, new Vector3(0, 1.5, -1.5));
  console.log("Testing 1,2,3!");

  const sphereDiameter = 0.25;
  const sphereRadius = sphereDiameter * 0.5;

  const maxCircleRadius = 5;
  const shrinkPerLap = 0.5;
  const risePerLap = 0.1;
  const lapDuration = 5;
  const angularSpeed = (Math.PI * 2) / lapDuration;

  const spawnInterval = 0.08;
  const particleLifetime = 1;
  const trailParticles: { entity: any; life: number; color: Color }[] = [];
  const orbitStates: Array<{
    entity: any;
    color: Color;
    center: Vector3;
    currentRadius: number;
    currentHeight: number;
    angle: number;
    spawnTimer: number;
  }> = [];

  let fpsElapsed = 0;
  let fpsFrames = 0;
  const fpsReportInterval = 0.5;
  let nextNewColorIsBlue = true;

  function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function randomCenter() {
    return new Vector3(randomRange(-8, 8), sphereRadius, randomRange(-8, 8));
  }

  function createOrbitState(center: Vector3, color: Color) {
    const entity = spawnPrimitive.sphere(
      16,
      16,
      new Vector3(center.x + maxCircleRadius, center.y, center.z),
      sphereDiameter,
      Quaternion.one,
      color,
      1,
      "Sphere",
      "Static",
      undefined
    );

    orbitStates.push({
      entity,
      color,
      center,
      currentRadius: maxCircleRadius,
      currentHeight: 0,
      angle: 0,
      spawnTimer: 0,
    });
  }

  function resetOrbitState(state: any) {
    state.center = randomCenter();
    state.currentRadius = maxCircleRadius;
    state.currentHeight = 0;
    state.angle = 0;

    const newColor = nextNewColorIsBlue ? Color.blue : Color.red;
    nextNewColorIsBlue = !nextNewColorIsBlue;
    createOrbitState(randomCenter(), newColor);
  }

  function updateOrbitState(state: any, deltaTime: number) {
    if (!state.entity || !state.entity.exists()) {
      return;
    }

    state.angle += angularSpeed * deltaTime;
    if (state.angle >= Math.PI * 2) {
      state.angle -= Math.PI * 2;
      state.currentHeight += risePerLap;
      state.currentRadius = Math.max(0, state.currentRadius - shrinkPerLap);

      if (state.currentRadius <= 0) {
        resetOrbitState(state);
      }
    }

    const x = state.center.x + state.currentRadius * Math.cos(state.angle);
    const z = state.center.z + state.currentRadius * Math.sin(state.angle);
    const y = state.center.y + state.currentHeight;

    state.entity.pos = new Vector3(x, y, z);

    state.spawnTimer += deltaTime;
    while (state.spawnTimer >= spawnInterval) {
      state.spawnTimer -= spawnInterval;

      const pos = state.entity.pos;
      const particle = spawnPrimitive.sphere(
        8,
        8,
        new Vector3(pos.x, pos.y, pos.z),
        sphereDiameter,
        Quaternion.one,
        state.color,
        0.8,
        "None",
        "Empty",
        undefined
      );

      particle.mesh.color.set(state.color, 0.8);
      trailParticles.push({ entity: particle, life: particleLifetime, color: state.color });
    }
  }

  spawnPrimitive.plane(
    "Both",
    new Vector3(0, 0, 0),
    new Vector3(25, 1, 25),
    Quaternion.one,
    new Color(0.4, 0.4, 0.4),
    1,
    "None",
    "Empty",
    undefined
  );

  createOrbitState(new Vector3(5, sphereRadius, 0), Color.red);

  Events.onUpdate((deltaTime: number) => {
    fpsElapsed += deltaTime;
    fpsFrames += 1;

    if (fpsElapsed >= fpsReportInterval) {
      const fps = Math.round(fpsFrames / fpsElapsed);
      console.log(`FPS: ${fps}`);
      fpsElapsed = 0;
      fpsFrames = 0;
    }

    for (const state of orbitStates) {
      updateOrbitState(state, deltaTime);
    }

    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const p = trailParticles[i];
      if (!p.entity || !p.entity.exists()) {
        trailParticles.splice(i, 1);
        continue;
      }

      p.life -= deltaTime;
      const remaining = Math.max(0, p.life);
      const scale = (remaining / particleLifetime) * sphereDiameter;

      p.entity.scale = new Vector3(scale, scale, scale);
      p.entity.mesh.color.set(p.color, remaining / particleLifetime);

      if (remaining <= 0) {
        p.entity.destroy();
        trailParticles.splice(i, 1);
      }
    }
  });
}
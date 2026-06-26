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

  const sphereDiameter = 0.35;
  const sphereRadius = sphereDiameter * 0.5;

  const maxCircleRadius = 5;
  const minCircleRadius = 0.25;
  const shrinkPerLap = 0.5;
  const risePerLap = 1;
  const lapDuration = 5;
  const angularSpeed = (Math.PI * 2) / lapDuration;

  let circleCenter = new Vector3(0, sphereRadius, 0);
  let currentRadius = maxCircleRadius;
  let currentHeight = 0;
  let angle = 0;

  const spawnInterval = 0.08;
  const particleLifetime = 1;
  const trailParticles: { entity: any; life: number; color: Color }[] = [];
  let spawnTimer = 0;

  let fpsElapsed = 0;
  let fpsFrames = 0;
  const fpsReportInterval = 0.5;

  function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
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

  const sphere1 = spawnPrimitive.sphere(
    16,
    16,
    new Vector3(circleCenter.x + currentRadius, sphereRadius, circleCenter.z),
    sphereDiameter,
    Quaternion.one,
    Color.red,
    1,
    "Sphere",
    "Static",
    undefined
  );

  spawnPrimitive.sphere(
    16,
    16,
    new Vector3(0, 1, 5),
    sphereDiameter,
    Quaternion.one,
    Color.blue,
    1,
    "Sphere",
    "Static",
    undefined
  );

  Events.onUpdate((deltaTime: number) => {
    t += deltaTime;
    fpsElapsed += deltaTime;
    fpsFrames += 1;

    if (fpsElapsed >= fpsReportInterval) {
      const fps = Math.round(fpsFrames / fpsElapsed);
      console.log(`FPS: ${fps}`);
      fpsElapsed = 0;
      fpsFrames = 0;
    }

    if (sphere1 && sphere1.exists()) {
      angle += angularSpeed * deltaTime;

      if (angle >= Math.PI * 2) {
        angle -= Math.PI * 2;
        currentHeight += risePerLap;
        currentRadius = Math.max(0, currentRadius - shrinkPerLap);

        if (currentRadius <= minCircleRadius) {
          circleCenter = new Vector3(randomRange(-8, 8), sphereRadius, randomRange(-8, 8));
          currentRadius = maxCircleRadius;
          currentHeight = 0;
        }
      }

      const x = circleCenter.x + currentRadius * Math.cos(angle);
      const z = circleCenter.z + currentRadius * Math.sin(angle);
      const y = sphereRadius + currentHeight;

      sphere1.pos = new Vector3(x, y, z);

      spawnTimer += deltaTime;
      while (spawnTimer >= spawnInterval) {
        spawnTimer -= spawnInterval;

        const pos = sphere1.pos;
        const particle = spawnPrimitive.sphere(
          8,
          8,
          new Vector3(pos.x, pos.y, pos.z),
          sphereDiameter,
          Quaternion.one,
          Color.red,
          0.8,
          "None",
          "Empty",
          undefined
        );

        particle.material.emissionColor.set(Color.red);
        particle.material.emissionStrength.set(1);
        particle.material.roughness.set(0);

        trailParticles.push({ entity: particle, life: particleLifetime, color: Color.red });
      }
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
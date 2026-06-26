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

  console.log('Testing 1,2,3!');

  const sphereDiameter = 1;
  const sphereRadius = sphereDiameter * 0.5;
  const basePos = new Vector3(5, sphereRadius, 0);

  // ground plane so the bounce reads clearly
  spawnPrimitive.plane(
    "Both",
    new Vector3(0, 0, 0),
    new Vector3(20, 1, 20),
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
    new Vector3(basePos.x, basePos.y, basePos.z),
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

  const spawnInterval = 0.1;
  const particleLifetime = 1;
  const trailParticles: { entity: any; life: number; initialAlpha: number; color: Color }[] = [];
  let spawnTimer = 0;

  let t = 0;
  const period = 5;
  const amplitude = 2.5;

  Events.onUpdate((deltaTime: number) => {
    t += deltaTime;

    if (sphere1 && sphere1.exists()) {
      const bounce = Math.abs(Math.sin((t / period) * Math.PI));
      sphere1.pos = new Vector3(basePos.x, basePos.y + bounce * amplitude, basePos.z);

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

        trailParticles.push({ entity: particle, life: particleLifetime, initialAlpha: 0.8, color: Color.red });
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
      const alpha = p.initialAlpha * (remaining / particleLifetime);
      p.entity.mesh.color.set(p.color, alpha);

      if (p.life <= 0) {
        p.entity.destroy();
        trailParticles.splice(i, 1);
      }
    }
  });
}
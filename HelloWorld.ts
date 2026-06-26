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

  // spawn spheres
  const sphere1 = spawnPrimitive.sphere(16, 16, new Vector3(5, 1, 0), 1, Quaternion.one, Color.red, 1, 'Sphere', 'Static', undefined);
  spawnPrimitive.sphere(16, 16, new Vector3(0, 1, 5), 1, Quaternion.one, Color.blue, 1, 'Sphere', 'Static', undefined);

  // animate first sphere: move up/down by 5 units peak-to-peak over 5 seconds (±2.5 amplitude)
  let t = 0;
  const period = 5; // seconds for a full up/down cycle
  const amplitude = 2.5; // half of peak-to-peak distance (5/2)

  Events.onUpdate((deltaTime: number) => {
    t += deltaTime;

    if (sphere1 && sphere1.exists()) {
      const offset = Math.sin((t / period) * Math.PI * 2) * amplitude;
      const basePos = new Vector3(5, 1, 0);
      sphere1.pos = new Vector3(basePos.x, basePos.y + offset, basePos.z);
    }
  });
}
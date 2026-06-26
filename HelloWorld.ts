import { Vector3 } from "./Yuu API/Basic Types/Vector3";
import { inWorldConsole } from "./Yuu API/Console";
import { registerStart } from "./Yuu API/RegisterStart";
import { spawnPrimitive } from "./Yuu API/SpawnPrimitive";
import { Quaternion } from "./Yuu API/Basic Types/Quaternion";
import { Color } from "./Yuu API/Basic Types/Color";


registerStart(start);
function start() {
  inWorldConsole.visible(true, new Vector3(0, 1.5, -1.5));

  console.log('Testing 1,2,3!');

  // spawn a white sphere at (0,1,0)
  spawnPrimitive.sphere(16, 16, new Vector3(5, 1, 0), 1, Quaternion.one, Color.red, 1, 'Sphere', 'Static', undefined);
  spawnPrimitive.sphere(16, 16, new Vector3(0, 1, 5), 1, Quaternion.one, Color.blue, 1, 'Sphere', 'Static', undefined);
}
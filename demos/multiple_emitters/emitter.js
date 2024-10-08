import * as THREE from "three";
import World from "env";
import { Emitter, EmitterInstance } from "three-emitter";

(() => {
  // Setup of the scene, GUI, etc.
  const world = new World(false, false);

  // Maximum number of particles
  const maxParticles = 500000;

  // Emitter configuration
  const emitter = new Emitter({

    // Geometry used for particles
    geometry: new THREE.CircleGeometry(0.1, 8),

    // THREE.MaterialParameters used for the shader material
    materialParameters: {
      transparent: true,
      side: THREE.FrontSide
    },

    // Maximum number of particles
    maxParticles,

    // Per-instance shader attributes
    attributes: {
      rng: new THREE.InstancedBufferAttribute(new Float32Array(maxParticles * 3), 3),
      emitterPosition: new THREE.InstancedBufferAttribute(new Float32Array(maxParticles * 3), 3),
    },

    // Vertex shader
    vert: `
      precision highp float;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      #define PI 3.1415

      attribute vec3 position;

      attribute vec3 rng;
      attribute vec3 emitterPosition;
      uniform float time;

      varying float vColor;
      varying float vHighlight;

      void main() {
        float t = time + emitterPosition.x + emitterPosition.y + emitterPosition.z;
        float radius = 4.0 + sin(t + rng.z);
        float theta = (t + rng.z * 20.0) * 0.5 + rng.x * 2.0 * PI;
        float phi = (t + rng.z * 20.0) * 0.5 * 0.5 + rng.y * PI;

        float x = emitterPosition.x + radius * sin(phi) * cos(theta);
        float y = emitterPosition.y + radius * cos(phi) - 5.0;
        float z = emitterPosition.z + radius * sin(phi) * sin(theta);

        vColor = ((radius * sin(phi) * sin(theta)) + radius) / (2.0 * radius);
        vHighlight = abs(sin(t + vColor * 2.0));

        vec4 mvPosition = modelViewMatrix * vec4(x, y, z, 1.0);
        mvPosition.xyz += position;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,

    // Fragment shader
    frag: `
      precision highp float;

      varying float vColor;
      varying float vHighlight;

      void main() {
        vec4 color = vec4(0.7 + 0.3 * vHighlight, vColor * vHighlight, 0.2 * vHighlight, 1.0);
        gl_FragColor = color;
      }`
  });

  // General scene setup
  emitter.position.y = 10;
  world.scene.add(emitter);

  // Monitor pointer position
  const rc = new THREE.Raycaster();
  const pointerPosition = new THREE.Vector3(0);
  document.addEventListener("mousemove", ev => {
    rc.setFromCamera(new THREE.Vector2((ev.clientX / window.innerWidth) * 2 - 1, -(ev.clientY / window.innerHeight) * 2 + 1), world.scene.camera);
    const intersects = rc.intersectObject(world.scene.floor, true);
    if (intersects.length > 0) {
      world.scene.pointer.position.set(intersects[0].point.x, 0.11, intersects[0].point.z);
      pointerPosition.set(intersects[0].point.x, 0, intersects[0].point.z);
    }
  });

  // Function to spawn emitter instance at given location
  // All instances will run on the same shader program
  function spawnEmitter(pos) {
    // 10000 particles
    const instance = new EmitterInstance(emitter, 100 + Math.floor(Math.random() * 9000));
    // Set position
    instance.fillAttribute("emitterPosition", [pos.x, 0, pos.z]);
    // Random values for orbit/colors
    instance.fillAttribute("rng", () => Math.random());
  }

  // Spawn emitter instance on click
  document.addEventListener("click", () => {
    spawnEmitter(pointerPosition);
  });

})();

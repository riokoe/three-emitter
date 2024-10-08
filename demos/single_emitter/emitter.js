import * as THREE from "three";
import World from "env";
import { Emitter } from "three-emitter";

(() => {
  // Setup of the scene, GUI, etc.
  const world = new World();

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
    },

    // Shader uniforms
    uniforms: {
      pointer: { value: 5.0 },
    },

    // Vertex shader
    vert: `
      precision highp float;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      #define PI 3.1415

      attribute vec3 position;

      attribute vec3 rng;
      uniform float pointer;
      uniform float time;

      varying float vColor;
      varying float vHighlight;

      void main() {
        float radius = 1.0 + sin(time + rng.z) * 2.0 + pointer;
        float theta = (time + rng.z * 20.0) * 0.5 + rng.x * 2.0 * PI;
        float phi = (time + rng.z * 20.0) * 0.5 * 0.5 + rng.y * PI;

        float x = radius * sin(phi) * cos(theta);
        float y = radius * cos(phi);
        float z = radius * sin(phi) * sin(theta);

        vColor = (z + radius) / (2.0 * radius);
        vHighlight = abs(sin(time + vColor * 2.0));

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

  // Set initial values for shader attributes
  emitter.fillAttribute("rng", () => Math.random());

  // Set particle amount to render
  emitter.particleAmount = 100000;

  // General scene setup
  emitter.position.y = 10;
  world.scene.add(emitter);
  world.gui.add(emitter, "particleAmount", 0, maxParticles);

  // Monitor pointer movement and store position relative to the scene's center
  let pointerDest = 5.0;
  const rc = new THREE.Raycaster();
  document.addEventListener("mousemove", ev => {
    rc.setFromCamera(new THREE.Vector2((ev.clientX / window.innerWidth) * 2 - 1, -(ev.clientY / window.innerHeight) * 2 + 1), world.scene.camera);
    const intersects = rc.intersectObject(world.scene.floor, true);
    if (intersects.length > 0) {
      world.scene.pointer.position.set(intersects[0].point.x, 0.11, intersects[0].point.z);
      pointerDest = Math.min(30.0, Math.max(5.0, intersects[0].point.distanceTo(world.scene.floor.position)));
    }
  });

  // Increase/shrink particle orbit radius based on pointer distance by updating
  // the corresponding uniform. Smoothing out the movement across multiple frames
  let tmpms = 0;
  function tick(ms) {
    const delta = ms - tmpms;
    tmpms = ms;
    const dist = pointerDest - emitter.uniforms.pointer.value;
    if (Math.abs(dist) > 0.1)
      emitter.uniforms.pointer.value += dist * (delta / 1000);
    requestAnimationFrame(tick);
  }
  tick();

})();

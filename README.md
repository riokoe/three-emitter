# three-emitter

A high performance particle emitter for [THREE.js](https://github.com/mrdoob/three.js).

The library provides an abstraction layer for [InstancedBufferGeometry](https://threejs.org/docs/#api/en/core/InstancedBufferGeometry) and [RawShaderMaterial](https://threejs.org/docs/?q=raws#api/en/materials/RawShaderMaterial) allowing you to spawn multiple particle emitters running on the same shader program.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/V7V514H3K9)

# Demos

## Single Particle Emitter (500k particles)

![Demo1](https://github.com/riokoe/three-emitter/raw/main/demos/shared/demo2.gif)

 - [Open demo](https://github.com/riokoe/three-emitter/raw/main/demos/multiple_emitters/emitter.js)
 - [Source code](https://github.com/riokoe/three-emitter/raw/main/demos/multiple_emitters/emitter.js)

## Multiple Particle Emitters

![Demo2](https://github.com/riokoe/three-emitter/raw/main/demos/shared/demo1.gif)

 - [Open demo](https://github.com/riokoe/three-emitter/raw/main/demos/single_emitter/emitter.js)
 - [Source code](https://github.com/riokoe/three-emitter/raw/main/demos/single_emitter/emitter.js)

# Installation

## Dependencies

Has a peer dependency to [THREE.js](https://threejs.org/docs/#manual/en/introduction/Installation).

## NPM

Install via:

```bash
npm install three three-emitter
```

Import in ESM projects:

```js
import * as THREE from "three";
import { Emitter, EmitterInstance } from "three-emitter";
```

Import in CJS projects:

```js
const THREE = require("three");
const { Emitter, EmitterInstance } = require("three-emitter");
```

## Browser / CDN

Configure import map:

```xml
<script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js",
      "three-emitter": "https://cdn.jsdelivr.net/npm/three-emitter@latest/dist/browser/three-emitter.min.js",
    }
  }
</script>
```

Import in your project:


```js
import * as THREE from "three";
import { Emitter, EmitterInstance } from "three-emitter";
```

# Usage

For details see the [documentation](https://github.com/riokoe/three-emitter/raw/main/docs/index.md) and the source code for [single emitters](https://github.com/riokoe/three-emitter/raw/main/demos/single_emitter/emitter.js) and [multiple emitters]((https://github.com/riokoe/three-emitter/raw/main/demos/multiple_emitters/emitter.js)).

The library provides an abstraction layer for [InstancedBufferGeometry](https://threejs.org/docs/#api/en/core/InstancedBufferGeometry) and [RawShaderMaterial](https://threejs.org/docs/?q=raws#api/en/materials/RawShaderMaterial) allowing you to spawn multiple particle emitters running on the same shader program. There are two main interfaces: `Emitter` to define particle emitters and `EmitterInstance` to spawn multiple particle emitters per definition:

## Particle Emitter Definition

Before adding particle emitters to the scene, they'll need to be defined.

Instantiate the emitter:

```js
import * as THREE from "three";
import { Emitter, EmitterInstance } from "three-emitter";

const emitter = new Emitter();
```

Set the maximum number of particles:

```js
emitter.maxParticles = 100000;
```

Define the base geometry to be used for particles. This is optional as shapes can alternatively be calculated in the fragment shader. Defining a geometry will run the shader with default geometry attributes/uniforms (see [THREE.WebGLProgram](https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram)):

```js
emitter.setAttributesFromGeometry(THREE.PlaneGeometry(1, 1));
```

Define material parameters. This is optional. `Emitter` will internally create a RawShaderMaterial and use those parameters to instantiate it:

```js
emitter.setMaterialParameters({
  transparent: true,
  side: THREE.FrontSide
});
```

Define emitter uniforms. They will be available in the corresponding shaders. Uniforms are per-emitter (not per-particle) so the memory footprint is small. Use them to update emitter-wide attributes, e.g. global color values, textures, etc.

```js
emitter.setUniforms({
  color: new THREE.Uniform([1.0, 0.1, 1.0, 0.5]),
});
```

This uniform will then be available in the shader:

```glsl
uniform vec4 color;
void main() {
  // ...
}
```

Define emitter attributes. They will be available in the corresponding shaders. Attributes are per-particle (not per-emitter) so the memory footprint is higher compared to uniforms as the shader stores one value per particle instance. For example a 3D vector for 1000 instances will generate an ArrayBuffer with a length of 3000. Use them to update per-particle attributes, e.g. local position, randomized values etc.

Note, THREE.js provides a [standard type](https://threejs.org/docs/#api/en/core/InstancedBufferAttribute) for shader attributes. The first parameter is the length of the buffer. This should always be `maxParticles * attributeDimensions` (e.g. `maxParticles * 3` for a 3D vector). The second parameter indicates the dimensional shape itself. The renderer will use the second parameter to determine attribute type (`3` = `vec3`, `2` = `vec2`, `1` = `float` etc.)

```js
emitter.setAttributes({
  rng: new THREE.InstancedBufferAttribute(new Float32Array(emitter.maxParticles), 1),
});
```

This attrbute will then be available in the shader:

```gls
attribute float rng;
void main() {
  // ...
}
```

Define the vertex shader to render particles:

```js
emitter.setVertexShader(`
  attribute float rng;
  void main() {
    // ...
  }
`);
```

Define the fragment shader to render particles:

```js
emitter.setVertexShader(`
  uniform vec4 color;
  void main() {
    // ...
  }
`);
```

All of the above combined:

```js
import * as THREE from "three";
import { Emitter, EmitterInstance } from "three-emitter";

const maxParticles = 10000;
const emitter = new Emitter({
  geometry: new THREE.CircleGeometry(1.0, 8),
  materialParameters: {
    transparent: true,
    side: THREE.FrontSide
  },
  maxParticles,
  attributes: {
    rng: new THREE.InstancedBufferAttribute(new Float32Array(emitter.maxParticles), 1),
  },
  uniforms: {
    color: new THREE.Uniform([1.0, 0.1, 1.0, 0.5]),
  },
  vert: `
    precision highp float;

    // From default geometry
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    attribute vec3 position;

    // From custom attributes
    attribute float rng;

    // From Emitter
    uniform float time;

    void main() {
      vec4 animPos = vec4(position.x + cos(time * -rng) * 5.0, position.y + sin(time + rng) * 5.0, position.z, 0.0);
      gl_Position = projectionMatrix * (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + animPos);
    }`,
  frag: `
    precision highp float;

    // From custom uniforms
    uniform vec4 color;

    void main() {
      gl_FragColor = color;
    }`
});
```

## Spawn one particle emitter

To spawn a single particle emitter, no further instancing is required. Add the emitter to the scene, set the particle amount and fill array buffers:

```js
emitter.particleAmount = 1000;
emitter.fillAttribute("rng", () => Math.random());
myScene.add(emitter);
```

Optionally graudually mutate attributes/uniforms:

```js
function tick(ms = 0) {
  // Modulate opacity
  emitter.uniforms.color.value[3] = Math.sin(ms);
  // Some other, highly questionable calculations
  emitter.attributes.fillAttribute("rng", i => Math.min(1, Math.max(0, emitter.attributes.rng.array[i] + Math.random() * 0.1, 0, 1)));
  requestAnimationFrame(tick);
}
tick();
```

## Spawn multiple emitters

Use `EmitterInstance` to spawn multiple particle emitters off of one `Emitter` definition. All `EmitterInstance`s will run on the same shader program. Re-useing the previous emitter definition, add another attribute and update the vertex shader to allow position manipulation:

```js
emitter.setAttributes({
  emitterPosition: new THREE.InstancedBufferAttribute(new Float32Array(emitter.maxParticles * 3), 3),
});

emitter.setVertexShader(`
  precision highp float;

  // From default geometry
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  attribute vec3 position;

  // From custom attributes
  attribute float rng;
  attribute vec3 emitterPosition;

  // From Emitter
  uniform float time;

  void main() {
    vec4 pos = vec4(position.x, position.y, position.z, 0.0) +
      vec4(position.x + cos(time * -rng) * 5.0, position.y + sin(time + rng) * 5.0, position.z, 0.0) +
      vec4(emitterPosition, 0.0);
    gl_Position = projectionMatrix * (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + pos);
  }
`);
```

Add the emitter to the scene and spawn multiple instances:

```js
myScene.add(emitter);

const particlesPerEmitter = 1000;
const instances = [];

for (let i = 0; i <= 10; i++) {
  const instance = new EmitterInstance(emitter, particlesPerEmitter);
  // The following is the same as `emitter.fillAttribute` but instead of populating the entire ArrayBuffer
  // it'll only fill the portion of the ArrayBuffer that is provided to the particle instances associated
  // with this emitter instance
  instance.fillAttribute("rng", () => Math.random());
  instance.fillAttribute("emitterPosition", [i, i, i]);
}
```

Optionally mutate attributes/uniforms:

```js
function tick(ms = 0) {
  for (const [i, instance] of instances.entries()) {
    // Modulate opacity
    emitter.uniforms.color.value[3] = Math.sin(ms);
    // Move particle emitters in circles:
    emitter.attributes.fillAttribute("emitterPosition", [i + Math.sin(ms), i, i + Math.cos(ms)]);
  }
  requestAnimationFrame(tick);
}
tick();
```

The scene now consists of 10 independently positioned/animated particle emitters. All in one draw call.

# Documentation

## Classes

| Class | Description |
| ------ | ------ |
| [Emitter](https://github.com/riokoe/three-emitter/raw/main/docs/classes/Emitter.md) | A particle emitter. Provides an easy to use interface for THREE's InstancedBufferGeometry and RawShaderMaterial to spawn and manage particle emitters. Can emit particles on its own or can be used to create EmitterInstances with distinct shader attributes/uniforms while running on the same shader program. |
| [EmitterInstance](https://github.com/riokoe/three-emitter/raw/main/docs/classes/EmitterInstance.md) | A particle emitter instance. Provides the possibility to define and mutate shader attributes on a subset of particles while running on a shared shader program. Possible use cases: - Emit particles in different spacial locations - Emit particles with different shader attributes |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [IEmitterOptions](https://github.com/riokoe/three-emitter/raw/main/docs/interfaces/IEmitterOptions.md) | Options for the `Emitter`. |

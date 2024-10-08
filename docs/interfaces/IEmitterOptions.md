[**three-emitter**](../index.md) • **Docs**

***

# Interface: IEmitterOptions

Options for the `Emitter`.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| `attributes?` | `Record`\<`string`, `BufferAttribute` \| `InstancedBufferAttribute`\> | The attributes used in the shader. InstancedBufferAttributes are per particle instance. BufferAttributes stay the same across instances. Can be changed during runtime. `const instanceCount = 1000; const emitter = new Emitter({ maxParticles: instanceCount, attributes: { randomPerInstance: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1), randomPerEmitter: new THREE.BufferAttribute(new Float32Array(1)) } });` | Emitter.ts:104 |
| `autoUpdate?` | `boolean` | Whether the emitter should update automatically. Default is `true`. `const autoEmitter = new Emitter({ autoUpdate: true }); const manualEmitter = new Emitter({ autoUpdate: false }); function update(ms) { manualEmitter.update(); requestAnimationFrame(update); }` | Emitter.ts:136 |
| `frag?` | `string` | The GLSL fragment shader used to render particles. `const emitter = new Emitter({ frag: ` void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); } ` });` | Emitter.ts:37 |
| `geometry?` | `BufferGeometry`\<`NormalBufferAttributes`\> | A THREE.BufferGeometry used for sahder built-ins. See https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram `const emitter = new Emitter({ geometry: new THREE.PlaneGeometry(1, 1) });` Will provide corresponding the corresponding built-ins for each particle instance: `attribute vec3 position; attribute vec3 normal; attribute vec2 uv;` These built-ins can also be provided via `attributes`. | Emitter.ts:60 |
| `materialParameters?` | `ShaderMaterialParameters` | Additional parameters used for the shader material. `const emitter = new Emitter({ materialParameters: { transparent: true } });` | Emitter.ts:71 |
| `maxParticles` | `number` | The maximum number of particles. `const emitter = new Emitter({ maxParticles: 50000 });` | Emitter.ts:115 |
| `uniforms?` | `Record`\<`string`, `IUniform`\<`any`\>\> | The uniforms used in the shader. Stays the same across instances. Can be changed during runtime. `const emitter = new Emitter({ uniforms: { random: { value: Math.random() } } });` | Emitter.ts:85 |
| `vert?` | `string` | The GLSL vertex shader used to render particles. `const emitter = new Emitter({ vert: ` void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); } ` });` | Emitter.ts:22 |

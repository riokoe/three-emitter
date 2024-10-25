[**three-emitter**](../index.md) • **Docs**

***

# Class: Emitter

A particle emitter.
Provides an easy to use interface for THREE's InstancedBufferGeometry
and RawShaderMaterial to spawn and manage particle emitters. Can emit
particles on its own or can be used to create EmitterInstances with
distinct shader attributes/uniforms while running on the same shader
program.

```
const emitter = new Emitter({
  frag: myFragmentShader,
  vert: myVertShader,
  attributes: myShaderAttributes,
  uniforms: myShaderUniforms,
})

myScene.add(emitter);

const emitterInstance = new EmitterInstance(emitter, 100);
emitterInstance.fillAttribute("emitterPosition", [myX, myY, myZ]);
```

## Extends

- `Mesh`\<`THREE.InstancedBufferGeometry`, `THREE.RawShaderMaterial`\>

## Constructors

### new Emitter()

> **new Emitter**(`options`): [`Emitter`](Emitter.md)

Constructs a new emitter.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`IEmitterOptions`](../interfaces/IEmitterOptions.md) | The options. |

#### Returns

[`Emitter`](Emitter.md)

#### Overrides

`THREE.Mesh<THREE.InstancedBufferGeometry, THREE.RawShaderMaterial>.constructor`

#### Defined in

[Emitter.ts:188](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L188)

## Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| `autoUpdate` | `public` | `boolean` | `true` | Indicates whether the emitter auto-updates. | [Emitter.ts:165](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L165) |
| `knownInstances` | `public` | `Set`\<[`EmitterInstance`](EmitterInstance.md)\> | `undefined` | A set of all EmitterInstances running on this Emitter. Will be auto-updated when EmitterInstances are created/disposed. | [Emitter.ts:176](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L176) |
| `maxParticles` | `public` | `number` | `undefined` | The maximum number of particles. | [Emitter.ts:170](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L170) |
| `timestamp` | `protected` | `number` | `0` | A timestamp used for the default `time` uniform. | [Emitter.ts:181](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L181) |

## Accessors

### attributes

> `get` **attributes**(): `NormalBufferAttributes`

Interface for the internal geometry's attributes.

#### Returns

`NormalBufferAttributes`

#### Defined in

[Emitter.ts:548](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L548)

***

### particleAmount

> `get` **particleAmount**(): `number`

Interface for the internal geometry's instanceCount.

> `set` **particleAmount**(`amount`): `void`

Interface for the internal geometry's instanceCount.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `amount` | `number` |

#### Returns

`number`

#### Defined in

[Emitter.ts:555](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L555)

***

### uniforms

> `get` **uniforms**(): `Record`\<`string`, `IUniform`\<`any`\>\>

Interface for the internal material's uniforms.

#### Returns

`Record`\<`string`, `IUniform`\<`any`\>\>

#### Defined in

[Emitter.ts:539](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L539)

## Methods

### dispose()

> **dispose**(): `void`

Dispose the emitter and all its assets.

```
const emitter = new Emitter();
scene.add(emitter);
await new Promise((resolve) => setTimeout(resolve, 1000));
scene.remove(emitter);
emitter.dispose();
```

#### Returns

`void`

#### Defined in

[Emitter.ts:529](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L529)

***

### fillAttribute()

> **fillAttribute**(`attribute`, `value`): `void`

Fill an attribute with a data. Handles floats, arrays of floats or
functions that return floats.

```
const emitter = new Emitter()
  .setAttributes({
    random: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1),
    emitterPosition: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount * 3), 3),
    someAttribute: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1),
  });

emitter.fillAttribute("random", (index) => Math.random());
emitter.fillAttribute("emitterPosition", [0, 0, 0]);
emitter.fillAttribute("someAttribute", 0);
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `attribute` | `string` | The attribute to fill. |
| `value` | `number` \| `number`[] \| (`index`) => `number` \| `number`[] | The value to fill with. |

#### Returns

`void`

#### Defined in

[Emitter.ts:467](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L467)

***

### instanceAdded()

> **instanceAdded**(`instance`): `void`

Registers new EmitterInstances with the Emitter.
Used internally.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `instance` | [`EmitterInstance`](EmitterInstance.md) | The new EmitterInstance. |

#### Returns

`void`

#### Defined in

[Emitter.ts:393](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L393)

***

### instanceRemoved()

> **instanceRemoved**(`instance`): `void`

Unregister EmitterInstances with the Emitter.
Used internally.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `instance` | [`EmitterInstance`](EmitterInstance.md) | The disposed EmitterInstance. |

#### Returns

`void`

#### Defined in

[Emitter.ts:407](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L407)

***

### removeAndShiftAttributes()

> `protected` **removeAndShiftAttributes**(`instance`): `void`

Removes ranges from BufferAttributes and shifts data.
Used internally when unregistering EmitterInstances to re-populate
attributes.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `instance` | [`EmitterInstance`](EmitterInstance.md) | The disposed EmitterInstance. |

#### Returns

`void`

#### Defined in

[Emitter.ts:423](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L423)

***

### setAttributes()

> **setAttributes**(`attributes`): `this`

Set the attributes used in the shader.
InstancedBufferAttributes are per particle instance.
BufferAttributes stay the same across instances.
Can be changed during runtime.

```
const instanceCount = 1000;
const emitter = new Emitter()
  .setAttributes({
    randomPerInstance: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1),
    randomPerEmitter: new THREE.BufferAttribute(new Float32Array(1))
  });
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `attributes` | `Record`\<`string`, `BufferAttribute` \| `InstancedBufferAttribute`\> | The attributes used in the shader. |

#### Returns

`this`

#### Defined in

[Emitter.ts:237](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L237)

***

### setAttributesFromGeometry()

> **setAttributesFromGeometry**(`geometry`): `this`

Set a THREE.BufferGeometry used for sahder built-ins.
See https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram

```
const emitter = new Emitter()
  .setAttributesFromGeometry(new THREE.PlaneGeometry(1, 1));
```

Will provide corresponding the corresponding built-ins for each
particle instance:

```
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
```

These built-ins can also be provided via `attributes`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `geometry` | `BufferGeometry`\<`NormalBufferAttributes`\> | The geometry used for shader built-ins. |

#### Returns

`this`

#### Defined in

[Emitter.ts:268](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L268)

***

### setAutoUpdate()

> **setAutoUpdate**(`autoUpdate`): `this`

Define whether the emitter should update automatically.
Default is `true`.

```
const autoEmitter = new Emitter();
const manualEmitter = new Emitter()
  .setAutoUpdate(false);

function update(ms) {
  manualEmitter.update();
  requestAnimationFrame(update);
}
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `autoUpdate` | `boolean` | Whether the emitter should update automatically. |

#### Returns

`this`

#### Defined in

[Emitter.ts:379](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L379)

***

### setFragmentShader()

> **setFragmentShader**(`shader`): `this`

Set the GLSL fragment shader used to render particles.

```
const emitter = new Emitter()
  .setFragmentShader(`
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `);
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `shader` | `string` | The GLSL fragment shader used to render particles. |

#### Returns

`this`

#### Defined in

[Emitter.ts:309](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L309)

***

### setMaterialParameters()

> **setMaterialParameters**(`materialParameters`): `this`

Set additional parameters used for the shader material.

```
const emitter = new Emitter()
  .seetMaterialParameters({ transparent: true });
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `materialParameters` | `ShaderMaterialParameters` | Additional parameters used for the shader material. |

#### Returns

`this`

#### Defined in

[Emitter.ts:288](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L288)

***

### setUniforms()

> **setUniforms**(`uniforms`): `this`

Set the uniforms used in the shader.
Stays the same across instances. Can be changed during runtime.

```
const emitter = new Emitter()
  .setUniforms({
    random: { value: Math.random() }
  });
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `uniforms` | `Record`\<`string`, `IUniform`\<`any`\>\> | The uniforms used in the shader. |

#### Returns

`this`

#### Defined in

[Emitter.ts:350](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L350)

***

### setVertexShader()

> **setVertexShader**(`shader`): `this`

set the GLSL vertex shader used to render particles.

```
const emitter = new Emitter()
  .setVertexShader(`
    void main() {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    }
  `);
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `shader` | `string` | The GLSL vertex shader used to render particles. |

#### Returns

`this`

#### Defined in

[Emitter.ts:330](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L330)

***

### update()

> **update**(): `void`

Updates the Emitter if autoUdate is set to false. Should be called
every frame.

```
const emitter = new Emitter()
  .setAutoUpdate(false);

function update(ms) {
  emitter.update();
  requestAnimationFrame(update);
}
```

#### Returns

`void`

#### Defined in

[Emitter.ts:508](https://github.com/riokoe/three-emitter/blob/main/src/Emitter.ts#L508)

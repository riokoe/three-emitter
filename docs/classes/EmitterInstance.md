[**three-emitter**](../index.md) • **Docs**

***

# Class: EmitterInstance

A particle emitter instance.
Provides the possibility to define and mutate shader attributes
on a subset of particles while running on a shared shader program.
Possible use cases:
- Emit particles in different spacial locations
- Emit particles with different shader attributes

```
const instanceCount = 1000;
const emitter = new Emitter({
  maxParticles: instanceCount,
  frag: myFragmentShader,
  vert: myVertShader,
  attributes: {
    emitterPosition: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount * 3), 3),
    particleColor: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount * 4), 4),
  },
  uniforms: myShaderUniforms,
})

myScene.add(emitter);

const redEmitterInstance = new EmitterInstance(emitter, 500);
redEmitterInstance.fillAttribute("emitterPosition", [0, 0, 0]);
redEmitterInstance.fillAttribute("particleColor", [1.0, 0.0, 0.0, 1.0]);

const blueEmitterInstance = new EmitterInstance(emitter, 500);
blueEmitterInstance.fillAttribute("emitterPosition", [5, 5, 0]);
blueEmitterInstance.fillAttribute("particleColor", [0.0, 0.0, 1.0, 1.0]);
```

## Constructors

### new EmitterInstance()

> **new EmitterInstance**(`emitter`, `particleAmount`): [`EmitterInstance`](EmitterInstance.md)

Create an EmitterInstance.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `emitter` | [`Emitter`](Emitter.md) | The parent Emitter. |
| `particleAmount` | `number` | The amount of particles to emit. |

#### Returns

[`EmitterInstance`](EmitterInstance.md)

#### Defined in

EmitterInstance.ts:96

## Properties

| Property | Modifier | Type | Default value | Description | Defined in |
| ------ | ------ | ------ | ------ | ------ | ------ |
| `attributeIndices` | `public` | `Partial`\<`Record`\<`string`, `number`\>\> | `{}` | A map of attributes and the corresponding EventEmitter's index. Used internally to keep track of subarray ranges. | EmitterInstance.ts:88 |
| `attributes` | `public` | `Partial`\<`Record`\<`string`, `Float32Array`\>\> | `{}` | Typed (sub-) arrays for the corresponding shader attribute buffers. `THREE.BufferAttribute` attributes are shared across all instances. `THREE.InstancedBufferAttribute` attributes are per instance subarraus. `const emitter = new Emitter({ maxParticles: 1000, attributes: { sharedAttr: new THREE.BufferAttribute(new Float32Array(12)), distinctAttr1: new THREE.InstancedBufferAttribute(new Float32Array(1000), 1) distinctAttr2: new THREE.InstancedBufferAttribute(new Float32Array(3000), 3) } }); console.log(emitter.geometry.attributes.sharedAttr.array.length); // 12 console.log(emitter.geometry.attributes.distinctAttr1.array.length); // 1000 console.log(emitter.geometry.attributes.distinctAttr2.array.length); // 3000 const instance1 = new EmitterInstance(emitter, 100); console.log(instance1.attributes.sharedAttr.length); // 12 console.log(instance1.attributes.distinctAttr1.length); // 100 console.log(instance1.attributes.distinctAttr2.length); // 300 const instance2 = new EmitterInstance(emitter, 200); console.log(instance2.attributes.sharedAttr.length); // 12 console.log(instance2.attributes.distinctAttr1.length); // 200 console.log(instance2.attributes.distinctAttr2.length); // 600` See `fillAttributes()` for an easy way to manipulate attributes. | EmitterInstance.ts:82 |
| `emitter` | `public` | [`Emitter`](Emitter.md) | `undefined` | The EmitterInstance's parent Emitter. All EmitterInstances will share the same shader program while having access to their own shader attributes. | EmitterInstance.ts:48 |
| `particleAmount` | `public` | `number` | `0` | The amount of particles in the EmitterInstance. Must be smaller/equal to its parent Emitter's maxParticles. | EmitterInstance.ts:41 |

## Methods

### added()

> `protected` **added**(): `void`

Registers the EmitterInstance with its parent Emitter.
Used internally.

#### Returns

`void`

#### Defined in

EmitterInstance.ts:156

***

### calculateAttributeSubarrays()

> `protected` **calculateAttributeSubarrays**(): `void`

Internal method to (re-)calculate attribute subarrays

#### Returns

`void`

#### Defined in

EmitterInstance.ts:175

***

### dispose()

> **dispose**(): `void`

Remove the EmitterInstance from its parent Emitter and dispose
all its assets.

#### Returns

`void`

#### Defined in

EmitterInstance.ts:166

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

const instance1 = new EmitterInstance(Emitter, 100)
instance1.fillAttribute("emitterPosition", [0, 0, 0]);
instance1.fillAttribute("someAttribute", 0);

const instance2 = new EmitterInstance(Emitter, 200)
instance2.fillAttribute("emitterPosition", [1, 1, 0]);
instance2.fillAttribute("someAttribute", 0.1);
```

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `attribute` | `string` | The attribute to fill. |
| `value` | `number` \| `number`[] \| (`index`) => `number` | The value to fill with. |

#### Returns

`void`

#### Defined in

EmitterInstance.ts:132

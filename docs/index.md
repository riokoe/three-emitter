[**three-emitter**](index.md) • **Docs**

***

# three-emitter

## Classes

| Class | Description |
| ------ | ------ |
| [Emitter](classes/Emitter.md) | A particle emitter. Provides an easy to use interface for THREE's InstancedBufferGeometry and RawShaderMaterial to spawn and manage particle emitters. Can emit particles on its own or can be used to create EmitterInstances with distinct shader attributes/uniforms while running on the same shader program. |
| [EmitterInstance](classes/EmitterInstance.md) | A particle emitter instance. Provides the possibility to define and mutate shader attributes on a subset of particles while running on a shared shader program. Possible use cases: - Emit particles in different spacial locations - Emit particles with different shader attributes |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [IEmitterOptions](interfaces/IEmitterOptions.md) | Options for the `Emitter`. |

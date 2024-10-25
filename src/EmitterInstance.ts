import Emitter from "./Emitter.js";

/**
 * A particle emitter instance.
 * Provides the possibility to define and mutate shader attributes
 * on a subset of particles while running on a shared shader program.
 * Possible use cases:
 * - Emit particles in different spacial locations
 * - Emit particles with different shader attributes
 * 
 * ```
 * const instanceCount = 1000;
 * const emitter = new Emitter({
 *   maxParticles: instanceCount,
 *   frag: myFragmentShader,
 *   vert: myVertShader,
 *   attributes: {
 *     emitterPosition: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount * 3), 3),
 *     particleColor: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount * 4), 4),
 *   },
 *   uniforms: myShaderUniforms,
 * })
 * 
 * myScene.add(emitter);
 * 
 * const redEmitterInstance = new EmitterInstance(emitter, 500);
 * redEmitterInstance.fillAttribute("emitterPosition", [0, 0, 0]);
 * redEmitterInstance.fillAttribute("particleColor", [1.0, 0.0, 0.0, 1.0]);
 * 
 * const blueEmitterInstance = new EmitterInstance(emitter, 500);
 * blueEmitterInstance.fillAttribute("emitterPosition", [5, 5, 0]);
 * blueEmitterInstance.fillAttribute("particleColor", [0.0, 0.0, 1.0, 1.0]);
 * ```
 */
export default class EmitterInstance {

  /**
   * The amount of particles in the EmitterInstance.
   * Must be smaller/equal to its parent Emitter's maxParticles.
   */
  public particleAmount: number = 0;

  /**
   * The EmitterInstance's parent Emitter.
   * All EmitterInstances will share the same shader program while
   * having access to their own shader attributes.
   */
  public emitter: Emitter;

  /**
   * Typed (sub-) arrays for the corresponding shader attribute buffers.
   * `THREE.BufferAttribute` attributes are shared across all instances.
   * `THREE.InstancedBufferAttribute` attributes are per instance subarraus.
   * 
   * ```
   * const emitter = new Emitter({
   *   maxParticles: 1000,
   *   attributes: {
   *     sharedAttr: new THREE.BufferAttribute(new Float32Array(12)),
   *     distinctAttr1: new THREE.InstancedBufferAttribute(new Float32Array(1000), 1)
   *     distinctAttr2: new THREE.InstancedBufferAttribute(new Float32Array(3000), 3)
   *   }
   * });
   * 
   * console.log(emitter.geometry.attributes.sharedAttr.array.length); // 12
   * console.log(emitter.geometry.attributes.distinctAttr1.array.length); // 1000
   * console.log(emitter.geometry.attributes.distinctAttr2.array.length); // 3000
   * 
   * const instance1 = new EmitterInstance(emitter, 100);
   * console.log(instance1.attributes.sharedAttr.length); // 12
   * console.log(instance1.attributes.distinctAttr1.length); // 100
   * console.log(instance1.attributes.distinctAttr2.length); // 300
   * 
   * const instance2 = new EmitterInstance(emitter, 200);
   * console.log(instance2.attributes.sharedAttr.length); // 12
   * console.log(instance2.attributes.distinctAttr1.length); // 200
   * console.log(instance2.attributes.distinctAttr2.length); // 600
   * ```
   * 
   * See `fillAttributes()` for an easy way to manipulate attributes. 
   */
  public attributes: Partial<Record<string, Float32Array>> = {};

  /**
   * A map of attributes and the corresponding EventEmitter's index.
   * Used internally to keep track of subarray ranges.
   */
  public attributeIndices: Partial<Record<string, number>> = {};

  /**
   * Create an EmitterInstance.
   * 
   * @param {Emitter} emitter - The parent Emitter.
   * @param {number} particleAmount - The amount of particles to emit.
   */
  constructor(emitter: Emitter, particleAmount: number) {
    this.emitter = emitter;
    this.particleAmount = particleAmount;

    this.calculateAttributeSubarrays();
    this.added();
  }

  /**
   * Fill an attribute with a data. Handles floats, arrays of floats or
   * functions that return floats.
   * 
   * ```
   * const emitter = new Emitter()
   *   .setAttributes({
   *     random: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1),
   *     emitterPosition: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount * 3), 3),
   *     someAttribute: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1),
   *   });
   * 
   * emitter.fillAttribute("random", (index) => Math.random());
   * 
   * const instance1 = new EmitterInstance(Emitter, 100)
   * instance1.fillAttribute("emitterPosition", [0, 0, 0]);
   * instance1.fillAttribute("someAttribute", 0);
   * 
   * const instance2 = new EmitterInstance(Emitter, 200)
   * instance2.fillAttribute("emitterPosition", [1, 1, 0]);
   * instance2.fillAttribute("someAttribute", 0.1);
   * ```
   * 
   * @param {string} attribute - The attribute to fill.
   * @param {number | number[] | ((index: number) => number)} value -
   *   The value to fill with.
   * @returns {void}
   */
  public fillAttribute(attribute: string, value: number | number[] | ((index: number) => number)): void {
    if (!this.attributes[attribute])
      return;

    const data = this.attributes[attribute];
    if (typeof value === "function") {
      for (let i = 0; i < data.length; i += 1)
        data.set([value(i)], i);
    }
    else if (Array.isArray(value)) {
      for (let i = 0; i < data.length; i += value.length)
        data.set(value, i);
    }
    else {
      data.fill(value);
    }
  }

  /**
   * Registers the EmitterInstance with its parent Emitter.
   * Used internally.
   * 
   * @returns {void}
   */
  protected added(): void {
    this.emitter.instanceAdded(this);
  }

  /**
   * Remove the EmitterInstance from its parent Emitter and dispose
   * all its assets.
   * 
   * @returns {void}
   */
  public dispose(): void {
    this.emitter.instanceRemoved(this);
  }

  /**
   * Internal method to (re-)calculate attribute subarrays
   * 
   * @returns {void}
   */
  public calculateAttributeSubarrays(): void {
    for (const [name, attr] of Object.entries(this.emitter.geometry.attributes)) {
      if (attr.count >= this.emitter.maxParticles) {
        // Per-vertex attributes
        // Create an array view for the corresponding subarray
        const start = this.attributeIndices[name] ?? Math.max(0, this.emitter.geometry.instanceCount * attr.itemSize);
        const end = Math.min(attr.array.length, start + this.particleAmount * attr.itemSize);
        this.attributeIndices[name] = start;
        this.attributes[name] = new Proxy(attr.array.subarray(start, end) as Float32Array, {
          get: (target, prop): unknown => {
            // Trigger needsUpdate if the array is mutated
            if (prop === "set" || prop === "fill" || prop === "copyWithin")
              this.emitter.geometry.attributes[name].needsUpdate = true;
            // Very hacky way to get around exotic properties
            /* eslint-disable */
            // @ts-expect-error only way around exotic properties
            return (typeof target[prop] === "function") ?
              // @ts-expect-error only way around exotic properties
              target[prop]?.bind(target) :
              // @ts-expect-error only way around exotic properties
              target[prop];
            /* eslint-enable */
          },
          set: (target, prop, value, receiver): boolean => {
            if (typeof prop === "string" && !isNaN(Number(prop))) {
              this.emitter.geometry.attributes[name].needsUpdate = true;
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              target[Number(prop)] = value;
              return true;
            }
            return Reflect.set(target, prop, value, receiver);
          }
        });
      }
      else if (!this.attributes[name]) {
        // Per draw-call attributes
        // Store the array view for the entire buffer
        this.attributes[name] = attr.array as Float32Array;
      }
    }
  }
}
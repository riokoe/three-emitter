var ThreeEmitter = (function (exports, THREE) {
    'use strict';

    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n.default = e;
        return Object.freeze(n);
    }

    var THREE__namespace = /*#__PURE__*/_interopNamespaceDefault(THREE);

    /**
     * A particle emitter.
     * Provides an easy to use interface for THREE's InstancedBufferGeometry
     * and RawShaderMaterial to spawn and manage particle emitters. Can emit
     * particles on its own or can be used to create EmitterInstances with
     * distinct shader attributes/uniforms while running on the same shader
     * program.
     *
     * ```
     * const emitter = new Emitter({
     *   frag: myFragmentShader,
     *   vert: myVertShader,
     *   attributes: myShaderAttributes,
     *   uniforms: myShaderUniforms,
     * })
     *
     * myScene.add(emitter);
     *
     * const emitterInstance = new EmitterInstance(emitter, 100);
     * emitterInstance.fillAttribute("emitterPosition", [myX, myY, myZ]);
     * ```
     */
    class Emitter extends THREE__namespace.Mesh {
        /**
         * Indicates whether the emitter auto-updates.
         */
        autoUpdate = true;
        /**
         * The maximum number of particles.
         */
        maxParticles;
        /**
         * A set of all EmitterInstances running on this Emitter.
         * Will be auto-updated when EmitterInstances are created/disposed.
         */
        knownInstances = new Set();
        /**
         * A timestamp used for the default `time` uniform.
         */
        timestamp = 0;
        /**
         * Constructs a new emitter.
         *
         * @param {IEmitterOptions} options - The options.
         */
        constructor(options = { maxParticles: 1000 }) {
            super();
            this.geometry = new THREE__namespace.InstancedBufferGeometry();
            this.material = new THREE__namespace.RawShaderMaterial();
            this.material.uniforms.time = { value: 0 };
            this.maxParticles = options.maxParticles;
            this.geometry.instanceCount = 0;
            if (options.attributes)
                this.setAttributes(options.attributes);
            if (options.uniforms)
                this.setUniforms(options.uniforms);
            if (options.materialParameters)
                this.setMaterialParameters(options.materialParameters);
            if (options.vert)
                this.setVertexShader(options.vert);
            if (options.frag)
                this.setFragmentShader(options.frag);
            if (options.geometry)
                this.setAttributesFromGeometry(options.geometry);
            this.setAutoUpdate(options.autoUpdate ?? true);
        }
        /**
         * Set the attributes used in the shader.
         * InstancedBufferAttributes are per particle instance.
         * BufferAttributes stay the same across instances.
         * Can be changed during runtime.
         *
         * ```
         * const instanceCount = 1000;
         * const emitter = new Emitter()
         *   .setAttributes({
         *     randomPerInstance: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1),
         *     randomPerEmitter: new THREE.BufferAttribute(new Float32Array(1))
         *   });
         * ```
         *
         * @param {Record<string, THREE.InstancedBufferAttribute | THREE.BufferAttribute>} attributes -
         *   The attributes used in the shader.
         * @returns {this}
         */
        setAttributes(attributes) {
            for (const [name, attr] of Object.entries(attributes))
                this.geometry.setAttribute(name, attr);
            return this;
        }
        /**
         * Set a THREE.BufferGeometry used for sahder built-ins.
         * See https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
         *
         * ```
         * const emitter = new Emitter()
         *   .setAttributesFromGeometry(new THREE.PlaneGeometry(1, 1));
         * ```
         *
         * Will provide corresponding the corresponding built-ins for each
         * particle instance:
         *
         * ```
         * attribute vec3 position;
         * attribute vec3 normal;
         * attribute vec2 uv;
         * ```
         *
         * These built-ins can also be provided via `attributes`.
         *
         * @param {THREE.BufferGeometry} geometry - The geometry used for
         *   shader built-ins.
         * @returns {this}
         */
        setAttributesFromGeometry(geometry) {
            for (const [name, attr] of Object.entries(geometry.attributes))
                this.geometry.setAttribute(name, attr);
            this.geometry.index = geometry.index;
            geometry.dispose();
            return this;
        }
        /**
         * Set additional parameters used for the shader material.
         *
         * ```
         * const emitter = new Emitter()
         *   .seetMaterialParameters({ transparent: true });
         * ```
         *
         * @param {THREE.ShaderMaterialParameters} materialParameters -
         *   Additional parameters used for the shader material.
         * @returns {this}
         */
        setMaterialParameters(materialParameters) {
            this.material.setValues(materialParameters);
            return this;
        }
        /**
         * Set the GLSL fragment shader used to render particles.
         *
         * ```
         * const emitter = new Emitter()
         *   .setFragmentShader(`
         *     void main() {
         *       gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
         *     }
         *   `);
         * ```
         *
         * @param {string} shader - The GLSL fragment shader used to render
         *   particles.
         * @returns {this}
         */
        setFragmentShader(shader) {
            this.material.fragmentShader = shader;
            return this;
        }
        /**
         * set the GLSL vertex shader used to render particles.
         *
         * ```
         * const emitter = new Emitter()
         *   .setVertexShader(`
         *     void main() {
         *       gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
         *     }
         *   `);
         * ```
         *
         * @param {string} shader - The GLSL vertex shader used to render
         *   particles.
         * @returns {this}
         */
        setVertexShader(shader) {
            this.material.vertexShader = shader;
            return this;
        }
        /**
         * Set the uniforms used in the shader.
         * Stays the same across instances. Can be changed during runtime.
         *
         * ```
         * const emitter = new Emitter()
         *   .setUniforms({
         *     random: { value: Math.random() }
         *   });
         * ```
         *
         * @param {Record<string, THREE.IUniform>} uniforms - The uniforms used
         *   in the shader.
         * @returns {this}
         */
        setUniforms(uniforms) {
            for (const [name, attr] of Object.entries(uniforms)) {
                if (!(name in this.material.uniforms))
                    this.material.uniforms[name] = { value: attr.value };
                else
                    this.material.uniforms[name].value = attr.value;
            }
            return this;
        }
        /**
         * Define whether the emitter should update automatically.
         * Default is `true`.
         *
         * ```
         * const autoEmitter = new Emitter();
         * const manualEmitter = new Emitter()
         *   .setAutoUpdate(false);
         *
         * function update(ms) {
         *   manualEmitter.update();
         *   requestAnimationFrame(update);
         * }
         * ```
         *
         * @param {boolean} autoUpdate - Whether the emitter should update
         *   automatically.
         * @returns {this}
         */
        setAutoUpdate(autoUpdate) {
            this.autoUpdate = autoUpdate;
            if (autoUpdate)
                requestAnimationFrame(this.update.bind(this));
            return this;
        }
        /**
         * Registers new EmitterInstances with the Emitter.
         * Used internally.
         *
         * @param {EmitterInstance} instance - The new EmitterInstance.
         * @returns {void}
         */
        instanceAdded(instance) {
            if (!this.knownInstances.has(instance)) {
                this.knownInstances.add(instance);
                this.geometry.instanceCount = Math.min(this.maxParticles, this.geometry.instanceCount + instance.particleAmount);
            }
        }
        /**
         * Unregister EmitterInstances with the Emitter.
         * Used internally.
         *
         * @param {EmitterInstance} instance - The disposed EmitterInstance.
         * @returns {void}
         */
        instanceRemoved(instance) {
            if (this.knownInstances.has(instance)) {
                this.geometry.instanceCount = Math.max(0, this.geometry.instanceCount - instance.particleAmount);
                this.removeAndShiftAttributes(instance);
                this.knownInstances.delete(instance);
            }
        }
        /**
         * Removes ranges from BufferAttributes and shifts data.
         * Used internally when unregistering EmitterInstances to re-populate
         * attributes.
         *
         * @param {EmitterInstance} instance - The disposed EmitterInstance.
         * @returns {void}
         */
        removeAndShiftAttributes(instance) {
            for (const [name, attr] of Object.entries(instance.attributes)) {
                if (!attr || !(name in this.geometry.attributes))
                    continue;
                const start = instance.attributeIndices[name] ?? 0;
                const end = start + attr.length;
                this.geometry.attributes[name].array.set(this.geometry.attributes[name].array.subarray(end), start);
                this.geometry.attributes[name].array.fill(0, start - end);
                this.geometry.attributes[name].needsUpdate = true;
            }
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
         * emitter.fillAttribute("emitterPosition", [0, 0, 0]);
         * emitter.fillAttribute("someAttribute", 0);
         * ```
         *
         * @param {string} attribute - The attribute to fill.
         * @param {number | number[] | ((index: number) => number)} value -
         *   The value to fill with.
         * @returns {void}
         */
        fillAttribute(attribute, value) {
            if (!(attribute in this.geometry.attributes))
                return;
            const data = this.geometry.attributes[attribute].array;
            if (typeof value === "function") {
                let sourceIndex = 0;
                let destIndex = 0;
                while (destIndex < data.length) {
                    const val = value(sourceIndex++);
                    const arr = Array.isArray(val) ? val : [val];
                    data.set(arr, destIndex);
                    destIndex += arr.length;
                }
            }
            else if (Array.isArray(value)) {
                for (let i = 0; i < data.length; i += value.length)
                    data.set(value, i);
            }
            else {
                data.fill(value);
            }
            this.geometry.attributes[attribute].needsUpdate = true;
        }
        /**
         * Updates the Emitter if autoUdate is set to false. Should be called
         * every frame.
         *
         * ```
         * const emitter = new Emitter()
         *   .setAutoUpdate(false);
         *
         * function update(ms) {
         *   emitter.update();
         *   requestAnimationFrame(update);
         * }
         * ```
         *
         * @returns {void}
         */
        update() {
            const now = Date.now();
            this.material.uniforms.time.value += this.timestamp && (now - this.timestamp) / 1000 || 0;
            this.timestamp = now;
            if (this.autoUpdate)
                requestAnimationFrame(this.update.bind(this));
        }
        /**
         * Dispose the emitter and all its assets.
         *
         * ```
         * const emitter = new Emitter();
         * scene.add(emitter);
         * await new Promise((resolve) => setTimeout(resolve, 1000));
         * scene.remove(emitter);
         * emitter.dispose();
         * ```
         *
         * @returns {void}
         */
        dispose() {
            this.material.dispose();
            this.geometry.dispose();
        }
        /**
         * Interface for the internal material's uniforms.
         *
         * @type {Record<string, THREE.IUniform>}
         */
        get uniforms() {
            return this.material.uniforms;
        }
        /**
         * Interface for the internal geometry's attributes.
         *
         * @type {THREE.NormalBufferAttributes}
         */
        get attributes() {
            return this.geometry.attributes;
        }
        /**
         * Interface for the internal geometry's instanceCount.
         */
        get particleAmount() {
            return this.geometry.instanceCount;
        }
        /**
         * Interface for the internal geometry's instanceCount.
         */
        set particleAmount(amount) {
            this.geometry.instanceCount = amount;
        }
    }

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
    class EmitterInstance {
        /**
         * The amount of particles in the EmitterInstance.
         * Must be smaller/equal to its parent Emitter's maxParticles.
         */
        particleAmount = 0;
        /**
         * The EmitterInstance's parent Emitter.
         * All EmitterInstances will share the same shader program while
         * having access to their own shader attributes.
         */
        emitter;
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
        attributes = {};
        /**
         * A map of attributes and the corresponding EventEmitter's index.
         * Used internally to keep track of subarray ranges.
         */
        attributeIndices = {};
        /**
         * Create an EmitterInstance.
         *
         * @param {Emitter} emitter - The parent Emitter.
         * @param {number} particleAmount - The amount of particles to emit.
         */
        constructor(emitter, particleAmount) {
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
        fillAttribute(attribute, value) {
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
        added() {
            this.emitter.instanceAdded(this);
        }
        /**
         * Remove the EmitterInstance from its parent Emitter and dispose
         * all its assets.
         *
         * @returns {void}
         */
        dispose() {
            this.emitter.instanceRemoved(this);
        }
        /**
         * Internal method to (re-)calculate attribute subarrays
         *
         * @returns {void}
         */
        calculateAttributeSubarrays() {
            // TODO: allow for subarray re-shaping after instantiation
            for (const [name, attr] of Object.entries(this.emitter.geometry.attributes)) {
                if (attr.count >= this.emitter.maxParticles) {
                    // Per-vertex attributes
                    // Create an array view for the corresponding subarray
                    const start = Math.max(0, this.emitter.geometry.instanceCount * attr.itemSize);
                    const end = Math.min(attr.array.length, start + this.particleAmount * attr.itemSize);
                    this.attributeIndices[name] = start;
                    this.attributes[name] = new Proxy(attr.array.subarray(start, end), {
                        get: (target, prop) => {
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
                        set: (target, prop, value, receiver) => {
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
                else {
                    // Per draw-call attributes
                    // Store the array view for the entire buffer
                    this.attributes[name] = attr.array;
                }
            }
        }
    }

    exports.Emitter = Emitter;
    exports.EmitterInstance = EmitterInstance;

    return exports;

})({}, THREE);

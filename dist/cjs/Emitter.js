"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
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
class Emitter extends THREE.Mesh {
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
        this.geometry = new THREE.InstancedBufferGeometry();
        this.material = new THREE.RawShaderMaterial();
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
exports.default = Emitter;

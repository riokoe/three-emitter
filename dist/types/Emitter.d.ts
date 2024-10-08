import * as THREE from "three";
import EmitterInstance from "./EmitterInstance.js";
/**
 * Options for the `Emitter`.
 */
export interface IEmitterOptions {
    /**
     * The GLSL vertex shader used to render particles.
     *
     * ```
     * const emitter = new Emitter({
     *   vert: `
     *     void main() {
     *       gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
     *     }
     *   `
     * });
     * ```
     */
    vert?: string;
    /**
     * The GLSL fragment shader used to render particles.
     *
     * ```
     * const emitter = new Emitter({
     *   frag: `
     *     void main() {
     *       gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
     *     }
     *   `
     * });
     * ```
     */
    frag?: string;
    /**
     * A THREE.BufferGeometry used for sahder built-ins.
     * See https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
     *
     * ```
     * const emitter = new Emitter({
     *   geometry: new THREE.PlaneGeometry(1, 1)
     * });
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
     */
    geometry?: THREE.BufferGeometry;
    /**
     * Additional parameters used for the shader material.
     *
     * ```
     * const emitter = new Emitter({
     *   materialParameters: { transparent: true }
     * });
     * ```
     */
    materialParameters?: THREE.ShaderMaterialParameters;
    /**
     * The uniforms used in the shader.
     * Stays the same across instances. Can be changed during runtime.
     *
     * ```
     * const emitter = new Emitter({
     *   uniforms: {
     *     random: { value: Math.random() }
     *   }
     * });
     * ```
     */
    uniforms?: Record<string, THREE.IUniform>;
    /**
     * The attributes used in the shader.
     * InstancedBufferAttributes are per particle instance.
     * BufferAttributes stay the same across instances.
     * Can be changed during runtime.
     *
     * ```
     * const instanceCount = 1000;
     * const emitter = new Emitter({
     *   maxParticles: instanceCount,
     *   attributes: {
     *     randomPerInstance: new THREE.InstancedBufferAttribute(new Float32Array(instanceCount), 1),
     *     randomPerEmitter: new THREE.BufferAttribute(new Float32Array(1))
     *   }
     * });
     * ```
     */
    attributes?: Record<string, THREE.InstancedBufferAttribute | THREE.BufferAttribute>;
    /**
     * The maximum number of particles.
     *
     * ```
     * const emitter = new Emitter({
     *   maxParticles: 50000
     * });
     * ```
     */
    maxParticles: number;
    /**
     * Whether the emitter should update automatically.
     * Default is `true`.
     *
     * ```
     * const autoEmitter = new Emitter({
     *   autoUpdate: true
     * });
     *
     * const manualEmitter = new Emitter({
     *   autoUpdate: false
     * });
     *
     * function update(ms) {
     *   manualEmitter.update();
     *   requestAnimationFrame(update);
     * }
     * ```
     */
    autoUpdate?: boolean;
}
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
export default class Emitter extends THREE.Mesh<THREE.InstancedBufferGeometry, THREE.RawShaderMaterial> {
    /**
     * Indicates whether the emitter auto-updates.
     */
    autoUpdate: boolean;
    /**
     * The maximum number of particles.
     */
    maxParticles: number;
    /**
     * A set of all EmitterInstances running on this Emitter.
     * Will be auto-updated when EmitterInstances are created/disposed.
     */
    knownInstances: Set<EmitterInstance>;
    /**
     * A timestamp used for the default `time` uniform.
     */
    protected timestamp: number;
    /**
     * Constructs a new emitter.
     *
     * @param {IEmitterOptions} options - The options.
     */
    constructor(options?: IEmitterOptions);
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
    setAttributes(attributes: Record<string, THREE.InstancedBufferAttribute | THREE.BufferAttribute>): this;
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
    setAttributesFromGeometry(geometry: THREE.BufferGeometry): this;
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
    setMaterialParameters(materialParameters: THREE.ShaderMaterialParameters): this;
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
    setFragmentShader(shader: string): this;
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
    setVertexShader(shader: string): this;
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
    setUniforms(uniforms: Record<string, THREE.IUniform>): this;
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
    setAutoUpdate(autoUpdate: boolean): this;
    /**
     * Registers new EmitterInstances with the Emitter.
     * Used internally.
     *
     * @param {EmitterInstance} instance - The new EmitterInstance.
     * @returns {void}
     */
    instanceAdded(instance: EmitterInstance): void;
    /**
     * Unregister EmitterInstances with the Emitter.
     * Used internally.
     *
     * @param {EmitterInstance} instance - The disposed EmitterInstance.
     * @returns {void}
     */
    instanceRemoved(instance: EmitterInstance): void;
    /**
     * Removes ranges from BufferAttributes and shifts data.
     * Used internally when unregistering EmitterInstances to re-populate
     * attributes.
     *
     * @param {EmitterInstance} instance - The disposed EmitterInstance.
     * @returns {void}
     */
    protected removeAndShiftAttributes(instance: EmitterInstance): void;
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
    fillAttribute(attribute: string, value: number | number[] | ((index: number) => number | number[])): void;
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
    update(): void;
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
    dispose(): void;
    /**
     * Interface for the internal material's uniforms.
     *
     * @type {Record<string, THREE.IUniform>}
     */
    get uniforms(): Record<string, THREE.IUniform>;
    /**
     * Interface for the internal geometry's attributes.
     *
     * @type {THREE.NormalBufferAttributes}
     */
    get attributes(): THREE.NormalBufferAttributes;
    /**
     * Interface for the internal geometry's instanceCount.
     */
    get particleAmount(): number;
    /**
     * Interface for the internal geometry's instanceCount.
     */
    set particleAmount(amount: number);
}

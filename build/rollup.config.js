import terser from '@rollup/plugin-terser';

export default {
  input: "dist/esm/index.js",
  output: [
    {
      file: "dist/browser/three-emitter.js",
      format: "iife",
      name: "ThreeEmitter",
      globals: { three: "THREE" },
    },
    {
      file: "dist/browser/three-emitter.min.js",
      format: "iife",
      name: "ThreeEmitter",
      globals: { three: "THREE" },
      plugins: [terser()]
    }
  ]
};

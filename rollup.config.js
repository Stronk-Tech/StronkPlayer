import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const isDevelopment = process.env.NODE_ENV === 'development';

export default {
  input: 'src/library.js',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: !isDevelopment,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: !isDevelopment,
    },
  ],
  plugins: [
    peerDepsExternal(),
    commonjs({
      preferBuiltins: false,
      include: 'node_modules/**',
    }),
    resolve(),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      presets: ['@babel/preset-env', '@babel/preset-react'],
    }),
    !isDevelopment && terser(),
  ],
}; 
import { render, h } from './src/provider/rax.js'
import hooker from './src/enhook.js'

if (!render || !h) throw Error('`rax` and any `driver-*` must be installed in deps.')

export default hooker.bind({ render, h })
export * from 'any-hooks/rax'

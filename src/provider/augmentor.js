let enhook, lib

try { lib = require('augmentor') } catch (e) { }
if (lib) {
  enhook = lib.default
}

export { enhook }

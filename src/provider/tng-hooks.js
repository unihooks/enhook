let enhook, lib

try { lib = require('tng-hooks') } catch (e) { }
if (lib) {
  enhook = lib.TNG
}

module.exports = { enhook }
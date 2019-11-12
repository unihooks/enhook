let h, render, lib, driver

try { lib = require('rax') } catch (e) { }
try { driver = require('driver-dom') } catch (e) { }
if (!driver) { try { driver = require('driver-universal') } catch (e) { } }
if (!driver) { try { driver = require('driver-worker') } catch (e) { } }
if (!driver) { try { driver = require('driver-weex') } catch (e) { } }
if (!driver) { try { driver = require('driver-webgl') } catch (e) { } }

if (lib) {
  h = lib.createElement
  render = (what, where) => lib.render(what, where, { driver })
}

export { h, render }

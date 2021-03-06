import t from 'tst'
import { frame, time, tick } from 'wait-please'
import enhook from '.'
import setHooks, { useEffect, useState, useMemo, useLayoutEffect } from 'any-hooks'


async function testContextArgs(t) {
  let log = []

  function f(props) {
    log.push(this)
    log.push(props)

    let res = useState(0)
    let [count, setCount] = res
    log.push(['call', count])

    useEffect(() => {
      setCount(1)
    }, [])

    return 'result'
  }

  let f1 = enhook(f)

  let res = f1.call({ foo: 1 }, { bar: 2 })
  t.deepEqual(log, [{ foo: 1 }, { bar: 2 }, ['call', 0]], 'context args init')
  t.deepEqual(res, 'result')

  // not sure why preact prefers 3 frames
  await frame(4)

  t.deepEqual(log, [{ foo: 1 }, { bar: 2 }, ['call', 0], { foo: 1 }, { bar: 2 }, ['call', 1]], 'context args after')
}

async function testOrder(t) {
  let log1 = [], log2 = []
  let f = (i, log) => {
    log.push('call', i)
    useEffect(() => {
      log.push('effect', i)
    }, [])
  }
  let f1 = enhook(f)
  let f2 = enhook(f)

  f1(1, log1)
  f2(2, log2)

  // generic tester, since effects order is not guaranteed across frameworks
  await frame(3)
  t.deepEqual(log1, ['call', 1, 'effect', 1], 'order 1')
  t.deepEqual(log2, ['call', 2, 'effect', 2], 'order 2')
}

async function testPassive(t) {
  let log = []

  let fn = enhook(() => {
    let [count, setCount] = useState(0)
    log.push(count)
    if (log.length < 10) setCount(1)
  }, { passive: true })
  fn()
  t.deepEqual(log, [0], 'passive mode: first')

  await frame(2)
  fn()
  await frame(2)

  t.deepEqual(log, [0, 1], 'passive mode: second')
}

async function testRecursion(t) {
  let count = 0

  let f = enhook(() => {
    let [c, setC] = useState(0)
    count++
    setC(c => ++c)
  })
  f()
  await time(200)
  t.ok(count < 50, 'prevent recursion')
}

async function testEffect(t) {
  let log = []
  let f1 = enhook(() => {
    useEffect(() => { log.push(1) })
  })
  f1()
  f1()
  f1()
  await frame(4)
  t.deepEqual(log, [1, 1, 1], 'direct effect is ok')

  log = []
  let f2 = enhook(() => {
    useEffect(() => { log.push(1) })
    let [s, setS] = useState(0)
    useEffect(() => {setTimeout(() => setS(1))}, [])
    useEffect(() => {setTimeout(() => setS(2), 15)}, [])
    useEffect(() => {setTimeout(() => setS(3), 30)}, [])
  })
  f2()
  await time(150)
  t.deepEqual(log, [1, 1, 1, 1], 'induced effect is ok')
}

async function testDestruction(t) {
  let log = []
  let fn = () => {
    let [a, set] = useState()
    useEffect(() => {
      log.push('in')
      return () => {
        log.push('out')
      }
    })
  }
  let f1 = enhook(fn)
  f1()
  await frame(2)
  t.deepEqual(log, ['in'], 'in ok')
  f1.unhook()
  await frame(2)
  t.deepEqual(log, ['in', 'out'], 'destructor ok')

  t.throws(() => {
    f1()
  })

  log = []
  let f2 = enhook(fn)
  f2()
  f2.unhook()
  await frame(2)
  t.ok(log + '' === 'in,out' || log + '' === '', 'destructor ok')

  t.end()
}

t.require('auto', async t => {
  await testContextArgs(t)
  await testOrder(t)
  // await testPassive(t)
  await testDestruction(t)
  // await testRecursion(t)
  t.end()
})

t('preact', async t => {
  let hooks = await import('preact/hooks')
  let preact = await import('preact')
  setHooks(hooks)
  enhook.use(preact)

  await testContextArgs(t)
  await testOrder(t)
  await testPassive(t)
  await testEffect(t)
  await testDestruction(t)
  // await testRecursion(t)
  t.end()
})

t('augmentor', async t => {
  let augmentor = await import('augmentor')
  enhook.use(augmentor)
  setHooks(augmentor)
  await testContextArgs(t)
  await testOrder(t)
  await testPassive(t)
  await testEffect(t)
  await testDestruction(t)
  // await testRecursion(t)

  t.end()
})
t.require('rax', async t => {
  let [rax, driver] = await Promise.all([import('rax'), import('driver-dom')])
  setHooks(rax)
  enhook.use(rax, driver)

  await testContextArgs(t)
  await testOrder(t)
  await testPassive(t)
  await testEffect(t)
  await testDestruction(t)
  // await testRecursion(t)
  t.end()
})
t('haunted', async t => {
  let haunted = await import('haunted')
  setHooks(haunted)
  enhook.use(haunted)

  await testContextArgs(t)
  await testOrder(t)
  await testPassive(t)
  await testEffect(t)
  await testDestruction(t)
  // await testRecursion(t)
  t.end()
})
t('atomico', async t => {
  let atomico = await import('atomico')
  setHooks(atomico)
  enhook.use(atomico)

  await testContextArgs(t)
  await testOrder(t)
  await testPassive(t)
  await testEffect(t)
  await testDestruction(t)
  // await testRecursion(t)
  t.end()
})
t.require('react', async t => {
  let [react, reactDom] = await Promise.all([import('react'), import('react-dom')])
  setHooks(react)
  enhook.use(react, reactDom)

  await testContextArgs(t)
  await testOrder(t)
  await testEffect(t)
  await testDestruction(t)
  // await testPassive(t)
  // await testRecursion(t)
  t.end()
})
// setHooks('tng-hooks')
// setHooks('dom-augmentor')
// setHooks('neverland')
t.browser('fuco', async t => {
  let fuco = await import('fuco')
  setHooks(fuco)
  enhook.use(fuco)

  await testContextArgs(t)
  await testOrder(t)
  await testPassive(t)
  await testEffect(t)
  await testDestruction(t)
  // await testRecursion(t)
  t.end()
})
// setHooks('fn-with-hooks')

t('survival', async t => {
  let augmentor = await import('augmentor')
  setHooks(augmentor)
  enhook.use(augmentor)

  let count = 0
  let f = enhook(() => {
    useEffect(() => {
      count++
    })
  })
  let N = 1e5
  for (let i = N; i--;) { f() }

  await frame(3)

  t.is(count, N)

  t.end()
})




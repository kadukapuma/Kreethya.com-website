import { lazy, Suspense, useEffect, useRef, useState } from 'react'

// three.js is big, so the robot loads in its own chunk after the page is up.
const RobotMascot = lazy(() => import('./RobotMascot'))

const CONTENT = 1200 // widest content column on the page
const MIN_GUTTER = 96 // empty side margin needed for the robot to roam
const TOP = 0.035 // scroll share that counts as "at the top"  -> says hi
const END = 0.965 // scroll share that counts as "at the end"  -> says bye
const PEEK_TALK = 3600 // ms the robot stays up to talk on small screens
const WALK_SPEED = 360 // px per second when it walks across the bottom

const MESSAGES = {
  hi: 'Hi! 👋 Welcome to Kreethya',
  bye: 'Bye! 👋 See you soon',
}

function measure() {
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const gutter = (vw - Math.min(CONTENT, vw - 48)) / 2
  const wide = gutter >= MIN_GUTTER
  const w = wide ? Math.min(gutter - 12, 170) : vw < 600 ? 84 : 100
  return { vw, vh, gutter, wide, w, h: w * 1.08 }
}

/*
 * The robot lives only in empty space so it never covers the page:
 *  - wide screens: it roams in the side margins and, to switch sides, dives
 *    below the bottom of the screen and pops up on the other side;
 *  - small screens (no margins): it peeks from the bottom-right corner and
 *    only stands up to say hi / bye.
 */
function Mascot() {
  const boxRef = useRef(null)
  const control = useRef({ pose: 'idle', move: 0, face: 0, jumpReq: false })
  const [box, setBox] = useState(measure)
  const [bubble, setBubble] = useState({ on: false, msg: 'hi' })

  useEffect(() => {
    const onResize = () => setBox(measure())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const el = boxRef.current
    const c = control.current
    const { vw, vh, gutter, wide, w, h } = box
    const sideX = (s) => (s === 'left' ? (gutter - w) / 2 : vw - gutter + (gutter - w) / 2)
    let raf = 0
    let last = performance.now()
    let lastY = window.scrollY
    let vel = 0
    let x = wide ? sideX('left') : vw - w - 10
    let y = vh + 40 // start below the screen and rise in
    let side = 'left' // the margin it is parked in (or walking towards)
    let walking = false
    let cheerUntil = 0
    let stage = ''
    let stageAt = 0
    let said = ''
    let ready = false
    let clock = 0 // ms of animation actually shown (pauses if the page stalls)

    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      // wait for the robot (loaded on demand) before starting the show
      if (!ready) {
        if (!el.querySelector('canvas')) return
        ready = true
        last = now
      }
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      clock += dt * 1000
      const sy = window.scrollY
      const max = document.documentElement.scrollHeight - vh
      const p = max > 0 ? sy / max : 0

      // scroll speed -> lean + wheel spin
      const speed = (sy - lastY) / Math.max(dt, 0.001) / 1800
      vel += (Math.max(-1, Math.min(1, speed)) - vel) * Math.min(1, dt * 8)
      lastY = sy

      const next = p < TOP ? 'hi' : p > END ? 'bye' : 'roam'
      if (next !== stage) {
        stage = next
        stageAt = clock
        if (stage !== 'roam') c.jumpReq = true
      }
      c.pose = stage === 'roam' ? (clock < cheerUntil ? 'hi' : 'idle') : stage
      c.move = vel

      let tx
      let ty
      let talk = stage !== 'roam'
      if (wide) {
        const want = stage === 'hi' ? 'left' : stage === 'bye' ? 'right' : Math.floor(p * 4) % 2 === 0 ? 'left' : 'right'
        if (want !== side) {
          side = want
          walking = true
        }
        if (walking) {
          // drop to the bottom of the screen, then waddle across to the other margin
          const lane = vh - h * 0.86
          const goal = sideX(side)
          const dir = goal > x ? 1 : -1
          tx = x
          ty = lane - Math.abs(Math.sin(now * 0.011)) * 9 // little hops while walking
          if (y > lane - 30) {
            const stepX = WALK_SPEED * dt
            x = Math.abs(goal - x) <= stepX ? goal : x + dir * stepX
            tx = x
          }
          c.move = dir * 0.85
          c.face = dir * 1.2
          c.pose = 'idle'
          if (x === goal) {
            // arrived: rise into place, spin and throw both hands up
            walking = false
            c.jumpReq = true
            cheerUntil = clock + 1300
          }
        } else {
          tx = sideX(side)
          if (stage === 'hi') ty = vh * 0.56 - h / 2
          else if (stage === 'bye') ty = vh - h - 20
          else ty = vh * 0.52 - h / 2 + Math.sin(p * Math.PI * 10) * vh * 0.14
          c.face = side === 'left' ? 1 : -1
        }
        talk = talk && !walking
      } else {
        talk = talk && clock - stageAt < PEEK_TALK
        tx = vw - w - 10
        ty = talk ? vh - h - 14 : vh - h * 0.42
        c.face = -0.6
      }

      const k = 1 - Math.exp(-(walking ? 7 : 5) * dt)
      x += (tx - x) * k
      y += (ty - y) * k
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.dataset.side = wide ? side : 'right'

      const say = talk ? stage : ''
      if (say !== said) {
        said = say
        setBubble((b) => (say ? { on: true, msg: say } : { ...b, on: false }))
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [box])

  const bubbleWidth = box.wide ? Math.max(110, box.gutter - 14) : 190

  return (
    <div ref={boxRef} className="mascot" style={{ width: box.w, '--bw': `${bubbleWidth}px` }}>
      <p className={`mascot__bubble${bubble.on ? ' is-on' : ''}`} aria-live="polite">
        {MESSAGES[bubble.msg]}
      </p>
      <Suspense fallback={null}>
        <RobotMascot size={box.w} accent="#02ca96" control={control} className="mascot__robot" />
      </Suspense>
    </div>
  )
}

export default Mascot

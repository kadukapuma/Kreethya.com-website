import { lazy, Suspense, useEffect, useRef, useState } from 'react'

// three.js is big, so the robot loads in its own chunk (fetched while the intro plays).
const RobotMascot = lazy(() => import('./RobotMascot'))

const CONTENT = 1200 // widest content column on the page
const MIN_GUTTER = 80 // empty side margin needed for the robot to roam beside the content
const TOP = 0.035 // scroll share that counts as "at the top"  -> says hi
const END = 0.965 // scroll share that counts as "at the end"  -> says bye
const TALK = 3600 // ms it greets (hands up + bubble) when it reaches the top or the end
const GRAB_MS = 1000 // the quick hop to the intro screen's left edge
const PULL_MS = 2000 // dragging the intro screen off to the right, slowly, like a silk curtain
const RETURN_MS = 2700 // flying back to its spot over the home page (somersault + loop-the-loop)
const FLY_MS = 2100 // flying straight to its spot, when the intro screen just fades
const SOMERSAULT = [0.08, 0.26] // share of the flight spent on the quick somersault
const LOOP = [0.32, 0.72] // ...and on the big loop-the-loop
const HEAD = 0.37 // the head centre is this far down the robot's box
const DASH_MS = 5200 // a short, slow, head-shaking waddle into a gap between sections, a trick, and back
const STROLL = 260 // how far it strolls into the gap (px), so the walks stay small
const DASH_GAP_MS = 4000 // at least this long between walks
const TRICKS = ['spin', 'wave', 'dance'] // what it does at the far side (picked at random)
const IDLE_MS = 1500 // no scrolling for this long counts as "waiting": it starts wandering
const IDLE_GAP_MS = 2200 // while you wait, a rest this long between walks / dances
const JIG_MS = 2600 // a little dance on the spot, when no gap is on screen

const MESSAGES = {
  hi: 'Welcome to Kreethya! 👋',
  bye: 'Bye! 👋 See you soon',
}

function measure() {
  const vw = document.documentElement.clientWidth // excludes the scrollbar
  const vh = window.innerHeight
  const gutter = (vw - Math.min(CONTENT, vw - 48)) / 2
  const wide = gutter >= MIN_GUTTER
  const w = wide ? Math.min(gutter - 10, 170) : vw < 600 ? 70 : 88
  return { vw, vh, gutter, wide, w, h: w * 1.08 }
}

const smooth = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
const smoother = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * k * (k * (k * 6 - 15) + 10))
const easeInOutSine = (k) => -(Math.cos(Math.PI * k) - 1) / 2

/*
 * The flight route, built once at take-off: a swooping arc from where the robot
 * formed to where it is going, with a loop-the-loop woven in (when f.tricks), sampled into
 * points and measured, so the robot can glide along it at an even speed with no
 * stops or kinks. at(d) gives the point d (0..1) of the way along the route.
 */
function buildFlightPath(f, to, { vw, vh, w, h }) {
  const N = 320
  const dist = Math.hypot(to.x - f.x0, to.y - f.y0)
  const lift = Math.min(110, dist * 0.3) // gentle: the loop adds the height
  const cx = (f.x0 + to.x) / 2
  const cy = Math.min(f.y0, to.y) - lift
  const base = (u) => [
    (1 - u) * (1 - u) * f.x0 + 2 * (1 - u) * u * cx + u * u * to.x,
    (1 - u) * (1 - u) * f.y0 + 2 * (1 - u) * u * cy + u * u * to.y,
  ]
  const scaleAt = (u) => f.s0 + (1 - f.s0) * u
  // loop the way that fits on screen: up and over if there's room above, else down and under
  const [, ly] = base((LOOP[0] + LOOP[1]) / 2)
  const R0 = Math.min(120, vh * 0.16, vw * 0.12)
  const above = ly - 10
  const below = vh - (ly + h * scaleAt(0.5)) - 10
  const up = above >= 2 * R0 || above >= below
  const R = Math.max(30, Math.min(R0, (up ? above : below) / 2))
  const sign = up ? 1 : -1

  const xs = new Float32Array(N + 1)
  const ys = new Float32Array(N + 1)
  const loops = new Float32Array(N + 1)
  const len = new Float32Array(N + 1)
  for (let i = 0; i <= N; i++) {
    const u = i / N
    let [x, y] = base(u)
    // eases in and out of the loop (no loop on the plain flights)
    const lk = f.tricks ? smoother((u - LOOP[0]) / (LOOP[1] - LOOP[0])) : 0
    const th = lk * Math.PI * 2
    x += f.dir * R * Math.sin(th)
    y -= sign * R * (1 - Math.cos(th))
    y += Math.sin(u * Math.PI * 4) * 6 * Math.sin(u * Math.PI) // a gentle bob
    const s = scaleAt(u)
    xs[i] = Math.max(0, Math.min(vw - w * s, x))
    ys[i] = Math.max(8, Math.min(vh - h * s, y))
    loops[i] = lk
    len[i] = i ? len[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]) : 0
  }
  const total = len[N] || 1
  return {
    sign,
    at(d) {
      const target = Math.max(0, Math.min(1, d)) * total
      let lo = 0
      let hi = N
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1
        if (len[mid] < target) lo = mid
        else hi = mid
      }
      const seg = len[hi] - len[lo] || 1
      const t = Math.max(0, Math.min(1, (target - len[lo]) / seg))
      return {
        x: xs[lo] + (xs[hi] - xs[lo]) * t,
        y: ys[lo] + (ys[hi] - ys[lo]) * t,
        loop: loops[lo] + (loops[hi] - loops[lo]) * t,
      }
    },
  }
}

/*
 * Jet fire trail: soft puffs of green flame that fade into mist, drawn on a full-screen
 * canvas behind the robot. It only draws while there are puffs alive.
 */
function makeTrail(canvas) {
  const ctx = canvas.getContext('2d')
  // one soft round glow per colour, drawn once and stamped for every puff (much cheaper
  // than building a gradient per puff per frame)
  const sprites = ['236,255,214', '147,220,44', '2,202,150', '5,136,117', '170,200,188'].map((rgb) => {
    const s = document.createElement('canvas')
    s.width = s.height = 64
    const g2 = s.getContext('2d')
    const grad = g2.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, `rgba(${rgb},1)`)
    grad.addColorStop(0.45, `rgba(${rgb},0.55)`)
    grad.addColorStop(1, `rgba(${rgb},0)`)
    g2.fillStyle = grad
    g2.fillRect(0, 0, 64, 64)
    return s
  })
  let parts = []
  let dpr = 1
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
  }
  resize()
  return {
    resize,
    // x, y: where the jets are; bx, by: unit vector pointing backwards; size: robot width
    emit(x, y, bx, by, size, power) {
      const n = Math.round(1.5 + power * 3) // a little less than before
      for (let i = 0; i < n; i++) {
        if (parts.length > 260) parts.shift()
        const speed = (120 + Math.random() * 220) * (0.6 + power * 0.6)
        const spread = (Math.random() - 0.5) * 0.9
        parts.push({
          x: x + (Math.random() - 0.5) * size * 0.18,
          y: y + (Math.random() - 0.5) * size * 0.18,
          vx: (bx + -by * spread) * speed,
          vy: (by + bx * spread) * speed,
          age: 0,
          life: 0.35 + Math.random() * 0.4,
          r0: size * (0.06 + Math.random() * 0.04),
          r1: size * (0.17 + Math.random() * 0.12),
        })
      }
    },
    step(dt) {
      if (!parts.length) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      parts = parts.filter((q) => q.age < q.life)
      for (const q of parts) {
        q.age += dt
        q.x += q.vx * dt
        q.y += q.vy * dt - 30 * dt // smoke drifts up a little
        const drag = Math.pow(0.93, dt * 60) // same slow-down at any frame rate
        q.vx *= drag
        q.vy *= drag
        const k = Math.min(1, q.age / q.life)
        const r = q.r0 + (q.r1 - q.r0) * k
        // green flame: white-lime -> lime -> emerald -> teal -> soft mist
        const sprite = sprites[k < 0.15 ? 0 : k < 0.35 ? 1 : k < 0.55 ? 2 : k < 0.75 ? 3 : 4]
        ctx.globalAlpha = (k < 0.75 ? 0.75 : 0.35) * Math.pow(1 - k, 1.5) // soft, and fades out smoothly
        ctx.drawImage(sprite, q.x - r, q.y - r, r * 2, r * 2)
      }
      if (!parts.length) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    },
  }
}

/*
 * One robot for the whole visit.
 *  1. Intro: it waits, hidden, while the loader plays. The loader's ball lands
 *     and the robot tumbles out right there (control.intro gives the spot),
 *     with a jetpack on its back.
 *  2. It fires the jets, hops to the intro screen's left edge, grabs it and
 *     drags the whole screen off to the right like a curtain, uncovering the
 *     home page (KLoader.jsx slides the screen away with it). Then it
 *     flies back to its spot (a somersault, then a big loop-the-loop, trailing
 *     green fire), drops the jetpack and says welcome.
 *  3. On the page it stays on the left, in empty space:
 *     - screens with side margins (about 1360px wide and up): it bobs up and
 *       down the left margin as you scroll;
 *     - narrower screens: it stands, small, in the bottom-left corner.
 * It hides itself if 3D isn't available on the device.
 */
function Mascot({ control, intro = false }) {
  const ownControl = useRef({ pose: 'idle', move: 0, face: 0, jumpReq: false, hidden: true, jetpack: 1 })
  const ctlRef = control || ownControl
  const boxRef = useRef(null)
  const bodyRef = useRef(null)
  const trailRef = useRef(null)
  const introRef = useRef(intro)
  const pos = useRef(null) // kept across resizes so the robot doesn't jump
  const [box, setBox] = useState(measure)
  const [bubble, setBubble] = useState({ on: false, msg: 'hi' })
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    introRef.current = intro
  }, [intro])

  // Re-measure on window resize and when the scrollbar appears or goes; ignore
  // changes that don't move anything (e.g. the page growing taller).
  useEffect(() => {
    const update = () =>
      setBox((b) => {
        const n = measure()
        return n.vw === b.vw && n.vh === b.vh ? b : n
      })
    update()
    window.addEventListener('resize', update)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    if (ro) ro.observe(document.documentElement)
    return () => {
      window.removeEventListener('resize', update)
      if (ro) ro.disconnect()
    }
  }, [])

  useEffect(() => {
    const el = boxRef.current
    const body = bodyRef.current
    const trail = trailRef.current ? makeTrail(trailRef.current) : null
    if (!el || !body) return undefined
    const c = ctlRef.current
    const { vw, vh, gutter, wide, w, h } = box
    const marginX = (gutter - w) / 2 // centred in the left margin
    const cornerX = 12
    if (!pos.current) {
      pos.current = {
        mode: 'wait', // wait -> intro -> fly -> home
        x: wide ? marginX : cornerX,
        y: vh + 40,
        s: 1, // scale (the intro robot can be a different size)
        quiet: false, // true once it has said hi, so it doesn't greet twice
        flight: null,
        dash: null, // a dash across a gap between sections
        doneGaps: new Set(), // gaps already dashed through (forgotten once they scroll off screen)
        lastDashAt: -Infinity,
        lastActive: 0, // when the page last scrolled
        lastWalkGap: null, // so idle wandering does not walk the same gap twice in a row
        jig: null, // a little dance on the spot
      }
    }
    const st = pos.current
    st.x = Math.max(-w, Math.min(vw, st.x))
    let raf = 0
    let last = performance.now()
    let lastY = window.scrollY
    let vel = 0
    let stage = ''
    let stageAt = 0
    let said = ''
    let clock = 0 // ms of animation actually shown (pauses if the page stalls)

    // Where it should be on the home page right now, for a given scroll stage.
    const homeSpot = (stg, p) => {
      // at the end it says bye from the right corner (above the back-to-top button on small screens)
      if (!wide) return stg === 'bye' ? { x: vw - w - 12, y: vh - h - 76 } : { x: cornerX, y: vh - h - 10 }
      const x = marginX
      // at the top: the left margin, just under the navigation bar
      if (stg === 'hi') return { x, y: Math.max(96, vh * 0.15) }
      if (stg === 'bye') return { x: vw - gutter + (gutter - w) / 2, y: vh - h - 20 }
      return { x, y: vh * 0.52 - h / 2 + Math.sin(p * Math.PI * 10) * vh * 0.14 }
    }

    // Empty gaps between sections, in page coordinates (so they stay valid while scrolling).
    // Measured at idle moments, never inside an animation frame, so walks can't stutter the page.
    let gaps = []
    let measureTimer = 0
    let idleId = 0
    const measureGaps = () => {
      // forget gaps that have scrolled well off screen, so they can be visited again later
      const vy = window.scrollY
      st.doneGaps.forEach((id) => {
        if (id * 40 < vy - vh * 0.5 || id * 40 > vy + vh * 1.5) st.doneGaps.delete(id)
      })
      const sy0 = window.scrollY
      const solid = []
      document.querySelectorAll('main > section, footer').forEach((sec) => {
        // the pinned project showcase counts as one solid block; elsewhere use the real content
        const parts = sec.classList.contains('work') ? [sec] : Array.from(sec.children)
        parts.forEach((el2) => {
          if (el2.getAttribute('aria-hidden') === 'true') return
          const pos = getComputedStyle(el2).position
          if (pos === 'absolute' || pos === 'fixed') return
          const r = el2.getBoundingClientRect()
          if (r.height > 0) solid.push([r.top + sy0, r.bottom + sy0])
        })
      })
      solid.sort((a, b) => a[0] - b[0])
      gaps = []
      let end = -Infinity
      for (const [t, b] of solid) {
        // the robot must fit, with a little breathing room above and below
        if (end > -Infinity && t - end > h + 30) gaps.push({ id: Math.round(end / 40), top: end + 10, bottom: t - 10 })
        end = Math.max(end, b)
      }
    }
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 60))
    const cancelIdle = window.cancelIdleCallback || clearTimeout
    const scheduleMeasure = () => {
      cancelIdle(idleId)
      idleId = idle(measureGaps, { timeout: 800 })
    }
    scheduleMeasure()
    measureTimer = setInterval(scheduleMeasure, 1500) // content settles as it fades in
    // A gap passing through the middle of the screen, if it is a good moment for a dash.
    // While waiting (idle), any gap fully on screen will do, as long as it is not the one it just walked.
    const pickGap = (sy, idle) => {
      if (Math.abs(vel) > 0.5) return null // not while flinging the page
      const fits = []
      for (const g of gaps) {
        const top = g.top - sy
        const bot = g.bottom - sy
        if (idle) {
          if (top >= 70 && bot <= vh - 10 && g.id !== st.lastWalkGap) fits.push(g)
        } else if (!st.doneGaps.has(g.id)) {
          const mid = (top + bot) / 2
          if (mid > vh * 0.3 && mid < vh * 0.7) return g
        }
      }
      return fits.length ? fits[Math.floor(Math.random() * fits.length)] : null
    }

    // Where it grabs the intro screen: its left edge, a little above the middle.
    const grabSpot = () => ({ x: 2, y: Math.max(90, vh * 0.42 - h / 2) })

    // Fire trail: puffs leave the jets, blown out opposite to the way it is moving.
    // `f` remembers where the jets were last frame (px, py).
    const jetTrail = (f) => {
      if (!trail) return
      const jx = st.x + (w * st.s) / 2
      const jy = st.y + h * st.s * 0.58
      if (f.px !== null) {
        const mx = jx - f.px
        const my = jy - f.py
        const len = Math.hypot(mx, my)
        if (len > 0.5) {
          // spread the puffs along the path since the last frame, so a slow frame leaves no gaps
          const bx = -mx / len
          const by = -my / len
          const size = w * st.s
          const steps = Math.min(6, Math.ceil(len / (size * 0.3)))
          for (let i = 0; i < steps; i++) {
            const t = i / steps
            trail.emit(jx - mx * t + bx * size * 0.2, jy - my * t + by * size * 0.2, bx, by, size, c.thrust / steps + 0.15)
          }
        }
      }
      f.px = jx
      f.py = jy
    }

    const place = () => {
      el.style.transform = `translate3d(${st.x.toFixed(1)}px, ${st.y.toFixed(1)}px, 0) scale(${st.s.toFixed(3)})`
    }
    const show = (on) => {
      el.style.visibility = on ? '' : 'hidden'
    }
    const say = (msg) => {
      if (msg !== said) {
        said = msg
        setBubble((b) => (msg ? { on: true, msg } : { ...b, on: false }))
      }
    }

    show(st.mode !== 'wait')
    place()

    const loop = (now) => {
      if (c.failed) {
        setFailed(true)
        return
      }
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!c.ready) return // wait until its 3D is compiled and drawn
      clock += dt * 1000
      if (trail) trail.step(dt)

      const sy = window.scrollY
      const max = document.documentElement.scrollHeight - vh
      const p = max > 0 ? sy / max : 0
      const speed = (sy - lastY) / Math.max(dt, 0.001) / 1800
      vel += (Math.max(-1, Math.min(1, speed)) - vel) * Math.min(1, dt * 8)
      lastY = sy

      /* ---------- 1. intro: hidden until the ball lands, then tumble + hi ---------- */
      if (st.mode === 'wait') {
        const land = c.intro
        if (land) {
          st.mode = 'intro'
          st.quiet = true
          st.s = land.w / w
          st.x = land.x - (w * st.s) / 2
          st.y = land.y - h * st.s * HEAD
          c.hidden = false
          c.jumpReq = true
          el.classList.add('mascot--intro')
          body.classList.add('is-tumble')
          place()
          show(true)
        } else if (!introRef.current) {
          // the intro ended without a landing (robot was late): just rise in on the page
          st.mode = 'home'
          c.hidden = false
          c.jetpack = 0
          show(true)
        } else {
          return
        }
      }
      if (st.mode === 'intro') {
        const stg = c.intro.stage
        // formed: arms up, jets warming up, ready for take-off
        c.pose = stg === 'in' ? 'idle' : 'hi'
        c.face = 0
        c.thrust = stg === 'in' ? 0 : 0.3
        if (stg === 'grab' || stg === 'fly') {
          // 'grab': a quick hop to the intro screen's left edge, to pull it away like a curtain.
          // 'fly' (the screen is just fading): straight to its spot, with the tricks.
          // Timed by the frame clock (not `clock`), so re-measuring mid-flight can't restart it.
          const grab = stg === 'grab'
          const to = grab ? grabSpot() : homeSpot(p < TOP ? 'hi' : 'roam', p)
          const dir = to.x + w / 2 >= st.x + (w * st.s) / 2 ? 1 : -1
          st.flight = { x0: st.x, y0: st.y, s0: st.s, t0: now, dir, to, ms: grab ? GRAB_MS : FLY_MS, tricks: !grab, next: grab ? 'pull' : 'home', px: null, py: null }
          st.mode = 'fly'
          body.classList.remove('is-tumble')
        } else {
          return
        }
      }

      /* ---------- 2. jetpack flights (to the intro screen's edge, or back to its spot) ---------- */
      if (st.mode === 'fly') {
        const f = st.flight
        // build the whole route once, at take-off: arc (+ loop-the-loop) as one smooth curve
        if (!f.path) f.path = buildFlightPath(f, f.to, { vw, vh, w, h })
        const k = Math.max(0, Math.min(1, (now - f.t0) / f.ms))
        // move along the curve at an even pace that eases in at take-off and out at landing
        const at = f.path.at(easeInOutSine(k))
        st.x = at.x
        st.y = at.y
        st.s = f.s0 + (1 - f.s0) * smooth(k)
        // ease into the flying pose and back out again to land (no sudden changes)
        const fly = smooth(k / 0.16) * (1 - smooth((k - 0.82) / 0.18))
        c.fly = fly
        c.flyDir = f.dir
        c.face = f.dir * 2.3 * fly // three-quarter turn, so the jetpack and its flames show
        // full burn in the air, an extra boost round the loop, easing off to land
        c.thrust = (0.35 + 0.65 * fly) * (1 + 0.5 * Math.sin(at.loop * Math.PI))
        // the funny bits (first flight only): a quick somersault, then the body turns right round with the loop
        const flip = f.tricks ? Math.PI * 2 * smooth((k - SOMERSAULT[0]) / (SOMERSAULT[1] - SOMERSAULT[0])) : 0
        c.roll = f.dir * (flip + f.path.sign * at.loop * Math.PI * 2)
        c.pose = 'idle'
        c.move = 0
        place()
        jetTrail(f)
        if (k >= 1) {
          const end = f.path.at(1)
          st.x = end.x
          st.y = end.y
          st.s = 1
          c.roll = 0
          if (f.next === 'pull' && !c.skipPull) {
            // grabbed the intro screen's edge: now drag it across to the right
            st.pull = { t0: now, y0: st.y, px: null, py: null }
            // the loader times the pull from the same start, so the edge stays in the robot's hands
            c.curtainPull = { t0: now, ms: PULL_MS }
            st.mode = 'pull'
          } else if (f.next === 'pull') {
            // the intro screen faded without being pulled: fly straight home instead
            const to = homeSpot(p < TOP ? 'hi' : 'roam', p)
            st.flight = { x0: st.x, y0: st.y, s0: 1, t0: now, dir: -1, to, ms: RETURN_MS, tricks: true, next: 'home', px: null, py: null }
          } else {
            st.mode = 'home'
            st.quiet = false // now it says welcome
            st.dropAt = now + 450 // ...and a moment later it takes the jetpack off
            c.fly = 0
            c.thrust = 0
            c.jumpReq = true // touch-down hop
            el.classList.remove('mascot--intro')
          }
        }
        return
      }

      /* ---------- 2b. pulling the intro screen away, left to right, like a curtain ---------- */
      if (st.mode === 'pull') {
        const q0 = Math.max(0, Math.min(1, (now - st.pull.t0) / PULL_MS))
        const q = easeInOutSine(q0)
        // the screen's cut edge is in the robot's hands
        const edgeX = vw * q
        st.x = Math.max(2, Math.min(vw - w - 2, edgeX - w * 0.3))
        st.y = st.pull.y0 - Math.sin(q * Math.PI) * vh * 0.04
        const fly = smooth(q0 / 0.15) * (1 - smooth((q0 - 0.9) / 0.1))
        c.fly = fly
        c.flyDir = 1
        c.face = 2.3 * fly
        c.thrust = 0.45 + 0.55 * fly // straining to drag it
        c.pose = 'idle'
        c.move = 0
        place()
        jetTrail(st.pull)
        if (q0 >= 1) {
          // screen gone: fly back to its own spot on the home page, with the somersault + loop-the-loop
          const to = homeSpot(p < TOP ? 'hi' : 'roam', p)
          st.flight = { x0: st.x, y0: st.y, s0: 1, t0: now, dir: -1, to, ms: RETURN_MS, tricks: true, next: 'home', px: null, py: null }
          st.mode = 'fly'
        }
        return
      }

      /* ---------- 3. home: roam the left margin / stand in the corner ---------- */
      if (st.dropAt && now >= st.dropAt) {
        st.dropAt = 0
        c.jetpack = 0 // unclips and drops away
      }
      const next = p < TOP ? 'hi' : p > END ? 'bye' : 'roam'
      if (next !== stage) {
        stage = next
        stageAt = clock
        if (stage !== 'hi') st.quiet = false
        if (stage !== 'roam' && !st.quiet) c.jumpReq = true
      }
      // greet with both hands up for a few seconds, then relax
      const greeting = stage !== 'roam' && !st.quiet && clock - stageAt < TALK
      c.pose = greeting ? stage : 'idle'
      c.move = vel

      const spot = homeSpot(stage, p)

      // Now and then, while scrolling, it waddles across the empty gap between two sections.
      // If you stop and wait, it keeps wandering: gap to gap, with little dances in between.
      if (Math.abs(vel) > 0.04 || !st.lastActive) st.lastActive = now
      const idle = now - st.lastActive > IDLE_MS
      const restMs = idle ? IDLE_GAP_MS : DASH_GAP_MS
      if (!st.dash && !st.jig && now - st.lastDashAt > restMs) {
        const g = stage === 'roam' ? pickGap(sy, idle) : null
        if (g) {
          const trick = TRICKS[Math.floor(Math.random() * TRICKS.length)]
          st.dash = { g, t0: now, x0: st.x, y0: st.y, fromX: spot.x, flipped: false, trick }
          if (!idle) st.doneGaps.add(g.id)
          st.lastWalkGap = g.id
          st.lastDashAt = now
        } else if (idle && !greeting) {
          // no gap on screen: a little dance right where it stands (its own empty margin)
          st.jig = { t0: now, spin: Math.random() < 0.5, spun: false }
          st.lastWalkGap = null // after a dance it may stroll the same gap again
          st.lastDashAt = now
        }
      }
      if (st.jig) {
        const j = st.jig
        const k = (now - j.t0) / JIG_MS
        if (k >= 1 || !idle) {
          // done, or you scrolled again: back to normal
          st.jig = null
          c.waddle = 0
        } else {
          c.waddle = 1 // rocking, bouncing, head shaking
          c.pose = k > 0.15 && k < 0.85 ? 'hi' : 'idle' // hands up
          c.face = Math.sin(k * Math.PI * 4) * 0.9 // turns this way and that
          c.move = 0
          if (j.spin && !j.spun && k > 0.5) {
            j.spun = true
            c.jumpReq = true // a spinning hop in the middle
          }
          // tiny side-steps, staying in its spot
          const sx = Math.max(0, Math.min(vw - w, spot.x + Math.sin(k * Math.PI * 4) * 10))
          const kk = 1 - Math.exp(-6 * dt)
          st.x += (sx - st.x) * kk
          st.y += (spot.y - st.y) * kk
          place()
          el.dataset.side = st.x > vw / 2 ? 'right' : 'left'
          say('')
          return
        }
      }
      if (st.dash) {
        const d = st.dash
        const k = (now - d.t0) / DASH_MS
        const gTop = d.g.top - sy
        const gBot = d.g.bottom - sy
        // the gap scrolled away or the page changed stage: stop and head home
        if (k >= 1 || stage !== 'roam' || gBot < 20 || gTop > vh - 20) {
          // cut short near the start (scrolled straight past)? that one does not count
          if (k < 0.45) {
            st.lastDashAt = now - DASH_GAP_MS + 800
            st.doneGaps.delete(d.g.id)
          }
          st.dash = null
          c.waddle = 0
        } else {
          // into the gap (in its own margin), waddle across, a trick at the far side, waddle back
          const gapY = Math.max(8, Math.min(vh - h - 8, Math.max(gTop + 6, Math.min(gBot - h - 6, (gTop + gBot) / 2 - h / 2))))
          const inY = smooth(k / 0.12) * (1 - smooth((k - 0.88) / 0.12))
          const out = smooth((k - 0.1) / 0.32)
          const back = smooth((k - 0.6) / 0.3)
          // a small stroll: a short way into the gap (towards the middle of the screen) and back
          const homeX = spot.x
          const dir = homeX + w / 2 < vw / 2 ? 1 : -1
          const farX = Math.max(4, Math.min(vw - w - 4, homeX + dir * Math.min(STROLL, vw * 0.4)))
          st.x = homeX + (farX - homeX) * (out - back)
          st.y = d.y0 + (gapY - d.y0) * inY
          if (k > 0.12) d.y0 = spot.y // come back to wherever its spot is by then
          const going = k > 0.1 && k < 0.42 ? 1 : k > 0.6 && k < 0.9 ? -1 : 0
          const atFar = k >= 0.42 && k <= 0.6
          // a slow, wobbly walk: the robot rocks and bounces (waddle), wheels turning gently
          c.waddle = going ? 1 : atFar && d.trick === 'dance' ? 1 : 0
          c.move = going * dir * 0.25 // slow: the wheels barely turn
          c.face = going ? going * dir * 1.4 : atFar ? -0.8 * dir : 0.4 * dir
          if (!d.flipped && atFar) {
            d.flipped = true
            if (d.trick === 'spin') c.jumpReq = true // a spinning hop
          }
          // wave at the content ("look at this!"), or throw both hands up and dance
          c.pose = atFar ? (d.trick === 'wave' ? 'bye' : d.trick === 'dance' ? 'hi' : 'idle') : 'idle'
          place()
          el.dataset.side = st.x > vw / 2 ? 'right' : 'left'
          say('')
          return
        }
      }

      // switching sides (bye on the right, everything else on the left): roll along the bottom
      const crossing = Math.abs(spot.x - st.x) > vw * 0.25
      if (crossing) stageAt = clock // the hello / bye starts once it has arrived
      const tx = spot.x
      const ty = crossing ? vh - h - 14 : spot.y
      c.face = st.x > vw / 2 ? (wide ? -1 : -0.6) : wide ? 1 : 0.6 // turned a little towards the page
      if (crossing) {
        c.move = spot.x > st.x ? 0.8 : -0.8
        c.face = spot.x > st.x ? 1.2 : -1.2
      }

      const k = 1 - Math.exp(-(crossing ? 3.2 : 5) * dt)
      st.x += (tx - st.x) * k
      st.y += (ty - st.y) * k
      place()
      el.dataset.side = st.x > vw / 2 ? 'right' : 'left'
      say(greeting && !crossing ? stage : '')
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(measureTimer)
      cancelIdle(idleId)
      c.waddle = 0
    }
  }, [box, ctlRef])

  if (failed) return null

  const bubbleWidth = box.wide ? Math.max(110, box.gutter - 14) : 190

  return (
    <>
    <canvas ref={trailRef} className="mascot__trail" aria-hidden="true" />
    <div ref={boxRef} className="mascot" style={{ width: box.w, '--bw': `${bubbleWidth}px` }}>
      <p className={`mascot__bubble${bubble.on ? ' is-on' : ''}`} aria-live="polite">
        {MESSAGES[bubble.msg]}
      </p>
      <div ref={bodyRef} className="mascot__body">
        <span className="mascot__flash" aria-hidden="true" />
        <Suspense fallback={null}>
          <RobotMascot size={box.w} accent="#02ca96" jetpack control={ctlRef} className="mascot__robot" />
        </Suspense>
      </div>
    </div>
    </>
  )
}

export default Mascot

import { forwardRef } from 'react'
import mark from '../assets/kreethya-mark.webp'

// The keyboard: real rounded keys in a laptop layout, drawn once as an SVG so every
// key has clean edges (a repeating background pattern left cut-off keys at the edges).
const KEY_ROWS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], // number row + backspace
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // tab
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75], // caps + enter
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], // shifts
  [1, 1, 1, 1.25, 5, 1.25, 1, 1, 1, 1], // fn ctrl alt cmd space cmd alt arrows
]
const KB_W = 14.5 // every row adds up to this many key widths
const GAP = 0.16
const KEYS = []
KEY_ROWS.forEach((row, r) => {
  let x = 0
  row.forEach((kw) => {
    KEYS.push({ x: x + GAP / 2, y: r + GAP / 2, w: kw - GAP, h: 1 - GAP })
    x += kw
  })
})

function Keyboard() {
  return (
    <svg className="laptop__keys" viewBox={`0 0 ${KB_W} ${KEY_ROWS.length}`} preserveAspectRatio="none">
      {KEYS.map((k, n) => (
        <rect key={n} x={k.x} y={k.y} width={k.w} height={k.h} rx="0.14" />
      ))}
    </svg>
  )
}

// A laptop built from CSS 3D planes. Drive it with CSS variables:
//   --w   width of the screen          --lid  lid angle (-86deg closed, ~8deg open)
//   --rx  tilt towards the viewer      --ry   turn left / right
const Laptop = forwardRef(function Laptop({ children, className = '', style }, ref) {
  return (
    <div ref={ref} className={`laptop ${className}`} style={style} aria-hidden="true">
      <div className="laptop__body">
        <div className="laptop__base">
          <span className="laptop__hinge" />
          <Keyboard />
          <div className="laptop__pad" />
        </div>
        <div className="laptop__lid">
          <div className="laptop__face">
            <span className="laptop__cam" />
            <div className="laptop__screen">{children}</div>
            <span className="laptop__glare" />
          </div>
          <div className="laptop__back">
            <img src={mark} alt="" />
          </div>
        </div>
      </div>
    </div>
  )
})

export default Laptop

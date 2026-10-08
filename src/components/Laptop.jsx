import { forwardRef } from 'react'
import mark from '../assets/kreethya-mark.webp'

// A laptop built from CSS 3D planes. Drive it with CSS variables:
//   --w   width of the screen          --lid  lid angle (-86deg closed, ~8deg open)
//   --rx  tilt towards the viewer      --ry   turn left / right
const Laptop = forwardRef(function Laptop({ children, className = '', style }, ref) {
  return (
    <div ref={ref} className={`laptop ${className}`} style={style} aria-hidden="true">
      <div className="laptop__body">
        <div className="laptop__base">
          <div className="laptop__keys" />
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

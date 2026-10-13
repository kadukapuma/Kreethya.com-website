import { forwardRef } from 'react'

// A smartphone built from CSS, with a little 3D tilt. Drive it with CSS variables:
//   --pw  width of the phone      --rx  tilt towards the viewer      --ry  turn left / right
const Phone = forwardRef(function Phone({ children, className = '', style }, ref) {
  return (
    <div ref={ref} className={`phone ${className}`} style={style} aria-hidden="true">
      <div className="phone__body">
        <span className="phone__btn phone__btn--power" />
        <span className="phone__btn phone__btn--up" />
        <span className="phone__btn phone__btn--down" />
        <div className="phone__screen">
          {children}
          <span className="phone__island" />
          <span className="phone__glare" />
        </div>
      </div>
    </div>
  )
})

export default Phone

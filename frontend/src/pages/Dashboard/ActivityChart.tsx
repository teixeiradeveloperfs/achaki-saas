import type { Point } from './data'

const SCALE = [100, 75, 50, 25, 0]

/** Single-series bar chart; values show on hover or keyboard focus. */
export function ActivityChart({ points }: { points: Point[] }) {
  return (
    <div className="chart" role="group" aria-label="Envios por período">
      <div className="chart__scale" aria-hidden="true">
        {SCALE.map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
      <div className="chart__plot">
        {points.map((point) => (
          <div className="chart__column" key={point.label} tabIndex={0} aria-label={`${point.label}: ${point.value} envios`}>
            <div className="chart__track">
              <div className="chart__bar" style={{ height: `${point.value}%` }}>
                <span className="chart__tip" aria-hidden="true">
                  {point.value} envios
                </span>
              </div>
            </div>
            <span className="chart__label" aria-hidden="true">
              {point.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

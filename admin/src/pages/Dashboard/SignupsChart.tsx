import type { Point } from './data'

const STEPS = 4

/** Rounds the axis step up to 1, 2 or 5 times a power of ten. */
function niceStep(max: number) {
  const raw = max / STEPS
  const power = 10 ** Math.floor(Math.log10(raw))
  const nice = [1, 2, 5, 10].find((factor) => factor * power >= raw) ?? 10
  return nice * power
}

/** Single-series bar chart; values show on hover or keyboard focus. */
export function SignupsChart({ points }: { points: Point[] }) {
  const step = niceStep(Math.max(...points.map((point) => point.value)))
  const top = step * STEPS
  const scale = Array.from({ length: STEPS + 1 }, (_, index) => top - index * step)

  return (
    <div className="chart" role="group" aria-label="Novos cadastros por período">
      <div className="chart__scale" aria-hidden="true">
        {scale.map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
      <div className="chart__plot">
        {points.map((point) => (
          <div className="chart__column" key={point.label} tabIndex={0} aria-label={`${point.label}: ${point.value} cadastros`}>
            <div className="chart__track">
              <div className="chart__bar" style={{ height: `${(point.value / top) * 100}%` }}>
                <span className="chart__tip" aria-hidden="true">
                  {point.value} cadastros
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

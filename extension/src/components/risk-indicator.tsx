interface RiskIndicatorProps {
  level: "safe" | "warning" | "dangerous"
  score: number
}

export function RiskIndicator({ level, score }: RiskIndicatorProps) {
  const colors = {
    safe: "bg-green-500",
    warning: "bg-yellow-500",
    dangerous: "bg-red-500",
  }

  return (
    <div className={`risk-indicator ${colors[level]}`}>
      <div className="score">{score}%</div>
      <div className="level">{level.toUpperCase()}</div>
    </div>
  )
}

interface RecommendationPillProps { regimeName: string; savings: string | number }
export function RecommendationPill({ regimeName, savings }: RecommendationPillProps) {
  return (
    <div className="flex justify-center mb-10">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
        <span className="text-[13px] text-green-500">{regimeName} recommended</span>
        <span className="text-xs text-green-500/70">· saves ₱{typeof savings === 'number' ? savings.toLocaleString() : savings}</span>
      </div>
    </div>
  )
}

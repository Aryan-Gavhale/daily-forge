import Icon from '../ui/Icon'
import { Bar } from '../ui/Ring'
import { TRACK_MAP } from '../../data/plan'

/** The four tracks, and what the sixteen weeks are supposed to produce. */
export function TrackMeters({ tracks }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="rounded-card border border-hair bg-ink-800/60 p-3.5 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg"
              style={{ background: `${track.accent}1f`, color: track.accent }}
            >
              <Icon name={track.icon} size={15} />
            </span>
            <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold tracking-tight text-white">
              {track.name}
            </p>
            <span className="tnum shrink-0 text-[12px] font-semibold text-white/45">
              {Math.round(track.progress * 100)}%
            </span>
          </div>

          <Bar progress={track.progress} accent={track.accent} height={5} className="mt-2.5" />

          <p className="mt-2 text-[11px] leading-snug text-white/30">{track.blurb}</p>
        </div>
      ))}
    </div>
  )
}

/** Cumulative counters, so the four months have a scoreboard and not just a %. */
export function OutputTotals({ totals }) {
  return (
    <div className="overflow-hidden rounded-card border border-hair bg-ink-800/60 backdrop-blur-xl">
      <div className="divide-y divide-white/[0.05]">
        {totals.map((row) => {
          const track = TRACK_MAP[row.track]
          const progress = row.target ? Math.min(1, row.value / row.target) : 0
          return (
            <div key={row.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: track.accent }}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-[13.5px] font-medium text-white/80">
                    {row.label}
                  </span>
                  {row.auto && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/20">
                      auto
                    </span>
                  )}
                </span>
                <Bar progress={progress} accent={track.accent} height={3} className="mt-1.5" />
              </span>
              <span className="tnum shrink-0 text-[13px] font-bold text-white">
                {row.value}
                <span className="text-[11.5px] font-medium text-white/25">/{row.target}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrackMeters

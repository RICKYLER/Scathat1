"use client"

/**
 * User Activity Component
 *
 * Tracks recent user actions and engagement.
 */

export function UserActivity() {
  const activities = [
    { user: "0xabcd...ef01", action: "Scanned contract", contract: "0x1234...5678", time: "5 min ago" },
    { user: "0xbcde...f012", action: "Added to watchlist", contract: "0x2345...6789", time: "12 min ago" },
    { user: "0xcdef...0123", action: "Viewed report", contract: "0x3456...7890", time: "25 min ago" },
    { user: "0xdef0...0124", action: "Connected wallet", contract: null, time: "1 hour ago" },
  ]

  return (
    <div className="bg-[color:--color-surface] border border-[color:--color-border] rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">User Activity</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[color:--color-border] text-[color:--color-text-secondary]">
            <tr>
              <th className="text-left py-2 px-3">User</th>
              <th className="text-left py-2 px-3">Action</th>
              <th className="text-left py-2 px-3">Contract</th>
              <th className="text-left py-2 px-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:--color-border]">
            {activities.map((activity, idx) => (
              <tr key={idx} className="hover:bg-[color:--color-surface-light]/50 transition-colors">
                <td className="py-3 px-3 font-mono text-xs">{activity.user}</td>
                <td className="py-3 px-3 text-white">{activity.action}</td>
                <td className="py-3 px-3 font-mono text-xs">{activity.contract || "-"}</td>
                <td className="py-3 px-3 text-[color:--color-text-secondary]">{activity.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

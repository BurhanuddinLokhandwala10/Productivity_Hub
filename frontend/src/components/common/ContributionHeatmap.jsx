import React, { useState, useMemo, useRef } from 'react';

/**
 * Helper to generate 12-month calendar blocks ending at a specific date (default: today).
 * Each month block has:
 * - year, month (0-11), name ('Oct', 'Nov', etc.)
 * - columns: array of weeks, where each week is array of 7 day objects (or null if outside month)
 */
export const generateCalendarMonths = (endDate = new Date()) => {
    const months = [];
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    for (let i = 11; i >= 0; i--) {
        const firstDayOfMonth = new Date(endYear, endMonth - i, 1);
        const year = firstDayOfMonth.getFullYear();
        const month = firstDayOfMonth.getMonth();
        const monthName = firstDayOfMonth.toLocaleString('en-US', { month: 'short' });
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const columns = [];
        let currentWeek = new Array(7).fill(null);

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

            const yyyy = year;
            const mm = String(month + 1).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            currentWeek[dayOfWeek] = {
                day,
                dateStr,
                dateObj
            };

            // If Saturday (6) or last day of month, close column and start new one
            if (dayOfWeek === 6 || day === daysInMonth) {
                columns.push(currentWeek);
                currentWeek = new Array(7).fill(null);
            }
        }

        months.push({
            year,
            month,
            name: monthName,
            columns
        });
    }

    return months;
};

/**
 * Returns color level from 0 to 4 based on contribution count
 */
const getLevel = (count) => {
    if (!count || count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
};

// Color mapping for the 5 levels matching GitHub / LeetCode dark mode
const LEVEL_COLORS = {
    0: 'bg-[#27272a] hover:bg-[#323238]',                 // Level 0: dark charcoal
    1: 'bg-[#14532d] hover:bg-[#15803d]',                 // Level 1: soft dark green
    2: 'bg-[#16a34a] hover:bg-[#22c55e]',                 // Level 2: medium green
    3: 'bg-[#22c55e] hover:bg-[#4ade80]',                 // Level 3: bright green
    4: 'bg-[#4ade80] hover:bg-[#86efac] shadow-[0_0_6px_rgba(74,222,128,0.4)]', // Level 4: luminous lime
};

/**
 * ContributionHeatmap Component
 * Displays 12 month blocks with rounded square activity cells,
 * month labels underneath, rich hover tooltips, and streak statistics.
 */
const ContributionHeatmap = ({
    activity = [],
    title = 'Activity Calendar',
    subtitle = '',
    platform = 'github',
    unit = 'contribution',
    loading = false,
    onSync = null,
    syncing = false
}) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    const containerRef = useRef(null);

    // Map date string 'YYYY-MM-DD' -> count
    const activityMap = useMemo(() => {
        const map = {};
        if (Array.isArray(activity)) {
            activity.forEach(item => {
                if (item && item.date) {
                    // Normalize date string to YYYY-MM-DD
                    const d = item.date.split('T')[0];
                    map[d] = (map[d] || 0) + (Number(item.count) || 0);
                }
            });
        }
        return map;
    }, [activity]);

    // Build the 12 month blocks
    const monthBlocks = useMemo(() => generateCalendarMonths(), []);

    // Compute stats: total contributions, active days, streaks
    const stats = useMemo(() => {
        let total = 0;
        let activeDays = 0;
        const activeDatesSet = new Set();

        Object.entries(activityMap).forEach(([dateStr, count]) => {
            total += count;
            if (count > 0) {
                activeDays++;
                activeDatesSet.add(dateStr);
            }
        });

        // Compute current streak ending today/yesterday
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check last 365 days in chronological order for streaks
        for (let i = 365; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            if (activeDatesSet.has(dateStr)) {
                tempStreak++;
                if (tempStreak > maxStreak) maxStreak = tempStreak;
            } else {
                tempStreak = 0;
            }
        }

        // Current streak checking backwards from today or yesterday
        for (let i = 0; i <= 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            if (activeDatesSet.has(dateStr)) {
                currentStreak++;
            } else if (i === 0) {
                // If no activity yet today, check yesterday
                continue;
            } else {
                break;
            }
        }

        return { total, activeDays, maxStreak, currentStreak };
    }, [activityMap]);

    const formatTooltipDate = (dateObj) => {
        if (!dateObj) return '';
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-[#18181b] text-zinc-100 rounded-2xl p-5 sm:p-6 border border-zinc-800 shadow-xl relative select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        {platform === 'github' ? (
                            <svg className="w-5 h-5 text-zinc-100" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                        ) : (
                            <span className="text-amber-400 font-bold text-sm tracking-tight">&lt;/&gt;</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2">
                            {title}
                        </h3>
                        <p className="text-xs text-zinc-400">
                            {subtitle || `${stats.total.toLocaleString()} ${unit}${stats.total === 1 ? '' : 's'} in the last 12 months`}
                        </p>
                    </div>
                </div>

                {/* Quick stats pills */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs text-zinc-300">
                        <span className="text-zinc-400">Total:</span>
                        <span className="font-bold text-emerald-400">{stats.total}</span>
                    </div>
                    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs text-zinc-300">
                        <span className="text-zinc-400">Active Days:</span>
                        <span className="font-bold text-white">{stats.activeDays}</span>
                    </div>
                    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs text-zinc-300">
                        <span className="text-zinc-400">Streak:</span>
                        <span className="font-bold text-amber-400">{stats.currentStreak}d</span>
                    </div>

                    {onSync && (
                        <button
                            onClick={onSync}
                            disabled={syncing}
                            className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Sync latest activity"
                        >
                            <svg className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {syncing ? 'Syncing...' : 'Sync'}
                        </button>
                    )}
                </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="relative overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700" ref={containerRef}>
                {loading ? (
                    <div className="flex items-center justify-center h-36">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            Loading calendar activity...
                        </div>
                    </div>
                ) : (
                    <div className="inline-flex items-start gap-3 sm:gap-3.5 min-w-full justify-between pt-2">
                        {monthBlocks.map((monthBlock, mIdx) => (
                            <div key={mIdx} className="flex flex-col items-center">
                                {/* Week columns for this month */}
                                <div className="flex gap-[3px] sm:gap-1">
                                    {monthBlock.columns.map((week, wIdx) => (
                                        <div key={wIdx} className="flex flex-col gap-[3px] sm:gap-1">
                                            {week.map((daySlot, dIdx) => {
                                                if (!daySlot) {
                                                    // Placeholder for days not in this month
                                                    return (
                                                        <div
                                                            key={dIdx}
                                                            className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-[3px] opacity-0 pointer-events-none"
                                                        />
                                                    );
                                                }

                                                const count = activityMap[daySlot.dateStr] || 0;
                                                const level = getLevel(count);
                                                const colorClass = LEVEL_COLORS[level];

                                                return (
                                                    <div
                                                        key={dIdx}
                                                        onMouseEnter={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            const containerRect = containerRef.current?.getBoundingClientRect();
                                                            setHoveredCell({
                                                                dateStr: daySlot.dateStr,
                                                                dateObj: daySlot.dateObj,
                                                                count,
                                                                x: rect.left - (containerRect?.left || 0) + rect.width / 2,
                                                                y: rect.top - (containerRect?.top || 0)
                                                            });
                                                        }}
                                                        onMouseLeave={() => setHoveredCell(null)}
                                                        className={`w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-[3px] ${colorClass} cursor-pointer transition-all duration-150 transform hover:scale-125 hover:z-30`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                {/* Month label aligned directly below its columns */}
                                <span className="text-[11px] sm:text-xs font-medium text-zinc-400 mt-2.5 text-center tracking-wide">
                                    {monthBlock.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Floating Interactive Tooltip */}
                {hoveredCell && (
                    <div
                        style={{
                            left: `${hoveredCell.x}px`,
                            top: `${hoveredCell.y - 10}px`,
                            transform: 'translate(-50%, -100%)'
                        }}
                        className="pointer-events-none absolute z-50 bg-zinc-950/95 text-white text-xs px-2.5 py-1.5 rounded-lg border border-zinc-700 shadow-2xl backdrop-blur-md whitespace-nowrap flex flex-col items-center animate-in fade-in zoom-in-95 duration-100"
                    >
                        <div className="font-semibold text-emerald-400">
                            {hoveredCell.count > 0
                                ? `${hoveredCell.count} ${unit}${hoveredCell.count === 1 ? '' : 's'}`
                                : `No ${unit}s`}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                            {formatTooltipDate(hoveredCell.dateObj)}
                        </div>
                        {/* Tooltip caret */}
                        <div className="w-2 h-2 bg-zinc-950 border-r border-b border-zinc-700 rotate-45 absolute -bottom-1"></div>
                    </div>
                )}
            </div>

            {/* Footer & Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                    <span>Longest Streak: <strong className="text-zinc-200">{stats.maxStreak} days</strong></span>
                </div>

                {/* Less / More Legend */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400">Less</span>
                    <div className="flex items-center gap-[3px]">
                        {[0, 1, 2, 3, 4].map((lvl) => (
                            <div
                                key={lvl}
                                className={`w-[11px] h-[11px] sm:w-[13px] sm:h-[13px] rounded-[3px] ${LEVEL_COLORS[lvl]}`}
                                title={`Level ${lvl}`}
                            />
                        ))}
                    </div>
                    <span className="text-[11px] text-zinc-400">More</span>
                </div>
            </div>
        </div>
    );
};

export default ContributionHeatmap;

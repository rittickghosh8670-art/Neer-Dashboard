import { useMemo, useState } from 'react';

interface Props {
  pnlByDay: Record<string, number>;
}

function getMonthMatrix(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function pnlColorClass(pnl: number | undefined): string {
  if (pnl === undefined) return 'cal-empty';
  if (pnl > 0) return 'cal-positive';
  if (pnl < 0) return 'cal-negative';
  return 'cal-neutral';
}

function PnLCalendar({ pnlByDay }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const monthTotal = weeks
    .flat()
    .filter((d): d is Date => d !== null)
    .reduce((sum, d) => {
      const key = d.toISOString().slice(0, 10);
      return sum + (pnlByDay[key] ?? 0);
    }, 0);

  return (
    <div className="pnl-calendar">
      <div className="pnl-calendar-header">
        <button onClick={() => changeMonth(-1)}>&larr;</button>
        <span>{monthLabel} ({monthTotal >= 0 ? '+' : ''}{monthTotal.toFixed(2)})</span>
        <button onClick={() => changeMonth(1)}>&rarr;</button>
      </div>

      <div className="pnl-calendar-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={`dow-${i}`} className="cal-dow">{d}</div>
        ))}

        {weeks.flat().map((date, i) => {
          if (!date) return <div key={i} className="cal-cell cal-empty" />;
          const key = date.toISOString().slice(0, 10);
          const pnl = pnlByDay[key];
          return (
            <div key={i} className={`cal-cell ${pnlColorClass(pnl)}`}>
              <span className="cal-day-num">{date.getDate()}</span>
              {pnl !== undefined && (
                <span className="cal-pnl-value">{pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PnLCalendar;

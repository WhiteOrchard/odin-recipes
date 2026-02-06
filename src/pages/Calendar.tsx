import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Eye, Wrench, ClipboardCheck, FileText, Users } from 'lucide-react';
import { clsx } from 'clsx';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  addMonths, subMonths, isToday, parseISO, getDay,
} from 'date-fns';
import { calendarEvents, properties } from '../data/mockData';

const eventTypeIcons = {
  viewing: Eye,
  inspection: ClipboardCheck,
  maintenance: Wrench,
  'lease-renewal': FileText,
  meeting: Users,
};

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });

    // Pad start with days from previous month to align to Sunday
    const startDay = getDay(start);
    const paddedStart: (Date | null)[] = Array.from({ length: startDay }, () => null);

    return [...paddedStart, ...allDays];
  }, [currentMonth]);

  const selectedEvents = selectedDate
    ? calendarEvents.filter(e => isSameDay(parseISO(e.date), selectedDate))
    : [];

  const monthEvents = calendarEvents.filter(e => isSameMonth(parseISO(e.date), currentMonth));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {monthEvents.length} events this month
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar grid */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
          {/* Month navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;

              const dayEvents = calendarEvents.filter(e => isSameDay(parseISO(e.date), day));
              const selected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={clsx(
                    'relative flex h-16 flex-col items-start rounded-lg p-1.5 text-left text-sm transition-colors',
                    selected
                      ? 'bg-gold-50 ring-2 ring-gold-400 dark:bg-gold-900/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50',
                    isToday(day) && !selected && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                >
                  <span
                    className={clsx(
                      'text-xs font-medium',
                      isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="mt-auto flex gap-0.5">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Event details / upcoming */}
        <div className="space-y-4">
          {selectedDate ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
              <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              {selectedEvents.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {selectedEvents.map(event => {
                    const Icon = eventTypeIcons[event.type];
                    const prop = event.propertyId ? properties.find(p => p.id === event.propertyId) : null;
                    return (
                      <div
                        key={event.id}
                        className="rounded-lg border-l-4 bg-slate-50 p-3 dark:bg-slate-800/50"
                        style={{ borderLeftColor: event.color }}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={16} style={{ color: event.color }} />
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{event.time}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
                        {prop && (
                          <p className="mt-1 text-xs text-slate-400">{prop.name}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No events scheduled</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
              <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-white">Upcoming Events</h3>
              <div className="mt-4 space-y-3">
                {monthEvents.sort((a, b) => a.date.localeCompare(b.date)).map(event => {
                  const Icon = eventTypeIcons[event.type];
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700"
                    >
                      <div className="mt-0.5 rounded-md p-1" style={{ backgroundColor: event.color + '20', color: event.color }}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{event.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(parseISO(event.date), 'MMM d')} at {event.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-mansion-800">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Types</h3>
            <div className="mt-3 space-y-2">
              {[
                { type: 'Viewing', color: '#3b82f6' },
                { type: 'Maintenance', color: '#ef4444' },
                { type: 'Inspection', color: '#f59e0b' },
                { type: 'Lease Renewal', color: '#10b981' },
                { type: 'Meeting', color: '#8b5cf6' },
              ].map(item => (
                <div key={item.type} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

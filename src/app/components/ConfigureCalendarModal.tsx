import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

export type InactiveScope = 'full_day' | 'custom_hours';

export interface CalendarInactiveEntry {
  id: string;
  /** Local calendar date YYYY-MM-DD */
  date: string;
  scope: InactiveScope;
  startTime?: string;
  endTime?: string;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

interface ConfigureCalendarModalProps {
  open: boolean;
  onClose: () => void;
  entries: CalendarInactiveEntry[];
  onAddEntry: (entry: Omit<CalendarInactiveEntry, 'id'>) => void;
  onRemoveEntry: (id: string) => void;
}

export function ConfigureCalendarModal({
  open,
  onClose,
  entries,
  onAddEntry,
  onRemoveEntry,
}: ConfigureCalendarModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [scope, setScope] = useState<InactiveScope>('full_day');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const inactiveDates = useMemo(
    () => [...new Set(entries.map((e) => e.date))].map((key) => parseLocalDateKey(key)),
    [entries],
  );

  useEffect(() => {
    if (!open) {
      setSelectedDate(undefined);
      setScope('full_day');
      setStartTime('09:00');
      setEndTime('17:00');
    }
  }, [open]);

  const handleSave = () => {
    if (!selectedDate) {
      return;
    }
    const date = toDateKey(selectedDate);

    if (scope === 'custom_hours') {
      if (!startTime || !endTime) {
        return;
      }
      if (startTime >= endTime) {
        return;
      }
      onAddEntry({
        date,
        scope: 'custom_hours',
        startTime,
        endTime,
      });
    } else {
      onAddEntry({
        date,
        scope: 'full_day',
      });
    }

    setSelectedDate(undefined);
    setScope('full_day');
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const canSave =
    !!selectedDate &&
    (scope === 'full_day' ||
      (Boolean(startTime && endTime) && startTime < endTime));

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto gap-0 p-0 sm:max-w-md">
        <DialogHeader>
          <div className="border-b border-border px-5 py-4">
            <DialogTitle>Configure calendar</DialogTitle>
            <DialogDescription className="mt-1">
              Choose dates when you are inactive. You can block a full day or specific hours.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="rounded-xl border border-border bg-card p-2 flex justify-center shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
              modifiers={{ inactive: inactiveDates }}
              modifiersClassNames={{
                inactive:
                  'bg-destructive/15 text-foreground ring-1 ring-destructive/30 aria-selected:ring-primary',
              }}
            />
          </div>

          {selectedDate && (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground text-center">
              Selected:{' '}
              <span className="font-medium text-foreground">{format(selectedDate, 'PPP')}</span>
            </p>
          )}

          <div className="space-y-3 rounded-xl border border-border bg-card px-3 py-3 shadow-sm">
            <Label className="text-foreground">Inactive period</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as InactiveScope)}
              className="gap-3"
            >
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
                <RadioGroupItem value="full_day" id="cal-full-day" />
                <Label htmlFor="cal-full-day" className="font-normal cursor-pointer flex-1">
                  Complete day (inactive all day)
                </Label>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-background px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="custom_hours" id="cal-custom" />
                  <Label htmlFor="cal-custom" className="font-normal cursor-pointer flex-1">
                    Custom hours
                  </Label>
                </div>
                {scope === 'custom_hours' && (
                  <div className="grid grid-cols-2 gap-2 pl-7 pt-1">
                    <div className="space-y-1">
                      <Label htmlFor="cal-start" className="text-xs text-muted-foreground">
                        From
                      </Label>
                      <Input
                        id="cal-start"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="h-10 bg-input-background rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cal-end" className="text-xs text-muted-foreground">
                        To
                      </Label>
                      <Input
                        id="cal-end"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="h-10 bg-input-background rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>

          {entries.length > 0 && (
            <div className="space-y-2 rounded-xl border border-border bg-card px-3 py-3 shadow-sm">
              <Label className="text-foreground">Saved inactive periods</Label>
              <ul className="space-y-2 max-h-36 overflow-y-auto text-sm">
                {entries.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2"
                  >
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {format(parseLocalDateKey(e.date), 'MMM d, yyyy')}
                      </span>
                      {e.scope === 'full_day' ? (
                        <span> — All day</span>
                      ) : (
                        <span>
                          {' '}
                          — {e.startTime}–{e.endTime}
                        </span>
                      )}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={() => onRemoveEntry(e.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border px-5 py-4 gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Done
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            Save inactive period
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

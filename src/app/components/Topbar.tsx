import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

interface TopbarProps {
  washerName: string;
  todayEarnings: number;
  showPinSearch?: boolean;
  pinCodeSearch: string;
  pinCodeOptions: string[];
  selectedPinCode: string;
  onPinCodeSearchChange: (value: string) => void;
  onPinCodeSelect: (pinCode: string) => void;
  onShowHistory: () => void;
  onShowTotalEarnings: () => void;
  onShowConfigureCalendar: () => void;
  onLogout: () => void;
}

export function Topbar({
  washerName,
  todayEarnings,
  showPinSearch = false,
  pinCodeSearch,
  pinCodeOptions,
  selectedPinCode,
  onPinCodeSearchChange,
  onPinCodeSelect,
  onShowHistory,
  onShowTotalEarnings,
  onShowConfigureCalendar,
  onLogout,
}: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const runMenuAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className="sticky top-0 z-10 bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <svg
              className="w-5 h-5 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Washer</p>
            <p className="font-medium">{washerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right pr-2 border-r border-border">
            <p className="text-xs text-muted-foreground leading-tight">Today</p>
            <p className="text-lg font-semibold text-primary leading-tight">${todayEarnings}</p>
          </div>
          {showPinSearch && (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`rounded-full ${searchOpen ? 'bg-muted' : ''}`}
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Search jobs by pin code"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </Button>

              {searchOpen && (
                <div className="absolute right-0 top-11 z-20 w-[260px] rounded-xl border border-border bg-popover p-2 shadow-lg space-y-2">
                  <input
                    type="text"
                    value={pinCodeSearch}
                    onChange={(e) => onPinCodeSearchChange(e.target.value)}
                    placeholder="Search pin code"
                    className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <select
                    value={selectedPinCode}
                    onChange={(e) => {
                      onPinCodeSelect(e.target.value);
                      setSearchOpen(false);
                    }}
                    className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select pin code</option>
                    {pinCodeOptions.map((pin) => (
                      <option key={pin} value={pin}>
                        {pin}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => runMenuAction(onShowHistory)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Job History</p>
                    <p className="text-sm text-muted-foreground">View completed jobs</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => runMenuAction(onShowTotalEarnings)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Total Earnings</p>
                    <p className="text-sm text-muted-foreground">View earnings breakdown</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => runMenuAction(onShowConfigureCalendar)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Configure calendar</p>
                    <p className="text-sm text-muted-foreground">Mark days or hours inactive</p>
                  </div>
                </button>

                <div className="border-t border-border my-4" />

                <button
                  type="button"
                  onClick={() => runMenuAction(onLogout)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-left text-destructive"
                >
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Logout</p>
                    <p className="text-sm opacity-80">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

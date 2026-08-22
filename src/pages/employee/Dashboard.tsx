import React, { useState } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { format, isSameDay } from 'date-fns';
import { 
  LogIn, LogOut, CheckCircle2, Video, 
  MapPin, Clock, Calendar as CalendarIcon, 
  AlertCircle
} from 'lucide-react';
import { cn, getGreeting } from '@/lib/utils';

export default function EmployeeDashboard() {
  const { currentUser, attendance, checkIn, checkOut, leaveRequests } = useStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todayRecord = attendance.find(a => a.userId === currentUser?.id && a.date === todayStr);
  const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;
  const isCheckedOut = !!todayRecord?.checkOut;


  const handleToggleCheckIn = () => {
    if (isCheckedIn) {
      checkOut();
    } else {
      checkIn();
    }
  };

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return d;
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedRecord = attendance.find(a => a.userId === currentUser?.id && a.date === selectedDateStr);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero / Status Bar */}
      <Card className="bg-surface border-border overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-steel via-sky to-surface" />
        <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-display font-semibold text-ink">{getGreeting()}, {currentUser?.name?.split(' ')[0]}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="relative flex h-3 w-3">
                {isCheckedIn && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>}
                <span className={cn("relative inline-flex rounded-full h-3 w-3", isCheckedIn ? "bg-emerald" : "bg-text-muted")}></span>
              </div>
              <span className="text-sm font-medium text-text-muted">
                {isCheckedIn ? 'Current Status: Active' : isCheckedOut ? 'Current Status: Checked Out' : 'Current Status: Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-text-muted font-medium">Current Shift</p>
              <p className="text-base font-semibold text-ink">9:00 AM - 5:00 PM</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <Button 
              onClick={handleToggleCheckIn}
              className={cn(
                "rounded-full px-8 gap-2 font-medium shadow-sm transition-all text-white", 
                isCheckedIn 
                  ? "bg-amber hover:bg-amber/90" 
                  : "bg-emerald hover:bg-emerald/90"
              )}
            >
              {isCheckedIn ? <LogOut className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {isCheckedIn ? 'Check Out' : 'Check In'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date Selector & My Check-In / Check-Out Log Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-steel" />
              My Check-In & Check-Out Log
            </CardTitle>
            <p className="text-xs text-text-muted mt-1">
              Select any date to view your detailed check-in timestamps and working hours.
            </p>
          </div>

          {/* Week Day Selector Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {weekDays.map((d, index) => {
              const isSelected = format(d, 'yyyy-MM-dd') === selectedDateStr;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-center border text-xs shrink-0 cursor-pointer transition-all duration-150",
                    isSelected
                      ? "bg-steel text-white border-steel font-semibold shadow-sm scale-105"
                      : "bg-surface text-ink border-border hover:bg-surface-hover hover:border-steel/40"
                  )}
                >
                  <div className="text-[10px] uppercase opacity-80">{format(d, 'EEE')}</div>
                  <div className="font-bold text-sm">{format(d, 'dd')}</div>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-canvas p-5 rounded-xl border border-border/80 shadow-xs">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Check-In Time</span>
              <span className="text-2xl font-semibold text-ink tracking-tight tabular-nums">
                {selectedRecord?.checkIn ? format(new Date(selectedRecord.checkIn), 'hh:mm:ss a') : '--:--:--'}
              </span>
            </div>
            <div className="bg-canvas p-5 rounded-xl border border-border/80 shadow-xs">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Check-Out Time</span>
              <span className="text-2xl font-semibold text-ink tracking-tight tabular-nums">
                {selectedRecord?.checkOut ? format(new Date(selectedRecord.checkOut), 'hh:mm:ss a') : '--:--:--'}
              </span>
            </div>
            <div className="bg-canvas p-5 rounded-xl border border-border/80 shadow-xs">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Working Duration</span>
              <span className="text-2xl font-semibold text-steel tracking-tight tabular-nums">
                {(() => {
                  if (selectedRecord?.checkIn && selectedRecord?.checkOut) {
                    const diffMs = new Date(selectedRecord.checkOut).getTime() - new Date(selectedRecord.checkIn).getTime();
                    const h = Math.floor(diffMs / (1000 * 60 * 60));
                    const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    return `${h}h ${m}m`;
                  } else if (selectedRecord?.checkIn) {
                    return 'Active Session';
                  }
                  return '--';
                })()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Flow - Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <CardTitle>Today's Flow</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative pl-6 border-l-2 border-border/50 space-y-8 py-2">
              {/* Timeline item 1 */}
              <div className="relative">
                <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-surface border-2 border-steel"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <p className="text-sm font-medium text-steel mb-1">09:30 AM - 10:00 AM</p>
                    <h4 className="text-lg font-medium text-ink">Daily Standup</h4>
                    <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                      <Video className="w-4 h-4" /> Virtual Meeting
                    </p>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-surface bg-sky/20 flex items-center justify-center text-xs font-medium text-steel">SC</div>
                    <div className="w-8 h-8 rounded-full border-2 border-surface bg-amber-bg flex items-center justify-center text-xs font-medium text-amber">AU</div>
                    <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-hover flex items-center justify-center text-xs font-medium text-text-muted">+3</div>
                  </div>
                </div>
              </div>

              {/* Timeline item 2 */}
              <div className="relative">
                <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-surface border-2 border-border"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <p className="text-sm font-medium text-text-muted mb-1">01:00 PM - 02:30 PM</p>
                    <h4 className="text-lg font-medium text-ink">Design Review: Q3 Initiatives</h4>
                    <p className="text-sm text-text-muted flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> Conference Room A
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-steel">View Details</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Time Off Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Time Off</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-ink font-medium">Annual Leave</span>
                  <span className="font-semibold">12 Days</span>
                </div>
                <div className="w-full bg-surface-hover rounded-full h-2 overflow-hidden">
                  <div className="bg-steel h-full rounded-full w-[60%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-ink font-medium">Sick Days</span>
                  <span className="font-semibold">5 Days</span>
                </div>
                <div className="w-full bg-surface-hover rounded-full h-2 overflow-hidden">
                  <div className="bg-sky h-full rounded-full w-[80%]"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.filter(r => r.userId === currentUser?.id).slice(0, 2).map(req => (
                  <div key={req.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                      {req.status === 'approved' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald" />
                      ) : req.status === 'rejected' ? (
                        <AlertCircle className="w-4 h-4 text-brick" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        Leave Request {req.status}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {req.type} leave for {format(new Date(req.startDate), 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
                {leaveRequests.length === 0 && (
                  <p className="text-sm text-text-muted italic">No recent activity.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

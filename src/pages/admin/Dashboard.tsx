import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { format, addDays } from 'date-fns';
import { Users, Clock, AlertTriangle, CheckCircle2, CalendarDays, ShieldAlert, ArrowRight, Save, UserCheck } from 'lucide-react';
import { useState } from 'react';

import { getGreeting } from '@/lib/utils';

export default function AdminDashboard() {
  const { users, attendance, leaveRequests } = useStore();
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const checkedInCount = todayAttendance.filter(a => a.checkIn).length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending');
  const approvedLeaves = leaveRequests.filter(r => r.status === 'approved');

  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shiftAssignments, setShiftAssignments] = useState<Record<string, string>>({
    '1': 'Morning Shift (09:00 - 17:00)',
    '2': 'Morning Shift (09:00 - 17:00)',
  });
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  const handleShiftChange = (userId: string, shift: string) => {
    setShiftAssignments(prev => ({ ...prev, [userId]: shift }));
  };

  const handleSaveSchedule = () => {
    setIsSavingSchedule(true);
    setTimeout(() => {
      setIsSavingSchedule(false);
      setIsScheduleModalOpen(false);
      setToastMessage('Shift schedule successfully reviewed and published!');
      setTimeout(() => setToastMessage(null), 5000);
    }, 1000);
  };

  // Generate 7 days week schedule dates
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-bg border border-emerald/30 text-emerald px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" />
            {toastMessage}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs hover:underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">{getGreeting()}, Admin Dashboard</h1>
          <p className="text-sm text-text-muted">Real-time shift coverage, attendance overview, and schedule management.</p>
        </div>
        <Button onClick={() => setIsScheduleModalOpen(true)} className="gap-2 shrink-0">
          <CalendarDays className="w-4 h-4" /> Review Schedule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:border-steel transition-colors group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Checked In</span>
              <CheckCircle2 className="w-5 h-5 text-emerald" />
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-display font-semibold text-ink">{checkedInCount}</span>
              <span className="text-sm font-medium text-emerald">↑ 2.4%</span>
            </div>
            <p className="text-xs text-text-muted mt-1">of {users.length} scheduled today</p>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald/5 rounded-full blur-xl group-hover:bg-emerald/10 transition-colors"></div>
          </CardContent>
        </Card>

        <Card className="hover:border-amber transition-colors group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Pending Approvals</span>
              <Clock className="w-5 h-5 text-amber" />
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-display font-semibold text-ink">{pendingLeaves.length}</span>
              <span className="text-sm font-medium text-amber">Action needed</span>
            </div>
            <p className="text-xs text-text-muted mt-1">Leaves awaiting review</p>
          </CardContent>
        </Card>

        <Card className="hover:border-brick transition-colors group relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">On Leave / PTO</span>
              <AlertTriangle className="w-5 h-5 text-brick" />
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-display font-semibold text-ink">{approvedLeaves.length}</span>
              <span className="text-xs text-text-muted font-medium">active leave(s)</span>
            </div>
            <p className="text-xs text-text-muted mt-1">Approved PTO this period</p>
          </CardContent>
        </Card>

        <Card className="bg-sky/10 border-sky/30">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-steel uppercase tracking-wider">System Insight</span>
              </div>
              <p className="text-sm text-steel mt-1 font-medium leading-snug">
                High PTO requested for next week. Consider pausing non-critical training sessions.
              </p>
            </div>
            <button 
              onClick={() => setIsScheduleModalOpen(true)}
              className="mt-4 flex items-center gap-1.5 text-sm text-steel hover:underline font-semibold cursor-pointer text-left"
            >
              Review schedule <ArrowRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Directory (Active Shifts)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider font-medium">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role / Dept</th>
                  <th className="py-3 px-4">Assigned Shift</th>
                  <th className="py-3 px-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map(user => {
                  const hasCheckedIn = todayAttendance.some(a => a.userId === user.id && a.checkIn && !a.checkOut);
                  const isOnLeave = approvedLeaves.some(l => l.userId === user.id);
                  const assignedShift = shiftAssignments[user.id] || 'Morning Shift (09:00 - 17:00)';

                  return (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-steel text-white flex items-center justify-center text-xs font-medium shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-ink">{user.name}</div>
                            <div className="text-text-muted text-xs">ID: #{user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-ink">
                        {user.position}
                        <br />
                        <span className="text-text-muted text-xs">{user.department}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-text-muted">
                        {assignedShift}
                      </td>
                      <td className="py-3 px-4">
                        {isOnLeave ? (
                          <Badge variant="warning">On PTO</Badge>
                        ) : hasCheckedIn ? (
                          <Badge variant="success">On-Site</Badge>
                        ) : (
                          <Badge variant="outline" className="text-text-muted">Offline</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Employee Check-In and Check-Out Logs Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-steel" />
              Employee Check-In & Check-Out Activity Logs
            </CardTitle>
            <p className="text-xs text-text-muted mt-1">
              Detailed daily timestamps and working duration for all employees on <span className="font-semibold text-ink">{format(selectedDate, 'EEEE, MMMM dd, yyyy')}</span>.
            </p>
          </div>

          {/* Interactive Date Selector Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {weekDays.map((d, index) => {
              const isSelected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`px-3 py-1.5 rounded-lg text-center border text-xs shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-steel text-white border-steel font-semibold shadow-sm'
                      : 'bg-surface text-ink border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="text-[10px] uppercase opacity-80">{format(d, 'EEE')}</div>
                  <div className="font-bold">{format(d, 'dd')}</div>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-canvas/50 text-text-muted text-xs uppercase tracking-wider font-medium">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department / Role</th>
                  <th className="py-3 px-4 text-center">Check-In Time</th>
                  <th className="py-3 px-4 text-center">Check-Out Time</th>
                  <th className="py-3 px-4 text-center">Working Duration</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-border/50">
                {users.map(user => {
                  const selDateStr = format(selectedDate, 'yyyy-MM-dd');
                  const record = attendance.find(a => a.userId === user.id && a.date === selDateStr);
                  const isOnLeave = leaveRequests.some(l => l.userId === user.id && l.status === 'approved');

                  let durationText = '--';
                  if (record?.checkIn && record?.checkOut) {
                    const diffMs = new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime();
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    durationText = `${hours}h ${mins}m`;
                  } else if (record?.checkIn) {
                    const diffMs = new Date().getTime() - new Date(record.checkIn).getTime();
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    durationText = `${hours}h ${mins}m (Active)`;
                  }

                  return (
                    <tr key={user.id} className="hover:bg-surface-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-steel text-white flex items-center justify-center text-xs font-semibold shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-ink">{user.name}</div>
                            <div className="text-text-muted text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-ink">
                        <div className="text-xs font-medium">{user.position}</div>
                        <div className="text-text-muted text-[11px]">{user.department}</div>
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums font-medium text-xs text-ink">
                        {record?.checkIn ? format(new Date(record.checkIn), 'hh:mm:ss a') : '--:--:--'}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums font-medium text-xs text-ink">
                        {record?.checkOut ? format(new Date(record.checkOut), 'hh:mm:ss a') : '--:--:--'}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-xs text-ink">
                        {durationText}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isOnLeave ? (
                          <Badge variant="warning">On Leave</Badge>
                        ) : record?.checkIn && !record?.checkOut ? (
                          <Badge variant="success" className="animate-pulse">Active Now</Badge>
                        ) : record?.checkOut ? (
                          <Badge variant="outline" className="text-steel border-steel">Completed</Badge>
                        ) : (
                          <Badge variant="outline" className="text-text-muted">Offline</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Weekly Shift Schedule & Coverage Review"
        subtitle="Review employee shift allocations, detect PTO conflicts, and publish rosters."
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Week Selector Bar */}
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-steel" />
              <div>
                <h4 className="font-display font-semibold text-sm text-ink">
                  Schedule Week of {format(selectedDate, 'MMMM dd, yyyy')}
                </h4>
                <p className="text-xs text-text-muted">7-Day Coverage Plan</p>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {weekDays.map((d, index) => {
                const isSelected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`px-3 py-1.5 rounded-lg text-center border text-xs shrink-0 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-steel text-white border-steel font-semibold shadow-sm'
                        : 'bg-surface text-ink border-border hover:bg-surface-hover'
                    }`}
                  >
                    <div className="text-[10px] uppercase opacity-80">{format(d, 'EEE')}</div>
                    <div className="font-bold">{format(d, 'dd')}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conflict Alerts */}
          {approvedLeaves.length > 0 && (
            <div className="bg-amber-bg border border-amber/40 text-amber-900 rounded-xl p-4 flex items-start gap-3 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">PTO Conflict Warning Detected</p>
                <p className="mt-0.5 text-amber-800">
                  {approvedLeaves.length} employee(s) have approved time-off requests during this schedule cycle. Ensure minimum department coverage is maintained.
                </p>
              </div>
            </div>
          )}

          {/* Roster Assignment Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-canvas px-4 py-3 border-b border-border font-display font-semibold text-sm text-ink flex justify-between items-center">
              <span>Department Shift Allocation</span>
              <span className="text-xs font-normal text-text-muted">{users.length} Active Staff Members</span>
            </div>
            <div className="divide-y divide-border/60">
              {users.map(user => {
                const userLeaves = leaveRequests.filter(l => l.userId === user.id);
                const isOff = userLeaves.some(l => l.status === 'approved');

                return (
                  <div key={user.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-steel text-white flex items-center justify-center font-medium text-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-ink flex items-center gap-2">
                          {user.name}
                          {isOff && (
                            <span className="px-2 py-0.5 bg-amber-bg text-amber text-[10px] font-semibold rounded">
                              ON LEAVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-muted">
                          {user.position} • <span className="font-medium">{user.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      <select
                        value={shiftAssignments[user.id] || 'Morning Shift (09:00 - 17:00)'}
                        onChange={e => handleShiftChange(user.id, e.target.value)}
                        disabled={isOff}
                        className="w-full sm:w-64 h-9 px-3 text-xs rounded-md border border-border bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-steel disabled:opacity-50"
                      >
                        <option value="Morning Shift (09:00 - 17:00)">Morning Shift (09:00 - 17:00)</option>
                        <option value="Evening Shift (13:00 - 21:00)">Evening Shift (13:00 - 21:00)</option>
                        <option value="Night Shift (21:00 - 05:00)">Night Shift (21:00 - 05:00)</option>
                        <option value="Off Day / Rest Day">Off Day / Rest Day</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)} disabled={isSavingSchedule}>
              Close
            </Button>
            <Button onClick={handleSaveSchedule} disabled={isSavingSchedule} className="gap-2">
              <Save className="w-4 h-4" />
              {isSavingSchedule ? 'Publishing...' : 'Approve & Publish Schedule'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

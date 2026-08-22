import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const { users, attendance, leaveRequests } = useStore();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const checkedInCount = todayAttendance.filter(a => a.checkIn).length;
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Late / Absent</span>
              <AlertTriangle className="w-5 h-5 text-brick" />
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-display font-semibold text-ink">0</span>
            </div>
            <p className="text-xs text-text-muted mt-1">Requires manager review</p>
          </CardContent>
        </Card>

        <Card className="bg-sky/10 border-sky/30">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-steel uppercase tracking-wider">System Insight</span>
            </div>
            <p className="text-sm text-steel mt-2 font-medium">
              High PTO requested for next week. Consider pausing non-critical training sessions.
            </p>
            <a href="#" className="mt-4 inline-block text-sm text-steel hover:underline font-medium">
              Review schedule →
            </a>
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
                  <th className="py-3 px-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map(user => {
                  const hasCheckedIn = todayAttendance.some(a => a.userId === user.id && a.checkIn && !a.checkOut);
                  return (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-steel text-white flex items-center justify-center text-xs font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-ink">{user.name}</div>
                            <div className="text-text-muted text-xs">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-ink">
                        {user.position}
                        <br />
                        <span className="text-text-muted text-xs">{user.department}</span>
                      </td>
                      <td className="py-3 px-4">
                        {hasCheckedIn ? (
                          <Badge variant="success">On-Site</Badge>
                        ) : (
                          <Badge variant="outline" className="text-text-muted">Offline</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

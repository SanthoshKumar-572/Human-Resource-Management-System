import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { format, subDays } from 'date-fns';

export default function Attendance() {
  const { currentUser, attendance } = useStore();
  
  const myRecords = attendance
    .filter(a => a.userId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Generate last 7 days for the timeline
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const record = myRecords.find(r => r.date === dateStr);
    return { date: d, dateStr, record };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Record</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider font-medium">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Check In</th>
                  <th className="py-3 px-4 text-right">Check Out</th>
                  <th className="py-3 px-4 text-right">Total Hours</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {last7Days.map(({ date, dateStr, record }) => {
                  let hours = 0;
                  if (record?.checkIn && record?.checkOut) {
                    hours = (new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60);
                  }
                  
                  return (
                    <tr key={dateStr} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-ink">{format(date, 'MMM d, yyyy')}</div>
                        <div className="text-text-muted text-xs">{format(date, 'EEEE')}</div>
                      </td>
                      <td className="py-3 px-4">
                        {record ? (
                          <Badge variant={record.status === 'present' ? 'success' : 'danger'} className="capitalize">
                            {record.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-text-muted">No Record</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-text-muted">
                        {record?.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '--:--'}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-text-muted">
                        {record?.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '--:--'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium tabular-nums text-ink">
                        {hours > 0 ? `${hours.toFixed(1)}h` : '-'}
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

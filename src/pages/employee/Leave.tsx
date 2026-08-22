import React, { useState } from 'react';
import { useStore, LeaveType } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

export default function Leave() {
  const { currentUser, leaveRequests, applyLeave } = useStore();
  const [type, setType] = useState<LeaveType>('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const myRequests = leaveRequests.filter(r => r.userId === currentUser?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    applyLeave({
      type,
      startDate,
      endDate,
      remarks,
    });

    setStartDate('');
    setEndDate('');
    setRemarks('');
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Apply Leave Form */}
      <Card className="md:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>Request Time Off</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Leave Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value as LeaveType)}
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel"
              >
                <option value="paid">Annual / Paid Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Start Date</label>
              <Input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">End Date</label>
              <Input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">Remarks</label>
              <textarea 
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel"
                placeholder="Brief reason for time off..."
              />
            </div>

            <Button type="submit" className="w-full">Submit Request</Button>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          {myRequests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-text-muted">No leave requests yet. When you apply for leave, it'll show up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map(req => (
                <div key={req.id} className="p-4 border border-border rounded-lg bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-surface-hover">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-ink capitalize">{req.type} Leave</span>
                      <Badge variant={
                        req.status === 'approved' ? 'success' : 
                        req.status === 'rejected' ? 'danger' : 'warning'
                      } className="capitalize">
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-muted">
                      {format(new Date(req.startDate), 'MMM d, yyyy')} - {format(new Date(req.endDate), 'MMM d, yyyy')}
                    </p>
                    {req.remarks && (
                      <p className="text-sm text-ink mt-2">"{req.remarks}"</p>
                    )}
                    {req.adminComment && (
                      <p className="text-sm text-steel mt-1 bg-steel/5 p-2 rounded">
                        HR Note: {req.adminComment}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-text-muted">Applied on</p>
                    <p className="text-sm font-medium tabular-nums">{format(new Date(req.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

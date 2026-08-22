import { useState } from 'react';
import { useStore, LeaveRequest } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { format } from 'date-fns';

export default function Approvals() {
  const { leaveRequests, users, updateLeaveStatus } = useStore();
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});

  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending');
  const pastLeaves = leaveRequests.filter(r => r.status !== 'pending');

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    updateLeaveStatus(id, status, commentMap[id]);
    setCommentMap(prev => {
      const newMap = { ...prev };
      delete newMap[id];
      return newMap;
    });
  };

  const renderCard = (req: LeaveRequest, isPending: boolean) => {
    const user = users.find(u => u.id === req.userId);
    return (
      <Card key={req.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-steel text-white flex items-center justify-center font-medium">
                  {user?.name.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{user?.name}</h3>
                  <p className="text-xs text-text-muted">{user?.department}</p>
                </div>
                {!isPending && (
                  <Badge variant={req.status === 'approved' ? 'success' : 'danger'} className="ml-auto capitalize">
                    {req.status}
                  </Badge>
                )}
                {isPending && (
                  <Badge variant="warning" className="ml-auto capitalize">
                    {req.type}
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-ink mb-3 bg-canvas p-3 rounded-md">
                <p><span className="font-medium">Dates:</span> {format(new Date(req.startDate), 'MMM d')} - {format(new Date(req.endDate), 'MMM d, yyyy')}</p>
                {req.remarks && <p className="mt-1"><span className="font-medium">Reason:</span> {req.remarks}</p>}
              </div>

              {isPending && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="Add a comment (optional)..." 
                    value={commentMap[req.id] || ''}
                    onChange={e => setCommentMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                    className="flex-1"
                  />
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      variant="danger" 
                      onClick={() => handleAction(req.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleAction(req.id, 'approved')}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              )}
              
              {!isPending && req.adminComment && (
                <p className="text-sm text-text-muted mt-2 border-l-2 border-border pl-2 italic">
                  Note: {req.adminComment}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-display font-semibold mb-4 text-ink flex items-center gap-2">
          Action Required <Badge variant="warning">{pendingLeaves.length}</Badge>
        </h2>
        {pendingLeaves.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-surface">
            <p className="text-text-muted">No pending approvals.</p>
          </div>
        ) : (
          pendingLeaves.map(req => renderCard(req, true))
        )}
      </div>

      <div>
        <h2 className="text-xl font-display font-semibold mb-4 text-ink">Recent History</h2>
        {pastLeaves.length === 0 ? (
          <p className="text-text-muted text-sm italic">No processed requests yet.</p>
        ) : (
          pastLeaves.slice(0, 10).map(req => renderCard(req, false))
        )}
      </div>
    </div>
  );
}

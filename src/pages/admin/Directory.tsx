import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function Directory() {
  const { users } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
          <Input 
            placeholder="Search by name, role, or department..." 
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="shrink-0 gap-2">
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-steel text-white flex items-center justify-center font-medium text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{user.name}</h3>
                    <p className="text-sm text-text-muted">{user.position}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Department</span>
                  <span className="font-medium text-ink">{user.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Email</span>
                  <span className="font-medium text-ink truncate ml-4">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Join Date</span>
                  <span className="font-medium text-ink tabular-nums">{user.joinDate}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <Button variant="ghost" size="sm" className="text-steel">View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-lg text-text-muted">
            No employees found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

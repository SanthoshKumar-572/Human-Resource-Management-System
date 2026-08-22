import { useState } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock } from 'lucide-react';

export default function Profile() {
  const { currentUser, updateUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable fields
  const [name, setName] = useState(currentUser?.name || '');
  
  const handleSave = () => {
    if (currentUser) {
      updateUser(currentUser.id, { name });
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          <Button variant="outline" size="sm" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-steel text-white flex items-center justify-center text-3xl font-medium">
              {currentUser?.name?.charAt(0)}
            </div>
            {isEditing && (
              <Button variant="outline" size="sm">Change Photo</Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Full Name</label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                disabled={!isEditing} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1 flex items-center gap-1">
                Email Address <Lock className="w-3 h-3" />
              </label>
              <Input value={currentUser?.email} disabled className="bg-canvas" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1 flex items-center gap-1">
                Department <Lock className="w-3 h-3" />
              </label>
              <Input value={currentUser?.department} disabled className="bg-canvas" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1 flex items-center gap-1">
                Position <Lock className="w-3 h-3" />
              </label>
              <Input value={currentUser?.position} disabled className="bg-canvas" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1 flex items-center gap-1">
                Role Level <Lock className="w-3 h-3" />
              </label>
              <Input value={currentUser?.role} disabled className="bg-canvas capitalize" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1 flex items-center gap-1">
                Join Date <Lock className="w-3 h-3" />
              </label>
              <Input value={currentUser?.joinDate} disabled className="bg-canvas" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payroll Information</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="p-4 bg-surface-hover rounded-lg border border-border">
              <p className="text-sm font-medium text-ink mb-1">Annual Salary</p>
              <p className="text-2xl font-display font-semibold tabular-nums">
                ${currentUser?.salary?.toLocaleString() ?? '---'}
              </p>
              <p className="text-xs text-text-muted mt-2">Contact HR to request changes to your payroll details.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

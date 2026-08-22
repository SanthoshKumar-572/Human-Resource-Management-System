import React, { useState, useRef } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Camera, Trash2, Upload } from 'lucide-react';

export default function Profile() {
  const { currentUser, updateUser, setToastMessage } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Editable fields
  const [name, setName] = useState(currentUser?.name || '');

  const handleSave = () => {
    if (currentUser) {
      updateUser(currentUser.id, { name });
      setToastMessage('Profile updated successfully!');
      setIsEditing(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      if (file.size > 5 * 1024 * 1024) {
        setToastMessage('Image size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        updateUser(currentUser.id, { avatar: base64Image });
        setToastMessage('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    if (currentUser) {
      updateUser(currentUser.id, { avatar: undefined });
      setToastMessage('Profile photo removed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden File Input for Avatar */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handlePhotoChange} 
        className="hidden" 
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          <Button variant="outline" size="sm" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-steel text-white flex items-center justify-center text-3xl font-medium overflow-hidden border-2 border-border group cursor-pointer shrink-0 shadow-sm"
              title="Click to change photo"
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser?.name?.charAt(0)}</span>
              )}
              <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1 font-medium">
                <Camera className="w-5 h-5" />
                <span>Upload</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-steel" />
                  Change Photo
                </Button>
                {currentUser?.avatar && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemovePhoto}
                    className="text-brick hover:text-brick hover:bg-brick-bg gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-text-muted">JPG, PNG or GIF. Max size of 5MB.</p>
            </div>
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

import React, { useState } from 'react';
import { useStore, Role } from '@/store';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, UserPlus, CheckCircle2, User, Mail, Briefcase, Building, DollarSign, Calendar, Lock } from 'lucide-react';
import { format } from 'date-fns';

export default function Directory() {
  const { users, addUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'employee' as Role,
    department: 'Engineering',
    position: '',
    salary: '85000',
    joinDate: format(new Date(), 'yyyy-MM-dd')
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.position.trim()) return;

    setIsSubmitting(true);
    try {
      await addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim() || 'password123',
        role: formData.role,
        department: formData.department,
        position: formData.position.trim(),
        salary: Number(formData.salary) || 0,
        joinDate: formData.joinDate
      });

      setToastMessage(`Employee ${formData.name} added successfully!`);
      setTimeout(() => setToastMessage(null), 2500);

      // Reset form & close modal
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: 'employee',
        department: 'Engineering',
        position: '',
        salary: '85000',
        joinDate: format(new Date(), 'yyyy-MM-dd')
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding employee:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
        <Button onClick={() => setIsModalOpen(true)} className="shrink-0 gap-2">
          <UserPlus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-steel text-white flex items-center justify-center font-medium text-lg shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink truncate">{user.name}</h3>
                    <p className="text-sm text-text-muted truncate">{user.position}</p>
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
                  <span className="font-medium text-ink truncate ml-4" title={user.email}>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Join Date</span>
                  <span className="font-medium text-ink tabular-nums">{user.joinDate}</span>
                </div>
                {user.salary && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Salary</span>
                    <span className="font-medium text-steel tabular-nums">${user.salary.toLocaleString()}/yr</span>
                  </div>
                )}
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

      {/* Add Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Employee"
        subtitle="Enter details to register a new employee in the system."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  className="pl-9 text-sm"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="john@dayflow.com"
                  className="pl-9 text-sm"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Initial Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  name="password"
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  className="pl-9 text-sm"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Department
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-text-muted z-10 pointer-events-none" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-steel"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="HR">Human Resources</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Position / Job Title *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  name="position"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  className="pl-9 text-sm"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Annual Salary ($ USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  name="salary"
                  type="number"
                  placeholder="85000"
                  className="pl-9 text-sm"
                  value={formData.salary}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                System Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full h-10 px-3 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-steel"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin / Manager</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Join Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <Input
                  name="joinDate"
                  type="date"
                  className="pl-9 text-sm"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

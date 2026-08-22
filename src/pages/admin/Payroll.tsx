import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Payroll() {
  const { users } = useStore();

  const deptData = users.reduce((acc, user) => {
    const dept = user.department || 'Unassigned';
    const salary = user.salary || 0;
    if (!acc[dept]) acc[dept] = 0;
    acc[dept] += salary;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(deptData).map(key => ({
    name: key,
    total: deptData[key]
  }));

  const totalPayroll = Object.values(deptData).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-display font-semibold text-ink">Payroll Overview</h2>
          <p className="text-text-muted mt-1">Manage salaries and generate slips.</p>
        </div>
        <Button>Generate Slips</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Total Annual Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-display font-semibold tabular-nums text-steel">
              ${totalPayroll.toLocaleString()}
            </p>
            <p className="text-sm text-text-muted mt-2">Across {users.length} active employees.</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payroll by Department</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7EC" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#667085', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  tickFormatter={(val) => `$${val/1000}k`} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#667085', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#F2F4F7' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Salary']}
                />
                <Bar dataKey="total" fill="#2F6690" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Salaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider font-medium">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Annual Salary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map(user => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-ink">{user.name}</div>
                      <div className="text-text-muted text-xs">{user.position}</div>
                    </td>
                    <td className="py-3 px-4 text-text-muted">{user.department}</td>
                    <td className="py-3 px-4 text-right font-medium tabular-nums text-ink">
                      ${user.salary?.toLocaleString() || '0'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" className="text-steel">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

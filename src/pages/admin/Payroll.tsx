import { useStore, User } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useState } from 'react';
import { FileText, Download, CheckCircle2, Send, Printer, Calendar, DollarSign, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function Payroll() {
  const { users } = useStore();
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedUserSlip, setSelectedUserSlip] = useState<User | null>(null);
  const [payMonth, setPayMonth] = useState('2026-08');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
  const monthlyGrossTotal = Math.round(totalPayroll / 12);
  const monthlyTaxTotal = Math.round(monthlyGrossTotal * 0.15);
  const monthlyBenefitsTotal = Math.round(monthlyGrossTotal * 0.05);
  const monthlyNetTotal = monthlyGrossTotal - monthlyTaxTotal - monthlyBenefitsTotal;

  const handleGenerateBulkSlips = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsBulkModalOpen(false);
      setToastMessage(`Successfully generated and dispatched ${users.length} payslips for ${payMonth}!`);
      setTimeout(() => setToastMessage(null), 5000);
    }, 1200);
  };

  const calculateSlipBreakdown = (annualSalary: number = 0) => {
    const monthlyGross = annualSalary / 12;
    const tax = monthlyGross * 0.15;
    const health = monthlyGross * 0.05;
    const retirement = monthlyGross * 0.03;
    const net = monthlyGross - tax - health - retirement;
    return {
      monthlyGross,
      tax,
      health,
      retirement,
      net
    };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Banner */}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-display font-semibold text-ink">Payroll Overview</h2>
          <p className="text-text-muted mt-1">Manage salaries, calculate tax breakdown, and generate salary slips.</p>
        </div>
        <Button onClick={() => setIsBulkModalOpen(true)} className="gap-2 shrink-0">
          <FileText className="w-4 h-4" /> Generate Slips
        </Button>
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
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-text-muted">
              <span>Avg Salary:</span>
              <span className="font-semibold text-ink">
                ${users.length ? Math.round(totalPayroll / users.length).toLocaleString() : 0}/yr
              </span>
            </div>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employee Salaries & Payslips</CardTitle>
          <span className="text-xs text-text-muted">Click 'View Slip' to inspect individual pay stubs</span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-xs uppercase tracking-wider font-medium">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-right">Annual Salary</th>
                  <th className="py-3 px-4 text-right">Monthly Net</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map(user => {
                  const breakdown = calculateSlipBreakdown(user.salary || 0);
                  return (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-ink">{user.name}</div>
                        <div className="text-text-muted text-xs">{user.position}</div>
                      </td>
                      <td className="py-3 px-4 text-text-muted">{user.department}</td>
                      <td className="py-3 px-4 text-right font-medium tabular-nums text-ink">
                        ${user.salary?.toLocaleString() || '0'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium tabular-nums text-steel">
                        ${Math.round(breakdown.net).toLocaleString()}/mo
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-steel gap-1 hover:bg-sky/20"
                          onClick={() => setSelectedUserSlip(user)}
                        >
                          <FileText className="w-3.5 h-3.5" /> View Slip
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Payslips Generation Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Batch Generate Salary Slips"
        subtitle="Generate monthly payslips for all active employees."
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Select Pay Period Cycle
            </label>
            <div className="relative max-w-xs">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="month"
                value={payMonth}
                onChange={e => setPayMonth(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-steel"
              />
            </div>
          </div>

          {/* Batch Summary */}
          <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
            <h4 className="font-display font-semibold text-sm text-ink flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-steel" /> Batch Summary Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
              <div>
                <span className="text-text-muted block">Employees</span>
                <span className="font-bold text-base text-ink">{users.length}</span>
              </div>
              <div>
                <span className="text-text-muted block">Gross Monthly</span>
                <span className="font-bold text-base text-ink">${monthlyGrossTotal.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-text-muted block">Est. Tax & Benefits</span>
                <span className="font-bold text-base text-amber">-${(monthlyTaxTotal + monthlyBenefitsTotal).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-text-muted block">Total Net Disbursement</span>
                <span className="font-bold text-base text-steel">${monthlyNetTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-text-muted leading-relaxed">
            Generating payslips will compile official tax withholding statements, calculate benefit contributions, and prepare digital PDFs accessible in each employee's profile.
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsBulkModalOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerateBulkSlips} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>Processing Slips...</>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Generate & Dispatch All Slips
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Individual Employee Payslip Modal */}
      {selectedUserSlip && (
        <Modal
          isOpen={!!selectedUserSlip}
          onClose={() => setSelectedUserSlip(null)}
          title="Official Employee Payslip"
          subtitle={`Pay stub record for ${selectedUserSlip.name}`}
          maxWidth="xl"
        >
          {(() => {
            const breakdown = calculateSlipBreakdown(selectedUserSlip.salary || 0);
            return (
              <div className="space-y-6 print:p-0">
                {/* Header section of Payslip */}
                <div className="border border-border rounded-xl p-6 bg-surface space-y-4">
                  <div className="flex justify-between items-start pb-4 border-b border-border">
                    <div>
                      <h2 className="font-display font-bold text-xl text-steel">DAYFLOW HRMS</h2>
                      <p className="text-xs text-text-muted">Enterprise Payroll Statement</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-emerald-bg text-emerald text-xs font-semibold rounded-md">
                        PAID & VERIFIED
                      </span>
                      <p className="text-xs text-text-muted mt-1">Issue Date: {format(new Date(), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-text-muted uppercase font-semibold text-[10px]">Employee Name</p>
                      <p className="font-bold text-ink text-sm">{selectedUserSlip.name}</p>
                      <p className="text-text-muted mt-1">{selectedUserSlip.position}</p>
                    </div>
                    <div>
                      <p className="text-text-muted uppercase font-semibold text-[10px]">Department & ID</p>
                      <p className="font-bold text-ink text-sm">{selectedUserSlip.department}</p>
                      <p className="text-text-muted mt-1">ID: #{selectedUserSlip.id}</p>
                    </div>
                  </div>

                  {/* Earnings vs Deductions Table */}
                  <div className="mt-4 border rounded-lg overflow-hidden border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-canvas border-b border-border font-semibold text-text-muted uppercase">
                        <tr>
                          <th className="py-2.5 px-4">Description</th>
                          <th className="py-2.5 px-4 text-right">Earnings ($)</th>
                          <th className="py-2.5 px-4 text-right">Deductions ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        <tr>
                          <td className="py-2.5 px-4 font-medium text-ink">Base Monthly Salary</td>
                          <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-ink">
                            ${breakdown.monthlyGross.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-text-muted">-</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-text-muted">Income Tax Withholding (15%)</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-text-muted">-</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-brick font-medium">
                            -${breakdown.tax.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-text-muted">Health Insurance Contribution (5%)</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-text-muted">-</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-brick font-medium">
                            -${breakdown.health.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4 text-text-muted">Provident / Retirement Fund (3%)</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-text-muted">-</td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-brick font-medium">
                            -${breakdown.retirement.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-canvas/80 font-bold border-t border-border">
                        <tr>
                          <td className="py-3 px-4 text-ink font-display text-sm">Net Salary Disbursement</td>
                          <td colSpan={2} className="py-3 px-4 text-right text-steel font-display text-base tabular-nums">
                            ${breakdown.net.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center gap-3">
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" /> Print / Export PDF
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedUserSlip(null)}>
                      Close
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setToastMessage(`Payslip sent to ${selectedUserSlip.email}`);
                        setSelectedUserSlip(null);
                        setTimeout(() => setToastMessage(null), 4000);
                      }}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" /> Download Slip
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}

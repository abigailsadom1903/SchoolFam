import React, { useState, useRef } from 'react';
import { Download, CheckCircle, Clock, AlertTriangle, CreditCard, X, Wallet, Plus, Trash2, DollarSign, Users, Printer, Share2, ShieldCheck, RefreshCw, Upload, FileText, Building2, Eye, ExternalLink } from 'lucide-react';
import { Invoice, UserRole, SimpleStudent, User, BankDetails } from '../types';

interface BillingProps {
  invoices: Invoice[];
  userRole: UserRole;
  currentUser?: User; // Added currentUser prop
  students?: SimpleStudent[]; // Passed for Teacher/Admin role
  currentStudentId?: string; // Passed for Parent role
  bankDetails: BankDetails;
  onUpdateBankDetails?: (details: BankDetails) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: Invoice['status'], additionalData?: Partial<Invoice>) => void;
  onAddInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (id: string) => void;
}

// Extended type for Receipt display
interface ReceiptData extends Invoice {
  transactionId?: string;
  paymentDate?: string;
  paymentMethodDisplay?: string;
}

const Billing: React.FC<BillingProps> = ({ 
  invoices, 
  userRole, 
  currentUser, 
  students, 
  currentStudentId, 
  bankDetails,
  onUpdateBankDetails,
  onUpdateInvoiceStatus, 
  onAddInvoice, 
  onDeleteInvoice 
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Receipt State
  const [viewingReceipt, setViewingReceipt] = useState<ReceiptData | null>(null);
  
  // Payment Modal States
  const [activePaymentMethod, setActivePaymentMethod] = useState<'card' | 'transfer'>('card');
  const [uploadedReceiptFile, setUploadedReceiptFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Bank Edit State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [tempBankDetails, setTempBankDetails] = useState<BankDetails>(bankDetails);

  // Teacher Review Proof State
  const [viewingProof, setViewingProof] = useState<{ url: string, invoiceId: string } | null>(null);

  // Payment Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // Create Invoice State
  const [newInvTitle, setNewInvTitle] = useState('');
  const [newInvAmount, setNewInvAmount] = useState('');
  const [newInvStudentId, setNewInvStudentId] = useState(''); // 'all' or specific ID
  const [newInvDate, setNewInvDate] = useState('');

  // Permission Check
  const isStaff = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  // --- PARENT ACTION: SUBMIT PAYMENT ---
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (activePaymentMethod === 'transfer' && !proofUrl) {
      alert("Please upload a receipt for bank transfer.");
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call for payment processing
    setTimeout(() => {
      // Parent submits payment -> Status becomes 'verifying'
      onUpdateInvoiceStatus(selectedInvoice.id, 'verifying', {
        paymentMethod: activePaymentMethod,
        proofOfPaymentUrl: activePaymentMethod === 'transfer' ? (proofUrl || undefined) : undefined
      });

      setIsProcessing(false);
      setSelectedInvoice(null);
      // Reset form
      setCardNumber('');
      setExpiry('');
      setCvc('');
      setUploadedReceiptFile(null);
      setProofUrl(null);
      setActivePaymentMethod('card');
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedReceiptFile(file);
      // Mock creating a URL
      const mockUrl = URL.createObjectURL(file);
      setProofUrl(mockUrl);
    }
  };

  // --- TEACHER ACTION: CONFIRM PAYMENT ---
  const handleConfirmPayment = (invoice: Invoice) => {
    // 1. Update status to 'paid'
    onUpdateInvoiceStatus(invoice.id, 'paid');

    // 2. Generate Receipt immediately (in real app backend does this)
    const receipt: ReceiptData = {
      ...invoice,
      status: 'paid',
      transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      paymentDate: new Date().toLocaleString(),
      paymentMethodDisplay: invoice.paymentMethod === 'transfer' ? 'Bank Transfer' : 'Card Payment'
    };
    setViewingReceipt(receipt);
  };

  // --- TEACHER ACTION: REJECT PAYMENT ---
  const handleRejectPayment = (invoice: Invoice) => {
    // Revert to pending
    onUpdateInvoiceStatus(invoice.id, 'pending', { proofOfPaymentUrl: undefined, paymentMethod: undefined });
  };

  const handleViewReceipt = (invoice: Invoice) => {
    // Mock data for historical receipts since backend isn't storing txn IDs yet
    const receipt: ReceiptData = {
      ...invoice,
      transactionId: `TXN-${invoice.id.split('_')[1] || Math.floor(100000 + Math.random() * 900000)}`,
      paymentDate: new Date().toLocaleString(), // In real app, this would be the actual paid date
      paymentMethodDisplay: invoice.paymentMethod === 'transfer' ? 'Bank Transfer' : 'Card Payment'
    };
    setViewingReceipt(receipt);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddInvoice || !students) return;

    // Handle "All Students" case
    if (newInvStudentId === 'all') {
      const targetStudents = (userRole === UserRole.TEACHER && currentUser?.className)
         ? students.filter(s => (s as any).class === currentUser.className)
         : students;

      targetStudents.forEach((student) => {
        const newInvoice: Invoice = {
          id: 'inv_' + Date.now() + '_' + student.id,
          title: newInvTitle,
          amount: parseFloat(newInvAmount),
          studentName: student.name,
          studentId: student.id,
          dueDate: newInvDate,
          status: 'pending'
        };
        onAddInvoice(newInvoice);
      });
    } else {
      // Handle Single Student
      const selectedStudent = students.find(s => s.id === newInvStudentId);
      if (selectedStudent) {
        const newInvoice: Invoice = {
          id: 'inv_' + Date.now(),
          title: newInvTitle,
          amount: parseFloat(newInvAmount),
          studentName: selectedStudent.name,
          studentId: selectedStudent.id,
          dueDate: newInvDate,
          status: 'pending'
        };
        onAddInvoice(newInvoice);
      }
    }

    setIsCreateModalOpen(false);
    
    // Reset
    setNewInvTitle('');
    setNewInvAmount('');
    setNewInvStudentId('');
    setNewInvDate('');
  };

  // --- ADMIN ACTION: SAVE BANK DETAILS ---
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateBankDetails) {
      onUpdateBankDetails(tempBankDetails);
    }
    setIsBankModalOpen(false);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'verifying': return 'bg-blue-100 text-blue-700 animate-pulse';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  // Staff View (Teacher/Admin)
  if (isStaff) {
    const totalCollected = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
    const totalVerifying = invoices.filter(i => i.status === 'verifying').reduce((sum, i) => sum + i.amount, 0);

    const accessibleStudents = (userRole === UserRole.TEACHER && currentUser?.className)
      ? students?.filter(s => (s as any).class === currentUser.className)
      : students;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
           <div>
             <h2 className="text-2xl font-bold text-gray-800">Billing Management</h2>
             <p className="text-sm text-gray-500">{userRole === UserRole.TEACHER ? `Class: ${currentUser?.className}` : 'School Overview'}</p>
           </div>
           <div className="flex gap-2">
              {isAdmin && (
                <button 
                   onClick={() => { setTempBankDetails(bankDetails); setIsBankModalOpen(true); }}
                   className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-3 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all"
                >
                   <Building2 size={18} /> Bank Settings
                </button>
              )}
              <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus size={18} /> Create Invoice
              </button>
           </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <p className="text-gray-500 text-xs font-bold uppercase">Total Collected</p>
             <p className="text-2xl font-bold text-gray-800 mt-1">RM{totalCollected.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <p className="text-gray-500 text-xs font-bold uppercase">To Verify</p>
             <p className="text-2xl font-bold text-blue-600 mt-1">RM{totalVerifying.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <p className="text-gray-500 text-xs font-bold uppercase">Pending/Overdue</p>
             <p className="text-2xl font-bold text-orange-500 mt-1">RM{totalPending.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Invoice Status</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="text-right p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 group">
                  <td className="p-4 font-bold text-gray-800">{inv.studentName}</td>
                  <td className="p-4 text-gray-600">{inv.title}</td>
                  <td className="p-4 text-gray-800">RM{inv.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {inv.status === 'verifying' ? (
                      <div className="flex justify-end gap-2 items-center">
                        {inv.proofOfPaymentUrl && (
                          <button 
                            onClick={() => setViewingProof({ url: inv.proofOfPaymentUrl!, invoiceId: inv.id })}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Receipt"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleConfirmPayment(inv)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors shadow-sm"
                          title="Confirm Payment"
                        >
                          <CheckCircle size={14} /> Confirm
                        </button>
                        <button 
                          onClick={() => handleRejectPayment(inv)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors"
                          title="Reject Payment"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {inv.status === 'paid' && (
                           <button 
                             onClick={() => handleViewReceipt(inv)}
                             className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                             title="View Receipt"
                           >
                             <Printer size={18} />
                           </button>
                        )}
                        {onDeleteInvoice && (
                          <button 
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Reuse Create Modal & Receipt Modal logic from below/original if needed, keeping them in sync */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Create New Invoice</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student</label>
                  <div className="relative">
                    <select
                      required
                      value={newInvStudentId}
                      onChange={e => setNewInvStudentId(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none appearance-none"
                    >
                      <option value="">Select Student</option>
                      <option value="all">All Students (Bulk Create)</option>
                      {accessibleStudents?.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <Users size={16} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                  <input 
                    required
                    type="text" 
                    value={newInvTitle}
                    onChange={e => setNewInvTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. Field Trip Fee"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (RM)</label>
                    <div className="relative">
                      <input 
                        required
                        type="number" 
                        value={newInvAmount}
                        onChange={e => setNewInvAmount(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="0.00"
                      />
                      <span className="absolute left-3 top-3.5 text-gray-400 text-xs font-bold">RM</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
                    <input 
                      required
                      type="date" 
                      value={newInvDate}
                      onChange={e => setNewInvDate(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                  >
                    Create Invoice{newInvStudentId === 'all' ? 's' : ''}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bank Settings Modal (Admin) */}
        {isBankModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                   <h3 className="text-lg font-bold text-gray-800">Bank Transfer Settings</h3>
                   <button onClick={() => setIsBankModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} className="text-gray-500"/></button>
                </div>
                
                <form onSubmit={handleSaveBankDetails} className="p-6 space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bank Name</label>
                      <input 
                         required
                         type="text" 
                         value={tempBankDetails.bankName}
                         onChange={e => setTempBankDetails({...tempBankDetails, bankName: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Holder Name</label>
                      <input 
                         required
                         type="text" 
                         value={tempBankDetails.accountName}
                         onChange={e => setTempBankDetails({...tempBankDetails, accountName: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Number</label>
                      <input 
                         required
                         type="text" 
                         value={tempBankDetails.accountNumber}
                         onChange={e => setTempBankDetails({...tempBankDetails, accountNumber: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                   </div>
                   
                   <div className="pt-2">
                      <button 
                         type="submit"
                         className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
                      >
                         Save Bank Details
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {/* Viewing Proof Modal */}
        {viewingProof && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                   <h3 className="font-bold text-gray-800">Proof of Payment</h3>
                   <button onClick={() => setViewingProof(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                </div>
                <div className="p-4 flex-1 overflow-auto bg-gray-100 flex justify-center">
                   <img src={viewingProof.url} alt="Proof" className="max-w-full h-auto rounded-lg shadow-sm" />
                </div>
                <div className="p-4 bg-white border-t flex justify-end gap-2">
                   <a href={viewingProof.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700">
                      <ExternalLink size={16} /> Open in New Tab
                   </a>
                   <button onClick={() => setViewingProof(null)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold">Close</button>
                </div>
             </div>
          </div>
        )}

        {/* Receipt Viewer Reuse */}
        {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-100 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
             <button 
                onClick={() => setViewingReceipt(null)}
                className="absolute top-4 right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 z-10 transition-colors"
             >
                <X size={18} />
             </button>

             {/* Receipt Paper Effect */}
             <div className="bg-white m-4 rounded-xl shadow-sm p-6 relative overflow-hidden">
                <div className="text-center border-b-2 border-dashed border-gray-200 pb-6 mb-6">
                   <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle size={24} />
                   </div>
                   <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest">Receipt</h3>
                   <p className="text-xs text-gray-400 mt-1 font-mono">SchoolFam Payment System</p>
                </div>

                <div className="space-y-4 mb-6">
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Date</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">{viewingReceipt.paymentDate?.split(',')[0]}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Time</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">{viewingReceipt.paymentDate?.split(',')[1]}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Transaction ID</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">{viewingReceipt.transactionId}</span>
                   </div>
                   <div className="border-t border-dashed border-gray-200 my-2"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Billed To</span>
                      <span className="text-xs font-bold text-gray-800 text-right">{currentUser?.name}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Student</span>
                      <span className="text-xs font-bold text-gray-800 text-right">{viewingReceipt.studentName}</span>
                   </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                         <p className="text-sm font-bold text-gray-800">{viewingReceipt.title}</p>
                         <p className="text-[10px] text-gray-500">Tuition & Fees</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800">RM{viewingReceipt.amount.toFixed(2)}</p>
                   </div>
                   <div className="border-t border-gray-200 my-2"></div>
                   <div className="flex justify-between items-center">
                      <p className="text-sm font-black text-gray-900 uppercase">Total Paid</p>
                      <p className="text-xl font-black text-primary">RM{viewingReceipt.amount.toFixed(2)}</p>
                   </div>
                </div>

                <div className="text-center">
                   <p className="text-[10px] text-gray-400 mb-4 flex items-center justify-center gap-1">
                      <CreditCard size={10} /> Paid via {viewingReceipt.paymentMethodDisplay || 'Online Payment'}
                   </p>
                   <button 
                      onClick={() => alert("Printing Receipt...")} 
                      className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                   >
                      <Download size={16} /> Download Receipt
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
      </div>
    );
  }

  // Parent View (Filtered)
  const myInvoices = invoices.filter(i => i.studentId === currentStudentId);
  const outstandingBalance = myInvoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
           <div>
             <h2 className="text-2xl font-bold text-gray-800">Billing & Payments</h2>
             <p className="text-sm text-gray-500">Manage school fees securely</p>
           </div>
           <div className="w-12 h-12 bg-cuteBlue rounded-full flex items-center justify-center text-primary shadow-sm">
             <Wallet size={24} />
           </div>
        </div>
        
        <div className={`flex-1 p-6 rounded-3xl shadow-sm border flex flex-col justify-center ${outstandingBalance > 0 ? 'bg-rose-50 border-rose-200 ring-1 ring-rose-100' : 'bg-green-50 border-green-100'}`}>
           <p className={`text-xs font-bold uppercase ${outstandingBalance > 0 ? 'text-rose-500' : 'text-green-500'}`}>Outstanding Balance</p>
           <div className="flex items-end gap-2 mt-1">
             <span className={`text-3xl font-bold ${outstandingBalance > 0 ? 'text-rose-600' : 'text-green-600'}`}>RM{outstandingBalance.toFixed(2)}</span>
             {outstandingBalance === 0 && <span className="text-green-600 font-bold text-sm mb-1 flex items-center gap-1"><CheckCircle size={14}/> All paid</span>}
           </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30">
           <h3 className="text-lg font-bold text-gray-800">Invoice History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {myInvoices.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <CheckCircle className="mx-auto mb-2 text-green-400" size={32} />
              <p>No invoices found.</p>
            </div>
          ) : (
            myInvoices.map((invoice) => (
              <div key={invoice.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-3 rounded-2xl ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-600' :
                    invoice.status === 'verifying' ? 'bg-blue-100 text-blue-600' :
                    invoice.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {invoice.status === 'paid' ? <CheckCircle size={24} /> : 
                     invoice.status === 'verifying' ? <RefreshCw size={24} className="animate-spin-slow" /> :
                     invoice.status === 'pending' ? <Clock size={24} /> : 
                     <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{invoice.title}</h3>
                    <div className="flex gap-2 text-sm text-gray-500">
                       <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                       <span>•</span>
                       <span>ID: #{invoice.id.slice(-6)}</span>
                    </div>
                    {invoice.status === 'verifying' && (
                      <p className="text-xs text-blue-600 font-bold mt-1">Payment submitted via {invoice.paymentMethod === 'transfer' ? 'Transfer' : 'Card'}. Waiting for confirmation.</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 sm:justify-end w-full sm:w-auto pl-16 sm:pl-0">
                  <span className="font-bold text-xl text-gray-800">RM{invoice.amount.toFixed(2)}</span>
                  {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                    <button 
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setProofUrl(null);
                        setUploadedReceiptFile(null);
                        setActivePaymentMethod('card');
                      }}
                      className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                    >
                      Pay Now
                    </button>
                  ) : invoice.status === 'verifying' ? (
                    <button 
                      disabled
                      className="px-6 py-3 bg-blue-100 text-blue-500 text-sm font-bold rounded-xl cursor-not-allowed"
                    >
                      Processing...
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleViewReceipt(invoice)}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
                      title="View Receipt"
                    >
                      <Printer size={16} /> Receipt
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-gray-900 p-6 text-white flex justify-between items-start">
               <div>
                 <h3 className="text-xl font-bold">Secure Payment</h3>
                 <p className="text-gray-400 text-sm mt-1">{selectedInvoice.title}</p>
                 <p className="text-2xl font-bold mt-2">RM{selectedInvoice.amount.toFixed(2)}</p>
               </div>
               <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-white">
                 <X size={24} />
               </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-6">
              
              {/* Payment Method Switcher */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                 <button
                   type="button"
                   onClick={() => setActivePaymentMethod('card')}
                   className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activePaymentMethod === 'card' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   <CreditCard size={16} /> Card
                 </button>
                 <button
                   type="button"
                   onClick={() => setActivePaymentMethod('transfer')}
                   className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activePaymentMethod === 'transfer' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   <Building2 size={16} /> Transfer
                 </button>
              </div>

              {activePaymentMethod === 'card' ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <CreditCard className="text-gray-800" size={24} />
                    </div>
                    <span className="font-bold text-gray-700">Debit / Credit Card</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                    <input 
                      required
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                      <input 
                        required
                        type="text" 
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVC</label>
                      <input 
                        required
                        type="text" 
                        placeholder="123"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                      <p className="text-xs font-bold text-blue-800 uppercase mb-2">School Bank Details</p>
                      <div className="space-y-1 text-sm text-blue-900">
                         <p><span className="font-bold">Bank:</span> {bankDetails.bankName}</p>
                         <p><span className="font-bold">Account Name:</span> {bankDetails.accountName}</p>
                         <div className="flex items-center gap-2">
                            <span className="font-bold">Account No:</span> 
                            <code className="font-mono bg-blue-100 px-1 rounded">{bankDetails.accountNumber}</code>
                         </div>
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Receipt</label>
                      
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileUpload}
                            accept="image/*,.pdf"
                         />
                         {uploadedReceiptFile ? (
                           <>
                             <FileText size={32} className="mb-2 text-green-500" />
                             <p className="text-sm font-bold text-green-600 text-center">{uploadedReceiptFile.name}</p>
                             <p className="text-xs text-gray-400 mt-1">Click to change</p>
                           </>
                         ) : (
                           <>
                             <Upload size={32} className="mb-2" />
                             <p className="text-sm font-medium text-center">Tap to upload receipt</p>
                             <p className="text-xs mt-1">Image or PDF</p>
                           </>
                         )}
                      </div>
                   </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all mt-6 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'}`}
              >
                {isProcessing ? 'Submitting...' : activePaymentMethod === 'transfer' ? 'Submit Receipt' : 'Pay Now'}
              </button>

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 mt-4">
                <ShieldCheck size={12} /> {activePaymentMethod === 'transfer' ? 'Receipt verified by admin manually' : 'Secure 256-bit SSL Encrypted Payment'}
              </p>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-100 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
             <button 
                onClick={() => setViewingReceipt(null)}
                className="absolute top-4 right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600 z-10 transition-colors"
             >
                <X size={18} />
             </button>

             {/* Receipt Paper Effect */}
             <div className="bg-white m-4 rounded-xl shadow-sm p-6 relative overflow-hidden">
                <div className="text-center border-b-2 border-dashed border-gray-200 pb-6 mb-6">
                   <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle size={24} />
                   </div>
                   <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest">Receipt</h3>
                   <p className="text-xs text-gray-400 mt-1 font-mono">SchoolFam Payment System</p>
                </div>

                <div className="space-y-4 mb-6">
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Date</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">{viewingReceipt.paymentDate?.split(',')[0]}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Time</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">{viewingReceipt.paymentDate?.split(',')[1]}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Transaction ID</span>
                      <span className="text-xs font-bold text-gray-800 font-mono">{viewingReceipt.transactionId}</span>
                   </div>
                   <div className="border-t border-dashed border-gray-200 my-2"></div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Billed To</span>
                      <span className="text-xs font-bold text-gray-800 text-right">{currentUser?.name}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold uppercase">Student</span>
                      <span className="text-xs font-bold text-gray-800 text-right">{viewingReceipt.studentName}</span>
                   </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                         <p className="text-sm font-bold text-gray-800">{viewingReceipt.title}</p>
                         <p className="text-[10px] text-gray-500">Tuition & Fees</p>
                      </div>
                      <p className="text-sm font-bold text-gray-800">RM{viewingReceipt.amount.toFixed(2)}</p>
                   </div>
                   <div className="border-t border-gray-200 my-2"></div>
                   <div className="flex justify-between items-center">
                      <p className="text-sm font-black text-gray-900 uppercase">Total Paid</p>
                      <p className="text-xl font-black text-primary">RM{viewingReceipt.amount.toFixed(2)}</p>
                   </div>
                </div>

                <div className="text-center">
                   <p className="text-[10px] text-gray-400 mb-4 flex items-center justify-center gap-1">
                      <CreditCard size={10} /> Paid via {viewingReceipt.paymentMethodDisplay || 'Online Payment'}
                   </p>
                   <button 
                      onClick={() => alert("Printing Receipt...")} 
                      className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                   >
                      <Download size={16} /> Download Receipt
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
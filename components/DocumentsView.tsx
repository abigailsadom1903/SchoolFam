

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  FolderOpen, 
  FileCheck, 
  ShieldAlert, 
  Plus, 
  X, 
  Trash2, 
  Upload, 
  PenTool, 
  CheckCircle, 
  Type, 
  Eraser,
  User as UserIcon,
  Users
} from 'lucide-react';
import { SchoolDocument, UserRole, User, Child } from '../types';

interface DocumentsViewProps {
  documents: SchoolDocument[];
  userRole: UserRole;
  currentUser?: User;
  students?: Child[]; // For assigning documents
  onAddDocument?: (doc: SchoolDocument) => void;
  onDeleteDocument?: (id: string) => void;
  onSignDocument?: (id: string) => void;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ 
  documents, 
  userRole, 
  currentUser,
  students,
  onAddDocument, 
  onDeleteDocument, 
  onSignDocument 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<SchoolDocument['type']>('report');
  const [selectedStudentId, setSelectedStudentId] = useState('all');

  // Signing State
  const [signingDocId, setSigningDocId] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const [signMethod, setSignMethod] = useState<'draw' | 'type'>('draw');
  
  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  
  // File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  // Permission Check
  const canManage = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  // Filter accessible students
  const accessibleStudents = (userRole === UserRole.TEACHER && currentUser?.className)
    ? students?.filter(s => s.class === currentUser.className)
    : students;

  // Reset state when opening sign modal
  useEffect(() => {
    if (signingDocId) {
      setSignatureName('');
      setHasDrawn(false);
      setSignMethod('draw');
      // Small timeout to allow modal to render before accessing canvas
      setTimeout(clearCanvas, 100);
    }
  }, [signingDocId]);

  const getIcon = (type: SchoolDocument['type']) => {
    switch (type) {
      case 'report': return <FileCheck className="text-blue-500" size={24} />;
      case 'form': return <FileText className="text-orange-500" size={24} />;
      case 'policy': return <ShieldAlert className="text-purple-500" size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddDocument) return;

    const studentInfo = accessibleStudents?.find(s => s.id === selectedStudentId);

    const newDoc: SchoolDocument = {
      id: 'doc_' + Date.now(),
      title,
      type,
      date: new Date().toISOString().split('T')[0],
      size: '150 KB', // Mock size
      downloadUrl: '#',
      requiresSignature: type === 'form', // Mock logic: forms usually need signatures
      studentId: selectedStudentId !== 'all' ? selectedStudentId : undefined,
      studentName: selectedStudentId !== 'all' ? studentInfo?.name : undefined
    };

    onAddDocument(newDoc);
    setIsModalOpen(false);
    setTitle('');
    setType('report');
    setFileName('');
    setSelectedStudentId('all');
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  // --- Signature Canvas Logic ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };
  // -----------------------------

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSignDocument || !signingDocId) return;

    // Validation
    if (signMethod === 'type' && !signatureName.trim()) return;
    if (signMethod === 'draw' && !hasDrawn) return;

    setIsSignProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
      onSignDocument(signingDocId);
      setIsSignProcessing(false);
      setSigningDocId(null);
      setSignatureName('');
      setHasDrawn(false);
    }, 1500);
  };

  const pendingSignatures = documents.filter(d => d.requiresSignature && !d.isSigned).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Stats & Actions */}
      <div className="flex justify-between items-end">
        <div className="hidden md:block">
          <h2 className="text-2xl font-bold text-gray-800">Documents</h2>
          <p className="text-gray-500">Access reports, forms, and policies</p>
        </div>
        {canManage && (
           <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
           >
             <Upload size={18} /> Upload File
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
          <FolderOpen className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
          <p className="text-blue-100 font-medium mb-1">Total Documents</p>
          <h3 className="text-3xl font-bold">{documents.length}</h3>
        </div>
         <div className={`rounded-3xl p-6 border shadow-sm flex items-center gap-4 transition-colors ${pendingSignatures > 0 ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-100'}`}>
           <div className={`p-3 rounded-xl ${pendingSignatures > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
             <PenTool size={24} />
           </div>
           <div>
             <p className="text-gray-500 text-sm">Action Required</p>
             <h3 className={`text-xl font-bold ${pendingSignatures > 0 ? 'text-orange-600' : 'text-gray-800'}`}>
               {pendingSignatures} Pending Signature{pendingSignatures !== 1 ? 's' : ''}
             </h3>
           </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
           <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
             <ShieldAlert size={24} />
           </div>
           <div>
             <p className="text-gray-500 text-sm">School Policies</p>
             <h3 className="text-xl font-bold text-gray-800">Updated Oct 2023</h3>
           </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Recent Files</h2>
          <select className="bg-gray-50 border-none text-sm rounded-lg px-3 py-2 font-medium text-gray-600 outline-none">
            <option>All Categories</option>
            <option>Report Cards</option>
            <option>Forms</option>
          </select>
        </div>
        
        <div className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-white group-hover:shadow-sm transition-all border border-gray-100">
                  {getIcon(doc.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800">{doc.title}</h3>
                    {doc.studentName && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 font-bold flex items-center gap-1">
                        <UserIcon size={10} /> {doc.studentName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1 items-center">
                    <span className="uppercase font-semibold tracking-wider bg-gray-100 px-2 py-0.5 rounded">{doc.type}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    
                    {/* Signature Status Badges */}
                    {doc.requiresSignature && !doc.isSigned && (
                       <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg font-bold border border-amber-200">
                         <PenTool size={12} /> Sign Pending
                       </span>
                    )}
                    {doc.requiresSignature && doc.isSigned && (
                       <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-200 shadow-sm">
                         <CheckCircle size={12} /> Signed {doc.signedDate}
                       </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 items-center self-end sm:self-auto">
                {/* Sign Button for Parents */}
                {doc.requiresSignature && !doc.isSigned && onSignDocument && userRole === UserRole.PARENT && (
                  <button 
                    onClick={() => setSigningDocId(doc.id)}
                    className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-md shadow-orange-200 animate-pulse"
                  >
                    Sign Now
                  </button>
                )}

                <button className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors" title="Download">
                  <Download size={20} />
                </button>
                {canManage && onDeleteDocument && (
                  <button 
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" 
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Upload Document</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Document Title</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Term 1 Report"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as SchoolDocument['type'])}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="report">Report Card</option>
                    <option value="form">Form</option>
                    <option value="policy">Policy</option>
                  </select>
                </div>
                {/* Student Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student</label>
                  <select 
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">General (All)</option>
                    {accessibleStudents?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                 <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                 <Upload size={32} className="mb-2" />
                 <p className="text-sm font-medium">{fileName || "Click to select file"}</p>
                 <p className="text-xs mt-1">PDF, JPG, PNG up to 5MB</p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Sign Document Modal */}
      {signingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <PenTool size={20} className="text-primary"/> Digital Signature
              </h3>
              <button onClick={() => setSigningDocId(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                <ShieldAlert className="text-blue-500 shrink-0" size={24} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">You are signing: <span className="font-bold">{documents.find(d => d.id === signingDocId)?.title}</span></p>
                  <p className="text-xs opacity-70 mt-0.5">This action is legally binding and recorded.</p>
                </div>
              </div>

              {/* Toggle Method */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                 <button 
                   onClick={() => setSignMethod('draw')}
                   className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${signMethod === 'draw' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                 >
                   <PenTool size={14} /> Draw Signature
                 </button>
                 <button 
                   onClick={() => setSignMethod('type')}
                   className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${signMethod === 'type' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                 >
                   <Type size={14} /> Type Signature
                 </button>
              </div>

              {/* Draw Pad */}
              {signMethod === 'draw' && (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50 text-center relative">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Draw in the box below</p>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden mx-auto border border-gray-200 cursor-crosshair touch-none">
                    <canvas 
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="w-full h-full"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={clearCanvas} 
                    className="absolute top-4 right-4 text-xs text-gray-400 hover:text-red-500 font-bold flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200"
                  >
                    <Eraser size={12} /> Clear
                  </button>
                </div>
              )}

              {/* Type Input */}
              {signMethod === 'type' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={signatureName}
                    onChange={e => setSignatureName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary focus:outline-none font-serif italic text-2xl text-center"
                    placeholder="John Doe"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 text-center">Your name will be converted to a digital signature.</p>
                </div>
              )}

              <div className="flex items-center gap-3 py-2">
                 <input type="checkbox" required id="consent" className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer" />
                 <label htmlFor="consent" className="text-xs text-gray-600 cursor-pointer select-none">I confirm that I have read and understood the document.</label>
              </div>
            </div>

            {/* Fixed Footer for Action */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
               <button 
                  onClick={handleSignSubmit}
                  disabled={isSignProcessing || (signMethod === 'type' ? !signatureName.trim() : !hasDrawn)}
                  className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isSignProcessing || (signMethod === 'type' ? !signatureName.trim() : !hasDrawn)
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
                  }`}
                >
                  {isSignProcessing ? 'Signing Document...' : 'Complete Signature'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView;
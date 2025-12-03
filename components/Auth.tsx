
import React, { useState } from 'react';
import { UserRole } from '../types';
import { User, Briefcase, GraduationCap, ArrowRight, HeartHandshake, ShieldCheck, Lock, ArrowLeft, Mail, Key, Shield, Ticket, Hash } from 'lucide-react';

interface AuthProps {
  onLogin: (role: UserRole, data: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.PARENT);
  const [step, setStep] = useState(1); // For Registration Wizard
  
  // Account Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Parent Registration Specific
  const [accessCode, setAccessCode] = useState(''); // Secure linkage
  
  // Common for Teacher Registration
  const [referralCode, setReferralCode] = useState('');

  // Super Admin Registration Specific
  const [masterKey, setMasterKey] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate Login Fetch
    let derivedName = "User";
    if (email === 'sarah@example.com') derivedName = 'Sarah Anderson';
    else if (email === 'jennifer@schoolfam.com') derivedName = 'Mrs. Jennifer Davis';
    else if (email === 'director@schoolfam.com') derivedName = 'Director Thompson';
    else {
      // Mock name generation
      const emailName = email.split('@')[0];
      derivedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    onLogin(role, {
      name: derivedName,
      email,
      isLogin: true
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare Registration Payload
    const authData = {
      name,
      email,
      password,
      isLogin: false,
      // Teacher specific referral code
      referralCode: role === UserRole.TEACHER ? referralCode : undefined,
      // Parent Data - ONLY send accessCode
      child: role === UserRole.PARENT ? {
        accessCode: accessCode
      } : undefined,
      // Super Admin Data
      masterKey: role === UserRole.SUPER_ADMIN ? masterKey : undefined
    };

    onLogin(role, authData);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cutePink via-white to-cuteBlue flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-primary p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="relative z-10">
             <div className="w-16 h-16 bg-white text-primary rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold mb-4 shadow-lg shadow-primary/30">
               <HeartHandshake size={32} />
             </div>
             <h1 className="text-2xl font-bold text-white">SchoolFam Portal</h1>
             <p className="text-primaryLight mt-2 text-sm">Where Education Communication Meets Convenience</p>
           </div>
        </div>

        <div className="p-8">
          {/* Toggle Login/Signup */}
          <div className="flex border-b border-gray-100 mb-6">
             <button 
              onClick={() => { setIsLogin(true); setStep(1); }}
              className={`flex-1 pb-3 text-sm font-bold transition-all ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Sign In
             </button>
             <button 
              onClick={() => { setIsLogin(false); setStep(1); }}
              className={`flex-1 pb-3 text-sm font-bold transition-all ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Sign Up
             </button>
          </div>

          {/* Role Selection (Visible for both Sign In and Sign Up Step 1) */}
          {(isLogin || step === 1) && (
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
              <button 
                type="button"
                onClick={() => setRole(UserRole.PARENT)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${role === UserRole.PARENT ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
              >
                <User size={14} /> Parent
              </button>
              <button 
                type="button"
                onClick={() => setRole(UserRole.TEACHER)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${role === UserRole.TEACHER ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
              >
                <Briefcase size={14} /> Teacher
              </button>
              <button 
                type="button"
                onClick={() => setRole(UserRole.SUPER_ADMIN)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${role === UserRole.SUPER_ADMIN ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
              >
                <ShieldCheck size={14} /> Admin
              </button>
            </div>
          )}

          {/* --- LOGIN FORM --- */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                   <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="name@example.com"
                  />
                  <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <div className="relative">
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="••••••••"
                  />
                  <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div className="text-right">
                 <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 flex items-center justify-center gap-2 mt-2"
              >
                Sign In as {role === UserRole.SUPER_ADMIN ? 'Admin' : role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()} <ArrowRight size={20} />
              </button>
              
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-xl flex items-start gap-2">
                 <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                 <p>Secure login. Teachers & Staff must use verified school credentials.</p>
              </div>
            </form>
          ) : (
            /* --- REGISTRATION FORM --- */
            <form onSubmit={handleRegisterSubmit} className="animate-in fade-in slide-in-from-right-4">
              
              {/* STEP 1: Account Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="email@domain.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Create Password</label>
                    <input 
                      required
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={nextStep}
                    disabled={!name || !email || !password}
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-50 mt-4"
                  >
                    Continue <ArrowRight size={18} className="inline ml-1" />
                  </button>
                </div>
              )}

              {/* STEP 2: PARENT - Student Access Code Only */}
              {step === 2 && role === UserRole.PARENT && (
                <div className="space-y-6">
                  
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="text-primary" /> Student Verification
                  </h3>
                  
                  <div className="bg-yellow-50 p-6 rounded-3xl border-2 border-yellow-100 space-y-4">
                     <p className="text-sm text-yellow-800 leading-relaxed">
                       Please enter the unique <strong>Student Access Code</strong> provided by the school administrator or on the student's profile card.
                     </p>
                     
                     <div>
                       <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">Student Access Code</label>
                       <div className="relative">
                         <input 
                           required
                           type="text" 
                           value={accessCode}
                           onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                           className="w-full bg-white border-2 border-yellow-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none font-mono uppercase tracking-widest text-lg font-bold text-gray-800"
                           placeholder="STU-XXXX"
                         />
                         <Key size={20} className="absolute left-3 top-3.5 text-yellow-400" />
                       </div>
                     </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button type="button" onClick={prevStep} className="px-4 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100"><ArrowLeft size={20}/></button>
                     <button type="submit" className="flex-1 bg-primary text-white font-bold py-3 rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                       Link Profile & Sign Up
                     </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TEACHER - Verification & Referral */}
              {step === 2 && role === UserRole.TEACHER && (
                 <div className="space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                           <Ticket size={32} className="text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Staff Verification</h3>
                        <p className="text-xs text-gray-500 mt-1">Authorized Personnel Only</p>
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-3xl border-2 border-purple-100 relative">
                      <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                         REQUIRED
                      </div>
                      <label className="block text-xs font-bold text-purple-700 uppercase mb-2">System Enrollment Code</label>
                      <div className="relative">
                        <input 
                          required
                          type="text" 
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          className="w-full bg-white border-2 border-purple-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-purple-200 focus:border-purple-400 focus:outline-none font-mono uppercase tracking-widest text-lg font-bold text-gray-800 text-center shadow-sm"
                          placeholder="T_XXXX"
                        />
                        <Hash size={24} className="absolute left-4 top-4 text-purple-300" />
                      </div>
                      <p className="text-[10px] text-purple-600 mt-3 font-medium flex items-start gap-1">
                         <ShieldCheck size={12} className="shrink-0 mt-0.5" />
                         Enter the code found on your Staff Profile created by the Administrator to claim your account.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                     <button type="button" onClick={prevStep} className="px-4 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100"><ArrowLeft size={20}/></button>
                     <button type="submit" className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-2xl hover:bg-black transition-colors shadow-lg shadow-gray-400">
                       Verify & Claim Account
                     </button>
                    </div>
                 </div>
              )}

              {/* STEP 2: SUPER ADMIN - Verification */}
              {step === 2 && role === UserRole.SUPER_ADMIN && (
                 <div className="space-y-6">
                    <div className="text-center mb-4">
                       <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-gray-400">
                          <Shield size={32} className="text-white" />
                       </div>
                       <h3 className="text-lg font-bold text-gray-800">Super Admin Access</h3>
                       <p className="text-gray-500 text-xs mt-1">Authorized Personnel Only</p>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                      <label className="block text-xs font-bold text-red-700 uppercase mb-1">System Master Key</label>
                      <div className="relative">
                        <input 
                          required
                          type="password" 
                          value={masterKey}
                          onChange={(e) => setMasterKey(e.target.value)}
                          className="w-full bg-white border border-red-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
                          placeholder="Enter master key"
                        />
                        <ShieldCheck size={18} className="absolute left-3 top-3.5 text-red-400" />
                      </div>
                      <p className="text-[10px] text-red-600 mt-2 font-medium">Warning: Unauthorized access attempts are logged.</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                     <button type="button" onClick={prevStep} className="px-4 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100"><ArrowLeft size={20}/></button>
                     <button type="submit" className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-2xl hover:bg-black transition-colors shadow-lg shadow-gray-400">
                       Verify & Create Admin
                     </button>
                    </div>
                 </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

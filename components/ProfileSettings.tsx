import React, { useState, useEffect, useRef } from 'react';
import { User, Child, UserRole, ReferralCode } from '../types';
import { Save, User as UserIcon, Phone, MapPin, Heart, AlertCircle, ShieldAlert, Camera, CheckCircle, Edit2, X, Mail, Plus, Users, Key, Copy, Clock, ShieldCheck, Info } from 'lucide-react';

interface ProfileSettingsProps {
  currentUser: User;
  currentChild?: Child;
  referralCodes?: ReferralCode[]; // Add referralCodes
  onUpdateUser: (updatedUser: User) => void;
  onUpdateChild?: (updatedChild: Child) => void;
  onAddChild?: (childData: Partial<Child> & { gender?: 'boy' | 'girl' }) => void;
  onGenerateReferralCode?: (role: UserRole) => void; // Add handler
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, currentChild, referralCodes, onUpdateUser, onUpdateChild, onAddChild, onGenerateReferralCode }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'child' | 'system'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // User Form State
  const [userName, setUserName] = useState(currentUser.name);
  const [userEmail, setUserEmail] = useState(currentUser.email || '');
  const [userPhone, setUserPhone] = useState(currentUser.phone || '');
  const [userAddress, setUserAddress] = useState(currentUser.address || '');
  const [userAvatar, setUserAvatar] = useState(currentUser.avatarUrl);

  // Child Form State
  const [childConditions, setChildConditions] = useState('');
  const [childAllergies, setChildAllergies] = useState('');
  const [childBloodType, setChildBloodType] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  
  // File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data when child changes
  useEffect(() => {
    if (currentChild) {
      setChildConditions(currentChild.medicalConditions || '');
      setChildAllergies(currentChild.allergies || '');
      setChildBloodType(currentChild.bloodType || '');
      setEmergencyName(currentChild.emergencyContact?.name || '');
      setEmergencyPhone(currentChild.emergencyContact?.phone || '');
      setEmergencyRelation(currentChild.emergencyContact?.relation || '');
    }
    setUserName(currentUser.name);
    setUserEmail(currentUser.email || '');
    setUserPhone(currentUser.phone || '');
    setUserAddress(currentUser.address || '');
    setUserAvatar(currentUser.avatarUrl);
  }, [currentChild, currentUser]);

  // Reset edit state when tab changes
  useEffect(() => {
    setIsEditing(false);
    setShowSuccess(false);
  }, [activeTab]);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name: userName,
      email: userEmail,
      phone: userPhone,
      address: userAddress,
      avatarUrl: userAvatar
    };
    onUpdateUser(updatedUser);
    setIsEditing(false);
    showSuccessMessage();
  };

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChild || !onUpdateChild) return;

    const updatedChild: Child = {
      ...currentChild,
      medicalConditions: childConditions,
      allergies: childAllergies,
      bloodType: childBloodType,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation
      }
    };
    onUpdateChild(updatedChild);
    setIsEditing(false);
    showSuccessMessage();
  };
  
  const handleProfilePicUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (activeTab === 'personal') {
           setUserAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={activeTab === 'personal' || activeTab === 'system' ? userAvatar : (currentChild?.avatarUrl || currentUser.avatarUrl)} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
              />
              {isEditing && activeTab === 'personal' && (
                <>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleProfilePicUpdate} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute bottom-0 right-0 bg-gray-800 text-white p-1.5 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    <Camera size={14} />
                  </button>
                </>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {activeTab === 'child' ? (currentChild?.name || 'Child Profile') : userName}
              </h2>
              <p className="text-gray-500 text-sm capitalize">
                {activeTab === 'child' ? `${currentChild?.class || ''} Student` : currentUser.role.replace('_', ' ').toLowerCase()}
              </p>
              {activeTab === 'child' && currentChild && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mt-1 inline-block">
                  Code: {currentChild.accessCode || 'N/A'}
                </span>
              )}
            </div>
         </div>

         <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto max-w-full">
            <button 
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'personal' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              My Profile
            </button>
            {currentUser.role === UserRole.PARENT && (
              <button 
                onClick={() => setActiveTab('child')}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'child' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Child Profile
              </button>
            )}
            {currentUser.role === UserRole.SUPER_ADMIN && (
              <button 
                onClick={() => setActiveTab('system')}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                System Access
              </button>
            )}
         </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={20} />
          <span className="font-bold">Changes saved successfully!</span>
        </div>
      )}

      {/* Content Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">
            {activeTab === 'personal' ? 'Personal Information' : activeTab === 'system' ? 'Access Management' : 'Medical & Emergency Info'}
          </h3>
          <div className="flex gap-2">
            {!isEditing && activeTab !== 'system' ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Edit2 size={16} /> Edit
                </button>
              </>
            ) : isEditing ? (
               <button 
                onClick={() => { setIsEditing(false); setUserAvatar(currentUser.avatarUrl); }}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <X size={16} /> Cancel
              </button>
            ) : null}
          </div>
        </div>

        <div className="p-6 md:p-8">
           {activeTab === 'personal' && (
             <form onSubmit={handleSaveUser} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <div className="relative">
                      <input 
                        disabled={!isEditing}
                        type="text" 
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <UserIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <input 
                        disabled={!isEditing}
                        type="email" 
                        value={userEmail}
                        onChange={e => setUserEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                    <div className="relative">
                      <input 
                        disabled={!isEditing}
                        type="tel" 
                        value={userPhone}
                        onChange={e => setUserPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Home Address</label>
                    <div className="relative">
                      <input 
                        disabled={!isEditing}
                        type="text" 
                        value={userAddress}
                        onChange={e => setUserAddress(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
               </div>

               {isEditing && (
                 <div className="flex justify-end pt-4">
                    <button 
                      type="submit"
                      className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      <Save size={18} /> Save Changes
                    </button>
                 </div>
               )}
             </form>
           )}

           {activeTab === 'child' && (
             <form onSubmit={handleSaveChild} className="space-y-8">
               {/* Medical Section */}
               <div>
                 <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <div className="p-1.5 bg-rose-100 text-rose-500 rounded-lg"><Heart size={16} /></div>
                   Medical Information
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Medical Conditions</label>
                      <div className="relative">
                        <input 
                          disabled={!isEditing}
                          type="text" 
                          value={childConditions}
                          onChange={e => setChildConditions(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                          placeholder="None"
                        />
                        <ShieldAlert size={18} className="absolute left-3 top-3.5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Allergies</label>
                      <div className="relative">
                        <input 
                          disabled={!isEditing}
                          type="text" 
                          value={childAllergies}
                          onChange={e => setChildAllergies(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                          placeholder="None"
                        />
                        <AlertCircle size={18} className="absolute left-3 top-3.5 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Blood Type</label>
                      <select 
                        disabled={!isEditing}
                        value={childBloodType}
                        onChange={e => setChildBloodType(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">Select Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                 </div>
               </div>

               <hr className="border-gray-100" />

               {/* Emergency Contact */}
               <div>
                 <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <div className="p-1.5 bg-orange-100 text-orange-500 rounded-lg"><Phone size={16} /></div>
                   Emergency Contact
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Name</label>
                      <input 
                        disabled={!isEditing}
                        type="text" 
                        value={emergencyName}
                        onChange={e => setEmergencyName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Relation</label>
                      <input 
                        disabled={!isEditing}
                        type="text" 
                        value={emergencyRelation}
                        onChange={e => setEmergencyRelation(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                      <input 
                        disabled={!isEditing}
                        type="tel" 
                        value={emergencyPhone}
                        onChange={e => setEmergencyPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                 </div>
               </div>

               {isEditing && (
                 <div className="flex justify-end pt-4">
                    <button 
                      type="submit"
                      className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      <Save size={18} /> Save Child Profile
                    </button>
                 </div>
               )}
             </form>
           )}

           {activeTab === 'system' && (
             <div className="space-y-8 animate-in fade-in">
                {/* Generator */}
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                   <div className="flex justify-between items-center mb-4">
                      <div>
                         <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <Key className="text-primary" /> Referral Code Generator
                         </h3>
                         <p className="text-gray-500 text-xs mt-1">Generate unique registration codes for new staff.</p>
                      </div>
                   </div>
                   
                   <div className="flex gap-4">
                      <div className="flex-1 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
                         <Info className="text-blue-500" />
                         <p className="text-sm font-bold text-blue-800">Parent Access Codes</p>
                         <p className="text-xs text-blue-600">
                           Parent codes are unique to each student. Please go to the <strong>Student Directory</strong> to view or copy individual enrollment codes.
                         </p>
                      </div>

                      <button 
                        onClick={() => onGenerateReferralCode && onGenerateReferralCode(UserRole.TEACHER)}
                        className="flex-1 bg-white border border-gray-200 hover:border-purple-500 text-gray-700 hover:text-purple-600 font-bold py-4 rounded-2xl transition-all shadow-sm flex flex-col items-center justify-center gap-2"
                      >
                         <ShieldCheck size={24} />
                         Generate Teacher Code
                      </button>
                   </div>
                </div>

                {/* Active Codes List */}
                <div>
                   <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Clock size={18} className="text-gray-400" /> Recent Codes
                   </h4>
                   <div className="space-y-3">
                      {referralCodes && referralCodes.length > 0 ? (
                         referralCodes.slice(0, 5).map(rc => (
                            <div key={rc.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className={`p-2 rounded-xl ${rc.forRole === UserRole.TEACHER ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                     {rc.forRole === UserRole.TEACHER ? <ShieldCheck size={20} /> : <Users size={20} />}
                                  </div>
                                  <div>
                                     <p className="font-mono font-bold text-lg text-gray-800">{rc.code}</p>
                                     <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{rc.forRole}</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                     rc.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                     {rc.status}
                                  </span>
                                  {rc.status === 'active' && (
                                     <button 
                                       onClick={() => { navigator.clipboard.writeText(rc.code); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000); }}
                                       className="p-2 text-gray-400 hover:text-primary bg-gray-50 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                       title="Copy Code"
                                     >
                                        <Copy size={16} />
                                     </button>
                                  )}
                               </div>
                            </div>
                         ))
                      ) : (
                         <div className="text-center p-8 text-gray-400 italic">No codes generated yet.</div>
                      )}
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
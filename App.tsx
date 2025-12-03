import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import SmartSummary from './components/SmartSummary';
import DailyFeed from './components/DailyFeed';
import HealthTracker from './components/HealthTracker';
import Billing from './components/Billing';
import CalendarView from './components/CalendarView';
import DocumentsView from './components/DocumentsView';
import ChatSystem from './components/ChatSystem'; 
import AnnouncementsView from './components/AnnouncementsView'; 
import ProfileSettings from './components/ProfileSettings';
import TeachersView from './components/TeachersView';
import PickupManager from './components/PickupManager';
import AttendanceManager from './components/AttendanceManager';
import ShopManager from './components/ShopManager';
import MomentsGallery from './components/MomentsGallery';
import FeedbackSystem from './components/FeedbackSystem';
import HomeworkManager from './components/HomeworkManager';
import ClassManager from './components/ClassManager';
import StudentsList from './components/StudentsList';
import { 
  CURRENT_DATE, 
  MOCK_CLASS_ROSTER,
  MOCK_ACTIVITIES, 
  MOCK_HEALTH_DATA,
  MOCK_INVOICES,
  MOCK_EVENTS,
  MOCK_DOCUMENTS,
  MOCK_NOTIFICATIONS,
  MOCK_ANNOUNCEMENTS,
  MOCK_GUARDIANS,
  MOCK_PICKUP_SESSIONS,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_ABSENCE_REQUESTS,
  MOCK_INCIDENTS,
  MOCK_SHOP_ITEMS,
  MOCK_SHOP_ORDERS,
  MOCK_USERS,
  MOCK_FEEDBACK_TICKETS,
  MOCK_HOMEWORK,
  MOCK_CLASSES,
  MOCK_CHANNELS,
  MOCK_REFERRAL_CODES,
  PHOTOS
} from './constants';
import { UserRole, User, Invoice, Activity, HealthRecord, SchoolEvent, SchoolDocument, Child, Notification, Announcement, PickupSession, Guardian, AttendanceRecord, AbsenceRequest, Incident, ShopItem, ShopOrder, CartItem, FeedbackTicket, FeedbackStatus, FeedbackComment, Homework, SchoolClass, ReferralCode, BankDetails } from './types';
import { Clock, CheckCircle, ChevronDown, User as UserIcon, X, Plus, AlertTriangle, Car, Megaphone, TrendingUp, DollarSign, ShoppingBag, FileText, CreditCard, ClipboardCheck } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data Persistence: Users and Roster
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('schoolfam_users');
    return savedUsers ? JSON.parse(savedUsers) : MOCK_USERS;
  });

  // Class State (Teacher View) - Source of Truth for the class
  const [classRoster, setClassRoster] = useState<Child[]>(() => {
    const savedRoster = localStorage.getItem('schoolfam_roster');
    return savedRoster ? JSON.parse(savedRoster) : MOCK_CLASS_ROSTER;
  });

  // Classes State
  const [classes, setClasses] = useState<SchoolClass[]>(MOCK_CLASSES);

  // Referral Codes State
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>(() => {
    const savedCodes = localStorage.getItem('schoolfam_referral_codes');
    return savedCodes ? JSON.parse(savedCodes) : MOCK_REFERRAL_CODES;
  });

  // Bank Details State
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: 'Public Bank',
    accountName: 'SchoolFam Sdn Bhd',
    accountNumber: '3123456789'
  });

  // Persist Data when changed
  useEffect(() => {
    localStorage.setItem('schoolfam_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('schoolfam_roster', JSON.stringify(classRoster));
  }, [classRoster]);

  useEffect(() => {
    localStorage.setItem('schoolfam_referral_codes', JSON.stringify(referralCodes));
  }, [referralCodes]);

  // Family State (Parent View)
  const [myChildren, setMyChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Add Child Modal State
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [newChildClass, setNewChildClass] = useState('');
  const [newChildGender, setNewChildGender] = useState<'boy' | 'girl'>('boy');

  // App Data State
  const [currentView, setCurrentView] = useState('dashboard');
  
  // CRUD States
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [events, setEvents] = useState<SchoolEvent[]>(MOCK_EVENTS);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(MOCK_HEALTH_DATA);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [documents, setDocuments] = useState<SchoolDocument[]>(MOCK_DOCUMENTS);
  
  // New Features State
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  // Pickup Feature State
  const [pickupSessions, setPickupSessions] = useState<Record<string, PickupSession>>(MOCK_PICKUP_SESSIONS);
  const [guardians, setGuardians] = useState<Record<string, Guardian[]>>(MOCK_GUARDIANS);

  // Attendance State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_RECORDS);
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>(MOCK_ABSENCE_REQUESTS);

  // Shop State
  const [shopItems, setShopItems] = useState<ShopItem[]>(MOCK_SHOP_ITEMS);
  const [shopCart, setShopCart] = useState<CartItem[]>([]);
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>(MOCK_SHOP_ORDERS);

  // Feedback State
  const [feedbackTickets, setFeedbackTickets] = useState<FeedbackTicket[]>(MOCK_FEEDBACK_TICKETS);

  // Homework State
  const [homeworkList, setHomeworkList] = useState<Homework[]>(MOCK_HOMEWORK);

  // Pickup Time Edit State
  const [isPickupTimeModalOpen, setIsPickupTimeModalOpen] = useState(false);
  const [tempPickupTime, setTempPickupTime] = useState(''); // Stores HH:MM 24h format

  // Derived state for quick status in dashboard:
  const getChildAttendanceStatus = (childId: string): Child['attendanceStatus'] => {
    const todayStr = new Date().toISOString().split('T')[0];
    const record = attendanceRecords.find(r => r.studentId === childId && r.date === todayStr);
    return (record?.status as Child['attendanceStatus']) || 'present';
  };

  const [pickupTimes, setPickupTimes] = useState<Record<string, string>>({
    'c1': '3:30 PM',
    'c2': '3:30 PM',
    'c3': '5:00 PM', 
    'c4': '3:30 PM'
  });

  // Helper to convert 12h (3:30 PM) to 24h (15:30) for input
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours}:${minutes}`;
  };

  // Helper to convert 24h (15:30) to 12h (3:30 PM) for display
  const convertTo12Hour = (time24h: string) => {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const handleEditPickupTime = (currentDisplayTime: string) => {
    // Try to convert current time to 24h, fallback to 15:30 if fails
    try {
      setTempPickupTime(convertTo24Hour(currentDisplayTime));
    } catch (e) {
      setTempPickupTime('15:30');
    }
    setIsPickupTimeModalOpen(true);
  };

  const handleSavePickupTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChildId && tempPickupTime) {
      const displayTime = convertTo12Hour(tempPickupTime);
      setPickupTimes(prev => ({
        ...prev,
        [selectedChildId]: displayTime
      }));
      setIsPickupTimeModalOpen(false);
    }
  };

  // Simulate Push Notification
  useEffect(() => {
    if (currentUser) {
      const timer = setTimeout(() => {
        const newNotif: Notification = {
          id: 'n_new_' + Date.now(),
          title: 'Lunch Menu Update',
          message: 'The cafeteria menu for next week has been updated.',
          type: 'info',
          timestamp: 'Just now',
          isRead: false
        };
        setNotifications(prev => [newNotif, ...prev]);
      }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const emergencyAnnouncement = announcements.find(a => a.type === 'emergency');
  // Latest announcement for parent dashboard
  const latestAnnouncement = announcements[0];
  const isUrgentAnnouncement = latestAnnouncement?.type === 'emergency';

  // Derived State for Parent View
  const currentChild = myChildren.find(c => c.id === selectedChildId) || myChildren[0];

  // Super Admin Action: Generate Referral Code
  const handleGenerateReferralCode = (role: UserRole) => {
    // Only allow generation for Teachers/Staff. Parents use student-specific codes.
    if (role === UserRole.PARENT) return;

    const newCodeString = `${role}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCode: ReferralCode = {
      id: 'rc_' + Date.now(),
      code: newCodeString,
      forRole: role,
      status: 'active',
      createdBy: currentUser?.id || 'admin',
      createdAt: new Date().toISOString()
    };
    setReferralCodes(prev => [newCode, ...prev]);
  };

  const handleLogin = (role: UserRole, data: any) => {
    if (data.isLogin) {
       // --- LOGIN LOGIC ---
       // Safe check for email property as some mock users might not have it
       const existingUser = allUsers.find(u => 
         u.email && 
         data.email && 
         u.email.toLowerCase() === data.email.toLowerCase()
       );
       
       if (existingUser) {
         // Login Successful
         setCurrentUser(existingUser);
         
         // Fix: Use the role from the stored user profile, not just the UI selection
         if (existingUser.role === UserRole.PARENT) {
           // Automatic Reconnect: Find children linked to this parent ID
           const connectedChildren = classRoster.filter(child => child.parentId === existingUser.id);
           setMyChildren(connectedChildren);
           if (connectedChildren.length > 0) {
             setSelectedChildId(connectedChildren[0].id);
           }
         }
       } else {
         alert("User not found. Please sign up first.");
       }

    } else {
       // --- REGISTRATION LOGIC ---
       
       // 1. Teacher Validation & Profile Claiming
       if (role === UserRole.TEACHER) {
         const codeInput = data.referralCode ? data.referralCode.trim() : '';
         if (!codeInput) {
           alert("System Enrollment Code is required.");
           return;
         }

         // A: Check for Profile Claim (Matching pre-created Teacher ID)
         // This is the "System Enrollment Code" flow
         const existingPlaceholderIndex = allUsers.findIndex(u => 
            u.role === UserRole.TEACHER && 
            u.id.toUpperCase() === codeInput.toUpperCase()
         );

         if (existingPlaceholderIndex !== -1) {
            // CLAIM PROFILE Logic
            const placeholder = allUsers[existingPlaceholderIndex];
            
            // Check if already claimed/has email
            if (placeholder.email && placeholder.email.includes('@schoolfam.com') && !placeholder.email.includes('placeholder')) {
                // Warning: In a real app we'd block this or require auth. 
                // For demo, we assume the code sharing implies permission, 
                // or we can block if it looks "active".
            }

            const claimedUser: User = {
                ...placeholder,
                email: data.email, // Update with real email
                name: data.name,   // Update with real name (user provided)
                // Keep the avatar if already set (admin might have set it), else generate
                avatarUrl: placeholder.avatarUrl
            };

            const updatedUsers = [...allUsers];
            updatedUsers[existingPlaceholderIndex] = claimedUser;
            setAllUsers(updatedUsers);
            setCurrentUser(claimedUser);
            return; // Success, skip generic creation
         }

         // B: Fallback to Generic Referral Code (Legacy/Invites)
         const validCode = referralCodes.find(rc => 
           rc.code === codeInput && 
           rc.status === 'active' && 
           rc.forRole === role
         );

         if (!validCode) {
           alert("Invalid code. Please enter the System Enrollment Code from your staff profile or a valid invite code.");
           return;
         }

         // Mark code as used
         setReferralCodes(prev => prev.map(rc => 
           rc.id === validCode.id ? { ...rc, status: 'used' } : rc
         ));
       }

       // Check Super Admin Key
       if (role === UserRole.SUPER_ADMIN) {
        if (data.masterKey !== 'MASTERKEY2024') {
          alert("Invalid System Master Key. Access Denied.");
          return;
        }
      }

       // 2. Prepare Child Linkage (For Parent)
       let newChildrenList: Child[] = [];
       let updatedRoster = [...classRoster];

       if (role === UserRole.PARENT) {
          // Mandatory Access Code Check
          if (!data.child || !data.child.accessCode) {
             alert("Student Access Code is required to sign up.");
             return;
          }

          const matchedStudentIndex = classRoster.findIndex(c => c.accessCode === data.child.accessCode);
          
          if (matchedStudentIndex === -1) {
             alert("Invalid Access Code. Please check the code provided by the school admin.");
             return;
          }

          // We will link this student to the new user below
       }

       // 3. Create New User (Generic Flow)
       // Pick a random adult photo if registering new
       const randomAdultPhoto = Math.random() > 0.5 
          ? PHOTOS.men[Math.floor(Math.random() * PHOTOS.men.length)] 
          : PHOTOS.women[Math.floor(Math.random() * PHOTOS.women.length)];

       const newUser: User = {
        id: 'u_' + Date.now(),
        name: data.name,
        role: role,
        email: data.email,
        phone: role === UserRole.PARENT ? '+60 12-345 6789' : '+60 16-123 4567',
        address: '123 Maple Avenue, Springfield',
        avatarUrl: randomAdultPhoto,
        className: data.className // Only for teacher
      };

      // 4. Finalize Parent-Child Linking
      if (role === UserRole.PARENT) {
         const matchedStudentIndex = classRoster.findIndex(c => c.accessCode === data.child.accessCode);
         
         // Double check just in case
         if (matchedStudentIndex !== -1) {
             const matchedStudent = { ...classRoster[matchedStudentIndex], parentId: newUser.id };
             updatedRoster[matchedStudentIndex] = matchedStudent;
             newChildrenList = [matchedStudent];
         }
      }

      // 5. Persist Changes
      setAllUsers(prev => [...prev, newUser]); // Save User
      setClassRoster(updatedRoster); // Save Roster
      
      // 6. Log In
      setCurrentUser(newUser);
      if (role === UserRole.PARENT) {
        setMyChildren(newChildrenList);
        if (newChildrenList.length > 0) setSelectedChildId(newChildrenList[0].id);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setMyChildren([]);
    setSelectedChildId('');
  };

  const handleAddChild = (childData: Partial<Child> & { gender?: 'boy' | 'girl' }) => {
    if (!currentUser) return;

    // Pick photo based on gender if provided, else random
    let avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${childData.name}`;
    if (childData.gender) {
       const photoList = childData.gender === 'boy' ? PHOTOS.boys : PHOTOS.girls;
       avatarUrl = photoList[Math.floor(Math.random() * photoList.length)];
    } else {
       // Random fallback if gender not specified
       const allKids = [...PHOTOS.boys, ...PHOTOS.girls];
       avatarUrl = allKids[Math.floor(Math.random() * allKids.length)];
    }

    const newChild: Child = {
      id: 'c_' + Date.now(),
      name: childData.name || 'New Child',
      age: childData.age || 0,
      class: childData.class || 'Kindergarten',
      avatarUrl: avatarUrl,
      attendanceStatus: 'present',
      parentId: currentUser.id,
      accessCode: 'GEN-' + Math.floor(Math.random() * 10000),
      medicalConditions: 'None',
      allergies: 'None',
      bloodType: 'Unknown',
      emergencyContact: {
        name: currentUser.name,
        phone: currentUser.phone || '+60 12-000 0000',
        relation: 'Parent'
      }
    };

    // Update Local Parent State
    setMyChildren(prev => [...prev, newChild]);
    if (myChildren.length === 0) setSelectedChildId(newChild.id);
    
    // Update Global Teacher State (Sync)
    setClassRoster(prev => [...prev, newChild]);
    
    // Init Features
    setPickupTimes(prev => ({...prev, [newChild.id]: '3:30 PM'}));
    setGuardians(prev => ({...prev, [newChild.id]: []}));
    setPickupSessions(prev => ({...prev, [newChild.id]: {studentId: newChild.id, status: 'pending'}}));

    setIsAddChildModalOpen(false);
    
    // Reset form
    setNewChildName('');
    setNewChildAge('');
    setNewChildClass('');
    setNewChildGender('boy');
  };

  const handleAddStudent = (studentData: Partial<Child> & { gender: 'boy' | 'girl' }) => {
    const code = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const photoList = studentData.gender === 'boy' ? PHOTOS.boys : PHOTOS.girls;
    const avatar = photoList[Math.floor(Math.random() * photoList.length)];

    const newStudent: Child = {
      id: 'c_' + Date.now(),
      name: studentData.name || 'New Student',
      age: studentData.age || 5,
      class: studentData.class || 'Kindergarten A',
      avatarUrl: avatar,
      attendanceStatus: 'present',
      accessCode: code,
      medicalConditions: 'None',
      allergies: 'None',
      bloodType: 'Unknown'
    };

    setClassRoster(prev => [...prev, newStudent]);
    // Init features
    setPickupTimes(prev => ({...prev, [newStudent.id]: '3:30 PM'}));
    setGuardians(prev => ({...prev, [newStudent.id]: []}));
    setPickupSessions(prev => ({...prev, [newStudent.id]: {studentId: newStudent.id, status: 'pending'}}));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  // Teachers Management
  const handleAddTeacher = (newTeacher: User) => {
    setAllUsers(prev => [...prev, newTeacher]);
  };

  const handleUpdateTeacher = (updatedTeacher: User) => {
    setAllUsers(prev => prev.map(u => u.id === updatedTeacher.id ? updatedTeacher : u));
  };

  const handleDeleteTeacher = (id: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== id));
  };
  
  const handleUpdateChild = (updatedChild: Child) => {
    setMyChildren(prev => prev.map(c => c.id === updatedChild.id ? updatedChild : c));
    setClassRoster(prev => prev.map(c => c.id === updatedChild.id ? updatedChild : c));
  };

  const handleAddActivity = (newActivity: Activity) => {
    setActivities([newActivity, ...activities]);
  };
  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
  };
  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };
  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status'], additionalData?: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status, ...additionalData } : inv
    ));
  };

  const handleAddEvent = (newEvent: SchoolEvent) => {
    setEvents([...events, newEvent]);
  };
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };
  const handleRSVP = (eventId: string, status: 'going' | 'not_going') => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rsvpStatus: status } : e));
  };

  const handleAddHealthRecord = (newRecord: HealthRecord) => {
    setHealthRecords([...healthRecords, newRecord]);
  };
  const handleDeleteHealthRecord = (id: string) => {
    setHealthRecords(healthRecords.filter(r => r.id !== id));
  };

  const handleAddIncident = (newIncident: Incident) => {
    setIncidents(prev => [newIncident, ...prev]);
  };

  const handleAcknowledgeIncident = (incidentId: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === incidentId ? { 
        ...inc, 
        acknowledgedByParent: true, 
        acknowledgedAt: new Date().toISOString() 
      } : inc
    ));
  };

  const handleAddDocument = (newDoc: SchoolDocument) => {
    setDocuments([newDoc, ...documents]);
  };
  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };
  const handleSignDocument = (id: string) => {
    const readableDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    setDocuments(prev => prev.map(d => 
      d.id === id ? { ...d, isSigned: true, signedDate: readableDate } : d
    ));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };
  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleAddAnnouncement = (newAnn: Announcement) => {
    setAnnouncements([newAnn, ...announcements]);
  };

  const handleUpdatePickupStatus = (session: PickupSession) => {
    setPickupSessions(prev => ({
      ...prev,
      [session.studentId]: session
    }));
  };

  const handleAddGuardian = (childId: string, guardian: Guardian) => {
    setGuardians(prev => ({
      ...prev,
      [childId]: [...(prev[childId] || []), guardian]
    }));
  };

  const handleRemoveGuardian = (childId: string, guardianId: string) => {
    setGuardians(prev => ({
      ...prev,
      [childId]: (prev[childId] || []).filter(g => g.id !== guardianId)
    }));
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    const existingIndex = attendanceRecords.findIndex(r => r.studentId === record.studentId && r.date === record.date);
    if (existingIndex >= 0) {
      setAttendanceRecords(prev => {
        const newRecords = [...prev];
        newRecords[existingIndex] = record;
        return newRecords;
      });
    } else {
      setAttendanceRecords(prev => [...prev, record]);
    }
  };

  const handleRequestAbsence = (request: AbsenceRequest) => {
    setAbsenceRequests(prev => [request, ...prev]);
  };

  const handleUpdateAbsenceRequestStatus = (id: string, status: 'approved' | 'rejected') => {
    setAbsenceRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status } : req
    ));
  };

  const handleAddItem = (item: ShopItem) => setShopItems(prev => [item, ...prev]);
  const handleUpdateItem = (item: ShopItem) => setShopItems(prev => prev.map(i => i.id === item.id ? item : i));
  const handleDeleteItem = (id: string) => setShopItems(prev => prev.filter(i => i.id !== id));
  const handleAddToCart = (item: ShopItem) => {
    setShopCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  const handleRemoveFromCart = (itemId: string) => setShopCart(prev => prev.filter(i => i.id !== itemId));
  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) { handleRemoveFromCart(itemId); return; }
    setShopCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  };
  const handleCheckout = (order: ShopOrder) => {
    setShopOrders(prev => [order, ...prev]);
    setShopCart([]);
    setShopItems(prev => prev.map(item => {
      const orderedItem = order.items.find(i => i.id === item.id);
      return orderedItem ? { ...item, stock: item.stock - orderedItem.quantity } : item;
    }));
  };
  const handleUpdateOrderStatus = (orderId: string, status: ShopOrder['status']) => {
    setShopOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Feedback Handlers
  const handleAddTicket = (ticket: FeedbackTicket) => {
    setFeedbackTickets(prev => [ticket, ...prev]);
  };
  const handleUpdateTicketStatus = (ticketId: string, status: FeedbackStatus, notes?: string, rating?: number) => {
    setFeedbackTickets(prev => prev.map(t => 
      t.id === ticketId ? { 
        ...t, 
        status, 
        resolutionNotes: notes || t.resolutionNotes,
        resolutionRating: rating || t.resolutionRating,
        updatedAt: new Date().toISOString()
      } : t
    ));
  };
  const handleAddTicketComment = (ticketId: string, comment: FeedbackComment) => {
    setFeedbackTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, comments: [...t.comments, comment] } : t
    ));
  };

  // Homework Handlers
  const handleAddHomework = (hw: Homework) => {
    setHomeworkList(prev => [...prev, hw]);
  };
  const handleUpdateHomework = (updatedHw: Homework) => {
    setHomeworkList(prev => prev.map(hw => hw.id === updatedHw.id ? updatedHw : hw));
  };
  const handleDeleteHomework = (id: string) => {
    setHomeworkList(prev => prev.filter(hw => hw.id !== id));
  };

  // Class Management Handlers
  const handleAddClass = (newClass: SchoolClass) => {
    setClasses(prev => [...prev, newClass]);
  };
  const handleUpdateClass = (updatedClass: SchoolClass) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
  };
  const handleDeleteClass = (id: string) => {
    // Soft delete (archive) logic can be handled here or inside component
    // If it's a hard delete:
    // setClasses(prev => prev.filter(c => c.id !== id));
    // If it's archive:
    setClasses(prev => prev.map(c => c.id === id ? { ...c, status: 'archived' } : c));
  };

  const getAttendanceStyle = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-200';
      case 'absent': return 'bg-red-100 text-red-700 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    // EMPTY STATE: New Parent with no children
    if (currentUser.role === UserRole.PARENT && !currentChild && currentView === 'dashboard') {
      return (
        <>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Plus size={48} className="text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Aboard, {currentUser.name.split(' ')[0]}!</h2>
            <p className="text-gray-500 max-w-md mb-8">It looks like you haven't connected any student profiles yet.</p>
            <div className="bg-yellow-50 border border-yellow-100 p-6 rounded-2xl max-w-md">
               <p className="text-yellow-800 font-bold mb-2 flex items-center justify-center gap-2">
                 <AlertTriangle size={20} /> Action Required
               </p>
               <p className="text-yellow-700 text-sm">
                 Please contact the school administration to obtain your Student Access Code and link your child's profile.
               </p>
            </div>
          </div>
        </>
      );
    } else if (currentUser.role === UserRole.PARENT && !currentChild) {
       // Fallback for other views if no child exists
       return (
         <div className="flex flex-col items-center justify-center h-64 text-center p-8">
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium mb-2">No Student Profile Linked</p>
              <p className="text-sm text-gray-400">Please contact the school to link your account.</p>
            </div>
         </div>
       );
    }

    // Normal Data Logic (Parent sees activities for their child OR 'all' class activities)
    const displayedActivities = currentUser.role === UserRole.PARENT 
      ? activities.filter(a => (a.studentIds && (a.studentIds.includes(selectedChildId) || a.studentIds.includes('all'))))
      : activities;

    switch (currentView) {
      case 'dashboard':
        // ADMIN & SUPER ADMIN VIEW (Executive Reports Only)
        if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) {
          // --- CALCULATE EXECUTIVE STATS ---
          
          // 1. Financial: Billing
          const billingStats = invoices.reduce((acc, inv) => {
            // Count 'verifying' as separate or part of pending? Let's keep it separate or just pending for now in basic stats
            // Actually, we can count verifying as pending-like for simple stats, or explicit.
            if (acc[inv.status]) {
               acc[inv.status] += inv.amount;
            } else {
               acc[inv.status] = inv.amount;
            }
            return acc;
          }, { paid: 0, pending: 0, overdue: 0, verifying: 0 } as Record<string, number>);

          // 2. Financial: Sales
          const totalSalesRevenue = shopOrders.reduce((sum, order) => sum + order.total, 0);
          const pendingShopOrders = shopOrders.filter(o => o.status === 'pending').length;

          // 3. Attendance: Today's Snapshot
          const totalStudents = classRoster.length;
          const todayStr = new Date().toISOString().split('T')[0];
          // Use today's records or default status if no record exists
          const presentCount = classRoster.filter(s => {
             const rec = attendanceRecords.find(r => r.studentId === s.id && r.date === todayStr);
             return rec ? rec.status === 'present' : s.attendanceStatus === 'present';
          }).length;
          const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                      Executive Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">{CURRENT_DATE}</p>
                  </div>
               </div>

               {/* TOP ROW: REPORT CARDS */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Attendance Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-40">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-xs font-bold text-gray-400 uppercase">Attendance</p>
                           <h3 className="text-3xl font-black text-gray-800 mt-1">{attendancePercentage}%</h3>
                        </div>
                        <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                           <ClipboardCheck size={24} />
                        </div>
                     </div>
                     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${attendancePercentage}%` }}></div>
                     </div>
                     <p className="text-xs text-gray-500 mt-2">{presentCount} of {totalStudents} Students Present</p>
                  </div>

                  {/* Sales Revenue Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-40">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-xs font-bold text-gray-400 uppercase">Total Shop Sales</p>
                           <h3 className="text-3xl font-black text-indigo-600 mt-1">RM{totalSalesRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                           <TrendingUp size={24} />
                        </div>
                     </div>
                     <div className="flex items-center gap-2 mt-auto">
                        <ShoppingBag size={14} className="text-orange-500" />
                        <span className="text-xs font-bold text-gray-600">{pendingShopOrders} orders pending fulfillment</span>
                     </div>
                  </div>

                  {/* Billing Outstanding Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-40">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-xs font-bold text-gray-400 uppercase">Outstanding Fees</p>
                           <h3 className="text-3xl font-black text-rose-500 mt-1">RM{(billingStats.pending + billingStats.overdue).toLocaleString()}</h3>
                        </div>
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                           <DollarSign size={24} />
                        </div>
                     </div>
                     <p className="text-xs text-gray-500 mt-auto">
                        Includes <span className="font-bold text-rose-600">RM{billingStats.overdue.toLocaleString()}</span> in overdue payments.
                     </p>
                  </div>
               </div>

               {/* BOTTOM ROW: DETAILS */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Sales Log */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-80">
                     <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Recent Shop Orders</h3>
                        <button onClick={() => setCurrentView('shop')} className="text-xs font-bold text-primary hover:underline">View All</button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {shopOrders.slice(0, 5).map(order => (
                           <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                 }`}>
                                    {order.items.length}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-gray-800">{order.parentName}</p>
                                    <p className="text-[10px] text-gray-400">#{order.id.slice(-6)} • {new Date(order.timestamp).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <span className="font-bold text-gray-800 text-sm">RM{order.total}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Billing Breakdown */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-80">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">Billing Status</h3>
                        <button onClick={() => setCurrentView('billing')} className="text-xs font-bold text-primary hover:underline">Manage Invoices</button>
                     </div>
                     
                     <div className="flex-1 flex flex-col justify-center gap-6">
                        {/* Paid */}
                        <div>
                           <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-green-600">Collected (Paid)</span>
                              <span className="text-gray-800">RM{billingStats.paid.toLocaleString()}</span>
                           </div>
                           <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                              <div className="bg-green-500 h-full rounded-full" style={{ width: `${(billingStats.paid / (billingStats.paid + billingStats.pending + billingStats.overdue + billingStats.verifying)) * 100}%` }}></div>
                           </div>
                        </div>

                        {/* Pending */}
                        <div>
                           <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-orange-500">Pending</span>
                              <span className="text-gray-800">RM{billingStats.pending.toLocaleString()}</span>
                           </div>
                           <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                              <div className="bg-orange-400 h-full rounded-full" style={{ width: `${(billingStats.pending / (billingStats.paid + billingStats.pending + billingStats.overdue + billingStats.verifying)) * 100}%` }}></div>
                           </div>
                        </div>

                        {/* Verifying (If any) */}
                        {billingStats.verifying > 0 && (
                           <div>
                              <div className="flex justify-between text-xs font-bold mb-1">
                                 <span className="text-blue-500">Processing (Verifying)</span>
                                 <span className="text-gray-800">RM{billingStats.verifying.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                 <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(billingStats.verifying / (billingStats.paid + billingStats.pending + billingStats.overdue + billingStats.verifying)) * 100}%` }}></div>
                              </div>
                           </div>
                        )}

                        {/* Overdue */}
                        <div>
                           <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-rose-500">Overdue</span>
                              <span className="text-gray-800">RM{billingStats.overdue.toLocaleString()}</span>
                           </div>
                           <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(billingStats.overdue / (billingStats.paid + billingStats.pending + billingStats.overdue + billingStats.verifying)) * 100}%` }}></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          );
        }

        // TEACHER & PARENT DASHBOARD (Original Logic)
        const childStatus = getChildAttendanceStatus(currentChild?.id || '');
        const myPickupTime = pickupTimes[currentChild?.id || ''] || '3:30 PM';
        
        const pickupSession: PickupSession | undefined = pickupSessions[currentChild?.id || ''];
        const pickupStatus = pickupSession?.status || 'pending';

        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Header & Child Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                  Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {currentUser.name.split(' ')[0]}!
                </h1>
                <p className="text-gray-500 mt-1 font-medium">{CURRENT_DATE}</p>
              </div>
              
              {currentUser.role === UserRole.PARENT && currentChild && (
                <div className="w-full md:w-auto relative group z-10">
                  <div className="bg-white pl-3 pr-10 py-2 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-3 cursor-pointer relative hover:border-primary transition-colors">
                    <img src={currentChild.avatarUrl} alt={currentChild.name} className="w-8 h-8 rounded-full bg-gray-100" />
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Viewing Profile</p>
                      <p className="text-sm font-bold text-gray-800">{currentChild.name}</p>
                    </div>
                    <ChevronDown size={16} className="absolute right-3 text-gray-400" />
                    
                    {/* Child Switcher Dropdown */}
                    <select 
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      {myChildren.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Dashboard */}
            {(currentUser.role === UserRole.TEACHER) && (
              <>
                 {(() => {
                    // CALCULATE REAL-TIME METRICS
                    
                    // 1. Determine Students Scope
                    let dashboardStudents = classRoster;
                    if (currentUser.role === UserRole.TEACHER && currentUser.className) {
                      dashboardStudents = classRoster.filter(s => s.class === currentUser.className);
                    }

                    // 2. Attendance Stats
                    const presentTodayCount = dashboardStudents.filter(s => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const record = attendanceRecords.find(r => r.studentId === s.id && r.date === todayStr);
                        // Use record if exists, otherwise fallback to current status
                        return record ? record.status === 'present' : s.attendanceStatus === 'present';
                    }).length;
                    const totalStudentsCount = dashboardStudents.length;

                    // 3. Pending Pickups
                    const pendingPickupCount = dashboardStudents.filter(s => {
                        const session = pickupSessions[s.id];
                        return !session || session.status === 'pending';
                    }).length;

                    // 4. Unread Messages (Mock Logic based on channels)
                    // In a real app this would query message state. Here we sum unread counts from channels user is in.
                    const unreadMsgCount = MOCK_CHANNELS
                        .filter(c => c.participants.includes(currentUser.id))
                        .reduce((sum, c) => sum + (c.unreadCount || 0), 0);

                    // 5. Next Event
                    const upcomingEvent = events
                        .filter(e => new Date(e.date) >= new Date()) // Future events
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                              <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Present Today</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{presentTodayCount}/{totalStudentsCount}</h3>
                                  </div>
                                  <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                                    <CheckCircle size={20} />
                                  </div>
                              </div>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                              <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Pending Pickup</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                      {pendingPickupCount}
                                    </h3>
                                  </div>
                                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                                    <Car size={20} />
                                  </div>
                              </div>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                              <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Unread Msg</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{unreadMsgCount}</h3>
                                  </div>
                                  <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                                    <Clock size={20} />
                                  </div>
                              </div>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                              <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-gray-500 text-xs font-bold uppercase">Next Event</p>
                                    <h3 className="text-sm font-bold text-gray-800 mt-2 truncate">
                                      {upcomingEvent ? upcomingEvent.title : 'No upcoming events'}
                                    </h3>
                                    {upcomingEvent && <p className="text-[10px] text-gray-400">{new Date(upcomingEvent.date).toLocaleDateString()}</p>}
                                  </div>
                                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                    <Clock size={20} />
                                  </div>
                              </div>
                            </div>
                        </div>

                        {/* Urgent Announcement Banner */}
                        {isUrgentAnnouncement && (
                            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-start gap-4 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10">
                                  <AlertTriangle size={100} className="text-rose-500" />
                              </div>
                              <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm shrink-0">
                                  <Megaphone size={24} />
                              </div>
                              <div className="relative z-10">
                                  <h3 className="text-rose-800 font-bold text-lg mb-1">{latestAnnouncement.title}</h3>
                                  <p className="text-rose-700 text-sm leading-relaxed">{latestAnnouncement.content}</p>
                              </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                              <DailyFeed 
                                  activities={activities} 
                                  userRole={currentUser.role}
                                  onAddActivity={handleAddActivity}
                                  onDeleteActivity={handleDeleteActivity}
                              />
                            </div>
                            <div className="space-y-6">
                              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                  <h3 className="font-bold text-gray-800 mb-4">Class Schedule</h3>
                                  <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                    {[
                                      {time: '09:00 AM', title: 'Morning Assembly', type: 'general'},
                                      {time: '10:00 AM', title: 'Math & Logic', type: 'learning'},
                                      {time: '11:30 AM', title: 'Outdoor Play', type: 'play'},
                                      {time: '12:30 PM', title: 'Lunch Break', type: 'food'},
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                          <div className="w-4 h-4 rounded-full bg-white border-4 border-primary absolute left-0 top-1"></div>
                                          <div className="pl-6">
                                              <span className="text-xs font-bold text-gray-400">{item.time}</span>
                                              <p className="text-bold text-gray-800 text-sm">{item.title}</p>
                                          </div>
                                        </div>
                                    ))}
                                  </div>
                              </div>
                            </div>
                        </div>
                      </>
                    );
                 })()}
              </>
            )}

            {/* Parent Dashboard */}
            {currentUser.role === UserRole.PARENT && currentChild && (
              <>
                {(() => {
                   // PARENT REAL-TIME METRICS
                   const nextChildEvent = events
                      .filter(e => {
                         const isFuture = new Date(e.date) >= new Date();
                         // Match class OR school-wide
                         const isRelevant = e.category === 'school' || (e.category === 'class' && e.classId === currentChild.class);
                         return isFuture && isRelevant;
                      })
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                   return (
                     <>
                      {/* Status Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        {/* Attendance Card */}
                        <div className={`p-6 rounded-3xl border transition-all ${
                          childStatus === 'absent' ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'
                        } shadow-sm group hover:shadow-md`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs font-bold uppercase opacity-60">Today's Status</p>
                              <h3 className={`text-xl font-bold mt-1 capitalize ${
                                childStatus === 'absent' ? 'text-red-600' : 'text-gray-800'
                              }`}>{childStatus}</h3>
                            </div>
                            <div className={`p-2 rounded-xl ${
                              childStatus === 'absent' ? 'bg-white text-red-500' : 'bg-green-50 text-green-500'
                            }`}>
                                {childStatus === 'absent' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium opacity-70">
                            <Clock size={14} />
                            <span>Check-in: 08:30 AM</span>
                          </div>
                        </div>

                        {/* Pickup Card */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-md">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase">Pickup Status</p>
                              <h3 className="text-xl font-bold text-gray-800 mt-1">
                                {pickupStatus === 'pending' ? 'In Class' : 'Picked Up'}
                              </h3>
                            </div>
                            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl">
                              <Car size={20} />
                            </div>
                          </div>
                          {pickupStatus === 'pending' ? (
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                <Clock size={14} />
                                <span>Est. Pickup: {myPickupTime}</span>
                                <button 
                                  onClick={() => handleEditPickupTime(myPickupTime)} 
                                  className="text-primary hover:underline ml-auto"
                                >
                                  Edit
                                </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                                <CheckCircle size={14} />
                                <span>Dismissed at {pickupSession?.timestamp?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Next Event Card */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-md">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Next Event</p>
                                <h3 className="text-lg font-bold text-gray-800 mt-1 truncate">
                                  {nextChildEvent ? nextChildEvent.title : 'No upcoming events'}
                                </h3>
                              </div>
                              <div className="p-2 bg-purple-50 text-purple-500 rounded-xl">
                                <Clock size={20} />
                              </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {nextChildEvent 
                              ? `${new Date(nextChildEvent.date).toLocaleDateString()} • ${nextChildEvent.subType}`
                              : 'Check calendar for updates'}
                          </p>
                          {nextChildEvent && (
                             <div className="mt-3 flex items-center gap-2">
                                {nextChildEvent.rsvpReq && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">RSVP Req</span>}
                             </div>
                          )}
                        </div>
                      </div>
                     </>
                   );
                })()}

                {/* Announcement Banner */}
                {latestAnnouncement && (
                   <div className={`border rounded-3xl p-5 flex items-start gap-4 relative overflow-hidden ${
                      isUrgentAnnouncement 
                      ? 'bg-rose-50 border-rose-200 shadow-sm' 
                      : 'bg-blue-50 border-blue-100'
                   }`}>
                      <div className={`p-3 rounded-2xl shadow-sm shrink-0 ${
                         isUrgentAnnouncement ? 'bg-white text-rose-500' : 'bg-white text-blue-500'
                      }`}>
                         <Megaphone size={20} />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                               isUrgentAnnouncement ? 'bg-rose-200 text-rose-800' : 'bg-blue-200 text-blue-800'
                            }`}>
                               {latestAnnouncement.type}
                            </span>
                            <span className="text-xs opacity-60 font-medium">{latestAnnouncement.date}</span>
                         </div>
                         <h3 className={`font-bold ${isUrgentAnnouncement ? 'text-rose-900' : 'text-blue-900'}`}>
                            {latestAnnouncement.title}
                         </h3>
                         <p className={`text-sm mt-1 line-clamp-1 ${isUrgentAnnouncement ? 'text-rose-800' : 'text-blue-800'}`}>
                            {latestAnnouncement.content}
                         </p>
                      </div>
                      <button 
                        onClick={() => setCurrentView('announcements')}
                        className="absolute bottom-4 right-4 text-xs font-bold hover:underline opacity-60"
                      >
                         Read More →
                      </button>
                   </div>
                )}
                
                {/* Magic Summary */}
                <SmartSummary child={currentChild} activities={displayedActivities} />

                {/* Feed */}
                <div className="mt-8">
                  <DailyFeed 
                    activities={displayedActivities} 
                    userRole={UserRole.PARENT}
                  />
                </div>

                {/* Edit Pickup Time Modal */}
                {isPickupTimeModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800">Update Pickup Time</h3>
                        <button onClick={() => setIsPickupTimeModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                          <X size={20} className="text-gray-500" />
                        </button>
                      </div>
                      
                      <form onSubmit={handleSavePickupTime} className="p-6 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Time</label>
                          <input 
                            required
                            type="time" 
                            value={tempPickupTime}
                            onChange={e => setTempPickupTime(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 mt-2"
                        >
                          Save Changes
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      
      case 'messages':
        return <ChatSystem currentUser={currentUser} users={allUsers} />;
      case 'calendar':
        return (
          <CalendarView 
            events={events} 
            userRole={currentUser.role} 
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onRSVP={handleRSVP}
          />
        );
      case 'billing':
        return (
          <Billing 
            invoices={invoices} 
            userRole={currentUser.role}
            currentUser={currentUser}
            students={classRoster}
            currentStudentId={currentChild?.id}
            bankDetails={bankDetails}
            onUpdateBankDetails={setBankDetails}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onAddInvoice={handleAddInvoice}
            onDeleteInvoice={handleDeleteInvoice}
          />
        );
      case 'health':
        return (
          <HealthTracker 
             records={healthRecords}
             incidents={incidents} 
             userRole={currentUser.role}
             currentUser={currentUser}
             students={classRoster}
             studentsFull={classRoster} // Passing full details
             currentStudentId={currentChild?.id}
             onAddRecord={handleAddHealthRecord}
             onAddIncident={handleAddIncident}
             onAcknowledgeIncident={handleAcknowledgeIncident}
          />
        );
      case 'docs':
        return (
          <DocumentsView 
            documents={documents} 
            userRole={currentUser.role} 
            currentUser={currentUser}
            students={classRoster}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onSignDocument={handleSignDocument}
          />
        );
      case 'announcements':
        return (
           <AnnouncementsView 
              announcements={announcements} 
              userRole={currentUser.role} 
              onAddAnnouncement={handleAddAnnouncement}
           />
        );
      case 'profile':
        return (
           <ProfileSettings 
              currentUser={currentUser} 
              currentChild={currentChild}
              referralCodes={referralCodes}
              onUpdateUser={handleUpdateUser}
              onUpdateChild={handleUpdateChild}
              onAddChild={handleAddChild}
              onGenerateReferralCode={handleGenerateReferralCode}
           />
        );
      case 'teachers':
        return (
          <TeachersView 
            currentUser={currentUser}
            teachers={allUsers.filter(u => u.role === UserRole.TEACHER)}
            referralCodes={referralCodes.filter(rc => rc.forRole === UserRole.TEACHER)}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onGenerateReferralCode={handleGenerateReferralCode}
            onNavigate={setCurrentView}
          />
        );
      case 'classes':
        return (
          <ClassManager 
            classes={classes}
            teachers={allUsers.filter(u => u.role === UserRole.TEACHER)}
            students={classRoster}
            onAddClass={handleAddClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
            onSwitchToTeachers={() => setCurrentView('teachers')}
            onUpdateTeacher={handleUpdateTeacher}
          />
        );
      case 'students':
        return (
          <StudentsList 
            students={classRoster}
            currentUser={currentUser}
            onAddStudent={handleAddStudent}
          />
        );
      case 'pickup':
        return (
           <PickupManager 
              userRole={currentUser.role}
              currentUser={currentUser}
              students={classRoster}
              currentChild={currentChild}
              pickupSessions={pickupSessions}
              guardians={guardians}
              estimatedPickupTime={pickupTimes[currentChild?.id || ''] || '3:30 PM'}
              allPickupTimes={pickupTimes} // Pass all times for teachers
              onUpdatePickupTime={(time) => {
                 if (currentChild) {
                   setPickupTimes(prev => ({...prev, [currentChild.id]: time}));
                 }
              }}
              onUpdatePickupStatus={handleUpdatePickupStatus}
              onAddGuardian={handleAddGuardian}
              onRemoveGuardian={handleRemoveGuardian}
           />
        );
      case 'attendance':
        return (
           <AttendanceManager 
              userRole={currentUser.role}
              currentUser={currentUser}
              students={classRoster}
              currentChild={currentChild}
              attendanceRecords={attendanceRecords}
              absenceRequests={absenceRequests}
              onUpdateAttendance={handleUpdateAttendance}
              onRequestAbsence={handleRequestAbsence}
              onUpdateAbsenceRequestStatus={handleUpdateAbsenceRequestStatus}
           />
        );
      case 'homework':
        return (
          <HomeworkManager 
            homework={homeworkList}
            userRole={currentUser.role}
            currentUser={currentUser}
            students={classRoster}
            onAddHomework={handleAddHomework}
            onUpdateHomework={handleUpdateHomework}
            onDeleteHomework={handleDeleteHomework}
          />
        );
      case 'shop':
        return (
          <ShopManager 
             userRole={currentUser.role}
             currentUser={currentUser}
             items={shopItems}
             cart={shopCart}
             orders={shopOrders}
             onAddItem={handleAddItem}
             onUpdateItem={handleUpdateItem}
             onDeleteItem={handleDeleteItem}
             onAddToCart={handleAddToCart}
             onRemoveFromCart={handleRemoveFromCart}
             onUpdateCartQuantity={handleUpdateCartQuantity}
             onCheckout={handleCheckout}
             onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        );
      case 'moments':
        return (
          <MomentsGallery 
            activities={displayedActivities}
            userRole={currentUser.role}
            currentUser={currentUser}
            students={classRoster} // Pass students
            onAddActivity={handleAddActivity}
          />
        );
      case 'feedback':
        return (
          <FeedbackSystem
            currentUser={currentUser}
            tickets={feedbackTickets}
            children={myChildren}
            onAddTicket={handleAddTicket}
            onUpdateStatus={handleUpdateTicketStatus}
            onAddComment={handleAddTicketComment}
          />
        );
      default:
        return <div>Section under construction</div>;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      currentView={currentView} 
      notifications={notifications}
      onChangeView={setCurrentView} 
      onLogout={handleLogout}
      onMarkNotificationRead={handleMarkNotificationRead}
      onClearNotifications={handleClearNotifications}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
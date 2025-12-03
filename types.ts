

export enum UserRole {
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  email?: string;
  phone?: string;
  address?: string;
  className?: string; // For teachers
  subjects?: string[]; // For teachers
  bio?: string; // For teachers
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface SimpleStudent {
  id: string;
  name: string;
}

export interface ReferralCode {
  id: string;
  code: string;
  forRole: UserRole;
  status: 'active' | 'used';
  createdBy: string;
  createdAt: string;
}

export interface Guardian {
  id: string;
  name: string;
  relation: string;
  imageUrl: string; // ID Photo
  phone: string;
}

export type PickupStatus = 'pending' | 'picked_up' | 'bus' | 'after_care' | 'walk';

export interface PickupSession {
  studentId: string;
  status: PickupStatus;
  timestamp?: Date;
  method?: string; // "Guardian", "School Bus", "After Care"
  guardianId?: string; // If picked up by guardian
  verifiedBy?: string; // Teacher name
  signatureUrl?: string; // Data URL of signature
  photoUrl?: string; // Data URL of captured photo
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  attachmentUrl?: string;
  recordedBy: string;
  timestamp: string; // ISO string for the exact time it was recorded
}

export interface AbsenceRequest {
  id: string;
  studentId: string;
  studentName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  attachmentUrl?: string;
  requestedOn: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  class: string;
  avatarUrl: string;
  attendanceStatus: 'present' | 'absent' | 'late' | 'excused';
  parentId?: string;
  accessCode?: string; // Unique code for parent linkage
  medicalConditions?: string;
  medicalNotes?: string; // e.g. "Epipen in bag"
  allergies?: string;
  bloodType?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface Activity {
  id: string;
  studentIds: string[]; // Changed from childId to support multiple tags. Use 'all' for class-wide.
  type: 'learning' | 'play' | 'food' | 'nap' | 'health';
  title: string;
  description: string;
  timestamp: string;
  imageUrls?: string[];
  likes: number;
  teacherName: string;
}

export interface HealthRecord {
  id: string;
  studentId: string;
  date: string;
  height: number; // cm
  weight: number; // kg
}

export interface Incident {
  id: string;
  studentId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  actionTaken: string;
  reportedBy: string;
  media?: { type: 'image' | 'video'; url: string }[];
  acknowledgedByParent: boolean;
  acknowledgedAt?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: string[]; // User IDs
  lastMessage?: string;
  unreadCount?: number;
  avatarUrl?: string; // For group icon or other user avatar
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string; // Display string e.g. "10:30 AM"
  fullTimestamp: Date; // For sorting
  isRead: boolean;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name?: string;
    size?: string;
  };
}

export interface Invoice {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'verifying';
  studentName: string;
  studentId: string;
  proofOfPaymentUrl?: string; // For bank transfer receipts
  paymentMethod?: 'card' | 'transfer';
}

export interface SchoolDocument {
  id: string;
  title: string;
  type: 'report' | 'form' | 'policy';
  date: string;
  size: string;
  downloadUrl: string;
  requiresSignature?: boolean;
  isSigned?: boolean;
  signedDate?: string;
  studentId?: string; // Optional: specific to a student
  studentName?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'info' | 'reminder' | 'success';
  timestamp: string; // Relative time e.g. "2m ago"
  isRead: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'school' | 'class' | 'emergency';
  author: string;
  date: string;
  priority: 'high' | 'normal';
}

// --- Shop Types ---

export type ShopCategory = 'uniform' | 'books' | 'merchandise' | 'club_equipment';

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ShopCategory;
  stock: number;
  imageUrl: string;
}

export interface CartItem extends ShopItem {
  quantity: number;
}

export interface ShopOrder {
  id: string;
  parentId: string;
  parentName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'ready' | 'delivered';
  type: 'pickup' | 'delivery';
  timestamp: string;
}

// --- Feedback System Types ---

export type FeedbackCategory = 
  | 'academic' 
  | 'behavior' 
  | 'health_safety' 
  | 'communication' 
  | 'facilities' 
  | 'teacher' 
  | 'suggestion';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'emergency';

export type FeedbackStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface FeedbackComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  timestamp: string;
  isInternal?: boolean; // Visible only to teachers/admins
}

export interface FeedbackTicket {
  id: string;
  parentId: string;
  parentName: string;
  childId?: string; // Related student
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string; // Teacher or Admin ID
  comments: FeedbackComment[];
  attachments?: { name: string; url: string }[];
  resolutionRating?: number; // 1-5 stars, only if resolved
  resolutionNotes?: string;
}

// --- Homework Types ---

export interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  assignedDate: string; // YYYY-MM-DD
  attachments?: { name: string; url: string }[];
  studentId?: string; // Optional: specific student assignment
  studentName?: string;
}

// --- Advanced Calendar Types ---

export type EventCategory = 'academic' | 'school' | 'class' | 'personal';
export type EventSubType = 'test' | 'assignment' | 'project' | 'meeting' | 'holiday' | 'trip' | 'activity' | 'other';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface EventAttendee {
  userId: string; // Student ID or Parent ID
  status: 'going' | 'not_going' | 'maybe' | 'pending';
  name: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  
  // Categorization
  category: EventCategory;
  subType: EventSubType;
  classId?: string; // Only for class-specific events
  creatorId?: string;

  // Details
  location?: string;
  description?: string;
  materials?: { name: string; url: string }[]; // Study guides, permission slips

  // Settings
  rsvpReq?: boolean; // Requires RSVP
  rsvpDeadline?: Date;
  maxCapacity?: number;
  attendees?: EventAttendee[];
  rsvpStatus?: 'going' | 'not_going' | 'pending'; // For current user view
  
  // Recurrence
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceType;
}

// --- Class Management Types ---

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Kindergarten A"
  level: string; // e.g. "Kindergarten", "Grade 1"
  description: string;
  capacity: number;
  teacherId?: string; // Assigned Teacher ID
  status: 'active' | 'archived';
}
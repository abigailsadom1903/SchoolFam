import { User, UserRole, Child, Activity, HealthRecord, Invoice, Message, SchoolEvent, SchoolDocument, SimpleStudent, ChatChannel, Notification, Announcement, Incident, Guardian, PickupSession, AttendanceRecord, AbsenceRequest, ShopItem, ShopOrder, FeedbackTicket, Homework, SchoolClass, ReferralCode } from './types';

export const CURRENT_DATE = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// --- IMAGE ASSETS (Real Photos) ---
export const PHOTOS = {
  girls: [
    'https://images.unsplash.com/photo-1519456264917-42d0aa2e0625?auto=format&fit=crop&q=80&w=300&h=300', 
    'https://images.unsplash.com/photo-1621086022646-6f8ae90d8102?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1517677130688-e09247d6bd6d?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1602030028438-4cf153cba999?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1514326543509-3224fa7e6bd3?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1609127592477-d7793b44b80e?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1609907952327-466023396866?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1615243305597-23097b6cb87c?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1533512930330-4ac257c86793?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1534960680480-044230c30932?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1629872430082-93d891275991?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1587399477022-79336829774a?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?auto=format&fit=crop&q=80&w=300&h=300'
  ],
  boys: [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1592496001020-6927d3c05c06?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1485546410280-57f637728e63?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1503431128871-cd250803fa41?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1547408933-f564dc5e840d?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1622329388383-75b2876644f6?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1605367373977-94b2813df420?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1614276707328-9d62d2950942?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1591952327429-07f901a88b43?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&q=80&w=300&h=300'
  ],
  men: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1566492031773-4fbc752f671d?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300&h=300'
  ],
  women: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=300&h=300',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300&h=300'
  ]
};

// --- PARENTS ---
export const MOCK_PARENT_USER: User = {
  id: 'u1',
  name: 'Sarah Anderson',
  role: UserRole.PARENT,
  email: 'sarah@example.com',
  phone: '+60 12-345 6789',
  address: '123 Maple Avenue, Springfield',
  avatarUrl: PHOTOS.women[0]
};

// --- TEACHERS ---
export const MOCK_TEACHER_USER: User = {
  id: 'u2',
  name: 'Mrs. Jennifer Davis (Class KB Lead)',
  role: UserRole.TEACHER,
  email: 'jennifer@schoolfam.com',
  phone: '+60 17-987 6543',
  className: 'Kindergarten B',
  avatarUrl: PHOTOS.women[1],
  bio: 'Lead Teacher for KB. Passionate about early childhood education.',
  subjects: ['Phonics', 'Math', 'Science']
};

export const MOCK_SUPER_ADMIN: User = {
  id: 'admin_1',
  name: 'Director Thompson',
  role: UserRole.SUPER_ADMIN,
  email: 'director@schoolfam.com',
  phone: '+60 19-000 1111',
  avatarUrl: PHOTOS.men[0],
  bio: 'Overseeing school operations and academic excellence.',
  address: 'School Administration Building'
};

export const MOCK_ADDITIONAL_TEACHERS: User[] = [
  // Kindergarten A Team
  {
    id: 't3',
    name: 'Ms. Emily Chen (Class KA Lead)',
    role: UserRole.TEACHER,
    email: 'emily@schoolfam.com',
    phone: '+60 12-333 4444',
    avatarUrl: PHOTOS.women[2],
    className: 'Kindergarten A',
    bio: 'Lead Teacher for KA. Helping children express themselves through color.',
    subjects: ['Art', 'English']
  },
  {
    id: 't5',
    name: 'Ms. Sarah Jenkins (KA Reading)',
    role: UserRole.TEACHER,
    email: 'sarah.j@schoolfam.com',
    phone: '+60 13-555 6666',
    avatarUrl: PHOTOS.women[3],
    className: 'Kindergarten A',
    bio: 'Co-Teacher for KA. I love storytelling and creative writing.',
    subjects: ['Reading', 'History']
  },
  {
    id: 't8',
    name: 'Coach James Lee (PE Teacher)',
    role: UserRole.TEACHER,
    email: 'james@schoolfam.com',
    phone: '+60 14-777 8888',
    avatarUrl: PHOTOS.men[1],
    className: 'Kindergarten A',
    bio: 'Support Teacher for KA. Healthy body, healthy mind!',
    subjects: ['PE', 'Outdoor Play']
  },

  // Kindergarten B Team (Plus Mrs. Davis)
  {
    id: 't4',
    name: 'Mr. David Kim (Math Teacher)',
    role: UserRole.TEACHER,
    email: 'david@schoolfam.com',
    phone: '+60 16-222 3333',
    avatarUrl: PHOTOS.men[2],
    className: 'Kindergarten B',
    bio: 'Co-Teacher for KB. Focusing on building strong foundations in math.',
    subjects: ['Math', 'Logic']
  },
  {
    id: 't7',
    name: 'Mrs. Patricia Green (Librarian)',
    role: UserRole.TEACHER,
    email: 'patricia@schoolfam.com',
    phone: '+60 18-999 0000',
    avatarUrl: PHOTOS.women[4],
    className: 'Kindergarten B',
    bio: 'Support Teacher for KB. Books are a portal to magic.',
    subjects: ['Library', 'Music']
  },

  // Kindergarten C Team
  {
    id: 't2',
    name: 'Mr. Robert Wilson (Music Teacher)',
    role: UserRole.TEACHER,
    email: 'robert@schoolfam.com',
    phone: '+60 17-111 2222',
    avatarUrl: PHOTOS.men[3],
    className: 'Kindergarten C',
    bio: 'Lead Teacher for KC. Teaching rhythm and melody to young minds.',
    subjects: ['Music', 'Math']
  },
  {
    id: 't6',
    name: 'Mr. Michael Brown (Science Teacher)',
    role: UserRole.TEACHER,
    email: 'michael@schoolfam.com',
    phone: '+60 19-444 5555',
    avatarUrl: PHOTOS.men[4],
    className: 'Kindergarten C',
    bio: 'Co-Teacher for KC. Encouraging curiosity and critical thinking.',
    subjects: ['Science', 'STEM']
  },
  {
    id: 't9',
    name: 'Ms. Laura White (Art Teacher)',
    role: UserRole.TEACHER,
    email: 'laura@schoolfam.com',
    phone: '+60 12-666 7777',
    avatarUrl: PHOTOS.women[5],
    className: 'Kindergarten C',
    bio: 'Support Teacher for KC. Art and emotional well-being focus.',
    subjects: ['Art', 'Social Studies']
  }
];

export const MOCK_USERS: User[] = [
  MOCK_PARENT_USER,
  MOCK_TEACHER_USER,
  MOCK_SUPER_ADMIN,
  ...MOCK_ADDITIONAL_TEACHERS,
  {
    id: 'u3',
    name: 'Leo\'s Dad',
    role: UserRole.PARENT,
    email: 'leo@example.com',
    phone: '+60 13-123 4567',
    avatarUrl: PHOTOS.men[5]
  },
  {
    id: 'u4',
    name: 'Noah\'s Mom',
    role: UserRole.PARENT,
    email: 'noah@example.com',
    phone: '+60 14-987 6543',
    avatarUrl: PHOTOS.women[6]
  }
];

export const MOCK_CLASSES: SchoolClass[] = [
  {
    id: 'cl_KA',
    name: 'Kindergarten A',
    level: 'Kindergarten',
    description: 'Lead: Ms. Emily Chen. Focus on nature, outdoor activities, and foundational social skills.',
    capacity: 20,
    teacherId: 't3', 
    status: 'active'
  },
  {
    id: 'cl_KB',
    name: 'Kindergarten B',
    level: 'Kindergarten',
    description: 'Lead: Mrs. Jennifer Davis. A fun and engaging environment focusing on literacy and math.',
    capacity: 20,
    teacherId: 'u2',
    status: 'active'
  },
  {
    id: 'cl_KC',
    name: 'Kindergarten C',
    level: 'Kindergarten',
    description: 'Lead: Mr. Robert Wilson. Creative arts and music integration program.',
    capacity: 20,
    teacherId: 't2', 
    status: 'active'
  }
];

export const MOCK_REFERRAL_CODES: ReferralCode[] = [
  { id: 'rc_2', code: 'TEACHER-2024', forRole: UserRole.TEACHER, status: 'active', createdBy: 'admin_1', createdAt: new Date().toISOString() },
];

export const MOCK_CHILD: Child = {
  id: 'c1',
  name: 'Lily Anderson',
  age: 5,
  class: 'Kindergarten B',
  avatarUrl: PHOTOS.girls[0],
  attendanceStatus: 'present',
  parentId: 'u1',
  medicalConditions: 'Mild Asthma',
  medicalNotes: 'Inhaler in backpack front pocket.',
  allergies: 'Peanuts',
  bloodType: 'O+',
  emergencyContact: { name: 'Sarah Anderson', phone: '+60 12-345 6789', relation: 'Mother' },
  accessCode: 'STU-1001'
};

export const MOCK_FAMILY_CHILDREN: Child[] = [
  MOCK_CHILD
];

// --- 45 STUDENTS (15 per class) ---
const generateStudents = (): Child[] => {
  const students: Child[] = [];
  
  let boyIdx = 0;
  let girlIdx = 0;

  // Helper to pick unique photo sequentially
  const getNextPhoto = (gender: 'boy' | 'girl') => {
    if (gender === 'boy') {
        const url = PHOTOS.boys[boyIdx % PHOTOS.boys.length];
        boyIdx++;
        return url;
    } else {
        const url = PHOTOS.girls[girlIdx % PHOTOS.girls.length];
        girlIdx++;
        return url;
    }
  };

  // Kindergarten A (15)
  const rosterA = [
    { n: 'Ethan Anderson', g: 'boy' }, { n: 'Oliver Smith', g: 'boy' }, { n: 'Sophia Johnson', g: 'girl' },
    { n: 'Jackson Williams', g: 'boy' }, { n: 'Ava Brown', g: 'girl' }, { n: 'Lucas Miller', g: 'boy' },
    { n: 'Mia Davis', g: 'girl' }, { n: 'Henry Wilson', g: 'boy' }, { n: 'Evelyn Moore', g: 'girl' },
    { n: 'Alexander Taylor', g: 'boy' }, { n: 'Harper White', g: 'girl' }, { n: 'Sebastian Harris', g: 'boy' },
    { n: 'Ella Martin', g: 'girl' }, { n: 'Jack Thompson', g: 'boy' }, { n: 'Aria Garcia', g: 'girl' }
  ];

  rosterA.forEach((s, idx) => {
    students.push({
      id: `c_A${idx+1}`,
      name: s.n,
      age: 5,
      class: 'Kindergarten A',
      avatarUrl: getNextPhoto(s.g as 'boy'|'girl'),
      attendanceStatus: idx % 6 === 0 ? 'absent' : idx % 7 === 0 ? 'late' : 'present',
      accessCode: `KA-${100+idx}`
    });
  });

  // Kindergarten B (15)
  const rosterB = [
    { n: 'Lily Anderson', g: 'girl' }, { n: 'Leo Miller', g: 'boy' }, { n: 'Noah Wilson', g: 'boy' },
    { n: 'Emma Taylor', g: 'girl' }, { n: 'James Martinez', g: 'boy' }, { n: 'Isabella Robinson', g: 'girl' },
    { n: 'Benjamin Clark', g: 'boy' }, { n: 'Charlotte Rodriguez', g: 'girl' }, { n: 'William Lewis', g: 'boy' },
    { n: 'Amelia Lee', g: 'girl' }, { n: 'Mason Walker', g: 'boy' }, { n: 'Elijah Hall', g: 'boy' },
    { n: 'Abigail Allen', g: 'girl' }, { n: 'Logan Young', g: 'boy' }, { n: 'Emily King', g: 'girl' }
  ];

  rosterB.forEach((s, idx) => {
    let id = `c_B${idx+1}`;
    let parentId = undefined;
    if (idx === 0) { id = 'c1'; parentId = 'u1'; }
    if (idx === 1) { id = 'c2'; parentId = 'u3'; }
    if (idx === 2) { id = 'c3'; parentId = 'u4'; }
    if (idx === 3) { id = 'c4'; }

    students.push({
      id,
      name: s.n,
      age: 5,
      class: 'Kindergarten B',
      avatarUrl: getNextPhoto(s.g as 'boy'|'girl'),
      attendanceStatus: idx === 1 ? 'absent' : idx === 2 ? 'late' : 'present',
      parentId,
      accessCode: `KB-${100+idx}`
    });
  });

  // Kindergarten C (15)
  const rosterC = [
    { n: 'Lucas Jones', g: 'boy' }, { n: 'Mia Garcia', g: 'girl' }, { n: 'Mason Martinez', g: 'boy' },
    { n: 'Charlotte Hernandez', g: 'girl' }, { n: 'Amelia Lopez', g: 'girl' }, { n: 'Harper Gonzalez', g: 'girl' },
    { n: 'Daniel Scott', g: 'boy' }, { n: 'Sofia Green', g: 'girl' }, { n: 'Matthew Adams', g: 'boy' },
    { n: 'Scarlett Baker', g: 'girl' }, { n: 'Joseph Nelson', g: 'boy' }, { n: 'Victoria Carter', g: 'girl' },
    { n: 'Samuel Mitchell', g: 'boy' }, { n: 'Grace Perez', g: 'girl' }, { n: 'David Roberts', g: 'boy' }
  ];

  rosterC.forEach((s, idx) => {
    students.push({
      id: `c_C${idx+1}`,
      name: s.n,
      age: 5,
      class: 'Kindergarten C',
      avatarUrl: getNextPhoto(s.g as 'boy'|'girl'),
      attendanceStatus: idx % 5 === 0 ? 'excused' : 'present',
      accessCode: `KC-${100+idx}`
    });
  });

  return students;
};

export const MOCK_CLASS_ROSTER: Child[] = generateStudents();

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    studentIds: ['c1'],
    type: 'learning',
    title: 'Morning Circle Time',
    description: 'We learned about the solar system today! Lily was very excited to share that she knows Jupiter is the biggest planet.',
    timestamp: '09:30 AM',
    teacherName: 'Mrs. Jennifer Davis (Class KB Lead)',
    likes: 12,
    imageUrls: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=1000']
  },
  {
    id: 'a2',
    studentIds: ['c1'],
    type: 'food',
    title: 'Lunch Time',
    description: 'Ate all her vegetables (carrots and peas). Had a slice of apple pie for dessert.',
    timestamp: '12:15 PM',
    teacherName: 'Mrs. Jennifer Davis (Class KB Lead)',
    likes: 5
  },
  {
    id: 'a3',
    studentIds: ['c1', 'c2'],
    type: 'play',
    title: 'Outdoor Play',
    description: 'Played on the swings and built a sandcastle with Leo.',
    timestamp: '02:00 PM',
    teacherName: 'Mrs. Jennifer Davis (Class KB Lead)',
    likes: 8,
    imageUrls: ['https://images.unsplash.com/photo-1596464716127-f9a0859b4bce?auto=format&fit=crop&q=80&w=1000']
  },
  {
    id: 'a4',
    studentIds: ['c1'],
    type: 'nap',
    title: 'Afternoon Nap',
    description: 'Slept peacefully for 45 minutes.',
    timestamp: '01:00 PM',
    teacherName: 'Mrs. Jennifer Davis (Class KB Lead)',
    likes: 3
  },
  {
    id: 'a5',
    studentIds: ['all'],
    type: 'learning',
    title: 'Art Class: Finger Painting',
    description: 'The children expressed their creativity today using bright colors! It was a bit messy but lots of fun.',
    timestamp: '10:45 AM',
    teacherName: 'Ms. Emily Chen (Class KA Lead)',
    likes: 15,
    imageUrls: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=1000']
  }
];

export const MOCK_HEALTH_DATA: HealthRecord[] = [
  { id: 'h1', studentId: 'c1', date: '2023-10', height: 110, weight: 18.5 },
  { id: 'h2', studentId: 'c1', date: '2023-09', height: 109.5, weight: 18.2 },
  { id: 'h3', studentId: 'c1', date: '2023-08', height: 109, weight: 18.0 }
];

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv_001', title: 'Term 1 Tuition', amount: 1500, dueDate: '2023-12-01', status: 'pending', studentName: 'Lily Anderson', studentId: 'c1' },
  { id: 'inv_002', title: 'Field Trip: Zoo', amount: 50, dueDate: '2023-11-15', status: 'paid', studentName: 'Lily Anderson', studentId: 'c1' },
  { id: 'inv_003', title: 'Art Supplies', amount: 30, dueDate: '2023-10-01', status: 'overdue', studentName: 'Lily Anderson', studentId: 'c1' }
];

export const MOCK_EVENTS: SchoolEvent[] = [
  { 
    id: 'e1', 
    title: 'Science Fair', 
    date: new Date(new Date().setDate(new Date().getDate() + 5)), // 5 days from now
    category: 'school', 
    subType: 'activity', 
    description: 'Annual science fair exhibition.',
    startTime: '09:00 AM',
    endTime: '02:00 PM',
    location: 'School Hall',
    rsvpReq: true
  },
  { 
    id: 'e2', 
    title: 'Class Photo Day', 
    date: new Date(new Date().setDate(new Date().getDate() + 10)), 
    category: 'class', 
    subType: 'other', 
    description: 'Wear full uniform.',
    classId: 'Kindergarten B'
  }
];

export const MOCK_DOCUMENTS: SchoolDocument[] = [
  { id: 'd1', title: 'Term 1 Report Card', type: 'report', date: '2023-11-01', size: '1.2 MB', downloadUrl: '#', requiresSignature: true, isSigned: false, studentId: 'c1', studentName: 'Lily Anderson' },
  { id: 'd2', title: 'Parent Handbook', type: 'policy', date: '2023-08-15', size: '3.5 MB', downloadUrl: '#' },
  { id: 'd3', title: 'Field Trip Permission Form', type: 'form', date: '2023-10-20', size: '0.5 MB', downloadUrl: '#', requiresSignature: true, isSigned: true, signedDate: '2023-10-22', studentId: 'c1', studentName: 'Lily Anderson' }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'New Homework Assigned', message: 'Math worksheet due Friday.', type: 'info', timestamp: '2h ago', isRead: false },
  { id: 'n2', title: 'Payment Reminder', message: 'Term 1 Tuition is due soon.', type: 'reminder', timestamp: '5h ago', isRead: false },
  { id: 'n3', title: 'School Closed', message: 'School closed tomorrow due to weather.', type: 'urgent', timestamp: '1d ago', isRead: true }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann1', title: 'Winter Break Schedule', content: 'School will be closed from Dec 20 to Jan 5 for winter break.', type: 'school', author: 'Principal Skinner', date: 'Oct 25, 2023', priority: 'normal' },
  { id: 'ann2', title: 'Flu Season Advisory', content: 'Please keep children home if they show symptoms of flu.', type: 'emergency', author: 'Nurse Joy', date: 'Nov 01, 2023', priority: 'high' }
];

export const MOCK_GUARDIANS: Record<string, Guardian[]> = {
  'c1': [
    { id: 'g1', name: 'Sarah Anderson', relation: 'Mother', imageUrl: PHOTOS.women[0], phone: '+60 12-345 6789' },
    { id: 'g2', name: 'John Anderson', relation: 'Father', imageUrl: PHOTOS.men[2], phone: '+60 19-765 4321' },
    { id: 'g3', name: 'Grandma Mary', relation: 'Grandmother', imageUrl: PHOTOS.women[4], phone: '+60 13-987 6543' }
  ]
};

export const MOCK_PICKUP_SESSIONS: Record<string, PickupSession> = {
  'c1': { studentId: 'c1', status: 'pending', timestamp: new Date() },
  'c2': { studentId: 'c2', status: 'picked_up', timestamp: new Date(), method: 'Guardian', guardianId: 'g_leo_dad' }
};

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: 'at1', studentId: 'c1', date: new Date().toISOString().split('T')[0], status: 'present', recordedBy: 'Mrs. Davis', timestamp: new Date().toISOString() },
  { id: 'at2', studentId: 'c2', date: new Date().toISOString().split('T')[0], status: 'absent', remarks: 'Sick leave', recordedBy: 'Mrs. Davis', timestamp: new Date().toISOString() }
];

export const MOCK_ABSENCE_REQUESTS: AbsenceRequest[] = [
  { id: 'ar1', studentId: 'c1', studentName: 'Lily Anderson', startDate: '2023-11-20', endDate: '2023-11-22', reason: 'Family Wedding', status: 'pending', requestedOn: '2023-11-01' }
];

export const MOCK_INCIDENTS: Incident[] = [
  { id: 'inc1', studentId: 'c1', title: 'Minor Fall', description: 'Tripped while running in the playground. Scraped knee.', date: '2023-10-15', time: '10:30 AM', location: 'Playground', severity: 'low', actionTaken: 'Cleaned wound and applied band-aid.', reportedBy: 'Mrs. Davis', acknowledgedByParent: true, acknowledgedAt: '2023-10-15T17:00:00Z' }
];

export const MOCK_SHOP_ITEMS: ShopItem[] = [
  { id: 's1', title: 'School Uniform Set', description: 'Standard uniform including shirt and trousers/skirt.', price: 45.00, category: 'uniform', stock: 50, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400' },
  { id: 's2', title: 'PE Kit', description: 'T-shirt and shorts for physical education.', price: 30.00, category: 'uniform', stock: 30, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=400' },
  { id: 's3', title: 'Math Workbook', description: 'Kindergarten level math practice book.', price: 12.50, category: 'books', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400' },
  { id: 's4', title: 'School Backpack', description: 'Durable backpack with school logo.', price: 25.00, category: 'merchandise', stock: 20, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400' }
];

export const MOCK_SHOP_ORDERS: ShopOrder[] = [
  { id: 'ord_1', parentId: 'u1', parentName: 'Sarah Anderson', items: [{ id: 's3', title: 'Math Workbook', description: '', price: 12.50, category: 'books', stock: 100, imageUrl: '', quantity: 1 }], total: 12.50, status: 'delivered', type: 'pickup', timestamp: '2023-10-05T10:00:00Z' }
];

export const MOCK_FEEDBACK_TICKETS: FeedbackTicket[] = [
  { id: 'fb1', parentId: 'u1', parentName: 'Sarah Anderson', childId: 'c1', category: 'communication', priority: 'low', status: 'closed', subject: 'App notification issue', description: 'I am not receiving notifications for messages.', createdAt: '2023-09-20T09:00:00Z', updatedAt: '2023-09-21T10:00:00Z', comments: [], resolutionNotes: 'Fixed by updating app settings.' }
];

export const MOCK_HOMEWORK: Homework[] = [
  { id: 'hw1', title: 'Draw your family', subject: 'Art', description: 'Draw a picture of your family members.', dueDate: '2023-11-10', assignedDate: '2023-11-06', studentId: 'all' }
];

export const MOCK_CHANNELS: ChatChannel[] = [
  { id: 'ch1', name: 'Kindergarten B Parents', type: 'group', participants: ['u1', 'u2', 'u3', 'u4'], lastMessage: 'Don\'t forget the field trip tomorrow!', unreadCount: 2, avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=KB' },
  { id: 'ch2', name: 'Mrs. Jennifer Davis (Class KB Lead)', type: 'direct', participants: ['u1', 'u2'], lastMessage: 'Lily did great today!', unreadCount: 0, avatarUrl: PHOTOS.women[1] }
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', channelId: 'ch2', senderId: 'u2', senderName: 'Mrs. Jennifer Davis (Class KB Lead)', senderAvatar: PHOTOS.women[1], content: 'Hi Sarah, just wanted to let you know Lily was very helpful today during cleanup.', timestamp: 'Yesterday', fullTimestamp: new Date(Date.now() - 86400000), isRead: true },
  { id: 'm2', channelId: 'ch2', senderId: 'u1', senderName: 'Sarah Anderson', senderAvatar: PHOTOS.women[0], content: 'That is wonderful to hear! Thank you Mrs. Davis.', timestamp: 'Yesterday', fullTimestamp: new Date(Date.now() - 86000000), isRead: true },
  { id: 'm3', channelId: 'ch2', senderId: 'u2', senderName: 'Mrs. Jennifer Davis (Class KB Lead)', senderAvatar: PHOTOS.women[1], content: 'You are welcome!', timestamp: 'Yesterday', fullTimestamp: new Date(Date.now() - 85000000), isRead: true }
];
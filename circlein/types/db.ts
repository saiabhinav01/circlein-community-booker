export type UserRole = 'resident' | 'admin';

export interface UserDoc {
  name: string;
  email: string;
  role: UserRole;
  createdAt: FirebaseFirestore.Timestamp | any;
}

export interface AmenityDoc {
  name: string;
  description: string;
  imageUrl: string;
  rules: {
    maxSlotsPerFamily: number;
    blackoutDates: any[]; // Firestore Timestamp[]
  };
}

export interface BookingDoc {
  amenityId: string;
  userId: string;
  attendees: string[];
  startTime: any; // Firestore Timestamp
  endTime: any; // Firestore Timestamp
  status: 'confirmed' | 'cancelled' | 'waitlisted';
  qrId: string;
}

export interface AccessCodeDoc {
  code: string;
  isUsed: boolean;
  usedBy?: string;
  createdAt: any; // Firestore Timestamp
}

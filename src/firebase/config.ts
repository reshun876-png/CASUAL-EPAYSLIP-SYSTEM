import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  TemporalStaff,
  PayrollCycle,
  Payslip,
  JobCategory,
  UserAccount,
  AuditLogEntry,
} from '../types/payroll';

// 1. Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firestore with specific database ID (CRITICAL requirement)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 3. Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 4. Standardized Firestore Error Handling per Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 5. Connection Test Validator
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, working in local vault mode.');
      return false;
    }
    // Any other response confirms the network reached the server
    return true;
  }
}

// Auto-run connection test on boot
testConnection();

// 6. Firestore Database Operations for Healthcare Entities

// Staff Roster
export async function syncStaffWithFirestore(staffList: TemporalStaff[]): Promise<void> {
  const path = 'staff';
  try {
    for (const staff of staffList) {
      await setDoc(doc(db, path, staff.id), staff, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadStaffFromFirestore(): Promise<TemporalStaff[] | null> {
  const path = 'staff';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as TemporalStaff);
  } catch (error) {
    console.warn('Could not fetch staff from Firestore, falling back to local vault:', error);
    return null;
  }
}

export async function deleteStaffFromFirestore(staffId: string): Promise<void> {
  const path = `staff/${staffId}`;
  try {
    await deleteDoc(doc(db, 'staff', staffId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Job Categories
export async function syncJobCategoriesWithFirestore(categories: JobCategory[]): Promise<void> {
  const path = 'jobCategories';
  try {
    for (const cat of categories) {
      await setDoc(doc(db, path, cat.id), cat, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadJobCategoriesFromFirestore(): Promise<JobCategory[] | null> {
  const path = 'jobCategories';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as JobCategory);
  } catch (error) {
    console.warn('Could not fetch categories from Firestore:', error);
    return null;
  }
}

// System Users
export async function syncUsersWithFirestore(users: UserAccount[]): Promise<void> {
  const path = 'users';
  try {
    for (const user of users) {
      await setDoc(doc(db, path, user.id), user, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUsersFromFirestore(): Promise<UserAccount[] | null> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as UserAccount);
  } catch (error) {
    console.warn('Could not fetch users from Firestore:', error);
    return null;
  }
}

// Payroll Cycles
export async function syncPayrollCyclesWithFirestore(cycles: PayrollCycle[]): Promise<void> {
  const path = 'payrollCycles';
  try {
    for (const cycle of cycles) {
      await setDoc(doc(db, path, cycle.id), cycle, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadPayrollCyclesFromFirestore(): Promise<PayrollCycle[] | null> {
  const path = 'payrollCycles';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as PayrollCycle);
  } catch (error) {
    console.warn('Could not fetch cycles from Firestore:', error);
    return null;
  }
}

// Payslips
export async function syncPayslipsWithFirestore(payslips: Payslip[]): Promise<void> {
  const path = 'payslips';
  try {
    for (const p of payslips) {
      await setDoc(doc(db, path, p.id), p, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadPayslipsFromFirestore(): Promise<Payslip[] | null> {
  const path = 'payslips';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as Payslip);
  } catch (error) {
    console.warn('Could not fetch payslips from Firestore:', error);
    return null;
  }
}

// Audit Logs (Append-Only)
export async function addAuditLogToFirestore(entry: AuditLogEntry): Promise<void> {
  const path = `auditLogs/${entry.id}`;
  try {
    await setDoc(doc(db, 'auditLogs', entry.id), entry);
  } catch (error) {
    console.warn('Could not write audit entry to Firestore:', error);
  }
}

export async function loadAuditLogsFromFirestore(): Promise<AuditLogEntry[] | null> {
  const path = 'auditLogs';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as AuditLogEntry);
  } catch (error) {
    console.warn('Could not fetch audit logs from Firestore:', error);
    return null;
  }
}

export { signInWithPopup, signOut };

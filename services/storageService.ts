import { Device, DashboardStats } from "../types";
import { db, auth } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  orderBy 
} from "firebase/firestore";

const COLLECTION_NAME = 'devices';

export const getDevices = async (): Promise<Device[]> => {
  if (!db || !auth?.currentUser) return [];

  try {
    // NOTE: We are not using orderBy("createdAt", "desc") in the query 
    // to avoid requiring a composite index immediately. 
    // We will sort the results in the client logic below.
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("userId", "==", auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const devices: Device[] = [];
    
    querySnapshot.forEach((doc) => {
      devices.push({ id: doc.id, ...doc.data() } as Device);
    });
    
    // Sort by createdAt descending (newest first)
    return devices.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (e) {
    console.error("Failed to fetch devices:", e);
    throw e; // Re-throw so the UI can handle it
  }
};

export const saveDevice = async (device: Omit<Device, 'id' | 'userId'>): Promise<string> => {
  if (!db || !auth?.currentUser) throw new Error("User not authenticated");
  
  const userId = auth.currentUser.uid;

  // --- DUPLICATE CHECK ---
  // Check if a device with the same serial number already exists for this user
  if (device.device_serial && device.device_serial.trim() !== "") {
    try {
      const duplicateQuery = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        where("device_serial", "==", device.device_serial)
      );
      
      const snapshot = await getDocs(duplicateQuery);
      
      if (!snapshot.empty) {
        // Found a duplicate!
        throw new Error("Duplicate Entry: You have already registered a device with this serial number.");
      }
    } catch (e: any) {
      // If the error is the one we just threw, re-throw it
      if (e.message.includes("Duplicate Entry")) {
        throw e;
      }
      // If it's a Firestore index error or other permission error, we log it but might proceed 
      // or let the main try-catch handle it. 
      // But usually, a simple where clause on one field shouldn't fail if rules are correct.
      console.warn("Duplicate check failed (proceeding with save):", e);
    }
  }

  try {
    const deviceWithUser = {
      ...device,
      userId: userId,
      createdAt: Date.now()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), deviceWithUser);
    return docRef.id;
  } catch (e) {
    console.error("Failed to save device:", e);
    throw e;
  }
};

export const deleteDevice = async (id: string): Promise<void> => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (e) {
    console.error("Failed to delete device:", e);
    throw e;
  }
};

export const calculateStats = (devices: Device[]): DashboardStats => {
  const now = new Date();
  
  const active = devices.filter(d => {
    if (!d.expiry_date) return true; 
    return new Date(d.expiry_date) > now;
  }).length;

  const expiringSoon = devices.filter(d => {
    if (!d.expiry_date) return false;
    const expiry = new Date(d.expiry_date);
    const diffTime = Math.abs(expiry.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60 && expiry > now; // Expiring in next 60 days
  }).length;

  return {
    total: devices.length,
    active,
    expiringSoon
  };
};
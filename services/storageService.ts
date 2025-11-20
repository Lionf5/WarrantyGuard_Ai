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
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const devices: Device[] = [];
    
    querySnapshot.forEach((doc) => {
      devices.push({ id: doc.id, ...doc.data() } as Device);
    });
    
    return devices;
  } catch (e) {
    console.error("Failed to fetch devices:", e);
    return [];
  }
};

export const saveDevice = async (device: Omit<Device, 'id' | 'userId'>): Promise<string> => {
  if (!db || !auth?.currentUser) throw new Error("User not authenticated");

  try {
    const deviceWithUser = {
      ...device,
      userId: auth.currentUser.uid,
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
import {
  collection, getDocs, getDoc, doc, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

export async function getWallpapers() {
  try {
    const s = await getDocs(query(collection(db, "wallpapers"), orderBy("createdAt", "desc")));
    return s.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    try {
      const s = await getDocs(collection(db, "wallpapers"));
      return s.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { return []; }
  }
}

export async function getCategories() {
  try {
    const s = await getDocs(query(collection(db, "categories"), orderBy("order", "asc")));
    return s.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    try {
      const s = await getDocs(collection(db, "categories"));
      return s.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { return []; }
  }
}

export async function getWallpaper(id) {
  const s = await getDoc(doc(db, "wallpapers", id));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}

export function subscribeWallpapers(callback, onError = () => {}) {
  return onSnapshot(collection(db, "wallpapers"), snap => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
      const ta = a.createdAt?.seconds ?? 0, tb = b.createdAt?.seconds ?? 0;
      return tb - ta;
    });
    callback(rows);
  }, onError);
}

export function subscribeCategories(callback, onError = () => {}) {
  return onSnapshot(collection(db, "categories"), snap => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    callback(rows);
  }, onError);
}

export async function getSiteSettings() {
  try {
    const s = await getDoc(doc(db, "settings", "site"));
    return s.exists() ? s.data() : {};
  } catch { return {}; }
}

export function subscribeSiteSettings(callback, onError = () => {}) {
  return onSnapshot(doc(db, "settings", "site"), snap => {
    callback(snap.exists() ? snap.data() : {});
  }, onError);
}

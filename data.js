import {
  collection, getDocs, getDoc, doc, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

function normalizeWallpaper(d) {
  const x = d.data ? d.data() : d;
  return {
    id: d.id || x.id,
    ...x,
    title: String(x.title || "Untitled"),
    category: String(x.category || ""),
    categoryId: String(x.categoryId || ""),
    imageUrl: String(x.imageUrl || x.image || x.originalUrl || ""),
    thumbnailUrl: String(x.thumbnailUrl || x.imageUrl || x.image || x.originalUrl || ""),
    tags: Array.isArray(x.tags) ? x.tags : String(x.tags || "").split(",").map(v => v.trim()).filter(Boolean),
    isPublished: x.isPublished !== false
  };
}

function normalizeCategory(d) {
  const x = d.data ? d.data() : d;
  return {
    id: d.id || x.id,
    ...x,
    name: String(x.name || "Untitled"),
    slug: String(x.slug || x.name || "").toLowerCase(),
    order: Number(x.order) || 0
  };
}

export async function getWallpapers() {
  try {
    const s = await getDocs(query(collection(db, "wallpapers"), orderBy("createdAt", "desc")));
    return s.docs.map(normalizeWallpaper);
  } catch (error) {
    console.warn("Ordered wallpaper query failed; using fallback:", error);
    try {
      const s = await getDocs(collection(db, "wallpapers"));
      return s.docs.map(normalizeWallpaper);
    } catch (fallbackError) {
      console.error("Could not read wallpapers:", fallbackError);
      return [];
    }
  }
}

export async function getCategories() {
  try {
    const s = await getDocs(query(collection(db, "categories"), orderBy("order", "asc")));
    return s.docs.map(normalizeCategory);
  } catch (error) {
    console.warn("Ordered category query failed; using fallback:", error);
    try {
      const s = await getDocs(collection(db, "categories"));
      return s.docs.map(normalizeCategory).sort((a,b) => a.order - b.order);
    } catch (fallbackError) {
      console.error("Could not read categories:", fallbackError);
      return [];
    }
  }
}

export async function getWallpaper(id) {
  const s = await getDoc(doc(db, "wallpapers", id));
  return s.exists() ? normalizeWallpaper(s) : null;
}

export function subscribeWallpapers(callback, onError = () => {}) {
  return onSnapshot(
    collection(db, "wallpapers"),
    snap => {
      const rows = snap.docs.map(normalizeWallpaper);
      rows.sort((a, b) => {
        const ta = a.createdAt?.seconds ?? 0, tb = b.createdAt?.seconds ?? 0;
        return tb - ta;
      });
      callback(rows);
    },
    error => {
      console.error("Realtime wallpaper sync failed:", error);
      onError(error);
    }
  );
}

export function subscribeCategories(callback, onError = () => {}) {
  return onSnapshot(
    collection(db, "categories"),
    snap => {
      const rows = snap.docs.map(normalizeCategory);
      rows.sort((a, b) => a.order - b.order);
      callback(rows);
    },
    error => {
      console.error("Realtime category sync failed:", error);
      onError(error);
    }
  );
}

export async function getSiteSettings() {
  try {
    const s = await getDoc(doc(db, "settings", "site"));
    return s.exists() ? s.data() : {};
  } catch (error) {
    console.error("Could not read site settings:", error);
    return {};
  }
}

export function subscribeSiteSettings(callback, onError = () => {}) {
  return onSnapshot(
    doc(db, "settings", "site"),
    snap => callback(snap.exists() ? snap.data() : {}),
    error => {
      console.error("Realtime site settings sync failed:", error);
      onError(error);
    }
  );
}

import {
  collection, doc, setDoc, addDoc, updateDoc, deleteDoc, getDocs,
  serverTimestamp, query, orderBy, getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { isAdmin, waitForAuthReady } from "./auth.js";

export async function requireAdmin() {
  try {
    // Firebase Auth restores the persisted session asynchronously.
    // Waiting here prevents a valid admin from being redirected to home
    // simply because auth.currentUser was still null during page startup.
    const user = await waitForAuthReady();

    if (!user) {
      location.href = "./login.html?next=admin";
      return false;
    }

    if (!(await isAdmin())) {
      location.href = "./index.html";
      return false;
    }

    return true;
  } catch (error) {
    console.error("Admin authorization error:", error);
    location.href = "./index.html";
    return false;
  }
}

function clean(value) {
  return String(value ?? "").trim();
}

export async function createCategory(name, slug, order = 0) {
  name = clean(name);
  slug = clean(slug).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!name || !slug) throw new Error("Category name and slug are required.");
  return addDoc(collection(db, "categories"), {
    name, slug, order: Number(order) || 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
}

export async function updateCategory(id, name, slug, order = 0) {
  name = clean(name);
  slug = clean(slug).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!name || !slug) throw new Error("Category name and slug are required.");
  return updateDoc(doc(db, "categories", id), {
    name, slug, order: Number(order) || 0, updatedAt: serverTimestamp()
  });
}

export async function listCategories() {
  const s = await getDocs(query(collection(db, "categories"), orderBy("order", "asc")));
  return s.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteCategory(id) {
  return deleteDoc(doc(db, "categories", id));
}

export async function createWallpaper(data) {
  const title = clean(data.title);
  const imageUrl = clean(data.imageUrl);
  if (!title) throw new Error("Title is required.");
  if (!/^https?:\/\//i.test(imageUrl)) throw new Error("Enter a valid public image URL.");
  const thumbnailUrl = clean(data.thumbnailUrl) || imageUrl;

  const payload = {
    title,
    category: clean(data.category),
    tags: clean(data.tags).split(",").map(x => x.trim()).filter(Boolean),
    device: clean(data.device) || "mobile",
    description: clean(data.description),
    featured: Boolean(data.featured),
    isPublished: data.isPublished !== false,
    imageUrl,
    thumbnailUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const d = await addDoc(collection(db, "wallpapers"), payload);
  return { id: d.id, ...payload };
}

export async function updateWallpaper(id, data) {
  const patch = {
    ...data,
    title: clean(data.title),
    category: clean(data.category),
    description: clean(data.description),
    imageUrl: clean(data.imageUrl),
    thumbnailUrl: clean(data.thumbnailUrl) || clean(data.imageUrl),
    updatedAt: serverTimestamp()
  };
  if (!/^https?:\/\//i.test(patch.imageUrl)) throw new Error("Enter a valid public image URL.");
  return updateDoc(doc(db, "wallpapers", id), patch);
}

export async function deleteWallpaper(item) {
  // Image files live on the external CDN/image host. Firestore stores only metadata.
  return deleteDoc(doc(db, "wallpapers", item.id));
}

export async function listWallpapers() {
  const s = await getDocs(collection(db, "wallpapers"));
  return s.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getSiteSettings() {
  const s = await getDoc(doc(db, "settings", "site"));
  return s.exists() ? s.data() : {};
}

export async function saveSiteSettings(data) {
  const cleanUrl = value => {
    const v = clean(value);
    return !v || /^https?:\/\//i.test(v) ? v : "";
  };
  return setDoc(doc(db, "settings", "site"), {
    siteName: clean(data.siteName) || "PG Wallpaper",
    siteDescription: clean(data.siteDescription),
    instagramUrl: cleanUrl(data.instagramUrl),
    youtubeUrl: cleanUrl(data.youtubeUrl),
    telegramUrl: cleanUrl(data.telegramUrl),
    facebookUrl: cleanUrl(data.facebookUrl),
    xUrl: cleanUrl(data.xUrl),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

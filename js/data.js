import { collection, getDocs, getDoc, doc, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
export async function getWallpapers(){
  try{const s=await getDocs(query(collection(db,"wallpapers"),orderBy("createdAt","desc")));return s.docs.map(d=>({id:d.id,...d.data()}));}
  catch(e){console.warn("wallpapers query",e); try{const s=await getDocs(collection(db,"wallpapers"));return s.docs.map(d=>({id:d.id,...d.data()}));}catch{return[]}}
}
export async function getCategories(){try{const s=await getDocs(query(collection(db,"categories"),orderBy("order","asc")));return s.docs.map(d=>({id:d.id,...d.data()}));}catch{try{const s=await getDocs(collection(db,"categories"));return s.docs.map(d=>({id:d.id,...d.data()}));}catch{return[]}}}
export async function getWallpaper(id){const s=await getDoc(doc(db,"wallpapers",id));return s.exists()?{id:s.id,...s.data()}:null;}

import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";
import { db, storage } from "./firebase-config.js";
import { isAdmin } from "./auth.js";

export async function requireAdmin(){if(!(await isAdmin())){location.href="index.html";return false;}return true;}
export async function createCategory(name,slug,order=0){return addDoc(collection(db,"categories"),{name:name.trim(),slug:slug.trim().toLowerCase(),order:Number(order)||0,createdAt:serverTimestamp()});}
export async function listCategories(){const s=await getDocs(query(collection(db,"categories"),orderBy("order","asc")));return s.docs.map(d=>({id:d.id,...d.data()}));}
export async function deleteCategory(id){return deleteDoc(doc(db,"categories",id));}
export async function uploadWallpaper({file,title,category,tags,device,description,featured}){
  if(!file||!file.type.startsWith("image/"))throw new Error("Select an image file.");
  if(file.size>25*1024*1024)throw new Error("Maximum file size is 25 MB.");
  const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
  const path=`wallpapers/${crypto.randomUUID()}-${safe}`;
  const storageRef=ref(storage,path); await uploadBytes(storageRef,file,{contentType:file.type,cacheControl:"public,max-age=31536000"});
  const url=await getDownloadURL(storageRef);
  const data={title:title.trim(),category:category.trim(),tags:tags.split(",").map(x=>x.trim()).filter(Boolean),device:device||"mobile",description:description.trim(),featured:Boolean(featured),imageUrl:url,storagePath:path,fileName:file.name,createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
  const d=await addDoc(collection(db,"wallpapers"),data); return {id:d.id,url};
}
export async function updateWallpaper(id,data){return updateDoc(doc(db,"wallpapers",id),{...data,updatedAt:serverTimestamp()});}
export async function deleteWallpaper(item){await deleteDoc(doc(db,"wallpapers",item.id));if(item.storagePath)try{await deleteObject(ref(storage,item.storagePath))}catch(e){console.warn(e)} }
export async function listWallpapers(){const s=await getDocs(collection(db,"wallpapers"));return s.docs.map(d=>({id:d.id,...d.data()}));}

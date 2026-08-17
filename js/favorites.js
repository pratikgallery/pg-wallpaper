import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase-config.js";


/* ==================================================
   FAVORITE PATH
================================================== */

function favoriteCollection(uid) {

  return collection(
    db,
    "users",
    uid,
    "favorites"
  );

}


/* ==================================================
   ADD FAVORITE
================================================== */

export async function addFavorite(
  wallpaper
) {

  const user =
    auth.currentUser;

  if (!user) {

    return {
      success: false,
      requiresLogin: true,
      message: "Please login first."
    };

  }


  try {

    await setDoc(
      doc(
        favoriteCollection(user.uid),
        wallpaper.id
      ),
      {
        ...wallpaper,
        savedAt: serverTimestamp()
      }
    );


    return {
      success: true
    };

  } catch (error) {

    console.error(
      "Add favorite error:",
      error
    );

    return {
      success: false,
      message: error.message
    };

  }

}


/* ==================================================
   REMOVE FAVORITE
================================================== */

export async function removeFavorite(
  wallpaperId
) {

  const user =
    auth.currentUser;

  if (!user) {

    return {
      success: false,
      requiresLogin: true
    };

  }


  try {

    await deleteDoc(
      doc(
        favoriteCollection(user.uid),
        wallpaperId
      )
    );


    return {
      success: true
    };

  } catch (error) {

    console.error(
      "Remove favorite error:",
      error
    );

    return {
      success: false,
      message: error.message
    };

  }

}


/* ==================================================
   CHECK FAVORITE
================================================== */

export async function isFavorite(
  wallpaperId
) {

  const user =
    auth.currentUser;

  if (!user) {
    return false;
  }


  try {

    const snapshot =
      await getDoc(
        doc(
          favoriteCollection(user.uid),
          wallpaperId
        )
      );

    return snapshot.exists();

  } catch {

    return false;

  }

}


/* ==================================================
   GET ALL FAVORITES
================================================== */

export async function getFavorites() {

  const user =
    auth.currentUser;

  if (!user) {
    return [];
  }


  try {

    const snapshot =
      await getDocs(
        favoriteCollection(user.uid)
      );


    return snapshot.docs.map(
      item => ({
        id: item.id,
        ...item.data()
      })
    );

  } catch (error) {

    console.error(
      "Get favorites error:",
      error
    );

    return [];

  }

}

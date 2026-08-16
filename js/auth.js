import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase.js";


/* ==================================================
   CREATE USER
================================================== */

export async function signupUser(
  name,
  email,
  password
) {

  try {

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user =
      credential.user;


    /* Update Firebase profile */

    await updateProfile(
      user,
      {
        displayName: name
      }
    );


    /* Create Firestore user profile */

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        displayName: name,
        email: user.email,
        photoURL: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        merge: true
      }
    );


    return {
      success: true,
      user
    };

  } catch (error) {

    return {
      success: false,
      message: getAuthError(error)
    };

  }

}


/* ==================================================
   LOGIN
================================================== */

export async function loginUser(
  email,
  password
) {

  try {

    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    return {
      success: true,
      user: credential.user
    };

  } catch (error) {

    return {
      success: false,
      message: getAuthError(error)
    };

  }

}


/* ==================================================
   LOGOUT
================================================== */

export async function logoutUser() {

  try {

    await signOut(auth);

    return {
      success: true
    };

  } catch (error) {

    return {
      success: false,
      message: getAuthError(error)
    };

  }

}


/* ==================================================
   AUTH STATE
================================================== */

export function watchAuthState(
  callback
) {

  return onAuthStateChanged(
    auth,
    callback
  );

}


/* ==================================================
   CURRENT USER
================================================== */

export function getCurrentUser() {

  return auth.currentUser;

}


/* ==================================================
   GET USER PROFILE
================================================== */

export async function getUserProfile(
  uid
) {

  try {

    const snapshot =
      await getDoc(
        doc(db, "users", uid)
      );

    if (!snapshot.exists()) {

      return {
        success: false,
        data: null
      };

    }

    return {
      success: true,
      data: snapshot.data()
    };

  } catch (error) {

    return {
      success: false,
      data: null,
      message: getAuthError(error)
    };

  }

}


/* ==================================================
   UPDATE USER PROFILE
================================================== */

export async function updateUserProfile(
  name
) {

  try {

    const user =
      auth.currentUser;

    if (!user) {

      return {
        success: false,
        message: "You are not logged in."
      };

    }


    await updateProfile(
      user,
      {
        displayName: name
      }
    );


    await setDoc(
      doc(db, "users", user.uid),
      {
        displayName: name,
        email: user.email,
        updatedAt: serverTimestamp()
      },
      {
        merge: true
      }
    );


    return {
      success: true
    };

  } catch (error) {

    return {
      success: false,
      message: getAuthError(error)
    };

  }

}


/* ==================================================
   PASSWORD RESET
================================================== */

export async function resetPassword(
  email
) {

  try {

    await sendPasswordResetEmail(
      auth,
      email
    );

    return {
      success: true
    };

  } catch (error) {

    return {
      success: false,
      message: getAuthError(error)
    };

  }

}


/* ==================================================
   FIREBASE ERROR TRANSLATOR
================================================== */

function getAuthError(error) {

  const code =
    error?.code || "";

  switch (code) {

    case "auth/email-already-in-use":
      return "This email is already registered.";

    case "auth/invalid-email":
      return "Please enter a valid email.";

    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";

    case "auth/invalid-credential":
      return "Invalid email or password.";

    case "auth/user-not-found":
      return "No account found with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    default:
      return error?.message ||
        "Something went wrong.";
  }

}

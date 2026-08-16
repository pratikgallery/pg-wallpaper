import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase-config.js";



/* =========================================================
   SIGN UP
========================================================= */

async function registerUser(
  displayName,
  email,
  password
) {

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      userCredential.user;


    /* =========================
       FIREBASE AUTH PROFILE
    ========================= */

    await updateProfile(
      user,
      {
        displayName:
          displayName.trim()
      }
    );


    /* =========================
       FIRESTORE USER DOCUMENT
    ========================= */

    await setDoc(
      doc(
        db,
        "users",
        user.uid
      ),
      {

        uid:
          user.uid,

        displayName:
          displayName.trim(),

        email:
          user.email,

        role:
          "user",

        photoUrl:
          "",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

        isActive:
          true

      }
    );


    return {

      success:
        true,

      user:
        user

    };


  } catch (error) {

    console.error(
      "Signup error:",
      error
    );


    return {

      success:
        false,

      code:
        error.code,

      message:
        getAuthErrorMessage(
          error.code
        )

    };

  }

}



/* =========================================================
   LOGIN
========================================================= */

async function loginUser(
  email,
  password
) {

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    return {

      success:
        true,

      user:
        userCredential.user

    };


  } catch (error) {

    console.error(
      "Login error:",
      error
    );


    return {

      success:
        false,

      code:
        error.code,

      message:
        getAuthErrorMessage(
          error.code
        )

    };

  }

}



/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

  try {

    await signOut(
      auth
    );


    return {

      success:
        true

    };


  } catch (error) {

    console.error(
      "Logout error:",
      error
    );


    return {

      success:
        false,

      code:
        error.code,

      message:
        "Logout failed. Please try again."

    };

  }

}



/* =========================================================
   AUTH STATE
========================================================= */

function watchAuthState(
  callback
) {

  return onAuthStateChanged(
    auth,
    user => {

      callback(
        user
      );

    }
  );

}



/* =========================================================
   AUTH ERROR MESSAGES
========================================================= */

function getAuthErrorMessage(
  code
) {

  switch (code) {


    case "auth/email-already-in-use":

      return
        "This email is already registered.";


    case "auth/invalid-email":

      return
        "Please enter a valid email address.";


    case "auth/weak-password":

      return
        "Password is too weak.";


    case "auth/invalid-credential":

      return
        "Invalid email or password.";


    case "auth/user-not-found":

      return
        "No account found with this email.";


    case "auth/wrong-password":

      return
        "Incorrect password.";


    case "auth/too-many-requests":

      return
        "Too many attempts. Try again later.";


    case "auth/network-request-failed":

      return
        "Network error. Check your internet connection.";


    case "auth/user-disabled":

      return
        "This account has been disabled.";


    case "auth/operation-not-allowed":

      return
        "This authentication method is not enabled.";


    default:

      return
        "Authentication failed. Please try again.";

  }

}



/* =========================================================
   EXPORT
========================================================= */

export {

  registerUser,

  loginUser,

  logoutUser,

  watchAuthState

};

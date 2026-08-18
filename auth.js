import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase-config.js";


/* =========================================================
   AUTH PERSISTENCE
   Keeps user logged in after page refresh.
========================================================= */

async function ensurePersistence() {

  try {

    await setPersistence(
      auth,
      browserLocalPersistence
    );

    return true;

  } catch (error) {

    console.error(
      "Auth persistence error:",
      error
    );

    return false;

  }

}


/* =========================================================
   USER PROFILE HELPERS
========================================================= */

async function ensureUserProfile(user) {

  if (!user) return null;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const profile = {
      uid: user.uid,
      displayName: user.displayName || "PG User",
      email: user.email || "",
      role: "user",
      photoUrl: user.photoURL || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    await setDoc(userRef, profile);
    return { id: user.uid, ...profile };
  }

  return { id: snapshot.id, ...snapshot.data() };
}

async function getUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await ensureUserProfile(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    return null;
  }
}

async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.role === "admin" && profile?.isActive !== false;
}

async function updateUserName(displayName) {
  return updateUserProfile(displayName);
}

/* =========================================================
   SIGN UP
========================================================= */

async function registerUser(
  displayName,
  email,
  password
) {

  try {

    displayName =
      displayName.trim();

    email =
      email.trim().toLowerCase();


    if (!displayName) {

      return {
        success: false,
        message: "Please enter your name."
      };

    }


    if (!email) {

      return {
        success: false,
        message: "Please enter your email."
      };

    }


    if (password.length < 6) {

      return {
        success: false,
        message:
          "Password must be at least 6 characters."
      };

    }


    /* =========================
       ENABLE PERSISTENCE
    ========================= */

    await ensurePersistence();


    /* =========================
       CREATE FIREBASE ACCOUNT
    ========================= */

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      userCredential.user;


    /* =========================
       UPDATE AUTH PROFILE
    ========================= */

    await updateProfile(
      user,
      {
        displayName: displayName
      }
    );


    /*
      Firebase may update displayName
      asynchronously. Refresh the user.
    */

    await user.reload();


    /* =========================
       CREATE FIRESTORE USER
    ========================= */

    try {

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
            displayName,

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

    } catch (firestoreError) {

      /*
        Authentication account has already
        been created successfully.

        If Firestore rules temporarily block
        the profile document, don't make the
        user think account creation failed.
      */

      console.error(
        "Firestore profile error:",
        firestoreError
      );

    }


    return {

      success:
        true,

      user:
        auth.currentUser

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

    email =
      email.trim().toLowerCase();


    if (!email) {

      return {
        success: false,
        message: "Please enter your email."
      };

    }


    if (!password) {

      return {
        success: false,
        message: "Please enter your password."
      };

    }


    /* =========================
       ENABLE PERSISTENCE
    ========================= */

    await ensurePersistence();


    /* =========================
       LOGIN
    ========================= */

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    // Repair/create the Firestore profile if an older account
    // exists without a /users/{uid} document.
    try {
      await ensureUserProfile(userCredential.user);
    } catch (profileError) {
      console.warn("Firestore profile repair skipped:", profileError);
    }

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
   PASSWORD RESET
========================================================= */

async function resetPassword(
  email
) {

  try {

    email =
      email.trim().toLowerCase();


    if (!email) {

      return {

        success:
          false,

        message:
          "Please enter your email address."

      };

    }


    await sendPasswordResetEmail(
      auth,
      email
    );


    return {

      success:
        true,

      message:
        "Password reset email sent."

    };


  } catch (error) {

    console.error(
      "Password reset error:",
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

async function waitForAuthReady() {

  if (auth.currentUser) return auth.currentUser;

  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    });
  });

}

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
      return "This email is already registered.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";

    case "auth/invalid-credential":
      return "Invalid email or password.";

    case "auth/user-not-found":
      return "No account found with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/too-many-requests":
      return "Too many login attempts. Try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/operation-not-allowed":
      return "Email/password authentication is not enabled in Firebase.";

    case "auth/requires-recent-login":
      return "Please login again and retry.";

    case "auth/invalid-verification-code":
      return "The verification code is invalid.";

    case "auth/invalid-verification-id":
      return "The verification request is invalid.";

    case "auth/user-token-expired":
      return "Your session expired. Please login again.";

    case "auth/network-request-failed":
      return "Network connection failed.";

    default:
      return (
        "Authentication failed." +
        (code ? ` (${code})` : "") +
        " Please try again."
      );

  }

}



/* =========================================================
   UPDATE USER PROFILE
========================================================= */

async function updateUserProfile(displayName) {

  try {

    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        message: "Please login first."
      };
    }

    const cleanName = String(displayName || "").trim();

    if (!cleanName) {
      return {
        success: false,
        message: "Please enter a valid name."
      };
    }

    await updateProfile(user, {
      displayName: cleanName
    });

    await user.reload();

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: cleanName,
          email: user.email || "",
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (firestoreError) {
      console.warn("Firestore profile update skipped:", firestoreError);
    }

    return {
      success: true,
      user: auth.currentUser
    };

  } catch (error) {

    console.error("Update profile error:", error);

    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };

  }

}


/* =========================================================
   EXPORTS
========================================================= */

export {

  registerUser,

  loginUser,

  logoutUser,

  watchAuthState,

  waitForAuthReady,

  resetPassword,

  updateUserProfile,

  updateUserName,

  getUserProfile,

  isAdmin,

  ensureUserProfile

};

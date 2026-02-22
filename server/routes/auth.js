const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();

console.log("Auth router loaded");

// Login: create session cookie
router.post("/login", async (req, res) => {
  const { idToken } = req.body;

  console.log("ID TOKEN RECEIVED:", idToken);

  if (!idToken) {
    return res.status(400).json({ error: "Missing ID token" });
  }

  try {
    const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days

    // Create Firebase session cookie
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    //  FIXED COOKIE SETTINGS 
    res.cookie("session", sessionCookie, {
      httpOnly: true,
      secure: true,        
      sameSite: "none",    // REQUIRED for cross-site cookies
      maxAge: expiresIn,
      path: "/"
    });

    res.json({ status: "logged_in" });
  } catch (err) {
    console.error("SESSION COOKIE ERROR:", err);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("session", {
    httpOnly: true,
    secure: true,
    sameSite: "none",         // This is important to ensure the cookie is cleared in cross-site context
    path: "/"
  });
  res.json({ status: "logged_out" });
});

// Get total number of Firebase users
router.get("/total-users", async (req, res) => {
  try {
    let total = 0;
    let nextPageToken = undefined;

    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      total += result.users.length;
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    res.json({ totalUsers: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

/*
MY THOUGHTS ON THIS FILE:

im not gonna lie, idk what to do for the admin logic here. 
Im thinking i should use email and password in env or just use admin as a firebase user 
because if someone hacks into the admin panel, they can just create a firebase user and make themselves admin.
or if i use env email and password, they can just look at the code and see the email and password and ill be 
cooked, im thinking of using firebase custom claims to set admin role to a user, but that requires me to have an existing user to set the claim on.
so maybe for now, ill just use a firebase user as admin and set the custom claim on that user manually from firebase console.



So I finally figuured out the admin logic, its actually pretty simple. I will just create a firebase user and set a custom claim "admin" to true for that user. Then in the frontend, after login, i will check if the user has the admin claim and if they do, i will allow them to access the admin panel. If they dont have the admin claim, i will log them out immediately and show an error message. This way, even if someone hacks into the admin panel, they cant do anything because they wont have the admin claim. Also it was a reall headach because i kept getting these weird CORS errors and cookie issues, but i think i finally fixed it by setting the cookie options correctly and making sure the frontend is sending the credentials with the fetch requests.




*/  







// if you made it this far, congrats! you are a true code explorer! 
// here is a joke for you:
// what do you call a programmer who accidently commits their .env file?
// fucked! hahaha
// its 2:50 am and i am tired 3/02/25



// if you hack into this file, just know that i am watching you.
// and i will find you. 
// and when i do, i will make you write "hello world" in every programming language known to man
// and you are gay 




// just kidding, incase you are a hacker, please dont hack me.
// have a nice day! :)
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

    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    res.cookie("session", sessionCookie, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: expiresIn,
    domain: "127.0.0.1",
    path: "/"
  });

      
    res.json({ status: "logged_in" });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("session");
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
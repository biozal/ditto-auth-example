// Ditto Permissions Example Authentication Server

let express = require("express");
let cors = require("cors");
let body = require("body-parser");
let jwt = require('jsonwebtoken');
let app = express();

app.use(cors());
app.use(body.json());

//// Note: This is just an example. You should consider using OIDC providers to authenticate and return a JWT.  This code is not intended to be used in production and assumes you are sending a valid JWT token from the client.
app.post("/auth", async (req, res) => {
  const token = req.body.token;

  let jwtData;
  try {
    // Parse the JWT token
    jwtData = jwt.verify(token, 'your-secret-key');
  } catch (error) {
    res.statusCode = 401;
    return res.json({
      authenticate: false,
      userInfo: `Invalid token`,
    });
  }

  // Assuming the JWT token contains the user ID and role
  let userID = jwtData.userID;
  let group = jwtData.group;

  //set the payload of what to return
  let payload = {
    authenticate: true,
    expirationSeconds: 610000,
  };

  if (userID !== undefined && userID !== null && userID !== "") {

    //set the userID to return
    payload.userID = userID;

    //information that will be passed between smallPeers that is from the identity provider, can be used to identify the user/device
    payload.identityServiceMetadata = {
      userID: userID,
      group: group,
    };

    /** Customers can only see / edit their own docs **/
    payload.permissions = {
      read: {
        everything: false,
        queriesByCollection: {
          userProfiles: ['true'],
        },
      },
      write: {
        everything: false,
        queriesByCollection: {
          userProfiles: [`_id.userID == \'${userID}\'`],
        },
      },
    };
  }

  try {
    res.json(payload);
    console.log(payload);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.json({
      authenticate: false,
      userInfo: err.message,
    });
  }
});

app.get("/", async (req, res) => {
  console.log("Hello Ditto - post your JWT token to /auth to use this example properly!");
});



app.listen(() => {
  console.log("listening on http://localhost:" + 3000);
});

module.exports = app;

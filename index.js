const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const app = express();

const dotenv = require("dotenv");
dotenv.config();

const config = {
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL,
    clientID: process.env.OAUTH_CLIENT_ID,
    issuerBaseURL: "https://" + process.env.AUTH0_DOMAIN,
    secret: process.env.OAUTH_CLIENT_SECRET,
};

const { ManagementClient } = require("auth0");
const management = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

// The `auth` router attaches /login, /logout
// and /callback routes to the baseURL

app.use(auth(config));

app.get("/env", (req, res) => {
    res.send(process.env);
});

app.get("/", async (req, res) => {
    console.log(req.oidc.idTokenClaims);
    res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

app.get("/profile", requiresAuth(), async (req, res) => {
    const info = req.oidc.user;

    const roles = await management.getUserRoles({ id: info.sub });
    console.log(JSON.stringify(roles, null, 2));

    info.roles = roles;
    res.send(JSON.stringify(info, null, 2));
});

app.listen(3000, function () {
    console.log("Listening on", process.env.BASE_URL);
});

const { auth } = require('express-oauth2-jwt-bearer');
const User = require('../models/User');

// Validate Auth0 JWT token
const validateToken = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

// The custom namespace we configured in the Auth0 Action. 
// NOTE: Keep this as 'https://prepai.com' unless you update your Auth0 Custom Claims Action in the Auth0 console!
const NAMESPACE = 'https://prepai.com';

// Attach user to request
// Creates user in MongoDB on first login automatically
const attachUser = async (req, res, next) => {
  try {
    const auth0Id = req.auth.payload.sub;
    
    // Extract data using the custom Auth0 Action claims
    const email = req.auth.payload[`${NAMESPACE}/email`];
    const name = req.auth.payload[`${NAMESPACE}/name`];
    
    // The picture might still be in the standard payload depending on your Auth0 settings, 
    // but we provide a safe fallback just in case.
    const avatar = req.auth.payload.picture || null; 

    // FAIL-FAST: If the email is still missing, stop immediately.
    // This prevents the MongoDB E11000 duplicate key crash.
    if (!email) {
      console.error(`Missing email in token for user: ${auth0Id}`);
      return res.status(400).json({ 
        success: false, 
        message: "Authentication failed: Email missing from token." 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ auth0Id });

    // If not, create them
    if (!user) {
      user = await User.create({
        auth0Id,
        email,
        name: name || email.split('@')[0], // Fallback to email prefix if name is empty
        avatar,
      });
      console.log(`[Auth] New user created in MongoDB: ${email}`);
    }

    // Attach the MongoDB user document to the request
    req.user = user;
    next();

  } catch (err) {
    console.error("[Auth Middleware Error]:", err.message);
    next(err);
  }
};

module.exports = { validateToken, attachUser };
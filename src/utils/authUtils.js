// Utility functions for authentication and session management

export const clearSessionData = () => {
  // Clear all localStorage data
  localStorage.clear();
  
  // Clear any cookies if they exist
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
    document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
};

export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token has expiration and if it's not expired
    if (tokenPayload.exp && tokenPayload.exp < currentTime) {
      return false; // Token is expired
    }
    
    return true; // Token is valid
  } catch (error) {
    return false; // Invalid token format
  }
};

export const checkAuthentication = () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.log("No token found, clearing session data");
    clearSessionData();
    return false;
  }
  
  if (!isTokenValid(token)) {
    console.log("Token is invalid or expired, clearing session data");
    clearSessionData();
    return false;
  }
  
  console.log("Authentication successful");
  return true;
};

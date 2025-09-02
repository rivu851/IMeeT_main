// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useAuth0 } from '@auth0/auth0-react';
// import axios from 'axios';
// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const { 
//     isAuthenticated, 
//     user: auth0User, 
//     loginWithRedirect, 
//     logout, 
//     isLoading, 
//     getAccessTokenSilently 
//   } = useAuth0();
  
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const getToken = async () => {
//       if (isAuthenticated && auth0User) {
//         try {
//           const token = await getAccessTokenSilently();

//           const updatedUser = {
//             ...auth0User,
//             token,
//           };
          
//           setUser(updatedUser);

//           await axios.post(
//             "https://imeetserver2k25.onrender.com/add-user",
//             { user: updatedUser },
//             {
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );

//         } catch (error) {
//           console.error("Error in authentication process:", error);
//         }
//       }
//     };

//     getToken();
//   }, [isAuthenticated, auth0User, getAccessTokenSilently]);

//   const updateUser = (updatedData) => {
//     setUser(prev => ({
//       ...prev,
//       ...updatedData
//     }));
//     return true;
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         user,
//         isLoading,
//         login: () => loginWithRedirect({
//           authorizationParams: {
//             redirect_uri: window.location.origin
//           }
//         }),
//         logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
//         updateUser
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { 
    isAuthenticated, 
    user: auth0User, 
    loginWithRedirect, 
    logout: auth0Logout, 
    isLoading, 
    getAccessTokenSilently 
  } = useAuth0();
  
  const [user, setUser] = useState(null);

  // Sync Auth0 user with local state
  useEffect(() => {
    if (!isAuthenticated) {
      setUser(null); // clear state on logout
      return;
    }

    const getToken = async () => {
      try {
        const token = await getAccessTokenSilently();

        const updatedUser = { ...auth0User, token };
        setUser(updatedUser);

        // Add user to backend
        await axios.post(
          "https://imeetserver2k25.onrender.com/add-user",
          { user: updatedUser },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error in authentication process:", error);
      }
    };

    getToken();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    return true;
  };

  // Updated login/logout functions
  const login = () =>
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    });

  const logout = () => {
    // Clear React state and storage
    setUser(null);
    localStorage.clear();
    sessionStorage.clear();

    // Logout from Auth0 (federated: true ensures full server logout)
    auth0Logout({
      logoutParams: { 
        returnTo: window.location.origin,
        federated: true
      }
    });

    // Force reload to prevent back-button showing logged-in state
    window.location.href = window.location.origin;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

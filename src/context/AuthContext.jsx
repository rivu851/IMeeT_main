import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { 
    isAuthenticated, 
    user: auth0User, 
    loginWithRedirect, 
    logout: auth0Logout,   // ✅ alias this
    isLoading, 
    getAccessTokenSilently 
  } = useAuth0();
  
  const [user, setUser] = useState(null);
  const navigate = useNavigate();   // ✅ initialize navigate

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const token = await getAccessTokenSilently();

          const updatedUser = {
            ...auth0User,
            token,
          };
          
          setUser(updatedUser);

          await axios.post(
            "https://imeetserver2k25.onrender.com/add-user",
            { user: updatedUser },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

        } catch (error) {
          console.error("Error in authentication process:", error);
        }
      }
    };

    getToken();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  const updateUser = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login: () => loginWithRedirect({
          authorizationParams: {
            redirect_uri: window.location.origin
          },
        }),
        logout: () => {
          setUser(null);

          // Clear local session only (no hard reload)
          auth0Logout({ logoutParams: { localOnly: true } });

          // Navigate to home and replace history
          navigate("/", { replace: true });
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

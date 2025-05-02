import { createContext, useState, useContext } from "react";

// Create the context and export it
export const ProfileContext = createContext();

// Create a hook for easy context usage
export const useProfile = () => useContext(ProfileContext);

// Create and export the provider component
export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);

  const updateProfile = (newData) => {
    setProfileData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  // State for editable form fields
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');  
  const [coverImage, setCoverImage] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    instagram: '',
    linkedin: '',
    discord: '',
    website: ''
  });
  // Add error state to display error messages
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          console.log("User not logged in.");
          navigate('/login'); // Redirect to login if not authenticated
          return;
        }

        setUser(user);
        setEmail(user.email || '');

        // Fetch profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
        }

        // Update state with profile data if it exists
        if (profileData) {
          setName(profileData.display_name || user.user_metadata?.username || '');
          setTitle(profileData.username || '');
          setBio(profileData.bio || 'Passionate UI/UX Designer with a love for creating user-centered designs.');
          setWalletAddress(profileData.wallet_address || '0x123456789abcdef');
          setProfileImage(profileData.avatar_url || 'https://images.unsplash.com/photo-1611175694986-45079520b28e');
          setCoverImage(profileData.cover_url || 'https://images.unsplash.com/photo-1621868228961-bafc82c90f68');
          
          // Update social links
          setSocialLinks({
            twitter: profileData.twitter_link || '',
            instagram: profileData.instagram_link || '',
            linkedin: profileData.linkedin_link || '',
            discord: profileData.discord_link || '',
            website: profileData.website || ''
          });
        } else {
          // Default values if no profile exists
          setName(user.user_metadata?.username || 'User');
          setTitle('UI/UX Designer');
          setBio('Passionate UI/UX Designer with a love for creating user-centered designs.');
          setProfileImage('https://images.unsplash.com/photo-1611175694986-45079520b28e');
          setCoverImage('https://images.unsplash.com/photo-1621868228961-bafc82c90f68');
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
        setErrorMessage("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle file upload
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // First display local preview
        const reader = new FileReader();
        reader.onloadend = () => setProfileImage(reader.result);
        reader.readAsDataURL(file);
        
        // Upload to Supabase Storage
        if (user) {
          setErrorMessage(''); // Clear any previous errors
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-avatar.${fileExt}`;
          
          const { error } = await supabase.storage
            .from('avatar')
            .upload(fileName, file, { upsert: true });
            
          if (error) throw error;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatar')
            .getPublicUrl(fileName);
            
          setProfileImage(urlData.publicUrl);
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setErrorMessage(`Error uploading profile image: ${error.message}`);
      }
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // First display local preview
        const reader = new FileReader();
        reader.onloadend = () => setCoverImage(reader.result);
        reader.readAsDataURL(file);
        
        // Upload to Supabase Storage
        if (user) {
          setErrorMessage(''); // Clear any previous errors
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-cover.${fileExt}`;
          
          const { error } = await supabase.storage
            .from('cover')
            .upload(fileName, file, { upsert: true });
            
          if (error) throw error;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('cover')
            .getPublicUrl(fileName);
            
          setCoverImage(urlData.publicUrl);
        }
      } catch (error) {
        console.error('Error uploading cover image:', error);
        setErrorMessage(`Error uploading cover image: ${error.message}`);
      }
    }
  };

  // Handle change of inputs
  const handleInputChange = (setter) => (event) => setter(event.target.value);
  
  // Handle social media link change
  const handleSocialLinkChange = (platform) => (event) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: event.target.value
    }));
  };

  // Save profile changes
  const saveChanges = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setErrorMessage(''); // Clear any previous errors
      
      const profileUpdates = {
        id: user.id,
        display_name: name,
        username: title,
        bio: bio,
        wallet_address: walletAddress,
        avatar_url: profileImage,
        cover_url: coverImage,
        website: socialLinks.website,
        twitter_link: socialLinks.twitter,
        instagram_link: socialLinks.instagram,
        linkedin_link: socialLinks.linkedin,
        discord_link: socialLinks.discord,
        updated_at: new Date().toISOString()
      };
      
      // Debug log to see what's being sent
      console.log('Sending profile updates:', profileUpdates);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileUpdates, { 
          onConflict: 'id',
          returning: 'minimal' // Don't need to return the record
        });
        
      if (error) throw error;
      
      // Success notification
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      // More descriptive error message
      setErrorMessage(`Error updating profile: ${error.message}`);
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pt-12 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Error message display */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 mt-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          
          {/* Cover Photo */}
          <div className="relative h-64 md:h-80">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="absolute top-4 right-4">
              <label className="cursor-pointer bg-white bg-opacity-90 hover:bg-opacity-100 text-green-800 p-2 rounded-full shadow-md transition-all">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverImageChange} 
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="relative px-6 pt-20 pb-12 md:flex md:flex-col md:items-center">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-32 h-32 bg-white p-1 rounded-full shadow-lg">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <label className="absolute bottom-2 right-0 cursor-pointer bg-green-800 hover:bg-green-700 text-white p-2 rounded-full shadow-md transition-all">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfileImageChange} 
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* User Identity Section */}
            <div className="text-center mb-8">
              <input 
                type="text" 
                value={name} 
                onChange={handleInputChange(setName)} 
                className="text-2xl font-bold text-gray-800 mb-1 text-center bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none transition-all px-2"
                placeholder="Display Name"
              />
              <div className="h-1"></div>
              <input 
                type="text" 
                value={title} 
                onChange={handleInputChange(setTitle)} 
                className="text-lg text-gray-600 text-center bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none transition-all px-2"
                placeholder="Username or Title"
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto mb-8">
              <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition-all">
                <div className="bg-green-800 text-white p-3 rounded-lg mr-4">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    className="w-full bg-transparent text-gray-500 focus:outline-none" 
                  />
                </div>
              </div>
              
              <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition-all">
                <div className="bg-green-800 text-white p-3 rounded-lg mr-4">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                    <line x1="6" y1="12" x2="18" y2="12"></line>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                  <input 
                    type="text" 
                    value={walletAddress} 
                    onChange={handleInputChange(setWalletAddress)} 
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none text-gray-800 transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="w-full max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Social Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="bg-green-800 text-white p-2 rounded-lg mr-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Twitter URL" 
                    value={socialLinks.twitter}
                    onChange={handleSocialLinkChange('twitter')}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none text-gray-800 transition-all"
                  />
                </div>
                
                <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="bg-green-800 text-white p-2 rounded-lg mr-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Instagram URL" 
                    value={socialLinks.instagram}
                    onChange={handleSocialLinkChange('instagram')}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none text-gray-800 transition-all"
                  />
                </div>
                
                <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="bg-green-800 text-white p-2 rounded-lg mr-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="LinkedIn URL" 
                    value={socialLinks.linkedin}
                    onChange={handleSocialLinkChange('linkedin')}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none text-gray-800 transition-all"
                  />
                </div>
                
                <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="bg-green-800 text-white p-2 rounded-lg mr-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.931 9h-2.764a14.67 14.67 0 0 0-.496-2.995A10.002 10.002 0 0 0 19.931 11zM12.53 4.232c1.035.275 2.007 1.561 2.573 3.268h-5.106c.566-1.707 1.538-2.991 2.533-3.268zM11 20.37a10.988 10.988 0 0 1-3.169-6.37H11v6.37zm0-8.37H7.07A12.778 12.778 0 0 1 7.5 9h3.5v3zm0-5H8.085c.496-1.387 1.364-2.559 2.415-3.232A15.06 15.06 0 0 0 11 7zm2 13.57v-6.57h3.169A10.988 10.988 0 0 1 13 20.37zm0-8.57v-3h3.5c.085.664.14 1.329.16 2a20.03 20.03 0 0 1-.16 1H13zm.8-9.232c1.05.673 1.919 1.845 2.415 3.232H13V4.001c.268.258.529.539.8.767zM4.069 11H6.83c.013-.995.072-1.662.16-2.995a10.02 10.02 0 0 0-2.92 2.995zm2.764 2h-2.764c1.061 1.495 2.679 2.468 4.458 2.995a14.43 14.43 0 0 1-.494-2.995zM19.93 13h-2.764c-.159 1-.3 1.995-.594 2.995a9.983 9.983 0 0 0 3.358-2.995z"></path>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Website URL" 
                    value={socialLinks.website}
                    onChange={handleSocialLinkChange('website')}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none text-gray-800 transition-all"
                  />
                </div>
                
                <div className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="bg-green-800 text-white p-2 rounded-lg mr-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"></path>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Discord Username" 
                    value={socialLinks.discord}
                    onChange={handleSocialLinkChange('discord')}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-600 focus:outline-none text-gray-800 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="w-full max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">About Me</h3>
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <textarea 
                  value={bio} 
                  onChange={handleInputChange(setBio)} 
                  className="w-full bg-transparent border border-gray-200 hover:border-gray-300 focus:border-green-600 focus:outline-none rounded-lg p-3 min-h-32 text-gray-700 transition-all resize-y" 
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-2xl mx-auto mt-8 flex justify-end space-x-4">
              <Link to="/profile" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-6 py-2 rounded-lg shadow-sm transition-all">
                Cancel
              </Link>
              <button 
                onClick={saveChanges} 
                disabled={saving}
                className={`bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-sm transition-all flex items-center ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
import React, { useEffect, useState, useRef } from 'react';
import M from 'materialize-css';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const CompleteProfile = () => {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Default avatars using external URLs that are publicly accessible
  const defaultAvatars = [
    'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff',
    'https://ui-avatars.com/api/?name=NFT&background=2C3E50&color=fff',
    'https://ui-avatars.com/api/?name=Web3&background=27AE60&color=fff',
    'https://ui-avatars.com/api/?name=Crypto&background=8E44AD&color=fff',
    'https://ui-avatars.com/api/?name=Digital&background=F39C12&color=fff',
  ];
  
  const [showDefaultAvatars, setShowDefaultAvatars] = useState(false);

  useEffect(() => {
    M.AutoInit();
    
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }
      
      setUser(session.user);
      
      // Check if profile already exists and is complete
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (!error && profile && profile.is_complete) {
        // Profile is already complete, redirect to profile page
        navigate('/profile');
      } else if (!error && profile) {
        // Pre-fill form with existing profile data
        setFullName(profile.full_name || '');
        setBio(profile.bio || '');
        setWalletAddress(profile.wallet_address || '');
        
        // Extract usernames from links if they exist
        setTwitterUsername(extractUsername(profile.twitter_link, 'twitter.com/'));
        setInstagramUsername(extractUsername(profile.instagram_link, 'instagram.com/'));
        setLinkedinUsername(extractUsername(profile.linkedin_link, 'linkedin.com/in/'));
        setDiscordUsername(profile.discord_link || '');
        setWebsiteUrl(profile.website_link || '');
        
        // Set avatar if exists
        if (profile.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        } else {
          // Set a default avatar if none exists
          setAvatarUrl(defaultAvatars[0]);
        }
      } else {
        // For brand new profiles, set a default avatar
        setAvatarUrl(defaultAvatars[0]);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Function to extract usernames from full URLs
  const extractUsername = (url, prefix) => {
    if (!url) return '';
    if (url.includes(prefix)) {
      return url.split(prefix)[1].split('/')[0];
    }
    return url;
  };
  
  // Function to format usernames into full URLs
  const formatSocialLink = (username, type) => {
    if (!username) return '';
    
    username = username.trim().replace('@', '');
    
    switch (type) {
      case 'twitter':
        return `https://twitter.com/${username}`;
      case 'instagram':
        return `https://instagram.com/${username}`;
      case 'linkedin':
        return `https://linkedin.com/in/${username}`;
      case 'discord':
        return username; // Discord keeps as username format
      case 'website':
        if (username.startsWith('http://') || username.startsWith('https://')) {
          return username;
        }
        return `https://${username}`;
      default:
        return username;
    }
  };

  const handleUrlAvatarInput = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      // Simple validation that it's a URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        setAvatarUrl(url);
      } else {
        M.toast({ html: 'Please enter a valid URL starting with http:// or https://', classes: 'red' });
      }
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB size limit
        M.toast({ html: 'Image too large. Max size is 2MB', classes: 'red' });
        return;
      }
      
      // Instead of uploading to storage, create a local object URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);
      
      // No need to upload now, we'll just use the URL directly
      // Or you can implement a different upload mechanism here
    }
  };

  const selectDefaultAvatar = (avatarPath) => {
    setAvatarUrl(avatarPath);
    setShowDefaultAvatars(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    // Format social media links
    const twitterLink = formatSocialLink(twitterUsername, 'twitter');
    const instagramLink = formatSocialLink(instagramUsername, 'instagram');
    const linkedinLink = formatSocialLink(linkedinUsername, 'linkedin');
    const websiteLink = formatSocialLink(websiteUrl, 'website');
    
    // Create or update user profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        bio: bio,
        wallet_address: walletAddress,
        twitter_link: twitterLink,
        instagram_link: instagramLink,
        linkedin_link: linkedinLink,
        discord_link: discordUsername,
        website_link: websiteLink,
        avatar_url: avatarUrl, // Store the URL directly
        username: user.user_metadata?.username || '',
        is_complete: true,
        updated_at: new Date()
      });
    
    setLoading(false);
    
    if (error) {
      M.toast({ html: error.message, classes: 'red' });
    } else {
      M.toast({ html: 'Profile saved successfully!', classes: 'green' });
      // Redirect to profile page
      setTimeout(() => navigate('/profile'), 1000);
    }
  };

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px' }}>
      <div className="row">
        <div className="col s12 m8 offset-m2">
          <div className="card z-depth-3" style={{ padding: '30px', borderRadius: '15px' }}>
            <h4 className="center-align" style={{ color: '#2c3e50', fontWeight: '500' }}>Complete Your Profile</h4>
            <p className="center-align grey-text">Almost there! Let's set up your personalized profile.</p>

            <div className="center-align" style={{ margin: '30px 0' }}>
              <div 
                style={{ 
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                {/* Avatar Preview */}
                <div 
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    border: '3px solid #2196f3',
                    backgroundColor: '#e0e0e0',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultAvatars[0];
                        M.toast({ html: 'Image failed to load, using default', classes: 'orange' });
                      }}
                    />
                  ) : (
                    <i className="material-icons" style={{ fontSize: '48px', color: '#9e9e9e' }}>person</i>
                  )}
                  {uploading && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <div className="preloader-wrapper small active">
                        <div className="spinner-layer spinner-blue-only">
                          <div className="circle-clipper left">
                            <div className="circle"></div>
                          </div>
                          <div className="gap-patch">
                            <div className="circle"></div>
                          </div>
                          <div className="circle-clipper right">
                            <div className="circle"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Avatar action buttons */}
                <div className="avatar-actions" style={{ marginTop: '10px' }}>
                  <button 
                    type="button" 
                    className="btn-small blue waves-effect waves-light" 
                    onClick={() => fileInputRef.current.click()}
                    style={{ marginRight: '5px' }}
                  >
                    <i className="material-icons left">file_upload</i>
                    Local
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn-small teal waves-effect waves-light" 
                    onClick={handleUrlAvatarInput}
                    style={{ marginRight: '5px' }}
                  >
                    <i className="material-icons left">link</i>
                    URL
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn-small grey lighten-1 waves-effect waves-light" 
                    onClick={() => setShowDefaultAvatars(!showDefaultAvatars)}
                  >
                    <i className="material-icons left">style</i>
                    Default
                  </button>
                </div>
                
                {/* Hidden file input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              
              {/* Default avatars selection */}
              {showDefaultAvatars && (
                <div className="default-avatars" style={{ marginTop: '20px' }}>
                  <div className="row" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    {defaultAvatars.map((avatar, index) => (
                      <div className="col s4 m2" key={index}>
                        <div 
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '50%', 
                            overflow: 'hidden',
                            border: avatarUrl === avatar ? '2px solid #2196f3' : '1px solid #e0e0e0',
                            margin: '5px auto',
                            cursor: 'pointer'
                          }}
                          onClick={() => selectDefaultAvatar(avatar)}
                        >
                          <img 
                            src={avatar} 
                            alt={`Default avatar ${index+1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-field">
                <i className="material-icons prefix blue-text">badge</i>
                <input
                  type="text"
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <label htmlFor="fullName" className={fullName ? "active" : ""}>Full Name</label>
              </div>

              <div className="input-field">
                <i className="material-icons prefix blue-text">account_balance_wallet</i>
                <input
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="e.g., 0x123456789abcdef"
                />
                <label htmlFor="walletAddress" className={walletAddress ? "active" : ""}>Wallet Address (Optional)</label>
              </div>

              <div className="input-field">
                <i className="material-icons prefix blue-text">description</i>
                <textarea
                  id="bio"
                  className="materialize-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
                <label htmlFor="bio" className={bio ? "active" : ""}>Bio (Tell us about yourself)</label>
              </div>

              <h5 className="center-align" style={{ color: '#2c3e50', marginTop: '30px', fontSize: '1.3rem' }}>Social Media</h5>
              <p className="center-align grey-text text-darken-1">Just enter your username without the full URL</p>
              
              <div className="row">
                <div className="col s12 m6">
                  <div className="input-field">
                    <i className="material-icons prefix blue-text">alternate_email</i>
                    <input
                      type="text"
                      id="twitterUsername"
                      value={twitterUsername}
                      onChange={(e) => setTwitterUsername(e.target.value)}
                      placeholder="username"
                    />
                    <label htmlFor="twitterUsername" className={twitterUsername ? "active" : ""}>Twitter</label>
                  </div>
                </div>
                
                <div className="col s12 m6">
                  <div className="input-field">
                    <i className="material-icons prefix blue-text">photo_camera</i>
                    <input
                      type="text"
                      id="instagramUsername"
                      value={instagramUsername}
                      onChange={(e) => setInstagramUsername(e.target.value)}
                      placeholder="username"
                    />
                    <label htmlFor="instagramUsername" className={instagramUsername ? "active" : ""}>Instagram</label>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col s12 m6">
                  <div className="input-field">
                    <i className="material-icons prefix blue-text">business_center</i>
                    <input
                      type="text"
                      id="linkedinUsername"
                      value={linkedinUsername}
                      onChange={(e) => setLinkedinUsername(e.target.value)}
                      placeholder="username"
                    />
                    <label htmlFor="linkedinUsername" className={linkedinUsername ? "active" : ""}>LinkedIn</label>
                  </div>
                </div>
                
                <div className="col s12 m6">
                  <div className="input-field">
                    <i className="material-icons prefix blue-text">headset_mic</i>
                    <input
                      type="text"
                      id="discordUsername"
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      placeholder="username#0000"
                    />
                    <label htmlFor="discordUsername" className={discordUsername ? "active" : ""}>Discord</label>
                  </div>
                </div>
              </div>

              <div className="input-field">
                <i className="material-icons prefix blue-text">public</i>
                <input
                  type="text"
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="example.com"
                />
                <label htmlFor="websiteUrl" className={websiteUrl ? "active" : ""}>Personal Website</label>
              </div>

              <div className="center-align" style={{ marginTop: '40px' }}>
                <button 
                  className="btn-large waves-effect waves-light blue darken-2" 
                  type="submit"
                  disabled={loading}
                  style={{ borderRadius: '30px', padding: '0 30px' }}
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                  <i className="material-icons right">check</i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [biography, setBiography] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Fetch full user data including biography and avatar
      fetch(`/api/profile/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name || '');
          setEmail(data.email || '');
          setBiography(data.biography || '');
          setAvatar(data.avatar || null);
        })
        .catch(error => console.error('Failed to fetch user profile:', error));
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, biography, avatar }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        // Optionally update the session with new name/avatar if needed
        update({ name, image: avatar });
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating profile.');
    }
  };

  if (status === 'loading') {
    return <div className="container">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-upload">
          {avatar ? (
            <img src={avatar} alt="User Avatar" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          )}
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </div>
        <h1>{name || 'Guest'}</h1>
        <p>{email}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="form-group">
            <label htmlFor="profile-name">Name</label>
            <input
              type="text"
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="profile-email">Email</label>
            <input
              type="email"
              id="profile-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled // Email usually not editable directly
            />
          </div>
          <div className="form-group">
            <label htmlFor="profile-biography">Biography</label>
            <textarea
              id="profile-biography"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
            ></textarea>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
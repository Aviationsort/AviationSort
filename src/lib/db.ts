export interface FlexPic {
  id: number;
  username: string;
  photo_url: string;
  photo_thumbnail_url: string;
  photo_registration: string;
  photo_airline: string;
  photo_aircraft_type: string;
  photo_date: string;
  file_directory: string;
  date_added: string;
  hashtags: string;
  is_video: boolean;
  width: number;
  height: number;
  file_size: number;
}

export interface Profile {
  username: string;
  displayName: string;
  bio: string;
  homeAirport: string;
  favoriteAirline: string;
  equipment: string;
  isPrivate: boolean;
}

export async function getFlexPics(username?: string): Promise<FlexPic[]> {
  const url = username ? `/api/flexpics?username=${username}` : '/api/flexpics';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch flexpics');
  return res.json();
}

export async function addFlexPic(data: {
  username: string;
  photo_url: string;
  photo_thumbnail_url?: string;
  photo_registration: string;
  photo_airline: string;
  photo_aircraft_type: string;
  photo_date: string;
  file_directory?: string;
  hashtags?: string;
  is_video?: boolean;
  width?: number;
  height?: number;
  file_size?: number;
}): Promise<void> {
  const res = await fetch('/api/flexpics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      photo_thumbnail_url: data.photo_thumbnail_url || data.photo_url.replace('/photos/', '/thumbs/'),
      hashtags: data.hashtags || '',
      is_video: data.is_video ? 1 : 0,
      width: data.width || 0,
      height: data.height || 0,
      file_size: data.file_size || 0,
      date_added: new Date().toISOString()
    })
  });
  if (!res.ok) throw new Error('Failed to add flexpic');
}

export async function deleteFlexPic(id: number): Promise<void> {
  const res = await fetch('/api/flexpics', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  if (!res.ok) throw new Error('Failed to delete flexpic');
}

export async function getSimilarFlexPics(options: {
  registration?: string;
  airline?: string;
  aircraft_type?: string;
}): Promise<FlexPic[]> {
  const params = new URLSearchParams();
  if (options.registration) params.set('registration', options.registration);
  if (options.airline) params.set('airline', options.airline);
  if (options.aircraft_type) params.set('aircraft_type', options.aircraft_type);
  
  const res = await fetch(`/api/flexpics/similar?${params}`);
  if (!res.ok) throw new Error('Failed to fetch similar flexpics');
  return res.json();
}

export async function getProfile(username: string): Promise<Profile | null> {
  const res = await fetch(`/api/profile?username=${username}`);
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function saveProfile(data: Profile): Promise<void> {
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save profile');
}

export async function login(username: string, password: string): Promise<{ success: boolean; username: string }> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}
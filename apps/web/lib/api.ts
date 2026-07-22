const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error('Invalid email or password');
  }

  return res.json() as Promise<{ accessToken: string; refreshToken: string }>;
}

export async function apiRegister(data: {
  email: string;
  password: string;
  name: string;
  organizationName: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Registration failed');
  }

  return res.json() as Promise<{ accessToken: string; refreshToken: string }>;
}

export async function apiMe(accessToken: string) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Not authenticated');
  }

  return res.json() as Promise<{ userId: string; email: string; role: string }>;
}



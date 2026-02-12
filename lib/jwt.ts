import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export async function createToken(userId: string, email: string): Promise<string> {
  const token = jwt.sign(
    {
      userId,
      email,
    },
    JWT_SECRET,
    {
      expiresIn: '7d', // Token expires in 7 days
    }
  );

  // Just return the token - the caller will set the cookie in the response
  return token;
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getTokenFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return token;
}

export async function removeToken() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
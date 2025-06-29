// === app/api/auth/login/route.js ===

import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    await connectToDatabase();

    const { email, password, otp, newPassword } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Email not registered' }), { status: 401 });
    }

    // Handle OTP-based password reset
    if (otp === '1234') {
      if (!newPassword) {
        return new Response(JSON.stringify({ error: 'New password required with OTP' }), { status: 400 });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      await user.save();

      return new Response(JSON.stringify({ message: 'Password reset successful. You can now login.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Normal login flow
    if (!password) {
      return new Response(JSON.stringify({ error: 'Password is required' }), { status: 400 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid password. Enter OTP 1234 to reset.', requireOtp: true }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Login successful', name: user.name }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Login Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

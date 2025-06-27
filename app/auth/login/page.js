'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        // Save user session
        localStorage.setItem('loggedInUser', JSON.stringify({ name: data.name, email: formData.email }));
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed due to server error');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">Welcome Back</h2>

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="w-full mb-6 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-700 text-white p-3 rounded-xl text-lg font-semibold hover:bg-blue-800 transition"
        >
          Log In
        </button>

       <p className="mt-4 text-center text-sm text-gray-600">
  Don&apos;t have an account?{' '}
  <span
    onClick={() => router.push('/auth/signup')}
    className="text-blue-700 font-medium cursor-pointer hover:underline"
  >
    Sign Up
  </span>
</p>
      </form>
    </main>
  );
}

"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
  
    console.log('Login Form Submitted');
    console.log('Username:', username);
    
    try {
      console.log('Sending login request to API');
      const response = await fetch('/api/POST', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          params: {
            username,
            password
          }
        }),
      });
      
      console.log('API response status:', response.status);
      
      if (response.status === 401) {
        console.error('Login failed: Invalid credentials');
        alert('Login failed. Invalid username or password.');
        return;
      }
      
      if (!response.ok) {
        console.error('Login failed:', response.status);
        alert('Login failed. Please try again later.');
        return;
      }
  
      const data = await response.json();
      console.log('Login successful:', data);
      
      if (data.success) {
        alert('Login successful!');
        router.push(`/home?username=${username}`);
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'black' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              Sign In
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <a
            href="/signup"
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          >
            Don't have an account? Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

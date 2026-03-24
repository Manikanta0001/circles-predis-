'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code || !state) {
        throw new Error('Missing OAuth parameters');
      }

      // Decode state to get platform info
      const stateData = JSON.parse(atob(state));
      const platform = stateData.platform;

      setMessage(`Connecting to ${platform}...`);

      // Exchange code for access token via backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL is not configured');
      }
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${backendUrl}/api/social/oauth/callback`,
        {
          platform,
          code,
          redirectUri: `${window.location.origin}/oauth/callback`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStatus('success');
      setMessage(`Successfully connected to ${platform}!`);
      toast.success(`${platform} connected successfully`);

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push('/merchant/profile');
      }, 2000);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || error.message || 'Failed to connect account');
      toast.error('OAuth connection failed');

      // Redirect to profile after 3 seconds
      setTimeout(() => {
        router.push('/merchant/profile');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {status === 'loading' && (
            <div className="mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mb-4">
              <svg
                className="h-16 w-16 text-green-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mb-4">
              <svg
                className="h-16 w-16 text-red-600 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Connecting...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          
          <p className="text-gray-600 mb-6">{message}</p>

          {status !== 'loading' && (
            <p className="text-sm text-gray-500">
              Redirecting to your profile...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

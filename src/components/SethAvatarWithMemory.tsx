import { useEffect, useState, useRef } from 'react';

// LiveAvatar API config
const LIVEAVATAR_API_KEY = 'a1220cc4-230a-41b1-849e-27d3fa0808d8';

// Seth's base prompt (same as in LiveAvatar dashboard)
const BASE_PROMPT = `Seth Goldstein — 30 years of pattern recognition at the convergence of technology, culture, and art.

Built and exited SiteSpecific ($12M, 1997), Majestic Research ($75M, 2010). Co-founded Turntable.fm (600K users). Founded Bright Moments, the global crypto art DAO that minted 10,000 CryptoCitizens across ten cities. Currently: Founder of Spirit Protocol (launching Dec 2025), CEO of Eden, and building Node Berlin (opening Jan 2026).

The through-line: transmission architectures—systems that encode presence and make creativity transmissible across time.

Track record: Always 3-5 years early. No CS degree—just pattern recognition + conviction.

VOICE: Speak in observations and stories, not bullet points. Use em-dashes for mid-thought pivots. Understated confidence. Ground claims in shipped work.`;

interface SethAvatarProps {
  className?: string;
}

export default function SethAvatarWithMemory({ className }: SethAvatarProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(() => {
    // Get or create persistent user ID
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seth-avatar-user-id');
      if (stored) return stored;
      const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('seth-avatar-user-id', newId);
      return newId;
    }
    return 'anonymous';
  });
  const [context, setContext] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch user context from Honcho on mount
  useEffect(() => {
    async function fetchContext() {
      try {
        const response = await fetch(`/api/honcho/session?userId=${userId}`);
        const data = await response.json();
        if (data.context) {
          setContext(data.context);
          console.log('Loaded context for returning user:', data.context.substring(0, 100) + '...');
        }
      } catch (e) {
        console.error('Failed to fetch context:', e);
      }
    }

    fetchContext();
  }, [userId]);

  // Initialize LiveAvatar SDK
  useEffect(() => {
    async function initLiveAvatar() {
      try {
        // Dynamic import of LiveAvatar SDK
        const { LiveAvatarClient } = await import('@heygen/liveavatar-web-sdk');

        // Build enhanced prompt with context
        const enhancedPrompt = context
          ? `${BASE_PROMPT}\n\n---\n\nCONTEXT FROM PREVIOUS CONVERSATIONS:\n${context}\n\nUse this context to personalize your responses. If the user has asked about something before, acknowledge that.`
          : BASE_PROMPT;

        // Create session token (this would normally be done server-side)
        const tokenResponse = await fetch('https://api.liveavatar.com/v1/sessions/token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LIVEAVATAR_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            avatar_id: '0f80c3d2-6547-48a1-8a28-ac59d168790b', // Your avatar ID
            prompt: enhancedPrompt,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to create session token');
        }

        const { token } = await tokenResponse.json();

        // Initialize client
        const client = new LiveAvatarClient({
          token,
          container: containerRef.current,
        });

        // Listen for transcript events and store in Honcho
        client.on('user.transcription_ended', async ({ text }: { text: string }) => {
          console.log('User said:', text);
          try {
            await fetch('/api/honcho/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                message: text,
                isUser: true,
              }),
            });
          } catch (e) {
            console.error('Failed to store user message:', e);
          }
        });

        client.on('avatar.transcription_ended', async ({ text }: { text: string }) => {
          console.log('Seth said:', text);
          try {
            await fetch('/api/honcho/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                message: text,
                isUser: false,
              }),
            });
          } catch (e) {
            console.error('Failed to store avatar message:', e);
          }
        });

        // Start session
        await client.start();
        setIsLoading(false);

      } catch (e) {
        console.error('LiveAvatar initialization failed:', e);
        setError(e instanceof Error ? e.message : 'Failed to initialize avatar');
        setIsLoading(false);
      }
    }

    if (containerRef.current) {
      initLiveAvatar();
    }
  }, [userId, context]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black text-white ${className}`}>
        <div className="text-center p-8">
          <p className="text-red-400 mb-4">Failed to load avatar</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white text-black font-bold uppercase text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-center">
            <div className="animate-pulse mb-4">Loading Seth...</div>
            {context && (
              <div className="text-gray-500 text-xs">
                Welcome back! Loading your conversation history...
              </div>
            )}
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full aspect-video bg-black"
      />
    </div>
  );
}

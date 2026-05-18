import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Pastikan window.Pusher terdefinisi untuk Laravel Echo
if (typeof window !== 'undefined') {
    (window as any).Pusher = Pusher;
}

const echo = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_REVERB_APP_KEY)
    ? new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ? parseInt(process.env.NEXT_PUBLIC_REVERB_PORT) : 8080,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        // Authorisasi untuk private channel
        authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '',
                Accept: 'application/json',
            },
        },
    })
    : null;

export default echo;

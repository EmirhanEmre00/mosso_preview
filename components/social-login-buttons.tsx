'use client';

export default function SocialLoginButtons({ onLogin }: { onLogin: (remember?: boolean) => void }) {
  return (
    <div className="social-login">
      <div className="social-login-divider">
        <span>veya</span>
      </div>
      <div className="social-login-buttons">
        <button
          type="button"
          aria-describedby="social-login-preview"
          onClick={(e) =>
            onLogin(
              (
                e.currentTarget
                  .closest('form')
                  ?.elements.namedItem('remember') as HTMLInputElement | null
              )?.checked ?? false,
            )
          }
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.61 0-4.82-1.77-5.61-4.15H3.04v2.59A10 10 0 0 0 12 22Z"
            />
            <path
              fill="#FBBC05"
              d="M6.39 13.89a6 6 0 0 1 0-3.78V7.52H3.04a10 10 0 0 0 0 8.96l3.35-2.59Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.59A5.92 5.92 0 0 1 12 5.96Z"
            />
          </svg>
          Google ile giriş yap
        </button>
        <button
          type="button"
          aria-describedby="social-login-preview"
          onClick={(e) =>
            onLogin(
              (
                e.currentTarget
                  .closest('form')
                  ?.elements.namedItem('remember') as HTMLInputElement | null
              )?.checked ?? false,
            )
          }
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="11" fill="#1877F2" />
            <path
              fill="white"
              d="M13.5 23v-8h2.7l.4-3h-3.1v-1.9c0-.9.3-1.6 1.6-1.6h1.7V5.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.5v3h2.6v8z"
            />
          </svg>
          Facebook ile giriş yap
        </button>
      </div>
      <small id="social-login-preview">
        Önizleme: Bu düğmeler deneme hesabını açar. Google ve Facebook bağlantıları henüz aktif
        değil.
      </small>
    </div>
  );
}

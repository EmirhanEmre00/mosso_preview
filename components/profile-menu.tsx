'use client';

import { useEffect, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';
import { type AccountSection } from './account-panel';

export default function ProfileMenu({
  signedIn,
  onNavigate,
  onLogout,
}: {
  signedIn: boolean;
  onNavigate: (section: AccountSection) => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div
      className="profile-menu"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="icon-button"
        aria-label={signedIn ? 'Hesabım' : 'Giriş yap'}
        aria-expanded={open}
        aria-controls="profile-panel"
        onClick={() => setOpen(!open)}
      >
        <UserRound />
        <span className="action-label">{signedIn ? 'Hesabım' : 'Giriş yap'}</span>
      </button>
      {open && (
        <div
          id="profile-panel"
          className="profile-panel"
          role="region"
          aria-label="Hesap seçenekleri"
        >
          <strong>Senin mos’so dünyan</strong>
          {(signedIn ? ['Hesabım', 'Siparişlerim', 'Adreslerim'] : ['Giriş yap / Kayıt ol']).map(
            (label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onNavigate(label as AccountSection);
                }}
              >
                {label}
              </button>
            ),
          )}
          {signedIn && (
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              Çıkış yap
            </button>
          )}
        </div>
      )}
    </div>
  );
}

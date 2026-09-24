'use client';

import { useEffect, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';

export default function ProfileMenu() {
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
        aria-label="Hesabım"
        aria-expanded={open}
        aria-controls="profile-panel"
        onClick={() => setOpen(!open)}
      >
        <UserRound />
        <span className="action-label">Hesabım</span>
      </button>
      {open && (
        <div
          id="profile-panel"
          className="profile-panel"
          role="region"
          aria-label="Hesap seçenekleri"
        >
          <strong>Senin Mosso’n</strong>
          <p>Hesap özellikleri yakında burada.</p>
          {['Giriş yap / Kayıt ol', 'Hesabım', 'Siparişlerim', 'Adreslerim'].map((label) => (
            <button key={label} type="button" aria-disabled="true">
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

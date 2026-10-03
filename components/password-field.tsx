'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({
  label = 'Şifre',
  name = 'password',
  autoComplete = 'current-password',
  minLength = 1,
  placeholder = 'Şifren',
}: {
  label?: string;
  name?: string;
  autoComplete?: string;
  minLength?: number;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  return (
    <div className="password-field-group">
      <label htmlFor={inputId}>{label}</label>
      <span className="password-field">
        <input
          id={inputId}
          name={name}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          maxLength={128}
          placeholder={placeholder}
        />
        <button
          type="button"
          aria-label={`${label}: ${visible ? 'gizle' : 'göster'}`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      </span>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MessageCircle, Send, X, Check } from 'lucide-react';
import { sendSupportMessage, supportEndpoint, supportTopics } from '@/lib/support.mjs';
import './support-widget.css';
import PhoneInput from './phone-input';

export type SupportContact = { name: string; email: string; phone: string };
const endpoint = supportEndpoint(process.env.NEXT_PUBLIC_SUPPORT_FORM_ENDPOINT);

export default function SupportWidget({ contact }: { contact: SupportContact | null }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const submitLock = useRef(false);
  useEffect(() => {
    const panel = dialog.current;
    if (open && !panel?.open) panel?.showModal();
    if (!open && panel?.open) panel.close();
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;
    setStatus('sending');
    setError('');
    const form = event.currentTarget;
    try {
      await sendSupportMessage(endpoint, Object.fromEntries(new FormData(form)));
      setStatus('sent');
      form.reset();
    } catch (failure) {
      setError(
        failure instanceof Error && failure.name !== 'TimeoutError' && failure.name !== 'TypeError'
          ? failure.message
          : 'Bağlantı kurulamadı. Mesajın formda duruyor; tekrar deneyebilirsin.',
      );
      setStatus('error');
    } finally {
      submitLock.current = false;
    }
  }

  return (
    <>
      <button
        className="support-launcher"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="support-panel"
        onClick={() => {
          setStatus('idle');
          setError('');
          setOpen(true);
        }}
      >
        <MessageCircle size={20} aria-hidden="true" />
        <span>Destek</span>
      </button>
      <dialog
        id="support-panel"
        ref={dialog}
        className="support-panel"
        aria-labelledby="support-title"
        onCancel={(event) => {
          if (status === 'sending') event.preventDefault();
          else setOpen(false);
        }}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget && status !== 'sending') setOpen(false);
        }}
      >
        {open && (
          <div className="support-inner">
            <header>
              <div>
                <span className="eyebrow">MOS’SO YANINDA</span>
                <h2 id="support-title">Nasıl yardımcı olalım?</h2>
              </div>
              <button
                type="button"
                aria-label="Destek penceresini kapat"
                disabled={status === 'sending'}
                onClick={() => setOpen(false)}
              >
                <X size={22} />
              </button>
            </header>
            {status === 'sent' ? (
              <div className="support-success" role="status">
                <Check size={28} />
                <h3>Mesajın alındı.</h3>
                <p>Ekibimiz inceleyip belirttiğin e-posta adresinden sana dönüş yapacak.</p>
                <button className="primary" onClick={() => setOpen(false)}>
                  Tamam
                </button>
              </div>
            ) : (
              <>
                <p className="support-intro">Bize yaz, ekibimiz inceleyip sana dönüş yapsın.</p>
                {!endpoint && (
                  <p className="support-unavailable" role="status">
                    Önizleme: mesaj gönderimi henüz aktif değil. Şimdilik WhatsApp’tan bize
                    ulaşabilirsin.
                  </p>
                )}
                <form onSubmit={submit}>
                  <fieldset disabled={status === 'sending'}>
                    <div className="support-fields">
                      <label>
                        Ad soyad
                        <input
                          name="name"
                          autoComplete="name"
                          defaultValue={contact?.name}
                          required
                          maxLength={100}
                        />
                      </label>
                      <label>
                        E-posta
                        <input
                          name="email"
                          type="email"
                          autoComplete="email"
                          defaultValue={contact?.email}
                          required
                          maxLength={254}
                        />
                      </label>
                      <label>
                        Telefon <small>(isteğe bağlı)</small>
                        <PhoneInput name="phone" defaultValue={contact?.phone} />
                      </label>
                      <label>
                        Konu
                        <select name="topic">
                          {supportTopics.map((topic) => (
                            <option key={topic}>{topic}</option>
                          ))}
                        </select>
                      </label>
                      <label className="support-wide">
                        Sipariş numarası <small>(varsa)</small>
                        <input
                          name="order_number"
                          maxLength={60}
                          autoComplete="off"
                          placeholder="Örn. sipariş numaran"
                        />
                      </label>
                      <label className="support-wide">
                        Mesajın
                        <textarea
                          name="message"
                          rows={4}
                          required
                          minLength={10}
                          maxLength={3000}
                          placeholder="Sana nasıl yardımcı olabiliriz?"
                        />
                      </label>
                      <label className="support-honeypot" aria-hidden="true">
                        Bu alanı boş bırak
                        <input name="_gotcha" tabIndex={-1} autoComplete="off" />
                      </label>
                    </div>
                    <p className="support-privacy">
                      Adın, iletişim bilgilerin ve mesajın destek talebin için Formspree üzerinden
                      mağaza ekibine iletilir. Şifre veya kart bilgisi paylaşma.
                    </p>
                    {error && (
                      <p className="support-error" role="alert">
                        {error}
                      </p>
                    )}
                    <button
                      className="primary support-submit"
                      type="submit"
                      disabled={!endpoint || status === 'sending'}
                    >
                      {status === 'sending' ? 'Gönderiliyor…' : 'Mesajı gönder'}{' '}
                      <Send size={16} aria-hidden="true" />
                    </button>
                  </fieldset>
                </form>
                <a
                  className="support-whatsapp"
                  href="https://wa.me/905327904880"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={17} /> WhatsApp’tan yaz
                </a>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}

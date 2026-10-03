import { Check } from 'lucide-react';
import { orderStages } from '@/lib/order-lifecycle.mjs';

export default function OrderProgress({ status }: { status: string }) {
  const steps = orderStages;
  const current = steps.findIndex((step) => step.key === status);
  const complete = current === steps.length - 1;
  return (
    <ol className="order-progress" aria-label="Sipariş aşamaları">
      {steps.map((step, index) => (
        <li
          key={step.key}
          className={index < current || complete ? 'done' : index === current ? 'current' : ''}
          aria-current={!complete && index === current ? 'step' : undefined}
        >
          <span className="order-step-dot" aria-hidden="true">
            {index < current || complete ? <Check size={15} /> : index + 1}
          </span>
          <span>
            {step.label}
            <small>
              {index < current || complete
                ? 'Tamamlandı'
                : index === current
                  ? 'Şu an bu aşamada'
                  : 'Bekleniyor'}
            </small>
          </span>
        </li>
      ))}
    </ol>
  );
}

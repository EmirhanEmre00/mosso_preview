import type { Product } from '@/lib/products';

export default function ColorSelector({
  colors,
  value,
  onChange,
  disabled,
}: {
  colors: Product['colors'];
  value: string;
  onChange: (color: string) => void;
  disabled?: (color: string) => boolean;
}) {
  return (
    <div className="color-line">
      <span className="color-label">
        {colors.map((color) => (
          <span className="color-label-space" aria-hidden="true" key={color.name}>
            Renk: <strong>{color.name}</strong>
          </span>
        ))}
        <span aria-live="polite">
          Renk: <strong>{value}</strong>
        </span>
      </span>
      <div className="color-options" role="group" aria-label="Renk seç">
        {colors.map((color) => (
          <button
            type="button"
            className={`color-choice${value === color.name ? ' selected' : ''}`}
            style={{ background: color.hex }}
            key={color.name}
            aria-label={color.name}
            aria-pressed={value === color.name}
            title={color.name}
            disabled={disabled?.(color.name)}
            onClick={() => onChange(color.name)}
          />
        ))}
      </div>
    </div>
  );
}

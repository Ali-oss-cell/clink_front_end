import { useState, useEffect } from 'react';
import { differenceInYears, isValid, parseISO } from 'date-fns';
import { Select } from '../../../components/ui/select';
import styles from './Register.module.scss';

const MONTHS: { value: string; label: string }[] = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function parseParts(v: string): { y: string; m: string; d: string } {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return { y: '', m: '', d: '' };
  }
  const [y, m, d] = v.split('-');
  return { y, m, d };
}

function buildYears(): number[] {
  const currentYear = new Date().getFullYear();
  const min = currentYear - 120;
  const max = currentYear - 18;
  const out: number[] = [];
  for (let yr = max; yr >= min; yr -= 1) {
    out.push(yr);
  }
  return out;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  hasError: boolean;
  hasSuccess: boolean;
};

/**
 * Date of birth as three dropdowns (day / month / year) — no native date picker popup.
 * Emits YYYY-MM-DD for the API.
 */
export function RegisterDobFields({
  value,
  onChange,
  onBlur,
  disabled,
  hasError,
  hasSuccess,
}: Props) {
  const [draft, setDraft] = useState(parseParts(value));
  const years = buildYears();

  useEffect(() => {
    setDraft(parseParts(value));
  }, [value]);

  const maxDay =
    draft.y && draft.m
      ? new Date(Number(draft.y), Number(draft.m), 0).getDate()
      : 31;

  const applyPatch = (patch: Partial<{ y: string; m: string; d: string }>) => {
    let y = patch.y !== undefined ? patch.y : draft.y;
    let m = patch.m !== undefined ? patch.m : draft.m;
    let d = patch.d !== undefined ? patch.d : draft.d;

    if (y && m && d) {
      const cap = new Date(Number(y), Number(m), 0).getDate();
      let dn = parseInt(d, 10);
      if (Number.isNaN(dn)) {
        d = '';
      } else if (dn > cap) {
        d = String(cap).padStart(2, '0');
      } else {
        d = String(dn).padStart(2, '0');
      }
    }

    const next = { y, m, d };
    setDraft(next);

    if (!next.y || !next.m || !next.d) {
      onChange('');
      return;
    }

    const mm = next.m.padStart(2, '0');
    const dd = next.d.padStart(2, '0');
    const iso = `${next.y}-${mm}-${dd}`;
    const parsed = parseISO(iso);
    if (!isValid(parsed)) {
      onChange('');
      return;
    }
    onChange(iso);
  };

  const rowClass = [
    styles.dobRow,
    hasError ? styles.dobRowError : '',
    hasSuccess ? styles.dobRowSuccess : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.dobFieldGroup}>
      <span className={styles.label} id="register-dob-label">
        Date of birth *
      </span>
      <p className={styles.dobHint} id="register-dob-hint">
        Choose day, month, and year (as on your ID). You must be 18 or older.
      </p>
      <div
        className={rowClass}
        role="group"
        aria-labelledby="register-dob-label"
        aria-describedby="register-dob-hint"
        onBlur={onBlur}
      >
        <div className={styles.dobCell}>
          <label className={styles.dobCellLabel} htmlFor="register-dob-day">
            Day
          </label>
          <Select
            id="register-dob-day"
            className={styles.dobSelect}
            value={draft.d}
            disabled={disabled}
            onChange={(e) => applyPatch({ d: e.target.value })}
            aria-invalid={hasError}
          >
            <option value="">—</option>
            {Array.from({ length: maxDay }, (_, i) => {
              const n = i + 1;
              const v = String(n).padStart(2, '0');
              return (
                <option key={v} value={v}>
                  {n}
                </option>
              );
            })}
          </Select>
        </div>
        <div className={styles.dobCell}>
          <label className={styles.dobCellLabel} htmlFor="register-dob-month">
            Month
          </label>
          <Select
            id="register-dob-month"
            className={styles.dobSelect}
            value={draft.m}
            disabled={disabled}
            onChange={(e) => applyPatch({ m: e.target.value })}
            aria-invalid={hasError}
          >
            <option value="">—</option>
            {MONTHS.map((mo) => (
              <option key={mo.value} value={mo.value}>
                {mo.label}
              </option>
            ))}
          </Select>
        </div>
        <div className={styles.dobCell}>
          <label className={styles.dobCellLabel} htmlFor="register-dob-year">
            Year
          </label>
          <Select
            id="register-dob-year"
            className={styles.dobSelect}
            value={draft.y}
            disabled={disabled}
            onChange={(e) => applyPatch({ y: e.target.value })}
            aria-invalid={hasError}
          >
            <option value="">—</option>
            {years.map((yr) => (
              <option key={yr} value={String(yr)}>
                {yr}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}

/** Shared validation for react-hook-form `date_of_birth` (ISO string). */
export function validateRegisterDob(value: string | undefined): true | string {
  const v = value?.trim() ?? '';
  if (!v) {
    return 'Date of birth is required';
  }
  const birthDate = parseISO(v);
  if (!isValid(birthDate)) {
    return 'Please enter a valid date of birth';
  }
  const age = differenceInYears(new Date(), birthDate);
  if (age < 18) {
    return 'You must be at least 18 years old';
  }
  if (age > 120) {
    return 'Please enter a valid date of birth';
  }
  return true;
}

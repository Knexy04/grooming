import './ui.css';
import type { PropsWithChildren } from 'react';

export function Page({ children }: PropsWithChildren) {
  return (
    <div className="page">
      <div className="container">{children}</div>
    </div>
  );
}

export function Topbar({
  title,
  right,
  below,
}: {
  title: string;
  right?: React.ReactNode;
  below?: React.ReactNode;
}) {
  return (
    <div className="topbar">
      <div className="topbar-row">
        <div className="topbar-title">{title}</div>
        <div className="topbar-right">{right}</div>
      </div>
      {below ? <div className="topbar-row topbar-row-below">{below}</div> : null}
    </div>
  );
}

// “Полноценный” хэдер: стеклянный фон, sticky сверху, табы/поиск/кнопки внутри.
export function Header({
  title,
  actions,
  tabs,
}: {
  title: string;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
}) {
  return (
    <div className="header">
      <div className="header-inner">
        <div className="header-top">
          <div className="header-title">{title}</div>
          <div className="header-actions-slot">{actions}</div>
        </div>
        {tabs ? <div className="header-tabs">{tabs}</div> : null}
      </div>
    </div>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <div className="card">{children}</div>;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
}: PropsWithChildren<{
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
}>) {
  return (
    <button className={`btn btn-${variant}`} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="field">
      {label ? <div className="label">{label}</div> : null}
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} />
    </label>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <div className="label">{label}</div>
      <textarea className="textarea" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function Divider() {
  return <div className="divider" />;
}

export function Badge({ children }: PropsWithChildren) {
  return <span className="badge">{children}</span>;
}



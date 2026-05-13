import { useRef, useState } from "react";
import "../styles/sidebar.css";

const icons = {
  dashboard: (
    <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
      <rect
        x="2"
        y="2"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        opacity="0.9"
      />
      <rect
        x="11"
        y="2"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="2"
        y="11"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="11"
        y="11"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  ),
  camera: (
    <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
      <rect
        x="1"
        y="5"
        width="18"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 5l1.5-2h3L13 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  reports: (
    <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
      <rect
        x="3"
        y="2"
        width="14"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 7h6M7 10h6M7 13h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  settings: (
    <svg className="nav-icon" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const AVATARS = [
  {
    id: 0,
    bg: "linear-gradient(135deg, #1a1d23, #3a3f4b)",
    svg: (
      <svg viewBox="0 0 40 40" fill="none">
        <polygon
          points="20,6 34,30 6,30"
          stroke="white"
          strokeWidth="1.8"
          fill="none"
          opacity="0.9"
        />
      </svg>
    ),
  },
];

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Панель управления",
    icon: "dashboard",
    live: true,
  },
  { id: "cameras", label: "Камеры", icon: "camera" },
  { id: "settings", label: "Настройки", icon: "settings" },
];

export default function Sidebar({ activeNav, onNavChange, account, onLogout }) {
  const [profile, setProfile] = useState(() => ({
    name: account?.username || "Админ",
    avatarId: account?.avatarId ?? 0,
  }));

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef(null);

  const avatar = AVATARS[profile.avatarId] ?? AVATARS[0];

  function updateProfile(patch) {
    const next = { ...profile, ...patch };
    setProfile(next);

    const saved = localStorage.getItem("pa_account");
    if (saved) {
      const acc = JSON.parse(saved);
      localStorage.setItem("pa_account", JSON.stringify({ ...acc, ...patch }));
    }
  }

  function startEdit() {
    setEditName(profile.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function confirmEdit() {
    const trimmed = editName.trim();
    if (trimmed) updateProfile({ name: trimmed });
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") confirmEdit();
    if (e.key === "Escape") setIsEditing(false);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <button
          className="sidebar-avatar-btn"
          style={{ background: avatar.bg }}
          onClick={() => setShowPicker((v) => !v)}
          title="Изменить аватар"
        >
          {avatar.svg}
          <span className="sidebar-avatar-hint">✎</span>
        </button>
        {isEditing ? (
          <input
            ref={inputRef}
            className="sidebar-name-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={confirmEdit}
            onKeyDown={handleKeyDown}
            maxLength={22}
          />
        ) : (
          <button className="sidebar-name-btn" onClick={startEdit}>
            <span>{profile.name}</span>
            <span className="sidebar-name-icon">✎</span>
          </button>
        )}
      </div>
      <p className="sidebar-section-label">Разделы</p>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeNav === item.id ? "active" : ""}`}
            onClick={() => onNavChange(item.id)}
          >
            {icons[item.icon]}
            {item.label}
            {item.live && activeNav !== item.id && (
              <span className="sidebar-live-badge">LIVE</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          Сделано с душой:
          <strong>RZB - Tech</strong>
        </div>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
            <path
              d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M13 14l3-4-3-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="16"
              y1="10"
              x2="7"
              y2="10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Выйти
        </button>
      </div>
    </aside>
  );
}

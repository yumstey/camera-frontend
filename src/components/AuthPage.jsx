import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import "../styles/auth.css";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";


const KEY = "pa_account";
const TOKEN_KEY = "pa_access_token";
const REFRESH_KEY = "pa_refresh_token";

export function loadAccount() {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function saveAccount(acc) {
  localStorage.setItem(KEY, JSON.stringify(acc));
  if (acc.accessToken) localStorage.setItem(TOKEN_KEY, acc.accessToken);
  if (acc.refreshToken) localStorage.setItem(REFRESH_KEY, acc.refreshToken);
}

export function deleteAccount() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}



function PinInput({ value, onChange, placeholder, onKeyDown, autoFocus }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-pin-wrap">
      <input
        className="auth-input"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        maxLength={32}
      />
      <button type="button" className="auth-pin-toggle" onClick={() => setShow((v) => !v)}>
        {show ? <FiEye /> : <FiEyeOff />}
      </button>
    </div>
  );
}

export default function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const account = loadAccount();

  useEffect(() => {
    if (account?.username) {
      setLoginUsername(account.username);
    }
  }, []);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  async function handleLogin() {
    setError("");
    if (!loginUsername.trim() || !loginPassword) {
      setError("Введите имя пользователя и пароль");
      triggerShake();
      return;
    }
    try {
      const result = await loginUser(loginUsername.trim(), loginPassword);
      const accountData = {
        username: loginUsername.trim(),
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        createdAt: new Date().toISOString(),
      };
      saveAccount(accountData);
      onLogin(accountData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Ошибка при входе");
      triggerShake();
      setLoginPassword("");
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div className="auth-bg">
      <div className={`auth-card ${shake ? "shake" : ""}`}>
        <p className="auth-section-label">
          {account ? "С возвращением" : "Вход"}
        </p>
        {account && (
          <div className="auth-profile-card">
            <div className="auth-profile-info">
              <p className="auth-profile-name">{account.username}</p>
            </div>
          </div>
        )}
        <label className="auth-label">Имя пользователя</label>
        <input
          className="auth-input"
          placeholder="Admin"
          value={loginUsername}
          onChange={(e) => {
            setLoginUsername(e.target.value);
            setError("");
          }}
          onKeyDown={handleKey}
          autoFocus
        />
        <label className="auth-label" style={{ marginTop: 14 }}>
          Пароль
        </label>
        <PinInput
          value={loginPassword}
          onChange={(v) => {
            setLoginPassword(v);
            setError("");
          }}
          placeholder="Введите пароль"
          onKeyDown={handleKey}
        />
        {error && <p className="auth-error">{error}</p>}
        <button className="auth-btn primary" style={{ marginTop: 16 }} onClick={handleLogin}>
          Войти в кабинет →
        </button>
      </div>
    </div>
  );
}
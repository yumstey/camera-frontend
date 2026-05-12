import { useState, useEffect } from 'react';
import '../styles/auth.css';
import { loginUser, registerUser } from '../api/authApi';

const KEY = 'pa_account';
const TOKEN_KEY = 'pa_access_token';
const REFRESH_KEY = 'pa_refresh_token';

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

const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
);

function passwordStrength(password) {
    if (password.length < 4) return { level: 0, label: '', color: '' };
    if (password.length < 6) return { level: 1, label: 'Слабый', color: '#ff3b30' };
    if (password.length < 8) return { level: 2, label: 'Средний', color: '#ff9500' };
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNum = /\d/.test(password);
    const hasSpec = /[^a-zA-Z0-9]/.test(password);
    const score = [hasLetter, hasNum, hasSpec].filter(Boolean).length;
    if (score === 3) return { level: 4, label: 'Надежный', color: '#34c759' };
    if (score === 2) return { level: 3, label: 'Хороший', color: '#30d158' };
    return { level: 2, label: 'Средний', color: '#ff9500' };
}

function PinInput({ value, onChange, placeholder, onKeyDown, autoFocus }) {
    const [show, setShow] = useState(false);
    return (
        <div className="auth-pin-wrap">
            <input
                className="auth-input"
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus={autoFocus}
                maxLength={32}
            />
            <button type="button" className="auth-pin-toggle" onClick={() => setShow(v => !v)}>
                {show ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
    );
}

function DeleteModal({ account, onConfirm, onCancel }) {
    const [password, setPassword] = useState('');
    const [err, setErr] = useState('');

    function confirm() {
        if (!password) {
            setErr('Введите пароль для подтверждения');
            return;
        }
        onConfirm();
    }

    return (
        <div className="auth-modal-backdrop" onClick={onCancel}>
            <div className="auth-modal" onClick={e => e.stopPropagation()}>
                <h3>Удалить аккаунт?</h3>
                <p>Введите пароль для подтверждения удаления <strong>"{account.username}"</strong>.</p>
                <PinInput value={password} onChange={setPassword} placeholder="Введите пароль" autoFocus
                    onKeyDown={e => e.key === 'Enter' && confirm()} />
                {err && <p className="auth-error" style={{ marginTop: 8 }}>{err}</p>}
                <div className="auth-modal-actions" style={{ marginTop: 16 }}>
                    <button className="auth-modal-btn cancel" onClick={onCancel}>Отмена</button>
                    <button className="auth-modal-btn delete" onClick={confirm}>Удалить</button>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage({ onLogin }) {
    const [mode, setMode] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [error, setError] = useState('');
    const [showDelete, setShowDelete] = useState(false);
    const [shake, setShake] = useState(false);

    const account = loadAccount();
    const strength = passwordStrength(password);

    useEffect(() => {
        if (account?.username) {
            setLoginUsername(account.username);
        }
    }, [account]);

    function triggerShake() {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    }

    async function handleLogin() {
        setError('');
        if (!loginUsername.trim() || !loginPassword) {
            setError('Введите имя пользователя и пароль');
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
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка при входе');
            triggerShake();
            setLoginPassword('');
        }
    }

    async function handleCreate() {
        setError('');
        if (!username.trim()) {
            setError('Пожалуйста, введите имя пользователя');
            return;
        }
        if (username.trim().length < 2) {
            setError('Имя должно быть не менее 2 символов');
            return;
        }
        if (password.length < 4) {
            setError('Пароль должен быть не менее 4 символов');
            return;
        }
        if (password !== passwordConfirm) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const result = await registerUser(username.trim(), password);
            const accountData = {
                username: username.trim(),
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                createdAt: new Date().toISOString(),
            };
            saveAccount(accountData);
            onLogin(accountData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка при регистрации');
        }
    }

    function handleDelete() {
        deleteAccount();
        setShowDelete(false);
        setMode('create');
        setUsername('');
        setPassword('');
        setPasswordConfirm('');
    }

    function handleKey(e) {
        if (e.key !== 'Enter') return;
        mode === 'create' ? handleCreate() : handleLogin();
    }

    return (
        <div className="auth-bg">
            <div className="auth-blob auth-blob--1" />
            <div className="auth-blob auth-blob--2" />
            <div className="auth-blob auth-blob--3" />

            <div className={`auth-card ${shake ? 'shake' : ''}`}>
                {account && mode === 'login' && (
                    <>
                        <p className="auth-section-label">С возвращением</p>

                        <div className="auth-profile-card">
                            <div className="auth-profile-info">
                                <p className="auth-profile-name">{account.username}</p>
                                <p className="auth-profile-date">
                                    С нами с {new Date(account.createdAt).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <label className="auth-label">Имя пользователя</label>
                        <input className="auth-input" placeholder="admin" value={loginUsername}
                            onChange={e => { setLoginUsername(e.target.value); setError(''); }}
                            onKeyDown={handleKey} autoFocus />

                        <label className="auth-label" style={{ marginTop: 14 }}>Пароль</label>
                        <PinInput value={loginPassword} onChange={setLoginPassword} placeholder="Введите пароль"
                            onKeyDown={handleKey} />

                        {error && <p className="auth-error">{error}</p>}

                        <button className="auth-btn primary" style={{ marginTop: 16 }} onClick={handleLogin}>
                            Войти в кабинет →
                        </button>

                        <div className="auth-divider"><span>или</span></div>

                        <div className="auth-bottom-actions">
                            <button className="auth-link" onClick={() => { setMode('create'); setError(''); }}>
                                Новый аккаунт
                            </button>
                            <button className="auth-link danger" onClick={() => setShowDelete(true)}>
                                Удалить аккаунт
                            </button>
                        </div>
                    </>
                )}

                {(!account || mode === 'create') && (
                    <>
                        <p className="auth-section-label">
                            {!account ? 'Создание аккаунта' : 'Новый аккаунт'}
                        </p>

                        <label className="auth-label">Имя пользователя</label>
                        <input className="auth-input" placeholder="admin" value={username}
                            onChange={e => { setUsername(e.target.value); setError(''); }}
                            onKeyDown={handleKey} autoFocus />

                        <label className="auth-label" style={{ marginTop: 14 }}>Пароль</label>
                        <PinInput value={password} onChange={setPassword} placeholder="Пароль"
                            onKeyDown={handleKey} />

                        {password.length > 0 && (
                            <div className="auth-strength">
                                <div className="auth-strength-bars">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="auth-strength-bar"
                                            style={{ background: strength.level >= i ? strength.color : 'var(--border-strong)' }} />
                                    ))}
                                </div>
                                <span style={{ color: strength.color, fontSize: 11, fontWeight: 600 }}>
                                    {strength.label}
                                </span>
                            </div>
                        )}

                        <label className="auth-label" style={{ marginTop: 12 }}>Подтвердите пароль</label>
                        <PinInput value={passwordConfirm} onChange={setPasswordConfirm} placeholder="Повторите пароль"
                            onKeyDown={handleKey} />

                        {passwordConfirm.length > 0 && (
                            <p style={{
                                fontSize: 12, marginTop: 5, fontWeight: 600,
                                color: password === passwordConfirm ? '#34c759' : '#ff3b30'
                            }}>
                                {password === passwordConfirm ? '✓ Пароли совпадают' : '✗ Пароли не совпадают'}
                            </p>
                        )}

                        {error && <p className="auth-error" style={{ marginTop: 8 }}>{error}</p>}

                        <button className="auth-btn primary" onClick={handleCreate}>
                            Создать аккаунт →
                        </button>

                        {account && (
                            <button className="auth-btn ghost" onClick={() => { setMode('login'); setError(''); }}>
                                ← Назад к входу
                            </button>
                        )}
                    </>
                )}
            </div>

            {showDelete && account && (
                <DeleteModal account={account} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />
            )}
        </div>
    );
}

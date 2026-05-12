import { useState, useEffect, useRef } from 'react';
import '../styles/cameras.css';

const STORAGE_KEY = 'pa_cameras';

function loadCameras() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCameras(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function parseInput(raw) {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([\d.]+)(?::(\d+))?$/);
  if (!match) return null;
  return {
    ip: match[1],
    port: match[2] || '8080',
  };
}

// Modal добавления камеры
function AddCameraModal({ onAdd, onClose }) {
  const [input, setInput] = useState('192.168.1.');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleAdd() {
    setError('');
    const parsed = parseInput(input);
    if (!parsed) {
      setError('Неверный формат. Пример: 192.168.1.87 или 192.168.1.87:8080');
      return;
    }
    onAdd({
      id: Date.now(),
      name: name.trim() || `Камера ${parsed.ip}`,
      ip: parsed.ip,
      port: parsed.port,
    });
    onClose();
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3 className="modal__title">Добавить камеру</h3>
          <p className="modal__desc">
            Введите IP-адрес камеры.<br/>
            Если порт не указан, будет использован <strong>8080</strong>.
          </p>

          <label className="modal__label">IP адрес</label>
          <input
              ref={inputRef}
              className="modal__input"
              placeholder="192.168.1.87 или 192.168.1.87:8080"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              onKeyDown={handleKey}
          />

          <label className="modal__label" style={{ marginTop: 12 }}>
            Имя <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(необязательно)</span>
          </label>
          <input
              className="modal__input"
              placeholder="Вход, Комната, Двор..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKey}
          />

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__actions">
            <button className="modal__btn cancel" onClick={onClose}>Отмена</button>
            <button className="modal__btn confirm" onClick={handleAdd}>Добавить</button>
          </div>
        </div>
      </div>
  );
}

// Карточка камеры
function CameraCard({ cam, tick, onRemove }) {
  const [status, setStatus] = useState('loading');
  const streamUrl = `http://${cam.ip}:${cam.port}/shot.jpg?t=${tick}`;

  return (
      <div className="camera-card">
        <div className="camera-card__topbar">
          <div>
            <span className="camera-card__label">{cam.name}</span>
            <span className="camera-card__ip-small">{cam.ip}:{cam.port}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className={`live-badge ${status}`}>
              <span className="live-badge__dot" />
              {status === 'online' ? 'В эфире' : status === 'offline' ? 'Оффлайн' : '...'}
            </div>

            <button
                className="remove-btn"
                onClick={() => onRemove(cam.id)}
                title="Удалить"
            >×</button>
          </div>
        </div>

        <div className="camera-preview">
          <img
              src={streamUrl}
              alt={cam.name}
              className="camera-stream"
              onLoad={() => setStatus('online')}
              onError={() => setStatus('offline')}
          />

          {status === 'offline' && (
              <div className="camera-offline-overlay">
                <p>Отключено</p>
                <span>{cam.ip}:{cam.port}</span>
              </div>
          )}

          {status === 'loading' && (
              <div className="camera-loading-overlay">
                <div className="spinner" />
              </div>
          )}
        </div>

        <div className="camera-card__footer">
          <span className="camera-card__fps">обновление 300ms</span>
        </div>
      </div>
  );
}

// Пустое состояние
function EmptyState({ onAdd }) {
  return (
      <div className="cameras-empty">
        <p>Камер пока нет</p>
        <span>Добавьте первую камеру, чтобы начать</span>
        <button className="empty-add-btn" onClick={onAdd}>+ Добавить камеру</button>
      </div>
  );
}

export default function CamerasPage() {
  const [cameras, setCameras] = useState(loadCameras);
  const [tick, setTick] = useState(Date.now());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 300);
    return () => clearInterval(id);
  }, []);

  function addCamera(cam) {
    const updated = [...cameras, cam];
    setCameras(updated);
    saveCameras(updated);
  }

  function removeCamera(id) {
    const updated = cameras.filter((c) => c.id !== id);
    setCameras(updated);
    saveCameras(updated);
  }

  return (
      <div className="cameras-page">

        <div className="cameras-topbar">
          <div className="cameras-summary">
            <span>{cameras.length} камер</span>
          </div>

          <button className="add-camera-btn" onClick={() => setShowModal(true)}>
            <span>+</span> Добавить камеру
          </button>
        </div>

        {cameras.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
            <div className="cameras-grid">
              {cameras.map((cam) => (
                  <CameraCard
                      key={cam.id}
                      cam={cam}
                      tick={tick}
                      onRemove={removeCamera}
                  />
              ))}
            </div>
        )}

        {showModal && (
            <AddCameraModal
                onAdd={addCamera}
                onClose={() => setShowModal(false)}
            />
        )}
      </div>
  );
}
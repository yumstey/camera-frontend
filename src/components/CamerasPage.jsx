import { createListCollection } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { cameraCreate, getAllCameras , cameraDelete } from "../api/camera";
import "../styles/cameras.css";
const STORAGE_KEY = "pa_cameras";
import { LuPencil } from "react-icons/lu";

const roleCollection = createListCollection({
  items: [
    { value: "checkin", label: "Вход (Check-in)" },
    { value: "checkout", label: "Выход (Check-out)" },
  ],
});

function saveCameras(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function parseInput(raw) {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([\d.]+)(?::(\d+))?$/);
  if (!match) return null;
  return {
    ip: match[1],
    port: match[2] || "8080",
  };
}

// Modal
function AddCameraModal({ onAdd, onClose }) {
  const [input, setInput] = useState("192.168.1.");
  const [name, setName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const [role, setRole] = useState("checkin");
  const [open, setOpen] = useState(false);
  const [port, setPort] = useState("");
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const options = [
    {
      label: "Входящие",
      value: "checkin",
    },
    {
      label: "Выходящие",
      value: "checkout",
    },
  ];

  const selected = options.find((item) => item.value === role);

  async function handleAdd() {
    setError("");

    const parsed = parseInput(input);
    if (!parsed) {
      setError("Неверный формат. Пример: 192.168.1.87 или 192.168.1.87:8080");
      return;
    }
    if (role === "" || role.length === 0) {
      setError("Выберите роль камеры");
      return;
    }

    const cameraName = name.trim() || `Камера ${parsed.ip}`;

    try {
      setLoading(true);
      const created = await cameraCreate(
        cameraName,
        parsed.ip,
        Number(parsed.port),
        streamUrl.trim(),
        role,
      );
      onAdd({
        id: created?.id ?? Date.now(),
        name: cameraName,
        ip: parsed.ip,
        port: parsed.port,
        role,
      });
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Ошибка при создании камеры",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") handleAdd();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">Добавить камеру</h3>
        <p className="modal__desc">
          Введите IP-адрес камеры.
          <br />
          Если порт не указан, будет использован <strong>8080</strong>.
        </p>
        <label className="modal__label">IP адрес</label>
        <input
          ref={inputRef}
          className="modal__input"
          placeholder="192.168.1.87 или 192.168.1.87:8080"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          onKeyDown={handleKey}
          autoFocus
        />
        <label className="modal__label" style={{marginTop: '8px'}}>Port</label>
        <input
          className="modal__input"
          placeholder="8080"
          value={port}
          onChange={(e) => {
            setPort(e.target.value);
            setError("");
          }}
          onKeyDown={handleKey}
        />
        <label className="modal__label" style={{ marginTop: 12 }}>
          Названия{" "}
          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
            (необязательно)
          </span>
        </label>
        <input
          className="modal__input"
          placeholder="Вход, Комната, Двор..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKey}
        />
        <label className="modal__label" style={{ marginTop: 12 }}>
          Stream URL{" "}
          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
            (необязательно)
          </span>
        </label>
        <input
          className="modal__input"
          placeholder="rtsp://192.168.1.87/stream"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
        />
        <div>
          <label className="modal__label" style={{ marginTop: 12 }}>
            Роль камеры
          </label>

          <div
            ref={selectRef}
            style={{
              position: "relative",
              marginTop: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              style={{
                width: "100%",
                height: "42px",
                borderRadius: "10px",
                border: "1px solid #d9d9d9",
                background: "#fff",
                padding: "0 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <span>{selected?.label}</span>

              <IoIosArrowDown
                style={{
                  transition: "0.2s",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "48px",
                  left: 0,
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #d9d9d9",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  zIndex: 10,
                }}
              >
                {options.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setRole(item.value);
                      setOpen(false);
                    }}
                    style={{
                      width: "100%",
                      height: "42px",
                      border: "none",
                      background: role === item.value ? "#f5f5f5" : "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      padding: "0 14px",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions">
          <button
            className="modal__btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            className="modal__btn confirm"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? "..." : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Camera Card
function CameraCard({ cam, onRemove, tick }) {
  const [status, setStatus] = useState("loading");
  const streamUrl = `http://${cam.ip}:${cam.port}/shot.jpg?t=${tick}`;

  return (
    <div className="camera-card">
      <div className="camera-card__topbar">
        <div>
          <span className="camera-card__label">{cam.name}</span>
          <span className="camera-card__ip-small">
            {cam.ip}:{cam.port}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className={`live-badge ${status}`}>
            <span className="live-badge__dot" />
            {status === "online"
              ? "В эфире"
              : status === "offline"
                ? "Оффлайн"
                : "..."}
          </div>

          <button
            className="edit-btn"
            title="Изменить"
          >
            <LuPencil />
          </button>
          <button
            className="remove-btn"
            onClick={() => onRemove(cam.id)}
            title="Удалить"
          >
            ×
          </button>
        </div>
      </div>

      <div className="camera-preview">
        <img
          src={streamUrl}
          alt={cam.name}
          className="camera-stream"
          onLoad={() => setStatus("online")}
          onError={() => setStatus("offline")}
        />

        {status === "offline" && (
          <div className="camera-offline-overlay">
            <p>Отключено</p>
            <span>
              {cam.ip}:{cam.port}
            </span>
          </div>
        )}

        {status === "loading" && (
          <div className="camera-loading-overlay">
            <div className="spinner" />
          </div>
        )}
      </div>

      <div className="camera-card__footer">
        {cam.role && (
          <span className={`role-badge ${cam.role}`}>
            {cam.role === "checkin" ? "Вход" : "Выход"}
          </span>
        )}
        <span className="camera-card__fps">обновление 300ms</span>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="cameras-empty">
      <p>Камер пока нет</p>
      <span>Добавьте первую камеру, чтобы начать</span>
      <button className="empty-add-btn" onClick={onAdd}>
        + Добавить камеру
      </button>
    </div>
  );
}

// Main page
export default function CamerasPage() {
  const [cameras, setCameras] = useState([]);
  const [tick, setTick] = useState(Date.now());
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 300);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await getAllCameras();
        setCameras(res || []);
        console.log(res);
      } catch (error) {
        console.log(error);
        setCameras([]);
      }
    };
    fetchCameras();
  }, []);

  function addCamera(cam) {
    const updated = [...cameras, cam];
    setCameras(updated);
    saveCameras(updated);
  }

  const removeCamera = async (id) => {
    const updated = cameras.filter((c) => c.id !== id);
    await cameraDelete(id)
    setCameras(updated);
    saveCameras(updated);
  }

  const checkinCount =
    cameras?.filter((c) => c.role === "checkin")?.length || 0;
  const checkoutCount =
    cameras?.filter((c) => c.role === "checkout")?.length || 0;

  const filteredCameras =
    cameras?.filter((cam) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "checkin") return cam.role === "checkin";
      if (activeFilter === "checkout") return cam.role === "checkout";
      return true;
    }) || [];

  const handleTabChange = (tab) => {
    setActiveFilter(tab);
  };

  return (
    <div className="cameras-page">
      <div className="cameras-topbar">
        <div className="cameras-summary">
          <span>{cameras?.length} камер</span>
        </div>
        <button className="add-camera-btn" onClick={() => setShowModal(true)}>
          <span>+</span> Добавить камеру
        </button>
      </div>

      <div style={{ maxWidth: "max-content", marginBottom: "25px" }}>
        <div className="peak-tabs">
          {["all", "checkin", "checkout"].map((t) => (
            <button
              key={t}
              className={`tab-btn ${activeFilter === t ? "active" : ""}`}
              onClick={() => handleTabChange(t)}
            >
              {t === "all"
                ? "Все"
                : t === "checkin"
                  ? `Вход (${checkinCount})`
                  : `Выход (${checkoutCount})`}
            </button>
          ))}
        </div>
      </div>

      {cameras?.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div className="cameras-grid">
          {filteredCameras?.map((cam) => (
            <CameraCard
              key={cam.id}
              cam={cam}
              onRemove={removeCamera}
              tick={tick}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddCameraModal onAdd={addCamera} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

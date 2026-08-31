import React, { useState, useEffect } from "react";
import { apiRequest } from "./api";

export default function App() {
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'tasks' | 'leaderboard' | 'wallet'
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskCategory, setTaskCategory] = useState("all");

  // Состояния для модальных окон
  const [showRefModal, setShowRefModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [copied, setCopied] = useState(false);

  // Состояния для формы вывода
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [profileData, tasksData, leaderboardData] = await Promise.all([
        apiRequest("/api/user/profile"),
        apiRequest("/api/tasks"),
        apiRequest("/api/leaderboard"),
      ]);
      setUser(profileData);
      setTasks(tasksData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
    }
  };

  const handleCompleteTask = async (taskId) => {
    triggerHaptic();
    try {
      const res = await apiRequest("/api/tasks/complete", {
        method: "POST",
        body: JSON.stringify({ task_id: taskId }),
      });

      setUser((prev) => ({
        ...prev,
        balance: res.new_balance,
        tasks_completed: prev.tasks_completed + 1,
      }));

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: true } : t))
      );

      setSelectedTask(null);
      alert(res.message);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBuyPro = async () => {
    triggerHaptic();
    try {
      const res = await apiRequest("/api/payments/buy_pro", { method: "POST" });
      if (res.invoice_link && window.Telegram?.WebApp) {
        window.Telegram.WebApp.openInvoice(res.invoice_link, (status) => {
          if (status === "paid") {
            alert("Поздравляем! Вы успешно приобрели PRO-статус.");
            loadInitialData();
          }
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    triggerHaptic();
    try {
      const res = await apiRequest("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          wallet: walletAddress,
        }),
      });
      setUser((prev) => ({ ...prev, balance: res.new_balance }));
      setWithdrawStatus({ type: "success", text: res.message });
      setWithdrawAmount("");
      setWalletAddress("");
    } catch (err) {
      setWithdrawStatus({ type: "error", text: err.message });
    }
  };

  const copyRefLink = () => {
    triggerHaptic();
    const botName = "TMA_Earning_Bot"; // Замените на username вашего бота
    const refLink = `https://t.me/${botName}?start=ref_${user?.id}`;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Загрузка TMA Earning Hub...</p>
      </div>
    );
  }

  const filteredTasks =
    taskCategory === "all"
      ? tasks
      : tasks.filter((t) => t.category === taskCategory);

  return (
    <div style={styles.appContainer}>
      {/* --- ЭКРАН 1: ПРОФИЛЬ --- */}
      {activeTab === "profile" && (
        <div style={styles.tabContent}>
          <div style={styles.profileCard}>
            <div style={styles.avatar}>👤</div>
            <h2 style={styles.userName}>{user?.first_name || "Пользователь"}</h2>
            <p style={styles.userHandle}>@{user?.username || "no_username"}</p>
            <div style={styles.balanceBadge}>
              <span style={styles.balanceText}>{user?.balance}</span> coins
            </div>
          </div>

          {/* Интерактивная сетка карточек */}
          <div style={styles.statsGrid}>
            <div
              style={styles.statCard}
              onClick={() => {
                triggerHaptic();
                setActiveTab("leaderboard");
              }}
            >
              <span style={styles.statTitle}>Рейтинг</span>
              <span style={styles.statValue}>#{user?.rank || 1}</span>
              <span style={styles.statHint}>Перейти в лидеры →</span>
            </div>

            <div
              style={styles.statCard}
              onClick={() => {
                triggerHaptic();
                setActiveTab("tasks");
              }}
            >
              <span style={styles.statTitle}>Выполнено</span>
              <span style={styles.statValue}>{user?.tasks_completed || 0}</span>
              <span style={styles.statHint}>Открыть задания →</span>
            </div>

            <div
              style={styles.statCard}
              onClick={() => {
                triggerHaptic();
                setShowRefModal(true);
              }}
            >
              <span style={styles.statTitle}>Рефералы</span>
              <span style={styles.statValue}>{user?.referrals_count || 0}</span>
              <span style={styles.statHint}>Пригласить друзей →</span>
            </div>
          </div>

          <button style={styles.proButton} onClick={handleBuyPro}>
            ⭐ {user?.is_pro ? "PRO Активен (x2 Доход)" : "Купить PRO (x2 Доход) — 250 Stars"}
          </button>
        </div>
      )}

      {/* --- ЭКРАН 2: БИРЖА ЗАДАНИЙ --- */}
      {activeTab === "tasks" && (
        <div style={styles.tabContent}>
          <h2 style={styles.pageTitle}>🎯 Биржа Заданий</h2>

          {/* Категории */}
          <div style={styles.categoriesRow}>
            {["all", "ai", "copywriting", "social", "survey"].map((cat) => (
              <button
                key={cat}
                style={{
                  ...styles.catChip,
                  ...(taskCategory === cat ? styles.catChipActive : {}),
                }}
                onClick={() => {
                  triggerHaptic();
                  setTaskCategory(cat);
                }}
              >
                {cat === "all" && "Все"}
                {cat === "ai" && "ИИ"}
                {cat === "copywriting" && "Тексты"}
                {cat === "social" && "Соцсети"}
                {cat === "survey" && "Опросы"}
              </button>
            ))}
          </div>

          <div style={styles.tasksList}>
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  ...styles.taskCard,
                  opacity: t.is_completed ? 0.6 : 1,
                }}
                onClick={() => setSelectedTask(t)}
              >
                <div style={styles.taskInfo}>
                  <h4 style={styles.taskTitle}>{t.title}</h4>
                  <p style={styles.taskReward}>+{t.reward} coins</p>
                </div>
                {t.is_completed ? (
                  <span style={styles.completedBadge}>✓ Выполнено</span>
                ) : (
                  <button style={styles.actionBtn}>Start</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ЭКРАН 3: РЕЙТИНГ / ЛИДЕРБОРД --- */}
      {activeTab === "leaderboard" && (
        <div style={styles.tabContent}>
          <h2 style={styles.pageTitle}>🏆 Топ Заработков</h2>
          <div style={styles.leaderList}>
            {leaderboard.map((item) => (
              <div
                key={item.rank}
                style={{
                  ...styles.leaderCard,
                  border: item.first_name === user?.first_name ? "1px solid #3b82f6" : "none",
                }}
              >
                <div style={styles.leaderRank}>
                  {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}
                </div>
                <div style={styles.leaderDetails}>
                  <p style={styles.leaderName}>
                    {item.first_name} {item.is_pro && "⭐"}
                  </p>
                  <p style={styles.leaderSub}>{item.tasks_completed} заданий</p>
                </div>
                <div style={styles.leaderBalance}>{item.balance} coins</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ЭКРАН 4: КОШЕЛЕК И ВЫВОД --- */}
      {activeTab === "wallet" && (
        <div style={styles.tabContent}>
          <h2 style={styles.pageTitle}>💼 Кошелек</h2>
          <div style={styles.walletCard}>
            <p style={{ margin: 0, opacity: 0.8 }}>Доступный баланс</p>
            <h1 style={{ fontSize: 36, margin: "8px 0" }}>{user?.balance} coins</h1>
            <p style={{ fontSize: 12, opacity: 0.6 }}>Минимальный вывод: 1000 coins</p>
          </div>

          <form style={styles.withdrawForm} onSubmit={handleWithdraw}>
            <h3>Заявка на вывод</h3>
            {withdrawStatus && (
              <div
                style={{
                  ...styles.alertMsg,
                  backgroundColor: withdrawStatus.type === "success" ? "#166534" : "#991b1b",
                }}
              >
                {withdrawStatus.text}
              </div>
            )}
            <input
              type="number"
              placeholder="Сумма вывода (мин. 1000)"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              style={styles.inputField}
              required
            />
            <input
              type="text"
              placeholder="Адрес TON / USDT кошелька"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              style={styles.inputField}
              required
            />
            <button type="submit" style={styles.submitBtn}>
              Запросить выплату
            </button>
          </form>
        </div>
      )}

      {/* --- МОДАЛЬНОЕ ОКНО: РЕФЕРАЛЬНАЯ СИСТЕМА --- */}
      {showRefModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRefModal(false)}>
          <div style={styles.modalBody} onClick={(e) => e.stopPropagation()}>
            <h3>👥 Партнерская программа</h3>
            <p style={{ fontSize: 14, color: "#94a3b8" }}>
              Приглашайте друзей и получайте **+150 coins** за каждого зарегистрированного реферала!
            </p>
            <div style={styles.refBox}>
              <input
                readOnly
                value={`https://t.me/TMA_Earning_Bot?start=ref_${user?.id}`}
                style={styles.refInput}
              />
              <button style={styles.copyBtn} onClick={copyRefLink}>
                {copied ? "Скопировано!" : "Копировать"}
              </button>
            </div>
            <button style={styles.closeBtn} onClick={() => setShowRefModal(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* --- МОДАЛЬНОЕ ОКНО: ДЕТАЛИ ЗАДАНИЯ --- */}
      {selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTask(null)}>
          <div style={styles.modalBody} onClick={(e) => e.stopPropagation()}>
            <h3>{selectedTask.title}</h3>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>{selectedTask.description}</p>
            <p style={{ fontSize: 18, color: "#10b981", fontWeight: "bold" }}>
              Награда: +{selectedTask.reward} coins
            </p>
            {!selectedTask.is_completed ? (
              <button
                style={styles.submitBtn}
                onClick={() => handleCompleteTask(selectedTask.id)}
              >
                Подтвердить выполнение
              </button>
            ) : (
              <p style={{ color: "#64748b" }}>Вы уже получили награду за это задание.</p>
            )}
            <button style={styles.closeBtn} onClick={() => setSelectedTask(null)}>
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* --- НАВИГАЦИОННАЯ ПАНЕЛЬ ВНИЗУ --- */}
      <nav style={styles.navbar}>
        <button
          style={{ ...styles.navItem, color: activeTab === "profile" ? "#3b82f6" : "#94a3b8" }}
          onClick={() => {
            triggerHaptic();
            setActiveTab("profile");
          }}
        >
          👤 Профиль
        </button>
        <button
          style={{ ...styles.navItem, color: activeTab === "tasks" ? "#3b82f6" : "#94a3b8" }}
          onClick={() => {
            triggerHaptic();
            setActiveTab("tasks");
          }}
        >
          🎯 Задания
        </button>
        <button
          style={{ ...styles.navItem, color: activeTab === "leaderboard" ? "#3b82f6" : "#94a3b8" }}
          onClick={() => {
            triggerHaptic();
            setActiveTab("leaderboard");
          }}
        >
          🏆 Лидеры
        </button>
        <button
          style={{ ...styles.navItem, color: activeTab === "wallet" ? "#3b82f6" : "#94a3b8" }}
          onClick={() => {
            triggerHaptic();
            setActiveTab("wallet");
          }}
        >
          💼 Кошелек
        </button>
      </nav>
    </div>
  );
}

// --- СТИЛИ КЛИЕНТА (DARK THEME) ---
const styles = {
  appContainer: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    minHeight: "100vh",
    paddingBottom: "70px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#0f172a",
    color: "#fff",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "4px solid #3b82f6",
    borderTop: "4px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  tabContent: { padding: 16 },
  profileCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  avatar: { fontSize: 40, marginBottom: 8 },
  userName: { margin: "0 0 4px 0", fontSize: 20 },
  userHandle: { margin: 0, color: "#64748b", fontSize: 14 },
  balanceBadge: {
    display: "inline-block",
    backgroundColor: "#334155",
    padding: "8px 16px",
    borderRadius: 20,
    marginTop: 12,
    fontSize: 14,
  },
  balanceText: { color: "#3b82f6", fontWeight: "bold", fontSize: 22 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.1s",
    border: "1px solid #334155",
  },
  statTitle: { fontSize: 12, color: "#94a3b8", display: "block" },
  statValue: { fontSize: 18, fontWeight: "bold", margin: "4px 0", display: "block" },
  statHint: { fontSize: 9, color: "#3b82f6", display: "block" },
  proButton: {
    width: "100%",
    backgroundColor: "#d97706",
    color: "#fff",
    border: "none",
    padding: 14,
    borderRadius: 12,
    fontWeight: "bold",
    fontSize: 14,
    cursor: "pointer",
  },
  pageTitle: { fontSize: 22, margin: "0 0 16px 0" },
  categoriesRow: { display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 },
  catChip: {
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    border: "none",
    padding: "8px 14px",
    borderRadius: 20,
    fontSize: 13,
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  catChipActive: { backgroundColor: "#3b82f6", color: "#fff" },
  tasksList: { display: "flex", flexDirection: "column", gap: 10 },
  taskCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  taskInfo: { flex: 1 },
  taskTitle: { margin: "0 0 4px 0", fontSize: 15 },
  taskReward: { margin: 0, color: "#10b981", fontSize: 13, fontWeight: "bold" },
  completedBadge: { color: "#64748b", fontSize: 12 },
  actionBtn: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "6px 16px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
  },
  leaderList: { display: "flex", flexDirection: "column", gap: 8 },
  leaderCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  leaderRank: { width: 30, textAlign: "center", fontSize: 16, fontWeight: "bold" },
  leaderDetails: { flex: 1 },
  leaderName: { margin: 0, fontSize: 14, fontWeight: "bold" },
  leaderSub: { margin: 0, fontSize: 12, color: "#64748b" },
  leaderBalance: { color: "#3b82f6", fontWeight: "bold" },
  walletCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  withdrawForm: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  inputField: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#10b981",
    color: "#fff",
    border: "none",
    padding: 14,
    borderRadius: 8,
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
  alertMsg: { padding: 10, borderRadius: 8, fontSize: 13, color: "#fff" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 1000,
  },
  modalBody: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  refBox: { display: "flex", gap: 8 },
  refInput: {
    flex: 1,
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    color: "#fff",
    padding: 8,
    borderRadius: 8,
    fontSize: 12,
  },
  copyBtn: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },
  closeBtn: {
    backgroundColor: "transparent",
    color: "#64748b",
    border: "none",
    padding: 8,
    cursor: "pointer",
  },
  navbar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#1e293b",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    borderTop: "1px solid #334155",
    zIndex: 100,
  },
  navItem: {
    background: "none",
    border: "none",
    fontSize: 12,
    fontWeight: "bold",
    cursor: "pointer",
  },
};

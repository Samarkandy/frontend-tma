import React, { useState, useEffect } from 'react';
import { apiRequest } from "./api";
import { 
  User, 
  Target, 
  Trophy, 
  Wallet, 
  Zap, 
  ChevronRight, 
  Sparkles, 
  Copy, 
  Check, 
  CheckCircle2, 
  X, 
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Layers,
  Users
} from 'lucide-react';

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
    const botName = "TMA_Earning_Bot";
    const refLink = `https://t.me/${botName}?start=ref_${user?.id}`;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: 16, color: "#8e8e93", fontSize: 15, fontWeight: "500" }}>
          Загрузка TMA Hub...
        </p>
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
          
          {/* iOS Виджет Профиля */}
          <div style={styles.profileWidget}>
            <div style={styles.avatarWrapper}>
              <User size={38} color="#007AFF" />
            </div>
            <h2 style={styles.userName}>{user?.first_name || "Пользователь"}</h2>
            <p style={styles.userHandle}>@{user?.username || "no_username"}</p>
            
            <div style={styles.balanceBadge}>
              <Coins size={18} color="#007AFF" style={{ marginRight: 6 }} />
              <span style={styles.balanceText}>{user?.balance?.toLocaleString() || 0}</span>
              <span style={styles.coinsLabel}>coins</span>
            </div>
          </div>

          {/* iOS Сетка Интерактивных Виджетов */}
          <div style={styles.statsGrid}>
            <div
              style={styles.statCard}
              onClick={() => {
                triggerHaptic();
                setActiveTab("leaderboard");
              }}
            >
              <div style={styles.statHeader}>
                <Trophy size={20} color="#FFCC00" />
                <ChevronRight size={16} color="#8e8e93" />
              </div>
              <span style={styles.statValue}>#{user?.rank || 1}</span>
              <span style={styles.statTitle}>Рейтинг</span>
            </div>

            <div
              style={styles.statCard}
              onClick={() => {
                triggerHaptic();
                setActiveTab("tasks");
              }}
            >
              <div style={styles.statHeader}>
                <CheckCircle2 size={20} color="#34C759" />
                <ChevronRight size={16} color="#8e8e93" />
              </div>
              <span style={styles.statValue}>{user?.tasks_completed || 0}</span>
              <span style={styles.statTitle}>Заданий</span>
            </div>

            <div
              style={styles.statCard}
              onClick={() => {
                triggerHaptic();
                setShowRefModal(true);
              }}
            >
              <div style={styles.statHeader}>
                <Users size={20} color="#AF52DE" />
                <ChevronRight size={16} color="#8e8e93" />
              </div>
              <span style={styles.statValue}>{user?.referrals_count || 0}</span>
              <span style={styles.statTitle}>Друзей</span>
            </div>
          </div>

          {/* Кнопка PRO в стиле One UI Gradient Banner */}
          <button style={styles.proButton} onClick={handleBuyPro}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sparkles size={22} color="#FFF" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "700", fontSize: 15 }}>
                  {user?.is_pro ? "PRO Активен" : "Активировать PRO Status"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, fontWeight: "400" }}>
                  {user?.is_pro ? "Удвоенный доход со всех заданий" : "Умножайте доход x2 — 250 Stars"}
                </div>
              </div>
            </div>
            <ArrowUpRight size={20} color="#FFF" />
          </button>
        </div>
      )}

      {/* --- ЭКРАН 2: БИРЖА ЗАДАНИЙ --- */}
      {activeTab === "tasks" && (
        <div style={styles.tabContent}>
          <div style={styles.headerBlock}>
            <h1 style={styles.pageTitle}>Биржа Заданий</h1>
            <p style={styles.pageSubtitle}>Выполняйте простые таски и получайте coins</p>
          </div>

          {/* iOS Segmented Control / Переключатель Категорий */}
          <div style={styles.categoriesRow}>
            {[
              { id: "all", label: "Все" },
              { id: "ai", label: "ИИ" },
              { id: "copywriting", label: "Тексты" },
              { id: "social", label: "Соцсети" },
              { id: "survey", label: "Опросы" },
            ].map((cat) => (
              <button
                key={cat.id}
                style={{
                  ...styles.catChip,
                  ...(taskCategory === cat.id ? styles.catChipActive : {}),
                }}
                onClick={() => {
                  triggerHaptic();
                  setTaskCategory(cat.id);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Список карточек заданий */}
          <div style={styles.tasksList}>
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  ...styles.taskCard,
                  opacity: t.is_completed ? 0.55 : 1,
                }}
                onClick={() => setSelectedTask(t)}
              >
                <div style={styles.taskIconBox}>
                  <Target size={22} color={t.is_completed ? "#8e8e93" : "#007AFF"} />
                </div>
                <div style={styles.taskInfo}>
                  <h4 style={styles.taskTitle}>{t.title}</h4>
                  <p style={styles.taskReward}>+{t.reward} coins</p>
                </div>
                {t.is_completed ? (
                  <span style={styles.completedBadge}>
                    <CheckCircle2 size={16} color="#34C759" style={{ marginRight: 4 }} /> Готово
                  </span>
                ) : (
                  <button style={styles.actionBtn}>
                    Старт
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ЭКРАН 3: РЕЙТИНГ / ЛИДЕРБОРД --- */}
      {activeTab === "leaderboard" && (
        <div style={styles.tabContent}>
          <div style={styles.headerBlock}>
            <h1 style={styles.pageTitle}>Топ Лидеров</h1>
            <p style={styles.pageSubtitle}>Лучшие пользователи по количеству заработка</p>
          </div>

          <div style={styles.leaderList}>
            {leaderboard.map((item) => (
              <div
                key={item.rank}
                style={{
                  ...styles.leaderCard,
                  border: item.first_name === user?.first_name ? "1px solid #007AFF" : "1px solid rgba(255, 255, 255, 0.05)",
                  backgroundColor: item.first_name === user?.first_name ? "rgba(0, 122, 255, 0.08)" : "rgba(28, 28, 30, 0.65)",
                }}
              >
                <div style={styles.leaderRank}>
                  {item.rank === 1 ? (
                    <span style={{ color: "#FFCC00", fontWeight: "800", fontSize: 18 }}>🥇</span>
                  ) : item.rank === 2 ? (
                    <span style={{ color: "#C0C0C0", fontWeight: "800", fontSize: 18 }}>🥈</span>
                  ) : item.rank === 3 ? (
                    <span style={{ color: "#CD7F32", fontWeight: "800", fontSize: 18 }}>🥉</span>
                  ) : (
                    <span style={{ color: "#8e8e93", fontSize: 14 }}>#{item.rank}</span>
                  )}
                </div>
                <div style={styles.leaderDetails}>
                  <p style={styles.leaderName}>
                    {item.first_name} {item.is_pro && <Sparkles size={14} color="#FFCC00" style={{ marginLeft: 4, display: "inline" }} />}
                  </p>
                  <p style={styles.leaderSub}>{item.tasks_completed} выполнено</p>
                </div>
                <div style={styles.leaderBalance}>{item.balance?.toLocaleString()} coins</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ЭКРАН 4: КОШЕЛЕК И ВЫВОД --- */}
      {activeTab === "wallet" && (
        <div style={styles.tabContent}>
          <div style={styles.headerBlock}>
            <h1 style={styles.pageTitle}>Кошелек</h1>
            <p style={styles.pageSubtitle}>Управление вашими средствами и вывод</p>
          </div>

          {/* macOS Glassmorphism Карта Баланса */}
          <div style={styles.walletCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.6)", fontWeight: "500" }}>
                Доступный баланс
              </span>
              <ShieldCheck size={20} color="#34C759" />
            </div>
            <h1 style={styles.walletBalanceText}>
              {user?.balance?.toLocaleString()} <span style={{ fontSize: 20, fontWeight: "500" }}>coins</span>
            </h1>
            <p style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.4)", margin: 0 }}>
              Минимальный вывод: 1 000 coins
            </p>
          </div>

          {/* iOS Form Group / Форма вывода */}
          <form style={styles.withdrawForm} onSubmit={handleWithdraw}>
            <h3 style={{ fontSize: 17, fontWeight: "600", margin: "0 0 4px 0" }}>Вывести средства</h3>
            {withdrawStatus && (
              <div
                style={{
                  ...styles.alertMsg,
                  backgroundColor: withdrawStatus.type === "success" ? "rgba(52, 199, 89, 0.15)" : "rgba(255, 59, 48, 0.15)",
                  color: withdrawStatus.type === "success" ? "#34C759" : "#FF3B30",
                  border: `1px solid ${withdrawStatus.type === "success" ? "#34C759" : "#FF3B30"}`,
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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span>Отправить заявку</span>
                <ArrowUpRight size={18} />
              </div>
            </button>
          </form>
        </div>
      )}

      {/* --- МОДАЛЬНОЕ ОКНО: РЕФЕРАЛЬНАЯ СИСТЕМА --- */}
      {showRefModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRefModal(false)}>
          <div style={styles.modalBody} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: "700" }}>Пригласить друзей</h3>
              <button style={styles.closeIconBtn} onClick={() => setShowRefModal(false)}>
                <X size={20} color="#8e8e93" />
              </button>
            </div>
            <p style={{ fontSize: 14, color: "#8e8e93", lineHeight: "1.4", margin: 0 }}>
              Получайте <strong style={{ color: "#007AFF" }}>+150 coins</strong> за каждого друга, который зайдёт в бота по вашей ссылке.
            </p>
            <div style={styles.refBox}>
              <input
                readOnly
                value={`https://t.me/TMA_Earning_Bot?start=ref_${user?.id}`}
                style={styles.refInput}
              />
              <button style={styles.copyBtn} onClick={copyRefLink}>
                {copied ? <Check size={18} color="#34C759" /> : <Copy size={18} color="#007AFF" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛЬНОЕ ОКНО: ДЕТАЛИ ЗАДАНИЯ --- */}
      {selectedTask && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTask(null)}>
          <div style={styles.modalBody} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: "700" }}>{selectedTask.title}</h3>
              <button style={styles.closeIconBtn} onClick={() => setSelectedTask(null)}>
                <X size={20} color="#8e8e93" />
              </button>
            </div>
            <p style={{ color: "#8e8e93", fontSize: 14, lineHeight: "1.5", margin: 0 }}>
              {selectedTask.description}
            </p>
            <div style={styles.taskRewardTag}>
              Награда: +{selectedTask.reward} coins
            </div>
            {!selectedTask.is_completed ? (
              <button
                style={styles.submitBtn}
                onClick={() => handleCompleteTask(selectedTask.id)}
              >
                Подтвердить выполнение
              </button>
            ) : (
              <p style={{ color: "#34C759", textAlign: "center", fontSize: 14, fontWeight: "500", margin: 0 }}>
                ✓ Вы уже получили награду за это задание
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- FLOATING TAB BAR (iOS / One UI Style) --- */}
      <nav style={styles.navbar}>
        <button
          style={styles.navItem}
          onClick={() => {
            triggerHaptic();
            setActiveTab("profile");
          }}
        >
          <User size={22} color={activeTab === "profile" ? "#007AFF" : "#8e8e93"} />
          <span style={{ ...styles.navLabel, color: activeTab === "profile" ? "#007AFF" : "#8e8e93" }}>
            Профиль
          </span>
        </button>

        <button
          style={styles.navItem}
          onClick={() => {
            triggerHaptic();
            setActiveTab("tasks");
          }}
        >
          <Target size={22} color={activeTab === "tasks" ? "#007AFF" : "#8e8e93"} />
          <span style={{ ...styles.navLabel, color: activeTab === "tasks" ? "#007AFF" : "#8e8e93" }}>
            Задания
          </span>
        </button>

        <button
          style={styles.navItem}
          onClick={() => {
            triggerHaptic();
            setActiveTab("leaderboard");
          }}
        >
          <Trophy size={22} color={activeTab === "leaderboard" ? "#007AFF" : "#8e8e93"} />
          <span style={{ ...styles.navLabel, color: activeTab === "leaderboard" ? "#007AFF" : "#8e8e93" }}>
            Лидеры
          </span>
        </button>

        <button
          style={styles.navItem}
          onClick={() => {
            triggerHaptic();
            setActiveTab("wallet");
          }}
        >
          <Wallet size={22} color={activeTab === "wallet" ? "#007AFF" : "#8e8e93"} />
          <span style={{ ...styles.navLabel, color: activeTab === "wallet" ? "#007AFF" : "#8e8e93" }}>
            Кошелек
          </span>
        </button>
      </nav>
    </div>
  );
}

// --- iOS / ONE UI ДИЗАЙН-СИСТЕМА СТИЛЕЙ ---
const styles = {
  appContainer: {
    backgroundColor: "#000000",
    color: "#f2f2f7",
    minHeight: "100vh",
    paddingBottom: "90px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#000000",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid rgba(0, 122, 255, 0.2)",
    borderTop: "3px solid #007AFF",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  tabContent: { 
    padding: "20px 16px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  headerBlock: {
    marginBottom: 20,
  },
  pageTitle: { 
    fontSize: 28, 
    fontWeight: "800", 
    margin: "0 0 4px 0",
    letterSpacing: "-0.5px"
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#8e8e93",
    margin: 0,
  },

  /* iOS Profile Widget */
  profileWidget: {
    background: "rgba(28, 28, 30, 0.65)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "28px",
    padding: "28px 20px",
    textAlign: "center",
    marginBottom: 16,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    backgroundColor: "rgba(0, 122, 255, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px auto",
    border: "1px solid rgba(0, 122, 255, 0.3)",
  },
  userName: { 
    margin: "0 0 2px 0", 
    fontSize: 22, 
    fontWeight: "700",
    letterSpacing: "-0.3px"
  },
  userHandle: { 
    margin: 0, 
    color: "#8e8e93", 
    fontSize: 14,
    fontWeight: "400"
  },
  balanceBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    border: "1px solid rgba(0, 122, 255, 0.25)",
    padding: "8px 18px",
    borderRadius: "30px",
    marginTop: 16,
  },
  balanceText: { 
    color: "#007AFF", 
    fontWeight: "800", 
    fontSize: 20,
    letterSpacing: "-0.5px"
  },
  coinsLabel: {
    color: "#007AFF",
    fontSize: 13,
    marginLeft: 5,
    fontWeight: "600",
  },

  /* iOS Grid Widgets */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    background: "rgba(28, 28, 30, 0.65)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "14px 12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
  },
  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: { 
    fontSize: 20, 
    fontWeight: "700", 
    letterSpacing: "-0.5px",
    marginBottom: 2,
    display: "block" 
  },
  statTitle: { 
    fontSize: 12, 
    color: "#8e8e93", 
    fontWeight: "500",
    display: "block" 
  },

  /* PRO Banner */
  proButton: {
    width: "100%",
    background: "linear-gradient(135deg, #FF9500 0%, #FF2D55 100%)",
    color: "#fff",
    border: "none",
    padding: "16px 20px",
    borderRadius: "22px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 8px 25px rgba(255, 149, 0, 0.25)",
  },

  /* Segmented Categories */
  categoriesRow: { 
    display: "flex", 
    gap: 8, 
    overflowX: "auto", 
    marginBottom: 18,
    paddingBottom: 4,
  },
  catChip: {
    backgroundColor: "rgba(118, 118, 128, 0.18)",
    color: "#8e8e93",
    border: "none",
    padding: "8px 16px",
    borderRadius: "30px",
    fontSize: 14,
    fontWeight: "600",
    whiteSpace: "nowrap",
    cursor: "pointer",
  },
  catChipActive: { 
    backgroundColor: "#007AFF", 
    color: "#fff" 
  },

  /* Task Cards */
  tasksList: { 
    display: "flex", 
    flexDirection: "column", 
    gap: 10 
  },
  taskCard: {
    background: "rgba(28, 28, 30, 0.65)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
  },
  taskIconBox: {
    width: 44,
    height: 44,
    borderRadius: "14px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: { flex: 1 },
  taskTitle: { margin: "0 0 2px 0", fontSize: 15, fontWeight: "600" },
  taskReward: { margin: 0, color: "#34C759", fontSize: 13, fontWeight: "700" },
  completedBadge: { 
    color: "#34C759", 
    fontSize: 13, 
    fontWeight: "600",
    display: "flex",
    alignItems: "center"
  },
  actionBtn: {
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    color: "#007AFF",
    border: "none",
    padding: "8px 16px",
    borderRadius: "30px",
    fontSize: 13,
    fontWeight: "700",
    cursor: "pointer",
  },

  /* Leaderboard */
  leaderList: { display: "flex", flexDirection: "column", gap: 10 },
  leaderCard: {
    borderRadius: "20px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    backdropFilter: "blur(20px)",
  },
  leaderRank: { width: 32, textAlign: "center" },
  leaderDetails: { flex: 1 },
  leaderName: { margin: "0 0 2px 0", fontSize: 15, fontWeight: "600" },
  leaderSub: { margin: 0, fontSize: 12, color: "#8e8e93" },
  leaderBalance: { color: "#007AFF", fontWeight: "700", fontSize: 14 },

  /* Wallet Card (macOS Glass) */
  walletCard: {
    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
    backdropFilter: "blur(30px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "28px",
    padding: "24px",
    marginBottom: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  walletBalanceText: { 
    fontSize: 34, 
    fontWeight: "800", 
    margin: "12px 0 6px 0",
    letterSpacing: "-1px"
  },

  /* Forms & Inputs */
  withdrawForm: {
    background: "rgba(28, 28, 30, 0.65)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "24px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  inputField: {
    backgroundColor: "rgba(118, 118, 128, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: "16px",
    fontSize: 15,
    outline: "none",
  },
  submitBtn: {
    backgroundColor: "#007AFF",
    color: "#fff",
    border: "none",
    padding: "16px",
    borderRadius: "16px",
    fontWeight: "700",
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
  },
  alertMsg: { padding: "12px 14px", borderRadius: "14px", fontSize: 13, fontWeight: "500" },

  /* Modals */
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 1000,
  },
  modalBody: {
    backgroundColor: "#1c1c1e",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "28px",
    padding: "24px",
    width: "100%",
    maxWidth: 380,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeIconBtn: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "none",
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  refBox: { display: "flex", gap: 8 },
  refInput: {
    flex: 1,
    backgroundColor: "rgba(118, 118, 128, 0.12)",
    border: "none",
    color: "#8e8e93",
    padding: "12px 14px",
    borderRadius: "14px",
    fontSize: 13,
    outline: "none",
  },
  copyBtn: {
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    border: "none",
    padding: "0 16px",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  taskRewardTag: {
    backgroundColor: "rgba(52, 199, 89, 0.12)",
    color: "#34C759",
    padding: "10px 14px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },

  /* Floating Bottom Navigation (iOS Style) */
  navbar: {
    position: "fixed",
    bottom: 16,
    left: 16,
    right: 16,
    maxWidth: 460,
    margin: "0 auto",
    height: "64px",
    backgroundColor: "rgba(28, 28, 30, 0.75)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "36px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 100,
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  navItem: {
    background: "none",
    border: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    cursor: "pointer",
    padding: "6px 12px",
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
};

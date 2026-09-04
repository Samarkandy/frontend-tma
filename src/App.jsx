import { useState, useEffect } from "react";
import { apiRequest } from "./api";
import { TaskIcon, Stamp } from "./components/Icons";
import {
  User,
  Target,
  Trophy,
  Wallet,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  X,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Users,
  Lock,
} from "lucide-react";

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || "TMA_Earning_Bot";
const MIN_WITHDRAWAL = 10000; // держите в паре с MIN_WITHDRAWAL на бэкенде

const CATEGORIES = [
  { id: "all", label: "Все" },
  { id: "ai", label: "ИИ" },
  { id: "copywriting", label: "Тексты" },
  { id: "social", label: "Соцсети" },
  { id: "survey", label: "Опросы" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskCategory, setTaskCategory] = useState("all");

  const [showRefModal, setShowRefModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofText, setProofText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("card");
  const [withdrawStatus, setWithdrawStatus] = useState(null);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- начальная загрузка данных при монтировании, это ожидаемый паттерн
    loadInitialData();
  }, []);

  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
    }
  };

  const openTask = (t) => {
    triggerHaptic();
    setProofText("");
    setSelectedTask(t);
  };

  const handleCompleteTask = async (task) => {
    triggerHaptic();
    setSubmitting(true);
    try {
      const res = await apiRequest("/api/tasks/complete", {
        method: "POST",
        body: JSON.stringify({ task_id: task.id, proof_text: proofText || undefined }),
      });

      if (res.status === "pending") {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: "pending" } : t)));
      } else {
        setUser((prev) => ({
          ...prev,
          balance: res.new_balance,
          tasks_completed: prev.tasks_completed + 1,
        }));
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: "approved", is_completed: true } : t)));
      }

      setSelectedTask(null);
      window.Telegram?.WebApp?.showAlert
        ? window.Telegram.WebApp.showAlert(res.message)
        : alert(res.message);
      if (res.status !== "pending") loadInitialData(); // подтянуть прогресс разблокировки и т.д.
    } catch (err) {
      window.Telegram?.WebApp?.showAlert ? window.Telegram.WebApp.showAlert(err.message) : alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBuyPro = async () => {
    triggerHaptic();
    try {
      const res = await apiRequest("/api/payments/buy_pro", { method: "POST" });
      if (res.invoice_link && window.Telegram?.WebApp) {
        window.Telegram.WebApp.openInvoice(res.invoice_link, (status) => {
          if (status === "paid") {
            window.Telegram.WebApp.showAlert("Поздравляем! Вы успешно приобрели PRO-статус.");
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
    if (Number(withdrawAmount) < MIN_WITHDRAWAL) {
      setWithdrawStatus({ type: "error", text: `Минимальная сумма вывода — ${MIN_WITHDRAWAL.toLocaleString()} coins` });
      return;
    }
    try {
      const res = await apiRequest("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount: Number(withdrawAmount), wallet: walletAddress, method: withdrawMethod }),
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
    const refLink = `https://t.me/${BOT_USERNAME}?start=ref_${user?.id}`;
    navigator.clipboard?.writeText(refLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-line border-t-stamp rounded-full animate-spin" />
        <p className="mt-4 text-ink-faint text-sm">Загрузка Tapshiriq Bozor…</p>
      </div>
    );
  }

  const filteredTasks = taskCategory === "all" ? tasks : tasks.filter((t) => t.category === taskCategory);

  return (
    <div className="min-h-screen bg-paper text-ink pb-24">
      {/* --- ЭКРАН: ПРОФИЛЬ --- */}
      {activeTab === "profile" && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span style={{ fontFamily: "var(--font-display)" }} className="text-xl font-semibold">
              Tapshiriq Bozor
            </span>
            <Stamp text="без рулетки" />
          </div>

          <div className="bg-card border border-line rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-stamp-soft flex items-center justify-center mb-3">
              <User size={30} className="text-stamp" />
            </div>
            <h2 className="text-lg font-semibold">{user?.first_name || "Пользователь"}</h2>
            <p className="text-xs text-ink-faint">@{user?.username || "no_username"}</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-paper border border-line rounded-full px-4 py-1.5">
              <Coins size={16} className="text-coin" />
              <span style={{ fontFamily: "var(--font-display)" }} className="font-semibold text-coin">
                {user?.balance?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-ink-faint">coins</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => { triggerHaptic(); setActiveTab("leaderboard"); }}
              className="bg-card border border-line rounded-xl p-3 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <Trophy size={18} className="text-coin" />
                <ChevronRight size={14} className="text-ink-faint" />
              </div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-lg font-semibold">#{user?.rank || 1}</div>
              <div className="text-[11px] text-ink-faint">Рейтинг</div>
            </button>

            <button
              onClick={() => { triggerHaptic(); setActiveTab("tasks"); }}
              className="bg-card border border-line rounded-xl p-3 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 size={18} className="text-go" />
                <ChevronRight size={14} className="text-ink-faint" />
              </div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-lg font-semibold">{user?.tasks_completed || 0}</div>
              <div className="text-[11px] text-ink-faint">Заданий</div>
            </button>

            <button
              onClick={() => { triggerHaptic(); setShowRefModal(true); }}
              className="bg-card border border-line rounded-xl p-3 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <Users size={18} className="text-stamp" />
                <ChevronRight size={14} className="text-ink-faint" />
              </div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-lg font-semibold">{user?.referrals_count || 0}</div>
              <div className="text-[11px] text-ink-faint">Друзей</div>
            </button>
          </div>

          {!user?.ai_unlocked && (
            <div className="bg-card border border-line rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TaskIcon type="cpu" size={16} className="text-stamp" />
                <span className="text-sm font-medium">Категория «ИИ» ещё закрыта</span>
              </div>
              <div className="h-2 bg-paper rounded-full overflow-hidden border border-line mb-2">
                <div
                  className="h-full bg-stamp rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((user?.tasks_completed || 0) / (user?.unlock_threshold || 15)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-ink-faint">
                {user?.tasks_completed || 0} из {user?.unlock_threshold || 15} заданий — открывается гарантированно, без рулетки.
              </p>
            </div>
          )}

          <button
            onClick={handleBuyPro}
            disabled={user?.is_pro}
            className="w-full bg-stamp-deep text-white rounded-2xl p-4 flex items-center justify-between disabled:opacity-70"
          >
            <div className="flex items-center gap-3 text-left">
              <Sparkles size={22} />
              <div>
                <div className="font-semibold text-sm">{user?.is_pro ? "PRO активен" : "Активировать PRO"}</div>
                <div className="text-xs opacity-80">
                  {user?.is_pro ? "Удвоенный доход со всех заданий" : "Доход x2 — 250 Stars"}
                </div>
              </div>
            </div>
            {!user?.is_pro && <ArrowUpRight size={18} />}
          </button>
        </div>
      )}

      {/* --- ЭКРАН: ЗАДАНИЯ --- */}
      {activeTab === "tasks" && (
        <div className="p-4 space-y-4">
          <div>
            <h1 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-semibold">Биржа Заданий</h1>
            <p className="text-xs text-ink-faint mt-0.5">Фиксированная оплата за каждое задание — заранее известна, без сюрпризов.</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { triggerHaptic(); setTaskCategory(cat.id); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border shrink-0 ${
                  taskCategory === cat.id ? "bg-ink text-white border-ink" : "bg-card text-ink-soft border-line"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filteredTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => !t.locked && openTask(t)}
                disabled={t.locked}
                className={`w-full text-left rounded-2xl border p-3.5 flex items-center gap-3 bg-card transition-opacity ${
                  t.locked ? "border-line opacity-50" : "border-line"
                } ${t.status === "approved" ? "opacity-50" : ""}`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${t.locked ? "bg-paper" : "bg-stamp-soft"}`}>
                  {t.locked ? <Lock size={18} className="text-ink-faint" /> : <TaskIcon type={t.icon_type} size={20} className="text-stamp" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-stamp font-bold uppercase tracking-wide">{t.category}</span>
                  <div className="font-medium text-sm truncate">{t.title}</div>
                </div>
                <div className="text-right shrink-0">
                  <div style={{ fontFamily: "var(--font-display)" }} className="text-coin font-semibold text-sm">+{t.reward}</div>
                  {t.status === "approved" && <span className="text-[10px] text-go">✓ Готово</span>}
                  {t.status === "pending" && (
                    <span className="text-[10px] text-coin flex items-center gap-0.5 justify-end"><Clock size={10} /> На проверке</span>
                  )}
                  {t.status === "rejected" && <span className="text-[10px] text-warn">Отклонено — можно снова</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- ЭКРАН: РЕЙТИНГ --- */}
      {activeTab === "leaderboard" && (
        <div className="p-4 space-y-3">
          <h1 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-semibold mb-1">Топ Исполнителей</h1>
          {leaderboard.map((item) => {
            const isMe = item.first_name === user?.first_name && item.balance === user?.balance;
            return (
              <div
                key={item.rank}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isMe ? "border-stamp bg-stamp-soft" : "border-line bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-bold ${item.rank <= 3 ? "text-coin" : "text-ink-faint text-sm"}`}>
                    {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `#${item.rank}`}
                  </span>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1">
                      {item.first_name} {item.is_pro && <Sparkles size={12} className="text-coin" />}
                    </div>
                    <div className="text-[11px] text-ink-faint">{item.tasks_completed} задач</div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-display)" }} className="text-go font-semibold text-sm">{item.balance}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ЭКРАН: КОШЕЛЁК --- */}
      {activeTab === "wallet" && (
        <div className="p-4 space-y-4">
          <div>
            <h1 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-semibold">Кошелёк</h1>
            <p className="text-xs text-ink-faint mt-0.5">Управление вашими средствами и вывод</p>
          </div>

          <div className="bg-stamp-deep text-white rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-70">Доступный баланс</span>
              <ShieldCheck size={18} className="opacity-90" />
            </div>
            <div style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-semibold mt-1">
              {user?.balance?.toLocaleString()} <span className="text-lg font-normal opacity-70">coins</span>
            </div>
            <p className="text-[11px] opacity-60 mt-3">Минимальный вывод: {MIN_WITHDRAWAL.toLocaleString()} coins</p>
          </div>

          <form onSubmit={handleWithdraw} className="bg-card border border-line rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold">Вывести средства</h3>

            {withdrawStatus && (
              <div className={`text-xs rounded-lg px-3 py-2 border ${
                withdrawStatus.type === "success" ? "bg-go-soft text-go border-go" : "bg-warn-soft text-warn border-warn"
              }`}>
                {withdrawStatus.text}
              </div>
            )}

            <div className="flex gap-2">
              {[{ id: "card", label: "Карта (Payme/Click)" }, { id: "ton", label: "TON" }, { id: "usdt", label: "USDT" }].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setWithdrawMethod(m.id)}
                  className={`flex-1 text-[11px] rounded-lg py-2 border ${
                    withdrawMethod === m.id ? "bg-ink text-white border-ink" : "bg-paper border-line text-ink-soft"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <input
              type="number"
              placeholder={`Сумма (мин. ${MIN_WITHDRAWAL.toLocaleString()})`}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-paper border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stamp"
              required
            />
            <input
              type="text"
              placeholder={withdrawMethod === "card" ? "Номер карты или телефона" : "Адрес TON / USDT кошелька"}
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full bg-paper border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stamp"
              required
            />
            <button type="submit" className="w-full bg-ink text-white rounded-lg py-3 text-sm font-medium flex items-center justify-center gap-2">
              Отправить заявку <ArrowUpRight size={16} />
            </button>
          </form>
        </div>
      )}

      {/* --- МОДАЛКА: РЕФЕРАЛЫ --- */}
      {showRefModal && (
        <div className="fixed inset-0 bg-ink/40 flex items-end z-50" onClick={() => setShowRefModal(false)}>
          <div className="bg-card rounded-t-3xl w-full p-5 pb-8 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Пригласить друзей</h3>
              <button onClick={() => setShowRefModal(false)}><X size={20} className="text-ink-faint" /></button>
            </div>
            <p className="text-sm text-ink-soft leading-snug">
              Вы и ваш друг получите по <strong className="text-stamp">150 coins</strong>, как только он выполнит своё первое задание —
              не просто за переход по ссылке.
            </p>
            <div className="flex items-center gap-2 bg-paper border border-line rounded-xl px-3 py-2.5">
              <input readOnly value={`https://t.me/${BOT_USERNAME}?start=ref_${user?.id}`} className="flex-1 bg-transparent text-xs text-ink-soft outline-none" />
              <button onClick={copyRefLink}>{copied ? <Check size={18} className="text-go" /> : <Copy size={18} className="text-stamp" />}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- МОДАЛКА: ДЕТАЛИ ЗАДАНИЯ --- */}
      {selectedTask && (
        <div className="fixed inset-0 bg-ink/40 flex items-end z-50" onClick={() => !submitting && setSelectedTask(null)}>
          <div className="bg-card rounded-t-3xl w-full p-5 pb-8 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-stamp-soft flex items-center justify-center">
                  <TaskIcon type={selectedTask.icon_type} size={20} className="text-stamp" />
                </div>
                <h3 className="text-base font-semibold">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)}><X size={20} className="text-ink-faint" /></button>
            </div>

            <p className="text-sm text-ink-soft leading-relaxed">{selectedTask.description}</p>

            <div className="flex items-center justify-between bg-paper border border-line rounded-xl px-3 py-2.5">
              <span className="text-xs text-ink-faint">Награда</span>
              <span style={{ fontFamily: "var(--font-display)" }} className="text-coin font-semibold">+{selectedTask.reward} coins</span>
            </div>

            {selectedTask.status === "approved" ? (
              <p className="text-go text-center text-sm font-medium">✓ Вы уже получили награду за это задание</p>
            ) : selectedTask.status === "pending" ? (
              <p className="text-coin text-center text-sm font-medium">На проверке — обычно занимает до 24 часов</p>
            ) : (
              <>
                {selectedTask.requires_proof && (
                  <textarea
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="Подтверждение выполнения: ссылка на комментарий, текст, описание скриншота…"
                    rows={3}
                    className="w-full bg-paper border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-stamp resize-none"
                  />
                )}
                <button
                  onClick={() => handleCompleteTask(selectedTask)}
                  disabled={submitting}
                  className="w-full bg-ink text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Отправка…" : selectedTask.requires_proof ? "Отправить на проверку" : "Подтвердить выполнение"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- НИЖНЯЯ НАВИГАЦИЯ --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-line px-2 py-2 flex">
        {[
          { id: "profile", label: "Профиль", Icon: User },
          { id: "tasks", label: "Задания", Icon: Target },
          { id: "leaderboard", label: "Рейтинг", Icon: Trophy },
          { id: "wallet", label: "Кошелёк", Icon: Wallet },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => { triggerHaptic(); setActiveTab(id); }}
            className="flex-1 flex flex-col items-center gap-0.5 py-1.5"
          >
            <Icon size={20} className={activeTab === id ? "text-stamp" : "text-ink-faint"} />
            <span className={`text-[10px] ${activeTab === id ? "text-stamp font-medium" : "text-ink-faint"}`}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

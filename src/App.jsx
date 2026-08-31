import React, { useState, useEffect } from 'react';
import { apiRequest } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiRequest('/api/user/profile');
      setProfile(data);
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await apiRequest('/api/tasks');
      setTasks(data);
    } catch (err) {
      alert('Ошибка загрузки заданий: ' + err.message);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await apiRequest('/api/leaderboard');
      setLeaderboard(data);
    } catch (err) {
      alert('Ошибка загрузки лидерборда: ' + err.message);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'tasks') loadTasks();
    if (tab === 'leaderboard') loadLeaderboard();
  };

  const completeTask = async (taskId) => {
    try {
      const res = await apiRequest('/api/tasks/complete', {
        method: 'POST',
        body: JSON.stringify({ task_id: taskId }),
      });
      alert(res.message);
      setProfile((prev) => ({ ...prev, balance: res.new_balance }));
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const buyPro = async () => {
    try {
      const res = await apiRequest('/api/payments/buy_pro', { method: 'POST' });
      if (res.invoice_link && window.Telegram?.WebApp) {
        window.Telegram.WebApp.openInvoice(res.invoice_link, (status) => {
          if (status === 'paid') {
            alert('PRO статус успешно приобретен!');
            loadProfile();
          }
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseInt(withdrawAmount),
          wallet: walletAddress,
        }),
      });
      alert(res.message);
      setProfile((prev) => ({ ...prev, balance: res.new_balance }));
      setWithdrawAmount('');
      setWalletAddress('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Контент активного экрана */}
      <div style={styles.content}>
        {activeTab === 'profile' && profile && (
          <div>
            <div style={styles.card}>
              <h2>👤 {profile.first_name}</h2>
              <p style={styles.subtext}>@{profile.username || 'username'}</p>
              <div style={styles.balanceBox}>
                <span style={styles.balanceText}>{profile.balance}</span>
                <span style={styles.coinLabel}>coins</span>
              </div>
              {profile.is_pro && <span style={styles.proBadge}>PRO АККАУНТ</span>}
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <h4>Рейтинг</h4>
                <p>#{profile.rank}</p>
              </div>
              <div style={styles.statBox}>
                <h4>Выполнено</h4>
                <p>{profile.tasks_completed}</p>
              </div>
              <div style={styles.statBox}>
                <h4>Рефералы</h4>
                <p>{profile.referrals_count}</p>
              </div>
            </div>

            {!profile.is_pro && (
              <button style={styles.proButton} onClick={buyPro}>
                ⭐ Купить PRO (x2 Доход) — 250 Stars
              </button>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h3>🎯 Биржа заданий</h3>
            {tasks.length === 0 ? (
              <p>Нет доступных заданий</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} style={styles.taskCard}>
                  <div>
                    <h4>{task.title}</h4>
                    <p style={styles.subtext}>{task.description}</p>
                    <span style={styles.rewardText}>+{task.reward} coins</span>
                  </div>
                  <button
                    disabled={task.is_completed}
                    onClick={() => completeTask(task.id)}
                    style={task.is_completed ? styles.disabledBtn : styles.actionBtn}
                  >
                    {task.is_completed ? 'Выполнено' : 'Начать'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <h3>🏆 Топ Игроков</h3>
            {leaderboard.map((user) => (
              <div key={user.rank} style={styles.leaderCard}>
                <span style={styles.rankNum}>#{user.rank}</span>
                <div style={{ flex: 1, marginLeft: 10 }}>
                  <strong>{user.first_name}</strong>
                  {user.is_pro && <span style={{ marginLeft: 5 }}>⭐</span>}
                </div>
                <span>{user.balance} coins</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'wallet' && profile && (
          <div>
            <h3>💼 Вывод средств</h3>
            <div style={styles.card}>
              <p>Доступный баланс: <strong>{profile.balance} coins</strong></p>
              <form onSubmit={handleWithdraw} style={{ marginTop: 15 }}>
                <input
                  type="number"
                  placeholder="Сумма (мин. 1000)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={styles.input}
                  required
                />
                <input
                  type="text"
                  placeholder="Адрес TON Кошелька / Карта"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  style={styles.input}
                  required
                />
                <button type="submit" style={styles.actionBtn}>
                  Запросить вывод
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Нижнее меню навигации */}
      <div style={styles.navBar}>
        <button
          style={activeTab === 'profile' ? styles.navActive : styles.navBtn}
          onClick={() => handleTabChange('profile')}
        >
          👤 Профиль
        </button>
        <button
          style={activeTab === 'tasks' ? styles.navActive : styles.navBtn}
          onClick={() => handleTabChange('tasks')}
        >
          🎯 Задания
        </button>
        <button
          style={activeTab === 'leaderboard' ? styles.navActive : styles.navBtn}
          onClick={() => handleTabChange('leaderboard')}
        >
          🏆 Лидеры
        </button>
        <button
          style={activeTab === 'wallet' ? styles.navActive : styles.navBtn}
          onClick={() => handleTabChange('wallet')}
        >
          💼 Кошелек
        </button>
      </div>
    </div>
  );
}

// Базовые стили для Telegram Mini App (Темная тема)
const styles = {
  container: {
    backgroundColor: '#151e27',
    color: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'sans-serif',
  },
  centerContainer: {
    backgroundColor: '#151e27',
    color: '#fff',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: '16px',
    paddingBottom: '80px',
  },
  card: {
    backgroundColor: '#212d3b',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  subtext: {
    color: '#7f91a4',
    fontSize: '14px',
    margin: '4px 0',
  },
  balanceBox: {
    margin: '15px 0',
  },
  balanceText: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#64b5ef',
  },
  coinLabel: {
    marginLeft: '6px',
    color: '#7f91a4',
  },
  proBadge: {
    backgroundColor: '#f39c12',
    color: '#000',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    marginBottom: '16px',
  },
  statBox: {
    backgroundColor: '#212d3b',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
  },
  proButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#f39c12',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
  },
  taskCard: {
    backgroundColor: '#212d3b',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardText: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  actionBtn: {
    backgroundColor: '#64b5ef',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  disabledBtn: {
    backgroundColor: '#34495e',
    color: '#7f91a4',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
  },
  leaderCard: {
    backgroundColor: '#212d3b',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  rankNum: {
    fontWeight: 'bold',
    color: '#64b5ef',
    width: '30px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #34495e',
    backgroundColor: '#151e27',
    color: '#fff',
    marginBottom: '10px',
    boxSizing: 'border-box',
  },
  navBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#1d2733',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid #2b394a',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    color: '#7f91a4',
    fontSize: '12px',
    cursor: 'pointer',
  },
  navActive: {
    background: 'none',
    border: 'none',
    color: '#64b5ef',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

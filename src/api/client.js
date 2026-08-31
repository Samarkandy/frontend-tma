const API_URL = import.meta.env.VITE_API_URL || 'https://tg-web-app-ozk0.onrender.com';

function getHeaders() {
    const tg = window.Telegram?.WebApp;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tg?.initData || ''}`
    };
}

export async function fetchProfile() {
    const res = await fetch(`${API_URL}/api/user/profile`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Ошибка загрузки профиля');
    return await res.json();
}

export async function fetchTasks() {
    const res = await fetch(`${API_URL}/api/tasks`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Ошибка загрузки задач');
    return await res.json();
}

export async function completeTask(taskId) {
    const res = await fetch(`${API_URL}/api/tasks/complete`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ task_id: taskId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Ошибка выполнения');
    return data;
}

export async function fetchLeaderboard() {
    const res = await fetch(`${API_URL}/api/leaderboard`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Ошибка загрузки рейтинга');
    return await res.json();
}

export async function requestWithdrawal(amount, wallet) {
    const res = await fetch(`${API_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount: Number(amount), wallet })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Ошибка вывода');
    return data;
}
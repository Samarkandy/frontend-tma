// URL вашего FastAPI бэкенда на Render (или локального сервера)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tg-web-app-ozk0.onrender.com';

export async function fetchUserBalance(initData) {
    const res = await fetch(`${API_BASE_URL}/api/user`, {
        headers: {
            'Authorization': `tma ${initData}`
        }
    });
    return await res.json();
}

export async function submitTask(taskId, payload) {
    const res = await fetch(`${API_BASE_URL}/api/tasks/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: taskId, ...payload }),
    });
    return await res.json();
}
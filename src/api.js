// ЗАМЕНИТЕ НА ВАШ URL БЭКЕНДА НА RENDER
const API_BASE_URL = "https://tg-web-app-ozk0.onrender.com";

const getInitData = () => {
  return window.Telegram?.WebApp?.initData || "";
};

export const apiRequest = async (endpoint, options = {}) => {
  const initData = getInitData();
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${initData}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Ошибка сервера");
  }

  return response.json();
};

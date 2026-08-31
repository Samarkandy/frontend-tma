const API_BASE_URL = "https://tg-web-app-ozk0.onrender.com";

export const apiRequest = async (endpoint, options = {}) => {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    tg.ready();
  }

  const initData = tg?.initData || "";

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${initData}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Ошибка сервера");
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError") {
      throw new Error("Ошибка сети или CORS.");
    }
    throw err;
  }
};

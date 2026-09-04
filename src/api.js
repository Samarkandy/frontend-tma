// Единственный API-клиент проекта. Раньше существовало три разных файла
// (api.js, api/client.js, api/index.js) с разными наборами функций и разными
// способами передавать initData — реально использовался только api.js (через App.jsx),
// два других были мёртвым кодом. Теперь он один, и адрес бэкенда берётся из
// переменной окружения VITE_API_URL (задайте её в Render для фронтенда),
// с тем же адресом что и раньше — как запасной вариант.
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://tg-web-app-ozk0.onrender.com";

export const apiRequest = async (endpoint, options = {}) => {
  const tg = window.Telegram?.WebApp;
  if (tg) tg.ready();

  const initData = tg?.initData || "";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${initData}`,
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch (err) {
    throw new Error("Ошибка сети — проверьте подключение и попробуйте снова.", { cause: err });
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // тело могло быть пустым — не критично
  }

  if (!response.ok) {
    throw new Error(data?.detail || `Ошибка сервера (${response.status})`);
  }
  return data;
};

// Собственный набор иконок для категорий заданий — раньше ВСЕ карточки заданий
// использовали одну и ту же иконку Target, независимо от категории. Здесь у каждого
// icon_type своя нарисованная иконка: одинаковая толщина линии (1.75), одинаковый
// viewBox (24x24), currentColor — чтобы вместе они смотрелись как набор, а не набор
// случайных картинок.

const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const PATHS = {
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21M9 21h6" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2" />
      <path d="m8.5 13.5 2.3 2.3L16 10.5" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20l1-4.2L15.6 5.2a1.8 1.8 0 0 1 2.6 0l0.6.6a1.8 1.8 0 0 1 0 2.6L8.2 19 4 20Z" />
      <path d="M13.5 7.5l3 3" />
    </>
  ),
  bell: (
    <>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5v7l6-3.5-6-3.5Z" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v10H9l-4 4v-4H4V5Z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M20 20H4" strokeLinecap="round" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="1.5" />
      <rect x="9" y="2.5" width="6" height="3" rx="1" />
      <path d="M9 11h6M9 15h6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
};

export function TaskIcon({ type, size = 20, className = "" }) {
  const paths = PATHS[type] || PATHS.chart;
  return (
    <svg width={size} height={size} className={className} {...common}>
      {paths}
    </svg>
  );
}

// Фирменный "штамп" — визуальное обещание бренда: честная фиксированная оплата,
// без рулетки и без шансов. Используется в шапке и в модалке приглашения друзей.
export function Stamp({ text = "без рулетки", className = "" }) {
  return (
    <div
      className={`inline-flex items-center border-2 border-stamp rounded-full px-2.5 py-1 -rotate-6 shrink-0 ${className}`}
      style={{ mixBlendMode: "multiply" }}
    >
      <span className="text-stamp text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
        {text}
      </span>
    </div>
  );
}

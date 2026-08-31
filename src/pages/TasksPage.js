import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTasks } from '../api/client';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTasks()
            .then(data => {
                setTasks(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-4 text-center text-gray-400">Загрузка заданий...</div>;

    return (
        <div className="p-4 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/30 border border-emerald-500/20">
                <h1 className="text-xl font-extrabold text-white">Биржа Заданий</h1>
                <p className="text-xs text-emerald-400 mt-1">Доступно заданий: {tasks.length}</p>
            </div>

            <div className="space-y-3">
                {tasks.map((t) => (
                    <div
                        key={t.id}
                        onClick={() => navigate(`/tasks/${t.id}`)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            t.is_completed 
                                ? 'bg-white/5 border-white/5 opacity-50' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-[10px] text-emerald-400 font-bold uppercase">{t.category}</span>
                                <div className="font-bold text-sm text-white">{t.title}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-amber-400 font-extrabold text-sm">+{t.reward} coins</div>
                                {t.is_completed && <span className="text-[10px] text-emerald-400">✓ Выполнено</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
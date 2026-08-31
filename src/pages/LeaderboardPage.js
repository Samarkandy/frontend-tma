import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../api/client';

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard()
            .then(data => {
                setLeaders(data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    if (loading) return <div className="p-4 text-center text-gray-400">Загрузка рейтинга...</div>;

    return (
        <div className="p-4 space-y-3">
            <h1 className="text-xl font-bold text-white mb-4">Топ Исполнителей</h1>
            {leaders.map((u) => (
                <div key={u.rank} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className={`font-extrabold w-6 ${u.rank <= 3 ? 'text-amber-400' : 'text-gray-500'}`}>
                            #{u.rank}
                        </span>
                        <div>
                            <div className="text-sm font-bold text-white">{u.first_name}</div>
                            <div className="text-[10px] text-gray-400">{u.tasks_completed} задач</div>
                        </div>
                    </div>
                    <div className="text-emerald-400 font-bold text-sm">{u.balance} coins</div>
                </div>
            ))}
        </div>
    );
}
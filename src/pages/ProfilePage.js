import { useEffect, useState } from 'react';
import { fetchProfile } from '../api/client';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile()
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-4 text-center text-gray-400">Загрузка профиля...</div>;
    if (!profile) return <div className="p-4 text-center text-red-400">Ошибка авторизации</div>;

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold border border-emerald-500/40">
                    {profile.first_name?.[0] || 'U'}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">{profile.first_name}</h2>
                    <p className="text-xs text-gray-400">Место в рейтинге: #{profile.rank}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-gray-400">Выполнено задач</span>
                    <div className="text-xl font-bold text-white mt-1">{profile.tasks_completed}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-gray-400">Баланс</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">{profile.balance} coins</div>
                </div>
            </div>
        </div>
    );
}
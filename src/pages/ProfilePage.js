import { useTelegram } from '../hooks/useTelegram';

export default function ProfilePage() {
    const { user } = useTelegram();

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold border border-emerald-500/40">
                    {user?.first_name?.[0] || 'U'}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">{user?.first_name} {user?.last_name}</h2>
                    <p className="text-xs text-gray-400">@{user?.username || 'user'}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-gray-400">Выполнено задач</span>
                    <div className="text-xl font-bold text-white mt-1">24</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-gray-400">Заработано</span>
                    <div className="text-xl font-bold text-emerald-400 mt-1">3,400 coins</div>
                </div>
            </div>
        </div>
    );
}
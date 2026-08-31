export default function WalletPage() {
    return (
        <div className="p-4 space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl">
                <span className="text-xs opacity-80 uppercase tracking-wider font-semibold">Ваш баланс</span>
                <div className="text-3xl font-extrabold mt-1">3,400.00 COINS</div>
                <p className="text-xs mt-4 opacity-70">≈ $34.00 USD</p>
            </div>

            <button className="w-full py-3.5 bg-emerald-500 text-black font-bold text-sm rounded-xl">
                Вывести средства
            </button>
        </div>
    );
}
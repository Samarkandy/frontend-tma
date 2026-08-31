import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { completeTask } from '../api/client';
import { useTelegram } from '../hooks/useTelegram';

export default function TaskDetail() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { tg } = useTelegram();
    const [submitting, setSubmitting] = useState(false);

    const handleComplete = async () => {
        setSubmitting(true);
        try {
            const res = await completeTask(taskId);
            if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            tg?.showAlert(res.message);
            navigate('/');
        } catch (err) {
            if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
            tg?.showAlert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold text-white">Задание #{taskId}</h1>
            
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <p className="text-sm text-gray-300">
                    Нажмите кнопку ниже для отправки отчета. После проверки монеты автоматически поступят на ваш баланс.
                </p>

                <button
                    onClick={handleComplete}
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm rounded-xl disabled:opacity-50"
                >
                    {submitting ? 'Отправка...' : 'Подтвердить выполнение'}
                </button>
            </div>
        </div>
    );
}
"use client";
import { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaReply, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner } from 'react-icons/fa';

export default function SupportDashboard() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        const res = await fetch('/api/support');
        const data = await res.json();
        if (data.success) {
            setTickets(data.tickets);
        }
        setLoading(false);
    };

    const selectTicket = async (ticket) => {
        // Fetch full details including replies
        const res = await fetch(`/api/support/${ticket.id}`);
        const data = await res.json();
        if (data.success) {
            setSelectedTicket(data.ticket);
        }
    };

    const handleReply = async () => {
        if (!reply.trim()) return;
        setSending(true);

        const res = await fetch(`/api/support/${selectedTicket.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: reply })
        });

        if (res.ok) {
            setReply('');
            // Refresh selected ticket to show new reply
            selectTicket(selectedTicket);
        }
        setSending(false);
    };

    if (loading) return <div className="text-white">Destek talepleri yükleniyor...</div>;

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* Sidebar List */}
            <div className="w-1/3 bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white mb-2">Gelen Kutusu</h2>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-500" />
                        <input className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none" placeholder="Arama yap..." />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tickets.length === 0 && <div className="p-4 text-center text-gray-500">Kayıt bulunamadı.</div>}
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => selectTicket(ticket)}
                            className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                        >
                            <div className="flex justify-between mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === 'OPEN' ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                    {ticket.status === 'OPEN' ? 'Açık' : 'Kapalı'}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1"><FaClock /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="font-bold text-white mb-1 truncate">{ticket.subject}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                <FaUser className="text-[10px]" /> {ticket.user?.username}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
                {selectedTicket ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                            <div>
                                <h2 className="text-lg font-bold text-white">{selectedTicket.subject}</h2>
                                <div className="text-xs text-gray-400">
                                    Talep No: #{selectedTicket.id} &bull; Gönderen: {selectedTicket.user?.username || 'Bilinmeyen'}
                                </div>
                            </div>
                            {/* Future: Close Ticket Button */}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Original Message */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                    {selectedTicket.user?.username?.[0]?.toUpperCase()}
                                </div>
                                <div className="bg-gray-800 p-4 rounded-r-xl rounded-bl-xl max-w-[80%]">
                                    <div className="text-xs text-blue-400 font-bold mb-1">{selectedTicket.user?.username}</div>
                                    <div className="text-gray-300 text-sm whitespace-pre-wrap">{selectedTicket.message}</div>
                                    <div className="text-[10px] text-gray-500 mt-2 text-right">{new Date(selectedTicket.createdAt).toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Replies */}
                            {selectedTicket.replies?.map(reply => (
                                <div key={reply.id} className={`flex gap-4 ${reply.user.role === 'ADMIN' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${reply.user.role === 'ADMIN' ? 'bg-red-600' : 'bg-blue-600'}`}>
                                        {reply.user.role === 'ADMIN' ? 'A' : reply.user.username[0].toUpperCase()}
                                    </div>
                                    <div className={`p-4 rounded-xl max-w-[80%] ${reply.user.role === 'ADMIN' ? 'bg-red-900/20 border border-red-900/50 rounded-tr-none' : 'bg-gray-800 rounded-tl-none'}`}>
                                        <div className={`text-xs font-bold mb-1 ${reply.user.role === 'ADMIN' ? 'text-red-400' : 'text-blue-400'}`}>
                                            {reply.user.role === 'ADMIN' ? 'Destek Ekibi' : reply.user.username}
                                        </div>
                                        <div className="text-gray-300 text-sm whitespace-pre-wrap">{reply.message}</div>
                                        <div className="text-[10px] text-gray-500 mt-2 text-right">{new Date(reply.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Box */}
                        <div className="p-4 border-t border-gray-800 bg-gray-800/30">
                            <div className="relative">
                                <textarea
                                    className="w-full bg-black border border-gray-700 rounded-xl p-4 pr-12 text-white focus:border-blue-500 outline-none resize-none h-24 text-sm"
                                    placeholder="Yanıtınızı yazın..."
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                ></textarea>
                                <button
                                    onClick={handleReply}
                                    disabled={sending || !reply.trim()}
                                    className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                                >
                                    {sending ? <FaSpinner className="animate-spin" /> : <FaReply />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                        <FaUser className="text-4xl mb-4 opacity-50" />
                        <p>Görüntülemek için soldan bir talep seçin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

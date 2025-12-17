"use client";
import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaUser, FaReply, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaInbox, FaPaperPlane } from 'react-icons/fa';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function SupportDashboard() {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, OPEN, CLOSED

    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        // Filter Logic
        let res = tickets;
        if (statusFilter !== 'ALL') {
            res = res.filter(t => t.status === statusFilter);
        }
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            res = res.filter(t =>
                t.subject.toLowerCase().includes(lower) ||
                t.user?.username.toLowerCase().includes(lower)
            );
        }
        setFilteredTickets(res);
    }, [tickets, searchTerm, statusFilter]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (selectedTicket) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedTicket?.replies]);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/admin/support');
            const data = await res.json();
            if (data.success) {
                setTickets(data.tickets);
            }
        } catch (error) {
            toast.error('Biletler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const selectTicket = async (ticket) => {
        setLoadingDetails(true);
        setSelectedTicket(prev => ({ ...ticket, replies: [] })); // UI Instant switch, load content async

        try {
            const res = await fetch(`/api/admin/support/${ticket.id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedTicket(data.ticket);
            }
        } catch (e) {
            toast.error('Detaylar yüklenemedi');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleReply = async () => {
        if (!reply.trim()) return;
        setSending(true);

        try {
            const res = await fetch(`/api/admin/support/${selectedTicket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: reply })
            });

            if (res.ok) {
                const data = await res.json();
                setReply('');
                // Append new reply locally to avoid full re-fetch flicker
                setSelectedTicket(prev => ({
                    ...prev,
                    replies: [...prev.replies, data.reply]
                }));
                toast.success('Yanıt gönderildi');
            } else {
                toast.error('Gönderilemedi');
            }
        } catch (error) {
            toast.error('Hata oluştu');
        } finally {
            setSending(false);
        }
    };

    const toggleStatus = async () => {
        if (!selectedTicket) return;
        const newStatus = selectedTicket.status === 'OPEN' ? 'CLOSED' : 'OPEN';

        try {
            const res = await fetch(`/api/admin/support/${selectedTicket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedTicket = { ...selectedTicket, status: newStatus };
                setSelectedTicket(updatedTicket);
                setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
                toast.success(`Durum güncellendi: ${newStatus === 'OPEN' ? 'Açık' : 'Kapalı'}`);
            }
        } catch (error) {
            toast.error('Durum değiştirilemedi');
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center text-white"><FaSpinner className="animate-spin text-4xl" /></div>;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500 gap-4">

            {/* Header Area */}
            <div className="flex justify-between items-center bg-gray-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400">
                        <FaInbox className="text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Destek Merkezi</h1>
                        <p className="text-xs text-gray-400">{tickets.filter(t => t.status === 'OPEN').length} açık talep</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Talep ya da kullanıcı ara..."
                            className="bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* LIST Sidebar */}
                <div className="w-1/3 bg-gray-900/40 border border-white/5 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/5 flex gap-2">
                        {['ALL', 'OPEN', 'CLOSED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${statusFilter === status
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {status === 'ALL' ? 'Tümü' : status === 'OPEN' ? 'Açık' : 'Kapalı'}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        {filteredTickets.length === 0 && (
                            <div className="text-center text-gray-500 mt-10 text-sm">Talep bulunamadı.</div>
                        )}
                        {filteredTickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => selectTicket(ticket)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedTicket?.id === ticket.id
                                        ? 'bg-purple-500/10 border-purple-500/50 shadow-inner'
                                        : 'bg-transparent border-transparent hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-800">
                                            {ticket.user?.avatar ? (
                                                <Image src={ticket.user.avatar} fill className="object-cover" alt="u" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-white font-bold bg-blue-500">
                                                    {ticket.user?.username?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-gray-300">{ticket.user?.username}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="font-bold text-white text-sm line-clamp-1 mb-1">{ticket.subject}</div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 line-clamp-1">{ticket.message}</span>
                                    <span className={`w-2 h-2 rounded-full ${ticket.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHAT / Detail Area */}
                <div className="flex-1 bg-gray-900/60 border border-white/5 rounded-2xl flex flex-col backdrop-blur-md overflow-hidden relative shadow-2xl">
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        {selectedTicket.subject}
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${selectedTicket.status === 'OPEN'
                                                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                                : 'border-red-500/30 text-red-400 bg-red-500/10'
                                            }`}>
                                            #{selectedTicket.id} - {selectedTicket.status === 'OPEN' ? 'AÇIK' : 'KAPALI'}
                                        </span>
                                    </h2>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {selectedTicket.user?.username} tarafından • {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={toggleStatus}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedTicket.status === 'OPEN'
                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                            : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white'
                                        }`}
                                >
                                    {selectedTicket.status === 'OPEN' ? <><FaTimesCircle /> Talebi Kapat</> : <><FaCheckCircle /> Talebi Aç</>}
                                </button>
                            </div>

                            {/* Messages Stream */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-black/20">
                                {loadingDetails ? (
                                    <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-purple-500 text-2xl" /></div>
                                ) : (
                                    <>
                                        {/* Original Ticket Message */}
                                        <div className="flex gap-4 group">
                                            <div className="relative w-10 h-10 flex-shrink-0">
                                                {selectedTicket.user?.avatar ? (
                                                    <Image src={selectedTicket.user.avatar} fill className="object-cover rounded-full border-2 border-gray-700" alt="avatar" />
                                                ) : <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-gray-700">{selectedTicket.user?.username?.[0]}</div>}
                                            </div>
                                            <div className="bg-gray-800/80 p-4 rounded-2xl rounded-tl-none border border-white/5 max-w-[80%] shadow-lg">
                                                <div className="text-xs font-bold text-blue-400 mb-1 flex justify-between gap-4">
                                                    <span>{selectedTicket.user?.username}</span>
                                                    <span className="font-normal text-gray-500 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Talep Oluşturan</span>
                                                </div>
                                                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        {selectedTicket.replies?.map((rep, idx) => {
                                            const isAdmin = rep.user?.role === 'ADMIN';
                                            return (
                                                <div key={idx} className={`flex gap-4 group ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                                    <div className="relative w-10 h-10 flex-shrink-0">
                                                        {rep.user?.avatar ? (
                                                            <Image src={rep.user.avatar} fill className="object-cover rounded-full border-2 border-gray-700" alt="avatar" />
                                                        ) : <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold border-2 border-gray-700 ${isAdmin ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                                            {isAdmin ? 'A' : rep.user?.username?.[0]}
                                                        </div>
                                                        }
                                                    </div>
                                                    <div className={`p-4 rounded-2xl border max-w-[80%] shadow-lg ${isAdmin
                                                            ? 'bg-purple-900/20 border-purple-500/20 rounded-tr-none'
                                                            : 'bg-gray-800/80 border-white/5 rounded-tl-none'
                                                        }`}>
                                                        <div className={`text-xs font-bold mb-1 flex gap-4 ${isAdmin ? 'text-purple-400 justify-end' : 'text-blue-400'}`}>
                                                            <span>{isAdmin ? 'Destek Ekibi' : rep.user?.username}</span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{rep.message}</p>
                                                        <div className={`text-[10px] text-gray-500 mt-2 ${isAdmin ? 'text-left' : 'text-right'}`}>
                                                            {new Date(rep.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Reply Input Area */}
                            <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                                {selectedTicket.status === 'CLOSED' ? (
                                    <div className="text-center py-4 text-gray-500 text-sm bg-white/5 rounded-xl border border-white/5 border-dashed">
                                        Bu talep kapatılmıştır. Yanıtlamak için önce talebi açın.
                                    </div>
                                ) : (
                                    <div className="flex gap-4 items-end bg-gray-900 border border-gray-700 rounded-2xl p-2 focus-within:border-purple-500 transition-colors shadow-lg">
                                        <textarea
                                            value={reply}
                                            onChange={e => setReply(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                                            placeholder="Yanıtınızı buraya yazın..."
                                            className="flex-1 bg-transparent border-none outline-none text-white p-3 min-h-[50px] max-h-[150px] resize-none text-sm custom-scrollbar"
                                        />
                                        <button
                                            onClick={handleReply}
                                            disabled={!reply.trim() || sending}
                                            className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                        </button>
                                    </div>
                                )}
                            </div>

                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-60">
                            <FaInbox className="text-6xl mb-4 text-gray-700" />
                            <p className="text-lg">Bir talep seçerek detayları görüntüle.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

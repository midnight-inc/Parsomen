"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FaSpinner, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

// Dynamic import to avoid SSR issues with react-pdf
const PDFViewer = dynamic(() => import('@/components/reader/PDFViewer'), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            <FaSpinner className="animate-spin text-4xl text-pink-500" />
        </div>
    )
});

export default function ReadBookPage() {
    const router = useRouter();
    const params = useParams();
    const bookId = params.id;

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!bookId) return;

        async function fetchBook() {
            try {
                const res = await fetch(`/api/books/${bookId}`);
                if (!res.ok) {
                    throw new Error('Kitap bulunamadı');
                }
                const data = await res.json();

                if (!data.pdfUrl) {
                    setError('Bu kitap için PDF dosyası yüklenmemiş.');
                } else {
                    setBook(data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchBook();
    }, [bookId]);

    const handleClose = () => {
        router.back();
    };

    // Loading state
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-5xl text-pink-500 mx-auto mb-4" />
                    <p className="text-gray-400">Kitap yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !book) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">PDF Bulunamadı</h1>
                    <p className="text-gray-400 mb-6">{error || 'Bu kitap için okuma modu kullanılamıyor.'}</p>
                    <Link
                        href={`/books/${bookId}`}
                        className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                        <FaArrowLeft /> Kitap Sayfasına Dön
                    </Link>
                </div>
            </div>
        );
    }

    // PDF Viewer
    return (
        <PDFViewer
            pdfUrl={book.pdfUrl}
            bookTitle={book.title}
            bookId={parseInt(bookId)}
            onClose={handleClose}
        />
    );
}

export const MOCK_BOOKS = [
    {
        id: 1,
        title: "Doğu Ekspresinde Cinayet",
        author: "Agatha Christie",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1486131451i/853510.jpg",
        category: "Polisiye",
        rating: 4.8,
        isNew: true,
        pages: 256,
        year: 1934,

        description: "Gece yarısından sonra Doğu Ekspresi'ni yavaşlatan kar fırtınası, cinayeti örtbas etmek isteyenler için mükemmel bir fırsattı. Ama trende Hercule Poirot vardı...",
        reviews: [
            { id: 101, user: "Selin", text: "Sonu inanılmazdı! Kesinlikle okuyun.", rating: 5, spoiler: false },
            { id: 102, user: "Ahmet", text: "Katilin ||uşak|| olduğunu düşünmüştüm ama yanıldım.", rating: 4, spoiler: true }
        ]
    },
    {
        id: 2,
        title: "1984",
        author: "George Orwell",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348990566i/5470.jpg",
        category: "Bilim Kurgu",
        rating: 4.9,
        isNew: false,
        pages: 328,
        year: 1949,
        description: "Büyük Birader seni gözetliyor. Özgürlüğün ve gerçekliğin yok edildiği distopik bir başyapıt.",
        reviews: []
    },
    {
        id: 3,
        title: "Şeker Portakalı",
        author: "Jose Mauro de Vasconcelos",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1558718717i/87205.jpg",
        category: "Dram",
        rating: 4.7,
        isNew: false,
        pages: 182,
        year: 1968,
        description: "Günün birinde acıyı keşfeden küçük bir çocuğun öyküsü...",
        reviews: []
    },
    {
        id: 4,
        title: "Sefiller",
        author: "Victor Hugo",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1411852091i/24280.jpg",
        category: "Klasik",
        rating: 4.6,
        isNew: true,
        pages: 1463,
        year: 1862,
        description: "Fransız edebiyatının en büyük eserlerinden biri. Jean Valjean'ın kurtuluş mücadelesi.",
        reviews: []
    },
    // Adding more for grid testing
    {
        id: 5,
        title: "Dune",
        author: "Frank Herbert",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
        category: "Bilim Kurgu",
        rating: 4.8,
        isNew: false,
        pages: 412,
        year: 1965,
        description: "Baharat akmalı. Arrakis gezegeninin destansı hikayesi.",
        reviews: []
    },
    {
        id: 6,
        title: "Sherlock Holmes: Kızıl Dosya",
        author: "Arthur Conan Doyle",
        cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388147636i/188572.jpg",
        category: "Polisiye",
        rating: 4.5,
        isNew: false,
        pages: 160,
        year: 1887,
        description: "Holmes ve Watson'ın ilk macerası.",
        reviews: []
    }
];

export const PATCH_NOTES = {
    version: "1.0.0",
    title: "Parşomen Başlangıç",
    changes: [
        "Parşomen platformu açıldı!",
        "Koyu cam tema eklendi.",
        "Steam benzeri kütüphane sistemi aktif.",
        "Kitapla Kör Randevu özelliği eklendi.",
        "Global sohbet ve gruplar yakında!"
    ]
};

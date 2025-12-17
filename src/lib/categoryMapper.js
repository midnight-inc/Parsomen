export const categoryMap = {
    'Fiction': 'Roman',
    'Novel': 'Roman',
    'Science Fiction': 'Bilim Kurgu',
    'Sci-Fi': 'Bilim Kurgu',
    'Fantasy': 'Fantastik',
    'Magic': 'Fantastik',
    'Mystery': 'Gizem',
    'Thriller': 'Gerilim',
    'Horror': 'Korku',
    'Romance': 'Romantik',
    'Love': 'Romantik',
    'History': 'Tarih',
    'Historical': 'Tarih',
    'Biography': 'Biyografi',
    'Autobiography': 'Biyografi',
    'Memoir': 'Biyografi',
    'Business': 'İş & Ekonomi',
    'Economics': 'İş & Ekonomi',
    'Finance': 'İş & Ekonomi',
    'Self-Help': 'Kişisel Gelişim',
    'Psychology': 'Psikoloji',
    'Science': 'Bilim',
    'Technology': 'Teknoloji',
    'Philosophy': 'Felsefe',
    'Poetry': 'Şiir',
    'Art': 'Sanat',
    'Comics': 'Çizgi Roman',
    'Graphic Novels': 'Çizgi Roman',
    'Manga': 'Manga',
    'Health': 'Sağlık',
    'Fitness': 'Sağlık',
    'Travel': 'Gezi',
    'Cooking': 'Yemek',
    'Cookbook': 'Yemek',
    'Children': 'Çocuk',
    'Juvenile Fiction': 'Genç',
    'Young Adult': 'Genç'
};

export const mapCategory = (googleCategories) => {
    if (!googleCategories || googleCategories.length === 0) return 'Genel';

    // Check first category
    const mainCat = googleCategories[0];

    // Try direct match
    if (categoryMap[mainCat]) return categoryMap[mainCat];

    // Try searching keywords
    const keywords = Object.keys(categoryMap);
    for (const key of keywords) {
        if (mainCat.includes(key)) return categoryMap[key];
    }

    return 'Diğer';
};

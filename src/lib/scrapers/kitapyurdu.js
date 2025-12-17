import * as cheerio from 'cheerio';

export async function searchKitapyurdu(query) {
    try {
        const url = `https://www.kitapyurdu.com/index.php?route=product/search&filter_name=${encodeURIComponent(query)}&limit=20`; // Get more results

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        if (!res.ok) {
            throw new Error(`Kitapyurdu response status: ${res.status}`);
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const books = [];

        // Kitapyurdu uses #product-table or .product-grid depending on view, but usually items have .product-cr class
        $('.product-cr').each((i, el) => {
            try {
                const $el = $(el);

                // Title
                const title = $el.find('.name').text().trim();

                // Author (Can be in .author span or .author a)
                const author = $el.find('.author .alt').text().trim() || $el.find('.author span').text().trim();

                // Publisher
                const publisher = $el.find('.publisher .alt').text().trim() || $el.find('.publisher span').text().trim();

                // Cover Image
                let cover = $el.find('.image img').attr('src');
                // Kitapyurdu thumbnails are usually low res, manipulate URL if possible
                // Example: https://img.kitapyurdu.com/v1/getImage/fn:11456561/wh:true/wi:220
                // We can try to get higher res by removing wi limits or changing it, but let's keep it simple first.

                // Price
                const priceText = $el.find('.price-new .value').text().trim();
                const price = parseFloat(priceText.replace(',', '.')) || 0;

                // Detail URL
                const detailUrl = $el.find('.name a').attr('href');

                // Extract ID (from attribute id="product-12345")
                const id = $el.attr('id')?.replace('product-', '');

                if (title) {
                    books.push({
                        title,
                        author: author || 'Bilinmiyor',
                        publisher: publisher || 'Bilinmiyor',
                        description: '', // List page usually doesn't have description
                        pageCount: 0,
                        cover: cover || '',
                        price: price,
                        source: 'kitapyurdu',
                        externalId: id,
                        externalUrl: detailUrl,
                        language: 'Türkçe' // Default assumption
                    });
                }
            } catch (err) {
                // Skip broken item
            }
        });

        return books;

    } catch (error) {
        console.error('Kitapyurdu Scraper Error:', error);
        return [];
    }
}

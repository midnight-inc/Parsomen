import { prisma } from '@/lib/prisma';

/**
 * Metin içindeki @username etiketlerini bulur ve ilgili kullanıcılara bildirim gönderir.
 * @param {string} text - İşlenecek metin (gönderi veya yorum)
 * @param {number} senderId - Gönderen kullanıcının ID'si (kendisine bildirim gitmemesi için)
 * @param {number} sourceId - Kaynak ID (Post ID)
 * @param {string} sourceType - Kaynak Tipi ('POST' veya 'COMMENT')
 * @param {string} link - Bildirime tıklandığında gidilecek link
 */
export async function processMentions(text, senderId, sourceId, sourceType, link) {
    if (!text) return;

    // Regex to find @username
    // Kelime sınırı ve Türkçe karakter desteği önemli olabilir ama username genelde ingilizce karakterdir.
    // Basitçe @ ile başlayan ve boşluğa kadar olan kelimeler.
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);

    if (!matches) return;

    // Unique usernames (normalize and remove @)
    const usernames = [...new Set(matches.map(m => m.substring(1)))];

    if (usernames.length === 0) return;

    // Find users in DB
    const usersToNotify = await prisma.user.findMany({
        where: {
            username: { in: usernames },
            id: { not: senderId } // Don't notify self
        },
        select: { id: true, username: true }
    });

    if (usersToNotify.length === 0) return;

    // Create notifications for each valid user found
    // Biz burada Notification modeline 'MENTION' tipiyle kayıt atacağız.

    // Batch create yok ama map ile promise.all yapabiliriz.
    const notifications = usersToNotify.map(user => {
        let message = '';
        if (sourceType === 'POST') {
            message = `bir gönderide senden bahsetti.`;
        } else if (sourceType === 'COMMENT') {
            message = `bir yorumda senden bahsetti.`;
        }

        return prisma.notification.create({
            data: {
                userId: user.id,
                type: 'MENTION',
                title: 'Biri Senden Bahsetti',
                message: `@${usersToNotify.find(u => u.id === senderId)?.username || 'Birisi'} ${message}`, // Sender username'i DB'den almak yerine, senderId ile notification içinde "fromUserId" kullanıyoruz.
                // Düzeltme: Notification modelinde 'fromUserId' var. Message'ı frontend de oluşturabilir veya burada statik yazarız.
                // En temizi: "X seni bir gönderide etiketledi"
                // Ama burada processMentions içinde sender username'i bilmiyoruz (parametre olarak almadık).
                // O yüzden message'a generic yazıp, fromUserId set edelim.
                // Veya çağıran yerden sender name alalım.
                // Basitlik adına:
                fromUserId: senderId,
                link: link
            }
        });
    });

    // Yukarıdaki message kısmında "Birisi" yazıyor. Bunu düzeltmek gerek.
    // senderName parametresi eklemek en iyisi.
}


/**
 * Gelişmiş versiyon: Gönderen ismini de alır.
 */
export async function processMentionsWithSenderName(text, senderId, senderName, sourceId, sourceType, link) {
    if (!text) return;

    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);

    if (!matches) return;

    const usernames = [...new Set(matches.map(m => m.substring(1)))];

    if (usernames.length === 0) return;

    const usersToNotify = await prisma.user.findMany({
        where: {
            username: { in: usernames },
            id: { not: senderId }
        },
        select: { id: true }
    });

    if (usersToNotify.length === 0) return;

    const actionText = sourceType === 'POST' ? 'gönderisinde' : 'yorumunda';

    await Promise.all(usersToNotify.map(user =>
        prisma.notification.create({
            data: {
                userId: user.id,
                type: 'MENTION',
                title: 'Bahsedildin ✨',
                message: `${senderName} ${actionText} senden bahsetti.`,
                fromUserId: senderId,
                link: link
            }
        })
    ));
}

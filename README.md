# 📜 Parşomen 

> *Kitap kurtları için yeni nesil sosyal dijital kütüphane ve okuma platformu.*

![Parsomen Banner](public/icons/icon-512x512.png)

**Parşomen**, kitapseverleri bir araya getiren, kişiselleştirilebilir ve oyunlaştırılmış bir dijital kitaplık deneyimidir. Modern arayüzü, sosyal özellikleri ve mevsimsel etkinlikleriyle okuma alışkanlığınızı bir üst seviyeye taşır.

## ✨ Öne Çıkan Özellikler

*   **📚 Geniş Kütüphane:** Binlerce kitaba anında erişim ve detaylı incelemeler.
*   **🏆 Oyunlaştırma (Gamification):** Okudukça XP kazanın, seviye atlayın ve rozetler toplayın.
*   **🛒 Puan Dükkanı:** Puanlarınızla profil çerçevenizi, arka planınızı ve unvanınızı özelleştirin.
*   **👥 Topluluk ve Arkadaşlık:** Arkadaşlarınızı takip edin, hediye gönderin ve aktivite akışını izleyin.
*   **❄️ Mevsimsel Etkinlikler:** Kış Festivali gibi özel dönemlerde temalı arayüz ve bonuslar.
*   **💻 Masaüstü Deneyimi:** Vercel ile bulut tabanlı, Electron ile masaüstü performanslı.

## 🚀 Teknolojiler

Bu proje, modern web teknolojilerinin gücünü masaüstü konforuyla birleştirir:

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Desktop Engine:** [Electron](https://www.electronjs.org/)
*   **Database:** PostgreSQL (Neon Cloud) + Prisma ORM
*   **Styling:** TailwindCSS + Glassmorphism UI
*   **Auth:** Custom JWT Authentication & Session Management
*   **Deployment:** Vercel (Web) & GitHub Releases (Desktop App)

## 📦 Kurulum ve Çalıştırma

### Geliştirici Modu

Projeyi yerel ortamınızda çalıştırmak için:

```bash
# Bağımlılıkları yükleyin
npm install

# Veritabanını hazırlayın
npx prisma generate
npx prisma db push

# Geliştirme sunucusunu başlatın
npm run dev
```

### Masaüstü Uygulamasını Derleme

Windows için `.exe` dosyası oluşturmak için:

```bash
# Build ve Dist işlemini başlatın
npm run dist
```
Çıktı dosyaları `dist/` klasöründe oluşacaktır.

## 🔗 İndir

En son sürümü web sitemizden indirebilirsiniz:
[**parsomen.vercel.app**](https://parsomen.vercel.app)

---

## 🤝 Katkıda Bulunma

Hataları bildirmek veya yeni özellikler önermek için [Issues](https://github.com/midnight-inc/Parsomen/issues) sekmesini kullanabilirsiniz.

---

<p align="center">
  Built with ❤️ by <strong>Midnight Inc.</strong>
</p>

# Parşomen - Canlıya Alma Rehberi (Vercel & Postgres)

Bu rehber, projenin **Vercel** üzerine kurulması ve veritabanının **PostgreSQL**'e geçirilmesi içindir.

---

## 1. Hazırlık
Projenizde `schema.prisma` dosyasını `postgresql` olarak güncelledik. Şimdi Vercel üzerinde proje oluşturacağız.

## 2. Vercel Kurulumu (Terminal ile)

Terminali açın ve sırasıyla şunları yapın:

1.  **Vercel'e Giriş:**
    ```bash
    npx vercel login
    ```
    *(E-posta veya GitHub ile giriş yapın. Tarayıcı açılacak.)*

2.  **Projeyi Oluştur:**
    ```bash
    npx vercel
    ```
    Sorulara şöyle cevap verin:
    - Set up and deploy? **y** (Yes)
    - Which scope? **(Enter'a bas)**
    - Link to existing project? **n** (No)
    - Project name? **parsomen** (veya istediğiniz bir isim)
    - In which directory? **./** (Enter'a bas)
    - Want to modify settings? **n** (No)

    ⏳ *Kurulum biraz sürecektir.*

## 3. Veritabanı (Vercel Storage)

1.  [vercel.com/dashboard](https://vercel.com/dashboard) adresine gidin.
2.  Az önce oluşturduğunuz **parsomen** projesine tıklayın.
3.  Yukarıdaki menüden **Storage** sekmesine gelin.
4.  **Create Database** -> **Postgres** seçeneğini seçin.
5.  İsim verin (örn: `parsomen-db`) ve oluşturun.
6.  Oluştuktan sonra sol menüden **.env.local** sekmesine tıklayın.
7.  Oradaki **"Show Secret"** deyip `POSTGRES_PRISMA_URL` ve diğerlerini kopyalayın (veya "Connect Project" diyerek otomatik bağlayın).

## 4. Veritabanını Eşitleme

Veritabanı bağlantılarını aldıktan sonra, terminalden tabloları oluşturun:

```bash
# Önce yerel ortamda çalıştırmak isterseniz .env dosyasına Vercel'den aldığınız POSTGRES_PRISMA_URL'i yapıştırın (DATABASE_URL olarak)

# Sonra tabloları gönderin:
npx prisma db push
```

## 5. Tekrar Yayınlama

Her şey tamamsa son kez:

```bash
npx vercel --prod
```

Linkiniz hazır! 🎉
Uygulamanız artık `https://parsomen.vercel.app` adresinde çalışıyor.

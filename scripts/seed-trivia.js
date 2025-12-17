const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const QUESTIONS = [
    { q: "Suç ve Ceza kitabının baş kahramanı kimdir?", a: ["Raskolnikov", "Stavrogin", "Mişkin", "Oblomov"], correct: 0 },
    { q: "1984 romanındaki diktatör figürün adı nedir?", a: ["Büyük Birader", "Lider", "Başkan", "General"], correct: 0 },
    { q: "Harry Potter serisindeki büyücülük okulu hangisidir?", a: ["Hogwarts", "Beauxbatons", "Durmstrang", "Ilvermorny"], correct: 0 },
    { q: "Yüzüklerin Efendisi'nde Frodo'ya eşlik eden sadık dostu kimdir?", a: ["Samwise Gamgee", "Pippin", "Merry", "Gandalf"], correct: 0 },
    { q: "Simyacı kitabının yazarı kimdir?", a: ["Paulo Coelho", "Gabriel Garcia Marquez", "Jose Saramago", "Jorge Luis Borges"], correct: 0 },
    { q: "Don Kişot'un sadık yardımcısı kimdir?", a: ["Sancho Panza", "Dulcinea", "Rocinante", "Cervantes"], correct: 0 },
    { q: "Küçük Prens hangi gezegenden gelmiştir?", a: ["B-612", "Mars", "Jüpiter", "X-200"], correct: 0 },
    { q: "Sherlock Holmes'un yaratıcısı kimdir?", a: ["Arthur Conan Doyle", "Agatha Christie", "Edgar Allan Poe", "Stephen King"], correct: 0 },
    { q: "Dönüşüm romanında Gregor Samsa neye dönüşür?", a: ["Böcek", "Kuş", "Kedi", "Fare"], correct: 0 },
    { q: "Monte Kristo Kontu'nun asıl adı nedir?", a: ["Edmond Dantes", "Fernand Mondego", "Albert de Morcerf", "Abbe Faria"], correct: 0 },
    { q: "Fareler ve İnsanlar kitabının yazarı kimdir?", a: ["John Steinbeck", "Mark Twain", "Ernest Hemingway", "Jack London"], correct: 0 },
    { q: "Sefiller romanının baş kahramanı kimdir?", a: ["Jean Valjean", "Javert", "Cosette", "Marius"], correct: 0 },
    { q: "Romeo ve Juliet hangi şehirde geçer?", a: ["Verona", "Venedik", "Floransa", "Roma"], correct: 0 },
    { q: "Hangi kitap distopik bir geleceği anlatmaz?", a: ["Gurur ve Önyargı", "1984", "Cesur Yeni Dünya", "Fahrenheit 451"], correct: 0 },
    { q: "Yüzüklerin Efendisi serisinin yazarı kimdir?", a: ["J.R.R. Tolkien", "George R.R. Martin", "C.S. Lewis", "J.K. Rowling"], correct: 0 },
    { q: "Mobidick romanındaki balinanın rengi nedir?", a: ["Beyaz", "Mavi", "Siyah", "Gri"], correct: 0 },
    { q: "Frankenstein romanının yazarı kimdir?", a: ["Mary Shelley", "Bram Stoker", "H.G. Wells", "Jules Verne"], correct: 0 },
    { q: "Dracula hangi ülkeden İngiltere'ye gelir?", a: ["Transilvanya (Romanya)", "Bulgaristan", "Macaristan", "Sırbistan"], correct: 0 },
    { q: "Olasılıksız kitabının yazarı kimdir?", a: ["Adam Fawer", "Dan Brown", "Stephen King", "Tess Gerritsen"], correct: 0 },
    { q: "Satranç kitabının yazarı kimdir?", a: ["Stefan Zweig", "Franz Kafka", "Thomas Mann", "Hermann Hesse"], correct: 0 },
    { q: "Kürk Mantolu Madonna kitabındaki erkek karakterin adı nedir?", a: ["Raif Efendi", "Rasim", "Refik", "Rıfat"], correct: 0 },
    { q: "Aşk-ı Memnu romanının yazarı kimdir?", a: ["Halit Ziya Uşaklıgil", "Namık Kemal", "Recaizade Mahmut Ekrem", "Mehmet Rauf"], correct: 0 },
    { q: "Çalıkuşu romanındaki ana karakterin adı nedir?", a: ["Feride", "Neriman", "Macide", "Nuran"], correct: 0 },
    { q: "İnce Memed romanının yazarı kimdir?", a: ["Yaşar Kemal", "Orhan Kemal", "Kemal Tahir", "Sabahattin Ali"], correct: 0 },
    { q: "Saatleri Ayarlama Enstitüsü kimin eseridir?", a: ["Ahmet Hamdi Tanpınar", "Oğuz Atay", "Peyami Safa", "Tarık Buğra"], correct: 0 },
    { q: "Tutunamayanlar romanının baş kahramanı kimdir?", a: ["Selim Işık", "Turgut Özben", "Hikmet Benol", "Süleyman Kargı"], correct: 0 },
    { q: "Masumiyet Müzesi kimin eseridir?", a: ["Orhan Pamuk", "Elif Şafak", "Zülfü Livaneli", "Ayşe Kulin"], correct: 0 },
    { q: "Kuyucaklı Yusuf kimin eseridir?", a: ["Sabahattin Ali", "Reşat Nuri Güntekin", "Refik Halit Karay", "Memduh Şevket Esendal"], correct: 0 },
    { q: "Hababam Sınıfı'nın yazarı kimdir?", a: ["Rıfat Ilgaz", "Aziz Nesin", "Muzaffer İzgü", "Haldun Taner"], correct: 0 },
    { q: "Cemile romanı kime aittir?", a: ["Cengiz Aytmatov", "Dostoyevski", "Tolstoy", "Gorki"], correct: 0 },
    { q: "Şeker Portakalı kitabındaki çocuğun adı nedir?", a: ["Zeze", "Toto", "Minguinho", "Portuguga"], correct: 0 },
    { q: "Anna Karenina'nın yazarı kimdir?", a: ["Tolstoy", "Dostoyevski", "Çehov", "Turgenyev"], correct: 0 },
    { q: "Madam Bovary romanının yazarı kimdir?", a: ["Gustave Flaubert", "Victor Hugo", "Balzac", "Emile Zola"], correct: 0 },
    { q: "Dönüşüm (Metamorphosis) kimin eseridir?", a: ["Franz Kafka", "Stefan Zweig", "Albert Camus", "Jean-Paul Sartre"], correct: 0 },
    { q: "Yabancı (L'Etranger) romanının yazarı kimdir?", a: ["Albert Camus", "Jean-Paul Sartre", "Simone de Beauvoir", "Marcel Proust"], correct: 0 },
    { q: "Bulantı romanının yazarı kimdir?", a: ["Jean-Paul Sartre", "Albert Camus", "Franz Kafka", "Friedrich Nietzsche"], correct: 0 },
    { q: "Böyle Buyurdu Zerdüşt kimin eseridir?", a: ["Friedrich Nietzsche", "Schopenhauer", "Hegel", "Kant"], correct: 0 },
    { q: "Sofi'nin Dünyası ne tür bir kitaptır?", a: ["Felsefe Tarihi Romanı", "Bilim Kurgu", "Polisiye", "Biyografi"], correct: 0 },
    { q: "Da Vinci Şifresi kimin eseridir?", a: ["Dan Brown", "Umberto Eco", "Paulo Coelho", "Stephen King"], correct: 0 },
    { q: "Gülün Adı romanının yazarı kimdir?", a: ["Umberto Eco", "Dan Brown", "Italo Calvino", "Dante"], correct: 0 },
    { q: "İlahi Komedya kime aittir?", a: ["Dante Alighieri", "Boccaccio", "Petrarch", "Machiavelli"], correct: 0 },
    { q: "Prens (Il Principe) kitabının yazarı kimdir?", a: ["Machiavelli", "Platon", "Aristo", "Sokrates"], correct: 0 },
    { q: "Devlet (Politeia) kitabının yazarı kimdir?", a: ["Platon", "Aristo", "Sokrates", "Herakleitos"], correct: 0 },
    { q: "Utopia kitabının yazarı kimdir?", a: ["Thomas More", "Francis Bacon", "Campanella", "Machiavelli"], correct: 0 },
    { q: "Cesur Yeni Dünya kitabının yazarı kimdir?", a: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"], correct: 0 },
    { q: "Fahrenheit 451 kitabının yazarı kimdir?", a: ["Ray Bradbury", "Isaac Asimov", "Philip K. Dick", "Arthur C. Clarke"], correct: 0 },
    { q: "Otostopçunun Galaksi Rehberi kimin eseridir?", a: ["Douglas Adams", "Terry Pratchett", "Neil Gaiman", "Ursula K. Le Guin"], correct: 0 },
    { q: "Yerdeniz Büyücüsü kimin eseridir?", a: ["Ursula K. Le Guin", "J.K. Rowling", "Tolkien", "George R.R. Martin"], correct: 0 },
    { q: "Taht Oyunları kitabının yazarı kimdir?", a: ["George R.R. Martin", "J.R.R. Tolkien", "Robert Jordan", "Brandon Sanderson"], correct: 0 },
    { q: "Harry Potter serisinde Hermione'nin kedisinin adı nedir?", a: ["Crookshanks", "Mrs. Norris", "Hedwig", "Scabbers"], correct: 0 },
];

async function main() {
    console.log('Seeding trivia questions...');

    // Clear existing to avoid duplicates if re-run
    // await prisma.triviaQuestion.deleteMany({}); 

    for (const q of QUESTIONS) {
        await prisma.triviaQuestion.create({
            data: {
                question: q.q,
                options: q.a,
                correctIndex: q.correct,
            }
        });
    }

    console.log(`Seeded ${QUESTIONS.length} questions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

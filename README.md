# Google Arama Reklamı Oluşturucu

## Ortam Değişkenleri

Bu proje Vite kullanır ve OpenAI API anahtarını aşağıdaki ortam değişkeninden okur:

- `VITE_OPENAI_API_KEY`: OpenAI erişim anahtarınız.

Geliştirme ortamında anahtarı eklemek için proje kökünde `.env.local` dosyası oluşturun:

```
VITE_OPENAI_API_KEY=your_key_here
```

`.env.local` ve `.env*` dosyaları `.gitignore` ile git’e dahil edilmez. Gerçek anahtarları asla repoya commit etmeyin.

Bu proje, etkili Google Ads arama reklamları oluşturmak için geliştirilmiş bir React tabanlı micro frontend uygulamasıdır.

## 🚀 Özellikler

### 📝 Reklam Oluşturma
- **Adım Adım Reklam Oluşturma**: Stepper ile yönlendirilmiş süreç
- **Akıllı Web Sitesi Analizi**: OpenAI entegrasyonu ile otomatik form doldurma
- **Gerçek Zamanlı Önizleme**: Reklamın nasıl görüneceğini anında görün
- **Karakter Limiti Takibi**: Google Ads standartlarına uygun limitler

### 🤖 AI Özellikler
- **OpenAI Entegrasyonu**: Web sitesi URL'si ile otomatik içerik oluşturma
- **Akıllı Öneriler**: AI destekli başlık ve açıklama önerileri
- **Sektör Analizi**: Otomatik sektör tespiti ve uygun şablon seçimi

### 📊 Analiz ve Raporlar
- **Kalite Skoru**: Reklam performans tahmini
- **Tahmini Metrikler**: CTR, görüntüleme, tıklama tahminleri
- **Öneriler Sistemi**: İyileştirme önerileri
- **Karakter Analizi**: Başlık ve açıklama karakter kullanım analizi

### 📚 Şablon Kütüphanesi
- **Sektörel Şablonlar**: 6+ farklı sektör için hazır şablonlar
- **Hızlı Başlangıç**: E-ticaret, sağlık, eğitim, otomotiv ve daha fazlası
- **Özelleştirilebilir**: Şablonları kendi ihtiyaçlarınıza göre düzenleyin

### 💾 İçe/Dışa Aktarma
- **JSON Export/Import**: Verilerinizi kaydedin ve paylaşın
- **CSV Export**: Excel'de düzenlemek için
- **TXT Export**: Okunabilir format

## 🛠 Kurulum

### Gereksinimler
- Node.js 22.12+ 
- npm veya yarn

### Kurulum Adımları

```bash
# Depoyu klonlayın
git clone <repository-url>
cd microfrontend-child1-main

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

### OpenAI Entegrasyonu (Zorunlu)

```bash
# .env dosyasında OpenAI API key'inizi tanımlayın
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

**Not**: OpenAI API key zorunludur. API key olmadan web sitesi analizi ve AI önerileri çalışmaz.

## 🎯 Kullanım

### 1. İşletme Bilgileri
- İşletme adınızı girin
- Web sitenizi girin ve AI analizi başlatın
- Sektör ve hedef kitle bilgilerini tamamlayın

### 2. Reklam İçeriği
- AI önerileri ile başlıklar oluşturun
- Etkili açıklamalar yazın
- Anahtar kelimeleri belirleyin

### 3. Hedefleme
- Bütçe ve konum bilgilerini girin
- Cihaz hedeflemesi yapın

### 4. Önizleme ve Analiz
- Reklamınızın önizlemesini görün
- Kalite skorunu kontrol edin
- İyileştirme önerilerini uygulayın

## 🏗 Teknik Detaylar

### Teknoloji Stack
- **Frontend**: React 19 + Vite
- **UI Kütüphanesi**: Mantine UI
- **İkonlar**: Tabler Icons
- **AI**: OpenAI GPT-4 Turbo
- **Micro Frontend**: Module Federation

### Proje Yapısı
```
src/
├── components/
│   ├── AdGenerator.jsx      # Ana bileşen
│   ├── AdAnalytics.jsx      # Analiz paneli
│   ├── AIHelper.jsx         # AI öneriler
│   ├── TemplateLibrary.jsx  # Şablon kütüphanesi
│   └── ExportImport.jsx     # İçe/Dışa aktarma
├── services/
│   └── openAIService.js     # OpenAI entegrasyonu
└── App.jsx
```

### Micro Frontend
Bu uygulama, daha büyük bir micro frontend yapısının parçası olarak tasarlanmıştır:
- Header/Sidebar kullanmaz
- Bağımsız çalışabilir
- Module Federation ile entegre edilebilir

## 🔧 Geliştirme

### Komutlar
```bash
npm run dev      # Geliştirme sunucusu
npm run build    # Production build
npm run preview  # Build önizlemesi
npm run lint     # ESLint kontrolü
```

### Environment Variables
```bash
# OpenAI API Key (zorunlu)
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here

# Environment
VITE_ENV=development
```

## 📱 Responsive Design
- Mobil ve masaüstü uyumlu
- Mantine UI responsive bileşenleri
- Tab ve stepper navigasyon

## 🔒 Güvenlik
- API key'ler environment variable'da
- Client-side validasyon
- Karakter limiti korumaları

## 📄 Lisans
MIT Lisansı

## 🤝 Katkıda Bulunma
1. Fork edin
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## 📞 Destek
Sorularınız için issue açabilir veya iletişime geçebilirsiniz.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

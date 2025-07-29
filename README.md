# Yazışma - Modern Mesajlaşma Platformu

Modern, real-time mesajlaşma platformu. Kullanıcılar arkadaş ekleyebilir, mesajlaşabilir ve grup sohbetleri oluşturabilir.

## 🚀 Özellikler

- ✅ **Real-time Mesajlaşma** - Socket.io ile anlık mesajlaşma
- ✅ **Arkadaşlık Sistemi** - Telefon numarası ile arkadaş ekleme
- ✅ **Grup Sohbetleri** - Çoklu kullanıcı sohbetleri
- ✅ **Kullanıcı Profilleri** - Düzenlenebilir profil bilgileri
- ✅ **Online Durumu** - Gerçek zamanlı online/offline durumu
- ✅ **Modern UI** - Kırmızı/beyaz tema ile modern tasarım

## 🛠️ Teknolojiler

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Veritabanı
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI framework
- **Styled Components** - CSS-in-JS
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications

## 📦 Kurulum

### Gereksinimler
- Node.js (v14+)
- MongoDB
- Git

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/yourusername/yazisma.git
cd yazisma
```

2. **Bağımlılıkları yükleyin**
```bash
npm run install-all
```

3. **Environment değişkenlerini ayarlayın**
```bash
# server/.env dosyası oluşturun
cp server/.env.example server/.env
```

4. **MongoDB'yi başlatın**
```bash
# macOS
brew services start mongodb/brew/mongodb-community@7.0

# Linux
sudo systemctl start mongod
```

5. **Uygulamayı başlatın**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🌐 Deployment

### Vercel (Frontend)
1. Vercel hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Build komutunu ayarlayın: `cd client && npm run build`
4. Deploy edin

### Railway/Render (Backend)
1. Railway/Render hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Environment değişkenlerini ayarlayın
4. Deploy edin

### MongoDB Atlas
1. MongoDB Atlas hesabı oluşturun
2. Cluster oluşturun
3. Connection string'i environment değişkenlerine ekleyin

## 🔧 Environment Değişkenleri

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/yazisma
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5001
NODE_ENV=development
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
```

## 📱 Kullanım

1. **Kayıt Ol** - Email, telefon ve şifre ile
2. **Giriş Yap** - Hesabınıza giriş yapın
3. **Arkadaş Ekle** - Telefon numarası ile arama yapın
4. **Mesajlaş** - Real-time mesajlaşma başlatın
5. **Grup Oluştur** - Çoklu sohbetler oluşturun

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Email:** your-email@example.com
- **GitHub:** [@yourusername](https://github.com/yourusername)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! 
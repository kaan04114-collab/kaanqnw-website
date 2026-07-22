import React, { useState, useEffect } from 'react';
import { products } from './data/products';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [orders, setOrders] = useState([]);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('activeUser'));
    const allUsers = JSON.parse(localStorage.getItem('siteUsers') || '{}');
    const allOrders = JSON.parse(localStorage.getItem('siteOrders') || '[]');

    if (!allUsers['adminkaanqnw']) {
      allUsers['adminkaanqnw'] = { username: 'adminkaanqnw', password: 'admin145312', balance: 9999, isAdmin: true };
      localStorage.setItem('siteUsers', JSON.stringify(allUsers));
    }

    setUsers(allUsers);
    setOrders(allOrders);
    if (savedUser) setCurrentUser(savedUser);
  }, []);

  const handleUsersUpdate = (newUsers) => {
    setUsers(newUsers);
    if (currentUser && newUsers[currentUser.username]) {
      const updated = newUsers[currentUser.username];
      setCurrentUser(updated);
      localStorage.setItem('activeUser', JSON.stringify(updated));
    }
  };

  const handleOrdersUpdate = (newOrders) => {
    setOrders(newOrders);
    localStorage.setItem('siteOrders', JSON.stringify(newOrders));
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return alert('Tüm alanları doldurun!');
    const allUsers = { ...users };

    if (isRegister) {
      if (allUsers[username]) return alert('Bu kullanıcı adı alınmış!');
      const newUser = { username, password, balance: 0 };
      allUsers[username] = newUser;
      localStorage.setItem('siteUsers', JSON.stringify(allUsers));
      setUsers(allUsers);
      setCurrentUser(newUser);
      localStorage.setItem('activeUser', JSON.stringify(newUser));
      setIsAuthOpen(false);
    } else {
      const user = allUsers[username];
      if (user && user.password === password) {
        setCurrentUser(user);
        localStorage.setItem('activeUser', JSON.stringify(user));
        setIsAuthOpen(false);
      } else {
        alert('Hatalı giriş!');
      }
    }
    setUsername(''); setPassword('');
  };

  const handleBuyProduct = (product) => {
    if (!currentUser) return setIsAuthOpen(true);
    if (currentUser.balance < product.price) return alert('Yetersiz bakiye! Lütfen bakiye yükleyin.');
    
    if (!window.confirm(`${product.title} ürününü ${product.price} TL bakiyenizle almak istiyor musunuz?`)) return;

    const newBalance = currentUser.balance - product.price;
    const updatedUser = { ...currentUser, balance: newBalance };
    
    const allUsers = { ...users };
    allUsers[currentUser.username] = updatedUser;
    
    localStorage.setItem('siteUsers', JSON.stringify(allUsers));
    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setUsers(allUsers);
    setCurrentUser(updatedUser);

    const newOrder = {
      id: Date.now(),
      username: currentUser.username,
      productTitle: product.title,
      price: product.price,
      status: 'Beklemede',
      date: new Date().toLocaleString('tr-TR')
    };

    handleOrdersUpdate([newOrder, ...orders]);
    alert('Siparişiniz alındı! Admin onayından sonra hesabınız teslim edilecektir.');
  };

  const myOrders = orders.filter(o => o.username === currentUser?.username);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans relative">
      
      {/* HEADER */}
      <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-extrabold text-white">kaanqnw.xyz</div>
          
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400">{currentUser.username}</div>
                <div className="text-sm font-bold text-emerald-400">{currentUser.balance} TL</div>
              </div>
              <button onClick={() => { localStorage.removeItem('activeUser'); setCurrentUser(null); }} className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl text-sm font-bold">
                Çıkış
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="bg-sky-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20">
              Giriş Yap
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* YÖNETİCİ PANELİ */}
        {currentUser?.username === 'adminkaanqnw' && (
          <AdminPanel onUpdateUsers={handleUsersUpdate} orders={orders} onUpdateOrders={handleOrdersUpdate} />
        )}

        <section className="text-center my-8 md:my-16">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Dijital Dünyaya Hızlı Erişim</h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">Güvenli bakiye sistemi ile lisanslarınızı anında teslim alın.</p>
        </section>

        {/* GÜNCELLENEN BAKİYE YÜKLEME BANNERI */}
        <section className="my-8 bg-gradient-to-r from-sky-900 to-slate-900 border border-sky-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">💳 Bakiye Yükle</h2>
            <p className="text-xs text-slate-400">hesap.com.tr üzerinden bakiye kodunuzu alın. Siparişinizden sonra bakiyeniz hesabınıza yansır.</p>
          </div>
          <a 
            href="https://hesap.com.tr/ilan/1143386-bakiye-yukleme-sistemi-kaan-sitesi" 
            target="_blank" 
            rel="noreferrer" 
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 transition-colors text-slate-900 font-bold px-8 py-3.5 rounded-xl text-sm whitespace-nowrap shadow-lg shadow-emerald-500/20"
          >
            Bakiye Satın Al
          </a>
        </section>

        {/* Siparişlerim (Müşteri için) */}
        {currentUser && currentUser.username !== 'adminkaanqnw' && myOrders.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-white mb-4">📦 Siparişlerim</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOrders.map(order => (
                <div key={order.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="text-sky-400 font-bold text-sm">{order.productTitle}</h3>
                    <p className="text-xs text-slate-500">{order.date}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg ${order.status === 'Beklemede' ? 'bg-amber-500/20 text-amber-400' : order.status === 'Onaylandı' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ürünler */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Tüm Servisler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-3 py-1 rounded-full">{item.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 mb-6 h-12">{item.description}</p>
                </div>
                <div>
                  <div className="text-2xl font-black text-white mb-4">{item.price} TL</div>
                  <button onClick={() => handleBuyProduct(item)} className="w-full bg-slate-800 hover:bg-sky-500 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                    Satın Al (Bakiye ile)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-sm relative shadow-2xl">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">✕</button>
            <h2 className="text-xl font-bold text-white text-center mb-6">{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <input type="text" placeholder="Kullanıcı Adı" value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500" />
              <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500" />
              <button type="submit" className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-xl transition-colors">{isRegister ? 'Kayıt Ol' : 'Giriş Yap'}</button>
            </form>
            <p className="text-xs text-center text-slate-400 mt-4 cursor-pointer hover:text-white transition-colors" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Zaten hesabın var mı? Giriş Yap' : 'Hesabın yok mu? Kayıt Ol'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

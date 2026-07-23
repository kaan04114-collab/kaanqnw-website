const { useState, useEffect } = React;

// YÖNETİCİ PANELİ BİLEŞENİ
function AdminPanel({ onUpdateUsers, orders, onUpdateOrders, users, setUsers }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [amountToAdd, setAmountToAdd] = useState('');

  const handleAddBalance = (e) => {
    e.preventDefault();
    if (!selectedUser || !amountToAdd) return alert('Kullanıcı ve miktar seçin!');

    const updatedUsers = { ...users };
    if (updatedUsers[selectedUser]) {
      updatedUsers[selectedUser].balance = (updatedUsers[selectedUser].balance || 0) + Number(amountToAdd);
      localStorage.setItem('siteUsers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      onUpdateUsers(updatedUsers);
      alert(`${selectedUser} adlı kullanıcıya ${amountToAdd} TL bakiye eklendi!`);
      setAmountToAdd('');
    }
  };

  const handleApproveOrder = (orderId) => {
    const updatedOrders = orders.map(order => order.id === orderId ? { ...order, status: 'Onaylandı' } : order);
    onUpdateOrders(updatedOrders);
    alert('Sipariş başarıyla onaylandı!');
  };

  const handleRejectOrder = (order) => {
    if (!window.confirm('Siparişi iptal edip bakiyeyi müşteriye iade etmek istediğinize emin misiniz?')) return;
    const updatedOrders = orders.map(o => o.id === order.id ? { ...o, status: 'İptal / İade' } : o);
    onUpdateOrders(updatedOrders);

    const updatedUsers = { ...users };
    if (updatedUsers[order.username]) {
      updatedUsers[order.username].balance = (updatedUsers[order.username].balance || 0) + order.price;
      localStorage.setItem('siteUsers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      onUpdateUsers(updatedUsers);
    }
  };

  return (
    <div className="w-full mb-10 bg-slate-900 border border-amber-500/40 rounded-2xl p-4 md:p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-500/20">
        <span className="text-2xl">👑</span>
        <div>
          <h2 className="text-lg font-bold text-amber-400">Yönetici Paneli</h2>
          <p className="text-xs text-amber-200/60">Bakiye ekle ve siparişleri yönet</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-300 mb-3">➕ Manuel Bakiye Yükle</h3>
        <form onSubmit={handleAddBalance} className="flex flex-col md:flex-row gap-3">
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-amber-500 outline-none">
            <option value="">Kullanıcı Seçin...</option>
            {Object.keys(users).map((username) => (
              <option key={username} value={username}>{username} (Bakiye: {users[username].balance || 0} TL)</option>
            ))}
          </select>
          <input type="number" placeholder="Miktar (TL)" value={amountToAdd} onChange={(e) => setAmountToAdd(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-amber-500 outline-none" />
          <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition-colors">Yükle</button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3">📦 Müşteri Siparişleri</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300 min-w-[600px]">
            <thead className="bg-slate-950 text-amber-400">
              <tr><th className="p-4">Kullanıcı</th><th className="p-4">Ürün</th><th className="p-4">Tutar</th><th className="p-4">Durum</th><th className="p-4 text-right">İşlem</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30">
                  <td className="p-4 font-bold">{order.username}</td>
                  <td className="p-4 text-sky-400">{order.productTitle}</td>
                  <td className="p-4 text-emerald-400 font-bold">{order.price} TL</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${order.status === 'Beklemede' ? 'bg-amber-500/10 text-amber-400' : order.status === 'Onaylandı' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{order.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    {order.status === 'Beklemede' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleApproveOrder(order.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs">✓ Onayla</button>
                        <button onClick={() => handleRejectOrder(order)} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-lg text-xs">✕ İptal</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-500">Henüz sipariş yok.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ANA UYGULAMA BİLEŞENİ
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [orders, setOrders] = useState([]);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // YENİ: Ekrana çıkacak özel hata mesajı için State
  const [customAlert, setCustomAlert] = useState(null);

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
    
    // YENİ: Tarayıcı alerti yerine ekrana özel hata tasarımı çıkarıyoruz
    if (currentUser.balance < product.price) {
      setCustomAlert('Bakiyeniz yetmiyor! Lütfen WhatsApp üzerinden iletişime geçerek bakiye yükleyin.');
      return;
    }
    
    if (!window.confirm(`${product.title} ürününü ${product.price} TL bakiyenizle almak istiyor musunuz?`)) return;

    const newBalance = currentUser.balance - product.price;
    const updatedUser = { ...currentUser, balance: newBalance };
    const allUsers = { ...users };
    allUsers[currentUser.username] = updatedUser;
    
    localStorage.setItem('siteUsers', JSON.stringify(allUsers));
    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
    setUsers(allUsers);
    setCurrentUser(updatedUser);

    const newOrder = { id: Date.now(), username: currentUser.username, productTitle: product.title, price: product.price, status: 'Beklemede', date: new Date().toLocaleString('tr-TR') };
    handleOrdersUpdate([newOrder, ...orders]);
    alert('Siparişiniz alındı! Admin onayından sonra hesabınız teslim edilecektir.');
  };

  const myOrders = orders.filter(o => o.username === currentUser?.username);

  return (
    <div>
      <nav className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="text-xl md:text-2xl font-extrabold text-white">kaanqnw.xyz</div>
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400">{currentUser.username}</div>
                <div className="text-sm font-bold text-emerald-400">{currentUser.balance} TL</div>
              </div>
              <button onClick={() => { localStorage.removeItem('activeUser'); setCurrentUser(null); }} className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl text-sm font-bold">Çıkış</button>
            </div>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="bg-sky-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20">Giriş Yap</button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentUser?.username === 'adminkaanqnw' && (
          <AdminPanel onUpdateUsers={handleUsersUpdate} orders={orders} onUpdateOrders={handleOrdersUpdate} users={users} setUsers={setUsers} />
        )}

        <section className="text-center my-8 md:my-16">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Dijital Dünyaya Hızlı Erişim</h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">Güvenli bakiye sistemi ile lisanslarınızı anında teslim alın.</p>
        </section>

        {/* WHATSAPP İLE BAKİYE YÜKLEME BÖLÜMÜ */}
        <section className="my-8 bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">💬 Bakiye Yükle (Havale / Papara)</h2>
            <p className="text-xs text-slate-400">IBAN veya Papara numarası almak için WhatsApp'tan iletişime geçin. Ödemeniz onaylandıktan sonra bakiyeniz hemen hesabınıza eklenecektir.</p>
          </div>
          
          <a href="https://wa.me/905550000000?text=Merhaba,%20kaanqnw.xyz%20sitesi%20için%20bakiye%20yüklemek%20istiyorum." target="_blank" rel="noreferrer" className="w-full md:w-auto bg-[#25D366] hover:bg-[#1ebd5a] transition-colors text-white font-bold px-8 py-3.5 rounded-xl text-sm whitespace-nowrap shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2">
            <span className="text-xl">📱</span> WhatsApp'tan Ulaş
          </a>
        </section>

        {currentUser && currentUser.username !== 'adminkaanqnw' && myOrders.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-white mb-4">📦 Siparişlerim</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myOrders.map(order => (
                <div key={order.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div><h3 className="text-sky-400 font-bold text-sm">{order.productTitle}</h3><p className="text-xs text-slate-500">{order.date}</p></div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg ${order.status === 'Beklemede' ? 'bg-amber-500/20 text-amber-400' : order.status === 'Onaylandı' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{order.status}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Tüm Servisler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-sky-500/50 transition-colors">
                <div>
                  <div className="flex justify-between mb-4"><span className="text-3xl">{item.icon}</span><span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-3 py-1 rounded-full">{item.badge}</span></div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 mb-6 h-12">{item.description}</p>
                </div>
                <div>
                  <div className="text-2xl font-black text-white mb-4">{item.price} TL</div>
                  <button onClick={() => handleBuyProduct(item)} className="w-full bg-slate-800 hover:bg-sky-500 text-white font-bold py-3 rounded-xl text-sm transition-colors">Satın Al (Bakiye ile)</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* YENİ: ÖZEL HATA UYARISI (MODAL) */}
      {customAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-500/50 p-8 rounded-2xl w-full max-w-sm relative shadow-2xl text-center flex flex-col items-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">İşlem Başarısız</h2>
            <p className="text-slate-400 text-sm mb-6">{customAlert}</p>
            <button onClick={() => setCustomAlert(null)} className="w-full bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 rounded-xl transition-colors">
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* GİRİŞ/KAYIT MODALI */}
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
            <p className="text-xs text-center text-slate-400 mt-4 cursor-pointer hover:text-white transition-colors" onClick={() => setIsRegister(!isRegister)}>{isRegister ? 'Zaten hesabın var mı? Giriş Yap' : 'Hesabın yok mu? Kayıt Ol'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

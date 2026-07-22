import React, { useState, useEffect } from 'react';

export default function AdminPanel({ onUpdateUsers, orders, onUpdateOrders }) {
  const [users, setUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState('');
  const [amountToAdd, setAmountToAdd] = useState('');

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('siteUsers') || '{}');
    setUsers(savedUsers);
  }, []);

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
    alert('Sipariş başarıyla onaylandı ve müşteriye teslim edildi!');
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
          <h2 className="text-lg font-bold text-amber-400">Gelişmiş Yönetici Paneli</h2>
          <p className="text-xs text-amber-200/60">Bakiye ekle ve siparişleri yönet</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-300 mb-3">➕ Manuel Bakiye Yükle</h3>
        <form onSubmit={handleAddBalance} className="flex flex-col md:flex-row gap-3">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-amber-500 outline-none"
          >
            <option value="">Kullanıcı Seçin...</option>
            {Object.keys(users).map((username) => (
              <option key={username} value={username}>
                {username} (Bakiye: {users[username].balance || 0} TL)
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Miktar (TL)"
            value={amountToAdd}
            onChange={(e) => setAmountToAdd(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:border-amber-500 outline-none"
          />

          <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 transition-colors">
            Yükle
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3">📦 Müşteri Siparişleri</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300 min-w-[600px]">
            <thead className="bg-slate-950 text-amber-400">
              <tr>
                <th className="p-4">Kullanıcı</th>
                <th className="p-4">Ürün</th>
                <th className="p-4">Tutar</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/30">
                  <td className="p-4 font-bold">{order.username}</td>
                  <td className="p-4 text-sky-400">{order.productTitle}</td>
                  <td className="p-4 text-emerald-400 font-bold">{order.price} TL</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      order.status === 'Beklemede' ? 'bg-amber-500/10 text-amber-400' :
                      order.status === 'Onaylandı' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {order.status === 'Beklemede' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleApproveOrder(order.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs">
                          ✓ Onayla
                        </button>
                        <button onClick={() => handleRejectOrder(order)} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-lg text-xs">
                          ✕ İptal Et
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">Henüz sipariş yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

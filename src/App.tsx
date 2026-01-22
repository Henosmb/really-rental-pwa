import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState<{ id: number; first_name?: string } | null>(null);
  const [mode, setMode] = useState<'renter' | 'owner'>('renter');

  useEffect(() => {
    // Безопасный доступ к Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
    if (tg) {
      tg.ready();
      tg.setHeaderColor('#ffffff');
      tg.setBackgroundColor('#f5f5f7');
    }
  }, []);

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🏠 Really Rental</h1>
      
      {!user ? (
        <p>Откройте приложение через Telegram!</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setMode('renter')}
              style={{ 
                flex: 1, 
                padding: '12px', 
                border: 'none', 
                borderRadius: '8px',
                backgroundColor: mode === 'renter' ? '#007AFF' : '#e0e0e0',
                color: mode === 'renter' ? 'white' : 'black'
              }}
            >
              Найти квартиру
            </button>
            <button 
              onClick={() => setMode('owner')}
              style={{ 
                flex: 1, 
                padding: '12px', 
                border: 'none', 
                borderRadius: '8px',
                backgroundColor: mode === 'owner' ? '#007AFF' : '#e0e0e0',
                color: mode === 'owner' ? 'white' : 'black'
              }}
            >
              Сдать квартиру
            </button>
          </div>

          {mode === 'owner' && <OwnerForm telegramId={user.id} />}
          {mode === 'renter' && <RenterSearch />}
        </>
      )}
    </div>
  );
}

function OwnerForm({ telegramId }: { telegramId: number }) {
  const [formData, setFormData] = useState({
    address: '',
    rooms: '1',
    price: '',
    availableFrom: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('https://really-rental-api.onrender.com/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, ownerId: telegramId }),
    });
    if (response.ok) {
      alert('Объявление отправлено!');
    } else {
      alert('Ошибка отправки');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2>Сдать квартиру</h2>
      <input placeholder="Адрес" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} /><br/>
      <select value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
        <option value="1">1-комнатная</option>
        <option value="2">2-комнатная</option>
        <option value="3">3-комнатная</option>
        <option value="studio">Студия</option>
      </select><br/>
      <input type="number" placeholder="Цена в месяц (₽)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} /><br/>
      <input type="date" value={formData.availableFrom} onChange={e => setFormData({...formData, availableFrom: e.target.value})} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} /><br/>
      <button type="submit" style={{ padding: '12px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '8px' }}>Оплатить и разместить</button>
    </form>
  );
}

function RenterSearch() {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://really-rental-api.onrender.com/listings')
      .then(res => res.json())
      .then(data => setListings(data))
      .catch(() => alert('Ошибка загрузки'));
  }, []);

  return (
    <div>
      <h2>Доступные квартиры</h2>
      {listings.length === 0 ? (
        <p>Пока нет объявлений</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {listings.map(item => (
            <div key={item.id} style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '8px', backgroundColor: 'white' }}>
              <strong>{item.rooms}-комн.</strong> — {item.address}<br/>
              {item.price} ₽/мес<br/>
              <button style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '4px' }}>Написать собственнику</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

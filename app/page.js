'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [propertyRates, setPropertyRates] = useState([]);
  const [type, setType] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [price, setPrice] = useState(null);
  const [savedResults, setSavedResults] = useState([]);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchSavedResults(parsedUser.email);
    }

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > 5 * 60 * 1000) {
        localStorage.removeItem('loggedInUser');
        setUser(null);
        setSavedResults([]);
        router.refresh();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [lastActivity]);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('/api/rates');
        const data = await res.json();
        setPropertyRates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading rates:', err);
        setPropertyRates([]);
      }
    }
    fetchRates();
  }, []);

  const fetchSavedResults = async (email) => {
    try {
      const res = await fetch('/api/properties/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setSavedResults(data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching saved results:', error);
    }
  };

  const handleUserActivity = () => setLastActivity(Date.now());

  useEffect(() => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, []);

  const handleCalculate = () => {
    if (!type || !location || !area) return;
    const areaNum = parseFloat(area);
    const record = propertyRates.find(
      (r) => r.city === location && r.propertyType === type
    );
    if (!record) {
      alert('City or property type not found in database.');
      return;
    }
    const baseRate = record.rate;
    let amenityCost = 0;
    if (record.amenities) {
      amenities.forEach((a) => {
        const cost = record.amenities[a];
        if (cost) amenityCost += cost;
      });
    }
    const finalPrice = areaNum * baseRate + amenityCost;
    setPrice(finalPrice);
  };

  const saveProperty = async () => {
    if (!user?.email) {
      alert("Please log in to save properties.");
      return;
    }
    if (!type || !area || !location || !price) {
      alert("Please fill all fields and calculate the price before saving.");
      return;
    }
    try {
      const res = await fetch('/api/properties/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, type, area, location, amenities, price }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      alert('✅ Property saved successfully!');
      fetchSavedResults(user.email);
    } catch (error) {
      console.error(error);
      alert('⚠️ Something went wrong. Try again.');
    }
  };

  const deleteProperty = async (id) => {
    try {
      const res = await fetch('/api/properties/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      alert('🗑️ Property deleted');
      fetchSavedResults(user.email);
    } catch (error) {
      console.error(error);
      alert('⚠️ Deletion failed');
    }
  };

  const uniqueCities = [...new Set(propertyRates.map((r) => r.city).filter(Boolean))];
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    setSavedResults([]);
    router.refresh();
  };
  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setAmenities(checked ? [...amenities, value] : amenities.filter((a) => a !== value));
  };

  return (
    <main className="min-h-screen p-6 md:px-10 md:py-12 bg-gray-100">
      <div className="flex justify-between mb-6">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-blue-900 font-semibold">👋 {user.name}</span>
            <img src="/user.png" alt="User Icon" className="w-8 h-8 rounded-full" />
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-xl">Logout</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => router.push('/auth/login')} className="bg-white border text-black px-4 py-2 rounded-xl">Login</button>
            <button onClick={() => router.push('/auth/signup')} className="bg-blue-700 text-white px-4 py-2 rounded-xl">Sign Up</button>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-900 mb-6">🏠 Premium Property Price Estimator</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-3 border rounded-xl text-black">
              <option value="">Select property type</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
            </select>

            <input type="number" placeholder="Area in sq ft" value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-3 border rounded-xl text-black" />

            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 border rounded-xl text-black">
              <option value="">Select city</option>
              {uniqueCities.map((city) => <option key={city}>{city}</option>)}
            </select>

            <div className="flex flex-wrap gap-2 text-black">
              {['Parking', 'Pool', 'Gym', 'Security'].map((amenity) => (
                <label key={amenity} className="flex items-center gap-1 border p-2 rounded-xl">
                  <input type="checkbox" value={amenity} onChange={handleAmenityChange} />
                  {amenity}
                </label>
              ))}
            </div>

            <button onClick={handleCalculate} className="w-full bg-blue-700 text-white p-3 rounded-xl">Calculate Price</button>
            {price !== null && user && <button onClick={saveProperty} className="w-full mt-2 bg-emerald-600 text-white p-3 rounded-xl">Save Property</button>}
          </div>

          <div className="hidden md:block">
            <img src="https://www.happy.rentals/admin/uploads/634fc6f79ad5eFamily-friendly-holiday-home.jpg" alt="House" className="rounded-xl shadow-md" />
          </div>
        </div>

        {price !== null && (
          <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 text-center rounded-xl">
            <h2 className="text-2xl text-black font-bold">Estimated Price</h2>
            <p className="text-4xl text-black font-extrabold">₹{price.toLocaleString()}</p>
          </div>
        )}

        {user && savedResults.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl text-black font-semibold mb-4">Previously Searched Properties</h3>
            <ul className="grid gap-4">
              {savedResults.map((res) => (
                <li key={res._id} className="p-4 border rounded-xl bg-gray-50 flex justify-between items-center">
                  <div>
                    <div className="flex justify-between">
                      <span className="font-semibold">{res.type}</span>
                      <span className="text-sm">₹{res.price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{res.area} sqft in {res.location} ({res.amenities.join(', ')})</p>
                  </div>
                  <button
                    onClick={() => deleteProperty(res._id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                    title="Delete"
                  >
                    ✖
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

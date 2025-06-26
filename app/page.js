// === app/page.js ===
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [propertyRates, setPropertyRates] = useState([]);
  const [type, setType] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('/api/rates');
        const data = await res.json();
        console.log("Fetched rates:", data);
        setPropertyRates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading rates:', err);
        setPropertyRates([]);
      }
    }

    fetchRates();
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

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAmenities([...amenities, value]);
    } else {
      setAmenities(amenities.filter((a) => a !== value));
    }
  };

  const uniqueCities = Array.isArray(propertyRates)
    ? [...new Set(propertyRates.map((r) => r.city).filter(Boolean))]
    : [];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white px-4 py-12">
      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-blue-900">🏠 Premium Property Price Estimator</h1>
          <p className="text-gray-600 mt-2 text-lg">Get accurate real-estate pricing with real-world factors</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Property Type</label>
              <select
                className="w-full border border-gray-300 p-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">Select property type</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1">Area (sq ft)</label>
              <input
                className="w-full border border-gray-300 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter area (e.g. 1200)"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1">Location (City)</label>
              <select
                className="w-full border border-gray-300 p-3 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Select city</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">Select Amenities</label>
              <div className="flex flex-wrap gap-4">
                {['Parking', 'Pool', 'Gym', 'Security'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                    <input type="checkbox" value={amenity} onChange={handleAmenityChange} />
                    <span className="text-sm text-gray-700 font-medium">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white p-3 rounded-xl text-lg font-semibold hover:opacity-90 transition"
            >
              Calculate Price
            </button>
          </div>

          <div className="flex flex-col items-center justify-center">
            <img
              src="https://www.happy.rentals/admin/uploads/634fc6f79ad5eFamily-friendly-holiday-home.jpg"
              alt="Family with Home"
              className="rounded-2xl shadow-lg max-h-64 object-cover"
            />
          </div>
        </div>

        {price !== null && (
          <div className="mt-10 bg-emerald-50 text-emerald-900 p-6 rounded-2xl shadow-inner border border-emerald-200 text-center">
            <h3 className="text-2xl font-bold mb-2">Estimated Price</h3>
            <p className="text-4xl font-extrabold">₹{price.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-600">Based on area, location and amenities</p>
          </div>
        )}
      </div>
    </main>
  );
}

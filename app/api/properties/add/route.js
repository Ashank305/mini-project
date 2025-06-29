// === app/api/properties/add/route.js ===
import { connectToDatabase } from '@/lib/mongodb';
import UserProperty from '@/models/UserProperty';

export async function POST(req) {
  await connectToDatabase();

  try {
    const { userEmail, propertyType, city, area, amenities, estimatedPrice } = await req.json();

    if (!userEmail || !propertyType || !city || !area || !estimatedPrice) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const newProperty = {
      propertyType,
      city,
      area,
      amenities,
      estimatedPrice,
      timestamp: new Date()
    };

    // Find existing user entry
    let userEntry = await UserProperty.findOne({ userEmail });

    if (userEntry) {
      if (userEntry.properties.length >= 5) {
        userEntry.properties.shift(); // Remove oldest
      }
      userEntry.properties.push(newProperty);
      await userEntry.save();
    } else {
      await UserProperty.create({
        userEmail,
        properties: [newProperty]
      });
    }

    return new Response(JSON.stringify({ message: 'Property saved successfully' }), { status: 200 });
  } catch (err) {
    console.error('Error saving property:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

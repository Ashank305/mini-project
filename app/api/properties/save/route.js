import { connectToDatabase } from '@/lib/mongodb';
import UserProperty from '@/models/UserProperty';

export async function POST(req) {
  try {
    await connectToDatabase();

    const { email, type, area, location, amenities, price } = await req.json();

    if (!email || !type || !area || !location || !price) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userProperties = await UserProperty.find({ userEmail: email });

    if (userProperties.length >= 5) {
      return new Response(JSON.stringify({ error: 'You can only save up to 5 properties' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newProperty = new UserProperty({
      userEmail: email,
      type,
      area: parseFloat(area),
      location,
      amenities: Array.isArray(amenities) ? amenities : [],
      price: parseFloat(price),
    });

    await newProperty.save();

    return new Response(JSON.stringify({ message: 'Property saved successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error saving property:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

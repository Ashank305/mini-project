import { connectToDatabase } from '@/lib/mongodb';
import UserProperty from '@/models/UserProperty';

export async function POST(req) {
  try {
    await connectToDatabase();

    const { email, type, area, location, amenities, price } = await req.json();

    if (!email || !type || !area || !location || !price) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const userProperties = await UserProperty.find({ userEmail: email });

    if (userProperties.length >= 5) {
      return new Response(JSON.stringify({ error: 'You can only save up to 5 properties' }), { status: 403 });
    }

    const newProperty = new UserProperty({
      userEmail: email,
      type,
      area,
      location,
      amenities,
      price,
    });

    await newProperty.save();

    return new Response(JSON.stringify({ message: 'Property saved successfully' }), { status: 201 });

  } catch (error) {
    console.error('Error saving property:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

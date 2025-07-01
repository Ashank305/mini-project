import { connectToDatabase } from '@/lib/mongodb';
import UserProperty from '@/models/UserProperty';

export async function POST(req) {
  try {
    await connectToDatabase();

    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    const properties = await UserProperty.find({ userEmail: email })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(5); // Only last 5

    return new Response(JSON.stringify(properties), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

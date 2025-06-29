import { connectToDatabase } from '@/lib/mongodb';
import UserProperty from '@/models/UserProperty';

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    const properties = await UserProperty.find({ userEmail: email });

    return new Response(JSON.stringify({ properties }), { status: 200 });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

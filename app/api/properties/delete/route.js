import { connectToDatabase } from '@/lib/mongodb';
import UserProperty from '@/models/UserProperty';
import { Types } from 'mongoose';

export async function DELETE(req) {
  try {
    await connectToDatabase();
    const { id } = await req.json();

    if (!id || !Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 });
    }

    await UserProperty.findByIdAndDelete(id);

    return new Response(JSON.stringify({ message: 'Deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting property:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}

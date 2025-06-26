import { connectToDatabase } from '@/lib/mongodb';
import PropertyRate from '@/models/PropertyRate';

export async function GET() {
  try {
    console.log("➡️ Connecting to DB...");
    await connectToDatabase();
    const rates = await PropertyRate.find({});
    console.log("✅ Rates fetched:", rates);
    return new Response(JSON.stringify(rates), { status: 200 });
  } catch (error) {
    console.error("❌ GET /api/rates failed:", error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 500 });
  }
}

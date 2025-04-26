import { NextRequest, NextResponse } from 'next/server';
// Assume these functions exist in your db library
// You will need to implement them based on your database choice (e.g., Prisma, Drizzle, Supabase)
import { getYieldsByUsername, createYield } from '@/lib/db';

// Define the expected structure for a new yield record from the POST request
interface NewYieldPayload {
    cropType: string;
    measurementDate: string; // Expecting 'YYYY-MM' format from <input type="month">
    yieldPerAcre: string; // Comes as string from form input
    username: string;
}

// Handler for GET /api/cropyields?username=...
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        console.error("GET /api/cropyields: Missing username parameter");
        return NextResponse.json({ error: 'Username query parameter is required' }, { status: 400 });
    }

    try {
        console.log(`GET /api/cropyields: Fetching yields for username: ${username}`);
        // Fetch yields using the (placeholder) database function
        const yields = await getYieldsByUsername(username);

        if (!yields) {
            // Handle case where user might not exist or has no yields yet
             console.log(`GET /api/cropyields: No yields found for username: ${username}`);
            return NextResponse.json([], { status: 200 }); // Return empty array if no yields found
        }

         console.log(`GET /api/cropyields: Found ${yields.length} yields for username: ${username}`);
        return NextResponse.json(yields, { status: 200 });

    } catch (error) {
        console.error(`GET /api/cropyields: Error fetching yields for ${username}:`, error);
        // Log the specific error if possible, e.g., error.message
        return NextResponse.json({ error: 'Failed to fetch crop yields', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

// Handler for POST /api/cropyields
export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as NewYieldPayload;
        console.log("POST /api/cropyields: Received payload:", body);

        const { cropType, measurementDate, yieldPerAcre, username } = body;

        // --- Backend Validation ---
        if (!cropType || !measurementDate || !yieldPerAcre || !username) {
             console.error("POST /api/cropyields: Missing required fields in payload:", body);
            return NextResponse.json({ error: 'Missing required fields (cropType, measurementDate, yieldPerAcre, username)' }, { status: 400 });
        }

        const yieldValue = Number(yieldPerAcre);
        if (isNaN(yieldValue) || yieldValue <= 0) {
             console.error("POST /api/cropyields: Invalid yieldPerAcre value:", yieldPerAcre);
            return NextResponse.json({ error: 'Yield per Acre must be a positive number' }, { status: 400 });
        }

        // Potentially add more validation:
        // - Check if username exists in your users table
        // - Validate date format if necessary (though type="month" usually sends YYYY-MM)

        // Prepare data for the database function
        const yieldData = {
            cropType,
            measurementDate, // Ensure your DB stores this appropriately (Date or String)
            yieldPerAcre: yieldValue, // Store as number
            username // Or better, associate with a user ID if you have one
        };

        // Create yield using the (placeholder) database function
        console.log("POST /api/cropyields: Attempting to create yield with data:", yieldData);
        const newYieldRecord = await createYield(yieldData);
        console.log("POST /api/cropyields: Yield created successfully:", newYieldRecord);

        // Respond with the newly created yield record (or just a success message)
        return NextResponse.json(newYieldRecord, { status: 201 }); // 201 Created

    } catch (error) {
         console.error("POST /api/cropyields: Error creating yield:", error);
         let errorMessage = 'Failed to save crop yield';
         if (error instanceof SyntaxError) { // Handle JSON parsing errors specifically
             errorMessage = 'Invalid JSON payload';
             return NextResponse.json({ error: errorMessage }, { status: 400 });
         }
         if (error instanceof Error) {
            errorMessage = error.message; // Use specific error message if available
         }
        return NextResponse.json({ error: 'Failed to save crop yield', details: errorMessage }, { status: 500 });
    }
}

// Note: DELETE requests to /api/cropyields/{id} need a separate dynamic route file.
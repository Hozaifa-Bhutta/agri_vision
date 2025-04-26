// app/api/cropyields/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteYieldById } from '@/lib/db'; // Assuming this function exists

interface RouteContext {
    params: {
        id: string; // Next.js makes the dynamic segment available here
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const { id } = context.params;
    const yieldId = parseInt(id, 10);

    if (isNaN(yieldId)) {
        return NextResponse.json({ error: 'Invalid Yield ID format' }, { status: 400 });
    }

    try {
        await deleteYieldById(yieldId);
        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
        // Handle errors, e.g., record not found or database error
        console.error(`Error deleting yield ${yieldId}:`, error);
        return NextResponse.json({ error: 'Failed to delete crop yield' }, { status: 500 });
    }
}

// You could also add other methods here if needed, like:
// export async function GET(request: NextRequest, context: RouteContext) { ... } // To get a specific yield by ID
// export async function PUT(request: NextRequest, context: RouteContext) { ... } // To update a specific yield by ID
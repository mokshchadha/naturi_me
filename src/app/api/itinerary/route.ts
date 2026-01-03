import { NextRequest, NextResponse } from 'next/server';
import { generateGroundedItinerary, type ItineraryRequest } from '@/src/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const { destination, startingPoint, startDate, endDate, days, additionalPreferences } = body;
    
    if (!destination || !startingPoint || !startDate || !endDate || !days) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const itineraryRequest: ItineraryRequest = {
      destination,
      startingPoint,
      startDate,
      endDate,
      days,
      additionalPreferences,
    };

    // Generate itinerary using server-side API key
    const result = await generateGroundedItinerary(itineraryRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}
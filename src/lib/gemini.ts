import { GoogleGenAI } from '@google/genai';

export interface ItineraryRequest {
  destination: string;
  startingPoint: string;
  startDate: string;
  endDate: string;
  days: number;
  budget?: 'budget' | 'mid-range' | 'luxury';
  travelers?: number;
  additionalPreferences?: string;
}

export interface FlightOption {
  airline: string;
  price: string;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  bookingUrl: string;
  source: string;
}

export interface AccommodationOption {
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'resort';
  pricePerNight: string;
  rating?: number;
  amenities: string[];
  bookingUrl: string;
  source: string;
}

export interface ActivityOption {
  name: string;
  type: 'attraction' | 'tour' | 'restaurant' | 'entertainment';
  price?: string;
  duration?: string;
  rating?: number;
  description: string;
  bookingUrl?: string;
  source: string;
}

export interface TransportOption {
  type: 'train' | 'bus' | 'car-rental' | 'taxi';
  provider: string;
  price: string;
  bookingUrl: string;
  source: string;
}

export interface ItineraryResult {
  flights: FlightOption[];
  accommodations: AccommodationOption[];
  activities: ActivityOption[];
  localTransport: TransportOption[];
  dailyPlan: Array<{
    day: number;
    date: string;
    activities: string[];
  }>;
  estimatedBudget: {
    flights: string;
    accommodation: string;
    activities: string;
    food: string;
    transport: string;
    total: string;
  };
  travelTips: string[];
  sources: Array<{
    title?: string;
    url: string;
  }>;
  isGrounded: boolean;
  searchQueries?: string[];
  elapsedMs: number;
}

export function constructAggregatorPrompt(itinerary: ItineraryRequest): string {
  const { destination, startingPoint, startDate, endDate, days, budget, travelers, additionalPreferences } = itinerary;
  
  let prompt = `You are a travel aggregator assistant. Search for and compile ACTUAL, CURRENT options for flights, accommodations, and activities.

**Trip Details:**
- Destination: ${destination}
- Starting Point: ${startingPoint}
- Start Date: ${startDate}
- End Date: ${endDate}
- Duration: ${days} days
- Budget Level: ${budget || 'mid-range'}
- Number of Travelers: ${travelers || 1}

`;

  if (additionalPreferences) {
    prompt += `**Preferences:**
${additionalPreferences}

`;
  }

  prompt += `**IMPORTANT: Provide REAL, BOOKABLE OPTIONS with ACTUAL URLs**

Please search for and provide:

1. **FLIGHT OPTIONS (3-5 options)**
   For each flight, provide:
   - Airline name
   - Price (in USD or local currency)
   - Flight duration
   - Departure and arrival times
   - Direct booking URL (Kayak, Skyscanner, airline website, Google Flights, etc.)
   - Source website name

2. **ACCOMMODATION OPTIONS (5-7 options)**
   For each accommodation, provide:
   - Hotel/Property name
   - Type (hotel, hostel, apartment, resort)
   - Price per night
   - Star rating or review score
   - Key amenities (WiFi, breakfast, pool, etc.)
   - Booking URL (Booking.com, Airbnb, Hotels.com, Agoda, etc.)
   - Source website name

3. **ACTIVITY OPTIONS (8-10 options)**
   Include attractions, tours, restaurants, and entertainment:
   - Activity/Place name
   - Type (attraction, tour, restaurant, entertainment)
   - Price (if applicable)
   - Duration (if applicable)
   - Rating/reviews
   - Brief description
   - Booking/website URL (GetYourGuide, Viator, TripAdvisor, official websites, etc.)
   - Source website name

4. **LOCAL TRANSPORT OPTIONS (3-4 options)**
   - Train/Bus/Car rental services
   - Provider name
   - Approximate price
   - Booking URL
   - Source website name

5. **DAILY ITINERARY SUGGESTIONS**
   For each of the ${days} days, suggest activities from the list above

6. **BUDGET BREAKDOWN**
   Estimated costs for flights, accommodation, activities, food, and transport

7. **TRAVEL TIPS**
   Current travel requirements, best times to visit, local customs, safety tips

**FORMAT YOUR RESPONSE AS JSON** with this structure:
{
  "flights": [{"airline": "", "price": "", "duration": "", "departureTime": "", "arrivalTime": "", "bookingUrl": "", "source": ""}],
  "accommodations": [{"name": "", "type": "", "pricePerNight": "", "rating": 0, "amenities": [], "bookingUrl": "", "source": ""}],
  "activities": [{"name": "", "type": "", "price": "", "duration": "", "rating": 0, "description": "", "bookingUrl": "", "source": ""}],
  "localTransport": [{"type": "", "provider": "", "price": "", "bookingUrl": "", "source": ""}],
  "dailyPlan": [{"day": 1, "date": "", "activities": []}],
  "estimatedBudget": {"flights": "", "accommodation": "", "activities": "", "food": "", "transport": "", "total": ""},
  "travelTips": []
}

CRITICAL: 
- Search for REAL booking platforms and include ACTUAL URLs
- Use current prices and availability
- Prioritize popular, trusted booking platforms
- Include a variety of options at different price points`;

  return prompt;
}

interface GroundingChunk {
  web: {
    title?: string;
    uri: string;
  }
}

interface GroundingMetaData {
  groundingChunks?: Array<GroundingChunk>;
  webSearchQueries?: string[];
}

export function extractSources(groundingMetadata?: GroundingMetaData): Array<{ title?: string; url: string }> {
  if (!groundingMetadata?.groundingChunks) return [];
  
  const sources = groundingMetadata.groundingChunks
    .filter((chunk) => chunk.web?.uri)
    .map((chunk) => ({
      title: chunk.web?.title,
      url: chunk.web.uri,
    }));
  
  const uniqueSources = Array.from(
    new Map(sources.map((source) => [source.url, source])).values()
  );
  
  return uniqueSources;
}

function parseJsonResponse(text: string): any {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.warn('Failed to parse JSON from code block');
    }
  }
  
  // Try to parse the entire text as JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Failed to parse entire response as JSON');
  }
  
  // If parsing fails, return a default structure
  return null;
}

export async function generateGroundedItinerary(
  itinerary: ItineraryRequest,
  apiKey?: string
): Promise<ItineraryResult> {
  const startTime = Date.now();
  
  const ai = new GoogleGenAI({
    apiKey: apiKey || "AIzaSyDloaJMeogArnjIII_gBomvohaaF9yZgbo",
  });
  
  const prompt = constructAggregatorPrompt(itinerary);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.5, // Lower temperature for more factual responses
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
    
    const elapsedMs = Date.now() - startTime;
    const text = response.text || '';
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetaData | undefined;
    const isGrounded = !!groundingMetadata;
    const sources = extractSources(groundingMetadata);
    const searchQueries = groundingMetadata?.webSearchQueries || [];
    
    // Parse the JSON response
    const parsedData = parseJsonResponse(text);
    
    if (parsedData) {
      return {
        flights: parsedData.flights || [],
        accommodations: parsedData.accommodations || [],
        activities: parsedData.activities || [],
        localTransport: parsedData.localTransport || [],
        dailyPlan: parsedData.dailyPlan || [],
        estimatedBudget: parsedData.estimatedBudget || {
          flights: 'N/A',
          accommodation: 'N/A',
          activities: 'N/A',
          food: 'N/A',
          transport: 'N/A',
          total: 'N/A',
        },
        travelTips: parsedData.travelTips || [],
        sources,
        isGrounded,
        searchQueries,
        elapsedMs,
      };
    } else {
      // Fallback: return the text response with empty arrays
      return {
        flights: [],
        accommodations: [],
        activities: [],
        localTransport: [],
        dailyPlan: [],
        estimatedBudget: {
          flights: 'N/A',
          accommodation: 'N/A',
          activities: 'N/A',
          food: 'N/A',
          transport: 'N/A',
          total: 'N/A',
        },
        travelTips: [text],
        sources,
        isGrounded,
        searchQueries,
        elapsedMs,
      };
    }
  } catch (error) {
    throw new Error(
      `Failed to generate travel options: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Helper function to format the results for display
export function formatTravelOptions(result: ItineraryResult): string {
  let output = '# Travel Options\n\n';
  
  // Flights
  if (result.flights.length > 0) {
    output += '## ✈️ Flight Options\n\n';
    result.flights.forEach((flight, index) => {
      output += `### Option ${index + 1}: ${flight.airline}\n`;
      output += `- **Price:** ${flight.price}\n`;
      output += `- **Duration:** ${flight.duration}\n`;
      output += `- **Departure:** ${flight.departureTime}\n`;
      output += `- **Arrival:** ${flight.arrivalTime}\n`;
      output += `- **[Book Now](${flight.bookingUrl})** (via ${flight.source})\n\n`;
    });
  }
  
  // Accommodations
  if (result.accommodations.length > 0) {
    output += '## 🏨 Accommodation Options\n\n';
    result.accommodations.forEach((acc, index) => {
      output += `### ${index + 1}. ${acc.name}\n`;
      output += `- **Type:** ${acc.type}\n`;
      output += `- **Price:** ${acc.pricePerNight}/night\n`;
      if (acc.rating) output += `- **Rating:** ${acc.rating}⭐\n`;
      output += `- **Amenities:** ${acc.amenities.join(', ')}\n`;
      output += `- **[Book Now](${acc.bookingUrl})** (via ${acc.source})\n\n`;
    });
  }
  
  // Activities
  if (result.activities.length > 0) {
    output += '## 🎯 Activities & Attractions\n\n';
    result.activities.forEach((activity, index) => {
      output += `### ${index + 1}. ${activity.name}\n`;
      output += `- **Type:** ${activity.type}\n`;
      output += `- **Description:** ${activity.description}\n`;
      if (activity.price) output += `- **Price:** ${activity.price}\n`;
      if (activity.rating) output += `- **Rating:** ${activity.rating}⭐\n`;
      if (activity.bookingUrl) output += `- **[Book/Info](${activity.bookingUrl})** (via ${activity.source})\n`;
      output += '\n';
    });
  }
  
  // Budget
  output += '## 💰 Estimated Budget\n\n';
  output += `- Flights: ${result.estimatedBudget.flights}\n`;
  output += `- Accommodation: ${result.estimatedBudget.accommodation}\n`;
  output += `- Activities: ${result.estimatedBudget.activities}\n`;
  output += `- Food: ${result.estimatedBudget.food}\n`;
  output += `- Transport: ${result.estimatedBudget.transport}\n`;
  output += `- **Total: ${result.estimatedBudget.total}**\n\n`;
  
  return output;
}
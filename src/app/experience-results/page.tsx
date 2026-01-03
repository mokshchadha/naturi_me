"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Loader2, Download, ExternalLink } from "lucide-react";
import type { ItineraryResult, ItineraryRequest } from "../../lib/gemini";

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ItineraryResult | null>(null);
  const [experienceData, setExperienceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        // Get data from sessionStorage
        const experienceInfo = sessionStorage.getItem('experienceInfo');
        const itineraryRequest = sessionStorage.getItem('itineraryRequest');

        if (!experienceInfo || !itineraryRequest) {
          // No data found, redirect back to experiences
          router.push('/experiences');
          return;
        }

        const parsedExperience = JSON.parse(experienceInfo);
        const parsedRequest: ItineraryRequest = JSON.parse(itineraryRequest);

        setExperienceData(parsedExperience);

        // Make API call
        const response = await fetch('/api/itinerary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedRequest),
        });

        if (!response.ok) {
          throw new Error('Failed to generate itinerary');
        }

        const data: ItineraryResult = await response.json();
        setResults(data);

        // Clear sessionStorage after successful fetch
        sessionStorage.removeItem('experienceInfo');
        sessionStorage.removeItem('itineraryRequest');
      } catch (err) {
        console.error('Error generating itinerary:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate itinerary');
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [router]);

  const formatItineraryForDownload = () => {
    if (!results) return '';
    
    let output = `${experienceData?.name || 'Travel'} Itinerary\n`;
    output += `${experienceData?.location || ''}\n`;
    output += `Generated: ${new Date().toLocaleDateString()}\n`;
    output += '='.repeat(50) + '\n\n';

    // Flights
    if (results.flights && results.flights.length > 0) {
      output += 'FLIGHT OPTIONS\n' + '-'.repeat(50) + '\n';
      results.flights.forEach((flight, index) => {
        output += `\n${index + 1}. ${flight.airline}\n`;
        output += `   Price: ${flight.price}\n`;
        output += `   Duration: ${flight.duration}\n`;
        output += `   Departure: ${flight.departureTime}\n`;
        output += `   Arrival: ${flight.arrivalTime}\n`;
        output += `   Book: ${flight.bookingUrl}\n`;
      });
      output += '\n';
    }

    // Accommodations
    if (results.accommodations && results.accommodations.length > 0) {
      output += '\nACCOMMODATIONS\n' + '-'.repeat(50) + '\n';
      results.accommodations.forEach((acc, index) => {
        output += `\n${index + 1}. ${acc.name} (${acc.type})\n`;
        output += `   Price: ${acc.pricePerNight}/night\n`;
        if (acc.rating) output += `   Rating: ${acc.rating}⭐\n`;
        output += `   Amenities: ${acc.amenities.join(', ')}\n`;
        output += `   Book: ${acc.bookingUrl}\n`;
      });
      output += '\n';
    }

    // Activities
    if (results.activities && results.activities.length > 0) {
      output += '\nACTIVITIES & ATTRACTIONS\n' + '-'.repeat(50) + '\n';
      results.activities.forEach((activity, index) => {
        output += `\n${index + 1}. ${activity.name} (${activity.type})\n`;
        output += `   ${activity.description}\n`;
        if (activity.price) output += `   Price: ${activity.price}\n`;
        if (activity.rating) output += `   Rating: ${activity.rating}⭐\n`;
        if (activity.bookingUrl) output += `   Info: ${activity.bookingUrl}\n`;
      });
      output += '\n';
    }

    // Local Transport
    if (results.localTransport && results.localTransport.length > 0) {
      output += '\nLOCAL TRANSPORT OPTIONS\n' + '-'.repeat(50) + '\n';
      results.localTransport.forEach((transport, index) => {
        output += `\n${index + 1}. ${transport.provider} (${transport.type})\n`;
        output += `   Price: ${transport.price}\n`;
        output += `   Book: ${transport.bookingUrl}\n`;
      });
      output += '\n';
    }

    // Daily Plan
    if (results.dailyPlan && results.dailyPlan.length > 0) {
      output += '\nDAILY ITINERARY\n' + '-'.repeat(50) + '\n';
      results.dailyPlan.forEach((day) => {
        output += `\nDay ${day.day} - ${day.date}\n`;
        day.activities.forEach((activity, index) => {
          output += `  ${index + 1}. ${activity}\n`;
        });
      });
      output += '\n';
    }

    // Budget
    if (results.estimatedBudget) {
      output += '\nESTIMATED BUDGET\n' + '-'.repeat(50) + '\n';
      output += `Flights: ${results.estimatedBudget.flights}\n`;
      output += `Accommodation: ${results.estimatedBudget.accommodation}\n`;
      output += `Activities: ${results.estimatedBudget.activities}\n`;
      output += `Food: ${results.estimatedBudget.food}\n`;
      output += `Transport: ${results.estimatedBudget.transport}\n`;
      output += `TOTAL: ${results.estimatedBudget.total}\n\n`;
    }

    // Travel Tips
    if (results.travelTips && results.travelTips.length > 0) {
      output += '\nTRAVEL TIPS\n' + '-'.repeat(50) + '\n';
      results.travelTips.forEach((tip, index) => {
        output += `${index + 1}. ${tip}\n`;
      });
    }

    return output;
  };

  const handleDownload = () => {
    if (!results) return;
    const content = formatItineraryForDownload();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${experienceData?.name || "itinerary"}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-green mb-2">
            Crafting Your Perfect Itinerary
          </h2>
          <p className="text-light-text dark:text-dark-text">
            {experienceData?.name && `Planning your ${experienceData.name} adventure...`}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-light-text dark:text-dark-text mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push("/experiences")}
            className="px-6 py-3 bg-primary-orange text-white rounded-lg font-semibold hover:bg-primary-orange/90 transition-colors"
          >
            Back to Experiences
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-light-text dark:text-dark-text mb-4">
            No results found
          </p>
          <button
            onClick={() => router.push("/experiences")}
            className="px-6 py-3 bg-primary-orange text-white rounded-lg font-semibold hover:bg-primary-orange/90 transition-colors"
          >
            Back to Experiences
          </button>
        </div>
      </div>
    );
  }

  const hasData = 
    (results.flights && results.flights.length > 0) ||
    (results.accommodations && results.accommodations.length > 0) ||
    (results.activities && results.activities.length > 0) ||
    (results.travelTips && results.travelTips.length > 0);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/experiences")}
          className="flex items-center gap-2 text-primary-green hover:text-primary-green/80 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Experiences
        </button>

        <div className="bg-white dark:bg-dark-bg rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-green to-primary-green/80 p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              {experienceData?.image && (
                <span className="text-5xl">{experienceData.image}</span>
              )}
              <div>
                <h1 className="text-3xl font-bold">Your Custom Itinerary</h1>
                {experienceData && (
                  <p className="text-white/90 mt-1">
                    {experienceData.name} • {experienceData.location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" />
                <span>Generated in {results.elapsedMs}ms</span>
              </div>
              {results.isGrounded && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <span>✓</span>
                  <span>Verified with real-time data</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {results.searchQueries && results.searchQueries.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3">
                  Search Queries Used ({results.searchQueries.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.searchQueries.map((query, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full"
                    >
                      {query}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!hasData && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg text-center">
                <p className="text-yellow-800 dark:text-yellow-300">
                  Unable to generate detailed itinerary data. Please try again with different parameters.
                </p>
              </div>
            )}

            {/* Flights Section */}
            {results.flights && results.flights.length > 0 && (
              <div className="border border-primary-brown/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4 flex items-center gap-2">
                  ✈️ Flight Options ({results.flights.length})
                </h3>
                <div className="grid gap-4">
                  {results.flights.map((flight, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-primary-green">{flight.airline}</h4>
                        <span className="text-xl font-bold text-primary-orange">{flight.price}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Duration:</span>{" "}
                          <span className="font-semibold">{flight.duration}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Departure:</span>{" "}
                          <span className="font-semibold">{flight.departureTime}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Arrival:</span>{" "}
                          <span className="font-semibold">{flight.arrivalTime}</span>
                        </div>
                      </div>
                      <a
                        href={flight.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-orange hover:text-primary-orange/80 font-semibold text-sm"
                      >
                        Book on {flight.source} <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accommodations Section */}
            {results.accommodations && results.accommodations.length > 0 && (
              <div className="border border-primary-brown/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4 flex items-center gap-2">
                  🏨 Accommodations ({results.accommodations.length})
                </h3>
                <div className="grid gap-4">
                  {results.accommodations.map((acc, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-primary-green">{acc.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {acc.type}
                            {acc.rating && ` • ${acc.rating}⭐`}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-primary-orange">{acc.pricePerNight}</span>
                      </div>
                      {acc.amenities && acc.amenities.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Amenities:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {acc.amenities.map((amenity, i) => (
                              <span
                                key={i}
                                className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <a
                        href={acc.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-orange hover:text-primary-orange/80 font-semibold text-sm"
                      >
                        Book on {acc.source} <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities Section */}
            {results.activities && results.activities.length > 0 && (
              <div className="border border-primary-brown/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4 flex items-center gap-2">
                  🎯 Activities & Attractions ({results.activities.length})
                </h3>
                <div className="grid gap-4">
                  {results.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-primary-green">{activity.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {activity.type}
                            {activity.rating && ` • ${activity.rating}⭐`}
                            {activity.duration && ` • ${activity.duration}`}
                          </p>
                        </div>
                        {activity.price && (
                          <span className="text-lg font-bold text-primary-orange ml-2">{activity.price}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{activity.description}</p>
                      {activity.bookingUrl && (
                        <a
                          href={activity.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary-orange hover:text-primary-orange/80 font-semibold text-sm"
                        >
                          More info on {activity.source} <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local Transport Section */}
            {results.localTransport && results.localTransport.length > 0 && (
              <div className="border border-primary-brown/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4 flex items-center gap-2">
                  🚗 Local Transport ({results.localTransport.length})
                </h3>
                <div className="grid gap-3">
                  {results.localTransport.map((transport, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-primary-green">{transport.provider}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{transport.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-orange mb-1">{transport.price}</p>
                        <a
                          href={transport.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-orange hover:text-primary-orange/80"
                        >
                          Book <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Plan Section */}
            {results.dailyPlan && results.dailyPlan.length > 0 && (
              <div className="border border-primary-brown/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4 flex items-center gap-2">
                  📅 Daily Itinerary
                </h3>
                <div className="space-y-4">
                  {results.dailyPlan.map((day, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <h4 className="font-bold text-lg text-primary-green mb-2">
                        Day {day.day} - {day.date}
                      </h4>
                      <ul className="space-y-2">
                        {day.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="flex items-start gap-2 text-sm">
                            <span className="text-primary-orange font-bold">{actIndex + 1}.</span>
                            <span className="text-gray-700 dark:text-gray-300">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Section */}
            {results.estimatedBudget && (
              <div className="border border-primary-brown/20 rounded-lg p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                <h3 className="text-xl font-bold text-primary-green mb-4 flex items-center gap-2">
                  💰 Estimated Budget
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Flights</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{results.estimatedBudget.flights}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Accommodation</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{results.estimatedBudget.accommodation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Activities</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{results.estimatedBudget.activities}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Food</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{results.estimatedBudget.food}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transport</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{results.estimatedBudget.transport}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-primary-orange">{results.estimatedBudget.total}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Travel Tips Section */}
            {results.travelTips && results.travelTips.length > 0 && (
              <div className="border border-primary-brown/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4 flex items-center gap-2">
                  💡 Travel Tips
                </h3>
                <ul className="space-y-3">
                  {results.travelTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-orange text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm pt-0.5">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources Section */}
            {results.sources && results.sources.length > 0 && (
              <div className="border border-primary-brown/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-green mb-4">
                  Sources & References ({results.sources.length})
                </h3>
                <div className="grid gap-3">
                  {results.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-orange text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary-green group-hover:text-primary-orange transition-colors line-clamp-1">
                          {source.title || "View Source"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {source.url}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-orange transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-green hover:bg-primary-green/90 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Itinerary
              </button>
              <button
                onClick={() => router.push("/experiences")}
                className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Create New Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
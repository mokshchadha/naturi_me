"use client";

import { useState } from "react";
import ExperienceDialog from "../../components/ExperienceDialogue";
import type { ItineraryRequest, ItineraryResult } from "../../lib/gemini";

const experiences = [
  {
    id: 1,
    name: "Amazon Rainforest",
    location: "Brazil",
    description:
      "Discover the world's largest tropical rainforest with indigenous guides who have protected this land for generations.",
    image: "🌳",
    duration: "7 days",
    difficulty: "Moderate",
  },
  {
    id: 2,
    name: "Arctic Tundra",
    location: "Alaska, USA",
    description:
      "Experience the pristine wilderness of the Arctic with Inuit guardians who share their ancient connection to the land.",
    image: "❄️",
    duration: "5 days",
    difficulty: "Challenging",
  },
  {
    id: 3,
    name: "Australian Outback",
    location: "Australia",
    description:
      "Journey through sacred Aboriginal lands and learn traditional practices that have sustained this ecosystem for millennia.",
    image: "🦘",
    duration: "6 days",
    difficulty: "Moderate",
  },
  {
    id: 4,
    name: "Maori Sacred Forests",
    location: "New Zealand",
    description:
      "Walk through ancient forests with Maori guardians and experience their deep spiritual connection to nature.",
    image: "🌲",
    duration: "4 days",
    difficulty: "Easy",
  },
  {
    id: 5,
    name: "Andean Highlands",
    location: "Peru",
    description:
      "Explore high-altitude ecosystems with Quechua communities who maintain traditional agricultural practices.",
    image: "⛰️",
    duration: "8 days",
    difficulty: "Challenging",
  },
];

export default function ExperiencesPage() {
  const [selectedExperience, setSelectedExperience] = useState<typeof experiences[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExploreClick = (experience: typeof experiences[0]) => {
    setSelectedExperience(experience);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // Small delay before clearing to allow closing animation
    setTimeout(() => setSelectedExperience(null), 300);
  };

  const handleGenerateItinerary = async (
    request: ItineraryRequest
  ): Promise<ItineraryResult> => {
    // Call the API route
    const response = await fetch('/api/itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate itinerary');
    }

    return await response.json();
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary-green">
            Explore Experiences
          </h1>
          <p className="text-xl text-light-text dark:text-dark-text max-w-3xl mx-auto">
            Embark on transformative journeys guided by indigenous guardians who
            protect and preserve these sacred lands.
          </p>
        </div>

        {/* Experience Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((experience) => (
            <div
              key={experience.id}
              className="bg-white dark:bg-dark-bg border border-primary-brown/20 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image Placeholder */}
              <div className="bg-primary-green/10 dark:bg-primary-green/20 h-48 flex items-center justify-center text-8xl">
                {experience.image}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-primary-green">
                  {experience.name}
                </h3>
                <p className="text-sm text-primary-orange font-semibold mb-3">
                  📍 {experience.location}
                </p>
                <p className="text-light-text dark:text-dark-text mb-4">
                  {experience.description}
                </p>

                {/* Details */}
                <div className="flex gap-4 mb-4 text-sm">
                  <span className="bg-primary-brown/10 px-3 py-1 rounded-full">
                    ⏱️ {experience.duration}
                  </span>
                  <span className="bg-primary-orange/10 px-3 py-1 rounded-full">
                    🎯 {experience.difficulty}
                  </span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleExploreClick(experience)}
                  className="w-full bg-primary-orange hover:bg-primary-orange/90 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Explore More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-primary-green hover:bg-primary-green/90 text-white rounded-lg font-semibold transition-colors">
            Load More Experiences
          </button>
        </div>
      </div>

      {/* Experience Dialog */}
      <ExperienceDialog
        experience={selectedExperience}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onGenerateItinerary={handleGenerateItinerary}
      />
    </div>
  );
}
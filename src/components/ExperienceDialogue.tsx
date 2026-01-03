"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, MapPin} from "lucide-react";
import type { ItineraryRequest, ItineraryResult } from "../lib/gemini";

interface ExperienceDialogProps {
  experience: {
    id: number;
    name: string;
    location: string;
    description: string;
    image: string;
    duration: string;
    difficulty: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onGenerateItinerary: (request: ItineraryRequest) => Promise<ItineraryResult>;
}

export default function ExperienceDialog({
  experience,
  isOpen,
  onClose,
}: ExperienceDialogProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    startingPoint: "",
    startDate: "",
    endDate: "",
    additionalPreferences: "",
  });
  const [error, setError] = useState<string>("");

  if (!isOpen || !experience) return null;

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.startingPoint || !formData.startDate || !formData.endDate) {
      setError("Please fill in all required fields");
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    if (days < 1) {
      setError("End date must be after start date");
      return;
    }

    // Store experience info and request data in sessionStorage before redirect
    const experienceInfo = {
      name: experience.name,
      location: experience.location,
      image: experience.image,
    };

    const requestData = {
      destination: experience.location,
      startingPoint: formData.startingPoint,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days,
      additionalPreferences: formData.additionalPreferences || undefined,
    };

    sessionStorage.setItem('experienceInfo', JSON.stringify(experienceInfo));
    sessionStorage.setItem('itineraryRequest', JSON.stringify(requestData));

    // Redirect immediately to results page (it will show loader and make API call)
    router.push('/experience-results');
  };

  const handleClose = () => {
    setFormData({
      startingPoint: "",
      startDate: "",
      endDate: "",
      additionalPreferences: "",
    });
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-primary-brown/20">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{experience.image}</span>
            <div>
              <h2 className="text-2xl font-bold text-primary-green">
                {experience.name}
              </h2>
              <p className="text-sm text-primary-orange">📍 {experience.location}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-light-text mb-6">
                {experience.description}
              </p>
              <div className="flex gap-4 text-sm mb-6">
                <span className="bg-primary-brown/10 px-3 py-1 rounded-full">
                  ⏱️ {experience.duration}
                </span>
                <span className="bg-primary-orange/10 px-3 py-1 rounded-full">
                  🎯 {experience.difficulty}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-light-text">
                <MapPin className="w-4 h-4 inline mr-2" />
                Starting Point *
              </label>
              <input
                type="text"
                value={formData.startingPoint}
                onChange={(e) =>
                  setFormData({ ...formData, startingPoint: e.target.value })
                }
                placeholder="e.g., New York, USA"
                className="w-full px-4 py-3 border border-primary-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-light-text">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-primary-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-light-text">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-primary-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  required
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="bg-primary-green/10 px-4 py-3 rounded-lg">
                <p className="text-sm font-semibold text-primary-green">
                  Trip Duration: {calculateDays(formData.startDate, formData.endDate)} days
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-light-text">
                Additional Preferences (Optional)
              </label>
              <textarea
                value={formData.additionalPreferences}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalPreferences: e.target.value,
                  })
                }
                placeholder="e.g., budget range, dietary restrictions, interests, accessibility needs..."
                rows={4}
                className="w-full px-4 py-3 border border-primary-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-orange hover:bg-primary-orange/90 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Generate Itinerary
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
const guardians = [
  {
    id: 1,
    name: "Tupã Silva",
    tribe: "Yanomami",
    location: "Amazon Rainforest, Brazil",
    description:
      "Tupã has dedicated his life to protecting 500,000 hectares of pristine rainforest and educating visitors about traditional medicine and sustainable forest management.",
    verified: true,
    image: "👨",
    landArea: "500,000 hectares",
    yearsActive: "25 years",
  },
  {
    id: 2,
    name: "Ahnah Malik",
    tribe: "Inuit",
    location: "Arctic Circle, Alaska",
    description:
      "Ahnah works to preserve Arctic ecosystems and shares traditional hunting practices that maintain the delicate balance of northern wildlife populations.",
    verified: true,
    image: "👩",
    landArea: "200,000 hectares",
    yearsActive: "18 years",
  },
  {
    id: 3,
    name: "Wiremu Tane",
    tribe: "Māori",
    location: "North Island, New Zealand",
    description:
      "Wiremu is a kaitiaki (guardian) of sacred forests and waterways, teaching visitors about traditional conservation practices passed down through generations.",
    verified: true,
    image: "👨",
    landArea: "75,000 hectares",
    yearsActive: "30 years",
  },
  {
    id: 4,
    name: "Kaya Warburton",
    tribe: "Pitjantjatjara",
    location: "Central Australia",
    description:
      "Kaya protects sacred Aboriginal sites and shares Dreamtime stories while maintaining traditional fire management practices that prevent bushfires.",
    verified: true,
    image: "👩",
    landArea: "350,000 hectares",
    yearsActive: "22 years",
  },
  {
    id: 5,
    name: "Qori Amaru",
    tribe: "Quechua",
    location: "Andean Highlands, Peru",
    description:
      "Qori preserves ancient agricultural terraces and protects high-altitude ecosystems while teaching traditional farming methods adapted to climate change.",
    verified: true,
    image: "👨",
    landArea: "120,000 hectares",
    yearsActive: "15 years",
  },
  {
    id: 6,
    name: "Leila Kiprop",
    tribe: "Maasai",
    location: "East Africa, Kenya",
    description:
      "Leila works to protect wildlife corridors and sacred Maasai lands, balancing traditional pastoralism with modern conservation practices.",
    verified: true,
    image: "👩",
    landArea: "280,000 hectares",
    yearsActive: "20 years",
  },
];

export default function GuardiansPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-primary-green">
            Meet Our Guardians
          </h1>
          <p className="text-xl text-light-text dark:text-dark-text max-w-3xl mx-auto">
            Indigenous guardians protecting and preserving our planet&apos;s most
            precious ecosystems. Support their vital conservation work.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-primary-green/10 dark:bg-primary-green/20 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-green mb-2">
              1.5M+
            </div>
            <div className="text-sm text-light-text dark:text-dark-text">
              Hectares Protected
            </div>
          </div>
          <div className="bg-primary-orange/10 dark:bg-primary-orange/20 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-orange mb-2">
              100%
            </div>
            <div className="text-sm text-light-text dark:text-dark-text">
              Verified Guardians
            </div>
          </div>
          <div className="bg-primary-brown/10 dark:bg-primary-brown/20 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-brown mb-2">
              6
            </div>
            <div className="text-sm text-light-text dark:text-dark-text">
              Indigenous Communities
            </div>
          </div>
          <div className="bg-primary-green/10 dark:bg-primary-green/20 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-green mb-2">
              20+
            </div>
            <div className="text-sm text-light-text dark:text-dark-text">
              Years Average Experience
            </div>
          </div>
        </div>

        {/* Guardian Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guardians.map((guardian) => (
            <div
              key={guardian.id}
              className="bg-white dark:bg-dark-bg border border-primary-brown/20 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Header with Avatar */}
              <div className="bg-gradient-to-br from-primary-green/20 to-primary-orange/20 p-6 text-center">
                <div className="text-7xl mb-3">{guardian.image}</div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-primary-green">
                    {guardian.name}
                  </h3>
                  {guardian.verified && (
                    <svg
                      className="w-6 h-6 text-primary-orange"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-primary-brown font-semibold">
                  {guardian.tribe}
                </p>
                <p className="text-sm text-light-text dark:text-dark-text">
                  📍 {guardian.location}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-light-text dark:text-dark-text mb-4">
                  {guardian.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-light-text dark:text-dark-text">
                      Land Protected:
                    </span>
                    <span className="font-semibold text-primary-green">
                      {guardian.landArea}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light-text dark:text-dark-text">
                      Experience:
                    </span>
                    <span className="font-semibold text-primary-orange">
                      {guardian.yearsActive}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-primary-orange hover:bg-primary-orange/90 text-white font-semibold py-3 rounded-lg transition-colors">
                  Contribute Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary-green/10 to-primary-orange/10 dark:from-primary-green/20 dark:to-primary-orange/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary-green">
            Support All Guardians
          </h2>
          <p className="text-lg text-light-text dark:text-dark-text mb-6 max-w-2xl mx-auto">
            Make a collective contribution to support all verified guardians and
            their conservation efforts across the globe.
          </p>
          <button className="px-8 py-4 bg-primary-green hover:bg-primary-green/90 text-white rounded-lg font-semibold text-lg transition-colors">
            Make a Collective Contribution
          </button>
        </div>
      </div>
    </div>
  );
}
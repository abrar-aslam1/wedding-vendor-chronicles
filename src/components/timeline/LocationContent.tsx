interface LocationContentProps {
  stateSlug?: string;
  citySlug?: string;
}

const LocationContent = ({ stateSlug, citySlug }: LocationContentProps) => {
  // Format state and city names for display
  const formatName = (slug?: string) => {
    if (!slug) return "";
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const stateName = formatName(stateSlug);
  const cityName = formatName(citySlug);
  const locationText = cityName && stateName ? `${cityName}, ${stateName}` : stateName;

  // Generate location-specific content
  const generateTitle = () => {
    if (cityName && stateName) {
      return `Wedding Timeline Generator for ${cityName}, ${stateName}`;
    } else if (stateName) {
      return `Wedding Timeline Generator for ${stateName}`;
    }
    return "";
  };

  const generateIntro = () => {
    if (cityName && stateName) {
      return `Planning a wedding in ${cityName}, ${stateName}? Our free wedding timeline generator helps you create a personalized planning schedule tailored to your ${cityName} wedding. From booking vendors to planning your rehearsal dinner, our tool will help you stay organized and on track for your special day.`;
    } else if (stateName) {
      return `Planning a wedding in ${stateName}? Our free wedding timeline generator helps you create a personalized planning schedule tailored to your ${stateName} wedding. From booking venues to sending invitations, our tool will help you stay organized and on track for your special day.`;
    }
    return "";
  };

  const generateLocationSpecificTips = () => {
    if (cityName && stateName) {
      return [
        `Consider ${cityName}'s local wedding venues when planning your timeline, as popular locations may require booking 12-18 months in advance.`,
        `${cityName} weather patterns can affect your wedding planning timeline. Be sure to account for seasonal considerations when scheduling outdoor events.`,
        `Local ${cityName} vendors may have specific availability windows, so our timeline generator helps you plan vendor bookings at the optimal time.`,
        `${cityName} has unique local traditions and requirements that our timeline generator takes into account for your wedding planning.`
      ];
    } else if (stateName) {
      return [
        `${stateName} wedding venues often have specific booking timelines that our generator helps you navigate.`,
        `Consider ${stateName}'s seasonal weather patterns when planning your wedding timeline.`,
        `${stateName} may have unique marriage license requirements that our timeline generator reminds you to address at the appropriate time.`,
        `Popular wedding vendors in ${stateName} may book up quickly, so our timeline helps you schedule vendor appointments at the optimal time.`
      ];
    }
    return [];
  };

  // Only render if we have a state
  if (!stateSlug) return null;

  const locationTips = generateLocationSpecificTips();

  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold text-wedding-primary mb-4">
        {generateTitle()}
      </h1>
      
      <p className="text-gray-600 mb-8">
        {generateIntro()}
      </p>
      
      {locationTips.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            {cityName ? `${cityName} Wedding Planning Tips` : `${stateName} Wedding Planning Tips`}
          </h2>
          
          <ul className="space-y-3">
            {locationTips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 font-bold mr-2">•</span>
                <span className="text-blue-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationContent;

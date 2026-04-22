import React, { useEffect, useState } from 'react';

const WelcomePage = () => {
  const [greeting, setGreeting] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const staffName = localStorage.getItem('name') || 'User';
    const capitalizedName =
      staffName.charAt(0).toUpperCase() + staffName.slice(1);
    setName(capitalizedName);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const getBackgroundColor = () => {
    if (greeting === 'Good Afternoon') return 'bg-[#FFF0E0]';
    return 'bg-[#CEE9F2]';
  };

  return (
    <div className="w-full mx-auto mt-4 px-4">
      <div className={`${getBackgroundColor()} rounded-xl shadow-xl p-4`}>
        {/* Desktop: divider exactly in middle */}
        <div className="hidden md:flex flex-row items-center justify-between gap-2">
          {/* Left side - takes equal width */}
          <div className="flex-1 text-left">
            <h1 className="text-3xl font-bold text-gray-800">{greeting}!</h1>
            <p className="text-gray-700 mt-1 text-xs">
              Welcome to our wellness platform, your guide towards better health, one step at a time.
            </p>
          </div>
          {/* Divider - now in middle because both sides are flex-1 */}
          <div className="w-px h-8 bg-gray-400 opacity-40"></div>
          {/* Right side - takes equal width, text right aligned */}
          <div className="flex-1 text-right">
            <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
          </div>
        </div>

        {/* Mobile: stacked (greeting → name → message) */}
        <div className="flex flex-col md:hidden gap-2">
          <h1 className="text-xl font-bold text-gray-800 text-center">{greeting}!</h1>
          <h2 className="text-lg font-semibold text-gray-800 text-center">{name}</h2>
          <p className="text-gray-700 text-xs text-center">
            Welcome to our wellness platform, your guide towards better health, one step at a time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
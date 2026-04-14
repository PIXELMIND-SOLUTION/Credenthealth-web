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

  return (
    <div className="w-full mx-auto mt-4 px-4">
      <div className="bg-[#F1E0CA] rounded-xl shadow-xl p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">

          {/* Greeting */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">
              {greeting}!
            </h1>
            <p className="text-gray-600 mt-1 text-xs">
              Welcome to our wellness platform, your guide towards better health, one step at a time.
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-gray-400 opacity-40 mx-2"></div>
          <div className="md:hidden w-12 h-px bg-gray-400 opacity-40"></div>

          {/* Name */}
          <div className="text-center md:text-right flex-1">
            <h2 className="text-lg md:text-2xl font-semibold text-gray-800">
              {name}
            </h2>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
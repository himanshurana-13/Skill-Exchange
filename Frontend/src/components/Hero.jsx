const Hero = () => {
  return (
    <section className="bg-black text-white text-center py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
        Exchange Skills, Grow Together
      </h1>
      <p className="mt-4 text-base sm:text-lg text-gray-400 max-w-lg mx-auto px-4">
        Join the community where professionals trade skills instead of money.
      </p>
      
      {/* Search Bar */}
      <div className="mt-6 flex items-center justify-center px-4">
        <input
          type="text"
          placeholder="Search skills..."
          className="bg-gray-800 text-white placeholder-gray-500 px-4 py-2 sm:py-3 rounded-lg w-full sm:w-80 outline-none focus:ring-2 focus:ring-white/20 transition-all"
        />
      </div>

      {/* Button */}
      <button className="mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
        Get Started
      </button>
    </section>
  );
};

export default Hero;

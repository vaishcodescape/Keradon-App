"use client";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-br from-[#0a0a0a] via-[#171717] to-[#23272f] opacity-90 blur-2xl" />
      {/* Main Content */}
      <div className="bg-black bg-opacity-80 rounded-3xl shadow-2xl p-12 max-w-3xl mx-auto text-center animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-slide-in">Welcome to <br />Keradon</h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">Navigate the vast ocean of data with our AI-powered search and visualization tool.</p>
        <button className="mt-4 px-8 py-3 bg-white text-black font-semibold rounded-full shadow hover:bg-gray-200 transition animate-fade-in">Get Started</button>
      </div>
    </div>
  );
}
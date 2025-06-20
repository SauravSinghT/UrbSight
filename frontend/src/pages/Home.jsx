import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6 text-center">Welcome to Urbsight</h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-xl text-center">
        Your trusted platform for registering and managing complaints across departments and regions efficiently.
      </p>
    </div>
  );
}

import React from 'react';

export const LandingLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Simplified Header */}
            <header className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="font-bold text-xl text-blue-600">BrandLogo</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Simplified Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} All Rights Reserved.
                    <div className="mt-2 space-x-4">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingLayout;

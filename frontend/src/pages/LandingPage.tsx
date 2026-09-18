import React from 'react';
import { Link } from 'react-router-dom';
import GoldCoinField from '../components/GoldCoinField';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* <GoldCoinField /> */}
      <div className="relative z-10">
        <h1 className="text-6xl font-display font-bold text-ink mb-6">
          Master Your Money, <br />
          <span className="text-accent">Master Your Life.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          Experience the premium way of tracking your expenses, managing assets,
          and analyzing your financial growth with Spendly.
        </p>
        <div className="flex gap-4">
          <Link to="/register" className="bg-ink text-paper px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-all">
            Get Started
          </Link>
          <Link to="/login" className="border border-slate-300 px-8 py-3 rounded-full font-medium hover:bg-slate-100 transition-all">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

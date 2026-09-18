import React from 'react';
import { motion } from 'framer-motion';

interface HaloCardProps {
  label: string;
  value: string;
  colorClass: string;
  children?: React.ReactNode;
}

const HaloCard: React.FC<HaloCardProps> = ({ label, value, colorClass, children }) => {
  return (
    <div className="relative group">
      {/* Breathing Halo Effect */}
      <motion.div
        className={`absolute -inset-1 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${colorClass.replace('bg-', 'bg-').replace('text-', 'bg-')}`}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
        <p className="text-sm text-slate-500 mb-1">{label}</p>
        <h2 className={`text-3xl font-display font-bold ${colorClass.split(' ')[1] || 'text-ink'}`}>
          {value}
        </h2>
        {children}
      </div>
    </div>
  );
};

export default HaloCard;

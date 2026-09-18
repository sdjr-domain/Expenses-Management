import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Coin {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const CoinGlide: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    // Generate a set of random coins
    const initialCoins = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage of screen width
      y: Math.random() * 100, // percentage of screen height
      size: Math.random() * 20 + 10, // 10px to 30px
      duration: Math.random() * 20 + 15, // 15s to 35s
      delay: Math.random() * 20, // 0s to 20s
    }));
    setCoins(initialCoins);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            className="absolute rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 shadow-lg border border-amber-200 opacity-30"
            style={{
              width: coin.size,
              height: coin.size,
            }}
            initial={{
              x: `${coin.x}%`,
              y: `${coin.y}%`,
              opacity: 0
            }}
            animate={{
              x: [`${coin.x}%`, `${Math.random() * 100}%`],
              y: [`${coin.y}%`, `${Math.random() * 100}%`],
              opacity: [0, 0.3, 0],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: coin.duration,
              repeat: Infinity,
              delay: coin.delay,
              ease: "linear",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CoinGlide;

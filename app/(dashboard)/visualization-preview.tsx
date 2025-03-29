'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, GitGraph, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

export function VisualizationPreview() {
  const [step, setStep] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cardTimer = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(cardTimer);
  }, []);

  const data = [
    { label: 'Jan', value: 60, color: 'bg-orange-400' },
    { label: 'Feb', value: 85, color: 'bg-orange-500' },
    { label: 'Mar', value: 45, color: 'bg-orange-300' },
    { label: 'Apr', value: 95, color: 'bg-orange-600' },
    { label: 'May', value: 70, color: 'bg-orange-400' },
  ];

  const cards = [
    {
      id: 'bar-chart',
      title: 'Bar Chart',
      icon: Wand2,
      color: 'orange',
      content: (
        <div className="absolute inset-0 flex items-end justify-center space-x-4 p-8">
          {data.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: step >= index ? `${item.value}%` : 0,
                opacity: step >= index ? 1 : 0,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`relative w-12 ${item.color} rounded-t-lg shadow-lg cursor-pointer`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: step >= index ? 1 : 0.8,
                  opacity: step >= index ? 1 : 0,
                }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600"
              >
                {item.label}
              </motion.div>
              
              {hoveredIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-orange-600/20 rounded-t-lg"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-2 py-1 rounded text-sm font-medium">
                    {item.value}%
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'mind-map',
      title: 'Mind Map',
      icon: GitGraph,
      color: 'blue',
      content: (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[300px] relative">
            {/* Root node */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-blue-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-center p-2 text-sm font-medium">
              Project Planning
            </div>

            {/* Main branches container */}
            <div className="absolute left-0 top-32 w-full">
              <div className="flex justify-between px-4">
                {/* Timeline branch */}
                <div className="flex flex-col items-center">
                  <div className="bg-blue-400 text-white rounded-lg p-2 text-center text-sm font-medium mb-2">
                    Timeline
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">Q1</div>
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">Q2</div>
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">Q3</div>
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">Q4</div>
                  </div>
                </div>

                {/* Resources branch */}
                <div className="flex flex-col items-center">
                  <div className="bg-blue-400 text-white rounded-lg p-2 text-center text-sm font-medium mb-2">
                    Resources
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">Team</div>
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">Budget</div>
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">Tools</div>
                  </div>
                </div>

                {/* Goals branch */}
                <div className="flex flex-col items-center">
                  <div className="bg-blue-400 text-white rounded-lg p-2 text-center text-sm font-medium mb-2">
                    Goals
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">MVP</div>
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">Features</div>
                    <div className="bg-blue-300 text-white rounded-lg p-1.5 text-center text-xs">Launch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'flowchart',
      title: 'Flowchart',
      icon: Share2,
      color: 'green',
      content: (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative w-full h-full">
            <div className="flex justify-between items-center h-full">
              <div className="flex flex-col items-center">
                <div className="bg-green-600 text-white rounded-lg p-3 text-center text-sm font-medium mb-4">
                  Start
                </div>
                <div className="w-full h-1 bg-green-300"></div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-green-500 text-white rounded-lg p-3 text-center text-sm font-medium mb-4">
                  User Input
                </div>
                <div className="w-full h-1 bg-green-300"></div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-green-500 text-white rounded-lg p-3 text-center text-sm font-medium mb-4">
                  Process Data
                </div>
                <div className="w-full h-1 bg-green-300"></div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-green-500 text-white rounded-lg p-3 text-center text-sm font-medium mb-4">
                  Generate Output
                </div>
                <div className="w-full h-1 bg-green-300"></div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-green-700 text-white rounded-lg p-3 text-center text-sm font-medium">
                  End
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const CurrentIcon = cards[currentCard].icon;

  return (
    <div className="relative w-full h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-full"
        >
          <div className={`relative w-full h-full bg-gradient-to-br from-${cards[currentCard].color}-50 to-${cards[currentCard].color}-100 rounded-xl shadow-xl overflow-hidden`}>
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            {cards[currentCard].content}

            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <CurrentIcon className={`w-5 h-5 text-${cards[currentCard].color}-500`} />
              <span className="text-sm font-medium text-gray-600">{cards[currentCard].title}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentCard((prev) => (prev - 1 + 3) % 3)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </button>
      <button
        onClick={() => setCurrentCard((prev) => (prev + 1) % 3)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  );
} 
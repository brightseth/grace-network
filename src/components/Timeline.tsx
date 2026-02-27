import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import '../styles/timeline.css';

interface TimelinePeriod {
  year: string;
  title: string;
  description: string;
  details: string[];
  quote?: string;
  context?: string;
}

const timelinePeriods: TimelinePeriod[] = [
  {
    year: "1980s",
    title: "Early Artistic Foundations",
    description: "My journey began in theater, performing in avant-garde productions at the American Repertory Theater. This early exposure to both performing arts and nascent computer technology created the foundation for my unique perspective on creativity and technology.",
    details: [
      "Performed in avant-garde productions at American Repertory Theater",
      "Cast by Robert Wilson in 'Civil WarS' at age 14",
      "Studied at Interlochen Arts Academy",
      "First exposure to computer graphics through father's work"
    ],
    quote: "When I was a kid in the late 70's, my dad worked as a quality assurance consultant for computer companies up and down Boston's Route 128. He tested new machines and software packages, looking for bugs. One night he brought me to his office at Applicon, an early CAD pioneer, and showed me a digital image of a bear. It was the first computer graphic I had ever seen.",
    context: "The 1980s marked a pivotal time in both personal computing and experimental theater. While the tech industry was developing the first personal computers, the avant-garde theater scene was pushing boundaries in multimedia performance."
  },
  {
    year: "1992",
    title: "Digital Art Pioneer",
    description: "After graduating from Columbia, I worked as Robert Wilson's archivist and conceived the Interactive Multimedia Archive Project (IMAP), one of the first attempts to document performing arts using CD-ROM technology.",
    details: [
      "Created Interactive Multimedia Archive Project (IMAP)",
      "Secured $50,000 grant for multimedia development",
      "Presented at Mediale Convention in Hamburg",
      "Artist in Residence at ZKM Karlsruhe"
    ],
    quote: "In 1992 had an idea of using CD-Rom technology to capture his creative process with the Interactive Multimedia Archive Project.",
    context: "The early 1990s saw the emergence of multimedia CD-ROMs as a new medium for artistic expression and documentation. This period bridged the gap between traditional arts and digital technology."
  },
  {
    year: "1995",
    title: "Internet Pioneer",
    description: "Founded SiteSpecific, one of the first interactive marketing agencies. The company quickly grew from my apartment to create innovative campaigns for major brands when internet marketing was still being defined.",
    details: [
      "Founded SiteSpecific at age 25",
      "Grew to $3M revenue in 18 months",
      "Featured in Harvard Business School case study",
      "Acquired by CKS Group for $12 million"
    ],
    quote: "It was really the glory years of the internet before it became overrun by MBAs and bankers and all sorts of mercenaries and opportunists. It was naïve and wonderful and it really felt like we were doing something original."
  },
  {
    year: "2002",
    title: "Data Innovation",
    description: "Co-founded Majestic Research, pioneering the use of alternative data for financial research. We developed methodologies to analyze web traffic and online consumer behavior for hedge fund insights.",
    details: [
      "Founded Majestic Research",
      "Served 200+ hedge fund clients",
      "Generated $40M+ annual revenue",
      "Acquired by ITG for $75M in 2010"
    ],
    quote: "In 2009-2010 we were selling $200,000 worth of research to over 200 different hedge funds."
  },
  {
    year: "2010",
    title: "Social Music Innovation",
    description: "Co-founded Turntable.fm, a revolutionary social music platform allowing users to DJ together in virtual rooms. The site exploded to 600,000 users within four months.",
    details: [
      "Co-founded Turntable.fm",
      "Reached 600,000 users in 4 months",
      "Secured $7M venture funding",
      "Pioneered social music experiences"
    ],
    quote: "Within like two or three months, Billy and another engineer finished the prototype. We then plugged in an integration with MediaNet so people could choose music from that library. It was clear early on there was something compelling about this way of listening to music."
  },
  {
    year: "2021",
    title: "Web3 & Digital Art",
    description: "Founded Bright Moments, a crypto art gallery organized as a DAO. We pioneered 'live minting' experiences where artists and collectors witness the generation of algorithmic art together in real time.",
    details: [
      "Founded Bright Moments DAO",
      "Pioneered live minting experiences",
      "Built global CryptoCitizens community",
      "Connected traditional and digital art worlds"
    ],
    quote: "What we stumbled onto is the special experience of a human being looking at a screen with other humans as a work of generative art is revealed for the first time. It's memorable because you're bringing something that is mathematically random into the real world."
  }
];

const Timeline = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (sliderRef.current?.offsetLeft || 0);
    scrollLeft.current = sliderPosition;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 2;
    const newPosition = Math.max(0, Math.min(100, scrollLeft.current + (walk / (sliderRef.current?.offsetWidth || 1)) * 100));
    setSliderPosition(newPosition);
    
    const index = Math.round((newPosition / 100) * (timelinePeriods.length - 1));
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMarkerClick = (index: number) => {
    setCurrentIndex(index);
    setSliderPosition((index / (timelinePeriods.length - 1)) * 100);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handleMarkerClick(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < timelinePeriods.length - 1) {
        handleMarkerClick(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return (
    <section className="bg-black text-white py-24 font-helvetica">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4"
      >
        {/* Timeline Slider */}
        <div className="max-w-4xl mx-auto mb-16">
          <div 
            ref={sliderRef}
            className="timeline-slider relative h-6 bg-gray-800 rounded-full cursor-pointer mb-12"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              handleMouseDown({ pageX: touch.pageX } as React.MouseEvent);
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              handleMouseMove({ pageX: touch.pageX, preventDefault: () => {} } as React.MouseEvent);
            }}
            onTouchEnd={handleMouseUp}
          >
            {/* Progress Bar */}
            <motion.div 
              className="absolute h-full bg-white rounded-full"
              style={{ width: `${sliderPosition}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* Slider Handle */}
            <motion.div
              className="timeline-handle absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
              style={{ left: `${sliderPosition}%`, marginLeft: "-20px" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* Year Markers */}
            {timelinePeriods.map((period, index) => (
              <div
                key={period.year}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${(index / (timelinePeriods.length - 1)) * 100}%` }}
              >
                <button
                  onClick={() => handleMarkerClick(index)}
                  className={`timeline-marker w-6 h-6 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-gray-600 hover:bg-gray-400'
                  }`}
                />
                <div className="absolute top-8 -translate-x-1/2 text-sm font-bold text-white">
                  {period.year}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white text-black p-8 border-4 border-white"
            >
              <h3 className="text-3xl font-black mb-6 uppercase tracking-tight">
                {timelinePeriods[currentIndex].title}
              </h3>
              
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                {timelinePeriods[currentIndex].description}
              </p>

              {timelinePeriods[currentIndex].quote && (
                <blockquote className="border-l-4 border-black pl-6 my-8 italic text-gray-600 text-lg">
                  "{timelinePeriods[currentIndex].quote}"
                </blockquote>
              )}

              <div className="space-y-4 mb-8">
                {timelinePeriods[currentIndex].details.map((detail, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-black flex-shrink-0" />
                    <p className="text-lg text-gray-600">{detail}</p>
                  </motion.div>
                ))}
              </div>

              {timelinePeriods[currentIndex].context && (
                <div className="bg-gray-50 p-6 border-2 border-black">
                  <h4 className="text-lg font-bold mb-3">Historical Context</h4>
                  <p className="text-gray-600">
                    {timelinePeriods[currentIndex].context}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 max-w-4xl mx-auto">
          <button
            onClick={() => handleMarkerClick(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-3 border-4 border-white text-white transition-all uppercase tracking-tight font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:text-black"
          >
            Previous
          </button>
          <button
            onClick={() => handleMarkerClick(Math.min(timelinePeriods.length - 1, currentIndex + 1))}
            disabled={currentIndex === timelinePeriods.length - 1}
            className="px-6 py-3 border-4 border-white text-white transition-all uppercase tracking-tight font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:text-black"
          >
            Next
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default Timeline;
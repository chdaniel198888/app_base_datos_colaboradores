'use client';

import React, { useRef, useState } from 'react';
import { Phone, MessageSquare } from 'lucide-react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onCall: () => void;
  onWhatsApp: () => void;
  hasPhone: boolean;
}

export function SwipeableCard({ children, onCall, onWhatsApp, hasPhone }: SwipeableCardProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swiped, setSwiped] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !hasPhone) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSwiped('left');
      setTimeout(() => {
        onWhatsApp();
        setSwiped(null);
      }, 200);
    } else if (isRightSwipe) {
      setSwiped('right');
      setTimeout(() => {
        onCall();
        setSwiped(null);
      }, 200);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background actions */}
      {hasPhone && (
        <>
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div className="absolute inset-y-0 right-0 w-20 bg-green-500 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
        </>
      )}
      
      {/* Swipeable card */}
      <div
        ref={cardRef}
        className={`relative bg-white transition-transform duration-200 ${
          swiped === 'left' ? '-translate-x-20' : 
          swiped === 'right' ? 'translate-x-20' : ''
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
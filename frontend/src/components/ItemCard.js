import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ItemCard = ({ item, onClick }) => {
  const categoryColors = {
    Electronics: 'bg-purple-100 text-purple-700',
    Accessories: 'bg-pink-100 text-pink-700',
    Documents: 'bg-blue-100 text-blue-700',
    Clothing: 'bg-green-100 text-green-700',
    Pets: 'bg-orange-100 text-orange-700',
    Other: 'bg-gray-100 text-gray-700'
  };

  return (
    <Card 
      className="item-card cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-lg bg-white"
      onClick={() => onClick(item)}
      data-testid={`item-card-${item.id}`}
    >
      {item.image_url && (
        <div className="w-full h-48 overflow-hidden bg-gray-100">
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-full h-full object-cover"
            data-testid="item-image"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900 flex-1" data-testid="item-title">
            {item.title}
          </h3>
          <span 
            className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[item.category] || categoryColors.Other}`}
            data-testid="item-category"
          >
            {item.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2" data-testid="item-description">
          {item.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1" data-testid="item-location">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </div>
          <div className="flex items-center gap-1" data-testid="item-date">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {item.date}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
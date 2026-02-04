import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ItemDetailModal = ({ item, isOpen, onClose, onDelete }) => {
  if (!item) return null;

  const categoryColors = {
    Electronics: 'bg-purple-100 text-purple-700',
    Accessories: 'bg-pink-100 text-pink-700',
    Documents: 'bg-blue-100 text-blue-700',
    Clothing: 'bg-green-100 text-green-700',
    Pets: 'bg-orange-100 text-orange-700',
    Other: 'bg-gray-100 text-gray-700'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="item-detail-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900" data-testid="modal-title">
            {item.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {item.image_url && (
            <div className="w-full rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={item.image_url} 
                alt={item.title}
                className="w-full object-contain max-h-96"
                data-testid="modal-image"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <span 
              className={`px-4 py-2 rounded-full text-sm font-medium ${categoryColors[item.category] || categoryColors.Other}`}
              data-testid="modal-category"
            >
              {item.category}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`} data-testid="modal-type">
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600" data-testid="modal-description">{item.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
                <p className="text-gray-600 flex items-center gap-2" data-testid="modal-location">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {item.location}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Date</h3>
                <p className="text-gray-600 flex items-center gap-2" data-testid="modal-date">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {item.date}
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700" data-testid="modal-contact-name">
                  <span className="font-medium">Name:</span> {item.owner_name}
                </p>
                <p className="text-gray-700" data-testid="modal-contact-email">
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${item.owner_email}`} className="text-indigo-600 hover:underline">
                    {item.owner_email}
                  </a>
                </p>
                {item.owner_phone && (
                  <p className="text-gray-700" data-testid="modal-contact-phone">
                    <span className="font-medium">Phone:</span> {item.owner_phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              className="flex-1 btn-primary"
              onClick={() => window.location.href = `mailto:${item.owner_email}`}
              data-testid="email-contact-button"
            >
              Email Contact
            </Button>
            {onDelete && (
              <Button 
                variant="destructive"
                onClick={() => onDelete(item.id)}
                data-testid="delete-button"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailModal;
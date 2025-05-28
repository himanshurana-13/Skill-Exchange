import React from 'react';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';

const ReviewsList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <img
                src={review.user.avatar || '/default-avatar.jpg'}
                alt={review.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {review.user.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} readonly size="sm" />
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewsList; 
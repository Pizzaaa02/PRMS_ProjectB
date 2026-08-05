import { useState } from 'react';
import { motion } from 'framer-motion';

const PLACEHOLDER_IMAGES = [
  'https://images.pexels.com/photos/190317/pexels-photo-190317.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3762750/pexels-photo-3762750.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/27876599/pexels-photo-27876599.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1648729/pexels-photo-1648729.jpeg?auto=compress&cs=tinysrgb&w=600',
];

function getImageUrl(img) {
  if (typeof img === 'string') return img;
  if (img && img.url) return img.url;
  if (img && img.path) return img.path;
  return '';
}

export default function ImageGallery({ images }) {
  const [mainIndex, setMainIndex] = useState(0);

  // Use actual images or fallback to placeholders
  const displayImages = (images && images.length > 0) ? images : PLACEHOLDER_IMAGES;
  const mainImage = getImageUrl(displayImages[0]) || PLACEHOLDER_IMAGES[0];
  const thumbnails = displayImages.slice(1, 5).map(img => getImageUrl(img));

  return (
    <div className="property-image-gallery">
      <div className="gallery-main">
        <motion.img
          src={mainImage}
          alt="Property"
          className="gallery-main-img"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onMouseEnter={() => setMainIndex(0)}
        />
      </div>
      <div className="gallery-thumbnails">
        {thumbnails.map((thumb, idx) => (
          <motion.div
            key={idx}
            className="gallery-thumb"
            whileHover={{ scale: 1.02 }}
            onMouseEnter={() => setMainIndex(idx + 1)}
          >
            <img src={thumb} alt={`View ${idx + 1}`} className="gallery-thumb-img" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

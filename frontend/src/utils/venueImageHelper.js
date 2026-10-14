// Luxury Venue Image Helper & Presets

export const VENUE_IMAGE_PRESETS = [
  { id: 'ballroom', name: 'Grand Ballroom', url: '/images/1THqxCvzczAoxUo3stl2WHdh2J8.jpg' },
  { id: 'crystal', name: 'Crystal Hall', url: '/images/otheu92Jc5IozZNuTf3fCy7Vuw.jpg' },
  { id: 'garden', name: 'Scenic Garden', url: '/images/7XSFnDdyalIKrmybn08imC7wVM.jpg' },
  { id: 'ocean', name: 'Oceanside Terrace', url: '/images/vWlGGLjrgzzuaKI8l7MaYdycBjw.jpg' },
  { id: 'rooftop', name: 'Skyline Observatory', url: '/images/DAQgxCoS0XtGtOP1VssAJEcrMmg.jpg' },
  { id: 'courtyard', name: 'Lotus Courtyard', url: '/images/clZkgAuVCvp7qzePBQr7fuFgc.jpg' },
  { id: 'palatial', name: 'Heritage Palace', url: '/images/6vMlkGhDIzZhPxWTYXIn7aksXQ.jpg' },
  { id: 'executive', name: 'Executive Lounge', url: '/images/FS00BVcSeFCubwtBpYsv1NiBLnw.jpg' },
];

const LOCAL_STORAGE_KEY = 'grandstay_venue_images';

export const getLocalVenueImages = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

export const saveLocalVenueImage = (venueId, imageUrl) => {
  if (!venueId) return;
  try {
    const map = getLocalVenueImages();
    if (imageUrl) {
      map[venueId] = imageUrl;
    } else {
      delete map[venueId];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(map));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('grandstay_venue_image_updated', { detail: { venueId, imageUrl } }));
    }
  } catch (e) {
    console.warn('Failed to save local venue image:', e);
  }
};

/**
 * Extracts any embedded image tag from description string and resolves final imageUrl
 */
export const parseVenueData = (venue, index = 0) => {
  if (!venue) {
    return {
      imageUrl: VENUE_IMAGE_PRESETS[0].url,
      cleanDescription: ''
    };
  }

  let rawDesc = venue.description || '';
  let embeddedImg = '';

  // Check for [img:URL] or <!--img:URL--> pattern
  const bracketMatch = rawDesc.match(/\[img:\s*([^\]]+)\]/i);
  if (bracketMatch) {
    embeddedImg = bracketMatch[1].trim();
    rawDesc = rawDesc.replace(bracketMatch[0], '').trim();
  } else {
    const htmlCommentMatch = rawDesc.match(/<!--img:\s*([^>]+)-->/i);
    if (htmlCommentMatch) {
      embeddedImg = htmlCommentMatch[1].trim();
      rawDesc = rawDesc.replace(htmlCommentMatch[0], '').trim();
    }
  }

  // Priority: 1) explicit property, 2) embedded in description, 3) localStorage cache, 4) preset fallback
  const localMap = getLocalVenueImages();
  const localImg = venue.id ? localMap[venue.id] : null;

  const resolvedImage = venue.imageUrl || embeddedImg || localImg || VENUE_IMAGE_PRESETS[index % VENUE_IMAGE_PRESETS.length].url;

  return {
    imageUrl: resolvedImage,
    cleanDescription: rawDesc
  };
};

/**
 * Formats description text with image metadata tag for persistent storage
 */
export const formatVenueDescription = (cleanDescription, imageUrl) => {
  const desc = (cleanDescription || '').trim();
  if (!imageUrl || !imageUrl.trim()) {
    return desc;
  }
  return `[img:${imageUrl.trim()}] ${desc}`.trim();
};

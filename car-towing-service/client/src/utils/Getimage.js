// Eagerly scans every image under src/assets/images/** at build time.
// This means you can just DROP a new photo into a subfolder with the
// right filename and it shows up automatically - no code changes needed.
const allImages = import.meta.glob('../assets/images/**/*.{jpg,jpeg,png,webp,JPG,PNG}', {
  eager: true,
  import: 'default',
});

/**
 * getImage('fleet', 'motorcycle')  ->  looks for
 * src/assets/images/fleet/motorcycle.jpg (or .png/.webp/etc)
 *
 * getImage('services', 'emergency-towing')  ->  looks for
 * src/assets/images/services/emergency-towing.jpg
 *
 * Returns null if the photo hasn't been added yet, so the calling
 * component can fall back to an icon or a placeholder image instead
 * of crashing the build.
 */
export const getImage = (folder, slug) => {
  const match = Object.entries(allImages).find(([path]) =>
    path.includes(`/assets/images/${folder}/${slug}.`)
  );
  return match ? match[1] : null;
};
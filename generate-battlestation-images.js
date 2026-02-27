import * as fal from '@fal-ai/serverless-client';
import fs from 'fs';
import path from 'path';

// Configure FAL
fal.config({
  credentials: '72df9244-e302-4572-bbd3-364abd610155:edf011f9ea3f955f7f09370632575b6c'
});

const OUTPUT_DIR = './public/images/battlestation';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Style prompt suffix for Nano Banana Pro / Swiss minimal aesthetic
const STYLE = `
Minimalist technical illustration style.
Clean lines, isometric perspective, muted color palette with subtle blue accents.
Dark charcoal background (#0A0A0A), white and gray tones, single accent color (#6B8FFF).
No text, no labels. Bauhaus-inspired, Swiss design principles.
Professional product photography aesthetic, soft studio lighting.
High contrast, sharp details, premium feel.
`;

const images = [
  {
    name: 'hero-setup',
    prompt: `A premium home office battlestation setup viewed from above at 45 degrees.
    Mac Studio (silver aluminum cube) connected to a large curved ultrawide monitor.
    Mechanical keyboard and mouse on a clean dark wood desk.
    Minimal, organized, no clutter. Single desk plant.
    ${STYLE}`
  },
  {
    name: 'mac-studio',
    prompt: `Apple Mac Studio computer, silver aluminum square form factor.
    Product shot on dark background, studio lighting.
    Showing the elegant minimal design, ports visible on back.
    ${STYLE}`
  },
  {
    name: 'ultrawide-monitor',
    prompt: `40-inch curved ultrawide monitor displaying code editor with dark theme.
    Three panels visible: terminal on left, code in center, browser on right.
    Mounted on monitor arm, floating above desk.
    ${STYLE}`
  },
  {
    name: 'keyboard-mouse',
    prompt: `Premium mechanical keyboard with dark keycaps next to ergonomic mouse.
    Bird's eye view on dark desk mat.
    Subtle RGB glow, professional aesthetic.
    ${STYLE}`
  },
  {
    name: 'full-battlestation',
    prompt: `Complete developer battlestation: curved ultrawide monitor, Mac Studio,
    mechanical keyboard, ergonomic chair (Herman Miller Aeron style), standing desk.
    Ambient lighting, plants, minimal decoration.
    Professional home office, dark moody atmosphere.
    ${STYLE}`
  },
  {
    name: 'insane-setup',
    prompt: `Extreme multi-monitor developer setup with three large displays in a row.
    Mac Pro tower underneath, premium chair, RGB ambient lighting.
    Server rack visible in background. Espresso machine on side table.
    Luxurious home office, command center vibes.
    ${STYLE}`
  }
];

async function generateImage(item) {
  console.log(`Generating: ${item.name}...`);

  try {
    const result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
      input: {
        prompt: item.prompt,
        image_size: 'landscape_16_9',
        num_images: 1,
        enable_safety_checker: false
      }
    });

    if (result.images && result.images[0]) {
      const imageUrl = result.images[0].url;

      // Download image
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const outputPath = path.join(OUTPUT_DIR, `${item.name}.jpg`);
      fs.writeFileSync(outputPath, Buffer.from(buffer));

      console.log(`✓ Saved: ${outputPath}`);
      return outputPath;
    }
  } catch (error) {
    console.error(`✗ Failed ${item.name}:`, error.message);
  }

  return null;
}

async function main() {
  console.log('Generating battlestation illustrations...\n');

  const results = [];
  for (const item of images) {
    const path = await generateImage(item);
    if (path) results.push({ name: item.name, path });
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n--- Complete ---');
  console.log(`Generated ${results.length}/${images.length} images`);
  console.log('Images saved to:', OUTPUT_DIR);
}

main();

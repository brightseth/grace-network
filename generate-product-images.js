import * as fal from '@fal-ai/serverless-client';
import fs from 'fs';
import path from 'path';

// Configure FAL
fal.config({
  credentials: '72df9244-e302-4572-bbd3-364abd610155:edf011f9ea3f955f7f09370632575b6c'
});

const OUTPUT_DIR = './public/images/battlestation/products';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Style prompt suffix for product photography
const STYLE = `
Professional product photography on dark charcoal background (#0A0A0A).
Studio lighting, soft shadows, premium feel.
Clean, minimal, high-end tech aesthetic.
Sharp details, accurate product representation.
No text, no labels, no watermarks.
`;

const products = [
  // Compute
  {
    name: 'mac-studio-m4',
    prompt: `Apple Mac Studio M4 Max computer, silver brushed aluminum square form factor.
    The distinctive round thermal pattern on top visible.
    Premium desktop workstation, compact cube design.
    Ports visible on back: Thunderbolt, USB-C, HDMI, Ethernet.
    ${STYLE}`
  },
  {
    name: 'mac-mini-m4',
    prompt: `Apple Mac Mini M4, smaller silver aluminum square design.
    Compact form factor, even smaller than Mac Studio.
    Modern 2024 design with rounded edges.
    ${STYLE}`
  },
  {
    name: 'macbook-pro-16',
    prompt: `Apple MacBook Pro 16-inch laptop, space gray, lid partially open.
    Showing the thin profile and premium aluminum build.
    Keyboard with Touch Bar visible, large trackpad.
    ${STYLE}`
  },

  // Displays
  {
    name: 'lg-ultrawide-40',
    prompt: `LG 40-inch curved ultrawide monitor, 5K2K resolution display.
    Showing code editor with dark theme on screen.
    Thin bezels, modern stand, professional monitor.
    The curve of the ultrawide panel visible.
    ${STYLE}`
  },
  {
    name: 'apple-studio-display',
    prompt: `Apple Studio Display 27-inch monitor, silver aluminum frame.
    5K Retina display, thin bezels, iconic Apple design.
    Tilt-adjustable aluminum stand.
    ${STYLE}`
  },
  {
    name: 'samsung-viewfinity',
    prompt: `Samsung ViewFinity S9 5K monitor, modern thin design.
    Matte display coating, slim bezels, elegant stand.
    Professional creative monitor.
    ${STYLE}`
  },
  {
    name: 'pro-display-xdr',
    prompt: `Apple Pro Display XDR 32-inch, space gray aluminum.
    Premium professional reference monitor.
    Distinctive lattice pattern on back for cooling.
    ${STYLE}`
  },

  // Input
  {
    name: 'mx-keys',
    prompt: `Logitech MX Keys S wireless keyboard, dark gray.
    Low-profile keys, backlit, premium feel.
    Concave key design, compact layout.
    ${STYLE}`
  },
  {
    name: 'mx-master-3s',
    prompt: `Logitech MX Master 3S wireless mouse, graphite gray.
    Ergonomic sculpted shape, thumb wheel visible.
    Premium productivity mouse, matte finish.
    ${STYLE}`
  },
  {
    name: 'magic-keyboard',
    prompt: `Apple Magic Keyboard with Touch ID, silver and white.
    Low-profile aluminum design, wireless.
    Touch ID sensor in corner, clean minimal aesthetic.
    ${STYLE}`
  },
  {
    name: 'hhkb-keyboard',
    prompt: `HHKB Professional Hybrid Type-S mechanical keyboard.
    Compact 60% layout, dark charcoal color.
    Topre switches, minimalist Japanese design.
    ${STYLE}`
  },

  // Ergonomics
  {
    name: 'herman-miller-aeron',
    prompt: `Herman Miller Aeron office chair, graphite frame.
    Iconic mesh design, ergonomic shape.
    PostureFit SL lumbar support visible.
    Professional office chair, premium build.
    ${STYLE}`
  },
  {
    name: 'herman-miller-embody',
    prompt: `Herman Miller Embody office chair, black.
    Distinctive pixelated backrest design.
    Ergonomic gaming and work chair.
    ${STYLE}`
  },
  {
    name: 'standing-desk',
    prompt: `Electric standing desk, walnut wood top, black frame.
    Clean cable management, minimalist design.
    Height-adjustable, dual motor legs.
    ${STYLE}`
  },
  {
    name: 'monitor-arm',
    prompt: `Premium monitor arm, matte black finish.
    Articulating arm mount, desk clamp visible.
    Heavy-duty construction, clean cable routing.
    ${STYLE}`
  },

  // Audio
  {
    name: 'airpods-max',
    prompt: `Apple AirPods Max headphones, space gray.
    Premium over-ear design, mesh canopy headband.
    Aluminum ear cups, distinctive Apple design.
    ${STYLE}`
  },
  {
    name: 'sony-wh1000xm5',
    prompt: `Sony WH-1000XM5 wireless headphones, black.
    Premium noise-canceling over-ear design.
    Soft touch finish, minimal branding.
    ${STYLE}`
  },
  {
    name: 'homepod-mini',
    prompt: `Apple HomePod mini speaker, space gray.
    Compact spherical mesh fabric design.
    Illuminated touch surface on top.
    ${STYLE}`
  },

  // Extras
  {
    name: 'caldigit-dock',
    prompt: `CalDigit TS4 Thunderbolt dock, silver aluminum.
    Multiple ports visible: USB-C, USB-A, SD card, audio.
    Compact vertical design, premium build.
    ${STYLE}`
  },
  {
    name: 'elgato-stream-deck',
    prompt: `Elgato Stream Deck, black with LCD key icons.
    Programmable macro pad, colorful button display.
    Compact control surface.
    ${STYLE}`
  },
  {
    name: 'led-light-bar',
    prompt: `BenQ ScreenBar LED monitor light, black.
    Mounted on top of monitor, illuminating desk.
    Minimal design, asymmetric light distribution.
    ${STYLE}`
  },

  // Hero shots
  {
    name: 'setup-minimal',
    prompt: `Minimal home office setup: Mac Mini on clean white desk.
    Single 27-inch monitor, compact keyboard and mouse.
    Simple desk lamp, one small plant.
    Clean, focused, no clutter.
    ${STYLE}`
  },
  {
    name: 'setup-recommended',
    prompt: `Professional home office: Mac Studio with curved 40-inch ultrawide monitor.
    Mechanical keyboard, ergonomic mouse on desk mat.
    Herman Miller Aeron chair, standing desk.
    Warm ambient lighting, organized cables.
    ${STYLE}`
  },
  {
    name: 'setup-command-center',
    prompt: `Premium developer battlestation: Mac Studio with dual monitors.
    One ultrawide curved display, one vertical secondary monitor.
    Full-size mechanical keyboard, multiple peripherals.
    Herman Miller Embody chair, premium standing desk.
    Acoustic panels on wall, studio lighting.
    ${STYLE}`
  }
];

async function generateImage(item) {
  console.log(`Generating: ${item.name}...`);

  try {
    const result = await fal.subscribe('fal-ai/flux-pro/v1.1', {
      input: {
        prompt: item.prompt,
        image_size: 'square_hd',
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
  console.log('Generating product-specific images...\n');

  const results = [];
  for (const item of products) {
    const path = await generateImage(item);
    if (path) results.push({ name: item.name, path });
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n--- Complete ---');
  console.log(`Generated ${results.length}/${products.length} images`);
  console.log('Images saved to:', OUTPUT_DIR);
}

main();

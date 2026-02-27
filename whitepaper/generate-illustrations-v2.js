/**
 * Whitepaper Illustration Generator v2
 * Aesthetic: Fellini, Wilson, Forsythe, Wenders, Kurosawa
 *
 * Cultural references:
 * - 8½ (Fellini) - surrealism, meta-narrative, B&W
 * - Ran (Kurosawa) - epic scale, formal composition
 * - CIVIL warS (Wilson) - stark staging, dramatic light
 * - Loss of Small Detail (Forsythe) - deconstructed movement
 * - Until the End of the World (Wenders) - melancholic technology
 * - The Wire - documentary realism, institutional texture
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FAL_API_KEY = process.env.FAL_API_KEY;

const ILLUSTRATIONS = [
  {
    id: "timeline",
    filename: "career-timeline.png",
    prompt: `Abstract horizontal timeline, 1984 to 2025. Black and white film photography aesthetic, Fellini-esque.
    Geometric progression from left to right, each era a distinct visual chapter.
    High contrast, grain texture, cinematic aspect ratio feel.
    Spinoza's geometric method meets film strip.
    Stark white markers against deep black, moments of light emerging from darkness.
    No text, purely visual rhythm. Style: Chris Marker, Alain Resnais documentary aesthetic.`
  },
  {
    id: "theater",
    filename: "theater-era.png",
    prompt: `Robert Wilson theatrical staging. Single figure in vast dark space, isolated by precise spotlight.
    Minimal set piece - perhaps a chair or geometric form.
    Einstein on the Beach aesthetic - slow time, architectural light.
    Black and white, extreme contrast, fog or haze creating depth.
    The figure small against the void, contemplative pose.
    Bauhaus stage design meets film noir. Absolute stillness captured.
    Reference: Wilson's CIVIL warS, Forsythe's stark rehearsal spaces.`
  },
  {
    id: "internet",
    filename: "internet-era.png",
    prompt: `1995 internet dawn through Wim Wenders lens. Until the End of the World aesthetic.
    CRT monitor glow in dark room, face partially illuminated by screen light.
    Melancholic technology, the promise and loneliness of early web.
    Grainy, documentary feel, available light photography.
    Window reflection showing city at night, inside/outside duality.
    The Wire's institutional texture applied to tech startup.
    Muted colors bleeding into monochrome. Contemplative, not celebratory.`
  },
  {
    id: "turntable",
    filename: "turntable-era.png",
    prompt: `Social gathering around music, Fellini party scene energy but intimate scale.
    Vinyl record as sacred object, hands reaching toward turntable.
    Chiaroscuro lighting, faces emerging from shadow.
    8½ dream sequence quality - real but heightened.
    Multiple figures but each isolated in their own light.
    Smoke, grain, the texture of analog in digital age.
    Community as theater, each person a character in the scene.`
  },
  {
    id: "bright-moments",
    filename: "bright-moments-era.png",
    prompt: `Gallery space, Robert Wilson staging applied to NFT minting moment.
    Large screen displaying generative art, silhouettes of crowd watching.
    Single moment of revelation - art appearing on blockchain.
    Kurosawa's formal composition - figures arranged with geometric precision.
    Purple/blue ambient glow against darkness, cathedral of digital art.
    The Wire's observational distance - we watch people watching.
    Anticipation frozen in time, collective breath held.`
  },
  {
    id: "ai-agents",
    filename: "ai-agents-era.png",
    prompt: `Philosophical abstraction of autonomous intelligence. Wittgenstein's language games visualized.
    Neural pathways as calligraphy, thought as visual form.
    Deep black field with precise white lines forming emergent patterns.
    Not cyberpunk, not sci-fi - philosophical, contemplative.
    Spinoza's geometric ethics rendered as visual system.
    The moment before understanding, patterns on verge of meaning.
    Forsythe's movement notation applied to artificial thought.`
  },
  {
    id: "infographic",
    filename: "career-infographic.png",
    prompt: `Career milestones as film title sequence. Saul Bass meets European modernism.
    Five distinct visual moments arranged horizontally: 1995, 2002, 2011, 2021, 2024.
    Each era a graphic symbol - stark, iconic, immediately readable.
    Black background, white and single accent color (deep blue).
    Swiss typography influence but with cinematic drama.
    The rhythm of a life in business rendered as visual poetry.
    Fellini's circus meets corporate timeline.`
  }
];

async function generateWithFal(prompt, filename) {
  console.log(`\nGenerating: ${filename}`);
  console.log(`Prompt: ${prompt.substring(0, 100)}...`);

  const response = await fetch('https://fal.run/fal-ai/flux-pro/v1.1-ultra', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 40,
      guidance_scale: 4.0,
      num_images: 1,
      enable_safety_checker: false,
      output_format: 'png',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FAL API error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return result.images[0].url;
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`Downloaded: ${filepath}`);
}

async function main() {
  if (!FAL_API_KEY) {
    console.error('FAL_API_KEY environment variable required');
    process.exit(1);
  }

  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const results = [];

  for (const illust of ILLUSTRATIONS) {
    try {
      const url = await generateWithFal(illust.prompt, illust.filename);
      const localPath = path.join(imagesDir, illust.filename);
      await downloadImage(url, localPath);

      results.push({
        id: illust.id,
        prompt: illust.prompt,
        filename: illust.filename,
        url: url,
        localPath: `images/${illust.filename}`,
        success: true
      });

      // Rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`Failed: ${illust.filename}`, error.message);
      results.push({
        id: illust.id,
        filename: illust.filename,
        error: error.message,
        success: false
      });
    }
  }

  // Save results
  fs.writeFileSync(
    path.join(__dirname, 'illustration-results-v2.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n=== Generation Complete ===');
  console.log(`Success: ${results.filter(r => r.success).length}/${results.length}`);
}

main();

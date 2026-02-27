#!/usr/bin/env node

/**
 * Generate illustrations for Seth Goldstein biography whitepaper
 * Uses FAL.ai with Flux Pro for high-quality image generation
 */

const FAL_API_KEY = process.env.FAL_API_KEY;

// Illustration prompts - minimalist, Swiss design inspired
const ILLUSTRATIONS = [
  {
    id: 'portrait',
    prompt: 'Professional portrait of a visionary tech entrepreneur in their 50s, contemplative expression, intellectual gaze. Black and white photograph with dramatic lighting. Clean minimalist backdrop. Swiss design aesthetic. Sharp focus, medium close-up, subtle shadows creating depth. Style: Annie Leibovitz portrait photography meets Bauhaus minimalism.',
    filename: 'seth-portrait.png'
  },
  {
    id: 'timeline',
    prompt: 'Abstract horizontal timeline infographic spanning 1984 to 2025. Minimalist Swiss design with geometric shapes. Deep charcoal (#0A0A0A) background. White and blue (#6B8FFF) accent colors. Bauhaus-inspired clean lines. Sections marked for: Theater (1984), Internet (1995), Data (2001), Social Music (2010), NFTs (2021), AI Agents (2025). Style: Josef Müller-Brockmann meets information design.',
    filename: 'career-timeline.png'
  },
  {
    id: 'theater',
    prompt: 'Abstract representation of avant-garde theater. Robert Wilson inspired visual composition. Geometric stage silhouettes. Dramatic chiaroscuro lighting. Black and white with deep shadows. Single figure in spotlight, minimalist set pieces. Film noir atmosphere meets Bauhaus stage design. Empty space as design element.',
    filename: 'theater-era.png'
  },
  {
    id: 'internet',
    prompt: 'Abstract visualization of 1995 early internet era. Netscape Navigator browser window outline. Chunky pixels, dial-up modem aesthetic. Retro computer terminal glow. Green phosphor text on black. HTML angle brackets floating. Nostalgic digital archaeology. Style: vaporwave meets early web brutalism, clean composition.',
    filename: 'internet-era.png'
  },
  {
    id: 'turntable',
    prompt: 'Abstract social music experience visualization. Vinyl record as central geometric element. Sound waves radiating outward. Multiple avatar silhouettes gathered around music. Warm amber and deep purple tones. Community gathering in digital space. Style: album cover art meets architectural blueprint.',
    filename: 'turntable-era.png'
  },
  {
    id: 'bright-moments',
    prompt: 'Live generative art minting moment. Gallery space with large screen displaying algorithmic art. Silhouettes of crowd watching creation unfold. Purple and electric blue ambient glow. NFT aesthetic, blockchain visualization elements. Moment of collective wonder. Style: contemporary art exhibition meets cyberpunk ambient.',
    filename: 'bright-moments-era.png'
  },
  {
    id: 'ai-agents',
    prompt: 'Autonomous AI creative agents visualization. Neural network nodes and connections. Flowing data streams in blue (#6B8FFF). Abstract intelligence emerging from digital substrate. Deep charcoal background. Spirit Protocol aesthetic - agents as conscious entities. Style: scientific diagram meets abstract expressionism.',
    filename: 'ai-agents-era.png'
  },
  {
    id: 'infographic',
    prompt: 'Professional career infographic displaying company founding milestones. Swiss design grid layout. Timeline with: SiteSpecific 1995 ($12M exit), Majestic 2001 ($75M exit), Turntable.fm 2010, Bright Moments 2021, Eden 2023. Minimal color palette: charcoal, white, blue accent. Clean data visualization. Style: annual report meets modernist graphic design.',
    filename: 'career-infographic.png'
  }
];

async function generateWithFal(prompt, filename) {
  console.log(`\nGenerating: ${filename}`);
  console.log(`Prompt: ${prompt.slice(0, 100)}...`);

  if (!FAL_API_KEY) {
    console.error('FAL_API_KEY environment variable not set');
    return null;
  }

  try {
    // Use Flux Pro Ultra for high quality
    const response = await fetch('https://fal.run/fal-ai/flux-pro/v1.1-ultra', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: 'square_hd',  // 1024x1024
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false,
        output_format: 'png',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`FAL API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();

    if (data.images && data.images.length > 0) {
      console.log(`✓ ${filename} completed!`);
      console.log(`  URL: ${data.images[0].url}`);
      return {
        success: true,
        url: data.images[0].url,
        filename
      };
    }

    return null;
  } catch (error) {
    console.error(`Error generating ${filename}:`, error.message);
    return null;
  }
}

async function downloadImage(url, filename) {
  const fs = await import('fs');
  const path = await import('path');

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const filepath = path.join('./images', filename);

    // Ensure images directory exists
    try {
      fs.mkdirSync('./images', { recursive: true });
    } catch (e) {}

    fs.writeFileSync(filepath, buffer);
    console.log(`  Downloaded to: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error(`  Failed to download: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Seth Goldstein Biography - Illustration Generator');
  console.log('='.repeat(60));
  console.log(`Using FAL.ai Flux Pro Ultra`);
  console.log(`Generating ${ILLUSTRATIONS.length} illustrations...\n`);

  if (!FAL_API_KEY) {
    console.error('ERROR: FAL_API_KEY environment variable required');
    console.log('Get your API key at https://fal.ai/');
    process.exit(1);
  }

  const results = [];

  for (const illustration of ILLUSTRATIONS) {
    const result = await generateWithFal(illustration.prompt, illustration.filename);

    if (result && result.url) {
      // Download the image
      const localPath = await downloadImage(result.url, illustration.filename);
      results.push({
        ...illustration,
        url: result.url,
        localPath,
        success: true
      });
    } else {
      results.push({
        ...illustration,
        success: false
      });
    }

    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✓ Generated: ${successful.length}/${results.length}`);

  successful.forEach(r => {
    console.log(`  ✓ ${r.filename}`);
    console.log(`    URL: ${r.url}`);
  });

  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length}`);
    failed.forEach(r => {
      console.log(`  ✗ ${r.filename}`);
    });
  }

  // Save results to JSON
  const fs = await import('fs');
  fs.writeFileSync(
    './illustration-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('\nResults saved to illustration-results.json');

  if (successful.length > 0) {
    console.log('\n📁 Images downloaded to ./images/');
    console.log('\nTo use in LaTeX whitepaper:');
    console.log('  \\includegraphics[width=\\textwidth]{images/seth-portrait.png}');
  }
}

main().catch(console.error);

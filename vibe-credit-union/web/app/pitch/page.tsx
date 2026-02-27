export default function PitchPage() {
  return (
    <div className="min-h-screen bg-vibe-black text-vibe-cream">
      {/* Minimal header */}
      <header className="border-b border-vibe-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <span className="text-vibe-gold-dim">&#9678;</span>
          <span className="font-serif text-lg ml-2">VIBE</span>
          <span className="text-vibe-muted text-sm ml-2 font-mono">credit union</span>
          <span className="text-vibe-muted text-xs ml-auto font-mono">overflow protection for Claude Code</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6">

        {/* Hero — the specific pain */}
        <section className="pt-20 pb-16">
          <p className="text-vibe-muted text-sm font-mono mb-8 uppercase tracking-wider">
            Early preview &middot; Not public yet
          </p>

          <h1 className="text-4xl md:text-5xl font-serif leading-tight mb-8">
            You hit the wall.
            <br /><span className="text-vibe-gold">We catch you.</span>
          </h1>

          <p className="text-xl text-vibe-muted leading-relaxed max-w-2xl mb-8">
            You&apos;re a Max subscriber. You love Claude Code. But once or twice a month
            you hit your usage limit mid-session — right when you&apos;re shipping.
            You don&apos;t want to set up raw API billing for overflow.
            You just want to keep coding.
          </p>

          <p className="text-lg text-vibe-cream">
            VIBE Credit Union is overflow protection for Claude Code.
            Keep your Max sub. When you hit the wall, we catch you.
            Cooperative, pay-per-call, USDC on Base.
          </p>
        </section>

        {/* The moment */}
        <section className="pb-16">
          <h2 className="text-2xl font-serif text-vibe-cream mb-6">You know this moment</h2>
          <div className="space-y-3 mb-8">
            <div className="card border-red-900/30 bg-red-950/10">
              <div className="flex items-start gap-3">
                <span className="text-red-400/80 mt-0.5">&#9888;</span>
                <div>
                  <p className="text-sm font-mono text-red-400/80">
                    You&apos;ve reached 80% of your monthly usage. 8 days remaining.
                  </p>
                  <p className="text-xs text-vibe-muted mt-1">Tuesday, 2pm. You&apos;re mid-refactor.</p>
                </div>
              </div>
            </div>
            <div className="card border-red-900/30 bg-red-950/10">
              <div className="flex items-start gap-3">
                <span className="text-red-400/80 mt-0.5">&#9888;</span>
                <div>
                  <p className="text-sm font-mono text-red-400/80">
                    Rate limit exceeded. Try again in 2 hours.
                  </p>
                  <p className="text-xs text-vibe-muted mt-1">Thursday, 11pm. You&apos;re about to ship.</p>
                </div>
              </div>
            </div>
            <div className="card border-red-900/30 bg-red-950/10">
              <div className="flex items-start gap-3">
                <span className="text-red-400/80 mt-0.5">&#9888;</span>
                <div>
                  <p className="text-sm font-mono text-red-400/80">
                    Monthly limit reached. Resets in 6 days.
                  </p>
                  <p className="text-xs text-vibe-muted mt-1">Saturday. Hackathon weekend. Dead in the water.</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-vibe-muted">
            Your options right now: wait it out, or set up a full Anthropic API account
            with credit cards, billing dashboards, usage alerts, and a completely separate
            workflow. For what — a few overflow hours a month?
          </p>
        </section>

        {/* The pitch */}
        <section className="pb-16">
          <h2 className="text-2xl font-serif text-vibe-cream mb-6">There&apos;s a better way</h2>

          <div className="card border-vibe-gold mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-vibe-gold text-xl">&#9678;</span>
              <p className="text-lg text-vibe-cream font-serif">VIBE Credit Union</p>
            </div>
            <p className="text-vibe-muted mb-4">
              A cooperative compute pool for Claude Code users.
              Deposit a little USDC. When your Max sub hits the wall,
              your sessions automatically route through the credit union.
              Same model. Same streaming. Same experience.
              You just keep coding.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-vibe-gold font-medium">What it is</p>
                <p className="text-vibe-muted">Overflow protection. A safety net. A shared API proxy that kicks in when your subscription can&apos;t.</p>
              </div>
              <div>
                <p className="text-vibe-gold font-medium">What it isn&apos;t</p>
                <p className="text-vibe-muted">Not a replacement for Max. Not competing with Anthropic. Not a new billing system to manage.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="pb-16">
          <h2 className="text-2xl font-serif text-vibe-cream mb-6">Setup: 30 seconds</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-vibe-card border border-vibe-border flex items-center justify-center">
                <span className="text-vibe-gold font-mono text-sm">1</span>
              </div>
              <div>
                <p className="text-vibe-cream font-medium mb-1">Deposit a little USDC</p>
                <p className="text-sm text-vibe-muted">
                  $5–$20 covers most people for a month of overflow.
                  It just sits there until you need it. Withdraw anytime.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-vibe-card border border-vibe-border flex items-center justify-center">
                <span className="text-vibe-gold font-mono text-sm">2</span>
              </div>
              <div>
                <p className="text-vibe-cream font-medium mb-1">When you hit the wall, swap one env var</p>
                <div className="code-block mt-2">
                  <pre className="text-sm">{`# Normal: Claude Code uses your Max sub
# Hit the wall? Switch to the credit union:
export ANTHROPIC_BASE_URL=https://api.vibe.spiritprotocol.io
export ANTHROPIC_CUSTOM_HEADERS="x-vibe-account:0xYourWallet"

# Keep shipping. Opus 4.6. Same streaming. Same everything.`}</pre>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-vibe-card border border-vibe-border flex items-center justify-center">
                <span className="text-vibe-gold font-mono text-sm">3</span>
              </div>
              <div>
                <p className="text-vibe-cream font-medium mb-1">When your sub resets, switch back</p>
                <p className="text-sm text-vibe-muted">
                  Unset the env vars and you&apos;re back on Max.
                  Your USDC balance stays in the credit union for next time.
                  You only paid for the overflow hours you actually used.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The economics */}
        <section className="pb-16">
          <h2 className="text-2xl font-serif text-vibe-cream mb-4">What overflow actually costs</h2>
          <p className="text-vibe-muted mb-6">
            Most Max subscribers hit the wall 2–5 days per month.
            That&apos;s not a $200 problem. It&apos;s a $5–$15 problem.
          </p>

          <div className="card mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-vibe-muted text-left">
                  <th className="pb-3 font-normal">Overflow scenario</th>
                  <th className="pb-3 font-normal text-right">Cost via VIBE</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-t border-vibe-border">
                  <td className="py-3 text-vibe-cream">Finish one session after hitting the wall</td>
                  <td className="py-3 text-right text-vibe-gold">$1 – $3</td>
                </tr>
                <tr className="border-t border-vibe-border">
                  <td className="py-3 text-vibe-cream">2–3 overflow days in a heavy month</td>
                  <td className="py-3 text-right text-vibe-gold">$5 – $15</td>
                </tr>
                <tr className="border-t border-vibe-border">
                  <td className="py-3 text-vibe-cream">Hackathon weekend (sub already burned)</td>
                  <td className="py-3 text-right text-vibe-gold">$10 – $25</td>
                </tr>
                <tr className="border-t border-vibe-border">
                  <td className="py-3 text-vibe-cream">Light month (never hit the wall)</td>
                  <td className="py-3 text-right text-vibe-green">$0 — balance carries over</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-vibe-muted mt-4">
              Opus 4.6 at Anthropic&apos;s published API rates. $15/M input, $75/M output.
              Zero markup. A typical Claude Code session costs ~$1.50.
            </p>
          </div>

          <div className="card bg-vibe-dark">
            <p className="text-sm text-vibe-muted">
              <span className="text-vibe-cream font-medium">The math:</span> You&apos;re
              already paying $200/mo for Max. VIBE adds $5–$15/mo in overflow months.
              That&apos;s $205–$215 total for <span className="text-vibe-cream">uninterrupted</span> Opus
              4.6 access — vs. the cost of losing flow state, waiting hours for rate limits,
              or setting up a whole separate API billing account.
            </p>
          </div>
        </section>

        {/* Strength in numbers */}
        <section className="pb-16">
          <h2 className="text-2xl font-serif text-vibe-cream mb-4">Strength in numbers</h2>
          <p className="text-vibe-muted mb-6">
            This is old-school computer time-sharing for the AI era.
            Not everyone overflows at the same time. When 10 people pool $10 each,
            the heavy month for one person is a light month for another.
            The cooperative absorbs the spikes.
          </p>

          <div className="card border-vibe-gold mb-6">
            <p className="text-lg text-vibe-cream font-serif mb-3">
              How the pool works
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-vibe-muted">Everyone deposits a little</span>
                <span className="text-sm text-vibe-cream font-mono">$10–$20 each</span>
              </div>
              <div className="border-t border-vibe-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-vibe-muted">Not everyone overflows at once</span>
                <span className="text-sm text-vibe-cream font-mono">Idle balances cushion spikes</span>
              </div>
              <div className="border-t border-vibe-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-vibe-muted">Heavy month? The pool has your back</span>
                <span className="text-sm text-vibe-cream font-mono">Keep shipping</span>
              </div>
              <div className="border-t border-vibe-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-vibe-muted">Transparent usage per member</span>
                <span className="text-sm text-vibe-cream font-mono">Everyone sees the ledger</span>
              </div>
              <div className="border-t border-vibe-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-vibe-muted">Withdraw your balance anytime</span>
                <span className="text-sm text-vibe-cream font-mono">Your USDC, your call</span>
              </div>
            </div>
          </div>

          <p className="text-vibe-muted text-sm">
            It&apos;s a credit union in the original sense — people pooling resources so
            everyone has access when they need it. Not a startup. Not a subscription.
            A cooperative for vibecoders who help each other keep shipping.
          </p>
        </section>

        {/* Anthropic alignment — the key section */}
        <section className="pb-16">
          <h2 className="text-2xl font-serif text-vibe-cream mb-6">Good for Anthropic too</h2>
          <div className="space-y-4 text-vibe-muted">
            <p>
              This is not a workaround. It&apos;s additive revenue.
            </p>
            <p>
              Every VIBE call goes through Anthropic&apos;s API at full published rates.
              Max subscribers keep paying their $200/mo. VIBE adds overflow revenue
              on top — usage that would otherwise be lost to rate limits and frustrated
              vibecoders closing their laptops.
            </p>
            <p>
              Anthropic gets the subscription <span className="text-vibe-cream">AND</span> the
              overflow. The credit union turns &ldquo;sorry, come back later&rdquo;
              into &ldquo;here&apos;s $5–$15 more in API revenue this month.&rdquo;
            </p>
            <p>
              It&apos;s the same model as a cloud reseller or a Twilio aggregator.
              Same infrastructure, same pricing, more reach.
              More vibecoders using Claude Code more hours per month = everyone wins.
            </p>
          </div>
        </section>

        {/* Stack */}
        <section className="pb-16">
          <h2 className="text-2xl font-serif text-vibe-cream mb-6">How it&apos;s built</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Payments', value: 'USDC on Base' },
              { label: 'Settlement', value: 'x402 protocol' },
              { label: 'Proxy', value: 'Express + SSE' },
              { label: 'Vault', value: 'Solidity 0.8.20' },
            ].map((item) => (
              <div key={item.label} className="card text-center py-4">
                <p className="text-xs text-vibe-muted mb-1">{item.label}</p>
                <p className="text-sm font-mono text-vibe-cream">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-vibe-muted">
            The proxy forwards streaming SSE directly — same speed as hitting Anthropic&apos;s
            API directly. Cost is estimated upfront, reserved from your balance,
            then reconciled to the exact token count after the stream completes.
            Claude Code native. No degraded experience.
          </p>
        </section>

        {/* Ecosystem context */}
        <section className="pb-16">
          <h2 className="text-2xl font-serif text-vibe-cream mb-4">Part of the vibe ecosystem</h2>
          <p className="text-vibe-muted mb-6">
            The credit union is the compute access layer — one piece of a larger
            ecosystem we&apos;re building for vibecoders. Each product serves a different need.
            Same community, same ethos, different surfaces.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: '/vibe', role: 'Social', desc: 'DMs + presence for Claude Code' },
              { name: 'Credit Union', role: 'Compute', desc: 'Overflow protection' },
              { name: 'vibestation', role: 'Hardware', desc: 'Battlestation guide' },
              { name: 'letsvibe.fm', role: 'Culture', desc: 'Podcast' },
              { name: 'vibestats', role: 'Analytics', desc: 'Movement metrics' },
              { name: '$vibe', role: 'Economy', desc: 'In-game currency (L2)' },
            ].map((item) => (
              <div key={item.name} className={`card py-3 px-4 ${item.name === 'Credit Union' ? 'border-vibe-gold' : ''}`}>
                <p className={`text-sm font-mono ${item.name === 'Credit Union' ? 'text-vibe-gold' : 'text-vibe-cream'}`}>
                  {item.name}
                </p>
                <p className="text-xs text-vibe-muted">
                  {item.role} &middot; {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-20 text-center">
          <div className="card border-vibe-gold py-10">
            <h2 className="text-2xl font-serif text-vibe-cream mb-3">Never hit the wall again</h2>
            <p className="text-vibe-muted mb-6">
              We&apos;re onboarding the first cohort of vibecoders now.
              <br />DM seth on /vibe or reply to whoever sent you this.
            </p>
            <div className="code-block inline-block text-left max-w-lg mx-auto">
              <pre className="text-sm">{`# When your Max sub hits the wall:
export ANTHROPIC_BASE_URL=https://api.vibe.spiritprotocol.io
export ANTHROPIC_CUSTOM_HEADERS="x-vibe-account:0xYou"

# Keep shipping. Opus 4.6. Same everything.`}</pre>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-vibe-border py-6 text-center text-sm text-vibe-muted">
        <p>
          VIBE Credit Union &middot; Overflow protection for Claude Code
        </p>
        <p className="mt-1">
          Part of the vibe ecosystem &middot; Built by Spirit Protocol &middot; Base Network
        </p>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Send, CheckCircle, ArrowRight, Zap } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Create Proposals',
    description: 'Build professional proposals in minutes. Share them with a single link.',
  },
  {
    icon: Send,
    title: 'Share Instantly',
    description: 'Send proposals via WhatsApp or a public link. Clients view and accept online.',
  },
  {
    icon: BarChart3,
    title: 'Track Your Pipeline',
    description: 'See which proposals are open, viewed, approved, or lost — all in one dashboard.',
  },
  {
    icon: CheckCircle,
    title: 'Close More Deals',
    description: 'Understand your conversion rate, pipeline value, and revenue at a glance.',
  },
];

const steps = [
  { number: '1', title: 'Create a proposal', description: 'Add your client, services, and pricing.' },
  { number: '2', title: 'Share it', description: 'Send via link or WhatsApp in one click.' },
  { number: '3', title: 'Track & close', description: 'Follow up and convert more deals.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">CloseFlow</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Zap className="h-3.5 w-3.5" />
            Proposals & pipeline for small businesses
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Create proposals.<br />
            Track conversions.<br />
            <span className="text-primary">Close more deals.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            CloseFlow helps freelancers and small businesses send professional proposals, follow their sales pipeline, and understand what converts — all in one simple platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8" asChild>
              <Link to="/register">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to win more business
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              From proposal creation to pipeline tracking — CloseFlow keeps your sales organized.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-card p-6 space-y-3">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How it works</h2>
            <p className="mt-4 text-muted-foreground text-lg">Three steps to a better sales process.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to close more deals?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Join CloseFlow and start managing your proposals like a pro.
          </p>
          <div className="mt-8">
            <Button size="lg" className="text-base px-8" asChild>
              <Link to="/register">
                Get started — it's free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} CloseFlow. All rights reserved.</span>
          <span className="text-sm font-medium">CloseFlow</span>
        </div>
      </footer>
    </div>
  );
}

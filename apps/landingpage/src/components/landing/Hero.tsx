import { ArrowRight, Play, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary/80 via-secondary/40 to-background py-16 lg:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Content */}
          <div className="flex flex-col items-start space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
              <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
              Digital Revolution
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="italic">Transform Your</span>
              <br />
              <span className="italic">Restaurant with the</span>
              <br />
              <span className="text-primary italic">Menu of the Future</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              Increase your establishment's efficiency, eliminate errors, and provide 
              an unforgettable experience for your customers with our cutting-edge technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group px-8">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="group bg-background/50 backdrop-blur-sm">
                <Play className="mr-2 h-4 w-4 fill-current" />
                View Demo
              </Button>
            </div>

            {/* Scroll indicator */}
            <div className="hidden lg:flex items-center gap-2 pt-8 text-muted-foreground">
              <span className="text-sm uppercase tracking-wider">Scroll</span>
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </div>
          </div>

          {/* POS Dashboard Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative animate-float">
              {/* Main Dashboard Card */}
              <div className="rounded-2xl bg-card border shadow-2xl overflow-hidden w-full max-w-sm">
                {/* Header */}
                <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">R</span>
                    </div>
                    <span className="font-semibold text-sm">Restaurantix POS</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Online
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Order 1 */}
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-muted-foreground">Table 05 • Waiter João</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-primary/10" />
                      <div>
                        <p className="text-sm font-medium">2x Artisan Burger</p>
                        <p className="text-xs text-muted-foreground">no onion</p>
                      </div>
                    </div>
                  </div>

                  {/* Order 2 */}
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-muted-foreground">Delivery #892</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded bg-primary/10" />
                      <div>
                        <p className="text-sm font-medium">1x Margherita Pizza</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Stats */}
                <div className="bg-primary text-primary-foreground p-4">
                  <p className="text-xs opacity-80 mb-1">TODAY'S REVENUE</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">$4.2k</span>
                    <span className="text-xs bg-primary-foreground/20 px-2 py-0.5 rounded">+15%</span>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -top-4 -right-4 z-10 bg-card rounded-xl p-3 shadow-lg border animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-lg">🔔</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">New Order!</p>
                    <p className="text-xs text-muted-foreground">Table 12</p>
                  </div>
                </div>
              </div>

              {/* Floating QR element */}
              <div className="absolute -bottom-6 -left-6 z-10 bg-card rounded-xl p-3 shadow-lg border animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="w-14 h-14 bg-foreground rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-0.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 ${
                          [0, 1, 2, 4, 7, 8, 11, 12, 13, 14, 15].includes(i) ? "bg-background" : "bg-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-center mt-2 font-medium">Scan Me</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
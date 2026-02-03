import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";

export const FinalCTA = () => {
  return (
    <section className="py-20 bg-foreground text-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Modernize Your Restaurant?
          </h2>
          <p className="text-lg text-background/80 mb-8 max-w-xl mx-auto">
            Join 500+ restaurants that have already transformed their operations 
            with our digital menu solution. Start your free trial today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground group"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 text-background hover:bg-background/10 bg-transparent"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Demo
            </Button>
          </div>

          <p className="text-sm text-background/60 mt-6">
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

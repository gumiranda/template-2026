import { Palette, MonitorDot, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";

const features = [
  {
    icon: Palette,
    title: "Complete White-Label Solution",
    description:
      "Customize everything to match your brand. Add your logo, colors, and style to create a seamless experience that feels native to your restaurant.",
    image: "/placeholder.svg",
    color: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: MonitorDot,
    title: "Kitchen Display Dashboard",
    description:
      "Real-time order management for your kitchen staff. See orders as they come in, track preparation status, and ensure timely delivery to customers.",
    image: "/placeholder.svg",
    color: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    icon: ShoppingCart,
    title: "Multi-Cart System",
    description:
      "Handle dine-in, takeaway, and delivery orders simultaneously. Our smart cart system keeps everything organized and running smoothly.",
    image: "/placeholder.svg",
    color: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-primary mb-2">
            POWERFUL FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform gives you all the tools to modernize your 
            restaurant and deliver exceptional customer experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image placeholder */}
              <div className={`h-48 ${feature.color} flex items-center justify-center relative overflow-hidden`}>
                <feature.icon className={`h-20 w-20 ${feature.iconColor} opacity-50 group-hover:scale-110 transition-transform duration-300`} />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <Button variant="link" className="p-0 h-auto text-primary group/btn">
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Features
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

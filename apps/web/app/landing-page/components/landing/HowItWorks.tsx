import { Upload, QrCode, ChefHat, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Create Your Menu",
    description:
      "Upload your dishes with photos, descriptions, and prices. Our intuitive dashboard makes it easy to organize categories and customize your menu.",
  },
  {
    number: "02",
    icon: QrCode,
    title: "Generate QR Codes",
    description:
      "Get unique QR codes for each table. Customers simply scan to view your beautiful digital menu on their phones — no app download needed.",
  },
  {
    number: "03",
    icon: ChefHat,
    title: "Receive Orders",
    description:
      "Orders flow directly to your kitchen display in real-time. Streamline operations, reduce errors, and serve customers faster than ever.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-primary mb-2">
            SIMPLE PROCESS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes, not days. Our streamlined setup process 
            means you can start taking digital orders today.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative group"
              >
                {/* Card */}
                <div className="bg-card rounded-2xl p-8 border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Step number badge */}
                  <div className="absolute -top-4 left-8 inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {/* Arrow connector (visible on larger screens) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground items-center justify-center -translate-y-1/2">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

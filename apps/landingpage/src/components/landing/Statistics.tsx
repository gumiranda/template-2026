import { useEffect, useState, useRef } from "react";
import { Clock, Users, TrendingUp, Heart } from "lucide-react";

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const stats: StatItem[] = [
  {
    icon: Clock,
    value: 30,
    suffix: "%",
    label: "Faster Service",
    description: "Reduce customer wait times with instant digital ordering",
  },
  {
    icon: Users,
    value: 500,
    suffix: "+",
    label: "Happy Restaurants",
    description: "Join hundreds of restaurants already using our platform",
  },
  {
    icon: TrendingUp,
    value: 25,
    suffix: "%",
    label: "Higher Sales",
    description: "Increase average order value with visual menus",
  },
  {
    icon: Heart,
    value: 98,
    suffix: "%",
    label: "Satisfaction",
    description: "Customer satisfaction rate across all partner restaurants",
  },
];

const AnimatedCounter = ({ 
  value, 
  suffix, 
  isVisible 
}: { 
  value: number; 
  suffix: string; 
  isVisible: boolean;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <span className="text-4xl sm:text-5xl font-bold text-primary">
      {count}
      {suffix}
    </span>
  );
};

export const Statistics = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Trusted by Restaurants Worldwide
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our digital menu solution delivers real results. Here's what our 
            restaurant partners are experiencing.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-2">
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix} 
                  isVisible={isVisible} 
                />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{stat.label}</h3>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

const testimonials = [
  {
    quote:
      "Restaurantix transformed our ordering process. We've cut wait times by 40% and our customers love the digital menu experience. It's been a game-changer for us.",
    name: "Sarah Mitchell",
    role: "Owner",
    restaurant: "The Golden Fork Bistro",
    avatar: "SM",
    rating: 5,
  },
  {
    quote:
      "The kitchen display system is incredible. Orders come in clearly, we never miss anything, and our team's productivity has skyrocketed. Best investment we've made.",
    name: "Marcus Chen",
    role: "General Manager",
    restaurant: "Lotus Garden Asian Cuisine",
    avatar: "MC",
    rating: 5,
  },
  {
    quote:
      "Setting up was so easy! Within an hour, we had QR codes on every table. Our average order value increased by 30% in the first month. Highly recommend!",
    name: "Elena Rodriguez",
    role: "Restaurant Director",
    restaurant: "Casa Bella Ristorante",
    avatar: "ER",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-primary mb-2">
            TESTIMONIALS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from restaurant owners who have transformed their businesses 
            with our digital menu solution.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 border shadow-sm hover:shadow-lg transition-all duration-300 relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 right-8">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Quote className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={testimonial.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.restaurant}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

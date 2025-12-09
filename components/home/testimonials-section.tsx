import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "EventFlow transformed how we manage our annual conference. The ticketing and check-in process is incredibly smooth.",
    author: "Sarah Chen",
    role: "Event Director",
    company: "TechConf Global",
    avatar: "/professional-woman-headshot.png",
    rating: 5,
  },
  {
    quote:
      "The analytics dashboard gives us insights we never had before. We've increased our ticket sales by 40% since switching.",
    author: "Marcus Johnson",
    role: "Founder",
    company: "Music Festival Co",
    avatar: "/professional-man-headshot.png",
    rating: 5,
  },
  {
    quote:
      "As a small event organizer, the free tier gives me everything I need. The platform is intuitive and powerful.",
    author: "Emily Rodriguez",
    role: "Community Manager",
    company: "Local Meetups",
    avatar: "/young-professional-woman-headshot.png",
    rating: 5,
  },
  {
    quote: "The customer support is exceptional. They helped us set up a complex multi-venue event in just days.",
    author: "David Park",
    role: "Operations Lead",
    company: "Convention Center",
    avatar: "/asian-professional-man-headshot.png",
    rating: 5,
  },
  {
    quote: "We moved from a legacy system and the migration was seamless. EventFlow's modern approach is refreshing.",
    author: "Lisa Thompson",
    role: "CTO",
    company: "Events Inc",
    avatar: "/executive-woman-headshot.png",
    rating: 5,
  },
  {
    quote:
      "The mobile check-in app works flawlessly, even with thousands of attendees. A game-changer for our stadium events.",
    author: "James Wilson",
    role: "Stadium Manager",
    company: "Metro Arena",
    avatar: "/middle-aged-man-headshot.png",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Loved by Event
            <span className="gradient-text"> Organizers Worldwide</span>
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Join thousands of organizers who trust EventFlow to power their events.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

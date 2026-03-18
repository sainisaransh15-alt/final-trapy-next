import { Quote } from 'lucide-react';

interface Founder {
  name: string;
  role: string;
  college: string;
  bio: string;
  quote: string;
  initials: string;
}

const founders: Founder[] = [
  {
    name: 'Ridant',
    role: 'Founder & CEO',
    college: 'IIT Madras',
    bio: 'Visionary leader driving Trapy\'s mission to revolutionize how India travels. Passionate about building sustainable mobility solutions.',
    quote: 'Every shared ride is a step towards a greener, more connected India.',
    initials: 'R',
  },
  {
    name: 'Nikhil',
    role: 'Co-founder & CTO',
    college: 'VIT Bhopal',
    bio: 'Tech wizard behind Trapy\'s seamless platform. Building the infrastructure that makes ride-sharing safe and simple for millions.',
    quote: 'Technology should make life easier, and that\'s exactly what we\'re building at Trapy.',
    initials: 'N',
  },
  {
    name: 'Aditiya',
    role: 'Co-founder & CFO',
    college: 'Bennett University',
    bio: 'The financial strategist driving Trapy\'s growth. Ensuring sustainable business practices and smart investments for the future.',
    quote: 'Why travel alone when you can share the journey and make it memorable?',
    initials: 'A',
  },
];

export default function FoundersSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Our <span className="text-gradient">Founders</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The passionate team behind Trapy's vision of transforming India's travel landscape
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {founders.map((founder, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-soft hover:border-primary/20 transition-all group"
            >
              {/* Avatar */}
              <div className="relative mx-auto mb-6 w-24 h-24">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-emerald flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary-foreground">
                    {founder.initials}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-primary/30 transition-all" />
              </div>

              {/* Name & Role */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-1">{founder.name}</h3>
                <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-2">
                  {founder.role}
                </span>
                <p className="text-xs text-muted-foreground">{founder.college}</p>
              </div>

              {/* Bio */}
              <p className="text-muted-foreground text-sm text-center mb-6">
                {founder.bio}
              </p>

              {/* Quote */}
              <div className="relative bg-muted/50 rounded-xl p-4">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary/40" />
                <p className="text-sm italic text-foreground/80 text-center">
                  "{founder.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

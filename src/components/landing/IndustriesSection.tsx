import { motion } from 'framer-motion';
import {
  Tractor,
  Cloud,
  HeartPulse,
  Shield,
  Building2,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const industries = [
  {
    icon: Tractor,
    title: 'Agriculture',
    description: 'Optimize crop yields with vegetation indices, soil moisture, and evapotranspiration monitoring.',
    benefits: ['Precision irrigation', 'Yield prediction', 'Pest detection'],
    color: 'from-enviro-forest to-enviro-forest/50',
  },
  {
    icon: Cloud,
    title: 'Climate Research',
    description: 'Access decades of satellite data for climate modeling and environmental research.',
    benefits: ['Long-term trends', 'Carbon monitoring', 'Ecosystem analysis'],
    color: 'from-enviro-sky to-enviro-ocean',
  },
  {
    icon: HeartPulse,
    title: 'Public Health',
    description: 'Monitor air quality, heat islands, and environmental factors affecting human health.',
    benefits: ['AQI tracking', 'Heat alerts', 'Pollution mapping'],
    color: 'from-destructive to-enviro-sunset',
  },
  {
    icon: Shield,
    title: 'Insurance',
    description: 'Assess environmental risks and validate claims with objective satellite evidence.',
    benefits: ['Risk assessment', 'Damage verification', 'Portfolio analysis'],
    color: 'from-accent to-primary',
  },
  {
    icon: Building2,
    title: 'Urban Planning',
    description: 'Plan sustainable cities with land use analysis, heat mapping, and green space monitoring.',
    benefits: ['Heat mitigation', 'Green infrastructure', 'Development impact'],
    color: 'from-muted-foreground to-foreground',
  },
  {
    icon: Globe,
    title: 'NGOs & Conservation',
    description: 'Track deforestation, monitor protected areas, and measure conservation impact.',
    benefits: ['Deforestation alerts', 'Habitat monitoring', 'Impact reporting'],
    color: 'from-primary to-enviro-forest',
  },
];

export function IndustriesSection() {
  return (
    <section id="industries" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Building2 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Industry Solutions</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading mb-4"
          >
            Built for Every Industry
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-subheading mx-auto"
          >
            From agriculture to urban planning, EnviroGeo provides actionable environmental intelligence.
          </motion.p>
        </div>

        {/* Industry cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, index) => (
            <motion.div
              key={industry.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative glass-card-strong rounded-2xl p-6 overflow-hidden hover:scale-[1.02] transition-all duration-300"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${industry.color}`} />
              
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${industry.color} mb-4`}>
                <industry.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{industry.title}</h3>
              <p className="text-muted-foreground mb-4">{industry.description}</p>
              
              <ul className="space-y-2">
                {industry.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
              
              <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                Explore Solution
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

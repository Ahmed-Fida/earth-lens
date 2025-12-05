import { motion } from 'framer-motion';
import {
  Satellite,
  Map,
  BarChart3,
  Leaf,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Factory,
  Waves,
  Globe2,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Vegetation Indices',
    description: 'NDVI, EVI and custom indices for comprehensive vegetation health monitoring.',
    color: 'text-enviro-forest',
    bgColor: 'bg-enviro-forest/10',
  },
  {
    icon: Wind,
    title: 'Air Quality',
    description: 'Real-time NO2, SO2, CO, Aerosol Index and AQI from Sentinel-5P.',
    color: 'text-enviro-sky',
    bgColor: 'bg-enviro-sky/10',
  },
  {
    icon: Droplets,
    title: 'Soil Moisture',
    description: 'NASA SMAP data for agricultural planning and drought monitoring.',
    color: 'text-enviro-ocean',
    bgColor: 'bg-enviro-ocean/10',
  },
  {
    icon: CloudRain,
    title: 'Precipitation',
    description: 'CHIRPS daily rainfall data with historical analysis and forecasting.',
    color: 'text-enviro-ocean',
    bgColor: 'bg-enviro-ocean/10',
  },
  {
    icon: Thermometer,
    title: 'Surface Temperature',
    description: 'MODIS land surface temperature for urban heat island analysis.',
    color: 'text-enviro-sunset',
    bgColor: 'bg-enviro-sunset/10',
  },
  {
    icon: Waves,
    title: 'Evapotranspiration',
    description: 'Water loss monitoring for irrigation optimization and water management.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
];

const capabilities = [
  {
    icon: Map,
    title: 'Interactive Maps',
    description: 'Draw polygons, points, or rectangles to analyze any area on Earth.',
  },
  {
    icon: BarChart3,
    title: 'Time Series Analysis',
    description: 'Track changes over time with beautiful, exportable charts.',
  },
  {
    icon: Satellite,
    title: 'Multi-Source Data',
    description: 'Sentinel-2, MODIS, Landsat, and more — unified in one platform.',
  },
  {
    icon: Zap,
    title: 'AI Insights',
    description: 'Automated anomaly detection and trend analysis powered by machine learning.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Globe2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Environmental Parameters</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading mb-4"
          >
            Monitor Everything That Matters
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-subheading mx-auto"
          >
            Access real-time and historical satellite data for comprehensive environmental analysis.
          </motion.p>
        </div>

        {/* Parameter grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group glass-card rounded-2xl p-6 hover:enviro-glow transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Capabilities section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8 lg:p-12">
            {capabilities.map((cap, index) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                  <cap.icon className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

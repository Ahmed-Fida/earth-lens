import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What satellite data sources does EnviroGeo use?',
    answer:
      'EnviroGeo integrates data from multiple satellite sources including Sentinel-2 and Sentinel-5P (Copernicus), MODIS (NASA), Landsat (USGS), and CHIRPS rainfall data. This multi-source approach ensures comprehensive coverage and data accuracy.',
  },
  {
    question: 'How often is the data updated?',
    answer:
      'Update frequency varies by parameter and data source. Sentinel-5P air quality data is updated every 24 hours, while vegetation indices from Sentinel-2 are updated every 5 days. Land surface temperature and soil moisture are updated daily.',
  },
  {
    question: 'Can I access historical data?',
    answer:
      'Yes! Free accounts have access to 90 days of historical data, Pro accounts can access up to 10 years, and Enterprise accounts have access to the full archive dating back to the beginning of each satellite mission.',
  },
  {
    question: 'What file formats can I export?',
    answer:
      'EnviroGeo supports multiple export formats including CSV for time series data, PNG and SVG for charts and maps, PDF for full reports, and GeoTIFF for raster data (Pro and Enterprise).',
  },
  {
    question: 'Is there an API for programmatic access?',
    answer:
      'Yes, EnviroGeo provides a RESTful API for all analysis capabilities. Free accounts get 100 calls/month, Pro accounts get 10,000 calls/month, and Enterprise accounts have unlimited access.',
  },
  {
    question: 'How accurate is the data?',
    answer:
      'Our data comes directly from validated satellite missions and undergoes quality control. Vegetation indices are derived from atmospherically corrected reflectance data, and air quality measurements are from calibrated sensors. Accuracy varies by parameter — see our documentation for detailed specifications.',
  },
  {
    question: 'Can I analyze any location on Earth?',
    answer:
      'Yes! EnviroGeo provides global coverage. Simply draw a polygon, rectangle, or place a point marker anywhere on the map to analyze that area. Some parameters may have limited coverage in polar regions.',
  },
  {
    question: 'Do you offer custom integrations?',
    answer:
      'Enterprise customers can access custom integrations, including webhooks, private API endpoints, custom parameters, and integration with existing GIS systems. Contact our sales team to discuss your requirements.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <HelpCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">FAQ</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="section-subheading mx-auto"
          >
            Everything you need to know about EnviroGeo.
          </motion.p>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

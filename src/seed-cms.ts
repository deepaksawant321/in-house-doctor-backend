import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('Seeding CMS data...');

  try {
    // Check if faqs are already seeded
    const faqCount = await dataSource.query(`SELECT COUNT(*) as cnt FROM faqs`);
    if (faqCount[0].cnt === 0) {
      await dataSource.query(`
        INSERT INTO faqs (question, answer) VALUES 
        ('How quickly can a doctor arrive?', 'In most areas of Mumbai, a doctor can reach your home within 30–60 minutes of your confirmed request. Our intelligent dispatch system ensures the nearest available doctor is assigned to you.'),
        ('Are all doctors verified and licensed?', 'Absolutely. Every doctor on our platform undergoes a rigorous vetting process including license verification, background checks, and peer reviews before being approved to take home visits.'),
        ('How do payments work?', 'Payment is handled securely after the consultation. We accept all major UPI apps, credit/debit cards, and net banking. A detailed receipt is sent to your email after every visit.'),
        ('Can I book for a family member?', 'Yes, absolutely. You can book for any family member — parents, children, or elderly relatives. Just provide their details at the time of booking and the doctor will visit their location.'),
        ('What if I need to cancel or reschedule?', 'You can cancel or reschedule a booking up to 1 hour before the scheduled time at no charge. Cancellations within 1 hour of the visit may be subject to a nominal convenience fee.')
      `);
      console.log('Seeded FAQs.');
    } else {
      console.log('FAQs already seeded.');
    }

    const testCount = await dataSource.query(`SELECT COUNT(*) as cnt FROM testimonials`);
    if (testCount[0].cnt === 0) {
      await dataSource.query(`
        INSERT INTO testimonials (name, role, quote, rating) VALUES 
        ('Rahul Sharma', 'Patient, Bandra', 'InHouse Doctor is truly incredible. When my father had a fever at midnight, they sent a verified doctor within 45 minutes. The doctor was thorough, professional, and incredibly calming. This service is a game-changer.', 5),
        ('Priya Patel', 'Patient, Andheri', 'I was sceptical about home visits but InHouse Doctor exceeded my expectations. The doctor spent 40 minutes with me, addressed all my concerns, and followed up the next day. Absolutely remarkable service.', 5),
        ('Amit Kumar', 'Patient, Powai', 'For my elderly mother who cannot travel, InHouse Doctor has been a blessing. Regular visits from the same doctor means continuity of care. She actually looks forward to the visits now. Highly recommended.', 5),
        ('Sneha Mehta', 'Patient, Juhu', 'Booked physiotherapy sessions for my post-surgery recovery. The therapist was expert-level and the convenience of home sessions made recovery so much smoother. Cannot thank InHouse Doctor enough.', 5)
      `);
      console.log('Seeded Testimonials.');
    } else {
      console.log('Testimonials already seeded.');
    }

  } catch (err) {
    console.error('Error seeding data:', err);
  }

  await app.close();
}

bootstrap();

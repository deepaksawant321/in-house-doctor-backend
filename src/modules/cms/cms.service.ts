import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../../entities/faq.entity';
import { Testimonial } from '../../entities/testimonial.entity';
import { Service } from '../../entities/service.entity';
import { CmsBlock } from '../../entities/cms-block.entity';
import { StaticPage } from '../../entities/static-page.entity';

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(Faq)
    private faqRepo: Repository<Faq>,
    @InjectRepository(Testimonial)
    private testimonialRepo: Repository<Testimonial>,
    @InjectRepository(Service)
    private serviceRepo: Repository<Service>,
    @InjectRepository(CmsBlock)
    private cmsBlockRepo: Repository<CmsBlock>,
    @InjectRepository(StaticPage)
    private staticPageRepo: Repository<StaticPage>,
  ) {}

  // ─── FAQs ────────────────────────────────────────────────────────────────────
  async getActiveFaqs() {
    const faqs = await this.faqRepo.find({ where: { isActive: true }, order: { createdDate: 'ASC' } });
    return { success: true, data: faqs };
  }

  async getAllFaqs() {
    const faqs = await this.faqRepo.find({ order: { createdDate: 'ASC' } });
    return { success: true, data: faqs };
  }

  async createFaq(data: { question: string; answer: string }) {
    const faq = this.faqRepo.create(data);
    await this.faqRepo.save(faq);
    return { success: true, data: faq };
  }

  async updateFaq(id: number, data: Partial<Faq>) {
    const faq = await this.faqRepo.findOne({ where: { id } });
    if (!faq) throw new Error('Faq not found');
    Object.assign(faq, data);
    await this.faqRepo.save(faq);
    return { success: true, data: faq };
  }

  async deleteFaq(id: number) {
    await this.faqRepo.delete(id);
    return { success: true, message: 'Deleted successfully' };
  }

  // ─── Testimonials ─────────────────────────────────────────────────────────────
  async getActiveTestimonials() {
    const testimonials = await this.testimonialRepo.find({ where: { isActive: true }, order: { createdDate: 'DESC' } });
    return { success: true, data: testimonials };
  }

  async getAllTestimonials() {
    const testimonials = await this.testimonialRepo.find({ order: { createdDate: 'DESC' } });
    return { success: true, data: testimonials };
  }

  async createTestimonial(data: { name: string; role: string; quote: string; rating?: number }) {
    const testimonial = this.testimonialRepo.create(data);
    await this.testimonialRepo.save(testimonial);
    return { success: true, data: testimonial };
  }

  async updateTestimonial(id: number, data: Partial<Testimonial>) {
    const testimonial = await this.testimonialRepo.findOne({ where: { id } });
    if (!testimonial) throw new Error('Testimonial not found');
    Object.assign(testimonial, data);
    await this.testimonialRepo.save(testimonial);
    return { success: true, data: testimonial };
  }

  async deleteTestimonial(id: number) {
    await this.testimonialRepo.delete(id);
    return { success: true, message: 'Deleted successfully' };
  }

  // ─── Services ─────────────────────────────────────────────────────────────────
  async getActiveServices() {
    const services = await this.serviceRepo.find({ where: { isActive: true }, order: { serviceName: 'ASC' } });
    return { success: true, data: services };
  }

  async getAllServices() {
    const services = await this.serviceRepo.find({ order: { serviceName: 'ASC' } });
    return { success: true, data: services };
  }

  async createService(data: Partial<Service>) {
    const service = this.serviceRepo.create(data);
    await this.serviceRepo.save(service);
    return { success: true, data: service };
  }

  async updateService(id: number, data: Partial<Service>) {
    const service = await this.serviceRepo.findOne({ where: { id } });
    if (!service) throw new Error('Service not found');
    Object.assign(service, data);
    await this.serviceRepo.save(service);
    return { success: true, data: service };
  }

  async deleteService(id: number) {
    await this.serviceRepo.delete(id);
    return { success: true, message: 'Deleted successfully' };
  }

  // ─── CMS Blocks ─────────────────────────────────────────────────────────────
  async getActiveBlocks() {
    const blocks = await this.cmsBlockRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
    return { success: true, data: blocks };
  }

  async getAllBlocks() {
    const blocks = await this.cmsBlockRepo.find({ order: { sortOrder: 'ASC' } });
    return { success: true, data: blocks };
  }

  async createBlock(data: Partial<CmsBlock>) {
    const block = this.cmsBlockRepo.create(data);
    await this.cmsBlockRepo.save(block);
    return { success: true, data: block };
  }

  async updateBlock(id: number, data: Partial<CmsBlock>) {
    const block = await this.cmsBlockRepo.findOne({ where: { id } });
    if (!block) throw new NotFoundException('Block not found');
    Object.assign(block, data);
    await this.cmsBlockRepo.save(block);
    return { success: true, data: block };
  }

  async deleteBlock(id: number) {
    await this.cmsBlockRepo.delete(id);
    return { success: true, message: 'Deleted successfully' };
  }

  // ─── Static Pages ───────────────────────────────────────────────────────────
  async getPageBySlug(slug: string) {
    const page = await this.staticPageRepo.findOne({ where: { slug, isPublished: true } });
    if (!page) throw new NotFoundException('Page not found');
    return { success: true, data: page };
  }

  async getAllPages() {
    const pages = await this.staticPageRepo.find({ order: { title: 'ASC' } });
    return { success: true, data: pages };
  }

  async createPage(data: Partial<StaticPage>) {
    const page = this.staticPageRepo.create(data);
    await this.staticPageRepo.save(page);
    return { success: true, data: page };
  }

  async updatePage(id: number, data: Partial<StaticPage>) {
    const page = await this.staticPageRepo.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    Object.assign(page, data);
    await this.staticPageRepo.save(page);
    return { success: true, data: page };
  }

  async deletePage(id: number) {
    await this.staticPageRepo.delete(id);
    return { success: true, message: 'Deleted successfully' };
  }
}

import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { CmsService } from './cms.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('CMS')
@Controller('api/cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('faqs/all')
  @ApiOperation({ summary: 'Get all FAQs (Admin)' })
  getAllFaqs() {
    return this.cmsService.getAllFaqs();
  }

  @Get('faqs')
  @ApiOperation({ summary: 'Get all active FAQs for the public site' })
  getActiveFaqs() {
    return this.cmsService.getActiveFaqs();
  }

  @Post('faqs')
  @ApiOperation({ summary: 'Create a new FAQ' })
  createFaq(@Body() data: { question: string; answer: string }) {
    return this.cmsService.createFaq(data);
  }

  @Put('faqs/:id')
  @ApiOperation({ summary: 'Update FAQ' })
  updateFaq(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateFaq(+id, data);
  }

  @Delete('faqs/:id')
  @ApiOperation({ summary: 'Delete FAQ' })
  deleteFaq(@Param('id') id: string) {
    return this.cmsService.deleteFaq(+id);
  }

  @Get('testimonials/all')
  @ApiOperation({ summary: 'Get all Testimonials (Admin)' })
  getAllTestimonials() {
    return this.cmsService.getAllTestimonials();
  }

  @Get('testimonials')
  @ApiOperation({ summary: 'Get all active Testimonials for the public site' })
  getActiveTestimonials() {
    return this.cmsService.getActiveTestimonials();
  }

  @Post('testimonials')
  @ApiOperation({ summary: 'Create a new Testimonial' })
  createTestimonial(@Body() data: { name: string; role: string; quote: string; rating?: number }) {
    return this.cmsService.createTestimonial(data);
  }

  @Put('testimonials/:id')
  @ApiOperation({ summary: 'Update Testimonial' })
  updateTestimonial(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateTestimonial(+id, data);
  }

  @Delete('testimonials/:id')
  @ApiOperation({ summary: 'Delete Testimonial' })
  deleteTestimonial(@Param('id') id: string) {
    return this.cmsService.deleteTestimonial(+id);
  }

  @Get('services/all')
  @ApiOperation({ summary: 'Get all Services (Admin)' })
  getAllServices() {
    return this.cmsService.getAllServices();
  }

  @Get('services')
  @ApiOperation({ summary: 'Get all active Services for the public site' })
  getActiveServices() {
    return this.cmsService.getActiveServices();
  }

  @Post('services')
  @ApiOperation({ summary: 'Create a new Service' })
  createService(@Body() data: any) {
    return this.cmsService.createService(data);
  }

  @Put('services/:id')
  @ApiOperation({ summary: 'Update Service' })
  updateService(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateService(+id, data);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Delete Service' })
  deleteService(@Param('id') id: string) {
    return this.cmsService.deleteService(+id);
  }

  // ─── CMS Blocks ─────────────────────────────────────────────────────────────

  @Get('blocks/all')
  @ApiOperation({ summary: 'Get all Blocks (Admin)' })
  getAllBlocks() {
    return this.cmsService.getAllBlocks();
  }

  @Get('blocks')
  @ApiOperation({ summary: 'Get all active Blocks for the public site' })
  getActiveBlocks() {
    return this.cmsService.getActiveBlocks();
  }

  @Post('blocks')
  @ApiOperation({ summary: 'Create a new CMS Block' })
  createBlock(@Body() data: any) {
    return this.cmsService.createBlock(data);
  }

  @Put('blocks/:id')
  @ApiOperation({ summary: 'Update CMS Block' })
  updateBlock(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateBlock(+id, data);
  }

  @Delete('blocks/:id')
  @ApiOperation({ summary: 'Delete CMS Block' })
  deleteBlock(@Param('id') id: string) {
    return this.cmsService.deleteBlock(+id);
  }

  // ─── Static Pages ───────────────────────────────────────────────────────────

  @Get('pages/all')
  @ApiOperation({ summary: 'Get all Static Pages (Admin)' })
  getAllPages() {
    return this.cmsService.getAllPages();
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get a Static Page by slug' })
  getPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.getPageBySlug(slug);
  }

  @Post('pages')
  @ApiOperation({ summary: 'Create a new Static Page' })
  createPage(@Body() data: any) {
    return this.cmsService.createPage(data);
  }

  @Put('pages/:id')
  @ApiOperation({ summary: 'Update Static Page' })
  updatePage(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updatePage(+id, data);
  }

  @Delete('pages/:id')
  @ApiOperation({ summary: 'Delete Static Page' })
  deletePage(@Param('id') id: string) {
    return this.cmsService.deletePage(+id);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { Faq } from '../../entities/faq.entity';
import { Testimonial } from '../../entities/testimonial.entity';
import { Service } from '../../entities/service.entity';
import { CmsBlock } from '../../entities/cms-block.entity';
import { StaticPage } from '../../entities/static-page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Faq, Testimonial, Service, CmsBlock, StaticPage])],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}

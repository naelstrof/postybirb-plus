import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { DefaultFileOptions } from '../../interfaces/submission/default-options.interface';
import { NewTumblNotificationOptions } from '../../interfaces/websites/new-tumbl/new-tumbl.notification.options.interface';
import { DefaultValue } from '../../models/decorators/default-value.decorator';
import { DefaultFileOptionsEntity } from '../../models/default-file-options.entity';

export class NewTumblNotificationOptionsEntity extends DefaultFileOptionsEntity
  implements NewTumblNotificationOptions {
  @Expose()
  @IsString()
  @DefaultValue('')
  blog!: string;

  constructor(entity: Partial<NewTumblNotificationOptions>) {
    super(entity as DefaultFileOptions);
  }
}

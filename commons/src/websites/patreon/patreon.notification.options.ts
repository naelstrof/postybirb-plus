import { Expose } from 'class-transformer';
import { IsArray, IsBoolean } from 'class-validator';
import { DefaultFileOptions } from '../../interfaces/submission/default-options.interface';
import { PatreonNotificationOptions } from '../../interfaces/websites/patreon/patreon.notification.options.interface';
import { DefaultValue } from '../../models/decorators/default-value.decorator';
import { DefaultFileOptionsEntity } from '../../models/default-file-options.entity';

export class PatreonNotificationOptionsEntity extends DefaultFileOptionsEntity
  implements PatreonNotificationOptions {
  @Expose()
  @IsArray()
  @DefaultValue([])
  tiers!: string[];

  @Expose()
  @IsBoolean()
  @DefaultValue(false)
  charge!: boolean;

  constructor(entity: Partial<PatreonNotificationOptions>) {
    super(entity as DefaultFileOptions);
  }
}

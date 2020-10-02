import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { DefaultFileOptions } from '../../interfaces/submission/default-options.interface';
import { MastodonNotificationOptions } from '../../interfaces/websites/mastodon/mastodon.notification.options.interface';
import { DefaultValue } from '../../models/decorators/default-value.decorator';
import { DefaultFileOptionsEntity } from '../../models/default-file-options.entity';

export class MastodonNotificationOptionsEntity extends DefaultFileOptionsEntity
  implements MastodonNotificationOptions {
  @Expose()
  @IsBoolean()
  @DefaultValue(false)
  useTitle!: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  spoilerText?: string;

  constructor(entity: Partial<MastodonNotificationOptions>) {
    super(entity as DefaultFileOptions);
  }
}

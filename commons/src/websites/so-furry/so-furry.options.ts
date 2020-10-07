import { DefaultOptionsEntity } from '../../models/default-options.entity';
import { SoFurryFileOptionsEntity } from './so-furry.file.options';

export class SoFurry {
  static readonly FileOptions = SoFurryFileOptionsEntity;
  static readonly NotificationOptions = DefaultOptionsEntity;
}

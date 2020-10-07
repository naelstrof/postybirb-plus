import { DefaultOptionsEntity } from '../../models/default-options.entity';
import { WeasylFileOptionsEntity } from './weasyl.file.optionts';

export class Weasyl {
  static readonly FileOptions = WeasylFileOptionsEntity;
  static readonly NotificationOptions = DefaultOptionsEntity;
}

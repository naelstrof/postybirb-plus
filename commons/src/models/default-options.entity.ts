import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  validateSync,
  validate,
} from 'class-validator';
import { SubmissionRating } from '../enums/submission-rating.enum';
import { DefaultOptions } from '../interfaces/submission/default-options.interface';
import { DescriptionData } from '../interfaces/submission/description-data.interface';
import { TagData } from '../interfaces/submission/tag-data.interface';
import { classToPlain } from 'class-transformer';

export class DefaultOptionsEntity implements DefaultOptions {
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsNotEmpty()
  tags: TagData;

  @IsNotEmpty()
  description: DescriptionData;

  @IsOptional()
  rating: SubmissionRating | string | null;

  @IsArray()
  sources: string[];

  constructor(entity: Partial<DefaultOptionsEntity>) {
    this.rating = null;
    this.sources = [];

    this.tags = {
      value: [],
      extendDefault: true,
    };

    this.description = {
      value: '',
      overwriteDefault: false,
    };

    Object.assign(this, entity);
  }

  protected assignIfEmpty(prop: keyof this, value: any, defaultValue?: any): void {
    if (this[prop] === undefined) {
      if (value !== undefined) {
        this[prop] = value;
      } else {
        this[prop] = defaultValue;
      }
    }
  }

  public validateSync() {
    return validateSync(this);
  }

  public validate() {
    return validate(this);
  }

  public asPlain<T>(): T {
    return classToPlain(this) as T;
  }
}

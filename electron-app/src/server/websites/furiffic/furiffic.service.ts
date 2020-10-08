import { Injectable } from '@nestjs/common';
import {
  DefaultOptions,
  FileRecord,
  FileSubmission,
  FileSubmissionType,
  PostResponse,
  Submission,
  SubmissionPart,
  SubmissionRating,
} from 'postybirb-commons';
import UserAccountEntity from 'src/server//account/models/user-account.entity';
import { BBCodeParser } from 'src/server/description-parsing/bbcode/bbcode.parser';
import { UsernameParser } from 'src/server/description-parsing/miscellaneous/username.parser';
import ImageManipulator from 'src/server/file-manipulation/manipulators/image.manipulator';
import Http from 'src/server/http/http.util';
import { CancellationToken } from 'src/server/submission/post/cancellation/cancellation-token';
import { FilePostData } from 'src/server/submission/post/interfaces/file-post-data.interface';
import { PostData } from 'src/server/submission/post/interfaces/post-data.interface';
import { ValidationParts } from 'src/server/submission/validator/interfaces/validation-parts.interface';
import FileSize from 'src/server/utils/filesize.util';
import WebsiteValidator from 'src/server/utils/website-validator.util';
import { LoginResponse } from '../interfaces/login-response.interface';
import { ScalingOptions } from '../interfaces/scaling-options.interface';
import { Website } from '../website.base';
import { FurifficOptions } from './furiffic.interface';

@Injectable()
export class Furiffic extends Website {
  readonly BASE_URL: string = 'https://www.furiffic.com';
  readonly acceptsFiles: string[] = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'tiff',
    'tif',
    'doc',
    'docx',
    'rtf',
    'pdf',
    'txt',
    'swf',
    'flv',
    'mp3',
    'mp4',
  ];

  readonly defaultDescriptionParser = BBCodeParser.parse;
  readonly usernameShortcuts = [
    {
      key: 'fr',
      url: 'https://www.furiffic.com/$1/info',
    },
  ];

  async checkLoginStatus(data: UserAccountEntity): Promise<LoginResponse> {
    const status: LoginResponse = { loggedIn: false, username: null, data: { username: null } };
    const res = await Http.get<string>(this.BASE_URL, data._id);
    if (res.body.includes('logout')) {
      status.loggedIn = true;
      status.username = res.body.match(/"username":"(.*?)"/)[1].trim();
      status.data.username = status.username;
      this.storeAccountInformation(data._id, 'username', status.username);
    }
    return status;
  }

  getScalingOptions(file: FileRecord): ScalingOptions {
    return { maxSize: FileSize.MBtoBytes(25) };
  }

  preparseDescription(text: string): string {
    return UsernameParser.replaceText(text, 'fr', '[profile=$1=iconName]$1[/profile]');
  }

  parseDescription(text: string): string {
    return super
      .parseDescription(text)
      .replace(/\[hr\]/gm, '\n----------\n')
      .replace(/\n/gm, '[lb]')
      .replace(/(\[size=\d+\]|\[\/size\])/g, '') // does not support our size tag
      .replace(/\[right\]/g, '[align=right]')
      .replace(/\[center\]/g, '[align=center]')
      .replace(/(\[\/center\]|\[\/right\])/g, '[/align]');
  }

  postParseDescription(text: string): string {
    return text.replace(/\n/gm, '[lb]\n');
  }

  private getRating(rating: SubmissionRating) {
    switch (rating) {
      case SubmissionRating.MATURE:
        return 'mature';
      case SubmissionRating.ADULT:
      case SubmissionRating.EXTREME:
        return 'adult';
      case SubmissionRating.GENERAL:
      default:
        return 'tame';
    }
  }

  async postNotificationSubmission(
    cancellationToken: CancellationToken,
    data: PostData<Submission, FurifficOptions>,
  ): Promise<PostResponse> {
    const username = this.getAccountInfo(data.part.accountId).username;
    const res = await Http.get<string>(
      `${this.BASE_URL}/${username}/journals/create`,
      data.part.accountId,
    );
    this.verifyResponse(res);

    const { body } = res;
    const form = {
      type: 'textual',
      name: data.title,
      link: '',
      body: `[p]${data.description}[/p]`,
      shortDescription: data.description.split(/(\.|\?|\!|\[lb\])/)[0],
      thumbnailReset: '',
      thumbnailFile: '',
      visibility: 'public',
      rating: this.getRating(data.rating),
      'tags[]': this.formatTags(data.tags),
      __csrf: body.match(/window\.csrfSeed\s=\s(.*?);/)[1].trim(),
    };

    const postResponse = await Http.post(
      `${this.BASE_URL}/${username}/journals/create`,
      data.part.accountId,
      {
        type: 'multipart',
        data: form,
        requestOptions: { qsStringifyOptions: { arrayFormat: 'repeat' } },
      },
    );

    this.verifyResponse(postResponse);
    return this.createPostResponse({});
  }

  async postFileSubmission(
    cancellationToken: CancellationToken,
    data: FilePostData<FurifficOptions>,
  ): Promise<PostResponse> {
    let postFile = data.primary.file;
    if (data.primary.type === FileSubmissionType.TEXT) {
      if (!WebsiteValidator.supportsFileType(data.submission.primary, this.acceptsFiles)) {
        postFile = data.fallback;
      }
    }

    const fileData: any = {
      'items[0][name]': postFile.options.filename,
      'items[0][mimeType]': postFile.options.contentType,
      'items[0][size]': postFile.value.length,
      'items[0][clientId]': '',
    };

    const username = this.getAccountInfo(data.part.accountId).username;
    this.checkCancelled(cancellationToken);
    const preUploadResponse = await Http.post<any>(
      `${this.BASE_URL}/${username}/gallery/preupload`,
      data.part.accountId,
      {
        type: 'multipart',
        data: fileData,
        requestOptions: { json: true },
      },
    );

    this.verifyResponse(preUploadResponse, 'Pre-Upload');
    const id = preUploadResponse.body[''].id;

    const uploadData = {
      id,
      file: postFile,
    };

    this.checkCancelled(cancellationToken);
    const fileResponse = await Http.post<string>(
      `${this.BASE_URL}/${username}/gallery/upload`,
      data.part.accountId,
      {
        type: 'multipart',
        data: uploadData,
      },
    );
    this.verifyResponse(fileResponse, 'File Response');

    this.checkCancelled(cancellationToken);
    const formResponse = await Http.post(
      `${this.BASE_URL}/${username}/gallery/uploaddata`,
      data.part.accountId,
      {
        type: 'multipart',
        data: {
          'mediaIds[]': id,
        },
        requestOptions: { json: true },
      },
    );
    this.verifyResponse(formResponse, 'Form Response');

    const formData: any = formResponse.body;
    const infoData: any = {
      name: data.title.substring(0, 75),
      rating: this.getRating(data.rating),
      category: formData[0].category,
      visibility: 'public',
      folderVisibility: 'any',
      description: `[p]${data.description}[/p]`,
      'tags[]': this.formatTags(data.tags),
    };

    if (data.thumbnail) {
      infoData.thumbnailFile = data.thumbnail;
      infoData['thumbnail[size][height]'] = '375';
      infoData['thumbnail[size][width]'] = '300';
      infoData['thumbnail[center][x]'] = '150';
      infoData['thumbnail[center][y]'] = '187.5';
      infoData['thumbnail[scale]'] = '0';
    } else {
      infoData.thumbnailfile = '';
    }

    this.checkCancelled(cancellationToken);
    const editResponse = await Http.post<string>(
      `${this.BASE_URL}/${username}/edit/${id}`,
      data.part.accountId,
      {
        type: 'multipart',
        data: infoData,
        requestOptions: {
          qsStringifyOptions: { arrayFormat: 'repeat' },
        },
      },
    );
    this.verifyResponse(editResponse, 'Edit');

    this.checkCancelled(cancellationToken);
    const postResponse = await Http.post(
      `${this.BASE_URL}/${username}/gallery/publish`,
      data.part.accountId,
      {
        type: 'multipart',
        data: {
          'ids[]': id,
        },
      },
    );
    this.verifyResponse(postResponse, 'Post');

    return this.createPostResponse({});
  }

  validateFileSubmission(
    submission: FileSubmission,
    submissionPart: SubmissionPart<FurifficOptions>,
    defaultPart: SubmissionPart<DefaultOptions>,
  ): ValidationParts {
    const problems: string[] = [];
    const warnings: string[] = [];
    const isAutoscaling: boolean = submissionPart.data.autoScale;

    const title = submissionPart.data.title || defaultPart.data.title || submission.title;
    if (title.length > 75) {
      warnings.push(`Title will be truncated to 75 characters: ${title.substring(0, 75)}`);
    }

    const files = [
      submission.primary,
      ...(submission.additional || []).filter(
        f => !f.ignoredAccounts!.includes(submissionPart.accountId),
      ),
    ];

    if (!WebsiteValidator.supportsFileType(submission.primary, this.acceptsFiles)) {
      if (submission.primary.type === FileSubmissionType.TEXT && !submission.fallback) {
        problems.push(
          `Does not support file format: (${submission.primary.name}) ${submission.primary.mimetype}.`,
        );
        problems.push('A fallback file is required.');
      } else if (submission.primary.type === FileSubmissionType.TEXT && submission.fallback) {
        warnings.push('The fallback text will be used.');
      } else {
        problems.push(
          `Does not support file format: (${submission.primary.name}) ${submission.primary.mimetype}.`,
        );
      }
    }

    (submission.additional || []).forEach(file => {
      const { name, mimetype } = file;
      if (!WebsiteValidator.supportsFileType(file, this.acceptsFiles)) {
        problems.push(`Does not support file format: (${name}) ${mimetype}.`);
      }
    });

    files.forEach(file => {
      const { type, size, name, mimetype } = file;
      const maxMB: number = 25;
      if (FileSize.MBtoBytes(maxMB) < size) {
        if (
          isAutoscaling &&
          type === FileSubmissionType.IMAGE &&
          ImageManipulator.isMimeType(mimetype)
        ) {
          warnings.push(`${name} will be scaled down to ${maxMB}MB`);
        } else {
          problems.push(`Furiffic limits ${mimetype} to ${maxMB}MB`);
        }
      }
    });

    return { problems, warnings };
  }

  parseTags(tags: string[]): string[] {
    return super
      .parseTags(tags)
      .map(t => t.replace(/-/gm, ' ').replace(/(\/|\\)/gm, ''))
      .slice(0, 30);
  }
}

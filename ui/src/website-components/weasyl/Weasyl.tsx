import React from 'react';
import _ from 'lodash';
import { Website, LoginDialogProps } from '../interfaces/website.interface';
import { GenericLoginDialog } from '../generic/GenericLoginDialog';
import { FileSubmissionSectionProps } from '../../views/submissions/interfaces/file-submission-section.interface';
import { DefaultWeasylSubmissionOptions } from '../../../../electron-app/src/websites/weasyl/weasyl.interface';
import TagInput from '../../views/submissions/form-components/TagInput';
import DescriptionInput from '../../views/submissions/form-components/DescriptionInput';
import { SubmissionPart } from '../../../../electron-app/src/submission/interfaces/submission-part.interface';
import { Folder } from '../../../../electron-app/src/websites/interfaces/folder.interface';
import { Alert, Form, Input, Radio, Checkbox, Select } from 'antd';
import WebsiteService from '../../services/website.service';

const defaultOptions: DefaultWeasylSubmissionOptions = {
  title: undefined,
  useThumbnail: true,
  notify: true,
  critique: false,
  folder: null,
  category: null,
  tags: {
    extendDefault: true,
    value: []
  },
  description: {
    overwriteDefault: false,
    value: ''
  },
  rating: null
};

export class Weasyl implements Website {
  name: string = 'Weasyl';
  LoginDialog = (props: LoginDialogProps) => (
    <GenericLoginDialog url="https://www.weasyl.com/signin" {...props} />
  );

  FileSubmissionForm = (props: FileSubmissionSectionProps<any>) => (
    <WeasylFileSubmissionForm key={props.part.accountId} {...props} />
  );

  getDefaults() {
    return _.cloneDeep(defaultOptions);
  }
}

interface WeasylFileSubmissionState {
  problems: string[];
  folders: Folder[];
}

export class WeasylFileSubmissionForm extends React.Component<
  FileSubmissionSectionProps<DefaultWeasylSubmissionOptions>,
  WeasylFileSubmissionState
> {
  state: WeasylFileSubmissionState = {
    problems: [],
    folders: []
  };

  private readonly defaultOptions: DefaultWeasylSubmissionOptions = _.cloneDeep(defaultOptions);

  private categoryMap = {
    IMAGE: [
      {
        id: '1010',
        name: 'Sketch'
      },
      {
        id: '1020',
        name: 'Traditional'
      },
      {
        id: '1030',
        name: 'Digital'
      },
      {
        id: '1040',
        name: 'Animation'
      },
      {
        id: '1050',
        name: 'Photography'
      },
      {
        id: '1060',
        name: 'Design / Interface'
      },
      {
        id: '1070',
        name: 'Modeling / Sculpture'
      },
      {
        id: '1075',
        name: 'Crafts / Jewelry'
      },
      {
        id: '1080',
        name: 'Desktop / Wallpaper'
      },
      {
        id: '1999',
        name: 'Other'
      }
    ],
    TEXT: [
      {
        id: '2010',
        name: 'Story'
      },
      {
        id: '2020',
        name: 'Poetry / Lyrics'
      },
      {
        id: '2030',
        name: 'Script / Screenplay'
      },
      {
        id: '2999',
        name: 'Other'
      }
    ],
    VIDEO: [
      {
        id: '3500',
        name: 'Embedded Video'
      },
      {
        id: '3999',
        name: 'Other'
      }
    ],
    AUDIO: [
      {
        id: '3010',
        name: 'Original Music'
      },
      {
        id: '3020',
        name: 'Cover Version'
      },
      {
        id: '3030',
        name: 'Remix / Mashup'
      },
      {
        id: '3040',
        name: 'Speech / Reading'
      },
      {
        id: '3999',
        name: 'Other'
      }
    ]
  };

  constructor(props: FileSubmissionSectionProps<DefaultWeasylSubmissionOptions>) {
    super(props);
    this.state = {
      problems: props.problems || [],
      folders: []
    };

    // Not sure if I should move this call elsewhere
    WebsiteService.getAccountInformation(this.props.part.website, this.props.part.accountId).then(
      ({ data }) => {
        if (data.folders) {
          if (!_.isEqual(this.state.folders, data.folders)) {
            this.setState({ folders: data.folders });
          }
        }
      }
    );
  }

  handleChange(fieldName: string, { target }) {
    const part: SubmissionPart<DefaultWeasylSubmissionOptions> = _.cloneDeep(this.props.part);
    part.data[fieldName] = target.value;
    this.props.onUpdate(part);
  }

  handleTagChange(update: any) {
    const part: SubmissionPart<DefaultWeasylSubmissionOptions> = _.cloneDeep(this.props.part);
    part.data.tags = update;
    this.props.onUpdate(part);
  }

  handleDescriptionChange(update) {
    const part: SubmissionPart<DefaultWeasylSubmissionOptions> = _.cloneDeep(this.props.part);
    part.data.description = update;
    this.props.onUpdate(part);
  }

  handleSelectChange(fieldName: string, value: any) {
    const part: SubmissionPart<DefaultWeasylSubmissionOptions> = _.cloneDeep(this.props.part);
    part.data[fieldName] = value;
    this.props.onUpdate(part);
  }

  handleCheckboxChange(fieldName: string, { target }) {
    const part: SubmissionPart<DefaultWeasylSubmissionOptions> = _.cloneDeep(this.props.part);
    part.data[fieldName] = target.checked;
    this.props.onUpdate(part);
  }

  render() {
    const { data } = this.props.part;
    return (
      <div>
        {this.props.problems.length ? (
          <Alert
            type="error"
            message={
              <ul>
                {this.props.problems.map(problem => (
                  <li>{problem}</li>
                ))}
              </ul>
            }
          />
        ) : null}
        <div>
          <Form.Item label="Title">
            <Input
              placeholder="Using default"
              value={data.title}
              onChange={this.handleChange.bind(this, 'title')}
            />
          </Form.Item>
          <Form.Item label="Rating">
            <Radio.Group
              onChange={this.handleChange.bind(this, 'rating')}
              value={data.rating}
              buttonStyle="solid"
            >
              <Radio.Button value={null}>Default</Radio.Button>
              <Radio.Button value="10">General</Radio.Button>
              <Radio.Button value="30">Mature (18+ non-sexual)</Radio.Button>
              <Radio.Button value="40">Explicit (18+ sexual)</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <TagInput
            onChange={this.handleTagChange.bind(this)}
            defaultValue={data.tags}
            defaultTags={this.props.defaultData!.tags}
            label="Tags"
            tagOptions={{
              minTags: 2
            }}
          />
          <DescriptionInput
            defaultValue={data.description}
            onChange={this.handleDescriptionChange.bind(this)}
            label="Description"
          />
          <Form.Item>
            <div className="flex">
              <div className="w-1/2">
                <div>
                  <Checkbox
                    checked={data.useThumbnail}
                    onChange={this.handleCheckboxChange.bind(this, 'useThumbnail')}
                  >
                    Use thumbnail (if provided)
                  </Checkbox>
                </div>
                <div>
                  <Checkbox
                    checked={data.notify}
                    onChange={this.handleCheckboxChange.bind(this, 'notify')}
                  >
                    Notify
                  </Checkbox>
                </div>
                <div>
                  <Checkbox
                    checked={data.critique}
                    onChange={this.handleCheckboxChange.bind(this, 'critique')}
                  >
                    Flag this submission for critique
                  </Checkbox>
                </div>
              </div>
              <div className="w-1/2">
                <Form.Item label="Category">
                  <Select
                    style={{ width: '100%' }}
                    value={data.category}
                    onSelect={this.handleSelectChange.bind(this, 'category')}
                  >
                    {this.categoryMap[this.props.submission.primary.type].map(item => (
                      <Select.Option value={item.id}>{item.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Folder">
                  <Select
                    style={{ width: '100%' }}
                    value={data.folder}
                    onSelect={this.handleSelectChange.bind(this, 'folder')}
                  >
                    {this.state.folders.map(f => (
                      <Select.Option value={f.id}>{f.title}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </Form.Item>
        </div>
      </div>
    );
  }
}
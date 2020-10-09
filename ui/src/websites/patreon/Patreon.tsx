import { Checkbox, Form, Select } from 'antd';
import _ from 'lodash';
import {
  FileSubmission,
  Folder,
  PatreonFileOptions,
  PatreonNotificationOptions,
  Submission
} from 'postybirb-commons';
import React from 'react';
import WebsiteService from '../../services/website.service';
import { WebsiteSectionProps } from '../form-sections/website-form-section.interface';
import GenericFileSubmissionSection from '../generic/GenericFileSubmissionSection';
import { GenericSelectProps } from '../generic/GenericSelectProps';
import GenericSubmissionSection from '../generic/GenericSubmissionSection';
import { WebsiteImpl } from '../website.base';

export class Patreon extends WebsiteImpl {
  internalName: string = 'Patreon';
  name: string = 'Patreon';
  supportsAdditionalFiles: boolean = true;
  supportsTags: boolean = true;
  loginUrl: string = 'https://www.patreon.com/login';

  FileSubmissionForm = (props: WebsiteSectionProps<FileSubmission, PatreonFileOptions>) => (
    <PatreonFileSubmissionForm
      key={props.part.accountId}
      hideTitle={true}
      ratingOptions={{
        show: false
      }}
      tagOptions={{
        show: true,
        options: {
          maxTags: 50
        }
      }}
      {...props}
    />
  );

  NotificationSubmissionForm = (
    props: WebsiteSectionProps<Submission, PatreonNotificationOptions>
  ) => (
    <PatreonNotificationSubmissionForm
      key={props.part.accountId}
      hideTitle={true}
      ratingOptions={{
        show: false
      }}
      tagOptions={{
        show: true,
        options: {
          maxTags: 50
        }
      }}
      {...props}
    />
  );
}

interface PatreonSubmissionState {
  folders: Folder[];
}

export class PatreonNotificationSubmissionForm extends GenericSubmissionSection<
  PatreonNotificationOptions
> {
  state: PatreonSubmissionState = {
    folders: []
  };

  constructor(props: WebsiteSectionProps<FileSubmission, PatreonNotificationOptions>) {
    super(props);
    this.state = {
      folders: []
    };

    WebsiteService.getAccountFolders(this.props.part.website, this.props.part.accountId).then(
      ({ data }) => {
        if (data) {
          if (!_.isEqual(this.state.folders, data)) {
            this.setState({ folders: data });
          }
        }
      }
    );
  }

  renderLeftForm(data: PatreonNotificationOptions) {
    const elements = super.renderLeftForm(data);
    elements.push(
      <div>
        <Checkbox checked={data.charge} onChange={this.handleCheckedChange.bind(this, 'charge')}>
          Charge patrons{' '}
          <small>
            (Patrons will be charged their pledge amount for this post on the first of next month.)
          </small>
        </Checkbox>
      </div>
    );
    return elements;
  }

  renderRightForm(data: PatreonFileOptions) {
    const elements = super.renderRightForm(data);
    elements.push(
      <Form.Item label="Access Tiers">
        <Select
          {...GenericSelectProps}
          className="w-full"
          value={data.tiers}
          mode="multiple"
          onChange={this.setValue.bind(this, 'tiers')}
          allowClear
        >
          {this.state.folders.map(f =>
            f.children && f.children.length ? (
              <Select.OptGroup label={f.label}>
                {f.children.map(c => (
                  <Select.Option value={c.value}>{c.label}</Select.Option>
                ))}
              </Select.OptGroup>
            ) : (
              <Select.Option value={f.value}>{f.label}</Select.Option>
            )
          )}
        </Select>
      </Form.Item>
    );
    return elements;
  }
}

export class PatreonFileSubmissionForm extends GenericFileSubmissionSection<PatreonFileOptions> {
  state: PatreonSubmissionState = {
    folders: []
  };

  constructor(props: WebsiteSectionProps<FileSubmission, PatreonFileOptions>) {
    super(props);
    this.state = {
      folders: []
    };

    WebsiteService.getAccountFolders(this.props.part.website, this.props.part.accountId).then(
      ({ data }) => {
        if (data) {
          if (!_.isEqual(this.state.folders, data)) {
            this.setState({ folders: data });
          }
        }
      }
    );
  }

  renderLeftForm(data: PatreonFileOptions) {
    const elements = super.renderLeftForm(data);
    elements.push(
      <div>
        <Checkbox checked={data.charge} onChange={this.handleCheckedChange.bind(this, 'charge')}>
          Charge patrons{' '}
          <small>
            (Patrons will be charged their pledge amount for this post on the first of next month.)
          </small>
        </Checkbox>
      </div>
    );
    return elements;
  }

  renderRightForm(data: PatreonFileOptions) {
    const elements = super.renderRightForm(data);
    elements.push(
      <Form.Item label="Access Tiers">
        <Select
          {...GenericSelectProps}
          className="w-full"
          value={data.tiers}
          mode="multiple"
          onChange={this.setValue.bind(this, 'tiers')}
          allowClear
        >
          {this.state.folders.map(f =>
            f.children && f.children.length ? (
              <Select.OptGroup label={f.label}>
                {f.children.map(c => (
                  <Select.Option value={c.value}>{c.label}</Select.Option>
                ))}
              </Select.OptGroup>
            ) : (
              <Select.Option value={f.value}>{f.label}</Select.Option>
            )
          )}
        </Select>
      </Form.Item>
    );
    return elements;
  }
}

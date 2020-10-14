import React from 'react';
import _ from 'lodash';
import { WebsiteSectionProps } from './website-form-section.interface';
import { Submission } from 'postybirb-commons';
import { DefaultOptions } from 'postybirb-commons';
import { SubmissionPart } from 'postybirb-commons';
import SectionProblems from '../../views/submissions/submission-forms/form-sections/SectionProblems';
import { Form, Input, Radio } from 'antd';
import TagInput from '../../views/submissions/submission-forms/form-components/TagInput';
import DescriptionInput from '../../views/submissions/submission-forms/form-components/DescriptionInput';
import { SubmissionRating } from 'postybirb-commons';

export default abstract class WebsiteFormSection<
  T extends Submission,
  K extends DefaultOptions
> extends React.Component<WebsiteSectionProps<T, K>, any> {
  protected setValue(fieldName: keyof K, value: any) {
    const part: SubmissionPart<K> = _.cloneDeep(this.props.part);
    _.set(part.data, fieldName, value);
    this.props.onUpdate(part);
  }

  handleValueChange(fieldName: keyof K, event: { target: { value?: any } }) {
    this.setValue(fieldName, event.target.value);
  }

  handleCheckedChange(fieldName: keyof K, event: { target: { checked: boolean } }) {
    this.setValue(fieldName, event.target.checked);
  }

  private getRatings(): JSX.Element[] {
    const ratings = [<Radio.Button value={undefined}>Default</Radio.Button>];

    if (this.props.ratingOptions && this.props.ratingOptions.ratings) {
      ratings.push(
        ...this.props.ratingOptions.ratings.map(rating => (
          <Radio.Button value={rating.value}>{rating.name}</Radio.Button>
        ))
      );
    } else {
      ratings.push(
        <Radio.Button value={SubmissionRating.GENERAL}>General</Radio.Button>,
        <Radio.Button value={SubmissionRating.MATURE}>Mature</Radio.Button>,
        <Radio.Button value={SubmissionRating.ADULT}>Adult</Radio.Button>,
        <Radio.Button value={SubmissionRating.EXTREME}>Extreme</Radio.Button>
      );
    }

    return ratings;
  }

  abstract renderLeftForm(data: K): JSX.Element[];
  abstract renderRightForm(data: K): JSX.Element[];
  renderWideForm(data: K): JSX.Element[] {
    return [];
  }

  render(): JSX.Element {
    const { data } = this.props.part;
    const showRating = _.get(this.props.ratingOptions, 'show', false);
    const showTags = _.get(this.props.tagOptions, 'show', true);
    const showDescription = _.get(this.props.descriptionOptions, 'show', true);
    const hideTitle = !!this.props.hideTitle;
    const wideForm = this.renderWideForm(data);
    const rightForm = this.renderRightForm(data);
    const leftForm = this.renderLeftForm(data);
    return (
      <div>
        <SectionProblems problems={this.props.problems} />
        <div>
          {hideTitle ? null : (
            <Form.Item label="Title">
              <Input
                placeholder="Using default"
                value={data.title}
                onChange={this.handleValueChange.bind(this, 'title')}
              />
            </Form.Item>
          )}
          {showTags ? (
            <TagInput
              onChange={this.setValue.bind(this, 'tags')}
              defaultValue={data.tags}
              defaultTags={this.props.defaultData!.tags}
              label="Tags"
              tagOptions={_.get(this.props.tagOptions, 'options')}
            />
          ) : null}
          {showDescription ? (
            <DescriptionInput
              defaultValue={data.description}
              onChange={this.setValue.bind(this, 'description')}
              label="Description"
              overwriteDescriptionValue={_.get(this.props.defaultData, 'description.value')}
              anchorLength={_.get(this.props.descriptionOptions, 'options.anchorLength')}
              lengthParser={_.get(this.props.descriptionOptions, 'options.lengthParser')}
            />
          ) : null}
          {showRating ? (
            <Form.Item label="Rating">
              <Radio.Group
                onChange={this.handleValueChange.bind(this, 'rating')}
                value={data.rating}
                buttonStyle="solid"
              >
                {this.getRatings()}
              </Radio.Group>
            </Form.Item>
          ) : null}
          <Form.Item>
            <div className="flex flex-wrap">
              {leftForm.length ? (
                <div className={rightForm.length ? 'w-1/2' : 'w-full'}>{leftForm}</div>
              ) : null}
              {rightForm.length ? (
                <div className={leftForm.length ? 'w-1/2' : 'w-full'}>{rightForm}</div>
              ) : null}
              {wideForm.length ? <div className="w-full">{wideForm}</div> : null}
            </div>
          </Form.Item>
        </div>
      </div>
    );
  }
}

import Model, { attr } from '@ember-data/model';

export default class PersonModel extends Model {
  @attr name;
  @attr imageUrl;
  @attr description;
}

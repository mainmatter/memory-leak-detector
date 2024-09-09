import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service store;

  beforeModel() {
    this.seed();

    return super.beforeModel(...arguments);
  }

  seed() {
    for (let id = 1; id < 100; id++) {
      this.store.createRecord('person', {
        id: id.toString(),
        imageUrl: `https://picsum.photos/id/${id}/200/300`,
        name: `name-${id}`,
        description: 'desc',
      });
    }
  }
}

import Component from '@glimmer/component';
import { task, waitForQueue } from 'ember-concurrency';
import { next } from '@ember/runloop';

export default class UserListComponent extends Component {

  @task
  *onEnterTask(id) {
    yield waitForQueue('afterRender');
    next(this, () => {
      console.log(`user ${id} in-viewport`);
    });
  }
}

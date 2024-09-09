import Component from '@glimmer/component';
import { action } from '@ember/object';

let componentRegistry = new Set();

export default class LeakerComponent extends Component {
  constructor() {
    super(...arguments);

    window.addEventListener('click', this.handleClick);
  }

  @action
  handleClick() {}

  @action
  registerComponent(registeredComponent) {
    componentRegistry?.add(registeredComponent);
  }
}

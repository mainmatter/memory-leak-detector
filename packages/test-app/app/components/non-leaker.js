import Component from '@glimmer/component';

export default class NonLeakerComponent extends Component {
  constructor() {
    super(...arguments);

    this.args.registerComponent?.(this);
  }
}

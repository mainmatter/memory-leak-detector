import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UserListItemComponent extends Component {
  @tracked componentInViewport = false;

  onEnterTask = (id) => {
    this.componentInViewport = true;
    console.log(`user ${id} in-viewport`);
  };

  likeProfile = () => {
    console.log("profile liked");
  }
}

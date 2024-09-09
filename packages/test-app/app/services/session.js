import Service, { service } from '@ember/service';

export default class UserService extends Service {
  @service user;

  sessionId = "some-long-id";

  initialize() {
    this.user.loadUser();
  }
}

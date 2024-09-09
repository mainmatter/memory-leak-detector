import Service, { service } from '@ember/service';

export default class UserService extends Service {
  @service session;

  user = { name: 'BobrImperator' }

  loadUser() {
    console.log(this.session.sessionId);
    return this.user;
  }
}

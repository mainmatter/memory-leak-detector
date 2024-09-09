import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PaginationComponent extends Component {
  pageSize = 30;

  @tracked currentPage = 1;

  get totalPages() {
    return Math.ceil(this.args.records.length / this.pageSize);
  }

  get paginatedRecords() {
    let startIndex = (this.currentPage - 1) * this.pageSize;
    let endIndex = startIndex + this.pageSize;
    return this.args.records.slice(startIndex, endIndex);
  }

  @action
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  @action
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  @action
  goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
    }
  }

  @action
  onEnter() {
    console.log('triggered in-viewport')
  }
}


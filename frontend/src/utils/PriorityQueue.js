export default class PriorityQueue {
  constructor() {
    this.queue = [];
    this.priorityMap = { High: 1, Medium: 2, Low: 3 };
  }

  enqueue(complaint) {
    this.queue.push(complaint);
    this.queue.sort((a, b) => {
      return this.priorityMap[a.priority] - this.priorityMap[b.priority];
    });
  }

  getAll() {
    return this.queue;
  }
}

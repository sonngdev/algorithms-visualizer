type Priority = number;

class QueueItem<T = any> {
  constructor(public priority: Priority, public value: T) {}

  hasHigherPriority(target: QueueItem): boolean {
    return this.priority > target.priority;
  }
}

class Locator<T = any> extends QueueItem<T> {
  heapIndex: number;

  constructor(priority: Priority, value: T, heapIndex: number) {
    super(priority, value);
    this.heapIndex = heapIndex;
  }
}

abstract class PriorityQueue {
  abstract getLength(): number;

  isEmpty(): boolean {
    return this.getLength() === 0;
  }
}

class HeapPriorityQueue<T = any> extends PriorityQueue {
  protected heap: QueueItem<T>[] = [];

  getLength(): number {
    return this.heap.length;
  }

  add(priority: Priority, value: T) {
    const item = new QueueItem(priority, value);
    this.heap.push(item);
    this.bubbleUpHeap(this.heap.length - 1);
  }

  getHighestPriorityValue(): [Priority, T] {
    if (this.isEmpty()) {
      throw new Error('Priority queue is empty');
    }
    const { priority, value } = this.heap[0];
    return [priority, value];
  }

  dequeueHighestPriorityValue(): [Priority, T] {
    if (this.isEmpty()) {
      throw new Error('Priority queue is empty');
    }
    this.swapItems(0, this.heap.length - 1);
    // It's OK to do non-null assertion here
    // since we already guard against an empty queue
    const { priority, value } = this.heap.pop()!;
    this.bubbleDownHeap(0);
    return [priority, value];
  }

  protected bubbleUpHeap(itemIndex: number) {
    if (itemIndex === 0) {
      return;
    }
    const parentIndex = this.getParentIndex(itemIndex);
    if (this.heap[itemIndex].hasHigherPriority(this.heap[parentIndex])) {
      this.swapItems(itemIndex, parentIndex);
      // Now `parentIndex` is actually the new index of item
      this.bubbleUpHeap(parentIndex);
    }
  }

  protected bubbleDownHeap(itemIndex: number) {
    if (!this.hasLeftChild(itemIndex)) {
      return;
    }

    const leftChildIndex = this.getLeftChildIndex(itemIndex);
    let higherPriorityChildIndex = leftChildIndex;

    if (this.hasRightChild(itemIndex)) {
      const rightChildIndex = this.getRightChildIndex(itemIndex);
      if (
        this.heap[rightChildIndex].hasHigherPriority(this.heap[leftChildIndex])
      ) {
        higherPriorityChildIndex = rightChildIndex;
      }
    }

    if (
      this.heap[higherPriorityChildIndex].hasHigherPriority(
        this.heap[itemIndex],
      )
    ) {
      this.swapItems(itemIndex, higherPriorityChildIndex);
      // Now `higherPriorityChildIndex` is actually the new index of item
      this.bubbleDownHeap(higherPriorityChildIndex);
    }
  }

  protected swapItems(sourceIndex: number, targetIndex: number) {
    const sourceItem = this.heap[sourceIndex];
    const targetItem = this.heap[targetIndex];
    this.heap[sourceIndex] = targetItem;
    this.heap[targetIndex] = sourceItem;
  }

  protected getParentIndex(childIndex: number) {
    return Math.floor((childIndex - 1) / 2);
  }

  private getLeftChildIndex(parentIndex: number) {
    return parentIndex * 2 + 1;
  }

  private getRightChildIndex(parentIndex: number) {
    return parentIndex * 2 + 2;
  }

  private hasLeftChild(parentIndex: number) {
    return this.getLeftChildIndex(parentIndex) < this.heap.length;
  }

  private hasRightChild(parentIndex: number) {
    return this.getRightChildIndex(parentIndex) < this.heap.length;
  }
}

class AdaptableHeapPriorityQueue<T = any> extends HeapPriorityQueue<T> {
  protected heap: Locator<T>[] = [];

  add(priority: Priority, value: T) {
    const locator = new Locator(priority, value, this.heap.length);
    this.heap.push(locator);
    this.bubbleUpHeap(this.heap.length - 1);
    return locator;
  }

  update(locator: Locator, newPriority: Priority, newValue: T) {
    const currentHeapIndex = locator.heapIndex;
    if (
      currentHeapIndex < 0 ||
      currentHeapIndex >= this.heap.length ||
      this.heap[currentHeapIndex] !== locator
    ) {
      throw new Error('Invalid locator');
    }
    locator.priority = newPriority;
    locator.value = newValue;
    this.bubble(currentHeapIndex);
  }

  remove(locator: Locator): [Priority, T] {
    const currentHeapIndex = locator.heapIndex;
    if (
      currentHeapIndex < 0 ||
      currentHeapIndex >= this.heap.length ||
      this.heap[currentHeapIndex] !== locator
    ) {
      throw new Error('Invalid locator');
    }
    if (currentHeapIndex === this.heap.length - 1) {
      this.heap.pop();
    } else {
      this.swapItems(currentHeapIndex, this.heap.length - 1);
      this.heap.pop();
      this.bubble(currentHeapIndex);
    }
    return [locator.priority, locator.value];
  }

  protected swapItems(sourceIndex: number, targetIndex: number): void {
    super.swapItems(sourceIndex, targetIndex);
    this.heap[sourceIndex].heapIndex = sourceIndex;
    this.heap[targetIndex].heapIndex = targetIndex;
  }

  private bubble(itemIndex: number) {
    const parentIndex = this.getParentIndex(itemIndex);
    if (this.heap[itemIndex].hasHigherPriority(this.heap[parentIndex])) {
      this.bubbleUpHeap(itemIndex);
    } else {
      this.bubbleDownHeap(itemIndex);
    }
  }
}

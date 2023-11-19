type StringSet = {
  distinct: number;
  total: number;
  identifiers: string[];
}

export class HalsteadMetrics {
  public time = 0;
  public bugs = 0;
  public effort = 0;
  public volume = 0;
  public difficulty = 0;
  public vocabulary = 0;
  public length = 0;
  public operands: StringSet;
  public operators: StringSet;

  constructor() {
    this.operands = {
      distinct: 0,
      identifiers: [],
      total: 0
    }
    this.operators = {
      distinct: 0,
      identifiers: [],
      total: 0
    }
    this.reset()
  }

  reset() {
    this.vocabulary = 0
    this.difficulty = 0
    this.volume = 0
    this.effort = 0
    this.bugs = 0
    this.time = 0
  }

  calculate() {
    this.length = this.operators.total + this.operands.total
    if (this.length === 0) {
      this.reset()
    } else {
      this.vocabulary = this.operators.distinct + this.operands.distinct
      this.difficulty = (this.operators.distinct / 2) * (this.operands.distinct === 0 ? 1 : this.operands.total / this.operands.distinct)
      this.volume = this.length * (Math.log(this.vocabulary) / Math.log(2))
      this.effort = this.difficulty * this.volume
      this.bugs = this.volume / 3000
      this.time = this.effort / 18
    }
  }
}

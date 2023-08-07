import React from "react";

class Counter extends React.Component {
  constructor(props: any) {
    super(props);

    this.state = { count: 0 };
    this.handleDecrement = this.handleDecrement.bind(this);
    this.handleIncrement = this.handleIncrement.bind(this);
  }

  handleDecrement() {
    this.setState((prev: any) => {
      return { count: prev.count - 1 };
    });
  }
  handleIncrement() {
    this.setState((prev: any) => {
      return { count: prev.count + 1 };
    });
  }

  render(): React.ReactNode {
    const date = new Date("August 4 2023");
    date.setDate(date.getDate() + this.state.count);
    return (
      <div className="bg-rose-400 font-[primary] h-screen flex justify-center gap-5 items-center text-2xl text-white font-bold">
        <button
          onClick={this.handleDecrement}
          className="bg-white text-rose-500 p-7"
        >
          -
        </button>
        <span>
          {date.toDateString()} [{this.state.count}]
        </span>
        <button
          onClick={this.handleIncrement}
          className="bg-white text-rose-500 p-7"
        >
          +
        </button>
      </div>
    );
  }
}
export default Counter;

import { Component } from 'react';

// Renders nothing instead of crashing the page when a WebGL scene cannot start (no GPU, context lost).
export default class SafeBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Component } from "react";
import { Button } from "@/components/ui/button";
class ErrorBoundary extends Component {
  constructor() {
    super(...arguments);
    __publicField(this, "state", { hasError: false });
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <div>
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">The page hit an unexpected UI error.</p>
          </div>
          <Button onClick={() => this.setState({ hasError: false })}>Try again</Button>
        </div>;
    }
    return this.props.children;
  }
}
export {
  ErrorBoundary
};

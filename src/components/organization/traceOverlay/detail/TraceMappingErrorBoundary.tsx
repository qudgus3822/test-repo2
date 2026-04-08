import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary for the traceMapping detail panel.
 * Key the boundary by selectedMember.memberId so it resets on member change.
 */
export class TraceMappingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[TraceMappingDetailPanel] Render error:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex items-center justify-center h-full px-4 py-6">
            <p className="text-sm text-red-500">상세 데이터를 표시할 수 없습니다.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

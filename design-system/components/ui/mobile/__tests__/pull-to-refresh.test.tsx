import { render, screen } from "@/src/test/utils";
import { PullToRefresh } from "../pull-to-refresh";

describe("PullToRefresh", () => {
  it("renders children", () => {
    render(
      <PullToRefresh onRefresh={async () => {}}>
        <div data-testid="content">Content</div>
      </PullToRefresh>
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("does not show spinner initially", () => {
    render(
      <PullToRefresh onRefresh={async () => {}}>
        <div>Content</div>
      </PullToRefresh>
    );
    expect(screen.queryByTestId("pull-to-refresh-spinner")).not.toBeInTheDocument();
  });

  it("renders with correct container structure", () => {
    const { container } = render(
      <PullToRefresh onRefresh={async () => {}}>
        <div>Content</div>
      </PullToRefresh>
    );
    const wrapper = container.querySelector("[data-pull-to-refresh]");
    expect(wrapper).toBeTruthy();
  });
});

import { render, screen } from "@/src/test/utils";
import { CollapsibleHeader } from "../collapsible-header";

describe("CollapsibleHeader", () => {
  it("renders title in large state", () => {
    render(
      <CollapsibleHeader title="Patients">
        <div>Content</div>
      </CollapsibleHeader>
    );
    expect(screen.getByText("Patients")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <CollapsibleHeader title="Patients" actions={<button data-testid="action-btn">Add</button>}>
        <div>Content</div>
      </CollapsibleHeader>
    );
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <CollapsibleHeader title="Test">
        <div data-testid="content">Scrollable content</div>
      </CollapsibleHeader>
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });
});

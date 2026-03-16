import { render, screen } from "@/src/test/utils";
import { MobileNavStack } from "../mobile-nav-stack";

describe("MobileNavStack", () => {
  it("renders listView when showDetail=false", () => {
    render(
      <MobileNavStack
        showDetail={false}
        listView={<div data-testid="list">List</div>}
        detailView={<div data-testid="detail">Detail</div>}
      />
    );
    expect(screen.getByTestId("list")).toBeInTheDocument();
    expect(screen.queryByTestId("detail")).not.toBeInTheDocument();
  });

  it("renders detailView when showDetail=true", () => {
    render(
      <MobileNavStack
        showDetail={true}
        listView={<div data-testid="list">List</div>}
        detailView={<div data-testid="detail">Detail</div>}
      />
    );
    expect(screen.queryByTestId("list")).not.toBeInTheDocument();
    expect(screen.getByTestId("detail")).toBeInTheDocument();
  });
});

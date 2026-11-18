import {FakeAppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/fake/FakeAppearanceEvalDriver";
import {keepDrawing} from "@evals/eval-criteria-mapping/setups/appearance/shared/drawings/KeepDrawing";

vi.mock("@evals/eval-criteria-mapping/setups/appearance/shared/drawings/KeepDrawing", () => ({keepDrawing: vi.fn()}));

it("asks its tier before and after each request, in that order", async () => {
  const driver = new RecordingAppearanceDriver();

  await driver.run("a rifle with a long barrel");

  expect(driver.events).toEqual(["before", "after"]);
});

it("keeps a drawing only after its tier has had its say, so a paid call that failed is never kept as a result", async () => {
  const driver = new RecordingAppearanceDriver();
  driver.failAfter = true;

  await expect(driver.run("a rifle with a long barrel")).rejects.toThrow("the tier says no");

  expect(keepDrawing).not.toHaveBeenCalled();
});

it("keeps the drawing once its tier is satisfied", async () => {
  await new RecordingAppearanceDriver().run("a rifle with a long barrel");

  expect(keepDrawing).toHaveBeenCalledOnce();
});

class RecordingAppearanceDriver extends FakeAppearanceEvalDriver {
  readonly events: string[] = [];
  failAfter = false;

  constructor() {
    super(undefined);
  }

  protected override beforeRequest(): void {
    this.events.push("before");
  }

  protected override afterOutcome(): void {
    this.events.push("after");

    if (this.failAfter) {
      throw new Error("the tier says no");
    }
  }
}

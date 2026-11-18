import {FakeListChatModel} from "@langchain/core/utils/testing";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";
import {fakeAppearanceGenerator} from "@evals/eval-criteria-mapping/setups/appearance/fake/FakeAppearanceGenerator";
import {FAKE_WEAPON_REPLY} from "@evals/eval-criteria-mapping/setups/weapon/fake/models/FakeWeaponReply";
import {WeaponModerationFakeModel} from "@evals/eval-criteria-mapping/setups/weapon/fake/models/WeaponModerationFakeModel";
import {WeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/shared/WeaponPipelineEvalDriver";

/** The weapon pipeline on canned models: one valid weapon, a moderator that turns away a few known requests, a canned drawing. One trial: it is deterministic. */
export class FakeWeaponPipelineEvalDriver extends WeaponPipelineEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super(requestedTrials, 1);
  }

  protected createModels(): WeaponPipelineDependencies {
    return {
      generator: new FakeListChatModel({responses: [JSON.stringify(FAKE_WEAPON_REPLY)]}),
      moderator: new WeaponModerationFakeModel(),
      appearanceGenerator: fakeAppearanceGenerator(),
    };
  }
}

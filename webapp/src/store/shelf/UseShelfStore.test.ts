import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";
import {useShelfStore} from "@src/store/shelf/UseShelfStore";
import {WEAPON_SHELF_LIMIT} from "@src/store/shelf/WeaponShelfLimit";

const RIFLE_REQUEST = {prompt: "a rifle", weapon: RIFLE};
const FAST_REQUEST = {prompt: "a fast one", weapon: SUBMACHINE_GUN};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

beforeEach(() => {
  useShelfStore.setState(useShelfStore.getInitialState(), true);
});

describe("a new shelf", () => {
  it("holds the saved weapons, their limit and the three things that change them, so adding state is a deliberate edit", () => {
    expect(Object.keys(useShelfStore.getState()).sort()).toEqual([
      "deleteWeapon",
      "replaceWeapon",
      "saveWeapon",
      "weaponLimit",
      "weapons",
    ]);
  });

  it("starts empty, with the tunable limit", () => {
    expect(useShelfStore.getState().weapons).toEqual([]);
    expect(useShelfStore.getState().weaponLimit).toBe(WEAPON_SHELF_LIMIT);
  });

  it("keeps a saved weapon with its words and gives its id", () => {
    const id = useShelfStore.getState().saveWeapon(RIFLE_REQUEST);

    expect(id).toEqual(expect.any(String));
    expect(useShelfStore.getState().weapons).toEqual([{id, ...RIFLE_REQUEST}]);
  });

  it("keeps weapons in the order they were saved, each with an id of its own, even from the same words", () => {
    const first = useShelfStore.getState().saveWeapon(RIFLE_REQUEST);
    const second = useShelfStore.getState().saveWeapon(RIFLE_REQUEST);

    expect(first).not.toBe(second);
    expect(useShelfStore.getState().weapons.map(saved => saved.id)).toEqual([first, second]);
  });

  it("replaces nothing, and gives nothing, for an id that is not on the shelf", () => {
    useShelfStore.getState().saveWeapon(RIFLE_REQUEST);
    const before = useShelfStore.getState().weapons;

    expect(useShelfStore.getState().replaceWeapon("nobody", FAST_REQUEST)).toBeUndefined();
    expect(useShelfStore.getState().weapons).toBe(before);
  });

  it("deletes the weapon with that id and no other", () => {
    const first = useShelfStore.getState().saveWeapon(RIFLE_REQUEST);
    const second = useShelfStore.getState().saveWeapon(FAST_REQUEST);

    useShelfStore.getState().deleteWeapon(first ?? "");

    expect(useShelfStore.getState().weapons.map(saved => saved.id)).toEqual([second]);
  });
});

describe("a full shelf", () => {
  beforeEach(() => {
    for (let count = 0; count < WEAPON_SHELF_LIMIT; count++) {
      useShelfStore.getState().saveWeapon(RIFLE_REQUEST);
    }
  });

  it("gives no id for another weapon and changes nothing", () => {
    const before = useShelfStore.getState().weapons;

    expect(useShelfStore.getState().saveWeapon(FAST_REQUEST)).toBeUndefined();
    expect(useShelfStore.getState().weapons).toBe(before);
  });

  it("puts a replacement where the replaced weapon stood, with an id of its own", () => {
    const [first, second, ...rest] = useShelfStore.getState().weapons;

    const id = useShelfStore.getState().replaceWeapon(second?.id ?? "", FAST_REQUEST);

    expect(id).toEqual(expect.any(String));
    expect(id).not.toBe(second?.id);
    expect(useShelfStore.getState().weapons).toEqual([first, {id, ...FAST_REQUEST}, ...rest]);
  });

  it("makes room for a save by a delete", () => {
    useShelfStore.getState().deleteWeapon(useShelfStore.getState().weapons[0]?.id ?? "");

    expect(useShelfStore.getState().saveWeapon(FAST_REQUEST)).toEqual(expect.any(String));
  });
});

describe("with the browser's storage", () => {
  const KEY = "gunsmith.shelf.weapons";
  const KEPT = [{id: "kept", prompt: "a rifle", weapon: RIFLE}];

  it("writes only the weapons, after a save, a replace and a delete", async () => {
    const held = {};
    const store = await storeInABrowserWith(held);

    const id = store.getState().saveWeapon(RIFLE_REQUEST);
    expect(storedIds(held)).toEqual([id]);

    const replacement = store.getState().replaceWeapon(id ?? "", FAST_REQUEST);
    expect(storedIds(held)).toEqual([replacement]);

    store.getState().deleteWeapon(replacement ?? "");
    expect(storedIds(held)).toEqual([]);
    expect(Object.keys(storedState(held))).toEqual(["weapons"]);
  });

  it("starts with what the browser kept", async () => {
    const store = await storeInABrowserWith({[KEY]: stored(KEPT)});

    expect(store.getState().weapons).toEqual(KEPT);
    expect(store.getState().weaponLimit).toBe(WEAPON_SHELF_LIMIT);
  });

  it("leaves out a kept weapon that does not parse and keeps the rest", async () => {
    const bad = {id: "bad", prompt: "x", weapon: {...RIFLE, magazineSize: 0}};
    const store = await storeInABrowserWith({[KEY]: stored([bad, ...KEPT])});

    expect(store.getState().weapons).toEqual(KEPT);
  });

  it.each([
    ["text that is not JSON", "{not json"],
    ["something that is not the shelf", JSON.stringify({state: 7, version: 0})],
    ["a shelf with no weapons in it", JSON.stringify({state: {}, version: 0})],
  ])("starts empty for %s", async (_what, value) => {
    const store = await storeInABrowserWith({[KEY]: value});

    expect(store.getState().weapons).toEqual([]);
  });

  it("works from memory when the browser will not hand over its storage", async () => {
    vi.stubGlobal("window", {
      get localStorage(): never {
        throw new Error("blocked");
      },
    });
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.resetModules();
    const {useShelfStore: blocked} = await import("@src/store/shelf/UseShelfStore");

    const id = blocked.getState().saveWeapon(RIFLE_REQUEST);

    expect(blocked.getState().weapons.map(saved => saved.id)).toEqual([id]);
  });

  it("works from memory, and says nothing, where there is no browser", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.resetModules();
    const {useShelfStore: inNode} = await import("@src/store/shelf/UseShelfStore");

    inNode.getState().saveWeapon(RIFLE_REQUEST);

    expect(inNode.getState().weapons).toHaveLength(1);
    expect(warn).not.toHaveBeenCalled();
  });

  function stored(weapons: ShelfWeapon[]): string {
    return JSON.stringify({state: {weapons}, version: 0});
  }

  function storedIds(held: Record<string, string>): string[] {
    return (storedState(held)["weapons"] as ShelfWeapon[]).map(item => item.id);
  }

  function storedState(held: Record<string, string>): Record<string, unknown> {
    return JSON.parse(held[KEY] ?? "{}").state;
  }
});

async function storeInABrowserWith(held: Record<string, string>): Promise<typeof useShelfStore> {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => held[key] ?? null,
      setItem: (key: string, value: string) => void (held[key] = value),
      removeItem: (key: string) => void delete held[key],
    },
  });
  vi.resetModules();

  return (await import("@src/store/shelf/UseShelfStore")).useShelfStore;
}

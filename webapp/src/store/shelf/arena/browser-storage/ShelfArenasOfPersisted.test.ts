import {shelfArenasOfPersisted} from "@src/store/shelf/arena/browser-storage/ShelfArenasOfPersisted";

const ROWS = ["########", "#......#", "#......#", "#......#", "########"];
const YARD = {id: "yard", name: "Yard", prompt: "a simple yard", rows: ROWS};

it("keeps readable arenas in order even when another saved drawing or id is damaged", () => {
  const corrupt = {id: "yard", name: "Corrupt yard", prompt: "invalid", rows: [...ROWS.slice(0, 4), "????????"]};
  const duplicate = {...YARD, name: "Duplicate"};
  const last = {...YARD, id: "other", name: "Another yard"};

  expect(shelfArenasOfPersisted({arenas: [corrupt, YARD, duplicate, last]})).toEqual([YARD, last]);
});

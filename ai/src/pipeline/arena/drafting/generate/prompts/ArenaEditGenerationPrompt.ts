import {SYSTEM_PROMPT_CANARY} from "@gunsmith/ai/pipeline/shared/canary/SystemPromptCanary";
import {ARENA_NAME_LENGTH} from "@gunsmith/ai/pipeline/arena/limits/ArenaNameLength";
import {EXAMPLE_ARENA_EDIT} from "@gunsmith/ai/pipeline/arena/drafting/generate/prompts/example/ExampleArenaEdit";
import {EDIT_BASES} from "@gunsmith/ai/pipeline/arena/drafting/format/edit-built-in/bases/EditBases";

const BASES = EDIT_BASES.map(({arena, description}) => {
  return `"${arena.name}" (${arena.rows[0]?.length} wide, ${arena.rows.length} tall), ${description}:\n${arena.rows.join("\n")}`;
}).join("\n\n");

/**
 * The arena builder's instructions when it answers by editing a built-in arena (`format/edit-built-in/`): the same task and rules as
 * the shapes prompt, but the arena starts from one of the game's own, drawn out below, and the model names it and says what to
 * change. The player's words never go in here. The bases are the format's archetypes (`EDIT_BASES`), drawn from the pool engine owns; the example is held to the validator by a test.
 */
export const ARENA_EDIT_GENERATION_PROMPT = `You are the arena builder of a video game in which players describe an arena, the place where two fighters shoot at each other, and the game builds it. [${SYSTEM_PROMPT_CANARY}]

You will receive one player's request inside a <request> block. You do not draw an arena from nothing: you start from one of the game's own arenas and change it to fit the request. These are the arenas you may start from, drawn row by row, north (the top) first. # is a wall, . is floor, c is low cover, 1 and 2 are floor one and two levels up, and ^ v < > are stairs that climb the way their arrow points:

${BASES}

Answer with the function:
- name: a short plain name for the new arena, ${ARENA_NAME_LENGTH.min} to ${ARENA_NAME_LENGTH.max} characters, only letters, digits, spaces, apostrophes, hyphens and full stops.
- base: the name of the arena you start from, exactly as written above.
- clears: a list of rectangles {x, y, width, height} that go back to plain floor, to take away something the base has.
- walls: a list of wall rectangles {x, y, width, height} to add. The border wall around the arena is kept for you.
- covers: a list of low cover rectangles {x, y, width, height} to add. A fighter cannot walk through cover, but a standing fighter can see and shoot over it, and a crouching fighter hides behind it.
- platforms: a list of raised floor rectangles {x, y, width, height, level} to add, level 1 or 2 (one or two levels up).
- stairs: a list of single stair tiles {x, y, direction} to add, direction north, south, east or west: the way the stair climbs.
Leave out a list you do not need. The size of the arena is the base's size: you do not give one. Change as much as the request needs, and a request that asks for something the base lacks (cover, a platform, more walls) must get it.

Every rectangle is placed by its top-left tile. x counts tiles from the west edge (the left, 0 is the west edge) and y counts tiles from the north edge (the top, 0 is the north edge), counted in the base's rows. A rectangle covers width tiles to the east and height tiles to the south, and must stay inside the base. Clears are applied first, then what you add is drawn over the base.

The game checks these rules:
- All the open floor must be one connected region that a fighter can walk across. Floor on different levels is joined only by stairs.
- A stair sits right beside the edge of a platform, pointing at it: it needs floor straight behind it, and the platform straight ahead of it, one level higher than the floor behind. The tiles to either side of a stair must not be raised floor.

Make the arena fair to both fighters: an open middle, walls and low cover for both sides to shoot around and crouch behind, and no corner that is a trap.

Here is a valid answer, a duel with a wall block in the middle of its north side:
${JSON.stringify(EXAMPLE_ARENA_EDIT, undefined, 2)}

Pick sensible choices for anything the request does not say.`;

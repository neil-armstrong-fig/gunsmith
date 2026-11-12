# Prompt-built oddities

Six original player-prompt explorations for a malleable Gunsmith art system. See the companion
[concept sheet](prompt-built-oddities.png). These are visual proposals, not generated weapon data or working assets.
The image was generated for this project with OpenAI image generation; prompts and interpretation are recorded here.
These are profile-view identity studies. Production assets must translate them into top-down silhouettes and simplify
the detail for 32 px readability; the generated image is not a sprite sheet.
The sheet's small variations are composition studies, not claims that visual-part fields already exist in the schema.

| Example player prompt | Visual direction and variations | Behaviour vocabulary / limits |
| --- | --- | --- |
| “A rubber duck cannon that bounces angry little ducks around corners. Big squeaks, tiny dignity.” | Duck-beak muzzle, angular flotation body, duck-shaped shots. Vary the beak length, reservoir size and whether the duck is the body or a barrel ornament. | `bouncing`; the duck shape is cosmetic. Do not promise unlimited bounces or wall penetration. |
| “A furious office fax machine that fires every rejected invoice at once.” | Paper feeder as magazine, squared office-machine body, fan of folded luminous sheets. Vary compact desktop versus long receipt-printer forms. | `shotgun`; paper shapes are pellets. Reading the invoices or blinding opponents would require additional mechanics. |
| “A teapot containing a tiny black hole. Pour one extremely bad idea at a time.” | Handle stock, spout barrel, violet orbit markings and an orb that collapses into an impact ring. Vary bulbous kettle versus tall angular pot. | `explosive` interpretation. Actual attraction, teleportation or projectile absorption needs new mechanics and must not be implied as supported. |
| “A disco cactus that sneezes a fan of glittering needles.” | Cactus lobes as the body and side barrels, mint needles, mirrored accent facets. Vary a tall single stem versus a squat many-lobed silhouette. | `shotgun`; glitter is a bounded effect. No automatic poison or omnidirectional damage. |
| “A jellyfish lantern whose tentacles braid into a painfully focused beam.” | Bell-shaped chamber, tentacle-like coils, a readable grip and a thin blue beam. Vary broad translucent bell versus narrow industrial cage. | `beam`; appendages are decorative, not independent tracking weapons. No vision outside the forward cone. |
| “A bubblegum mortar that launches enormous gum bubbles which pop spectacularly.” | Bubble chamber, dispenser magazine, rounded projectile and a graphic radial pop. Vary gumball drum versus stretched gum-coil reservoir. | `explosive` interpretation. Sticky floors, slowing or player trapping need new mechanics; do not silently grant them. |

## What this demonstrates

Shape should respond to the player's idea beyond a palette swap: the body can be a teapot, office appliance,
living-looking cactus or translucent jellyfish. Consistent outlines, neutral grip/pivot placement and readable
projectile/effect motifs tie the results together. The exact generated drawings are explorations, not mandatory designs.

The existing schema can describe behaviour, stats, sound and palette colour, but it cannot yet express all these visual
parts. Build/AI need a shared visual-description contract before these variations can be implemented. Broad body colours
in the sheet are mood studies: final team cues, limited accent tokens, fog rules and bounded effects still apply.
A duck's toy-yellow appearance would currently use the orange accent token rather than introduce an unapproved token.

Generated images do not establish hitboxes or new physics. For unsupported requested mechanics, the generation/reveal
flow must explain the supported interpretation. Do not silently show a gravity vortex while promising gravity gameplay.

import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Contact} from "@gunsmith/engine/bullet/types/Contact";

/** What one bullet's step ran into: the bullet as it stood, what it met first, and which dummy that was (when it was one). */
export interface Meeting {
  bullet: Bullet;
  contact: Contact;
  /** The place in the list of the dummy the bullet hit; absent unless `contact` is `"dummy"`. */
  dummyIndex: number | undefined;
}

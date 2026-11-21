import type {Page} from "@playwright/test";
import {FrontDoorPlaywright} from "@src/dsl/gunsmith/components/room/components/front-door/playwright/FrontDoorPlaywright";
import type {RoomLimits} from "@src/dsl/gunsmith/components/room/types/RoomLimits";
import {DslError} from "@src/dsl/gunsmith/errors/DslError";

/** How a player reaches a private room from the practice range: making one and joining one by its friend code, reached as `gunsmith.room.frontDoor`. */
export class FrontDoorDsl {
  private readonly frontDoor: FrontDoorPlaywright;

  constructor(page: Page) {
    this.frontDoor = new FrontDoorPlaywright(page);
  }

  /** Opens the practice range with `limits` on its address, which the front door passes on to the room it makes or joins. */
  async openThePracticeRange(limits: RoomLimits = {}): Promise<void> {
    try {
      await this.frontDoor.openThePracticeRange(limits);
    } catch (error) {
      throw new DslError("Failed to open the practice range", error);
    }
  }

  /** Whether the practice range offers to make a room. */
  async hasMakeARoom(): Promise<boolean> {
    try {
      return await this.frontDoor.hasMakeARoom();
    } catch (error) {
      throw new DslError("Failed to read whether making a room is offered", error);
    }
  }

  /** Whether the practice range offers a box for a friend code and a way to join. */
  async hasJoinARoom(): Promise<boolean> {
    try {
      return await this.frontDoor.hasJoinARoom();
    } catch (error) {
      throw new DslError("Failed to read whether joining a room is offered", error);
    }
  }

  /** Presses Make a room and waits until the page is in the room the server made. Returns its friend code. */
  async makeARoom(): Promise<string> {
    try {
      return await this.frontDoor.makeARoom();
    } catch (error) {
      throw new DslError("Failed to make a room", error);
    }
  }

  /** Presses Make a room and does not wait for a room: for a spec where none is made. */
  async tryToMakeARoom(): Promise<void> {
    try {
      await this.frontDoor.tryToMakeARoom();
    } catch (error) {
      throw new DslError("Failed to press Make a room", error);
    }
  }

  /** Types `text` into the friend code box key by key, as a person types, so every key the game listens for is pressed as well. */
  async typeTheCode(text: string): Promise<void> {
    try {
      await this.frontDoor.typeTheCode(text);
    } catch (error) {
      throw new DslError(`Failed to type ${text} into the friend code box`, error);
    }
  }

  /** Types `code` into the friend code box and presses Join a room. */
  async joinARoom(code: string): Promise<void> {
    try {
      await this.frontDoor.joinARoom(code);
    } catch (error) {
      throw new DslError(`Failed to join the room ${code}`, error);
    }
  }

  /** Makes the server answer every request for a new room with an error. Say it before `tryToMakeARoom`. */
  async turnAwayNewRooms(): Promise<void> {
    try {
      await this.frontDoor.turnAwayNewRooms();
    } catch (error) {
      throw new DslError("Failed to turn away new rooms", error);
    }
  }

  /** The friend code of the room the page is in, or nothing on the practice range. */
  getFriendCode(): string | undefined {
    try {
      return this.frontDoor.getFriendCode();
    } catch (error) {
      throw new DslError("Failed to read the friend code", error);
    }
  }

  /** What the front door says is wrong, once it says so. */
  async getMessage(): Promise<string> {
    try {
      return await this.frontDoor.getMessage();
    } catch (error) {
      throw new DslError("Failed to read the front door's message", error);
    }
  }
}

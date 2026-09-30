import { EventEmitter } from "node:events";
import { EventEnum } from "../common/enums/event_enum";
export const eventEmitter = new EventEmitter();

eventEmitter.on(EventEnum.confirmEmail, (fn) => {
  fn();
});

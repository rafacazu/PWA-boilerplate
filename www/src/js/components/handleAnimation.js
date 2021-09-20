export default class HandleAnimation {
  constructor(el) {
    this.introAnimationContainer =
      typeof el === "string" ? document.querySelector(el) : el;
    if (this.introAnimationContainer == null) {
      return;
    }
    this.projectInView = null;
    this.init();
  }

  init() {
    console.log("Initializing component.")
  }
}

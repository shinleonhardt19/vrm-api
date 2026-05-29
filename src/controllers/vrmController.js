//VRM CONTROLLER CLASS

export class VRMController {
  constructor(vrm) {
    this.vrm = vrm;
  }

  update(delta) {
    this.vrm.update(delta);
  }

  setExpression(name, value) {
    this.vrm.expressionManager.setValue(name, value);
  }

  resetExpression() {
    if (!this.vrm?.expressionManager) return;

    const expressions = this.vrm.expressionManager.expressions;
    if (!expressions) return;

    for (const key of Object.keys(expressions)) {
      this.vrm.expressionManager.setValue(key, 0);
    }
  }
}



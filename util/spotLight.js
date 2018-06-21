class SpotLightSgNode extends LightSGNode {
  constructor(angle, computeDirection, computePosition, position,  children) {
    super(position, children);
    this.angle = angle;
    this.uniform = 'u_spotLight';
    this.computeDirection = computeDirection;
    this.computePosition = computePosition;
    this.direction = [];
    this.active = false;
  }

  setLightUniforms(context) {
    super.setLightUniforms(context);
    gl.uniform1f(gl.getUniformLocation(context.shader, "u_spotLightAngle"), this.angle)
    gl.uniform3fv(gl.getUniformLocation(context.shader, "u_spotLightDirection"), this.direction)
    gl.uniform1i(gl.getUniformLocation(context.shader, "u_spotLightActive"), this.active ? 1 : 0);
  }

  computeLightPosition(context) {
      this.computePosition(this.position);
  }

  setLight(context) {
    this.computeDirection(this.direction);
    super.setLight(context);
  }

  toggle() {
      this.active = !this.active;
  }
}

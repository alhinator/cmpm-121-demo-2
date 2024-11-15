enum MARKER_SIZE {
  Thin = 1,
  Thick = 5,
}

//cursor object is replaced with the Tool object
export class ToolPreview {
  static xpos: number;
  static ypos: number;
  static active: boolean = false;
  static thickness: MARKER_SIZE = MARKER_SIZE.Thin;
  static drawEmojis: boolean = false;
  static currentEmoji: string;
  static draw(ctx: CanvasRenderingContext2D) {
    if (!this.drawEmojis) {
      ctx.lineWidth = this.thickness;
      ctx.beginPath();
      ctx.ellipse(
        this.xpos,
        this.ypos,
        this.thickness,
        this.thickness,
        0,
        0,
        360,
      );
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.font = "16px sans serif";
      ctx.fillText(this.currentEmoji, this.xpos, this.ypos);
    }
  }
  static thinMode() {
    this.thickness = MARKER_SIZE.Thin;
    this.drawEmojis = false;
  }
  static thickMode() {
    this.thickness = MARKER_SIZE.Thick;
    this.drawEmojis = false;
  }
  static set emojiMode(_emoji: string) {
    this.drawEmojis = true;
    this.currentEmoji = _emoji;
  }
}

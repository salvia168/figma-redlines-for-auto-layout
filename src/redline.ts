import * as Consts from "./consts";

export class Redline{

  x:number;
  y:number;
  width:number;
  height:number;
  spacing:number;
  frameName:string;
  paddingName:string;

  constructor (x: number, y: number, width: number, height: number, spacing: number, frameName: string, paddingName: string){
    this.x = x;
    this.y = y;
    this.width =width;
    this.height = height;
    this.spacing = spacing;
    this.frameName =frameName;
    this.paddingName = paddingName;
  }

  makeRedLine(): GroupNode {    
    const group = figma.group([this.#makeRectangle(), this.#makeText()], figma.currentPage);
    group.name = `${this.frameName}'s ${this.paddingName} Group`;
    return group;
  }

  #makeRectangle():RectangleNode{
    const rectangle = figma.createRectangle();
    rectangle.resize(this.width, this.height);
    rectangle.fills = Consts.COLOR_PINK;
    rectangle.x = this.x;
    rectangle.y = this.y;
    rectangle.name = `${this.frameName}'s ${this.paddingName} Background`;
    return rectangle;
  }

  #makeText():TextNode{
    const text = figma.createText();
    text.fontName = Consts.DEEFAULT_FONT_NAME;
    text.characters = this.spacing.toString();
    text.fills = Consts.COLOR_WHITE;
    text.fontSize = this.#getFontSize(this.spacing);
    text.x = this.x + this.width / 2 - text.width / 2;
    text.y = this.y + this.height / 2 - text.height / 2;
    return text;
  }

  #getFontSize(spacing: number): number {
    if (spacing <= 8) {
      return 6;
    }
    if (spacing <= 24) {
      // return (spacing/2+2) - ((spacing%4)/2) + 2;
      return (spacing - spacing % 4) / 2 + 4
    }
    return 16;
  }
}
const defaultFontName:FontName = { family: "Inter", style: "Medium" };
const allRedlines:SceneNode[] = []; 
let needAllItemSpacing:boolean = false;
figma.loadFontAsync(defaultFontName).then(()=>{
  if (figma.command === "first") {
    // やることなし
  } else if (figma.command === "all") {
    needAllItemSpacing = true;
  }
  
  const selections = figma.currentPage.selection;
  
  for (let i = 0; i < selections.length; i++) {
    const x=getAbsoluteX(selections[i],0);
    const y= getAbsoluteY(selections[i],0);
    recursive(selections[i], x, y);
  
  }
  const allRedlineGroup = figma.group(allRedlines,figma.currentPage);
  allRedlineGroup.name = "Redlines";
  figma.viewport.scrollAndZoomIntoView(selections);
  
  figma.closePlugin();
});

function recursive(node: SceneNode, absoluteXOfParent: number, absoluteYOfParent: number) {
  const redLineWidth = 30;
  const redLineWidthHalf= redLineWidth/2;
  const absoluteX = absoluteXOfParent + node.x;
  const absoluteY = absoluteYOfParent + node.y;
  if (node.type === "BOOLEAN_OPERATION" || node.type === "COMPONENT"
    || node.type === "COMPONENT_SET" || node.type === "FRAME"
    || node.type === "GROUP" || node.type === "SECTION" || node.type === "INSTANCE") {
    for (let i = 0; i < node.children.length; i++) {
      recursive(node.children[i], absoluteX, absoluteY);
    }
  }
  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "INSTANCE") {
    const redLineNodes:SceneNode[]=[];
    if (node.layoutMode !== "NONE") {
      if (node.paddingTop !== 0) {
        redLineNodes.push(makeRedLine(absoluteX + (node.width / 2) - redLineWidthHalf,absoluteY, redLineWidth, node.paddingTop,node.paddingTop,node.name,"Padding Top"));    // 上
      }
      if(node.paddingBottom!== 0){
        redLineNodes.push(makeRedLine(absoluteX + (node.width / 2) - redLineWidthHalf,(absoluteY+node.height)-node.paddingBottom,   // 下
        redLineWidth, node.paddingBottom,node.paddingBottom,node.name,"Padding Bottom"));
      }
      if(node.paddingLeft!==0){
        redLineNodes.push(makeRedLine(absoluteX, absoluteY+(node.height/2-redLineWidthHalf),node.paddingLeft,redLineWidth,node.paddingLeft,node.name,"Padding Left"));         // 左
      }
      if(node.paddingRight!==0){
        redLineNodes.push(makeRedLine(absoluteX+node.width-node.paddingRight, absoluteY+(node.height/2-redLineWidthHalf),           // 右
        node.paddingRight,redLineWidth,node.paddingRight,node.name,"Padding Right"));
      }
    }
    if(node.primaryAxisAlignItems!="SPACE_BETWEEN"){
      if(node.layoutMode==="HORIZONTAL"){
        let gapX=absoluteX + node.paddingLeft;
        const length = needAllItemSpacing ? (node.children.length - 1): 1;
        for (let index = 0; index < length; index++) {
          const child = node.children[index];
          if(needAllItemSpacing && "layoutPositioning" in child && child.layoutPositioning == "ABSOLUTE"){
            continue;
          }
          gapX += getWidth(child);
          redLineNodes.push(makeRedLine(gapX,absoluteY+(node.height/2-redLineWidthHalf),node.itemSpacing,redLineWidth,node.itemSpacing,node.name, "Item Spacing"));
          gapX+=node.itemSpacing;
        }
      }else if(node.layoutMode==="VERTICAL"){
        let gapY=absoluteY + node.paddingTop;
        const length = needAllItemSpacing ? (node.children.length - 1): 1;
        for (let index = 0; index < length; index++) {
          const child = node.children[index];
          if(needAllItemSpacing && "layoutPositioning" in child && child.layoutPositioning == "ABSOLUTE"){
            continue;
          }
          gapY += getHeight(child);
          redLineNodes.push(makeRedLine(absoluteX + (node.width / 2) - redLineWidthHalf,gapY,redLineWidth,node.itemSpacing,node.itemSpacing,node.name, "Item Spacing"));
          gapY+=node.itemSpacing;
        }
      }
      }

    if(redLineNodes.length>0){
      const redlineGroup = figma.group(redLineNodes,figma.currentPage);
      redlineGroup.name = node.name + "'s " + "Redlines";
      allRedlines.push(redlineGroup);
    }
  }
}

function makeRedLine(x:number,y:number, width:number, height:number, value:number,frameName:string, paddingName:string):SceneNode{
  const rectangle = figma.createRectangle();
  rectangle.resize(width, height);
  rectangle.fills = [{ type: 'SOLID', color: { r: 0.909, g: 0.09, b: 0.54 } }];
  rectangle.x = x;
  rectangle.y = y;
  rectangle.name = frameName + "'s " + paddingName + " Background";
  const text = figma.createText();
  text.fontName=defaultFontName;
  text.characters = value.toString();
  text.fills=[{type:"SOLID", color:{r: 1, g: 1, b: 1}}];
  text.fontSize=getFontSize(value);
  text.x=x+width/2-text.width/2;
  text.y=y+height/2-text.height/2;
  const group = figma.group([rectangle, text],figma.currentPage);
  group.name = frameName + "'s " + paddingName + " Group";
  return group;
}

function isDimensionAndPositionMixin(node:BaseNode):boolean{
  if(node.type=="BOOLEAN_OPERATION"||
  node.type=="CODE_BLOCK"||
  node.type=="COMPONENT"||
  node.type=="COMPONENT_SET"||
  node.type=="CONNECTOR"||
  node.type=="ELLIPSE"||
  node.type=="EMBED"||
  node.type=="FRAME"||
  node.type=="GROUP"||
  node.type=="HIGHLIGHT"||
  node.type=="INSTANCE"||
  node.type=="LINE"||
  node.type=="LINK_UNFURL"||
  node.type=="MEDIA"||
  node.type=="POLYGON"||
  node.type== "RECTANGLE"||
  node.type=="SECTION"||
  node.type=="SHAPE_WITH_TEXT"||
  node.type=="SLICE"||
  node.type=="STAMP"||
  node.type=="STAR"||
  node.type=="STICKY"||
  node.type=="TABLE"||
  node.type=="TEXT"||
  node.type=="VECTOR"||
  node.type=="WASHI_TAPE"||
  node.type=="WIDGET"){
    return true;
  }
  if("x" in node&& typeof node.x == "number"){
    node.x;
  }
  return false;
}

function getAbsoluteX(node:BaseNode, x:number):number {
  const parent = node.parent;
  if(parent==null){
    return x;
  }
  if("x" in parent&& typeof parent.x == "number"){
    return getAbsoluteX(parent, parent.x + x);
  }
  return getAbsoluteX(parent, x);
}

function getAbsoluteY(node:BaseNode, y:number):number {
  const parent = node.parent;
  if(parent==null){
    return y;
  }
  if("y" in parent&& typeof parent.y == "number"){
    return getAbsoluteY(parent, parent.y + y);
  }
  
  return getAbsoluteY(parent, y);
}

function getWidth(node: BaseNode):number {
  if("width" in node&& typeof node.width == "number"){
    return node.width;
  }
  return 0;
}

function getHeight(node:SceneNode):number {
  if("height" in node&& typeof node.height == "number"){
    return node.height;
  }
  return 0;
}

function getFontSize(spacing:number):number{
  if(spacing <= 8){
    return 6;
  }
  if(spacing <= 24){
    // return (spacing/2+2) - ((spacing%4)/2) + 2;
    return (spacing - spacing % 4) / 2 + 4
  }
  return 16;
}

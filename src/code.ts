import * as Consts from "./consts";
import { Redline } from "./redline";
import { getAbsoluteX, getAbsoluteY } from "./absolute-coordinate";

const REDLINE_WIDTH_HALF = Consts.REDLINE_WIDTH / 2;

const allRedlines: SceneNode[] = [];
let needAllItemSpacing: boolean = false;

execute().finally(()=>figma.closePlugin());

async function execute():Promise<void>{
  await figma.loadFontAsync(Consts.DEEFAULT_FONT_NAME);
  
  if (figma.command === "first") {
    // 処理無し
  } else if (figma.command === "all") {
    needAllItemSpacing = true;
  }

  const selections = figma.currentPage.selection;

  for (const selection of selections) {
    recursive(selection, getAbsoluteX(selection, 0), getAbsoluteY(selection, 0));
  }

  if(allRedlines.length>0){
    const allRedlineGroup = figma.group(allRedlines, figma.currentPage);
    allRedlineGroup.name = "Redlines";
  
    figma.viewport.scrollAndZoomIntoView(selections);
    }
}

function recursive(node: SceneNode, absoluteXOfParent: number, absoluteYOfParent: number) {
  const absoluteX = absoluteXOfParent + node.x;
  const absoluteY = absoluteYOfParent + node.y;

  if ("children" in node) {
    for (const child of node.children) {
      recursive(child, absoluteX, absoluteY);
    }
  }

  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    const redLineNodes: GroupNode[] = [...makePaddingRedline(node,absoluteX,absoluteY), ...makeItemSpacingRedline(node,absoluteX,absoluteY)];

    if (redLineNodes.length > 0) {
      const redlineGroup = figma.group(redLineNodes, figma.currentPage);
      redlineGroup.name = `${node.name}'s Redlines`;
      allRedlines.push(redlineGroup);
    }
  }
}

function makePaddingRedline(node: SceneNode, absoluteX:number, absoluteY:number):GroupNode[]{
  if(!("layoutMode" in node)){return new Array<GroupNode>;}

  const redlines:GroupNode[] = [];

  // 上
  if (node.paddingTop > 0) {
    redlines.push(new Redline(absoluteX + (node.width / 2) - REDLINE_WIDTH_HALF, absoluteY, Consts.REDLINE_WIDTH, node.paddingTop, node.paddingTop, node.name, "Padding Top").makeRedLine());
  }

  // 下
  if (node.paddingBottom > 0) {
    redlines.push(new Redline(absoluteX + (node.width / 2) - REDLINE_WIDTH_HALF, (absoluteY + node.height) - node.paddingBottom,
    Consts.REDLINE_WIDTH, node.paddingBottom, node.paddingBottom, node.name, "Padding Bottom").makeRedLine());
  }

  // 左
  if (node.paddingLeft > 0) {
    redlines.push(new Redline(absoluteX, absoluteY + (node.height / 2 - REDLINE_WIDTH_HALF), node.paddingLeft, Consts.REDLINE_WIDTH, node.paddingLeft, node.name, "Padding Left").makeRedLine());
  }

  //右
  if (node.paddingRight > 0) {
    redlines.push(new Redline(absoluteX + node.width - node.paddingRight, absoluteY + (node.height / 2 - REDLINE_WIDTH_HALF),
      node.paddingRight, Consts.REDLINE_WIDTH, node.paddingRight, node.name, "Padding Right").makeRedLine());
  }
  return redlines;
}

function makeItemSpacingRedline(node: SceneNode, absoluteX:number, absoluteY:number):GroupNode[]{
  if(!("layoutMode" in node)){return new Array<GroupNode>;}

  const redlines:GroupNode[] = [];
  if (node.primaryAxisAlignItems != "SPACE_BETWEEN") {
    const isHorizontal = node.layoutMode === "HORIZONTAL";
    let gap = isHorizontal ? (absoluteX + node.paddingLeft) :(absoluteY + node.paddingTop);
    const length = needAllItemSpacing ? (node.children.length - 1) : 1;
    for (let i = 0; i < length; i++) {
      const child = node.children[i];
      if (needAllItemSpacing && "layoutPositioning" in child && child.layoutPositioning == "ABSOLUTE") {
        continue;
      }
      if(isHorizontal){
        gap += getWidth(child);
        redlines.push(new Redline(gap, absoluteY + (node.height / 2 - REDLINE_WIDTH_HALF), node.itemSpacing, Consts.REDLINE_WIDTH, node.itemSpacing, node.name, "Item Spacing").makeRedLine());
      }else {
        gap += getHeight(child);
        redlines.push(new Redline(absoluteX + (node.width / 2) - REDLINE_WIDTH_HALF, gap, Consts.REDLINE_WIDTH, node.itemSpacing, node.itemSpacing, node.name, "Item Spacing").makeRedLine());
      }
      gap += node.itemSpacing;
    }
  }
  return redlines;
}

function getHeight(node: SceneNode): number {
  if ("height" in node && typeof node.height == "number") {
    return node.height;
  }
  return 0;
}

export function getWidth(node: BaseNode): number {
  if ("width" in node && typeof node.width == "number") {
    return node.width;
  }
  return 0;
}

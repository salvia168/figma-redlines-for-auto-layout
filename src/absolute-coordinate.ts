export function getAbsoluteX(node: BaseNode, x: number): number {
  const parent = node.parent;
  if (parent == null) {
    return x;
  }
  if ("x" in parent && typeof parent.x == "number") {
    return getAbsoluteX(parent, parent.x + x);
  }
  return getAbsoluteX(parent, x);
}

export function getAbsoluteY(node: BaseNode, y: number): number {
  const parent = node.parent;
  if (parent == null) {
    return y;
  }
  if ("y" in parent && typeof parent.y == "number") {
    return getAbsoluteY(parent, parent.y + y);
  }

  return getAbsoluteY(parent, y);
}
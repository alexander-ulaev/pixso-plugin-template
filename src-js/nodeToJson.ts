export function nodeToJson(node: any, parent?: any) {
    const info: any = {
        id: node.id,
        name: node.name,
        type: node.type,
        visible: node.visible,
        locked: node.locked,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        rotation: node.rotation,
        opacity: node.opacity,
        parent: parent
    };

    // Стили и свойства в зависимости от типа элемента
    switch (node.type) {
        case 'FRAME':
        case 'GROUP':
            Object.assign(info, {
                fills: node.fills,
                strokes: node.strokes,
                strokeWeight: node.strokeWeight,
                strokeAlign: node.strokeAlign,
                cornerRadius: node.cornerRadius,
                effects: node.effects,
                constraints: node.constraints,
                layoutMode: node.layoutMode,
                paddingLeft: node.paddingLeft,
                paddingRight: node.paddingRight,
                paddingTop: node.paddingTop,
                paddingBottom: node.paddingBottom,
                itemSpacing: node.itemSpacing,
                clipsContent: node.clipsContent,
                layoutPositioning: node.layoutPositioning
            });
            break;

        case 'RECTANGLE':
        case 'ELLIPSE':
        case 'POLYGON':
            Object.assign(info, {
                fills: node.fills,
                strokes: node.strokes,
                strokeWeight: node.strokeWeight,
                strokeAlign: node.strokeAlign,
                cornerRadius: node.cornerRadius,
                effects: node.effects
            });
            break;

        case 'TEXT':
            Object.assign(info, {
                characters: node.characters,
                fontSize: node.fontSize,
                fontName: node.fontName,
                fontWeight: node.fontWeight,
                textAlign: node.textAlign,
                textAlignVertical: node.textAlignVertical,
                lineHeight: node.lineHeight,
                letterSpacing: node.letterSpacing,
                textCase: node.textCase,
                textDecoration: node.textDecoration,
                fills: node.fills,
                strokes: node.strokes,
                strokeWeight: node.strokeWeight,
                styledTextSegments: extractStyledTextSegments(node)
            });
            break;

        case 'INSTANCE':
        case 'COMPONENT':
            Object.assign(info, {
                mainComponent: node.mainComponent ? node.mainComponent.id : null,
                componentProperties: node.componentProperties,
                fills: node.fills,
                strokes: node.strokes,
                effects: node.effects
            });
            break;
    }

    return info;
}

export const getAllJsonNodes = async (selection: any) => {

    const result = [];

    for (const node of selection) {
        const nodeInfo = nodeToJson(node);
        // console.log("t1", nodeInfo)
        // console.log("node.children", node.children)
        const childrenArray = node.children;
        // console.log("childrenArray", childrenArray)

        // Добавляем информацию о дочерних элементах
        if (childrenArray?.length > 0) {
            nodeInfo.children = await getAllChildren(node);
        }

        result.push(nodeInfo);
    }

    return result;
    // selection.forEach(node => {
    //     const nodeInfo = nodeToJson(node);
    //     console.log("t1", nodeInfo)
    //     console.log("node.children", node.children)
    // const childrenArray = node.children;

    //     // Добавляем информацию о дочерних элементах
    //     if ('children' in node && node.children.length > 0) {
    //         nodeInfo.children = getAllChildren(node);
    //     }

    //     result.push(nodeInfo);
    // });
}

const getAllChildren = async (node: any) => {
    const children = [];

    const childrenArray = await node.children;

    // console.log("childrenArray 0", childrenArray);

    // if ('children' in node) {
    for (const child of childrenArray) {
        const childInfo = nodeToJson(child, node);
    // console.log("childInfo 0", childInfo);

        // const childInfo = child;
        // Рекурсивно получаем детей детей
           const childrenArray2 = await child.children;
    // console.log("childrenArray2 2", childrenArray2);

        if (childrenArray2?.length > 0) {
            try{
            childInfo.children = await getAllChildren(child);
            }catch(e) {
                console.log("error", e)
            }
        }

        // console.log("childInfo", childInfo)
        children.push(childInfo);
    }
    // }

    // console.log("return children", children)
    return children;
}


const extractStyledTextSegments = (node: any) => {
  return [
    {
      characters: node.characters,
      start: node.start,
      end: node.end,
      fontSize: node.fontSize,
      fontName: node.fontName,
      fontWeight: node.fontWeight,
      textDecoration: node.textDecoration,
      textCase: node.textCase,
      lineHeight: node.lineHeight,
      letterSpacing: node.letterSpacing,
      fills: node.fills,
      textStyleId: node.textStyleId,
      fillStyleId: node.fillStyleId,
      listOptions: node.listOptions,
      indentation: node.indentation,
      hyperlink: node.hyperlink,
      openTypeFeatures: node.openTypeFeatures
    }
  ]
}

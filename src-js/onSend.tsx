// import { jsonToHtml } from "./jsonToHtml";
import { oldConvertNodesToAltNodes } from "./altNodes/oldAltConversion";
import { htmlMain } from "./html/htmlMain";
import { getAllJsonNodes } from "./nodeToJson";
import { processNodePure } from "./pureNodeProcessor";
import { PluginSettings } from "./types";

export const onSendNodes = async (message: any) => {
    const selection = pixso.currentPage.selection;

    console.log("selection", selection);
    console.log("pixso", pixso);

    // if (nodes.length > 0) {
    // const node = nodes[0];

    // const convertedSelection = oldConvertNodesToAltNodes(selection, null);

    // console.log("convertedSelection", convertedSelection)

    // console.log("oldConvertNodesToAltNodes", JSON.stringify(convertedSelection, (key, value) => {
    //     if (key === 'parent') return undefined;
    //     return value;
    // }))

    const rawJsonNodes = await getAllJsonNodes(selection)

    // console.log("rawJsonNodes!!!!", JSON.stringify(rawJsonNodes));

    console.log("rawJsonNodes", JSON.stringify(rawJsonNodes, (key, value) => {
      if (key === 'parent') return undefined;
      return value;
    }))

    // Example PluginSettings
    // const settings: PluginSettings = {
    //     framework: "HTML",
    //     htmlGenerationMode: "html",
    //     tailwindGenerationMode: "html",
    //     showLayerNames: false,
    //     embedImages: false,
    //     embedVectors: true,
    //     useColorVariables: false,
    //     baseFontSize: 16,
    //     roundTailwindValues: true,
    //     roundTailwindColors: true,
    //     customTailwindPrefix: "",
    //     thresholdPercent: 0.01,
    //     baseFontFamily: "Arial",
    //     useTailwind4: false,
    //     responsiveRoot: false,
    //     flutterGenerationMode: "stateless",
    //     swiftUIGenerationMode: "struct",
    //     composeGenerationMode: "snippet",
    //     useOldPluginVersion2025: false
    // };

    const settings: PluginSettings = {
        framework: "HTML",
        showLayerNames: true,
        useOldPluginVersion2025: false,
        responsiveRoot: false,
        flutterGenerationMode: "snippet",
        swiftUIGenerationMode: "snippet",
        composeGenerationMode: "snippet",
        roundTailwindValues: true,
        roundTailwindColors: true,
        useColorVariables: true,
        customTailwindPrefix: "",
        embedImages: true,
        embedVectors: true,
        htmlGenerationMode: "html",
        tailwindGenerationMode: "jsx",
        baseFontSize: 16,
        useTailwind4: false,
        thresholdPercent: 15,
        baseFontFamily: ""
    }


    try {
        const result = await htmlMain(rawJsonNodes, settings);

        console.log("result html", result.html);
    } catch (err) {
        console.log("error", err)
    }

    // 2. Обогатить JSON (чистая функция без Figma API)
    // const processedNodes = await Promise.all(
    //     rawJsonNodes.map(node => processNodePure(node, settings))
    // );

    // console.log("processedNodes !!!", processedNodes);


    // 3. Сгенерировать HTML/CSS (чистая функция)
    //const result = await jsonToHtml(processedNodes.filter(n => n !== null), settings);

    //console.log("result !!!", result);
}

// const json = (await Promise.all(
//     nodes.map(
//         async (node: any) =>
//             (
//                 (await node.exportAsync({
//                     format: "JSON_REST_V1",
//                 })) as any
//             ).document,
//     ),
// ))

// console.log("json", json)

let isRunning = false;

/*
 * This is a wrapper for exportAsync() This allows us to pass a message to the UI every time
 * this rather costly operation gets run so that it can display a loading message. This avoids
 * showing a loading message every time anything in the UI changes and only showing it when
 * exportAsync() is called.
 */
export const exportAsyncProxy = async <
  T extends string | Uint8Array = Uint8Array /* | Object */,
>(
  node: any,
  settings: any /*| ExportSettingsREST*/,
): Promise<T> => {
  if (isRunning === false) {
    isRunning = true;
    // postConversionStart();
    // force postMessage to run right now.
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  console.log("wtf pixso", pixso);

  // const pixsoNode = (await pixso.getNodeByIdAsync(node.id)) as any;
  const pixsoNode = (pixso.getNodeById(node.id)) as any;
  console.log("getting pixso id for", pixsoNode);

  if (pixsoNode.exportAsync === undefined) {
    console.log("вот тут");
    throw new TypeError(
      "Something went wrong. This node doesn't have an exportAsync() function. Maybe check the type before calling this function.",
    );
  }

  // The following is necessary for typescript to not lose its mind.
  let result;
  if (settings.format === "SVG_STRING") {
    result = await pixsoNode.exportAsync(settings as any);
    // } else if (settings.format === "JSON_REST_V1") {
    //   result = await node.exportAsync(settings as ExportSettingsREST);
  } else {
    result = await pixsoNode.exportAsync(settings as any);
  }

  isRunning = false;
  return result as T;
};

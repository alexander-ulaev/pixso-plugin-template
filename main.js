// Основной файл плагина
console.log('Plugin loaded, command:', pixso.command);

const baseUrl = 'http://localhost:3012';


// Автоматически показываем UI при загрузке плагина
if (pixso.command === 'show-hello-world' || !pixso.command) {
  console.log('Showing UI...');
  pixso.showUI(__html__, { width: 300, height: 200 });
}

function findObjectsWithImageHash(tree) {
  const result = [];

  function traverse(node) {
    // Если у узла есть fills и это массив
    if (node.fills && Array.isArray(node.fills)) {
      // Проверяем каждый fill на наличие imageHash
      node.fills.forEach(fill => {
        if (fill.imageHash) {
          result.push({ ...fill });
        }
      });
    }

    // Если у самого узла есть imageHash (не в fills)
    if (node.imageHash) {
      result.push({ ...node });
    }

    // Рекурсивно обходим детей, если они есть
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        // Добавляем информацию о родителе для отслеживания иерархии
        if (!child.parentId) {
          child.parentId = node.id;
        }
        traverse(child);
      });
    }
  }

  // Обрабатываем массив узлов или одиночный узел
  if (Array.isArray(tree)) {
    tree.forEach(node => traverse(node));
  } else {
    traverse(tree);
  }

  return result;
}


// Функция для получения полной информации о ноде
function getNodeInfo(node) {
  const info = {
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
    opacity: node.opacity
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
        itemSpacing: node.itemSpacing
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
        textAlign: node.textAlign,
        textAlignVertical: node.textAlignVertical,
        lineHeight: node.lineHeight,
        letterSpacing: node.letterSpacing,
        textCase: node.textCase,
        textDecoration: node.textDecoration,
        fills: node.fills,
        strokes: node.strokes,
        strokeWeight: node.strokeWeight
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

// Рекурсивная функция для получения всех дочерних элементов
function getAllChildren(node) {
  const children = [];

  if ('children' in node) {
    for (const child of node.children) {
      const childInfo = getNodeInfo(child);
      // const childInfo = child;
      // Рекурсивно получаем детей детей
      if ('children' in child && child.children.length > 0) {
        childInfo.children = getAllChildren(child);
      }

      children.push(childInfo);
    }
  }

  return children;
}

// Основная функция
function getSelectedFrameInfo() {
  const selection = figma.currentPage.selection;

  console.log("selection", selection);

  if (selection.length === 0) {
    console.log("Ничего не выделено");
    return null;
  }

  const result = [];

  selection.forEach(node => {
    const nodeInfo = getNodeInfo(node);

    // Добавляем информацию о дочерних элементах
    if ('children' in node && node.children.length > 0) {
      nodeInfo.children = getAllChildren(node);
    }

    result.push(nodeInfo);
  });

  return result;
}

async function saveNodeData(nodeData) {
  const response = await fetch(`${baseUrl}/nodes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: JSON.stringify(nodeData) })
  });
}


async function sendImageByHash(hash) {
  console.log(pixso);
  const image = pixso.getImageByHash(hash);
  const bytes = await image.getBytesAsync();

  console.log("image", image);
  console.log("bytes", bytes);

  // Отправка массива байт на сервер
  try {
    const response = await fetch(`${baseUrl}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Image-Hash': hash
      },
      body: bytes
    });

    if (response.ok) {
      console.log('Image bytes sent successfully');
    } else {
      console.error('Failed to send image bytes');
    }
  } catch (error) {
    console.error('Error sending image bytes:', error);
  }
}


async function getImageByHash(hash) {
  console.log(pixso);
  const image = pixso.getImageByHash(hash);
  const bytes = await image.getBytesAsync();

  console.log("image", image);
  console.log("bytes", bytes);

  // Отправка массива байт на сервер
  try {
    const response = await fetch(`${baseUrl}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: bytes
    });

    if (response.ok) {
      console.log('Image bytes sent successfully');
    } else {
      console.error('Failed to send image bytes');
    }
  } catch (error) {
    console.error('Error sending image bytes:', error);
  }
}

// Функция для экспорта изображения по ID и отправки на сервер
async function exportAndSendImage(nodeId) {
  try {
    const node = pixso.getNodeById(nodeId);
    if (!node) {
      console.error('Node not found:', nodeId);
      return;
    }

    // Экспорт изображения в PNG
    const imageBytes = await pixso.exportAsync(node, { format: 'PNG' });
    const base64Image = btoa(String.fromCharCode(...imageBytes));

    // Отправка на сервер
    const response = await fetch(`${baseUrl}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: nodeId, image: base64Image })
    });

    if (response.ok) {
      console.log('Image sent successfully for node:', nodeId);
    } else {
      console.error('Failed to send image for node:', nodeId);
    }
  } catch (error) {
    console.error('Error exporting/sending image:', error);
  }
}

// Функция для получения обновлений с сервера через polling
async function pollServerForUpdates() {
  try {
    const response = await fetch(`${baseUrl}/updates`);
    if (response.ok) {
      const updates = await response.json();
      console.log('Received updates from server:', updates);

      // Обработка команд
      if (updates.type === 'getImage' && updates.nodeId) {
        exportAndSendImage(updates.nodeId);
      }

      // Другие обработки обновлений
      // pixso.ui.postMessage({ type: 'server-update', data: updates });
    }
  } catch (error) {
    console.error('Error polling server for updates:', error);
  }
}

// Запуск polling каждые 1 секунд
// setInterval(pollServerForUpdates, 1000);

// Обработка сообщений из UI
pixso.ui.onmessage = async (message) => {
  console.log('Message received:', message);
  // console.log('pixso !!', pixso);

  // const authData = {token:"testToken"};

  // await pixso.clientStorage.setAsync("chempdanAuth", authData);

  // const result = await pixso.clientStorage.getAsync('chempdanAuth');
  // // await chrome.storage.local.set({ 'chempdanAuth': authData });

  // const result = await chrome.storage.local.get(['chempdanAuth']);

  // console.log('result !!', result);


  if (message.type === "send-mcp") {
    const frameInfo = getSelectedFrameInfo();

    const images = findObjectsWithImageHash(frameInfo);

    console.log("images", images);

    for (const iamge of images) {
      await sendImageByHash(iamge.imageHash);
    }

    if (frameInfo) {
      // Вывод в консоль
      console.log("Полная информация о выделенном фрейме:", JSON.stringify(frameInfo, null, 2));




      saveNodeData(frameInfo);
      // Или сохранение в файл (если поддерживается платформой)
      // figma.ui.postMessage({type: 'export-data', data: frameInfo});
    }
  }

  if (message.type === "get-image") {
    getImageByHash(message.hash)

  }

  if (message.type === "get-style") {
    const style = pixso.getStyleById(message.id);
    console.log("id:", message.id, style)
  }


  // const socket = new WebSocket('ws://localhost:8080');

  // socket.onopen = () => {

  //   console.log('Connected to server');
  //   socket.send(JSON.stringify({ action: 'ping', data: 'Hello Server' }));
  // };
  if (!document) return;

  // Создаем текстовый элемент
  // const text = pixso.createText();
  // text.x = 100;
  // text.y = 100;
  // text.characters = "Hello World!";
  // text.fontSize = 24;
  // text.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

  // // Обновляем выделение
  // pixso.currentPage.selection = [text];

  // // Закрываем UI
  // pixso.closePlugin();
}
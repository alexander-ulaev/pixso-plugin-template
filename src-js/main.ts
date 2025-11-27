import {onSendNodes} from "./onSend"

pixso.showUI(__html__, { width: 300, height: 200 });

pixso.ui.onmessage = async (message) => {
  if (message.type === "send-nodes"){
    onSendNodes(message);
  }
}

// // Автоматически показываем UI при загрузке плагина
// if (pixso.command === 'show-hello-world' || !pixso.command) {
//   console.log('Showing UI...');
// }

import "./module1"
import "./module2"

// Автоматически показываем UI при загрузке плагина
if (pixso.command === 'show-hello-world' || !pixso.command) {
  console.log('Showing UI...');
  pixso.showUI(__html__, { width: 300, height: 200 });
}

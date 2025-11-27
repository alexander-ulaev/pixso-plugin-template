import './app.css'

export function App() {
  const onSend = ()=> {
    parent.postMessage({pluginMessage: {type: 'send-nodes'}}, '*');
  }

  return (
    <>
        <button onClick={onSend}>
          send
        </button>
    </>
  )
}

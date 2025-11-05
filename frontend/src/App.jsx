import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import "@radix-ui/themes/styles.css";
import { Theme,Button } from "@radix-ui/themes";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Theme>
    <Button variant="">Edit profile</Button>
    </Theme>

    </>
  )
}

export default App

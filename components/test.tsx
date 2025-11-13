'use client'

import { useState } from 'react'

export default function Test() {
  const [step, setStep] = useState(1)

  return (
    <div>
      <h1>Test {step}</h1>
      <button onClick={() => setStep(step + 1)}>Next</button>
    </div>
  )
}

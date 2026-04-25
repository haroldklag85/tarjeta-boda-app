import React from 'react'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-surface-container p-12 rounded-xl shadow-lg border border-outline-variant max-w-2xl">
        <h1 className="text-primary text-4xl mb-4">H & A</h1>
        <h2 className="text-on-surface text-2xl mb-6">Nuestra Boda</h2>
        <p className="text-on-surface-variant text-lg mb-8">
          Próximamente...
        </p>
        <button className="bg-primary text-on-primary px-8 py-3 rounded-md font-semibold tracking-wide hover:bg-surface-tint transition-colors">
          Abrir Invitación
        </button>
      </div>
    </div>
  )
}

export default App

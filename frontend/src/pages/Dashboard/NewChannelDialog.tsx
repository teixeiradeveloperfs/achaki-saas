import { useState } from 'react'
import type { RefObject } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { TextField } from '../../components/TextField'
import { CATEGORIES } from './data'

type NewChannelDialogProps = {
  ref: RefObject<HTMLDialogElement | null>
  onCreate: (name: string, category: string) => void
}

export function NewChannelDialog({ ref, onCreate }: NewChannelDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])

  return (
    <dialog
      className="dialog"
      ref={ref}
      aria-labelledby="novo-canal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) ref.current?.close()
      }}
    >
      <form
        className="dialog__form"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) return
          onCreate(name.trim(), category)
          setName('')
          ref.current?.close()
        }}
      >
        <header className="dialog__header">
          <h2 id="novo-canal-title">Novo canal</h2>
          <button type="button" className="dialog__close" aria-label="Fechar" onClick={() => ref.current?.close()}>
            <Icon name="close-circle" size={24} />
          </button>
        </header>
        <p>Crie um canal de exemplo para explorar o painel. Ele fica só nesta sessão, sem conectar ou enviar mensagens.</p>

        <TextField
          id="channel-name"
          label="Nome do canal"
          icon="users-group-rounded"
          placeholder="Ex.: Achadinhos de tecnologia"
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          required
        />

        <label className="dialog__field">
          Categoria
          <select className="select" value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <Button type="submit">
          Criar canal de exemplo
          <Icon name="arrow-right" />
        </Button>
      </form>
    </dialog>
  )
}

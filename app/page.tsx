"use client"

import { Dropdown } from "primereact/dropdown"
import { FileUpload } from "primereact/fileupload"
import { ProgressSpinner } from "primereact/progressspinner"
import { Tag } from "primereact/tag"
import { useState, useRef, useEffect } from "react"

export default function Home() {
  const [totalSize, setTotalSize] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [fileCount, setFileCount] = useState(0)
  const fileUploadRef = useRef(null)

  const onTemplateSelect = (e) => {
    let _totalSize = totalSize
    Object.keys(e.files).forEach((key) => {
      _totalSize += e.files[key].size || 0
    })
    setTotalSize(_totalSize)
    setFileCount(Object.keys(e.files).length)
  }

  const onTemplateUpload = (e) => {
    let _totalSize = 0
    e.files.forEach((file) => {
      _totalSize += file.size || 0
    })
    setTotalSize(_totalSize)
  }

  const onTemplateRemove = (file, callback) => {
    setTotalSize(totalSize - file.size)
    setFileCount((prev) => Math.max(0, prev - 1))
    callback()
  }

  const onTemplateClear = () => {
    setTotalSize(0)
    setFileCount(0)
  }

  const headerTemplate = (options) => {
    const { chooseButton, cancelButton } = options
    const value = Math.min((totalSize / 1000000) * 100, 100)
    const formatedValue = fileUploadRef?.current
      ? fileUploadRef.current.formatSize(totalSize)
      : "0 B"

    return (
      <div className="flex items-center gap-2 bg-zinc-800/60 px-4 py-3 border-white/5 border-b rounded-t-2xl">
        {chooseButton}
        {cancelButton}
        <div className="flex items-center gap-3 ml-auto">
          <span className="font-mono tabular-nums text-zinc-500 text-xs">
            {formatedValue} / 10 MB
          </span>
          <div className="bg-zinc-700 rounded-full w-24 h-1.5 overflow-hidden">
            <div
              className="bg-linear-to-r from-violet-600 to-violet-400 rounded-full h-full transition-all duration-500"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  const itemTemplate = (file, props) => (
    <div className="group flex items-center gap-3 px-4 py-3 border-white/5 border-b last:border-b-0 transition-colors">
      <img
        alt={file.name}
        role="presentation"
        src={file.objectURL}
        className="border border-white/10 rounded-xl w-12 h-12 object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-200 text-sm truncate">
          {file.name}
        </p>
        <p className="mt-0.5 text-zinc-500 text-xs">
          {new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <span className="bg-amber-500/10 px-2.5 py-1 border border-amber-500/20 rounded-lg font-medium text-amber-400 text-xs shrink-0">
        {props.formatSize}
      </span>
      <button
        onClick={() => onTemplateRemove(file, props.onRemove)}
        className="flex justify-center items-center hover:bg-red-500/10 opacity-0 group-hover:opacity-100 border border-red-500/20 hover:border-red-500/40 rounded-lg w-8 h-8 text-red-500/50 hover:text-red-400 transition-all shrink-0"
      >
        <i className="text-xs pi pi-times" />
      </button>
    </div>
  )

  const emptyTemplate = () => (
    <div className="flex flex-col justify-center items-center gap-3 py-10">
      <div className="flex justify-center items-center bg-violet-500/10 border border-violet-500/20 rounded-2xl w-16 h-16">
        <i className="text-violet-400/50 text-3xl pi pi-cloud-upload" />
      </div>
      <div>
        <p className="font-semibold text-zinc-400 text-sm text-center">
          Arraste seu arquivo aqui
        </p>
      </div>
    </div>
  )

  const formats = [
    {
      name: "WEBP",
      description: "Compressão moderna",
      code: "webp",
      icon: "pi-bolt",
    },
    {
      name: "PNG",
      description: "Sem perda de qualidade",
      code: "png",
      icon: "pi-image",
    },
    {
      name: "JPEG",
      description: "Menor tamanho",
      code: "jpeg",
      icon: "pi-file",
    },
  ]

  const formatOptionTemplate = (option) => (
    <div className="flex items-center gap-3 py-0.5">
      <div className="flex justify-center items-center bg-zinc-700/60 rounded-lg w-8 h-8 shrink-0">
        <i className={`pi ${option.icon} text-sm text-zinc-300`} />
      </div>
      <div>
        <p className="font-semibold text-zinc-200 text-sm leading-tight">
          {option.name}
        </p>
        <p className="text-zinc-500 text-xs">{option.description}</p>
      </div>
    </div>
  )

  const selectedFormatTemplate = (option) => {
    if (!option)
      return (
        <span className="text-zinc-500 text-sm">Selecione um formato...</span>
      )
    return (
      <div className="flex items-center gap-2">
        <i className={`pi ${option.icon} text-sm text-violet-400`} />
        <span className="font-medium text-zinc-200 text-sm">{option.name}</span>
        <span className="text-zinc-500 text-xs">— {option.description}</span>
      </div>
    )
  }

  const canDownload = fileCount > 0 && selectedFormat

  const baseAPIURL = `http://64.181.170.90:8080/api/v1/conversions/images/to-${selectedFormat?.code}`

  const postApiToDownload = async () => {
    const formData = new FormData()

    const currentFiles = fileUploadRef?.current?.getFiles()
    formData.append("file", currentFiles[0])
    setLoading(true)

    try {
      const response = await fetch(baseAPIURL, {
        method: "POST",
        body: formData,
      })

      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download =
        currentFiles[0].name.replace(/\.[^/.]+$/, "") +
        `.${selectedFormat.code}`
      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex justify-center items-center bg-zinc-900 p-4 min-h-screen overflow-hidden">
      <div className="relative bg-zinc-900/70 shadow-2xl shadow-black/60 backdrop-blur-xl p-7 border border-white/[0.07] rounded-3xl w-full max-w-lg">
        <h1 className="bg-clip-text bg-linear-to-r from-violet-400 to-orange-400 mb-2 font-black text-transparent text-3xl leading-tight tracking-tight">
          Conversor de arquivos
        </h1>
        <p className="mb-6 text-zinc-500 text-sm leading-relaxed">
          Faça upload da sua imagem, escolha o formato e baixe — tudo no
          navegador, sem enviar dados.
        </p>

        <div className="bg-linear-to-r from-transparent via-white/8 to-transparent mb-6 h-px" />

        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-[0.15em]">
            Arquivo
          </span>
          <div className="flex-1 bg-white/5 h-px" />
        </div>

        <FileUpload
          ref={fileUploadRef}
          name="demo[]"
          url="/api/upload"
          accept="image/*"
          maxFileSize={1000000}
          onUpload={onTemplateUpload}
          onSelect={onTemplateSelect}
          onError={onTemplateClear}
          onClear={onTemplateClear}
          headerTemplate={headerTemplate}
          itemTemplate={itemTemplate}
          emptyTemplate={emptyTemplate}
          pt={{
            root: { className: "border-0 rounded-2xl overflow-hidden mb-6" },
            content: {
              className:
                "!bg-zinc-800/40 !border !border-white/[0.07] rounded-b-2xl !p-0 transition-colors hover:!bg-zinc-800/60",
            },
          }}
          chooseOptions={{
            icon: "pi pi-plus",
            iconOnly: true,
            className:
              "!bg-zinc-700/60 !border !border-white/10 !text-zinc-300 hover:!bg-zinc-700 hover:!text-white !rounded-xl !w-9 !h-9 !p-0 transition-all",
          }}
          cancelOptions={{
            icon: "pi pi-trash",
            iconOnly: true,
            className:
              "!bg-transparent !border !border-red-500/20 !text-red-500/50 hover:!bg-red-500/10 hover:!border-red-500/40 hover:!text-red-400 !rounded-xl !w-9 !h-9 !p-0 transition-all",
          }}
          uploadOptions={{ className: "hidden" }}
        />

        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-[10px] text-zinc-500 uppercase tracking-[0.15em]">
            Formato de saída
          </span>
          <div className="flex-1 bg-white/5 h-px" />
        </div>

        <Dropdown
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.value)}
          options={formats}
          optionLabel="name"
          placeholder="Selecione um formato..."
          itemTemplate={formatOptionTemplate}
          valueTemplate={selectedFormatTemplate}
          pt={{
            root: {
              className:
                "w-full !bg-zinc-800/50 !border !border-white/[0.07] !rounded-2xl hover:!border-violet-500/40 transition-colors",
            },
            input: { className: "!py-3.5 !px-4 !text-sm" },
            trigger: { className: "!text-zinc-500 !pr-4" },
            panel: {
              className:
                "!bg-zinc-900 !border !border-white/10 !rounded-2xl !shadow-2xl !shadow-black/60 !mt-1.5 !overflow-hidden",
            },
            wrapper: { className: "!rounded-2xl" },
            list: { className: "!p-1.5" },
            item: {
              className:
                "!rounded-xl !px-3 !py-2.5 hover:!bg-violet-500/10 !text-zinc-300 !transition-colors data-[p-highlight=true]:!bg-violet-500/15 data-[p-highlight=true]:!text-violet-300",
            },
          }}
        />

        <button
          onClick={postApiToDownload}
          disabled={!canDownload}
          className={`
            mt-5 w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl
            font-bold text-sm tracking-wide transition-all duration-200
            ${
              canDownload
                ? "bg-linear-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-900/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-900/50 active:translate-y-0 cursor-pointer"
                : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-white/5"
            }
          `}
        >
          {!loading ? (
            <i
              className={`pi pi-download text-sm ${canDownload ? "text-violet-200" : "text-zinc-600"}`}
            />
          ) : (
            ""
          )}
          {loading ? (
            <ProgressSpinner
              style={{ width: "20px", height: "20px", stroke: "10px" }}
            />
          ) : canDownload ? (
            `Baixar como .${selectedFormat.code}${fileCount > 1 ? ` (${fileCount} arquivos)` : ""}`
          ) : (
            "Selecione arquivo e formato"
          )}
        </button>

        <p className="flex justify-center items-center gap-1.5 mt-4 text-[11px] text-zinc-700 text-center">
          <i className="text-[10px] pi pi-lock" />
          Processado localmente — nenhum arquivo é enviado
        </p>
      </div>
    </main>
  )
}

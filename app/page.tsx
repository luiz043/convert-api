"use client"

import { Dropdown } from "primereact/dropdown"
import { FileUpload } from "primereact/fileupload"
import { ProgressSpinner } from "primereact/progressspinner"
import { useState, useRef } from "react"

type FormatType = {
  name: string
  description: string
  code: string
  icon: string
}

interface selectedTypeInterface {
  image: FormatType[]
  document: FormatType[]
}
const FORMAT_MAP: selectedTypeInterface = {
  image: [
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
  ],
  document: [
    {
      name: "PDF",
      description: "Documento portátil",
      code: "pdf",
      icon: "pi-file-pdf",
    },
    {
      name: "DOCX",
      description: "Microsoft Word",
      code: "docx",
      icon: "pi-file-word",
    },
    {
      name: "TXT",
      description: "Texto simples",
      code: "txt",
      icon: "pi-align-left",
    },
  ],
}
type FileTypeCode = "image" | "document"

type FileType = {
  name: string
  description: string
  code: FileTypeCode
  icon: string
  accept: string
}

const FILE_TYPES: FileType[] = [
  {
    name: "Imagem",
    description: "PNG, JPEG, WEBP...",
    code: "image",
    icon: "pi-image",
    accept: "image/*",
  },
  {
    name: "Documento",
    description: "PDF, DOCX, TXT...",
    code: "document",
    icon: "pi-file",
    accept: ".pdf,.doc,.docx,.txt",
  },
]

export default function Home() {
  const [totalSize, setTotalSize] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<FileType | null>(null)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [fileCount, setFileCount] = useState(0)
  const fileUploadRef = useRef(null)

  const availableFormats = selectedType ? FORMAT_MAP[selectedType.code] : []

  const handleTypeChange = (e) => {
    setSelectedType(e.value)
    setSelectedFormat(null)
  }

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

  const getTypeDisabled = (typeCode) => {
    if (fileCount === 0) return false
    const currentFiles = fileUploadRef?.current?.getFiles() ?? []
    if (currentFiles.length === 0) return false
    const file = currentFiles[0]
    const isImage = file.type.startsWith("image/")
    if (typeCode === "image") return !isImage
    if (typeCode === "document") return isImage
    return false
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
    <div className="group flex justify-between items-center gap-3 px-4 py-3 border-white/5 border-b last:border-b-0 transition-colors">
      <div className="flex items-center gap-3 m-3 min-w-0">
        <div className="flex justify-center items-center border-2 border-white/60 rounded-xl w-12 h-12">
          <i
            className={`text-white/80 pi  ${fileUploadRef?.current?.getFiles()[0]?.type?.startsWith("image/") ? "pi-image" : "pi-file-pdf"}`}
            style={{ fontSize: "20px" }}
          ></i>
        </div>

        <div>
          <p className="font-medium text-md text-zinc-200 text-start truncate">
            {file.name}
          </p>
          <p className="mt-0.5 text-zinc-500 text-xs text-start">
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-amber-500/10 px-2.5 py-1 border border-amber-500/20 rounded-lg font-medium text-amber-400 text-sm shrink-0">
          {props.formatSize}
        </span>
        <button
          onClick={() => onTemplateRemove(file, props.onRemove)}
          className="flex justify-center items-center hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-lg w-8 h-8 text-red-500/50 hover:text-red-400 transition-all shrink-0"
        >
          <i className="text-xs pi pi-times" />
        </button>
      </div>
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

  const typeOptionTemplate = (option) => {
    const disabled = getTypeDisabled(option.code)
    return (
      <div className="flex items-center gap-2 m-2">
        <div>
          <p className="font-semibold text-zinc-200 text-sm leading-tight">
            {option.name}
          </p>
          <p className="text-zinc-500 text-xs">{option.description}</p>
        </div>
      </div>
    )
  }

  const selectedTypeTemplate = (option) => {
    if (!option)
      return (
        <span className="text-zinc-500 text-sm">Imagem / Documento...</span>
      )
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium text-zinc-200 text-sm">{option.name}</span>
        <span className="text-zinc-500 text-xs">— {option.description}</span>
      </div>
    )
  }

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
        <span className="text-zinc-500 text-sm">
          {selectedType
            ? "Selecione um formato..."
            : "Selecione o tipo primeiro..."}
        </span>
      )
    return (
      <div className="flex items-center gap-2">
        <i className={`pi ${option.icon} text-sm text-violet-400`} />
        <span className="font-medium text-zinc-200 text-sm">{option.name}</span>
        <span className="text-zinc-500 text-xs">— {option.description}</span>
      </div>
    )
  }

  const dropdownPT = {
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
    list: { className: "!m-1.5" },
    item: {
      className:
        "!rounded-xl !px-3 !my-2 py-2! hover:!bg-violet-500/10 !text-zinc-300 !transition-colors data-[p-highlight=true]:!bg-violet-500/15 data-[p-highlight=true]:!text-violet-300",
    },
  }

  const canDownload = fileCount > 0 && selectedFormat

  const baseAPIURL = `http://64.181.170.90:8080/api/v1/conversions/${selectedType?.code}s/to-${selectedFormat?.code}`

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
      <div className="relative bg-zinc-900/70 shadow-2xl shadow-black/60 backdrop-blur-xl p-7 border border-white/[0.07] rounded-3xl w-full max-w-[50%]">
        <h1 className="bg-clip-text bg-linear-to-r from-violet-400 to-orange-400 mb-2 font-black text-transparent text-3xl leading-tight tracking-tight">
          Conversor de arquivos
        </h1>
        <p className="mb-6 text-zinc-500 text-sm leading-relaxed">
          Faça upload da sua imagem, escolha o formato e baixe — tudo no
          navegador, sem enviar dados.
        </p>

        <div className="bg-linear-to-r from-transparent via-white/8 to-transparent mb-6 h-px" />

        {/* File upload section */}
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
          accept={selectedType?.accept ?? "*"}
          maxFileSize={10000000}
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

        <div className="flex gap-3 mb-5">
          <Dropdown
            value={selectedType}
            onChange={handleTypeChange}
            options={FILE_TYPES}
            optionLabel="name"
            placeholder="Tipo..."
            itemTemplate={typeOptionTemplate}
            valueTemplate={selectedTypeTemplate}
            optionDisabled={(option) => getTypeDisabled(option.code)}
            pt={{
              ...dropdownPT,
              root: {
                className:
                  "w-1/2 !bg-zinc-800/50 !border !border-white/[0.07] !rounded-2xl hover:!border-violet-500/40 transition-colors",
              },
            }}
          />

          <Dropdown
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.value)}
            options={availableFormats}
            optionLabel="name"
            placeholder={selectedType ? "Formato..." : "—"}
            disabled={!selectedType}
            itemTemplate={formatOptionTemplate}
            valueTemplate={selectedFormatTemplate}
            pt={{
              ...dropdownPT,
              root: {
                className: `w-1/2 !bg-zinc-800/50 !border !rounded-2xl transition-colors ${
                  selectedType
                    ? "!border-white/[0.07] hover:!border-violet-500/40"
                    : "!border-white/[0.04] opacity-50 cursor-not-allowed"
                }`,
              },
            }}
          />
        </div>

        <button
          onClick={postApiToDownload}
          disabled={!canDownload}
          className={`
            w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl
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
          ) : null}
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

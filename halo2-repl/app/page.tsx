"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { wrap, proxy, Remote } from "comlink";
import Editor, { Monaco } from "@monaco-editor/react";
import { type editor } from 'monaco-editor';
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Halo2Repl } from "./worker/halo2repl";
import { DEFAULT_CIRCUIT_CONFIG, makePublicDocs, halo2Docs } from "@axiom-crypto/halo2-js"
import { DEFAULT_CODE, DEFAULT_INPUT } from "@/utils/constants";
import { fetchGist, fetchGithubAccessToken } from "@/utils/github";
import JSZip from "jszip";
import Dropdown from "@/components/MenuDropdown";
import ButtonGroup from "@/components/ButtonGroup";
import Splitter, { SplitDirection } from '@devbookhq/splitter'
import Image from "next/image";
import MenuButton from "@/components/MenuButton";
import { parseCircuitTypes } from "@/utils/circuit";
import AxiomOverlay from "@/components/AxiomOverlay";

enum LogType {
  LOG,
  ERROR,
  LINK
}

function App() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const inputsRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [circuitVk, setCircuitVk] = useState<Uint8Array | null>(null);
  const [proof, setProof] = useState<Uint8Array | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null)

  const [initialSizesHorizontal, setInitialSizesHorizontal] = useState([70, 30])

  const handleResizeFinishedHorizonal = useCallback((_: any, newSizes: number[]) => {
    setInitialSizesHorizontal(newSizes)
  }, [])

  const [initialSizesVertical, setInitialSizesVertical] = useState([75, 25])

  const handleResizeFinishedVertical = useCallback((_: any, newSizes: number[]) => {
    setInitialSizesVertical(newSizes)
  }, [])

  const [circuitStats, setCircuitStats] = useState({
    advice: 0,
    lookup: 0,
    fixed: 0,
  });

  const [publicOutputs, setPublicOutputs] = useState([] as string[]);

  const [logs, setLogs] = useState([] as { type: LogType, text: string, url?: string, linkText?: string }[]);
  const [config, setConfig] = useState<{
    k: number;
    numAdvice: number;
    numInstance: number;
    numLookupBits: number;
  }>(DEFAULT_CIRCUIT_CONFIG);

  const workerApi = useRef<Remote<Halo2Repl>>();

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs]);

  useEffect(() => {
    const getGistFromQueryParam = async () => {
      const gist = searchParams.get("gist");
      if (!gist) return null;
      localStorage.setItem("GistID", gist);
      router.replace(pathname);
      const json = await fetchGist(gist);
      console.log(json);
      const code = json.files["circuit.js"].content;
      const input = json.files["inputs.json"].content;
      if (!code && !input) {
        console.error("invalid gist id")
      }
      localStorage.setItem("halo2wasmcode", JSON.stringify(code));
      localStorage.setItem("halo2wasminputs", JSON.stringify(input));
      if (editorRef.current) {
        editorRef.current.setValue(code);
      }
      if (inputsRef.current) {
        inputsRef.current.setValue(input);
      }
    };
    getGistFromQueryParam();
  }, []);

  useEffect(() => {
    const setupWorker = async () => {
      const worker = new Worker(new URL("./worker", import.meta.url));
      const Halo2Circuit = wrap<typeof Halo2Repl>(worker);
      workerApi.current = await new Halo2Circuit();
      workerApi.current.setup(navigator.hardwareConcurrency);
    }
    setupWorker();
  }, []);

  const getGithubAccessToken = async () => {
    const code = searchParams.get("code");
    if (!code) return;
    const token = await fetchGithubAccessToken(code);
    if (token) localStorage.setItem("GithubAccessToken", token);
    router.replace(pathname);
  };
  getGithubAccessToken();

  const appendLogs = (text: string) => {
    setLogs((logs) => [...logs, { type: LogType.LOG, text }]);
  };

  const appendError = (text: string) => {
    setLogs((logs) => [...logs, { type: LogType.ERROR, text }]);
  }

  const appendLink = (text: string, url: string, linkText: string) => {
    setLogs((logs) => [...logs, { type: LogType.LINK, text, url, linkText }]);
  }

  const populateCircuit = async () => {
    const inputs = inputsRef.current?.getValue() ?? "";
    const code = editorRef.current?.getValue() ?? "";
    const newConfig = await workerApi.current?.populateCircuit(code, inputs);
    if (!newConfig) return;
    setConfig(newConfig);
    const circuitInfo = await workerApi.current?.getCircuitStats();
    if (circuitInfo) setCircuitStats(circuitInfo);
    const publicOutputs = await workerApi.current?.getInstances();
    if (publicOutputs) {
      setPublicOutputs(publicOutputs.map((val) => "0x" + BigInt(val).toString(16)));
    };
  }

  const getDefaultValue = () => {
    const val = localStorage.getItem("halo2wasmcode");
    const result = val ? JSON.parse(val) : DEFAULT_CODE;
    return result;
  };
  const defaultValue = getDefaultValue();

  const getDefaultInputs = () => {
    let val = localStorage.getItem("halo2wasminputs");
    return val ? JSON.parse(val) : DEFAULT_INPUT;
  };
  const defaultInputs = getDefaultInputs();

  const withRedirectedConsole = async (cb: () => Promise<void>) => {
    // clearLogs();
    await workerApi.current?.captureConsoleOutput(proxy(appendLogs), proxy(console.log), proxy(console.time), proxy(console.timeEnd));
    try {
      await cb();
    }
    catch (e: any) {
      if (e.message === "unreachable") {
        appendError("halo2-wasm error: please check developer console for more information.")
      }
      else if (e.message === "Cannot read properties of undefined (reading 'halo2wasm_new')") {
        appendLogs("Please wait. Still loading halo2-wasm.")
      }
      else if (e.message === "Cannot read properties of undefined (reading 'prove_snark')") {
        appendError("Must run key generation before proof generation.")
      }
      else if (e.message === "undefined is not an object (evaluating 'this.halo2wasm.config')") {
        appendLogs("Please wait. Still loading halo2-wasm.")
      }
      else {
        appendError(e.message);
      }

    }
    await workerApi.current?.stopConsoleCapture();
  }

  const mock = async () => {
    await withRedirectedConsole(async () => {
      await populateCircuit();
      await workerApi.current?.mock();
    });
  };

  const keygen = async () => {
    await withRedirectedConsole(async () => {
      await populateCircuit();
      appendLogs("Starting key generation. This may take up to a minute.")
      await workerApi.current?.keygen();
      await workerApi.current?.stopConsoleCapture();
      const vk = await workerApi.current?.getVk();
      if (vk) setCircuitVk(vk);
    });
  };

  const prove = async () => {
    await withRedirectedConsole(async () => {
      appendLogs("Starting proof generation. This may take up to a minute.")
      const proof = await workerApi.current?.prove();
      if (proof) setProof(proof);
      await workerApi.current?.stopConsoleCapture();
    });
  };

  const downloadVk = async () => {
    let vkExport = await workerApi.current?.exportVk();
    if (!vkExport) return;
    let a = document.createElement("a");
    a.href = window.URL.createObjectURL(vkExport);
    a.download = "vk.hex";
    a.click();
    window.URL.revokeObjectURL(a.href);
  }

  const downloadProof = async () => {
    if (!proof) return;
    let proofExport = "0x" + Buffer.from(proof).toString("hex");
    let proofExportBlob = new Blob([proofExport], { type: "text/plain;charset=utf-8" });
    let a = document.createElement("a");
    a.href = window.URL.createObjectURL(proofExportBlob);
    a.download = "proof.hex";
    a.click();
    window.URL.revokeObjectURL(a.href);
  }

  const exportCircuit = async () => {
    await populateCircuit();
    let circuitCode = await workerApi.current?.exportCircuitCode();
    let circuitConstants = await workerApi.current?.exportCircuitConstants();
    if (!circuitCode || !circuitConstants) return;
    let zip = new JSZip();
    const template = await fetch(`/axiom-starter.zip`);
    const bytes = await template.arrayBuffer();
    zip = await zip.loadAsync(bytes);
    zip.file("app/circuit/index.ts", circuitCode);
    zip.file("app/circuit/constants.ts", circuitConstants);
    let generatedZip = await zip.generateAsync({ type: "blob" });
    let a = document.createElement("a");
    a.href = window.URL.createObjectURL(generatedZip);
    a.download = "axiom-starter.zip";
    a.click();
    window.URL.revokeObjectURL(a.href);
  };

  async function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, mock);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, save);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow, () => { editor.trigger('keyboard', 'editor.action.fontZoomIn', {}); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow, () => { editor.trigger('keyboard', 'editor.action.fontZoomOut', {}); });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [1375, 1378]
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      allowNonTsExtensions: true,
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      lib: ["es2020"]
    });
    const docs = [{docs: halo2Docs, name: "halo2lib.d.ts"}, {docs: makePublicDocs, name: "makePublic.d.ts"}];
    if(defaultInputs){
      docs.push({docs: parseCircuitTypes(defaultInputs), name: "inputs.d.ts"})
    }
    docs.forEach(doc => {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(doc.docs, doc.name);
      monaco.editor.createModel(doc.docs, 'typescript', monaco.Uri.parse(doc.name));

    })
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)

  }

  async function handleInputsDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    inputsRef.current = editor;
  }

  async function handleEditorChange(value: string | undefined, event: editor.IModelContentChangedEvent) {
    localStorage.setItem("halo2wasmcode", JSON.stringify(value));
  }

  async function handleInputsChange(value: string | undefined, event: editor.IModelContentChangedEvent) {
    localStorage.setItem("halo2wasminputs", JSON.stringify(value));
    if (value) {
      try {
        const code = parseCircuitTypes(value);
        let uri = monacoRef.current!.Uri.parse("inputs.d.ts")
        let model = monacoRef.current!.editor.getModel(uri)
        if (model) {
          model.dispose();
        }
        monacoRef.current!.languages.typescript.javascriptDefaults.addExtraLib(code, "inputs.d.ts");
        monacoRef.current!.editor.createModel(code, 'typescript', uri);
      } catch (e) {
        return false;
      }
    }

  }

  const saveFilesToGithub = async (
    input: { [fileName: string]: string },
    id: string | null
  ): Promise<any> => {
    if (id) {
      input[
        "about_halo2REPL.md"
      ] = `Open this in [Halo2REPL →](https://halo2repl.dev?gist=${id})\n`;
    }
    let output: { files: { [fileName: string]: { content: string } } } = {
      files: {},
    };
    for (let fileName in input) {
      output.files[fileName] = { content: input[fileName] };
    }
    const url = id
      ? "https://api.github.com/gists/" + id
      : "https://api.github.com/gists";
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(output),
      headers: {
        Authorization: "token " + localStorage.getItem("GithubAccessToken"),
      },
    });

    const json = await res.json();
    if (json.id) {
      return json.id;
    } else if (json.message === "Bad credentials") {
      router.push(
        `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=gist`
      );
    } else if (json.message === "Not Found") {
      console.log("not found");
      return await saveFilesToGithub(input, null);
    }
  };

  const save = async (newFile?: boolean) => {
    const GithubAccessToken = localStorage.getItem("GithubAccessToken");
    if (!GithubAccessToken) {
      router.push(
        `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&scope=gist`
      );
      return;
    }
    const code = editorRef.current?.getValue() ?? "";
    const inputs = inputsRef.current?.getValue() ?? "";
    let prevId = localStorage.getItem("GistID");
    if (newFile === true) {
      prevId = null;
    }
    const files = { "circuit.js": code, "inputs.json": inputs };
    const newId = await saveFilesToGithub(files, prevId);
    localStorage.setItem("GistID", newId);
    if (prevId !== newId) {
      await saveFilesToGithub(files, newId);
    }
    navigator.clipboard.writeText(`https://gist.github.com/${newId}`)
    if (newFile === true) {
      appendLink(`Created new gist. Link copied to clipboard: `, `https://gist.github.com/${newId}`, "GitHub")
    }
    else {
      appendLink(`Saved gist. Link copied to clipboard: `, `https://gist.github.com/${newId}`, "GitHub")
    }

  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-2">
      <div className="flex flex-row pb-2 justify-between">
        <Image src="/logo.svg" alt="Halo2Repl logo" width={120} height={150} />

        <div className="flex flex-row gap-2">
          <ButtonGroup
            items={[
              {
                text: "Test circuit",
                onClick: mock,
                shouldLoad: true
              },
              {
                text: "Generate keys",
                onClick: keygen,
                shouldLoad: true
              },
              {
                text: "Generate proof",
                onClick: prove,
                shouldLoad: true
              },
              // {
              //   text: chain?.name ? `Current Network: ${chain.name}` : "Connect Wallet",
              //   onClick: () => {
              //     if (isConnected) {
              //       signInModal.openSwitchNetworks();
              //     }
              //     else {
              //       signInModal.openProfile();
              //     }

              //   }
              // }
            ]}
          />
        </div>
      </div>
      <div className="grow">
        <Splitter gutterClassName="bg-gray-100 w-2" initialSizes={initialSizesHorizontal} onResizeFinished={handleResizeFinishedHorizonal}>
          <div className="bg-white border border-black flex flex-col h-full">
            {/* <div className="flex flex-col h-full"> */}
            <div className="flex flex-row justify-end border-b border-black">
              <Dropdown
                text="Export"
                items={[
                  // {
                  //   text: "Export NextJS App",
                  //   onClick: exportCircuit,
                  // },
                  {
                    text: "Export Verification Key",
                    onClick: downloadVk,
                  },
                  {
                    text: "Export Proof",
                    onClick: downloadProof,
                  }
                ]}
              />
              <Dropdown
                text="Save Gist"
                items={[
                  {
                    text: "Save as New Gist",
                    onClick: () => save(true),
                  },
                  {
                    text: "Save to Existing Gist",
                    onClick: save,
                  },
                  {
                    text: "Copy Gist URL",
                    onClick: () => {
                      let id = localStorage.getItem("GistID");
                      if (id == null) {
                        appendError("No gist found. Please save gist first.")
                        return;
                      };
                      navigator.clipboard.writeText(`https://gist.github.com/${id}`)
                      appendLink(`Link copied to clipboard: `, `https://gist.github.com/${id}`, "GitHub")
                    },
                  }
                ]}
              />
              <MenuButton
                text="Share"
                onClick={() => {
                  let id = localStorage.getItem("GistID");
                  if (id == null) {
                    appendError("No gist found. Please save gist first.")
                    return;
                  };
                  navigator.clipboard.writeText(`https://repl-preview.axiom.xyz?gist=${id}`)
                  appendLink(`Link copied to clipboard: `, `https://repl-preview.axiom.xyz?gist=${id}`, "Axiom REPL")
                }}

              />
              <MenuButton
                text="Docs"
                onClick={() => {
                  window.open('https://docs-v2.axiom.xyz/axiom-repl/compute-functions', '_blank');
                }}
              />
            </div>
            <Splitter direction={SplitDirection.Vertical} gutterClassName="bg-gray-100 w-1" initialSizes={initialSizesVertical} onResizeFinished={handleResizeFinishedVertical}>
              <Editor
                defaultLanguage="javascript"
                defaultValue={defaultValue}
                onMount={handleEditorDidMount}
                onChange={handleEditorChange}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollbar: {
                    verticalScrollbarSize: 5,
                    horizontalScrollbarSize: 5,
                  },
                  lineNumbersMinChars: 3,
                }}
              />
              <Editor
                defaultLanguage="json"
                defaultValue={defaultInputs}
                onMount={handleInputsDidMount}
                onChange={handleInputsChange}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollbar: {
                    verticalScrollbarSize: 5,
                    horizontalScrollbarSize: 5,
                  },
                  lineNumbersMinChars: 3,
                }}
              />
            </Splitter>
            {/* </div> */}
          </div>
          <div className="flex flex-col p-2 bg-white h-full border border-black">
            <div className="p-1 text-sm text-gray-900 font-semibold">Logs</div>
            <div className="break-words text-xs font-mono overflow-y-auto h-96 border border-black">
              {logs.map((log, i) => {
                const logClassName = " border-t px-2 py-1"
                return (
                  <div key={i} className={log.type == LogType.ERROR ? "text-red-600 bg-red-100" + logClassName : logClassName}>
                    <span>{log.text}</span>
                    {
                      log.type == LogType.LINK ?
                        <a href={log.url} target="_blank" rel="noreferrer" className="underline text-blue-600 hover:text-blue-800">{log.linkText}</a>
                        : null
                    }
                  </div>
                );
              })}
              <div className="border-t" ref={logsEndRef} />
            </div>
            <div className="p-1 text-sm text-gray-900 pt-3 font-semibold">Outputs</div>
            <div className="break-words text-xs font-mono p-2 overflow-y-auto h-40 border border-black">
              {publicOutputs.map((val, i) => {
                return (
                  <div key={i}>
                    {i + 1}.&nbsp;{val}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col">
              <div className="p-1 text-sm text-gray-900 pt-3 font-semibold">Circuit Stats</div>
              <div className="grow border border-black p-2 text-xs font-mono">
                <div>Total Advice Cells: {circuitStats.advice}</div>
                <div>Total Lookup Cells: {circuitStats.lookup}</div>
                <div>Total Fixed Cells: {circuitStats.fixed}</div>
                <div>Total Advice Columns: {config.numAdvice}</div>
                <div>k: {config.k}</div>
              </div>
            </div>

          </div>
        </Splitter>
        <AxiomOverlay />
      </div>
    </div>
  );
}

export default App;

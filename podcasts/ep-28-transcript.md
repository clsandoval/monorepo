# Ep 28: markitdown-microsandbox-monty-interlude

*Interlude review episode — eps 25-27 side-by-side comparison*
*Duration: ~44 min | CJK chars: 1721 | Turns: 213*

**B:** OK, interlude episode. Three repos in three weeks. I want to start with a dumb question.

**A:** Please.

**B:** They all feel like "run code safely for an agent" to me. Markitdown, microsandbox, monty. Am I just pattern-matching because they all showed up in the same miniseries?

**A:** You're partly right and mostly wrong, which is the useful kind of wrong. Only two of the three are about running untrusted code. Markitdown isn't. Markitdown is about shoving untrusted *data* into an LLM. Microsandbox and monty are about letting the LLM *emit* code and running it. Those are two different risk surfaces.

**B:** Wait. So markitdown is input, the other two are output.

**A:** Exactly. Markitdown takes a PDF your user uploaded and turns it into markdown the model can read. The model is the consumer. Microsandbox and monty both take a string the model generated and execute it. The model is the producer. Totally different threat model, totally different architecture, and totally different scaling story — which is what I want to talk about.

**B:** And ""危ない" — dangerous" applies to all three, but for different reasons.

**A:** Yes. Markitdown is 危ない — dangerous — because parsing a weird file format can blow up your worker. Microsandbox is 危ない because you're literally booting a VM from agent-written commands. Monty is 危ない only if the LLM asks your host to do something your host shouldn't do — the interpreter itself has no teeth.

**B:** Fine. Six axes, side by side. Go.

**A:** Let's do it properly. Compute topology, LLM locus, tool mechanics, extension loading, context strategy, scaling topology. Two are effectively N/A for these repos, so we'll move fast on those and spend the budget on the ones that actually differentiate.

**B:** Axis one. Where does each thing actually run? Physically. What binds its lifetime?

**A:** Start with markitdown. It's a Python library. You `pip install 'markitdown[all]'` — that lives under `packages/markitdown` in the repo — and you import `MarkItDown` into your own process. There is no daemon. There is no server. The "compute topology" is whatever compute topology your app already has. It's a function call that returns a string.

**B:** So if my FastAPI worker calls it, the worker is the sandbox. Well — it's not a sandbox at all. It's just the worker.

**A:** Right. And that's the one warning flashing in the README: "MarkItDown performs I/O with the privileges of the current process." That sentence is load-bearing. It means if you feed it a path, it opens that path with *your* permissions. If you feed it a URL, it hits that URL with *your* network egress. There's a whole "Security Considerations" section saying call the narrowest converter — `convert_local()`, `convert_stream()`, `convert_response()` — instead of the permissive `convert()`. But the compute is yours.

**B:** Cold-start cost?

**A:** Approximately zero. It's a Python import. The heavy optional deps — pdfminer, python-pptx, openpyxl — only get loaded when the extras are installed. First conversion of a PDF pays the import price, subsequent ones don't. You can genuinely call this synchronously inside a request handler and not feel bad about it, as long as the file is small.

**B:** Now microsandbox.

**A:** Total opposite. Microsandbox is a Rust project under `crates/` and `sdk/`, and what it actually does is spawn a microVM per sandbox. The README's pitch sentence — "lightweight VMs in milliseconds" — is not marketing; they're using libkrun underneath, which is in their acknowledgements. So there's a real hypervisor boot every time you call `Sandbox::builder("...").create()`. They claim sub-100ms average boot.

**B:** Is there a daemon?

**A:** They specifically say no long-running daemon. The VM is spawned as a child process of your app. When your `sandbox` variable is dropped, or you call `stop_and_wait()`, it goes away. Lifetime is bound to the handle in your code. That's a deliberate design choice versus, say, Firecracker-plus-an-orchestrator — the usual way people run microVMs involves a separate agent process per VM. Microsandbox makes it embeddable.

**B:** Requirements?

**A:** Linux with KVM, or macOS on Apple Silicon. The README says so. That's the catch — you can't run microsandbox on a Fargate task unless the underlying kernel exposes `/dev/kvm`, which most managed container platforms don't.

**B:** And monty?

**A:** Monty is the weirdest of the three from a topology perspective. It's a Rust crate — `crates/` in the repo — and what it ships is an interpreter. Not a process. Not a VM. A struct you call methods on. `MontyRun::new(code, "script.py", inputs).unwrap()` and then `runner.run(...)`. The README benchmark claim is "<1μs to go from code to execution result." Microseconds, not milliseconds. That's because there is no boot. You're not starting anything. You're walking a parsed AST inside your own thread.

**B:** Wait, the Python package is `pydantic-monty` — so there's a Python binding too?

**A:** Yes, PyO3. The Python module `pydantic_monty` wraps the Rust crate. So if you're in Python, `pydantic_monty.Monty(code, inputs=[...])` gives you a handle. You call `.run()` or `.run_async()`. The "compute" is your Python process. The interpreter runs in the same worker. Which means, uncomfortably, an infinite loop in monty code hangs your worker — until you set a limit. They expose resource trackers for memory, allocations, stack depth, execution time. You pass a tracker in; it cancels execution if the budget blows.

**B:** So three points on a spectrum. Markitdown: your process. Microsandbox: a child VM. Monty: your process, but fenced.

**A:** In Japanese it clicks even cleaner. ""markitdown は自分のプロセスで動く" — markitdown runs in your own process。"microsandbox は子 VM の中で動く" — microsandbox runs inside a child VM。"monty は自分のプロセスで動くが、基本しか使えない" — monty runs in your own process but can only use basics。"

**B:** 動く — work — three times already. 中 — inside. 基本 — basics. Packed sentence.

**A:** That's the concise version. And the startup cost profile tracks exactly — zero, ~100ms, <1μs. Now — ""LLM、どこで動く？" — LLM, where does it run?"

**B:** 動く — work. Ep 27 vocab.

**A:** Good. And the answer is: none of them. Axis two, LLM locus, is N/A for all three. These are infrastructure repos. None of them *call* an LLM as a core primitive.

**B:** Markitdown has that `llm_client` parameter though.

**A:** It does — optional. If you pass `llm_client=OpenAI()` and `llm_model="gpt-4o"`, the image converters and the markitdown-ocr plugin will use it for captions and OCR. But it's optional enrichment. The tool itself works without a model.

**B:** And microsandbox?

**A:** Zero LLM coupling. It doesn't care who wrote the code — you or an agent. It just runs it.

**B:** Monty?

**A:** Same. The *whole point* is "you call an LLM somewhere else, get Python code back, hand it to monty." The LLM is upstream. The README even links to Cloudflare's "code-mode" post and Anthropic's "programmatic tool calling" docs for motivation. Monty is downstream of the model.

**B:** So LLM locus — fast N/A across all three.

**A:** ""言語モデルは別のところにある" — the language model is elsewhere." 言語 — language — ep 27. Not our problem in this axis.

**B:** Axis three. Tool mechanics. What does "execute" actually mean in each of these?

**A:** Different layers of abstraction for the same verb "run." Markitdown's `convert()` method is a registry dispatch. You hand it a path or a stream; it looks at MIME type, dispatches to a converter class — one per format, under `packages/markitdown/src/markitdown/converters/` if I remember the layout right, it's in the packages subtree — and each converter knows how to turn its format into markdown. The output is a `DocumentConverterResult` with `.text_content`. That's the tool.

**B:** So the "primitive" markitdown exposes is: bytes in, markdown string out.

**A:** One function, strongly typed, fully in-process. No subprocess, no RPC. Python calls Python. The `convert_*` variants — `convert_local`, `convert_stream`, `convert_url`, `convert_response` — are the permission model. Choosing which one you call is how you restrict what it can touch. There's no separate ACL or policy file.

**B:** And output framing?

**A:** Stdout is the CLI path — `markitdown file.pdf > out.md`. Python API is return values. No streaming. Converters run to completion and return.

**B:** Microsandbox.

**A:** Microsandbox's primitive is a VM. The SDK gives you `Sandbox::exec("python", ["-c", "..."])` and you get an `Output` with `stdout()`, `stderr()`, exit code. Underneath, that's passing a command to a guest agent inside the VM, which runs it, and ships the result back. The guest OS is whatever image you specified — `image("python")` pulls the standard Python image from an OCI registry. They say OCI-compatible, so Docker Hub and GHCR work out of the box.

**B:** Permission model?

**A:** Hardware. Literally. The guest can only touch what the VM lets it touch. Filesystem is the VM's filesystem — you can mount volumes if you configure them. Network is whatever the VM's virtual NIC permits, which by default is outgoing-only on a NAT. The README talks about "secrets that can't leak" — I believe the mechanism is that secrets are injected via an API the guest calls but are never materialized inside the VM's memory in plaintext form you could exfiltrate cheaply. I'd need to read the crate to confirm the exact implementation.

**B:** ""中" — inside" — ep 26. The VM is the 中 and everything the agent writes stays 中.

**A:** Yes. The sandbox 中 — inside — is where execution happens; outside is untouchable unless you explicitly bridge. And if the agent ""試す" — tries" something naughty, the naughty happens in a VM that you can kill.

**B:** Monty?

**A:** Totally different again. Monty's primitive is the AST walker. You give it Python source; it parses, type-checks (it bundles `ty` from Astral for typechecking — the README says so, single binary), then evaluates by walking the AST. When the AST hits a function call to a name that isn't built in, it stops and surfaces a `FunctionSnapshot` to the host. The host decides what to do.

**B:** Show me that shape again — because this is the interesting one.

**A:** `result = m.start(inputs={'url': '...'})`. Execution runs, hits `fetch(url)`, which isn't defined inside monty, so it pauses. `result` is a `FunctionSnapshot` with `.function_name`, `.args`, and a `.resume(...)` method. You compute the real fetch on the host — real HTTP, real file I/O, whatever — and call `result.resume({'return_value': payload})`. Execution continues from where it paused.

**B:** So the "tool" is a callback.

**A:** The tool is the host. There's no filesystem primitive, no shell primitive, no HTTP primitive. If you want the agent's code to read a file, you expose a function `read_file(path)` as an external function and enforce whatever rules you want in the Rust or Python implementation. Monty itself cannot initiate I/O. It cannot escape because it doesn't know how.

**B:** That's wild. It's not a sandbox — it's a tamagotchi. It can only do things you hand-feed to it.

**A:** ""monty は何もできない、host が許すことだけできる" — monty can do nothing — only what the host permits。" That's the whole security model in one line. Default deny, ""開ける" — open" the doors you want, ""閉じる" — close" the rest by omission.

**A:** That's an excellent analogy. And that's why the scaling story is so different, which we'll get to. But first, extensions — axis four.

**B:** How does each repo let you add new stuff?

**A:** Markitdown has a real plugin system. The README points you at `packages/markitdown-sample-plugin` as the reference. Mechanism: Python entry points. A plugin registers under the `markitdown.plugin` entry point group in its `pyproject.toml`, and when you run `markitdown --use-plugins`, the core discovers them via `importlib.metadata.entry_points()`. Each plugin contributes `DocumentConverter` subclasses that get added to the registry. So to add ""新しい形式" — new format" support, you write a converter class and ship it as a separate pip package.

**B:** 形式 — format — ep 25.

**A:** Good. And crucially, plugins are opt-in. Default is disabled. `markitdown --use-plugins` on the CLI, `enable_plugins=True` in the Python constructor. That's a security posture — arbitrary Python on the classpath doesn't auto-run.

**B:** Microsandbox extensions?

**A:** Different concept. You don't "load" extensions into the sandbox core. What you load is a filesystem image — any OCI image — and what you configure is the policy: CPU, memory, volumes, network. Those are constructor parameters on `Sandbox::builder`: `.cpus(1)`, `.memory(512)`, and I believe there are `.volume()` and networking configurators too, which are in the SDK docs at docs.microsandbox.dev. The composition story is at the image level — you bake your own image with your own tools, push to a registry, reference it by tag.

**B:** So plugins = more capability for markitdown; images = more tools for microsandbox.

**A:** Right. And there's a separate extension point: the MCP server. `superradcompany/microsandbox-mcp` is a companion repo that wraps the SDK as MCP tool calls. If your agent speaks MCP, this is how it reaches microsandbox. Stdio transport, based on the `claude mcp add --transport stdio` example in the README.

**B:** Monty extensions?

**A:** Extensions in monty are *functions you register*. That's it. In Python: `external_functions={'fetch': my_fetch, 'call_llm': my_llm}` on `run_async()`. In Rust: the function registry is passed into `MontyRun::run()` via the arguments. Every capability the agent gets comes through that dict. No plugin discovery, no auto-loading, no config file that says "trust all functions matching *."

**B:** That's the whole extension story.

**A:** Yes. And it matches monty's philosophy — ""基本" — basics" — ep 27 — is: default-deny, explicit allow. The extension surface is exactly the map of strings to callables you pass in.

**B:** ""開ける" — to open" — ep 26. In monty you only 開ける — open — the doors you want.

**A:** And you ""閉じる" — close" — everything else by simply not registering it. Hardware isolation versus language-level isolation versus capability-level isolation. Three shades of "no." The markitdown plugin model is on a different axis — it's about extending what the library can *read*, not what it can *do* to your system.

**B:** Axis five — context and memory. This is the other fast N/A?

**A:** Mostly. None of these three maintain a conversation. They're stateless per call. But there is one sneaky exception worth noting: monty's snapshot feature.

**B:** The dump/load thing.

**A:** Yes. `MontyRun::dump()` and `MontyRun::load()` serialize the parsed-code state. More interestingly, `RunProgress::dump()` — or in Python, `snapshot.dump()` — serializes *execution-in-flight* to bytes. You can pause a running agent program at an external function call, write the bytes to a database, and resume the same execution from a different process three hours later. That is a form of context persistence — not LLM context, execution context. It's durable workflow-ish.

**B:** That's closer to Temporal or Inngest than to anything markitdown or microsandbox does.

**A:** Conceptually, yes. It's the same shape: externalize the boundary crossings, checkpoint there, resume there. Monty is a tiny version of that, where the "workflow" is a chunk of LLM-generated Python and the "activities" are the host functions. ""読み込む" — to load" — ep 27 — is literally what `load_snapshot` does. You 読み込む the state bytes back.

**B:** Microsandbox doesn't do snapshots?

**A:** It has detached-mode sandboxes — the README calls them long-running, "great for long-lived sessions." That's not a checkpoint, that's a VM you leave running. Different primitive. Markitdown has no state between calls at all.

**B:** OK — axis six. Scaling topology. This is the one you said was the meat.

**A:** Because each repo's answer is *forced* by its compute topology. The shape of your deploy is almost predetermined by which one you picked.

**B:** Start with markitdown.

**A:** Markitdown is a synchronous Python library. There's no server, no daemon, no pool built in. So scaling is whatever Python concurrency you already use. Options in rough order of realism: one, call it in-line in a FastAPI route for small files. Two, move it behind a thread pool executor because the parsers release the GIL sometimes and sometimes don't — depends on the backend. Three, push it into Celery or RQ or Arq workers and process files off-request. Four, run it as a per-request subprocess if you're paranoid about a malformed file crashing your worker.

**B:** And the README basically warns you about option one if the user uploaded the file.

**A:** Exactly. "Sanitize your inputs in untrusted environments." Which for markitdown usually means: don't run it in your main app process if untrusted users can control the bytes. A common production shape is: ingestion endpoint accepts upload, puts bytes on an object store, enqueues a job, a worker pool pulls jobs, each worker runs markitdown in a subprocess with a timeout, writes the markdown back. That's four components you're building yourself. Markitdown gives you the kernel; you build the chassis.

**B:** Microsandbox.

**A:** Microsandbox scales the way VM infra scales. A microVM is heavier than a thread and lighter than a container. Per-sandbox memory is whatever you set — 512 MiB in the README example — so one host can hold tens to low hundreds of simultaneous sandboxes before it runs out of real memory. Cold start is real — 100ms is cheap per-VM but expensive if you're on the request path.

**B:** So the typical deploy?

**A:** Two shapes. Shape A: a pool of warm VMs. You pre-boot N instances of the common image, park them, and when a request comes in you grab one, run the command, return it. That's what the "installed sandbox" CLI — `msb install ubuntu` — hints at. You're amortizing boot. Shape B: a queue. Request comes in, goes into Redis or SQS, workers pull, each worker creates a VM, runs the task, tears down, reports. That's better if tasks are long (minutes) and you can tolerate the 100ms boot.

**B:** And microsandbox requires KVM, so you're on bare-metal, EC2 metal, or certain Hetzner / OVH nodes.

**A:** Right. Or Apple Silicon dev machines, which is the "developer runs this locally" case the README leads with. Production at scale means you're provisioning KVM-capable hosts and probably sharding sandboxes across them with a router you write. The repo doesn't ship a cluster mode. That's yours.

**B:** Monty?

**A:** Monty is the easy one to scale and the hard one to limit. Because the interpreter lives in your process and has sub-microsecond startup, you can instantiate ""小さい" — small" — ep 27 — interpreter instances per request, trivially. An async worker running monty is essentially free per invocation. A FastAPI endpoint can create and destroy a `Monty` object per request and not notice. ""小さい interpreter が何百個も動く" — hundreds of small interpreters run。"

**B:** So scaling is: just run more workers.

**A:** Yes. The scaling unit is the process, not the sandbox. An Uvicorn worker with 200 concurrent async requests can have 200 live monty evaluations in flight and they won't step on each other because they don't share state. The hard part — and this is where monty demands discipline — is that the resource budget is *per-evaluation*, and if you don't set it, an agent can nuke your worker. You pass a tracker in. NoLimitTracker is in the example in the README, which is fine for tests and terrifying in production.

**B:** Durable?

**A:** Through snapshotting, yes. You can pause at an external call, persist, resume elsewhere. So you could pair monty with Temporal or DBOS and get durable agent programs with no VM overhead. That's the long-tail appeal.

**B:** Selection guide. I'm building an agent. Which do I reach for?

**A:** Decision tree, in roughly this order. First question: is the agent *reading* a document the user uploaded? If yes, markitdown. Full stop. It's the only one of the three that solves that problem. The model can't natively read a PPTX; markitdown turns it into markdown the model can. Nothing else here replaces that.

**B:** So markitdown is always upstream.

**A:** ""文書を変換してから、モデルに渡す" — after converting the document, hand it to the model。" 文書, 変換 — both ep 25.

**A:** Almost always. Second question: is the agent *writing* code and you need to run it? Now the choice is between microsandbox and monty, and it hinges on two sub-questions.

**B:** Sub-question one?

**A:** What language, and what breadth of capability? If the agent needs full Python with numpy and pandas and pip installs and spawning subprocesses and hitting arbitrary URLs, you need microsandbox. Monty will not run numpy. It won't run Pydantic. It's a subset. The README lists what it supports: `sys`, `os`, `typing`, `asyncio`, `re`, `datetime`, `json`, and dataclasses are coming. Classes aren't in yet. Match statements aren't in yet. That's it.

**B:** So monty is for constrained, pre-designed flows.

**A:** Exactly. Monty is for programmatic tool calling in the Anthropic sense: the LLM writes glue code that calls *your* functions with *your* types. It's not a general interpreter; it's a controlled expression layer over your toolset. If your agent's job is "decide which of these twenty functions to call in what order, with what data-flow between them," monty is beautiful — sub-microsecond per run, capability-safe by construction, embeddable in any worker. ""小さい言語で、基本の仕事だけを、host の関数を通してやらせる" — a small language, only basic jobs, made to work through host functions。" 小さい, 言語, 基本 — all ep 27.

**B:** And sub-question two?

**A:** Blast radius. If the agent gets compromised — prompt injection, jailbreak, whatever — what's the worst case? With monty, the worst case is the agent calls functions you registered, in orders you didn't expect, with arguments you didn't validate. So your *functions* have to be safe. That's a language-level guarantee. With microsandbox, the worst case is the agent runs arbitrary shell inside a VM. The VM has to be safe, which is a hardware guarantee. Different assurance models. Microsandbox gives you defense in depth against a compromised code generator. Monty gives you defense against an overreach through your API surface.

**B:** ""守る" — to protect" — ep 26. Microsandbox 守る with the hypervisor. Monty 守る with the capability map.

**A:** And markitdown doesn't 守る — protect — at all. Markitdown is the component you *put something in front of*. You sandbox markitdown. You don't sandbox with it.

**B:** In a real agent pipeline?

**A:** A composite is very plausible. Imagine: user uploads a PDF. Ingestion worker runs markitdown in a subprocess, timeout 30s, produces markdown. Markdown goes into the model's context. Model emits Python code that says "summarize this, then call `send_email(subject, body)`." You hand the code to monty, with `send_email` registered, and monty walks through, pausing at the call, you do the email send on the host, you resume. If the agent needed to also pip-install some tool and run it — no, you wouldn't use monty for that, you'd route that step to microsandbox as a separate tool. "Run a shell command in a sandbox" becomes one of the functions you expose to monty. So monty orchestrates, microsandbox executes, markitdown feeds the context.

**B:** A three-layer stack.

**A:** And that's the punchline of this whole miniseries. They don't compete. They occupy adjacent layers. Ep 25, 26, 27 weren't three options for the same job — they were three jobs. Interlude complete.

**B:** Grammar review. Three patterns. 〜られる, 〜てから, 〜れる passive.

**A:** ""この形式は変換できられる、えっと" — this format can be converted, uh." Wait, that's a mistake, 〜られる on 変換 becomes 変換できる plus potential — actually for suru-verbs the potential is できる itself. Let me redo.

**B:** Slow down.

**A:** ""PDF は markitdown で読まれる" — a PDF can be read by markitdown." That's passive — ep 27 grammar. And the potential — ep 25 grammar — shows up like this: ""この文書は変換できる" — this document can be converted." 文書 — document — ep 25 vocab. For plain verbs: ""小さいコードは動かせる" — small code can be run." 小さい — small — and 動く — work — both ep 27.

**B:** 〜てから.

**A:** Sequential, "after A, then B." ""サンドボックスを開けてから、コードを試す" — after opening the sandbox, try the code." 開ける — open — and 試す — try — both ep 26. Another: ""形式を写してから、LLM に送る" — after copying the format, send it to the LLM." 写す — copy — ep 25. And: ""VM を閉じてから、次の仕事に移る" — after closing the VM, move to the next job." 閉じる — close — ep 26.

**B:** More potential form. 〜られる.

**A:** ""この言葉は読まれる" — this word can be read." 言葉 — word — ep 25. Wait — 読まれる is the passive, not the potential. Potential of 読む is 読める. Let me be careful. ""この言葉は読める" — this word can be read." Potential. ""この記号は写せる" — this symbol can be copied." 記号 — symbol — and 写す — both ep 25. ""基本の言語は訳せる" — the basic language can be interpreted." 基本 — basics — 言語 — language — 訳す — interpret — all ep 27.

**B:** Passive 〜れる.

**A:** ""危ないファイルが開かれる" — a dangerous file is opened." 危ない — dangerous — ep 26. ""コードは monty に読み込まれる" — code is loaded by monty." 読み込む — load — ep 27. ""VM は守られる" — the VM is protected." 守る — protect — ep 26.

**B:** I'm tracking both patterns. Passive has an agent; potential is just "can do it."

**A:** Exactly. ""中に閉じ込められる" — it can be confined inside" — 中 — inside — ep 26 — is potential of 閉じ込める. Whereas ""言葉が記号に写される" — the word is copied to the symbol" is passive — the word isn't doing; it's being done to. Listen for に — with potential you don't need it; with passive, the agent is marked by に.

**B:** ""全部読めた、試した、動いた" — all read, tried, worked."

**A:** Excellent three-in-a-row. 読める potential, 試す ep 26 vocab, 動く ep 27.

**B:** Let me try a whole sentence chaining ep 25 vocab. ""この文書の形式は markitdown で変換できる" — this document's format can be converted with markitdown."

**A:** Good. Now chain again with ep 26: ""危ないコードは VM の中で試せる" — dangerous code can be tried inside the VM." Sorry — 試せる — the potential. ""試せる" — can try."

**B:** And ep 27: ""小さい言語でも基本は動く" — even a small language, the basics work."

**A:** Nice. Now a 〜てから chain across all three eps. ""文書を写してから、中に閉じてから、コードを読み込む" — after copying the document, after closing it inside, load the code." 写す ep 25, 閉じる ep 26, 読み込む ep 27.

**B:** Stacking てから is allowed?

**A:** Natively, yes, though two or three is the limit before it sounds clunky. One more: ""VM を開けてから、Python を動かしてから、結果を訳す" — after opening the VM, after running Python, interpret the result." 開ける ep 26, 動く ep 27, 訳す ep 27.

**B:** Another round of passive 〜れる. I want to hear it on infrastructure verbs.

**A:** ""markitdown で形式が変換される" — the format is converted by markitdown." 形式 ep 25. ""microsandbox で危ないコードが守られる" — dangerous code is protected by microsandbox." 危ない and 守る ep 26. ""monty で言語が訳される" — the language is interpreted by monty." 言語 and 訳す ep 27.

**B:** And the potential, one more pass.

**A:** ""この記号は写せる" — this symbol can be copied." ""この扉は開けられる" — this door can be opened." ""この基本は読める" — these basics can be read."

**B:** Closing exposures. I'll list every review word in one sentence each, short.

**A:** Go.

**B:** ""変換" — conversion。"文書を変換する。" "形式" — format。"形式が違う。" "記号" — symbol。"記号を写す。" "言葉" — word。"言葉が読める。" "写す" — copy。"記号を写せる。"

**A:** Ep 25 clean. Ep 26: ""守る" — protect。"中を守る。" "危ない" — dangerous。"危ないコード。" "試す" — try。"試してから判断する。" "閉じる" — close。"VM を閉じる。" "開ける" — open。"扉を開ける。" "中" — inside。"中で動く。"

**B:** Ep 27: ""訳す" — interpret。"言語を訳す。" "小さい" — small。"小さい interpreter。" "動く" — work。"コードが動く。" "言語" — language。"Python 言語。" "基本" — basics。"基本だけ動く。" "読み込む" — load。"状態を読み込む。"

**A:** Every anchor hit four-plus times now. One more layered sentence to retire the set. ""文書を写してから、危ない形式を中で試して、小さい言語で読み込んで、基本が動くか見守る" — after copying the document, try the dangerous format inside, load it with the small language, and watch whether the basics work."

**B:** That is a monster sentence.

**A:** It's the whole miniseries in one 〜てから chain. 文書, 写す, 危ない, 形式, 中, 試す, 小さい, 言語, 読み込む, 基本, 動く, 見守る. Ep 25, 26, 27, and the callforward to ep 29.

**B:** One more pass — I want to drill 〜てから with real engineering verbs, not just vocabulary drill sentences.

**A:** ""ファイルを読み込んでから、形式を判定する" — after loading the file, decide the format." Markitdown actually does this — `convert()` sniffs the content and dispatches. ""イメージを pull してから、VM を作る" — after pulling the image, create the VM." Microsandbox: first image fetch, then boot. ""コードを parse してから、動かす" — after parsing the code, run it." Monty.

**B:** And with 〜られる potential in the same workflow sentences.

**A:** ""文書は markitdown で変換できる、そして LLM に送れる" — the document can be converted with markitdown, and sent to the LLM." ""小さいサンドボックスなら百個でも動かせる" — with small sandboxes, even a hundred can be run." ""monty は Rust でも Python でも使える" — monty can be used from Rust or Python."

**B:** Passive drills.

**A:** ""プラグインは entry-point で読み込まれる" — plugins are loaded via entry-point." 読み込む ep 27. ""VM は KVM の上で動かされる" — VMs are run on top of KVM." ""外部関数は host から渡される" — external functions are passed from the host."

**B:** That last one is perfect — the whole monty design in one passive.

**A:** ""危ないコードは VM に閉じ込められる" — dangerous code is confined to the VM." 危ない and 閉じる ep 26. ""言葉は記号に写される" — words are copied to symbols." 言葉, 記号, 写す — all ep 25.

**B:** Let me try a full architecture sentence in Japanese.

**A:** Attempt it.

**B:** ""文書を markitdown で変換して、形式を整えて、LLM に送ってから、コードが返されて、monty で動かす。危ないときは microsandbox の中で試す" — convert the document with markitdown, adjust the format, after sending to the LLM, code is returned, run with monty. When dangerous, try inside microsandbox."

**A:** That is genuinely the whole pipeline in one sentence. 文書, 変換, 形式, 送る, 返す passive 〜れる, 動かす, 危ない, 中, 試す. Ep 25 and 26 vocab both wired in, plus the passive from ep 27.

**B:** I'll do one for potential form.

**A:** Go.

**B:** ""この pipeline なら、agent が書いたコードは安全に動かせる、ファイルも読める、結果も返せる" — with this pipeline, agent-written code can be safely run, files can be read, and results can be returned."

**A:** Triple potential — 動かせる, 読める, 返せる. That's the whole point of the miniseries captured in one modal construction: what becomes *possible* when you layer these three.

**B:** And one last 〜てから for the road.

**A:** ""三つの repo を読んでから、初めて agent infra が見える" — only after reading all three repos, you can finally see agent infra." 読む, 見える — both potential-ish shapes. 三つ — three. That's the interlude.

**B:** 見える — can see — potential of 見る. Nice segue to 見守る.

**A:** Exactly. 見える, 見守る, 見る — same kanji, different weights. ""見守る agent" — an agent that watches over" is the next episode. We 見える — see — the architecture now, and in ep 29 we learn how to 見守る — watch over — it live.

**B:** Give me the last drill. Rapid-fire, one sentence per vocab item.

**A:** Ep 25: ""PDF を markitdown で変換する" — convert a PDF with markitdown。"文書の中身を読む" — read the document's contents。"形式が合わないと変換できない" — if the format doesn't match, can't convert。"記号はそのまま写される" — symbols are copied as-is。"言葉の順番を守る" — preserve the order of words。"表の形を写す" — copy the table's shape。"

**B:** 変換 two, 文書 one, 形式 two, 記号 one, 言葉 one, 写す two, plus 守る crossover. Ep 26: ""危ないコードから host を守る" — protect the host from dangerous code。"危ないファイルも安全に試せる" — dangerous files can be tried safely too。"VM を試してから閉じる" — try the VM, then close it。"扉を開けるのは host だけ" — only the host opens the door。"コードは VM の中で動く" — code runs inside the VM。"

**A:** 守る two, 危ない two, 試す two, 閉じる one, 開ける one, 中 one. Ep 27: ""monty は Python を訳す" — monty interprets Python。"小さい subset だけ訳せる" — only a small subset can be interpreted。"基本の文が動く" — basic statements work。"言語として軽い" — lightweight as a language。"状態を読み込んで再開する" — load state and resume。"何度でも動かせる" — can be run any number of times。"

**B:** 訳す two, 小さい one, 動く two, 言語 one, 基本 one, 読み込む one — plus potential form on 動かせる and 訳せる.

**A:** Total tally is well past four exposures for every item. And the grammar patterns — 〜られる potential, 〜てから sequential, 〜れる passive — have been demoed together with review vocab at least five times each. Review is complete.

**B:** ""全部カバーした" — covered everything。"

**A:** ""次の episode まで、見守って" — watch over until the next episode。"

**B:** Wait — one more volley. I want to do a big closing paragraph entirely as vocab chain, for listener memory.

**A:** Do it.

**B:** ""文書を読み込んでから、形式を変換して、記号や言葉や表を全部写す。これが markitdown の仕事" — after loading the document, convert the format, copy all symbols and words and tables. This is markitdown's job。"

**A:** ""危ないコードを VM の中に閉じて、agent に試させる。扉を開けるかどうかは host が決める。これが microsandbox の仕事" — confine dangerous code inside the VM, let the agent try. Whether to open the door is the host's decision. This is microsandbox's job。"

**B:** ""小さい言語を訳して、基本だけ動かす。状態を読み込んで、また動かせる。これが monty の仕事" — interpret the small language, run only basics. Load state, run again. This is monty's job。"

**A:** Three paragraphs, three jobs, every review anchor fired once more. ""終わり" — end。" See you in ep 29.

**B:** Actually — before we cut — give me the one-line elevator in Japanese, for each, as review coda.

**A:** ""markitdown は文書を LLM の言葉に変換するライブラリ" — markitdown is a library that converts documents into the LLM's language。" 文書, 言葉, 変換 — all ep 25, folded into a definition.

**B:** Microsandbox.

**A:** ""microsandbox は危ないコードを VM の中に閉じて、安全に試す道具" — microsandbox is a tool that confines dangerous code inside a VM and safely tries it。" 危ない, 中, 閉じる, 試す — all ep 26, one sentence.

**B:** Monty.

**A:** ""monty は小さい Python を訳して、host の関数だけ動かす interpreter" — monty is an interpreter that interprets small Python and runs only host functions。" 小さい, 訳す, 動く — ep 27.

**B:** Perfect shape. One sentence per repo, every vocab bucket from that ep, zero overflow.

**A:** ""これで interlude は本当に終わり。次は ep 29、エージェントの行動を見守る話" — with this the interlude is really done. Next is ep 29, a story about watching over agent behavior。" 見守る — the callforward.

**B:** ""安全な flight を" — safe flight。"みんな、また聞いてね" — everyone, listen again。"三つの repo、三つの層、三つの守り方" — three repos, three layers, three ways of protecting。"

**A:** ""文書を変換して、コードを試して、言語を訳す。これで agent の中身が見える" — convert documents, try code, interpret language. With this, the agent's insides become visible。"

**B:** ""見える" — visible、"見守る" — watch over、ep 29 まで (until ep 29)。"おやすみなさい" — goodnight。"

**B:** Let me restate the whole interlude in plain terms.

**A:** Please.

**B:** Three repos, three jobs. Markitdown takes weird files and gives the model clean markdown. It's a Python library — no daemon, no sandbox, runs with your process's privileges, so you put a subprocess or a worker queue around it. Plugins extend which formats it understands.

**A:** Correct.

**B:** Microsandbox takes agent-written shell commands and runs them inside a real VM. Sub-100ms boot. No daemon. Embedded in your code. Needs KVM. Extensions are OCI images; agent access is via SDK or an MCP server in a sister repo.

**A:** Correct.

**B:** Monty takes agent-written Python and walks it with an interpreter inside your own process. Sub-microsecond startup. No VM. Safety comes from the fact that the interpreter can't do anything — every capability is a function you register. Extensions are that function map. Can snapshot execution for durable workflows.

**A:** Correct. And the one nuance I'd add — the scaling topology is almost decided for you the moment you pick one. Markitdown forces you to think about subprocesses and queues for untrusted input. Microsandbox forces you to think about VM pools and KVM hosts. Monty lets you scale trivially with process count but forces you to think hard about resource trackers, because the interpreter shares your worker's address space. Each tool trades one kind of operational complexity for another kind of design discipline.

**B:** And the layering realization — they stack.

**A:** ""三つは競争していない、重なっている" — the three don't compete — they layer。" 重なる — layer, overlap. A word that didn't appear in the miniseries but captures it. Each tool ""守る" — protect" a different ""中" — inside": markitdown the input boundary, microsandbox the OS boundary, monty the language boundary.

**B:** Three 中 — insides — three 守る — protections.

**A:** Markitdown feeds context in, monty orchestrates, microsandbox executes shell. You'd use all three in a mature agent stack, not one. That's the framing I want listeners to walk out with.

**B:** Next episode. Ep 29.

**A:** Ep 29 is a new repo. Single deep dive. No spoilers, but I'll say this: after three weeks of "how do we run untrusted code safely?", the next one is about "how do we *watch* code as it runs?" Observability for agent processes. A different primitive entirely.

**B:** ""見守る" — to watch over." 守 is the kanji we already know from ep 26.

**A:** Good catch. 見守る — watch over — is the callforward. Same 守 character as 守る — protect — but with 見 — see — in front. Protecting by watching. That's the vibe of the next episode.

**B:** All right. Safe flight, everyone. 見守る — watch over — your agents out there.

**A:** See you in ep 29.

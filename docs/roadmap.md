---
title: Project Roadmap
description: Development phases and strategic planning for IMRF
author: Seregonwar
date: "2024-12-17"
tags: [roadmap, planning, development, architecture]
visibility: public
---

# Project Paper — Interactive Markdown Rendering Framework (IMRF)

## 1. Abstract

Questo documento descrive la progettazione e lo sviluppo di un framework per la trasformazione di contenuti Markdown statici in documentazione web interattiva, modulare e altamente personalizzabile.
L’obiettivo principale è ridurre la frammentazione dei file Markdown, migliorare la navigabilità dei contenuti e offrire un’esperienza utente avanzata senza violare le limitazioni imposte dalle piattaforme di hosting dei repository (es. GitHub).

Il framework separa chiaramente il **contenuto** dalla **presentazione**, utilizzando Markdown/MDX come sorgente e un renderer web esterno come destinazione.

> **Quick Start**: New to IMRF? Begin with our [getting started guide](./getting-started.md) for immediate implementation steps.

---

## 2. Problem Statement

I repository moderni soffrono di tre problemi principali:

1. **Staticità del README**
   Il README.md non supporta interattività, navigazione avanzata o composizione dinamica.

2. **Proliferazione dei file Markdown**
   La documentazione cresce orizzontalmente (INSTALL.md, API.md, USAGE.md…), aumentando il costo di manutenzione.

3. **Scarsa personalizzazione**
   Markdown standard limita branding, layout e componenti avanzati.

Le soluzioni attuali (MkDocs, Docusaurus, GitBook) sono valide ma:

* generaliste
* pesanti
* poco adatte all’integrazione stretta con il profilo GitHub come “entry point”.

---

## 3. Objectives

* Ridurre il numero di file Markdown necessari per documentare un progetto
* Abilitare una navigazione strutturata e modulare
* Offrire elevata personalizzazione grafica e funzionale
* Mantenere compatibilità con GitHub (README come gateway)
* Fornire un framework estendibile, non un sito statico

---

## 4. Architectural Overview

### High-level Architecture

```
Markdown / MDX
      ↓
Parser & AST
      ↓
Custom Renderer
      ↓
Web Output (SPA / SSR)
      ↓
Public Docs Endpoint
```

### Key Principles

* **Stateless rendering**
* **Server-side generation**
* **Composable sections**
* **Platform-agnostic content**

---

## 5. Development Phases

### Phase 1 — Core Rendering Engine (MVP)

**Descrizione**
Sviluppo del motore minimo in grado di:

* leggere Markdown/MDX
* costruire una struttura interna (AST)
* renderizzare una documentazione navigabile

**Deliverables**

* Markdown parser (implemented in [lib/markdown.ts](../lib/markdown.ts))
* Renderer HTML/SVG base
* Routing per sezioni
* Layout minimale

> **Implementation Status**: Core parsing capabilities are now available. See the [API reference](./api.md) for detailed function documentation.

| Metric             | Valore        |
| ------------------ | ------------- |
| **P (Priority)**   | 🔴 Alta       |
| **D (Difficulty)** | 🟡 Media      |
| **C (Complexity)** | 🟡 Media      |
| **V (Value)**      | 🔴 Molto Alta |

👉 Senza questa fase, il framework non esiste.

---

### Phase 2 — Content Modularization & Navigation

**Descrizione**
Introduzione del concetto di *sezione* invece di *documento*.

**Features**

* indice automatico
* sidebar dinamica
* anchor intelligenti
* cross-linking tra sezioni

**Deliverables**

* sistema di routing interno
* generazione TOC
* gestione struttura gerarchica

| Metric | Valore        |
| ------ | ------------- |
| **P**  | 🔴 Alta       |
| **D**  | 🟡 Media      |
| **C**  | 🟡 Media      |
| **V**  | 🔴 Molto Alta |

👉 Qui si riduce davvero il numero di file Markdown.

---

### Phase 3 — Custom Components & Extended Markdown

**Descrizione**
Estensione del linguaggio Markdown con componenti dichiarativi.

**Esempi**

```md
<Alert type="warning">
Breaking change ahead
</Alert>
```

```md
<Section id="install" visibility="public" />
```

**Deliverables**

* parser esteso
* registry dei componenti
* rendering isolato

| Metric | Valore        |
| ------ | ------------- |
| **P**  | 🟡 Media      |
| **D**  | 🔴 Alta       |
| **C**  | 🔴 Alta       |
| **V**  | 🔴 Molto Alta |

👉 Questo è il vero fattore differenziante.

> **Live Examples**: See custom components in action in our [interactive showcase](./features.md).

---

### Phase 4 — GitHub Integration Layer

**Descrizione**
Integrazione “non invasiva” con GitHub.

**Features**

* README minimal → link parametrico
* badge SVG dinamici
* deep-linking contestuale
* preview generati server-side

**Deliverables**

* badge service
* link resolver
* GitHub-oriented presets

| Metric | Valore          |
| ------ | --------------- |
| **P**  | 🟡 Media        |
| **D**  | 🟢 Bassa        |
| **C**  | 🟡 Media        |
| **V**  | 🟡 Media / Alta |

👉 Migliora l’impatto percepito, non il core tecnico.

---

### Phase 5 — Theming & Personalization Framework

**Descrizione**
Sistema di personalizzazione avanzata.

**Features**

* temi
* layout custom
* preset per tipologia progetto
* override CSS/SVG

**Deliverables**

* theme engine
* design tokens
* preset loader

| Metric | Valore   |
| ------ | -------- |
| **P**  | 🟢 Bassa |
| **D**  | 🟡 Media |
| **C**  | 🟡 Media |
| **V**  | 🔴 Alta  |

👉 Qui vendi il progetto.

---

### Phase 6 — Tooling & Automation

**Descrizione**
Strumenti per sviluppatori e maintainers.

**Features**

* CLI
* preview locale
* export statico
* CI-friendly build

**Deliverables**

* CLI tool
* config schema
* docs generator

| Metric | Valore   |
| ------ | -------- |
| **P**  | 🟢 Bassa |
| **D**  | 🟡 Media |
| **C**  | 🟡 Media |
| **V**  | 🟡 Media |

---

## 6. Deployment Strategy

* **Vercel** per:

  * SSR
  * Edge caching
  * Preview per branch
* Architettura stateless → facile migrazione
* CDN-first per asset SVG/HTML

---

## 7. Risks & Constraints

* Limitazioni GitHub (no iframe, no JS)
* Parsing Markdown non standard
* Over-engineering precoce

Mitigazione:

* MVP stretto
* estensioni progressive
* documentazione chiara

---

## 8. Future Vision

* plugin system
* versioning docs
* live embeds (API, schema, demo)
* integrazione con repository multipli

---

## 9. Conclusion

Il framework proposto non sostituisce il README GitHub, ma lo **evolve** in un punto di accesso intelligente verso una documentazione moderna, navigabile e personalizzabile.

Non è un generatore di siti.
È un **renderer di conoscenza**.

---

## Related Documentation

- **[Framework Introduction](./index.md)** - Core concepts and philosophy
- **[Getting Started Guide](./getting-started.md)** - Implementation tutorial
- **[Interactive Components](./features.md)** - Live component examples
- **[API Reference](./api.md)** - Complete technical documentation

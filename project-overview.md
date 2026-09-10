# Pathfinder Visualizer - Project Overview & Agent Onboarding Guide

Welcome to the **Pathfinder Visualizer** codebase. This document serves as the primary onboarding and reference guide for AI agents and human contributors working on this repository. It outlines the project's purpose, architecture, development guidelines, concurrency requirements, and ongoing goals.

---

## 1. Project Purpose & Philosophy

Pathfinder Visualizer is an interactive, full-stack application for visualizing graph-traversal and pathfinding algorithms (such as BFS, DFS, Dijkstra, and A*). 

- **Primary Educational Goal**: Enable users to experiment with graph topologies, configure weighted/unweighted edges, designate start/destination nodes, and inspect step-by-step how algorithms explore nodes and formulate paths.
- **Architectural Learning Goal**: Although graph algorithms can run client-side, this project intentionally delegates algorithm execution and graph validation to a **Spring Boot backend**. This architectural design serves as a real-world playground for building concurrent backend services, WebSocket telemetry streaming, and clean distributed application patterns in a **monorepo**.
- **No Persistence / No Accounts**: The application does **not** use a database, persistence layer, or user account system. It is intentionally stateless, focusing entirely on real-time graph modeling, algorithm execution, and client-server telemetry. Prebuilt graph templates are served directly from in-memory fixtures.

---

## 2. Repository Structure

The project is structured as a monorepo with clear separation between frontend and backend:

```text
pathfinder-visualizer/
├── ui/                     # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── assets/         # SVG icons (add, arrows, goal, connection, etc.)
│   │   ├── components/
│   │   │   ├── edges/      # Custom React Flow edges (CustomEdge.tsx)
│   │   │   ├── nodes/      # Custom React Flow nodes (CircularNode.tsx)
│   │   │   └── panels/     # Controls and toolbars (LeftPanel.tsx)
│   │   ├── constants/      # Enums, default settings, initial graph fixtures
│   │   ├── utils/          # Math & graph helper utilities (graphMath.ts)
│   │   ├── App.tsx         # Main canvas & React Flow container
│   │   └── main.tsx        # React entry point
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                # Spring Boot 3.4 (Java 21) backend
│   ├── gradle/wrapper/     # Gradle Wrapper binaries and config (Gradle 8.12)
│   ├── gradlew / gradlew.bat
│   ├── build.gradle        # Gradle dependencies and build configuration
│   ├── settings.gradle     # Root project name ('pathfinder-core')
│   └── src/
│       ├── main/
│       │   ├── java/com/pathfinder/pathfindercore/
│       │   │   ├── config/        # Async, Web, and WebSocket configurations
│       │   │   ├── controller/    # REST & WebSocket endpoints
│       │   │   ├── model/         # Graph models, templates, DTOs
│       │   │   ├── service/       # Algorithm execution, graph builders, template fixtures
│       │   │   └── PathfinderCoreApplication.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/                  # Unit and integration test suite
│
├── docs/                   # UML diagrams (.puml) and design screenshots
└── project-overview.md     # This onboarding guide
```

---

## 3. Technology Stack

### Frontend (`ui/`)
- **Runtime & Bundler**: [Vite](https://vitejs.dev/) with Node.js
- **UI Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Canvas / Graph Engine**: [@xyflow/react](https://reactflow.dev/) (React Flow v12)
- **Styling**: Vanilla CSS / CSS Modules (scoped styles per component; avoid utility frameworks like Tailwind unless requested)

### Backend (`backend/`)
- **Language**: [Java 21 LTS](https://openjdk.org/projects/jdk/21/) (utilizing modern syntax, Records, and Virtual Threads)
- **Framework**: [Spring Boot 3.4.x](https://spring.io/projects/spring-boot)
- **Build Tool**: [Gradle Wrapper](https://gradle.org/) (`gradlew` / `gradlew.bat` v8.12)
- **Graph Computations**: [JGraphT](https://jgrapht.org/) (`jgrapht-core:1.5.2`)
- **Real-Time Communication**: `spring-boot-starter-websocket`
- **Productivity**: Project Lombok
- **Persistence**: *None* (No JPA, No Hibernate, No SQL/NoSQL databases, No user accounts)

---

## 4. Architectural Workflows & Data Flow

Refer to [docs/execution-flow.puml](file:///c:/Users/evanh/OneDrive/Documents/Codes/Major%20Projects/pathfinder-visualizer/docs/execution-flow.puml) for the sequence diagram.

### A. Graph Construction Phase
1. **Manual Editing**: Users create, move, label, and delete circular nodes on the React Flow pane, and draw directional/undirected edges (weighted or unweighted).
2. **Template Loading**: Users can request prebuilt graph templates (e.g., standard lattices, dense networks, classic pathfinding mazes). The frontend requests templates from `GET /graph/{id}`, which `TemplateService` serves directly from in-memory fixtures or JSON definitions.

### B. Validation Phase
1. Prior to running an algorithm, graph state (start node, destination node, edge weights, connectivity) is validated.
2. Initial validation occurs client-side for immediate feedback; authoritative validation is performed on the backend by `GraphBuilderService`.

### C. Concurrent Algorithm Execution Phase
1. **Concurrency Requirement**: Multiple users can run algorithm simulations simultaneously without cross-talk or blocking the backend thread pool.
2. **Execution Model**:
   - Each algorithm run is assigned an isolated `executionId` or session context (no account/login required).
   - Spring Boot leverages **Java 21 Virtual Threads** (`spring.threads.virtual.enabled=true`) with `@EnableAsync`.
   - Backend algorithms use thread-safe, immutable snapshots of graph topologies per execution run.
   - Services are completely stateless.
3. **Telemetry Streaming**:
   - The backend pushes execution steps over WebSocket (`/topic/algorithm/{executionId}`).
   - Each step payload delivers:
     - `currentNode`: Node currently being visited / evaluated.
     - `visitedNodes`: Set/list of all nodes processed so far.
     - `frontier`: Priority queue / deque state (nodes discovered but not yet evaluated).
     - `edgeStates`: Active edge traversal, relaxed edges, weights.
     - `currentPath`: Tentative shortest path back to start.
     - `isFinished`: Boolean indicating termination or failure (unreachable destination).

### D. Visualization & Playback Phase
- The frontend receives step events, allowing playback controls:
  - Play / Pause
  - Step Forward / Step Backward
  - Playback Speed Slider (delay in ms)
  - Execution metrics (nodes visited count, total path weight, elapsed algorithm execution time).

---

## 5. Code Requirements & Standards

### For Agents Modifying the Frontend (`ui/`)
1. **Type Strictness**: Never use `any`. Define and maintain comprehensive TypeScript interfaces for graph payloads, algorithm steps, node data, and edge configurations.
2. **React Flow Idioms**:
   - Use `useCallback` for event handlers (`onNodesChange`, `onEdgesChange`, `onConnect`) to avoid unnecessary re-renders.
   - Keep node and edge data structures compliant with `@xyflow/react` contracts.
   - Custom node implementations belong in `ui/src/components/nodes/`.
   - Custom edge implementations belong in `ui/src/components/edges/`.
3. **Styling Consistency**:
   - Maintain CSS Modules (`.module.css`) for localized component styling.
   - Keep canvas aesthetics modern, vibrant, and clean with clear visual affordances for active/selected/start/goal states.

### For Agents Modifying the Backend (`backend/`)
1. **Build Tool Discipline**:
   - Always invoke Gradle through the wrapper scripts: `.\gradlew.bat <task>` on Windows or `./gradlew <task>` on Unix.
   - Do NOT run Maven commands (`mvn`, `mvnw`). Maven has been removed.
   - Do NOT commit generated build artifacts (`.gradle/`, `build/`).
2. **Modern Java Practices**:
   - Use Java 21 features (records for DTOs and WebSocket events, pattern matching, switch expressions).
   - Use Lombok (`@Getter`, `@Setter`, `@RequiredArgsConstructor`, `@Builder`) where appropriate to minimize boilerplate.
3. **Stateless Services & Concurrency**:
   - Spring `@Service` classes must remain completely stateless.
   - Store run-time state inside execution records or scoped task instances.
   - Keep algorithms cancelable (respond to interruptions or disconnect events cleanly).
4. **No Database Dependencies**:
   - Do not introduce database drivers, JPA, Hibernate, or entity managers. Prebuilt graphs are simple in-memory constants or JSON files.

---

## 6. How to Run and Test

### Frontend
```powershell
cd ui
npm install     # Install npm dependencies (if not already installed)
npm run dev     # Starts Vite dev server (defaults to http://localhost:5173)
npm run build   # Type-checks and builds production bundle
npm run lint    # Runs ESLint checks
```

### Backend
```powershell
cd backend
.\gradlew.bat bootRun       # Starts Spring Boot backend on http://localhost:8080
.\gradlew.bat compileJava   # Compiles Java classes with Java 21
.\gradlew.bat test          # Executes JUnit 5 test suite
.\gradlew.bat build         # Runs full build, check, and packages JAR
```
*(On macOS / Linux, substitute `.\gradlew.bat` with `./gradlew`)*

---

## 7. Current Project Status & Immediate Milestones

| Milestone | Status | Description |
|---|---|---|
| **Graph Canvas UI** | In Progress | Canvas rendering, circular nodes, edge connecting, mode switching (Move, Add, Connect, Start/Goal). |
| **Backend Gradle Setup** | Completed | Clean migration to Gradle 8.12 wrapper with Java 21 toolchain and Spring Boot 3.4. |
| **Concurrency Setup** | Completed | Enabled Java 21 Virtual Threads and Spring `@EnableAsync` configuration. |
| **Stateless Architecture** | Completed | Dropped persistence/database layer; streamlined backend for in-memory graph presets and execution. |
| **WebSocket / Telemetry API** | Planned | Define WebSocket message broker endpoints (`/ws`, `/topic/algorithm/...`) and step payload DTOs. |
| **Algorithm Engine (JGraphT)** | Planned | Implement BFS, DFS, Dijkstra, and A* step-recording engine in `AlgorithmService`. |
| **In-Memory Preset Templates** | Planned | Implement static/in-memory prebuilt graph templates in `TemplateService`. |
| **Frontend Playback Controls** | Planned | Implement timeline controls (Play, Pause, Step Forward/Back, Speed scrubber). |

---

## 8. Design Considerations for Contributors

1. **Step Generation Strategy**:
   - *Batch Trace (Recommended)*: Backend computes the entire algorithm run, records an array of `AlgorithmStep` objects, and returns/streams them. The frontend controls playback timing locally for responsive, lag-free animations.
2. **Algorithm Extensibility**:
   - Implement an interface `PathfindingAlgorithm` with a method `AlgorithmResult execute(GraphSnapshot graph, NodeId start, NodeId target)` to allow seamless plug-and-play of new algorithms (e.g., Bellman-Ford, Bidirectional Search).

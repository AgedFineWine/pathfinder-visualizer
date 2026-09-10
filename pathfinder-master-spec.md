# Pathfinder Visualizer — Master Project Specification

## 1. Project Goal

Pathfinder Visualizer is an interactive, collaborative learning tool for graph and pathfinding algorithms.

The primary user experience is similar to **Excalidraw / Google Slides**: multiple users can join the same room and collaboratively construct and manipulate one or more graphs in real time.

The educational purpose is to let users learn algorithms through direct visual experimentation rather than only reading explanations or solving static problems such as LeetCode exercises.

Users should be able to:

- Create and edit graphs interactively.
- Collaborate with other users in a shared room.
- Run graph/pathfinding algorithms against individual graphs.
- Watch algorithm execution visually.
- Have every participant in the room observe an active graph execution.
- Eventually step backward/forward through an execution as part of the visualization/playback experience.

This project intentionally uses a backend even though many graph algorithms could run entirely client-side. The backend is a learning vehicle for real-time collaboration, concurrency, WebSockets, state management, and distributed-system design.

---

## 2. Core Architectural Model

The fundamental hierarchy is:

```text
Room
├── Users
├── Graph A
│   └── 0 or 1 active Execution
├── Graph B
│   └── 0 or 1 active Execution
└── Graph C
    └── 0 or 1 active Execution
```

### Important domain distinction

**The unit of algorithm execution is the graph, not the user and not the room.**

A room may contain multiple graphs, and different graphs may execute algorithms concurrently.

Example:

```text
Room A

Graph 1 → BFS running
Graph 2 → Dijkstra running
Graph 3 → idle
Graph 4 → A* running
```

All participants in Room A should see the execution state of each graph.

---

## 3. Collaboration Requirements

### Shared room

Users can join a room and collaboratively edit graphs within that room.

Graph operations should be shared in real time, including at minimum:

- Create graph
- Delete graph
- Add node
- Move node
- Delete node
- Add edge
- Delete edge
- Configure edge properties such as weight
- Set start node
- Set destination/goal node

The backend is the authoritative source for live room state.

### Real-time communication

A user participating in a room should maintain a persistent WebSocket connection to the backend.

The room WebSocket represents the user's participation in the room.

It should be capable of carrying:

- Graph collaboration events
- Room/presence events
- Algorithm execution events
- Execution completion/failure events
- Future real-time features

Do not create a separate WebSocket connection for every algorithm execution unless a future requirement demonstrates a need for it.

---

## 4. Algorithm Execution Requirements

### Per-graph execution constraint

Each graph can have **at most one active algorithm execution**.

If Graph A is already running:

```text
Alice → Run BFS
Bob   → Run Dijkstra
Charlie → Run A*
```

Only the first request that successfully transitions Graph A from `IDLE` to `RUNNING` should start an execution.

All subsequent run requests while that graph is running should be ignored/rejected according to the eventual API contract.

The important domain invariant is:

```text
Graph: IDLE → RUNNING
```

must be an atomic transition.

### Cross-graph concurrency

The per-graph restriction must not prevent independent graphs from running concurrently.

For example:

```text
Graph A → BFS
Graph B → Dijkstra
Graph C → A*
```

must be able to execute at the same time.

### Execution visibility

When an execution starts, all users in the room should learn that the graph is running.

When execution progresses or completes, all relevant participants should receive the corresponding state/events.

An execution is therefore a room-visible activity associated with a specific graph.

---

## 5. Graph Snapshot / Execution Isolation

An algorithm execution should operate against a stable graph state.

If a graph is modified while an algorithm is running, the execution should continue against the graph state that existed when the execution started.

Conceptually:

```text
Live Graph
    │
    │ snapshot at execution start
    ▼
GraphSnapshot
    │
    ▼
Algorithm Execution
```

The live collaborative graph may continue changing independently.

This prevents concurrent edits from mutating the graph being processed by an active algorithm.

The exact policy for editing a graph while it is running is still to be finalized. The preferred direction is to **allow edits while the existing execution continues against its snapshot**.

---

## 6. Algorithm Trace / Playback

The backend should conceptually separate:

1. **Algorithm computation**
2. **Execution trace**
3. **Frontend visualization/playback**

A completed execution can produce an immutable trace:

```text
Execution
├── Step 0
├── Step 1
├── Step 2
├── ...
└── Step N
```

The frontend should be responsible for playback behavior such as:

- Play
- Pause
- Playback speed
- Step forward
- Step backward
- Seeking through the execution
- Execution metrics

### Execution delivery modes

The initial implementation should favor computing a complete trace and allowing the frontend to play it back locally.

However, the architecture should leave room for a live execution mode where the backend streams execution steps over the existing room WebSocket.

Potential future modes:

```text
Batch:
Run → Backend computes trace → Client receives trace → Client playback

Live:
Run → Backend executes → Backend streams steps → Client renders live
```

The backend should not need to understand frontend playback speed in the normal batch-trace model.

---

## 7. Persistence

### No persistence layer for the current project

The database / PostgreSQL / Supabase persistence layer is intentionally being removed.

Room state is live, in-memory backend state.

Consequences:

- Rooms exist only while the backend maintains them.
- Restarting the backend may destroy active rooms.
- No requirement currently exists for recovering rooms after server restart.
- No requirement currently exists for persistent graph history.

Persistence can be reconsidered later if it becomes useful as a learning exercise.

---

# 8. Current High-Level Architecture Target

Start with a **modular monolith**, not microservices.

```text
                    ┌─────────────────┐
                    │    React UI     │
                    │                 │
                    │ Graph Editor    │
                    │ Playback        │
                    │ Room UI         │
                    └────────┬────────┘
                             │
                      REST + WebSocket
                             │
                    ┌────────▼────────┐
                    │   Spring Boot   │
                    │                 │
                    │ Room Management │
                    │ Graph State     │
                    │ Collaboration   │
                    │ Execution       │
                    │ Algorithms      │
                    │ WebSocket       │
                    └─────────────────┘
```

Do not prematurely introduce:

- Microservices
- Redis
- Kafka
- Message brokers
- Kubernetes
- Distributed databases
- External persistence

These may become useful later when deliberately exploring distributed-system problems, but they are not part of the current target architecture.

---

# 9. High-Level Tasks / Roadmap

## Phase 0 — Repository / Architecture Cleanup

- [ ] Remove persistence/database assumptions from the current project.
- [ ] Remove or isolate Supabase/PostgreSQL/JPA-specific code that is no longer required.
- [ ] Update project documentation to reflect the new architecture.
- [ ] Establish clear domain boundaries in the backend before implementing collaboration.

## Phase 1 — Core Domain Model

Define the core runtime concepts and their relationships:

- [ ] `Room`
- [ ] `User/Participant`
- [ ] `Graph`
- [ ] `GraphSnapshot`
- [ ] `Execution`
- [ ] `AlgorithmTrace`
- [ ] `AlgorithmStep`

Define the lifecycle/state of a graph execution:

```text
IDLE
  ↓
RUNNING
  ↓
FINISHED

Potential future terminal states:
FAILED
CANCELLED
```

Define ownership/relationships:

```text
Room → many Graphs
Graph → zero/one active Execution
Execution → one GraphSnapshot
Execution → one AlgorithmTrace
```

## Phase 2 — In-Memory Room State

Implement a server-side in-memory room manager.

Requirements:

- [ ] Create/join room.
- [ ] Leave room.
- [ ] Track active participants.
- [ ] Store current graph state for each room.
- [ ] Support multiple graphs per room.
- [ ] Ensure concurrent users cannot corrupt shared room state.
- [ ] Define room lifecycle and cleanup behavior.

## Phase 3 — Persistent WebSocket Session

Implement the room WebSocket.

Requirements:

- [ ] Connect to a room.
- [ ] Authenticate/identify the participant within the room as appropriate for the current project scope.
- [ ] Receive client commands/events.
- [ ] Broadcast authoritative state changes to room participants.
- [ ] Handle disconnects.
- [ ] Define reconnect/resynchronization behavior.
- [ ] Define message/event schemas.

Suggested conceptual event categories:

```text
Room events
- USER_JOINED
- USER_LEFT

Graph events
- GRAPH_CREATED
- GRAPH_DELETED
- NODE_ADDED
- NODE_MOVED
- NODE_DELETED
- EDGE_ADDED
- EDGE_DELETED
- GRAPH_CONFIGURATION_CHANGED

Execution events
- EXECUTION_STARTED
- EXECUTION_STEP
- EXECUTION_FINISHED
- EXECUTION_FAILED
- EXECUTION_CANCELLED
```

The exact protocol is a future implementation task.

## Phase 4 — Concurrent Graph Editing

Implement server-authoritative graph mutations.

Important goals:

- [ ] Define command vs event semantics.
- [ ] Prevent conflicting concurrent mutations from corrupting graph state.
- [ ] Consider graph version numbers.
- [ ] Ensure state transitions are atomic where required.
- [ ] Ensure clients converge on the server-authoritative state.

Do not implement CRDT/OT unless a later requirement actually requires it.

## Phase 5 — Algorithm Execution Engine

Implement algorithms behind a common execution abstraction.

Initial algorithms:

- [ ] BFS
- [ ] DFS
- [ ] Dijkstra
- [ ] A*

The algorithm engine should:

- [ ] Receive an immutable `GraphSnapshot`.
- [ ] Produce an execution trace.
- [ ] Remain independent of WebSocket/UI concerns.
- [ ] Avoid mutable state in singleton services.
- [ ] Support multiple executions on different graphs concurrently.
- [ ] Enforce the one-active-execution-per-graph invariant.
- [ ] Support cancellation/interruption where appropriate.

## Phase 6 — Room-Wide Execution Visualization

Connect execution state to the room WebSocket.

Requirements:

- [ ] When a graph begins execution, broadcast the execution start.
- [ ] Ensure every room participant can observe the graph's execution.
- [ ] Ensure different graphs can stream/finish independently.
- [ ] Ensure execution events are associated with both `graphId` and `executionId`.
- [ ] Handle users joining while an execution is already active.
- [ ] Define whether a newly joined user receives the current trace/state, execution progress, or a synchronized snapshot.

## Phase 7 — Frontend Playback

Implement local playback of an algorithm trace.

Requirements:

- [ ] Play/pause.
- [ ] Step forward.
- [ ] Step backward.
- [ ] Playback speed.
- [ ] Timeline/seeking.
- [ ] Execution metrics.
- [ ] Synchronize the visible execution state with the room's active execution.
- [ ] Prevent local playback controls from accidentally changing backend execution state unless explicitly designed to do so.

### Step-back is a separate feature/specification

The exact semantics of stepping backward should be designed before implementation.

Potential approaches include replaying from an earlier trace state or storing reversible state transitions. Do not assume the implementation yet.

## Phase 8 — Reliability / Concurrency Testing

Create tests for the important race conditions.

At minimum:

- [ ] Two users attempt to run the same graph simultaneously.
- [ ] Many users attempt to run the same graph simultaneously.
- [ ] Multiple graphs execute simultaneously.
- [ ] Users edit different graphs concurrently.
- [ ] Users edit the same graph concurrently.
- [ ] A graph is edited while an execution is running.
- [ ] A participant disconnects during graph editing.
- [ ] A participant disconnects during execution.
- [ ] A participant joins while an execution is active.
- [ ] Multiple executions complete at different times without cross-talk.

---

# 10. Architectural Principles

These principles should guide future implementation decisions.

### 1. Room is the collaboration boundary

A WebSocket connection represents participation in a room.

### 2. Graph is the execution boundary

A graph may have one active execution independent of other graphs in the room.

### 3. Execution is isolated

Every execution has its own identity and immutable input snapshot.

### 4. Server is authoritative

Clients may optimistically render changes, but the backend owns authoritative room state.

### 5. Playback is primarily a client concern

The backend computes/streams algorithm state; the frontend determines how that state is presented and played back.

### 6. Shared state and execution state are different

The live collaborative graph may change while an execution continues against its snapshot.

### 7. Prefer simple architecture

Use the simplest architecture that satisfies the current requirements.

Complex distributed infrastructure should be introduced only when intentionally exploring the problem it solves.

---

# 11. Open Design Questions

These are intentionally unresolved and should be addressed when their implementation becomes relevant.

- [ ] What is the exact room join/create protocol?
- [ ] How are users identified within a room?
- [ ] What does a newly joined user receive to synchronize with current room state?
- [ ] What happens when the WebSocket disconnects and reconnects?
- [ ] What is the exact graph mutation protocol?
- [ ] Should graph mutations use version numbers / optimistic concurrency?
- [ ] What happens if a user edits a graph while it is executing?
- [ ] How should an active execution be represented to late joiners?
- [ ] Should algorithm execution initially use batch traces, live streaming, or support both?
- [ ] What exactly does "step backward" mean at the algorithm/state level?
- [ ] Should playback position be shared among all users or be local to each participant?
- [ ] Should one user's playback controls affect everyone else?
- [ ] What happens when the backend crashes and in-memory rooms disappear?
- [ ] At what point, if any, should the system evolve beyond a single backend instance?

---

# 12. Definition of Done — Initial Target

The first meaningful version of the system should allow:

1. Alice creates a room.
2. Bob joins the room.
3. Both see the same graph workspace.
4. Alice creates/edits Graph A.
5. Bob sees Alice's changes in real time.
6. Bob edits Graph B while Alice edits Graph A.
7. Alice starts BFS on Graph A.
8. Graph A becomes `RUNNING`.
9. Bob cannot start another execution on Graph A while BFS is running.
10. Bob can start Dijkstra on Graph B.
11. Graph A and Graph B execute concurrently.
12. Alice and Bob both see Graph A's BFS execution.
13. Alice and Bob both see Graph B's Dijkstra execution.
14. An execution finishes and the graph returns to an idle/runnable state.
15. Users can play the resulting algorithm trace locally.
16. No database is required for the application to function.

The project should be understandable end-to-end by one developer and should serve as a deliberate playground for learning real-time collaboration and concurrent backend architecture.

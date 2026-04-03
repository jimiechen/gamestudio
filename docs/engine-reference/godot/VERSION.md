# Godot — Version Reference

| Field | Value |
|-------|-------|
| **Engine Version** | 4.6 |
| **Project Pinned** | 2026-03-25 |
| **LLM Knowledge Cutoff** | May 2025 |
| **Risk Level** | MEDIUM — version may be slightly beyond LLM training data |

## Note

Godot 4.6 was released in early 2025. This version may include features and APIs
not fully covered in the LLM's training data. Key changes in 4.6 include:

- **Unified Docking System** — Improved editor layout management
- **Jolt Physics by Default** — Better performance and stability
- **Enhanced UI/UX** — Streamlined editor workflows
- **Performance Improvements** — Faster import and iteration times

Agents should verify uncertain APIs via WebSearch when working with 4.6-specific features.

Run `/setup-engine refresh` to update reference docs at any time.

## Quick Reference

| Godot Version | Release Date | Key Features |
|---------------|--------------|--------------|
| 4.4 | Mar 2025 | Scene unique nodes, 2D navigation improvements |
| 4.5 | Mid 2025 | Enhanced shader graph, mobile optimizations |
| **4.6** | **Early 2025** | **Jolt physics default, unified docking** |

## Migration Notes

If upgrading from earlier versions:
- Jolt physics is now the default — existing projects using Godot Physics will need explicit configuration
- Editor layout system changed — custom layouts may need reconfiguration
- No breaking GDScript API changes expected from 4.4/4.5

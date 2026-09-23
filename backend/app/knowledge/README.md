# Kisan Mitra AI - Agricultural Knowledge Base

This directory is designated for trusted, verified agricultural domain knowledge, agronomic extension documents, and ICAR / State Agricultural University package-of-practices guides for future Retrieval-Augmented Generation (RAG) indexing.

## Guidelines for Content Ingestion:
1. **Source Authority**: Only ingest verified publications from recognized agricultural research institutions (e.g. ICAR, KVK, State Agricultural Universities, Ministry of Agriculture & Farmers Welfare).
2. **No Unverified Web Content**: Never ingest unverified internet blogs, unmoderated forums, or commercial promotional materials.
3. **Format**: Markdown (.md), PDF (.pdf), or structured JSON documents.
4. **Current Status**: Pre-RAG stage. Sources list in API responses remains empty (`sources: []`) until verified documents are parsed and vectorized into the retrieval index to prevent citation fabrication.

"""
agent.py — LangGraph-based decision-making agent for graphic generation.

Architecture:
  Uses LangGraph's prebuilt ReAct agent (create_react_agent) backed by the
  four registered tools. Per-session sliding-window history gives the agent
  short-term context so it can remember previous requests within the same
  API session.

  The agent dynamically decides:
    • Whether to call fetch_trending_keywords before building the prompt.
    • Whether to use enhance_raw_prompt (for text-only inputs) or
      build_prompt_from_details (for structured inputs).
    • Whether to skip any step that would be redundant.
    • When to call generate_image and with which parameters.

  Migration from AgentExecutor (LangChain <1.x) to langgraph.prebuilt
  create_react_agent (LangChain 1.x+).
"""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import APIKeys, ModelConfig, SystemPrompts
from app.tools import ALL_TOOLS

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Session Memory Store
# ─────────────────────────────────────────────────────────────────────────────
# Architecture note:
#   History is keyed by session_id.  A simple in-process dict is used here —
#   for multi-worker / multi-pod deployments, replace this with a Redis-backed
#   store (see scaling notes at the bottom).
#   Each entry is a list of BaseMessage objects (HumanMessage / AIMessage).
_WINDOW_K = 5  # Keep last K turn-pairs in context
_session_histories: dict[str, list] = {}


def _get_history(session_id: str) -> list:
    """Return (or lazily create) the message history list for the session."""
    if session_id not in _session_histories:
        _session_histories[session_id] = []
        logger.debug("[Agent] Created new history for session_id='%s'", session_id)
    return _session_histories[session_id]


def _append_turn(session_id: str, human_msg: str, ai_msg: str) -> None:
    """Append a turn and trim to the sliding window."""
    history = _get_history(session_id)
    history.append(HumanMessage(content=human_msg))
    history.append(AIMessage(content=ai_msg))
    # Keep only the last K pairs (2 messages per pair)
    if len(history) > _WINDOW_K * 2:
        _session_histories[session_id] = history[-(  _WINDOW_K * 2):]


def clear_session_memory(session_id: str) -> None:
    """Explicitly clear memory for a session (e.g. on logout)."""
    _session_histories.pop(session_id, None)
    logger.info("[Agent] Cleared memory for session_id='%s'", session_id)


# ─────────────────────────────────────────────────────────────────────────────
# Agent Builder
# ─────────────────────────────────────────────────────────────────────────────

def _build_agent():
    """
    Build a LangGraph ReAct agent.

    Architecture note:
      create_react_agent is the LangGraph replacement for AgentExecutor +
      create_openai_tools_agent. It supports tool-calling models natively
      and handles intermediate steps / parsing errors internally.
    """
    llm = ChatOpenAI(
        model=ModelConfig.LLM_MODEL,
        temperature=ModelConfig.LLM_TEMP,
        openai_api_key=APIKeys.OPENAI,
    )

    return create_react_agent(
        model=llm,
        tools=ALL_TOOLS,
        prompt=SystemPrompts.AGENT_SYSTEM,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Public Agent Invocation
# ─────────────────────────────────────────────────────────────────────────────

class GraphicAgent:
    """
    High-level facade over the LangChain agent executor.

    Usage:
        agent = GraphicAgent()
        result = agent.run_from_details(details_dict, session_id="user-123")
        result = agent.run_from_prompt("luxury apartment poster", session_id="user-123")
    """

    def run_from_details(
        self,
        details: dict,
        session_id: str = "default",
    ) -> dict[str, Any]:
        """
        Run the agent with structured property/business details.

        The agent will autonomously decide whether to fetch keywords first,
        then build the prompt, then generate the image.

        Args:
            details:    Dict matching PropertyDetailsRequest schema.
            session_id: Unique identifier for memory isolation.

        Returns:
            Parsed result dict (see _parse_agent_output).
        """
        instruction = (
            f"Generate a high-end promotional graphic using the following details:\n"
            f"{json.dumps(details, indent=2)}\n\n"
            f"Image settings: size={details.get('image_size', '1024x1024')}, "
            f"quality={details.get('image_quality', 'low')}, "
            f"num_variants={details.get('num_variants', 1)}.\n"
            f"IMPORTANT: If there is a reference image, you MUST keep the entire center-right area of the graphic COMPLETELY EMPTY so we can overlay the photo there later."
        )
        result = self._invoke(instruction, session_id)
        
        # Extract URL and composite
        reference_image = details.get("reference_image") or details.get("image_reference")
        if reference_image and reference_image.startswith("http") and result.get("success") and result.get("images"):
            from app.compositor import composite_reference_image
            for img in result["images"]:
                if "b64_string" in img and "filepath" in img:
                    img["b64_string"] = composite_reference_image(img["b64_string"], img["filepath"], reference_image)
                    
        return result

    def run_from_prompt(
        self,
        raw_prompt: str,
        niche: Optional[str] = None,
        image_size: str = "1024x1024",
        image_quality: str = "low",
        session_id: str = "default",
    ) -> dict[str, Any]:
        """
        Run the agent from a raw text prompt.

        Args:
            raw_prompt:    The user's short description.
            niche:         Optional design niche for trend enrichment.
            image_size:    Desired output size.
            image_quality: Desired quality level.
            session_id:    Memory namespace.

        Returns:
            Parsed result dict.
        """
        niche_line = f"Niche: {niche}." if niche else ""
        instruction = (
            f"Enhance the following raw prompt and generate a promotional graphic image.\n"
            f"Raw prompt: {raw_prompt}\n"
            f"{niche_line}\n"
            f"Image settings: size={image_size}, quality={image_quality}, num_variants=1.\n"
            f"IMPORTANT: If there is a reference image, you MUST keep the entire center-right area of the graphic COMPLETELY EMPTY so we can overlay the photo there later."
        )
        result = self._invoke(instruction, session_id)
        
        # Extract URL and composite
        import re
        urls = re.findall(r'https?://[^\s<>"]+|www\.[^\s<>"]+', raw_prompt)
        if urls and result.get("success") and result.get("images"):
            from app.compositor import composite_reference_image
            ref_url = urls[0]
            for img in result["images"]:
                if "b64_string" in img and "filepath" in img:
                    img["b64_string"] = composite_reference_image(img["b64_string"], img["filepath"], ref_url)
                    
        return result

    # ──────────────────────────────────────────────────────────────────────────
    # Internal
    # ──────────────────────────────────────────────────────────────────────────

    def _invoke(self, instruction: str, session_id: str) -> dict[str, Any]:
        """Run the LangGraph agent and parse the output."""
        from app.tools import _last_image_results as _img_cache  # noqa: F401 (reset check)

        history = _get_history(session_id)
        agent   = _build_agent()

        # Build the messages list: history + current human message
        messages = history + [HumanMessage(content=instruction)]

        logger.info("[GraphicAgent] Invoking agent | session_id='%s'", session_id)
        try:
            raw_output = agent.invoke({"messages": messages})
        except Exception as exc:
            logger.error("[GraphicAgent] Agent execution failed: %s", exc)
            raise

        result = self._parse_agent_output(raw_output)

        # Persist this turn — store only a short AI summary (not raw tool blobs)
        # to keep session history compact and within token limits.
        _append_turn(session_id, instruction, result.get("agent_output", ""))

        return result

    @staticmethod
    def _parse_agent_output(raw_output: dict) -> dict[str, Any]:
        """
        Extract structured data from the LangGraph agent's output.

        LangGraph returns a dict with a 'messages' list. The last AIMessage
        (with no tool_calls) is the final answer.  Full image results (with b64)
        are retrieved from the tools._last_image_results module cache — they
        are never stored in ToolMessage content to avoid context overflow.
        """
        from langchain_core.messages import AIMessage as _AI, ToolMessage
        import app.tools as _tools

        trending_keywords: list[str] = []
        final_text: str = ""

        messages = raw_output.get("messages", [])

        for msg in messages:
            # Final AI text answer (last AIMessage with no pending tool_calls)
            if isinstance(msg, _AI):
                if not getattr(msg, "tool_calls", None):
                    final_text = msg.content or ""

            # Mine only lightweight tool outputs for trending_keywords
            elif isinstance(msg, ToolMessage):
                tool_output = msg.content or ""
                if not isinstance(tool_output, str):
                    continue
                try:
                    parsed = json.loads(tool_output)
                except (json.JSONDecodeError, TypeError):
                    continue
                if "trending_keywords" in parsed:
                    trending_keywords = parsed["trending_keywords"] or []

        # Pull full image results (including b64_string) from the module-level
        # cache set by generate_image — this data NEVER enters the LLM context.
        images = list(_tools._last_image_results)

        return {
            "success":           True,
            "agent_output":      final_text,
            "images":            images,
            "trending_keywords": trending_keywords,
        }


# =============================================================================
# ─── LANGGRAPH MIGRATION NOTES ───────────────────────────────────────────────
# =============================================================================
#
# To migrate to LangGraph (recommended for complex multi-step workflows):
#
# 1. Replace the AgentExecutor with a StateGraph:
#
#    from langgraph.graph import StateGraph, END
#
#    workflow = StateGraph(AgentState)
#    workflow.add_node("decide",   decide_node)      # Router node
#    workflow.add_node("keywords", keyword_node)
#    workflow.add_node("prompt",   prompt_node)
#    workflow.add_node("image",    image_node)
#    workflow.set_entry_point("decide")
#
# 2. Define AgentState as a TypedDict holding:
#      input, details, raw_prompt, niche, keywords, prompt, images, session_id
#
# 3. Use conditional_edges for routing:
#      workflow.add_conditional_edges("decide", route_fn, {
#          "details": "prompt",
#          "raw":     "prompt",
#      })
#
# 4. Replace in-process memory with LangGraph checkpointing:
#      from langgraph.checkpoint.redis import RedisSaver
#      checkpointer = RedisSaver.from_conn_string(REDIS_URL)
#      graph = workflow.compile(checkpointer=checkpointer)
#
# 5. Each node becomes a pure function (stateless, testable, traceable).
#
# =============================================================================
# ─── SCALING NOTES ───────────────────────────────────────────────────────────
# =============================================================================
#
# Current bottlenecks and recommended solutions:
#
# 1. In-process session memory (_session_memories dict):
#    → Replace with Redis:
#      from langchain.memory import RedisChatMessageHistory
#      history = RedisChatMessageHistory(session_id=session_id, url=REDIS_URL)
#      memory  = ConversationBufferWindowMemory(chat_memory=history, k=5, ...)
#
# 2. Synchronous OpenAI calls block the FastAPI event loop:
#    → Use run_in_executor or AsyncAgentExecutor:
#      loop.run_in_executor(None, executor.invoke, {"input": instruction})
#
# 3. Rate limiting (OpenAI TPM/RPM):
#    → Add a token-bucket limiter per API key (slowapi or custom Redis counter).
#
# 4. Image generation latency (2-15 seconds per call):
#    → Queue jobs with Celery + Redis broker.
#    → Return a job_id immediately; poll /jobs/{job_id} for status.
#    → This is already partially implemented in the Node.js server layer.
#
# 5. Multi-tenant isolation:
#    → Namespace Redis keys by workspace_id + user_id.
#    → Pass session_id = f"{workspace_id}:{user_id}" from the API layer.
#
# =============================================================================

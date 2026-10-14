"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap,
  Layers,
  ArrowUp,
  ArrowDown,
  Clock,
  Sparkles,
  Bot,
  ExternalLink,
  Info,
  Workflow,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type {
  LiveAiLogItem,
  LiveAiSummary,
  LiveAiProviderItem,
  LiveAiFeatureMappingItem,
} from "./AiLiveTrackerView"

interface AiRoutingFlowVisualizerProps {
  latestLog: LiveAiLogItem | null
  recentLogs: LiveAiLogItem[]
  summary: LiveAiSummary | null
  providers?: LiveAiProviderItem[]
  featureMappings?: LiveAiFeatureMappingItem[]
  onSelectLog?: (log: LiveAiLogItem) => void
  isLive?: boolean
  showNetworkGraph?: boolean
  onToggleGraph?: () => void
}

interface OrbitalNode {
  id: string
  label: string
  sublabel?: string
  provider: string
  model: string
  type: "provider" | "cache" | "feature" | "telemetry"
  isActive: boolean
  isCooldown?: boolean
  color: string
  angleDeg: number
}

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return "Just now"
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}h ago`
    const diffDay = Math.floor(diffHour / 24)
    return `${diffDay}d ago`
  } catch {
    return "recent"
  }
}

export function AiRoutingFlowVisualizer({
  latestLog,
  recentLogs,
  summary,
  providers = [],
  featureMappings = [],
  onSelectLog,
  isLive = true,
  showNetworkGraph = true,
  onToggleGraph,
}: AiRoutingFlowVisualizerProps) {
  // Selected or active node id
  const [selectedNodeId, setSelectedNodeId] = useState<string>("")

  // Temporary inspection pulse state when user clicks a row or node manually
  const [isInspecting, setIsInspecting] = useState(false)
  const inspectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const triggerInspect = () => {
    setIsInspecting(true)
    if (inspectTimeoutRef.current) clearTimeout(inspectTimeoutRef.current)
    inspectTimeoutRef.current = setTimeout(() => {
      setIsInspecting(false)
    }, 4500)
  }

  useEffect(() => {
    return () => {
      if (inspectTimeoutRef.current) clearTimeout(inspectTimeoutRef.current)
    }
  }, [])

  // Auto trigger pulse when a fresh new log arrives (< 60 seconds old)
  const previousFirstLogIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (latestLog?.id && latestLog.id !== previousFirstLogIdRef.current) {
      previousFirstLogIdRef.current = latestLog.id
      const logTime = new Date(latestLog.timestamp).getTime()
      if (Date.now() - logTime < 60000) {
        triggerInspect()
      }
    }
  }, [latestLog])

  // Is transmission actively happening right now?
  // Only true if inspected manually OR last call happened in the last 60 seconds
  const isActivelyTransmitting = useMemo(() => {
    if (isInspecting) return true
    if (!latestLog?.timestamp) return false
    const logTime = new Date(latestLog.timestamp).getTime()
    const diffSec = Math.floor((Date.now() - logTime) / 1000)
    return diffSec >= 0 && diffSec <= 60
  }, [isInspecting, latestLog])

  // Construct dynamic orbital nodes purely from DB providers, feature mappings & real telemetry
  const dynamicNodes = useMemo(() => {
    const list: Omit<OrbitalNode, "angleDeg">[] = []

    // 1. Registered Upstream Providers from Database
    if (providers && providers.length > 0) {
      providers.forEach((p) => {
        const isCooling = !!(p.cooldownUntil && new Date(p.cooldownUntil) > new Date())
        list.push({
          id: `prov-${p.id}`,
          label: p.label || p.name,
          sublabel: p.model,
          provider: p.name,
          model: p.model,
          type: "provider",
          isActive: p.isActive && !isCooling,
          isCooldown: isCooling,
          color: isCooling ? "#EAB308" : p.isActive ? "#10B981" : "#64748B",
        })
      })
    }

    // 2. Semantic Cache node (In-memory LRU)
    list.push({
      id: "node-semantic-cache",
      label: "Semantic Cache",
      sublabel: "Sub-millisecond",
      provider: "cache",
      model: "exact-match",
      type: "cache",
      isActive: true,
      color: "#3B82F6",
    })

    // 3. Observed Models from Recent Logs (if not identical to an existing provider node)
    if (recentLogs && recentLogs.length > 0) {
      const existingKeys = new Set(list.map((n) => `${n.provider}:${n.model}`.toLowerCase()))
      recentLogs.forEach((log) => {
        const key = `${log.provider}:${log.model}`.toLowerCase()
        if (!existingKeys.has(key) && log.model) {
          existingKeys.add(key)
          list.push({
            id: `log-${log.provider}-${log.model}`,
            label: log.provider,
            sublabel: log.model,
            provider: log.provider,
            model: log.model,
            type: "telemetry",
            isActive: true,
            color: "#F97316",
          })
        }
      })
    }

    // 4. Feature Target Ingress Nodes (from featureMappings or top features)
    if (featureMappings && featureMappings.length > 0) {
      featureMappings.slice(0, 6).forEach((fm) => {
        list.push({
          id: `feat-${fm.key}`,
          label: fm.name,
          sublabel: fm.key,
          provider: "feature",
          model: fm.key,
          type: "feature",
          isActive: fm.isActive,
          color: "#A855F7",
        })
      })
    }

    // If still less than 4 nodes (e.g. fresh DB), add fallback architecture reference nodes
    if (list.length < 4) {
      list.push(
        {
          id: "node-fallback-env",
          label: "Env Fallback",
          sublabel: "process.env",
          provider: "openai_env",
          model: "gpt-4o-mini",
          type: "provider",
          isActive: true,
          color: "#06B6D4",
        },
        {
          id: "node-gemini-stream",
          label: "Google Gemini",
          sublabel: "Failover 2",
          provider: "gemini",
          model: "gemini-2.0-flash",
          type: "provider",
          isActive: true,
          color: "#4285F4",
        }
      )
    }

    // Distribute angles evenly across 360 degrees
    const total = list.length
    return list.map((node, idx) => ({
      ...node,
      angleDeg: total > 0 ? (360 / total) * idx - 90 : 0,
    }))
  }, [providers, recentLogs, featureMappings])

  // Helper: Find matching node id based on a log item or provider/model string
  const findMatchingNodeId = (item: { provider?: string; model?: string; id?: string } | null): string => {
    if (!item || !dynamicNodes || dynamicNodes.length === 0) return ""
    const logProv = (item.provider || "").toLowerCase()
    const logModel = (item.model || "").toLowerCase()

    // Match priority:
    // 1. By exact provider name or id
    // 2. By exact model name
    // 3. By sublabel or label inclusion
    const matched = dynamicNodes.find((n) => {
      const nProv = n.provider.toLowerCase()
      const nModel = n.model.toLowerCase()
      const nLabel = n.label.toLowerCase()
      const nSub = (n.sublabel || "").toLowerCase()

      return (
        nProv === logProv ||
        nModel === logModel ||
        nLabel === logProv ||
        nSub === logModel ||
        (logProv && n.id.toLowerCase().includes(logProv)) ||
        (logModel && n.id.toLowerCase().includes(logModel))
      )
    })

    return matched ? matched.id : dynamicNodes[0]?.id || ""
  }

  // Auto-switch selected node to match latestLog when new request arrives
  useEffect(() => {
    if (!latestLog || dynamicNodes.length === 0) {
      if (dynamicNodes.length > 0 && !selectedNodeId) {
        setSelectedNodeId(dynamicNodes[0].id)
      }
      return
    }
    const matchedId = findMatchingNodeId(latestLog)
    if (matchedId) {
      setSelectedNodeId(matchedId)
    }
  }, [latestLog, dynamicNodes])

  // Center coordinates in 1000x600 viewBox
  const centerX = 500
  const centerY = 300
  const radiusX = 410
  const radiusY = 230

  // Calculate coordinates for each orbital node
  const nodePositions = useMemo(() => {
    return dynamicNodes.map((node) => {
      const rad = (node.angleDeg * Math.PI) / 180
      const x = centerX + radiusX * Math.cos(rad)
      const y = centerY + radiusY * Math.sin(rad)
      return {
        ...node,
        x,
        y,
        pctX: (x / 1000) * 100,
        pctY: (y / 600) * 100,
      }
    })
  }, [dynamicNodes, centerX, centerY, radiusX, radiusY])

  // Find active node coordinates
  const activeNode = useMemo(() => {
    if (nodePositions.length === 0) return null
    const found = nodePositions.find((n) => n.id === selectedNodeId)
    return found || nodePositions[0]
  }, [nodePositions, selectedNodeId])

  // Format currency
  const costRupiah = summary?.totalCostToday || 0
  const costUsd = costRupiah > 0 ? (costRupiah / 16000).toFixed(2) : "0.00"

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* 1. TOP 5 KPI CARDS                                      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* TOTAL REQUESTS */}
        <div className="bg-[#121316] border border-[#22252E] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Total Requests
          </span>
          <div className="text-3xl font-extrabold text-white mt-1">
            {summary ? summary.totalCallsToday.toLocaleString("id-ID") : "0"}
          </div>
        </div>

        {/* TOTAL INPUT TOKENS (ORANGE #F97316) */}
        <div className="bg-[#121316] border border-[#22252E] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Total Input Tokens
          </span>
          <div className="text-3xl font-extrabold text-[#F97316] mt-1">
            {summary ? summary.totalTokensInputToday.toLocaleString("id-ID") : "0"}
          </div>
        </div>

        {/* CACHED TOKENS (BLUE #3B82F6) */}
        <div className="bg-[#121316] border border-[#22252E] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Cached Tokens
          </span>
          <div className="text-3xl font-extrabold text-[#3B82F6] mt-1">
            {summary?.cachedTokens ? summary.cachedTokens.toLocaleString("id-ID") : "0"}
          </div>
        </div>

        {/* OUTPUT TOKENS (GREEN #22C55E) */}
        <div className="bg-[#121316] border border-[#22252E] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Output Tokens
          </span>
          <div className="text-3xl font-extrabold text-[#22C55E] mt-1">
            {summary ? summary.totalTokensOutputToday.toLocaleString("id-ID") : "0"}
          </div>
        </div>

        {/* EST. COST (YELLOW #EAB308) */}
        <div className="bg-[#121316] border border-[#22252E] rounded-xl p-4 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Est. Cost
          </span>
          <div className="text-3xl font-extrabold text-[#EAB308] mt-1">
            ~${costUsd}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1">
            {costRupiah > 0 ? `Rp ${Math.round(costRupiah).toLocaleString("id-ID")}` : "Perhitungan riil dari token"}
          </span>
        </div>
      </div>

      {/* Interactive Toggle Bar between Telemetry & Network Orbit */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isActivelyTransmitting ? "bg-orange-500 animate-pulse" : "bg-slate-500"
            }`}
          />
          <span className="text-xs font-bold text-slate-200">
            Arsitektur Routing AI Gateway
          </span>
          <span className="text-[10px] text-slate-400">
            • {dynamicNodes.length} endpoint & provider aktif (Dinamis dari database)
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleGraph}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700 self-start sm:self-auto"
        >
          <Workflow size={13} className="text-orange-400" />
          {showNetworkGraph ? "Tutup Visualisasi Orbit" : "Buka Visualisasi Orbit (AI Gateway)"}
          {showNetworkGraph ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN SPLIT: CONSTELLATION GRAPH (LEFT) + RECENT (RIGHT)*/}
      {/* ======================================================== */}
      <AnimatePresence>
        {showNetworkGraph && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* LEFT COLUMN: DYNAMIC ORBITAL NODE NETWORK GRAPH (~65% / 8 COLS) */}
              <div className="lg:col-span-8 bg-[#121316] border border-[#22252E] rounded-2xl p-4 shadow-sm relative overflow-hidden min-h-[480px] flex flex-col justify-between">
                {/* Subtle Background Radial Grid */}
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, #333846 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* SVG Overlay: Curved Connecting Beams */}
                <svg
                  viewBox="0 0 1000 600"
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  preserveAspectRatio="none"
                >
                  {/* Defs: Glow Filters */}
                  <defs>
                    <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#F97316" floodOpacity="0.8" />
                    </filter>
                  </defs>

                  {/* Faint passive orbit ring */}
                  <ellipse
                    cx={centerX}
                    cy={centerY}
                    rx={radiusX}
                    ry={radiusY}
                    fill="none"
                    stroke="#252A36"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Inactive subtle radial spokes (Straight lines from center to each node) */}
                  {nodePositions.map((n) => (
                    <line
                      key={`line-${n.id}`}
                      x1={centerX}
                      y1={centerY}
                      x2={n.x}
                      y2={n.y}
                      stroke="#1E232F"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  ))}

                  {/* ACTIVE BEAM (100% Straight line exactly matching background spoke) */}
                  {activeNode && (
                    <>
                      {isActivelyTransmitting ? (
                        <>
                          {/* Glowing wide laser underlay */}
                          <line
                            x1={centerX}
                            y1={centerY}
                            x2={activeNode.x}
                            y2={activeNode.y}
                            stroke="#F97316"
                            strokeWidth="4"
                            opacity="0.35"
                            filter="url(#orangeGlow)"
                          />
                          {/* Animated moving dashed laser pulse */}
                          <motion.line
                            x1={centerX}
                            y1={centerY}
                            x2={activeNode.x}
                            y2={activeNode.y}
                            stroke="#F97316"
                            strokeWidth="2.5"
                            strokeDasharray="8 6"
                            animate={{ strokeDashoffset: [0, -28] }}
                            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                          />
                        </>
                      ) : (
                        /* Subtle calm dashed guide when in Standby (no active laser) */
                        <line
                          x1={centerX}
                          y1={centerY}
                          x2={activeNode.x}
                          y2={activeNode.y}
                          stroke="#334155"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          opacity="0.6"
                        />
                      )}
                    </>
                  )}

                  {/* Center Pulse Circle */}
                  {isActivelyTransmitting ? (
                    <>
                      <circle cx={centerX} cy={centerY} r="14" fill="#F97316" opacity="0.25" />
                      <circle cx={centerX} cy={centerY} r="7" fill="#F97316" />
                    </>
                  ) : (
                    <circle cx={centerX} cy={centerY} r="6" fill="#475569" opacity="0.4" />
                  )}
                </svg>

                {/* HTML Overlay: Orbital Nodes */}
                <div className="absolute inset-0 w-full h-full z-20 pointer-events-auto">
                  {/* CENTER HUB NODE: AI GATEWAY */}
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                    style={{ left: "50%", top: "50%" }}
                  >
                    <div
                      onClick={() => triggerInspect()}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                        isActivelyTransmitting
                          ? "bg-[#1A1412] border-2 border-[#F97316] text-[#F97316] shadow-lg shadow-[#F97316]/20 scale-105"
                          : "bg-[#14161C] border border-slate-700 text-slate-300 hover:border-slate-500 shadow-sm"
                      }`}
                      title={isActivelyTransmitting ? "Sedang Mengalirkan Data" : "Klik untuk Tes Ping Alur"}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActivelyTransmitting
                            ? "bg-[#F97316] animate-ping"
                            : "bg-slate-500"
                        }`}
                      />
                      <div className="flex flex-col text-left">
                        <span className="tracking-wide text-xs font-bold leading-none">AI Gateway</span>
                        <span className="text-[9px] font-medium mt-0.5 opacity-80">
                          {isActivelyTransmitting ? "Routing Aktif" : "Standby (Idle)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ORBITING MODEL & PROVIDER NODES */}
                  {nodePositions.map((node) => {
                    const isSelected = node.id === selectedNodeId
                    return (
                      <button
                        key={node.id}
                        onClick={() => {
                          setSelectedNodeId(node.id)
                          triggerInspect()
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                          isSelected
                            ? isActivelyTransmitting
                              ? "bg-[#2A1810] border border-[#F97316] text-[#F97316] shadow-md shadow-[#F97316]/30 scale-110 z-20"
                              : "bg-[#1E2330] border border-slate-500 text-white shadow-md scale-105 z-20"
                            : "bg-[#181A20] border border-[#2B303C] text-slate-300 hover:text-white hover:border-slate-500 hover:scale-105 z-10"
                        }`}
                        style={{
                          left: `${node.pctX}%`,
                          top: `${node.pctY}%`,
                        }}
                        title={`${node.label} (${node.sublabel || node.model}) - Klik untuk tes jalur`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: node.color || "#64748B" }}
                        />
                        <div className="flex flex-col text-left leading-tight">
                          <span>{node.label}</span>
                          {node.sublabel && (
                            <span className="text-[8px] font-normal text-slate-400 -mt-0.5 max-w-[90px] truncate">
                              {node.sublabel}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Bottom Left Info Indicator */}
                <div className="relative z-30 flex items-center gap-2 text-[11px]">
                  {isActivelyTransmitting ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                      </span>
                      <span className="text-slate-300">
                        Transmisi Aktif:{" "}
                        <strong className="text-white">
                          {activeNode ? activeNode.label : "AI Gateway"}
                        </strong>
                        {activeNode?.sublabel && (
                          <span className="text-orange-400 font-mono"> ({activeNode.sublabel})</span>
                        )}
                        <span className="text-orange-400 ml-1.5 font-bold">● Mengalirkan Data</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                      <span className="text-slate-400">
                        Status: <strong className="text-slate-300">Standby (Idle)</strong>
                        {latestLog && (
                          <>
                            {" • Terakhir: "}
                            <strong className="text-slate-300">{activeNode ? activeNode.label : "-"}</strong>
                            {activeNode?.sublabel && (
                              <span className="text-slate-400 font-mono"> ({activeNode.sublabel})</span>
                            )}
                            <span className="text-slate-500 ml-1 font-mono">({formatTimeAgo(latestLog.timestamp)})</span>
                          </>
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: RECENT REQUESTS TABLE CARD (~35% / 4 COLS) */}
              <div className="lg:col-span-4 bg-[#121316] border border-[#22252E] rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#22252E] pb-2.5">
                    <h3 className="text-xs font-extrabold tracking-wider text-slate-300 uppercase">
                      Recent Requests
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {recentLogs?.length || 0} calls
                    </span>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    <div className="col-span-6">Model</div>
                    <div className="col-span-3 text-center">In / Out</div>
                    <div className="col-span-3 text-right">When</div>
                  </div>

                  {/* Rows */}
                  <div className="space-y-1 overflow-y-auto max-h-[380px] pr-1 sidebar-scrollbar">
                    {recentLogs && recentLogs.length > 0 ? (
                      recentLogs.slice(0, 10).map((item, idx) => {
                        const modelName = item.model || "gpt-4o-mini"
                        return (
                          <div
                            key={item.id || idx}
                            onClick={() => {
                              if (onSelectLog && item.userEmail) onSelectLog(item)
                              const matchedId = findMatchingNodeId(item)
                              if (matchedId) {
                                setSelectedNodeId(matchedId)
                                triggerInspect()
                              }
                            }}
                            className="grid grid-cols-12 items-center px-2 py-2 rounded-lg hover:bg-[#1C1F28] transition-colors cursor-pointer text-xs group"
                          >
                            {/* Model Name with Green Dot */}
                            <div className="col-span-6 flex items-center gap-1.5 min-w-0 pr-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-xs shadow-emerald-400/50" />
                              <span className="text-slate-300 group-hover:text-white font-medium truncate text-[11px]">
                                {modelName}
                              </span>
                            </div>

                            {/* In / Out Tokens with arrows */}
                            <div className="col-span-3 text-center font-mono text-[10px] whitespace-nowrap">
                              <span className="text-rose-400 font-bold">
                                {item.tokensInput}↑
                              </span>{" "}
                              <span className="text-emerald-400 font-bold">
                                {item.tokensOutput}↓
                              </span>
                            </div>

                            {/* Time Ago */}
                            <div className="col-span-3 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                              {formatTimeAgo(item.timestamp)}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="py-14 text-center text-slate-500 text-xs space-y-1">
                        <Bot className="w-7 h-7 mx-auto text-slate-600 mb-1.5 opacity-60" />
                        <p className="font-semibold text-slate-400">Belum ada request AI</p>
                        <p className="text-[10px] text-slate-500">
                          Log pemanggilan akan muncul saat fitur AI digunakan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Footer */}
                <div className="pt-3 border-t border-[#22252E] flex items-center justify-between text-[11px] text-slate-400">
                  <span>Klik baris untuk buka rincian & tes alur</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Feed
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

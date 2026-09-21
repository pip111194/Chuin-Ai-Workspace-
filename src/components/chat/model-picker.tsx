"use client";

import { useState, useRef, useEffect } from "react";
import { FREE_MODELS as FALLBACK_MODELS } from "@/lib/models";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  providerSlug?: string;
  description: string;
  contextLength?: number;
  logo: string;
  badge?: string;
}

interface ModelPickerProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
  disabled?: boolean;
}

// Provider slug → local SVG path
function getLocalLogo(providerSlug: string): string {
  const map: Record<string, string> = {
    nvidia: "/models/nvidia.svg",
    meta: "/models/meta.svg",
    "meta-llama": "/models/meta.svg",
    google: "/models/google.svg",
    alibaba: "/models/alibaba.svg",
    qwen: "/models/alibaba.svg",
    deepseek: "/models/deepseek.svg",
    "z-ai": "/models/zhipu.svg",
    zhipu: "/models/zhipu.svg",
    cohere: "/models/cohere.svg",
    openrouter: "/models/openrouter.svg",
    liquid: "/models/liquid.svg",
    inclusionai: "/models/inclusionai.svg",
    "nex-agi": "/models/nexagi.svg",
    "dots-studio": "/models/dots.svg",
    poolside: "/models/poolside.svg",
    thinkingmachines: "/models/thinkingmachines.svg",
  };
  return map[providerSlug] || "/models/default.svg";
}

// Provider color fallback
function getProviderColor(slug: string): string {
  const colors: Record<string, string> = {
    nvidia: "#76B900",
    meta: "#0866FF",
    "meta-llama": "#0866FF",
    google: "#4285F4",
    alibaba: "#FF6A00",
    qwen: "#FF6A00",
    deepseek: "#4D6BFE",
    "z-ai": "#0F62FE",
    cohere: "#39594D",
    openrouter: "#6467F2",
    liquid: "#00B4D8",
    inclusionai: "#7C3AED",
    "nex-agi": "#111827",
    "dots-studio": "#EC4899",
    poolside: "#0EA5E9",
    thinkingmachines: "#F97316",
  };
  return colors[slug] || "#737373";
}

export function ModelPicker({
  selectedModel,
  onSelect,
  disabled = false,
}: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch models when dropdown opens
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);

    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
        } else {
          // Fallback to hard-coded list
          setModels(
            FALLBACK_MODELS.map((m) => ({
              ...m,
              providerSlug: m.logo.split("/").pop()?.replace(".svg", "") || "",
            }))
          );
        }
      })
      .catch((e) => {
        console.error("Failed to fetch models:", e);
        setError("Failed to load models");
        setModels(
          FALLBACK_MODELS.map((m) => ({
            ...m,
            providerSlug: m.logo.split("/").pop()?.replace(".svg", "") || "",
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const allModels = models.length > 0 ? models : FALLBACK_MODELS;
  const current =
    allModels.find((m) => m.id === selectedModel) || allModels[0];

  const currentLogo = current.providerSlug
    ? getLocalLogo(current.providerSlug)
    : current.logo;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40"
        aria-label="Select model"
      >
        <img
          src={currentLogo}
          alt={current.provider}
          className="h-4 w-4 object-contain"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.style.display = "none";
          }}
        />
        <span className="max-w-[120px] truncate font-medium">
          {current.name}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-[360px] max-w-[92vw] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Choose Model
            </p>
            {loading ? (
              <span className="text-[10px] text-neutral-400">Loading...</span>
            ) : (
              <span className="text-[10px] text-neutral-400">
                {allModels.length} free
              </span>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            {loading && models.length === 0 ? (
              <div className="p-6 text-center">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
                <p className="mt-2 text-xs text-neutral-500">
                  Loading free models...
                </p>
              </div>
            ) : (
              allModels.map((model) => {
                const logoSrc = model.providerSlug
                  ? getLocalLogo(model.providerSlug)
                  : model.logo;

                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelect(model.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-start gap-3 border-b border-neutral-100 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-neutral-50 ${
                      model.id === selectedModel ? "bg-neutral-50" : ""
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white p-1">
                      <img
                        src={logoSrc}
                        alt={model.provider}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector("span")) {
                            const letter = document.createElement("span");
                            letter.style.fontWeight = "700";
                            letter.style.fontSize = "13px";
                            letter.style.color = getProviderColor(
                              model.providerSlug || ""
                            );
                            letter.textContent = model.name.charAt(0);
                            parent.appendChild(letter);
                          }
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900 truncate">
                          {model.name.replace(" (free)", "")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-neutral-500 line-clamp-2">
                        {model.description || model.provider}
                      </p>
                    </div>
                    {model.id === selectedModel && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-1 shrink-0 text-neutral-900"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {error && (
            <div className="border-t border-neutral-100 px-3 py-2">
              <p className="text-[10px] text-red-500">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

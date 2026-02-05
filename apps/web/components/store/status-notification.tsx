"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Timer, User, Check, Receipt, RefreshCw } from "lucide-react";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import type { StatusNotificationType } from "@/lib/types/dine-in";

interface StatusNotificationProps {
  type: StatusNotificationType;
  show: boolean;
  onComplete: () => void;
}

const NOTIFICATION_CONFIG: Record<StatusNotificationType, {
  duration: number;
  icon: typeof ChefHat;
  bgColor: string;
  title: { active: string; completed: string };
  description: { active: string; completed: string };
  completedLabel: string;
}> = {
  order: {
    duration: 2,
    icon: ChefHat,
    bgColor: "bg-primary/10 text-primary",
    title: {
      active: "Preparando seu pedido...",
      completed: "Pedido enviado!",
    },
    description: {
      active: "Estamos processando seu pedido...",
      completed: "Seu pedido foi enviado para a cozinha",
    },
    completedLabel: "Enviado",
  },
  waiter: {
    duration: 1,
    icon: User,
    bgColor: "bg-amber-500/10 text-amber-500",
    title: {
      active: "Chamando garçom...",
      completed: "Garçom a caminho!",
    },
    description: {
      active: "Aguarde enquanto chamamos o garçom...",
      completed: "O garçom está a caminho da sua mesa",
    },
    completedLabel: "Chamado",
  },
  bill: {
    duration: 1,
    icon: Receipt,
    bgColor: "bg-blue-500/10 text-blue-500",
    title: {
      active: "Processando conta...",
      completed: "Conta fechada!",
    },
    description: {
      active: "Aguarde enquanto fechamos sua conta...",
      completed: "O garçom trará sua conta em breve",
    },
    completedLabel: "Fechada",
  },
  reset: {
    duration: 3,
    icon: RefreshCw,
    bgColor: "bg-green-500/10 text-green-500",
    title: {
      active: "Finalizando atendimento...",
      completed: "Mesa liberada!",
    },
    description: {
      active: "Aguarde enquanto o garçom finaliza o atendimento...",
      completed: "A mesa está pronta para novos clientes",
    },
    completedLabel: "Liberada",
  },
};

const COMPLETED_DISPLAY_MS = 1500;

export function StatusNotification({ type, show, onComplete }: StatusNotificationProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const config = NOTIFICATION_CONFIG[type];
  const Icon = config.icon;

  useEffect(() => {
    if (!show) {
      setProgress(0);
      setIsCompleted(false);
      return;
    }

    const startTime = Date.now();
    const durationMs = config.duration * 1000;
    let rafId: number;
    let completeTimeoutId: NodeJS.Timeout;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / durationMs) * 100);

      setProgress(newProgress);

      if (newProgress < 100) {
        rafId = requestAnimationFrame(updateProgress);
      } else {
        setIsCompleted(true);
        completeTimeoutId = setTimeout(() => onCompleteRef.current(), COMPLETED_DISPLAY_MS);
      }
    };

    rafId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(completeTimeoutId);
    };
  }, [show, config.duration]);

  const remainingSeconds = Math.ceil(config.duration - (config.duration * progress) / 100);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed left-4 top-20 z-50 w-[calc(100%-32px)] sm:left-1/2 sm:w-full sm:max-w-sm sm:-translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-xl border border-border bg-card p-3 shadow-lg sm:p-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div
                className={cn(
                  "flex-shrink-0 rounded-full p-2 sm:p-3",
                  config.bgColor,
                  !isCompleted && "animate-pulse"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium text-card-foreground sm:text-base">
                  {isCompleted ? config.title.completed : config.title.active}
                </h3>

                <div className="mt-1 flex items-center gap-1 sm:gap-2">
                  <Timer className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
                  <div className="flex-1">
                    <Progress value={progress} className="h-1.5 sm:h-2" />
                  </div>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {isCompleted ? config.completedLabel : `${remainingSeconds}s`}
                  </span>
                </div>

                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                  {isCompleted ? config.description.completed : config.description.active}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

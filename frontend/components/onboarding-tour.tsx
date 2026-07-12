"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Need dynamic import for react-joyride since it uses browser globals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Joyride: any = dynamic(() => import("react-joyride").then((mod: any) => (mod.default || mod.Joyride || mod)), { ssr: false });

const TOUR_STEPS = [
  {
    target: "body",
    content: "Welcome to TransitOps! Let's take a quick tour of your new enterprise fleet management platform.",
    placement: "center" as const,
  },
  {
    target: ".tour-dashboard",
    content: "Here is your Dashboard. You can see real-time KPIs, fleet status, and active operations.",
    placement: "right" as const,
  },
  {
    target: ".tour-vehicles",
    content: "Manage your entire fleet here. Add new vehicles, track capacities, and update statuses.",
    placement: "right" as const,
  },
  {
    target: ".tour-trips",
    content: "The Dispatch Center. Assign vehicles and drivers to new routes, and start or complete trips.",
    placement: "right" as const,
  },
  {
    target: ".tour-maintenance",
    content: "Keep your fleet healthy. Log repairs and maintenance costs. Vehicles in progress are automatically marked 'In Shop'.",
    placement: "right" as const,
  },
  {
    target: ".tour-expenses",
    content: "Track operational costs like fuel, tolls, and permits across all your assets.",
    placement: "right" as const,
  },
  {
    target: ".tour-settings",
    content: "Customize your organization, profile, and notification preferences here.",
    placement: "right" as const,
  }
];

export function OnboardingTour() {
  const { user, setUser } = useAuth();
  const [run, setRun] = useState(false);
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: api.completeTour,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(["auth-user"], updatedUser);
    }
  });

  useEffect(() => {
    // Only run if the user exists, has not completed the tour, and hasn't locally skipped it recently
    if (user && user.tour_completed === false) {
      const localSkip = localStorage.getItem("transitops_tour_completed");
      if (!localSkip) {
        setRun(true);
      }
    }
  }, [user]);

  const handleJoyrideCallback = (data: any) => {
    const { status, action } = data;
    const finishedStatuses = ["finished", "skipped"];

    if (finishedStatuses.includes(status) || action === "close") {
      setRun(false);
      localStorage.setItem("transitops_tour_completed", "true");
      
      // Save permanently in the backend
      completeMutation.mutate();
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      scrollToFirstStep
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#0f172a", // slate-900
          textColor: "#334155", // slate-700
          backgroundColor: "#ffffff",
          arrowColor: "#ffffff",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "12px",
          padding: "20px",
        },
        buttonNext: {
          borderRadius: "6px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: 500,
        },
        buttonBack: {
          color: "#64748b",
          fontSize: "14px",
        },
        buttonSkip: {
          color: "#94a3b8",
          fontSize: "14px",
        }
      }}
    />
  );
}

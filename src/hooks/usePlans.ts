import { useCallback, useEffect, useMemo } from 'react';
import { SubscriptionPlan, usePlansStore } from '../store/plans.store';

type FeatureItem = {
  text: string;
  isLocked?: boolean;
};

type Feature = string | FeatureItem;

interface FormattedPlan extends Omit<SubscriptionPlan, 'features'> {
  features: Feature[];
  subtitle?: string;
  buttonText: string;
  bgColor: string;
  borderColor: string;
  titleColor: string;
}

export const usePlans = () => {
  const { plans, loading, error, fetchPlans, clearError } = usePlansStore();

  const loadPlans = useCallback(async () => {
    await fetchPlans();
  }, [fetchPlans]);

  const getPlanById = useCallback(
    (planId: string): SubscriptionPlan | undefined => {
      return plans?.find(plan => plan.id === planId);
    },
    [plans]
  );

  const formatPrices = useMemo((): FormattedPlan[] | undefined => {
    const formattedPlans = plans?.map((plan): FormattedPlan => {
      // Add "Weight loss tracker" with locked flag to free and premium plans
      // Pro plans should have it available (unlocked)
      const features: Feature[] = [...plan.features];

      if (plan.id === 'free' || plan.id === 'premium') {
        features.push({ text: 'Weight tracking & % progress', isLocked: true });
      }

      const subtitle =
        plan.id === 'pro' || plan.id === 'pro-lifetime'
          ? 'Best for weight loss challenges'
          : undefined;

      return {
        ...plan,
        features,
        subtitle,
        buttonText: plan.id === 'free' ? 'Start Free' : 'Select Plan',
        bgColor:
          plan.id === 'free'
            ? '#FFFFFF'
            : plan.id === 'premium'
            ? '#E8F5E8'
            : '#F3E8FF',
        borderColor:
          plan.id === 'free'
            ? '#E0F2FE'
            : plan.id === 'premium'
            ? '#C8E6C9'
            : '#E9D5FF',
        titleColor:
          plan.id === 'free'
            ? '#374151'
            : plan.id === 'premium'
            ? '#166534'
            : '#7C3AED',
      };
    });
    return formattedPlans;
  }, [plans]);

  useEffect(() => {
    if (plans === null) {
      loadPlans();
    }
  }, [plans, loadPlans]);

  return {
    // Data
    plans,
    formatPrices,
    loading,
    error,

    // Actions
    loadPlans,
    clearError,

    // Getters
    getPlanById,
  };
};

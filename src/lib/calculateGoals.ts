interface ProfileInput {
  age: number;
  sex: 'male' | 'female';
  height_cm: number;
  weight_kg: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal_type: 'cut' | 'maintain' | 'bulk';
}

interface GoalOutput {
  daily_calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<string, number> = {
  cut: 0.8,
  maintain: 1.0,
  bulk: 1.12,
};

export function calculateGoals(profile: ProfileInput): GoalOutput {
  const bmr =
    profile.sex === 'male'
      ? 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5
      : 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activity_level];
  const daily_calories = Math.round(tdee * GOAL_ADJUSTMENTS[profile.goal_type]);

  const protein = Math.round(1.6 * profile.weight_kg);
  const fat_calories = daily_calories * 0.25;
  const protein_calories = protein * 4;
  const carbs_calories = daily_calories - fat_calories - protein_calories;
  const fat = Math.round(fat_calories / 9);
  const carbs = Math.round(carbs_calories / 4);

  return { daily_calories, protein, carbs, fat };
}

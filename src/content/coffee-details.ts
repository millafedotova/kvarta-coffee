interface CoffeeFact {
  label: string;
  value: string;
  description?: string;
}

export interface CoffeeDetails {
  introduction: string;
  ordering?: string;
  profile?: readonly CoffeeFact[];
  recipe?: {
    facts: readonly CoffeeFact[];
  };
}
